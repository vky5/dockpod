// this package will be responsible for concurrently reading the files

package main

import (
	"database/sql"
	"log"
	"worker/internal/builder"
	"worker/internal/queue"
	"worker/internal/store"
	"worker/internal/tracker"
)

const maxConcurrentBuilds = 2 // this is the max builds that can be done parallely because building image is heavy and we need to limit it
var semaphore = make(chan struct{}, maxConcurrentBuilds)

func safeBuild(msg *builder.BuildImageOptions, deploymentId string) {
	semaphore <- struct{}{} // store in the slot // this thread will pause until it can accept again
	go func() {
		defer func() { <-semaphore }() // release slot

		err := builder.BuildImage(
			builder.BuildImageOptions{
				ImageName:      msg.ImageName,
				ContextDir:     msg.ContextDir,
				DockerfilePath: msg.DockerfilePath,
			})
		if err != nil {
			store.UpdateWorker(deploymentId, "failed", sql.NullString{Valid: false})
			log.Printf("❌ Build failed: %v", err)
		} else {
			queue.PublishResponseToQueue(queue.ResultRoutingKey, queue.Response{ // sent the backend the response of built
				DeploymentID: deploymentId,
				Status:       "built",
			})
			store.UpdateWorker(deploymentId, "built", sql.NullString{Valid: false}) // storing in db that container is ready to run
			tracker.DeleteEntry(deploymentId)                                       // deleting the entry from repos.json and the clonedrepo that we used
			log.Println("✅ Build successful")
		}

	}()

}
