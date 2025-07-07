import { Server, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function EmptyState() {
  return (
    <div className="text-center py-12">
      <Server className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No deployments found</h3>
      <p className="text-gray-500 mb-4">Get started by creating your first deployment</p>
      <Link href="/new-deployment">
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Deployment
        </Button>
      </Link>
    </div>
  )
}
