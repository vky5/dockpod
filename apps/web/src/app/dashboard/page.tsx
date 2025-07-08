"use client"

import { useState, useEffect } from "react"
import { Deployment, DeploymentStatus } from "@/components/DeploymentCard"
import { HeaderBar } from "@/components/HeaderBar"
import { DeploymentCard } from "@/components/DeploymentCard"
import { EmptyState } from "@/components/EmptyState"
import { useRouter } from "next/navigation"
import axios from "axios"

export default function DashboardPage() {
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchDeployments()
  }, [])

  const fetchDeployments = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/deployment`)
      const transformed: Deployment[] = res.data.map((d: any) => {
        const repoUrl = d.repository?.startsWith("http")
          ? d.repository
          : `https://github.com/unknown/${d.name}`

        return {
          id: d.id,
          repoName: d.name || "unknown",
          repoUrl,
          status: mapStatus(d.deploymentStatus),
          boundPort: d.portNumber ? parseInt(d.portNumber) : null,
          imageName: `${d.name}:latest`,
          dockerfilePath: d.dockerFilePath,
          contextDir: d.contextDir,
          composePath: d.composeFilePath,
          lastUpdated: d.updatedAt,
          logs: [],
        }
      })
      setDeployments(transformed)
    } catch (err) {
      console.error("Failed to fetch deployments:", err)
    }
  }

  const mapStatus = (status: string): DeploymentStatus => {
    switch (status.toLowerCase()) {
      case "building":
      case "cloned":
      case "built":
        return "building"
      case "ready":
        return "running"
      case "stopped":
        return "stopped"
      default:
        return "pending"
    }
  }

  const handleRefresh = async () => {
  setIsRefreshing(true)

  // const delay = new Promise((res) => setTimeout(res, 500)) // ensure at least 500ms 
  await Promise.all([fetchDeployments(),
    //  delay
    ])

  setIsRefreshing(false)
}

  useEffect(() => {
    const interval = setInterval(() => {
      handleRefresh()
    }, 1 * 60 * 1000) // 1 minutes

    return () => clearInterval(interval)
  }, [])

  const handleAction = async (id: string, action: "trigger" | "stop" | "delete") => {
    if (action === "delete") {
      try {
        await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/deployment/delete/${id}`)
        setDeployments((prev) => prev.filter((dep) => dep.id !== id))
      } catch (err) {
        console.error("Delete failed:", err)
      }
    } else if (action === "trigger") {
      try {
        await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/deployment/build/${id}`)
        setDeployments((prev) =>
          prev.map((dep) =>
            dep.id === id ? { ...dep, status: "building", boundPort: null } : dep
          )
        )
      } catch (err) {
        console.error("Build trigger failed:", err)
      }
    } else if (action === "stop") {
      try {
        await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/deployment/stop/${id}`)
        setDeployments((prev) =>
          prev.map((dep) =>
            dep.id === id ? { ...dep, status: "stopped", boundPort: null } : dep
          )
        )
      } catch (err) {
        console.error("Stop failed:", err)
      }
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
