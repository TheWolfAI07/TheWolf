"use client"

import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

interface Project {
  id: number
  name: string
  description: string
  status: string
  created_at: string
  updated_at: string
  owner_id: string
}

interface ProjectListProps {
  projects: Project[]
  isOwner: boolean
  roles?: Record<number, string>
}

export function ProjectList({ projects, isOwner, roles = {} }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg border border-dashed">
        <p className="text-gray-500">
          {isOwner ? "You haven't created any projects yet." : "You aren't a member of any projects yet."}
        </p>
      </div>
    )
  }

  function getStatusColor(status: string) {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "on hold":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <Card key={project.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-medium text-lg truncate">{project.name}</h3>
              <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
            </div>
            <p className="text-gray-600 text-sm line-clamp-3 mb-4">{project.description}</p>

            {!isOwner && roles[project.id] && (
              <div className="mb-4">
                <Badge variant="outline">Role: {roles[project.id]}</Badge>
              </div>
            )}

            <div className="text-xs text-gray-500">
              {isOwner ? "Created" : "Updated"}:{" "}
              {formatDistanceToNow(new Date(isOwner ? project.created_at : project.updated_at), { addSuffix: true })}
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50 px-6 py-3 border-t">
            <a href={`/projects/${project.id}`} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              View Project Details →
            </a>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
