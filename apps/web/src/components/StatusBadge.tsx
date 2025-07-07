import { Badge } from "@/components/ui/badge"

export type DeploymentStatus = "running" | "building" | "failed" | "stopped" | "cloned" | "pending"

interface StatusBadgeProps {
  status: DeploymentStatus
}

const getStatusColor = (status: DeploymentStatus) => {
  switch (status) {
    case "running":
      return "bg-green-100 text-green-800 border-green-200"
    case "building":
    case "cloned":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "failed":
      return "bg-red-100 text-red-800 border-red-200"
    case "stopped":
      return "bg-gray-100 text-gray-800 border-gray-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

const getStatusIcon = (status: DeploymentStatus) => {
  switch (status) {
    case "running":
      return "🟢"
    case "building":
    case "cloned":
      return "🔵"
    case "pending":
      return "🟡"
    case "failed":
      return "🔴"
    case "stopped":
      return "⚫"
    default:
      return "⚫"
  }
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge className={`ml-2 ${getStatusColor(status)}`}>
      <span className="mr-1">{getStatusIcon(status)}</span>
      {status}
    </Badge>
  )
}
