import { Module, forwardRef } from '@nestjs/common';
import { MessagingQueueService } from './messaging-queue.service';
import { DeploymentModule } from '../deployment/deployment.module';

@Module({
  imports: [forwardRef(() => DeploymentModule)],
  providers: [MessagingQueueService],
  exports: [MessagingQueueService],
})
export class MessagingQueueModule {}
