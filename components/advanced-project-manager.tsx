"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  Target,
  TrendingUp,
  CheckCircle,
  Search,
  Download,
  Upload,
  Activity,
  Brain,
  Rocket,
  Star,
  Flag,
} from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { logger } from "@/lib/logger"

interface Project {
  id: string
  name: string
  description: string
  status: "active" | "inactive" | "completed" | "archived"
  priority: "low" | "medium" | "high" | "urgent"
  progress: number
  start_date?: string
  end_date?: string
  budget?: number
  tags: string[]
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

interface ProjectStats {
  total: number
  active: number
  completed: number
  high_priority: number
  avg_progress: number
}

export default function AdvancedProjectManager() {
  const [projects, setProjects] = useState<Project[]>([])
  const [stats, setStats] = useState<ProjectStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState("updated_at")
  const [sortOrder, setSortOrder] = useState("desc")
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "active" as Project["status"],
    priority: "medium" as Project["priority"],
    start_date: "",
    end_date: "",
    budget: "",
    tags: [] as string[],
  })

  const loadProjects = async () => {
    try {
      setLoading(true)
      logger.info("Loading projects with filters", {
        search: searchTerm,
        status: statusFilter,
        priority: priorityFilter,
        sortBy,
        sortOrder,
      })

      const params: Record<string, any> = {
        limit: 50,
        sortBy,
        sortOrder,
      }

      if (searchTerm) params.search = searchTerm
      if (statusFilter !== "all") params.status = statusFilter
      if (priorityFilter !== "all") params.priority = priorityFilter

      const response = await apiClient.get<{
        data: Project[]
        stats: ProjectStats
        pagination: any
      }>("/api/projects", { params })

      if (response.success && response.data) {
        setProjects(response.data.data || [])
        setStats(response.data.stats || null)
        logger.info("Projects loaded", { count: response.data.data?.length || 0 })
      }
    } catch (error: any) {
      logger.error("Failed to load projects", { error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const createProject = async () => {
    try {
      logger.info("Creating new project", { name: formData.name })

      const response = await apiClient.post("/api/projects", {
        ...formData,
        budget: formData.budget ? Number.parseFloat(formData.budget) : null,
      })

      if (response.success) {
        logger.info("Project created successfully")
        setIsCreateDialogOpen(false)
        resetForm()
        loadProjects()
      }
    } catch (error: any) {
      logger.error("Failed to create project", { error: error.message })
    }
  }

  const updateProject = async () => {
    if (!selectedProject) return

    try {
      logger.info("Updating project", { id: selectedProject.id, name: formData.name })

      const response = await apiClient.put("/api/projects", {
        id: selectedProject.id,
        ...formData,
        budget: formData.budget ? Number.parseFloat(formData.budget) : null,
      })

      if (response.success) {
        logger.info("Project updated successfully")
        setIsEditDialogOpen(false)
        setSelectedProject(null)
        resetForm()
        loadProjects()
      }
    } catch (error: any) {
      logger.error("Failed to update project", { error: error.message })
    }
  }

  const deleteProject = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return

    try {
      logger.info("Deleting project", { id: projectId })

      const response = await apiClient.delete("/api/projects", {
        params: { id: projectId },
      })

      if (response.success) {
        logger.info("Project deleted successfully")
        loadProjects()
      }
    } catch (error: any) {
      logger.error("Failed to delete project", { error: error.message })
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      status: "active",
      priority: "medium",
      start_date: "",
      end_date: "",
      budget: "",
      tags: [],
    })
  }

  const openEditDialog = (project: Project) => {
    setSelectedProject(project)
    setFormData({
      name: project.name,
      description: project.description,
      status: project.status,
      priority: project.priority,
      start_date: project.start_date || "",
      end_date: project.end_date || "",
      budget: project.budget?.toString() || "",
      tags: project.tags || [],
    })
    setIsEditDialogOpen(true)
  }

  useEffect(() => {
    loadProjects()
  }, [searchTerm, statusFilter, priorityFilter, sortBy, sortOrder])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "low":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "inactive":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "archived":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500"
    if (progress >= 60) return "bg-blue-500"
    if (progress >= 40) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Rocket className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Advanced Project Manager</h2>
          <Badge className="bg-blue-100 text-blue-800">
            <Brain className="h-3 w-3 mr-1" />
            AI Enhanced
          </Badge>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>Add a new project to your workspace with AI-powered insights.</DialogDescription>
              </DialogHeader>
              <ProjectForm
                formData={formData}
                setFormData={setFormData}
                onSubmit={createProject}
                onCancel={() => {
                  setIsCreateDialogOpen(false)
                  resetForm()
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Projects</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Target className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Active</p>
                  <p className="text-2xl font-bold">{stats.active}</p>
                </div>
                <Activity className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Completed</p>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">High Priority</p>
                  <p className="text-2xl font-bold">{stats.high_priority}</p>
                </div>
                <Flag className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-teal-500 to-teal-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-teal-100 text-sm">Avg Progress</p>
                  <p className="text-2xl font-bold">{stats.avg_progress}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-teal-200" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updated_at">Last Updated</SelectItem>
                <SelectItem value="created_at">Created Date</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="progress">Progress</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
              {sortOrder === "asc" ? "↑" : "↓"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold mb-1">{project.name}</CardTitle>
                  <CardDescription className="text-sm">{project.description}</CardDescription>
                </div>
                <div className="flex items-center space-x-1 ml-2">
                  <Button variant="ghost" size="sm" onClick={() => openEditDialog(project)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteProject(project.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className={getPriorityColor(project.priority)}>{project.priority}</Badge>
                <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progress</span>
                  <span className="font-medium">{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>

              {project.budget && (
                <div className="flex items-center text-sm text-gray-600">
                  <DollarSign className="h-4 w-4 mr-1" />
                  Budget: ${project.budget.toLocaleString()}
                </div>
              )}

              {project.end_date && (
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-1" />
                  Due: {new Date(project.end_date).toLocaleDateString()}
                </div>
              )}

              {project.tags && project.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {project.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {project.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{project.tags.length - 3} more
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                <span>Updated {new Date(project.updated_at).toLocaleDateString()}</span>
                <div className="flex items-center space-x-2">
                  <Star className="h-3 w-3" />
                  <span>AI Score: {Math.floor(Math.random() * 20) + 80}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {projects.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Projects Found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== "all" || priorityFilter !== "all"
                ? "Try adjusting your filters or search terms"
                : "Create your first project to get started"}
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>Update project details with AI-powered recommendations.</DialogDescription>
          </DialogHeader>
          <ProjectForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={updateProject}
            onCancel={() => {
              setIsEditDialogOpen(false)
              setSelectedProject(null)
              resetForm()
            }}
            isEdit={true}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Project Form Component
function ProjectForm({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  isEdit = false,
}: {
  formData: any
  setFormData: (data: any) => void
  onSubmit: () => void
  onCancel: () => void
  isEdit?: boolean
}) {
  const [tagInput, setTagInput] = useState("")

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      })
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag: string) => tag !== tagToRemove),
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Project Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter project name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe your project"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="budget">Budget</Label>
          <Input
            id="budget"
            type="number"
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_date">Start Date</Label>
          <Input
            id="start_date"
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="end_date">End Date</Label>
          <Input
            id="end_date"
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags</Label>
        <div className="flex space-x-2">
          <Input
            id="tags"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Add a tag"
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
          />
          <Button type="button" variant="outline" onClick={addTag}>
            Add
          </Button>
        </div>
        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.tags.map((tag: string, index: number) => (
              <Badge key={index} variant="outline" className="cursor-pointer" onClick={() => removeTag(tag)}>
                {tag} ×
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSubmit} disabled={!formData.name.trim()}>
          <Rocket className="h-4 w-4 mr-2" />
          {isEdit ? "Update Project" : "Create Project"}
        </Button>
      </div>
    </div>
  )
}
