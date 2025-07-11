import { RefreshCw, Plus, Server } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface HeaderBarProps {
  onRefresh: () => void
  isRefreshing: boolean
}

export function HeaderBar({ onRefresh, isRefreshing }: HeaderBarProps) {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <Server className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">DockPod Dashboard</h1>
              <p className="text-sm text-gray-500">Container Infrastructure Management</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" onClick={onRefresh} disabled={isRefreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Link href="/new-deployment">
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New Deployment
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
