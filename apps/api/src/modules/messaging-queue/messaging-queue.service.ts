import {
  forwardRef,
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Channel, ChannelModel, connect } from 'amqplib';
import { PublishDeploymentMessageDto } from './dto/publish-message.dto';
import { TriggerDeployment } from './dto/trigger-message.dto';
import { DeleteDeployment } from './dto/delete-message.dto';
import { StopMessage } from './dto/stop-message.dto';
import { DeploymentService } from '../deployment/deployment.service';

@Injectable()
export class MessagingQueueService implements OnModuleInit, OnModuleDestroy {
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;
  private readonly exchange = 'blacktree.direct'; // implementing direct exchange

  // this is for sending the messages to the worker
  private readonly queue = 'execute.queue'; // implementing queue
  private readonly routingKey = 'worker.execute'; // implementing routing key

  // sending the messages to the backend to update the status of DeleteDeployment
  private readonly resultQueue = 'api.result';
  private readonly resultRoutingKey = 'status.queue';

  constructor(
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => DeploymentService))
    private readonly deploymentService: DeploymentService,
  ) {}

  // to run when the module is initialized in Dependency Injection
  async onModuleInit() {
    const rabbitMQUrl = this.configService.get<string>('MQ_URL');
    if (!rabbitMQUrl) {
      throw new Error('RABBITMQ_URL is not defined in the configuration');
    }

    try {
      this.connection = await connect(rabbitMQUrl);
      this.channel = await this.connection.createChannel();

      // setting up exchange, using direct exchange type
      await this.channel?.assertExchange(this.exchange, 'direct', {
        durable: true,
      });

      // setting up queue (using durable queue)
      await this.channel?.assertQueue(this.queue, {
        durable: true,
      });

      // setting up binding rules and routing key to the queue in the exchange
      await this.channel?.bindQueue(this.queue, this.exchange, this.routingKey);

      // assert result queue and consume it
      await this.channel.assertQueue(this.resultQueue, { durable: true });
      await this.channel.bindQueue(
        this.resultQueue,
        this.exchange,
        this.resultRoutingKey,
      );

      // start listening to messages in result queue
      await this.consumeResults();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown error occured';
      console.error(`Error connecting to RabbitMQ: ${message}`);
      throw new Error(`Failed to connect to RabbitMQ: ${message}`);
    }
  }

  // method to publish message to the queue
  publishMessage(
    routingKey: string,
    message:
      | PublishDeploymentMessageDto
      | TriggerDeployment
      | DeleteDeployment
      | StopMessage,
  ) {
    if (!this.channel) {
      throw new Error('RabbitMQ channel is not initialized');
    }
    try {
      const buffer = Buffer.from(JSON.stringify(message));
      const published = this.channel.publish(
        this.exchange, // exchange name
        routingKey, // routing key
        buffer, // message buffer
        {
          persistent: true, // ensures message is saved to disk
        },
      );

      if (!published) {
        throw new Error('Message could not be published');
      }
      return {
        message: `Message published to exchange "${this.exchange}" with routing key "${routingKey}"`,
      };
    } catch (error) {
      console.log('Error publishing message:', error);
      throw new Error(
        `Failed to publish message: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  // run when the module is destroyed in Dependency Injection
  async onModuleDestroy() {
    try {
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
      console.log('RabbitMQ connection and channel closed.');
    } catch (error) {
      console.error('Error closing RabbitMQ connection:', error);
    }
  }

  private async consumeResults() {
    if (!this.channel) return; // dont proceseed if channel is not initialized

    // start consuming messsages from result queue
    await this.channel.consume(
      this.resultQueue,
      (msg) => {
        if (msg !== null) {
          // wrap async in IIFE and void it to silence eslint
          void (async () => {
            try {
              const raw = JSON.parse(msg.content.toString()) as unknown;
              const data = raw as { deploymentId: string; status: string };

              const { deploymentId, status } = data;

              // update status in backend
              await this.deploymentService.updateStatus(deploymentId, status);

              this.channel!.ack(msg); // acknowledge message
            } catch (err) {
              console.error('Failed to process result message:', err);
              this.channel?.nack(msg, false, false); // discard bad message
            }
          })(); // void ensures eslint doesn’t complain about floating promises
        }
      },
      { noAck: false }, // manual ack/nack enabled
    );
  }
}
