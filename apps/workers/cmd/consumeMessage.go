// this will consume message and based on the type of message, this will call the handler.

package main

import (
	"log"
	"worker/internal/queue"
)

func consumeMessage(msg queue.DeploymentMessage) {

	switch msg.Type {
	case "build":
		go handleCloning(msg)
	case "delete":
		go handleDeleteImage(msg)
	case "trigger":
		go handleTriggerImage(msg)
	case "stop":
		go handleStoppingImage(msg)
	default:
		log.Printf("⚠️ Unknown message type: %s", msg.Type)
	}
}
