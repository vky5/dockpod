import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { StatusBadge, DeploymentStatus } from "./StatusBadge";

export interface Deployment {
  id: string;
  repoName: string;
  repoUrl: string;
  status: DeploymentStatus;
  boundPort: number | null;
  imageName: string;
  dockerfilePath: string | null;
  contextDir: string;
  composePath: string | null;
  lastUpdated: string;
  logs: string[];
}

interface DeploymentDetailModalProps {
  deployment: Deployment | null;
  onClose: () => void;
  onTrigger: (id: string) => void;
  onStop: (id: string) => void;
  onDelete: (id: string) => void;
}

const formatTimestamp = (timestamp: string) => {
  return new Date(timestamp).toLocaleString();
};

export function DeploymentDetailModal({
  deployment,
  onClose,
  onTrigger,
  onStop,
  onDelete,
}: DeploymentDetailModalProps) {
  if (!deployment) return null;

  return (
    <Dialog open={!!deployment} onOpenChange={onClose}>
      <DialogContent className="w-full h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <span>{deployment.repoName}</span>
            <StatusBadge status={deployment.status} />
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 space-y-6">
          {/* Basic Info */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">
              Basic Information
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Deployment ID:</span>
                <p className="font-mono">{deployment.id}</p>
              </div>
              <div>
                <span className="text-gray-500">Image Name:</span>
                <p className="font-mono">{deployment.imageName}</p>
              </div>
              <div>
                <span className="text-gray-500">Bound Port:</span>
                <p className="font-mono">
                  {deployment.boundPort
                    ? `:${deployment.boundPort}`
                    : "Not bound"}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Last Updated:</span>
                <p>{formatTimestamp(deployment.lastUpdated)}</p>
              </div>
            </div>
          </div>

          <Separator />
          <div className="flex">
            {/* Configuration */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">
                Configuration
              </h4>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-500">Repository URL:</span>
                  <p className="break-all">
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
                  <span className="text-gray-500">Dockerfile Path:</span>
                  <p className="font-mono">
                    {deployment.dockerfilePath || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Context Directory:</span>
                  <p className="font-mono">{deployment.contextDir}</p>
                </div>
                <div>
                  <span className="text-gray-500">Compose Path:</span>
                  <p className="font-mono">{deployment.composePath || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Logs */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 w-1/2">Recent Logs</h4>
              <div className="bg-gray-900 rounded-lg p-4 max-h-60 overflow-y-auto">
                {deployment.logs.map((log, index) => (
                  <div
                    key={index}
                    className="text-sm font-mono text-gray-300 mb-1"
                  >
                    <span className="text-gray-500">
                      [{new Date().toLocaleTimeString()}]
                    </span>{" "}
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <Separator />

          {/* Actions */}
          <div className="flex space-x-3 pt-4 border-t">
            <Button
              onClick={() => onTrigger(deployment.id)}
              disabled={deployment.status === "building"}
              className="flex-1"
            >
              Trigger Rebuild
            </Button>
            <Button
              variant="outline"
              onClick={() => onStop(deployment.id)}
              disabled={
                deployment.status === "stopped" ||
                deployment.status === "building"
              }
              className="flex-1"
            >
              Stop Container
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onDelete(deployment.id);
                onClose();
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
