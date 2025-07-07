"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Plus,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface EnvironmentVariable {
  key: string
  value: string
  isSecret: boolean
}

interface DeploymentConfig {
  repoUrl: string
  repoName: string
  branch: string
  dockerfilePath: string
  contextDir: string
  composePath: string
  imageName: string
  targetPort: string
  hostPort: string
  environmentVariables: EnvironmentVariable[]
  autoRedeploy: boolean
  buildArgs: string
}

export default function NewDeploymentForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSecrets, setShowSecrets] = useState(false)
  const [config, setConfig] = useState<DeploymentConfig>({
    repoUrl: "",
    repoName: "",
    branch: "main",
    dockerfilePath: "./Dockerfile",
    contextDir: ".",
    composePath: "",
    imageName: "",
    targetPort: "",
    hostPort: "",
    environmentVariables: [],
    autoRedeploy: true,
    buildArgs: "",
  })

  const handleRepoUrlChange = (url: string) => {
    setConfig((prev) => ({
      ...prev,
      repoUrl: url,
      repoName: url ? url.split("/").pop()?.replace(".git", "") || "" : "",
      imageName: url ? `${url.split("/").pop()?.replace(".git", "") || ""}:latest` : "",
    }))
  }

  const addEnvironmentVariable = () => {
    setConfig((prev) => ({
      ...prev,
      environmentVariables: [...prev.environmentVariables, { key: "", value: "", isSecret: false }],
    }))
  }

  const updateEnvironmentVariable = (
    index: number,
    field: keyof EnvironmentVariable,
    value: string | boolean
  ) => {
    setConfig((prev) => ({
      ...prev,
      environmentVariables: prev.environmentVariables.map((env, i) =>
        i === index ? { ...env, [field]: value } : env
      ),
    }))
  }

  const removeEnvironmentVariable = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      environmentVariables: prev.environmentVariables.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      console.log("Creating deployment with config:", config)
      await new Promise((resolve) => setTimeout(resolve, 2000))
      router.push("/")
    } catch (error) {
      console.error("Failed to create deployment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = config.repoUrl && config.repoName && config.imageName

  return (
    <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between py-6">
                    <div className="flex items-center space-x-4">
                        <Link href="/dashboard">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Dashboard
                            </Button>
                        </Link>
                    </div>
                    <div className="flex flex-col items-center flex-1">
                        <h1 className="text-2xl font-bold text-gray-900 text-center">Dockscope</h1>
                        <p className="text-sm text-gray-500 text-center">Configure and deploy a new containerized app</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            type="button"
                            variant="destructive"
                            className="min-w-[80px]"
                            onClick={() => router.push("/")}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={!isFormValid || isSubmitting} className="min-w-[120px]">
                            {isSubmitting ? "Creating..." : "Create Deployment"}
                        </Button>
                    </div>
                </div>
            </div>
        </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Repository Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Repository Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Label htmlFor="repoUrl">Repository URL</Label>
              <Input
                id="repoUrl"
                placeholder="https://github.com/user/project.git"
                value={config.repoUrl}
                onChange={(e) => handleRepoUrlChange(e.target.value)}
              />
              <Label htmlFor="repoName">Repository Name</Label>
              <Input
                id="repoName"
                placeholder="my-app"
                value={config.repoName}
                onChange={(e) => setConfig({ ...config, repoName: e.target.value })}
              />
              <Label htmlFor="branch">Branch</Label>
              <Select
                value={config.branch}
                onValueChange={(value) => setConfig((prev) => ({ ...prev, branch: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main">main</SelectItem>
                  <SelectItem value="master">master</SelectItem>
                  <SelectItem value="develop">develop</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Docker Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Docker Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Label htmlFor="dockerfilePath">Dockerfile Path</Label>
              <Input
                id="dockerfilePath"
                value={config.dockerfilePath}
                onChange={(e) => setConfig({ ...config, dockerfilePath: e.target.value })}
              />
              <Label htmlFor="contextDir">Context Directory</Label>
              <Input
                id="contextDir"
                value={config.contextDir}
                onChange={(e) => setConfig({ ...config, contextDir: e.target.value })}
              />
              <Label htmlFor="imageName">Image Name</Label>
              <Input
                id="imageName"
                value={config.imageName}
                onChange={(e) => setConfig({ ...config, imageName: e.target.value })}
              />
              <Label htmlFor="composePath">Compose File Path (optional)</Label>
              <Input
                id="composePath"
                value={config.composePath}
                onChange={(e) => setConfig({ ...config, composePath: e.target.value })}
              />
              <Label htmlFor="buildArgs">Build Arguments</Label>
              <Textarea
                id="buildArgs"
                rows={3}
                value={config.buildArgs}
                onChange={(e) => setConfig({ ...config, buildArgs: e.target.value })}
                placeholder="KEY=value\nKEY2=value2"
              />
            </CardContent>
          </Card>

          {/* Network Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Network Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Label htmlFor="targetPort">Container Port</Label>
              <Input
                id="targetPort"
                value={config.targetPort}
                onChange={(e) => setConfig({ ...config, targetPort: e.target.value })}
              />
              <Label htmlFor="hostPort">Host Port (Optional)</Label>
              <Input
                id="hostPort"
                value={config.hostPort}
                onChange={(e) => setConfig({ ...config, hostPort: e.target.value })}
              />
            </CardContent>
          </Card>

          {/* Environment Variables */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Environment Variables</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {config.environmentVariables.map((env, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="KEY"
                    value={env.key}
                    onChange={(e) => updateEnvironmentVariable(index, "key", e.target.value)}
                  />
                  <Input
                    placeholder="Value"
                    type={env.isSecret && !showSecrets ? "password" : "text"}
                    value={env.value}
                    onChange={(e) => updateEnvironmentVariable(index, "value", e.target.value)}
                  />
                  <Switch
                    checked={env.isSecret}
                    onCheckedChange={(val) => updateEnvironmentVariable(index, "isSecret", val)}
                  />
                  <Badge variant={env.isSecret ? "destructive" : "secondary"}>
                    {env.isSecret ? "Secret" : "Public"}
                  </Badge>
                  <Button type="button" variant="ghost" onClick={() => removeEnvironmentVariable(index)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addEnvironmentVariable}>
                <Plus className="w-4 h-4 mr-2" /> Add Variable
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowSecrets((s) => !s)}>
                {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />} {showSecrets ? "Hide" : "Show"} Secrets
              </Button>
            </CardContent>
          </Card>

          {/* Auto-Redeploy */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Deployment Options</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoRedeploy" className="text-base font-medium">
                  Auto-redeploy on push
                </Label>
                <p className="text-sm text-gray-500">
                  Automatically rebuild and redeploy when changes are pushed
                </p>
              </div>
              <Switch
                id="autoRedeploy"
                checked={config.autoRedeploy}
                onCheckedChange={(checked) => setConfig((prev) => ({ ...prev, autoRedeploy: checked }))}
              />
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={() => router.push("/")}>Cancel</Button>
            <Button type="submit" disabled={!isFormValid || isSubmitting} className="min-w-[140px]">
              {isSubmitting ? "Creating..." : "Create Deployment"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}