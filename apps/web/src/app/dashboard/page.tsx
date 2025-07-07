"use client"

import { useState, useEffect } from "react"
import { Deployment, DeploymentStatus } from "@/components/DeploymentCard"
import { HeaderBar } from "@/components/HeaderBar"
import { DeploymentCard } from "@/components/DeploymentCard"
import { EmptyState } from "@/components/EmptyState"
import { useRouter } from "next/navigation"

const mockDeployments: Deployment[] = [
  {
    id: "dep_1a2b3c4d",
    repoName: "frontend-app",
    repoUrl: "https://github.com/company/frontend-app",
    status: "running",
    boundPort: 3000,
    imageName: "frontend-app:latest",
    dockerfilePath: "./Dockerfile",
    contextDir: ".",
    composePath: null,
    lastUpdated: "2024-01-07T10:25:00Z",
    logs: ["Starting application...", "Server listening on port 3000", "Application ready"],
  },
  {
    id: "dep_5e6f7g8h",
    repoName: "api-service",
    repoUrl: "https://github.com/company/api-service",
    status: "building",
    boundPort: null,
    imageName: "api-service:v1.2.0",
    dockerfilePath: "./docker/Dockerfile",
    contextDir: "./src",
    composePath: "./docker-compose.yml",
    lastUpdated: "2024-01-07T10:20:00Z",
    logs: ["Cloning repository...", "Building Docker image...", "Step 3/8: RUN npm install"],
  },
  {
    id: "dep_9i0j1k2l",
    repoName: "worker-queue",
    repoUrl: "https://github.com/company/worker-queue",
    status: "failed",
    boundPort: null,
    imageName: "worker-queue:main",
    dockerfilePath: "./Dockerfile",
    contextDir: ".",
    composePath: null,
    lastUpdated: "2024-01-07T10:15:00Z",
    logs: ["Starting build...", "ERROR: Package not found", "Build failed with exit code 1"],
  },
  {
    id: "dep_3m4n5o6p",
    repoName: "database",
    repoUrl: "https://github.com/company/database",
    status: "stopped",
    boundPort: null,
    imageName: "postgres:14",
    dockerfilePath: null,
    contextDir: ".",
    composePath: "./docker-compose.yml",
    lastUpdated: "2024-01-07T09:45:00Z",
    logs: ["Container stopped by user"],
  },
]

export default function DashboardPage() {
  const [deployments, setDeployments] = useState<Deployment[]>(mockDeployments)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const interval = setInterval(() => {
      setDeployments((prev) =>
        prev.map((dep) => {
          if (dep.status === "building" && Math.random() > 0.7) {
            return {
              ...dep,
              status: "running" as DeploymentStatus,
              boundPort: 3000 + Math.floor(Math.random() * 1000),
            }
          }
          return dep
        })
      )
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  const handleAction = async (id: string, action: "trigger" | "stop" | "delete") => {
    if (action === "delete") {
      setDeployments((prev) => prev.filter((dep) => dep.id !== id))
    } else if (action === "trigger") {
      setDeployments((prev) =>
        prev.map((dep) =>
          dep.id === id ? { ...dep, status: "building", boundPort: null } : dep
        )
      )
    } else if (action === "stop") {
      setDeployments((prev) =>
        prev.map((dep) =>
          dep.id === id ? { ...dep, status: "stopped", boundPort: null } : dep
        )
      )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderBar onRefresh={handleRefresh} isRefreshing={isRefreshing} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Active Deployments</h2>
          <p className="text-sm text-gray-600">{deployments.length} total deployments</p>
        </div>

        {deployments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deployments.map((dep) => (
              <DeploymentCard
                key={dep.id}
                deployment={dep}
                onTrigger={(id) => handleAction(id, "trigger")}
                onStop={(id) => handleAction(id, "stop")}
                onDelete={(id) => handleAction(id, "delete")}
                onViewDetails={(deployment) => router.push(`/deployment/${deployment.id}`)}
              />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </main>
    </div>
  )
}
