"use client"

import { useParams } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { StatusBadge } from "@/components/StatusBadge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"

const mockDeployments = [
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
    logs: [
      "Starting application...",
      "Server listening on port 3000",
      "Application ready"
    ]
  }
]

const formatTimestamp = (timestamp: string) => new Date(timestamp).toLocaleString()

export default function DeploymentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [deployment, setDeployment] = useState<null | typeof mockDeployments[0]>(null)
  const [logs, setLogs] = useState<string[]>([])
  const logRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const dep = mockDeployments.find((d) => d.id === id)
    if (dep) {
      setDeployment(dep)
      setLogs(dep.logs)
    }
  }, [id])

  useEffect(() => {
    const interval = setInterval(() => {
      setLogs((prev) => [...prev, `Mock log at ${new Date().toLocaleTimeString()}`])
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [logs])

  if (!deployment) return <p className="p-6 text-center">Deployment not found.</p>

  return (
    <div className="min-h-screen bg-white p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
          <span>{deployment.repoName}</span>
          <StatusBadge status={deployment.status as any} />
        </h1>
        <p className="text-base text-gray-700 mt-1">ID: {deployment.id}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_0.05fr_1.3fr] gap-8">
        {/* Configuration */}
        <div className="space-y-4 text-base text-gray-800">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Configuration</h2>
            <Separator className="mb-4" />
            <div className="space-y-3">
              <div>
                <span className="text-gray-600 font-semibold">Image Name:</span>
                <p className="font-mono text-sm">{deployment.imageName}</p>
              </div>
              <div>
                <span className="text-gray-600 font-semibold">Bound Port:</span>
                <p className="font-mono text-sm">
                  {deployment.boundPort ? `:${deployment.boundPort}` : "Not bound"}
                </p>
              </div>
              <div>
                <span className="text-gray-600 font-semibold">Last Updated:</span>
                <p className="text-sm">{formatTimestamp(deployment.lastUpdated)}</p>
              </div>
              <div>
                <span className="text-gray-600 font-semibold">Repository URL:</span>
                <p className="break-all text-sm">
                  <a
                    href={deployment.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {deployment.repoUrl}
                  </a>
                </p>
              </div>
              <div>
                <span className="text-gray-600 font-semibold">Dockerfile Path:</span>
                <p className="font-mono text-sm">{deployment.dockerfilePath || "N/A"}</p>
              </div>
              <div>
                <span className="text-gray-600 font-semibold">Context Directory:</span>
                <p className="font-mono text-sm">{deployment.contextDir}</p>
              </div>
              <div>
                <span className="text-gray-600 font-semibold">Compose Path:</span>
                <p className="font-mono text-sm">{deployment.composePath || "N/A"}</p>
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <Button onClick={() => alert("Triggering build")}>Trigger Rebuild</Button>
              <Button variant="outline" onClick={() => alert("Stopping container")}>Stop</Button>
              <Button variant="destructive" onClick={() => alert("Deleting deployment")}>Delete</Button>
            </div>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="w-full h-full border-l border-gray-300"></div>

        {/* Logs */}
        <div className="flex flex-col h-[560px]">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Recent Logs</h2>
          <Separator className="mb-4" />
          <div
            ref={logRef}
            className="bg-gray-900 rounded-lg p-4 overflow-y-auto flex-1"
          >
            {logs.map((log, index) => (
              <div
                key={index}
                className="text-sm font-mono text-green-200 mb-1 whitespace-pre-wrap break-words"
              >
                <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span> {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}