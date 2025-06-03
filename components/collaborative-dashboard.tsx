"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  MessageSquare,
  Eye,
  Clock,
  Edit,
  CheckCircle,
  XCircle,
  AlertCircle,
  Activity,
  Share2,
} from "lucide-react"
import { realtimeCollaboration, type CollaborationUser, type CollaborationAction } from "@/lib/realtime-collaboration"
import { useAuth } from "@/hooks/useAuth"
import { logger } from "@/lib/logger"

interface CollaborativeDashboardProps {
  projectId: string
  projectName: string
}

export default function CollaborativeDashboard({ projectId, projectName }: CollaborativeDashboardProps) {
  const { user } = useAuth()
  const [activeUsers, setActiveUsers] = useState<CollaborationUser[]>([])
  const [recentActions, setRecentActions] = useState<CollaborationAction[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const dashboardRef = useRef<HTMLDivElement>(null)
  const roomId = `project_${projectId}`

  // Initialize collaboration when component mounts
  useEffect(() => {
    if (!user) return

    try {
      // Set user information
      realtimeCollaboration.setUser(
        user.id,
        user.user_metadata?.full_name || user.email || "Anonymous",
        user.user_metadata?.avatar_url,
      )

      // Join the collaboration room
      const joinRoom = async () => {
        try {
          const room = await realtimeCollaboration.joinRoom(roomId, "project", projectName)
          setActiveUsers(room.users)
          setIsConnected(true)
          logger.info("Joined collaboration room", { roomId })
        } catch (err: any) {
          setError(err.message || "Failed to join collaboration room")
          logger.error("Failed to join collaboration room", { error: err })
        }
      }

      joinRoom()

      // Track mouse movements for cursor sharing
      const handleMouseMove = (e: MouseEvent) => {
        if (!dashboardRef.current) return

        // Get relative position within the dashboard
        const rect = dashboardRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        // Only send updates every 100ms to avoid flooding
        if (Date.now() % 100 < 20) {
          realtimeCollaboration.updateCursorPosition(roomId, x, y)
        }
      }

      // Add mouse move listener
      if (dashboardRef.current) {
        dashboardRef.current.addEventListener("mousemove", handleMouseMove)
      }

      // Clean up
      return () => {
        realtimeCollaboration.leaveRoom(roomId)
        if (dashboardRef.current) {
          dashboardRef.current.removeEventListener("mousemove", handleMouseMove)
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to initialize collaboration")
      logger.error("Failed to initialize collaboration", { error: err })
    }
  }, [user, projectId, projectName, roomId])

  // Poll for updates to active users
  useEffect(() => {
    if (!isConnected) return

    const interval = setInterval(() => {
      const users = realtimeCollaboration.getRoomUsers(roomId)
      setActiveUsers(users)

      // Collect recent actions from all users
      const actions: CollaborationAction[] = []
      users.forEach((user) => {
        if (user.actions) {
          actions.push(...user.actions)
        }
      })

      // Sort by timestamp (newest first) and take the 10 most recent
      const sortedActions = actions
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10)

      setRecentActions(sortedActions)
    }, 1000)

    return () => clearInterval(interval)
  }, [isConnected, roomId])

  // Broadcast view action when tab changes
  const handleTabChange = (value: string) => {
    if (isConnected) {
      realtimeCollaboration.broadcastAction(roomId, {
        type: "view",
        resourceId: value,
        resourceType: "dashboard",
      })
    }
  }

  // Broadcast edit action
  const handleEdit = (resourceId: string) => {
    if (isConnected) {
      realtimeCollaboration.broadcastAction(roomId, {
        type: "edit",
        resourceId,
        resourceType: "project",
      })
    }
  }

  // Broadcast approve action
  const handleApprove = (resourceId: string) => {
    if (isConnected) {
      realtimeCollaboration.broadcastAction(roomId, {
        type: "approve",
        resourceId,
        resourceType: "project",
      })
    }
  }

  // Format timestamp to relative time
  const formatRelativeTime = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(timestamp).getTime()

    if (diff < 60000) return "just now"
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return `${Math.floor(diff / 86400000)}d ago`
  }

  // Get action icon
  const getActionIcon = (type: string) => {
    switch (type) {
      case "edit":
        return <Edit className="h-4 w-4 text-blue-500" />
      case "comment":
        return <MessageSquare className="h-4 w-4 text-green-500" />
      case "view":
        return <Eye className="h-4 w-4 text-gray-500" />
      case "approve":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "reject":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div ref={dashboardRef} className="relative space-y-6">
      {/* Connection Status */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Collaboration error: {error}</AlertDescription>
        </Alert>
      )}

      {/* Collaboration Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Share2 className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-semibold">Collaborative Dashboard</h2>
          <Badge variant={isConnected ? "default" : "outline"} className="ml-2">
            {isConnected ? "Connected" : "Connecting..."}
          </Badge>
        </div>

        {/* Active Users */}
        <div className="flex items-center">
          <span className="text-sm text-gray-500 mr-2">
            {activeUsers.length} active {activeUsers.length === 1 ? "user" : "users"}
          </span>
          <div className="flex -space-x-2">
            <TooltipProvider>
              {activeUsers.slice(0, 5).map((user) => (
                <Tooltip key={user.id}>
                  <TooltipTrigger asChild>
                    <Avatar className="border-2 border-white h-8 w-8">
                      {user.avatar && <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />}
                      <AvatarFallback className="text-xs">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{user.name}</p>
                    <p className="text-xs text-gray-500">
                      {user.status} • {formatRelativeTime(user.lastActive)}
                    </p>
                  </TooltipContent>
                </Tooltip>
              ))}
              {activeUsers.length > 5 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Avatar className="border-2 border-white h-8 w-8 bg-gray-100">
                      <AvatarFallback>+{activeUsers.length - 5}</AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{activeUsers.length - 5} more users</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* Collaborative Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          <Tabs defaultValue="overview" onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Project Overview</CardTitle>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit("overview")}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button size="sm" onClick={() => handleApprove("overview")}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                    </div>
                  </div>
                  <CardDescription>Collaborative project dashboard with real-time updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>This is a collaborative workspace where multiple team members can work together in real-time.</p>
                  <p className="mt-2">All actions are synchronized instantly across all connected users.</p>
                </CardContent>
              </Card>

              {/* Render user cursors */}
              {activeUsers
                .filter((user) => user.id !== user?.id && user.cursor)
                .map((user) => (
                  <div
                    key={user.id}
                    className="absolute pointer-events-none"
                    style={{
                      left: user.cursor?.x,
                      top: user.cursor?.y,
                      transform: "translate(-50%, -50%)",
                      zIndex: 50,
                    }}
                  >
                    <div className="relative">
                      <div
                        className="w-4 h-4 transform rotate-45"
                        style={{ backgroundColor: stringToColor(user.id) }}
                      />
                      <div
                        className="absolute top-5 left-2 px-2 py-1 rounded text-xs text-white whitespace-nowrap"
                        style={{ backgroundColor: stringToColor(user.id) }}
                      >
                        {user.name}
                      </div>
                    </div>
                  </div>
                ))}
            </TabsContent>

            <TabsContent value="tasks" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Project Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Collaborative task management would be displayed here.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Project Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Collaborative timeline would be displayed here.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="resources" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Project Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Collaborative resource management would be displayed here.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Activity Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Active Users
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeUsers.length > 0 ? (
                <div className="space-y-3">
                  {activeUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          {user.avatar && <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />}
                          <AvatarFallback>
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.currentView || "Browsing"}</p>
                        </div>
                      </div>
                      <Badge
                        variant={user.status === "online" ? "default" : "outline"}
                        className={user.status === "online" ? "bg-green-500" : ""}
                      >
                        {user.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No active users</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-4 w-4 mr-2" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentActions.length > 0 ? (
                <div className="space-y-3">
                  {recentActions.map((action) => {
                    const user = activeUsers.find((u) => u.id === action.userId)
                    return (
                      <div key={action.id} className="flex items-start space-x-2">
                        <div className="mt-0.5">{getActionIcon(action.type)}</div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm">
                            <span className="font-medium">{user?.name || "Unknown user"}</span>{" "}
                            {action.type === "edit" && "edited"}
                            {action.type === "comment" && "commented on"}
                            {action.type === "view" && "viewed"}
                            {action.type === "approve" && "approved"}
                            {action.type === "reject" && "rejected"}{" "}
                            <span className="font-medium">{action.resourceId}</span>
                          </p>
                          <p className="text-xs text-gray-500 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatRelativeTime(action.timestamp)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No recent activity</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Helper function to generate a color from a string
function stringToColor(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }

  const hue = hash % 360
  return `hsl(${hue}, 80%, 50%)`
}
