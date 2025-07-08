package queue

import (
	"encoding/json"
	"github.com/streadway/amqp"
)

// PublishResponseToQueue publishes a Response struct as a JSON message to the specified routing key.
func PublishResponseToQueue(routingKey string, resp Response) error {
	if channel == nil {
		return failOnError(nil, "Channel is not initialized. Call Connect() first")
	}

	message, err := json.Marshal(resp)
	if err != nil {
		return failOnError(err, "Failed to marshal response to JSON")
	}

	err = channel.Publish(
		exchange,   // exchange
		routingKey, // routing key
		false,      // mandatory
		false,      // immediate
		amqp.Publishing{
			ContentType: "application/json",
			Body:        message,
		},
	)
	return failOnError(err, "Failed to publish message to queue")

}
