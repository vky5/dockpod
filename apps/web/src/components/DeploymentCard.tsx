import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ExternalLink, FileText } from "lucide-react"
import { StatusBadge, DeploymentStatus } from "./StatusBadge"

export interface Deployment {
  id: string
  repoName: string
  repoUrl: string
  status: DeploymentStatus
  boundPort: number | null
  imageName: string
  dockerfilePath: string | null
  contextDir: string
  composePath: string | null
  lastUpdated: string
  logs: string[]
}

interface DeploymentCardProps {
  deployment: Deployment
  onTrigger: (id: string) => void
  onStop: (id: string) => void
  onDelete: (id: string) => void
  onViewDetails: (deployment: Deployment) => void
}

const formatTimestamp = (timestamp: string) => {
  return new Date(timestamp).toLocaleString()
}

export function DeploymentCard({
  deployment,
  onTrigger,
  onStop,
  onDelete,
  onViewDetails,
}: DeploymentCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-gray-900 truncate">
              {deployment.repoName}
            </CardTitle>
            <p className="text-sm text-gray-500 font-mono">{deployment.id}</p>
          </div>
          <StatusBadge status={deployment.status} />
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Port:</span>
            <span className="font-mono">{deployment.boundPort ? `:${deployment.boundPort}` : "Not bound"}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Updated:</span>
            <span className="text-gray-700">{formatTimestamp(deployment.lastUpdated)}</span>
          </div>

          <div className="flex items-center space-x-1 text-sm">
            <ExternalLink className="w-3 h-3 text-gray-400" />
            <a
              href={deployment.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 truncate"
              onClick={(e) => e.stopPropagation()}
            >
              {deployment.repoUrl.split("/").slice(-2).join("/")}
            </a>
          </div>

          <Separator />

          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={(e) => {
                e.stopPropagation()
                onTrigger(deployment.id)
              }}
              disabled={deployment.status === "building"}
            >
              Trigger
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={(e) => {
                e.stopPropagation()
                onStop(deployment.id)
              }}
              disabled={deployment.status === "stopped" || deployment.status === "building"}
            >
              Stop
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(deployment.id)
              }}
            >
              Delete
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-2"
            onClick={() => onViewDetails(deployment)}
          >
            <FileText className="w-4 h-4 mr-2" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
export type { DeploymentStatus }

