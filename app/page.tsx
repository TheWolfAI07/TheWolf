"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Activity,
  BarChart3,
  Brain,
  CheckCircle,
  Clock,
  Database,
  Globe,
  Loader2,
  Server,
  Shield,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react"

interface SystemStatus {
  database: "healthy" | "warning" | "error"
  api: "healthy" | "warning" | "error"
  realtime: "healthy" | "warning" | "error"
  ai: "healthy" | "warning" | "error"
}

interface PlatformStats {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  avgProgress: number
  recentActivities: number
  systemUptime: string
}

export default function HomePage() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    database: "healthy",
    api: "healthy",
    realtime: "healthy",
    ai: "healthy",
  })

  const [platformStats, setPlatformStats] = useState<PlatformStats>({
    totalProjects: 12,
    activeProjects: 8,
    completedProjects: 4,
    avgProgress: 67,
    recentActivities: 24,
    systemUptime: "15d 8h",
  })

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600 bg-green-100"
      case "warning":
        return "text-yellow-600 bg-yellow-100"
      case "error":
        return "text-red-600 bg-red-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4" />
      case "warning":
        return <Clock className="h-4 w-4" />
      case "error":
        return <Activity className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Wolf Platform</h2>
          <p className="text-gray-600">Initializing AI-powered dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-white/20 p-3 rounded-full mr-4">
                <Brain className="h-8 w-8" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold">Wolf Platform</h1>
            </div>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">AI-Powered Project Management & Analytics Platform</p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                <Zap className="h-4 w-4 mr-2" />
                Real-time Collaboration
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                <Brain className="h-4 w-4 mr-2" />
                AI Insights
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                <Shield className="h-4 w-4 mr-2" />
                Enterprise Security
              </Badge>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                <TrendingUp className="h-5 w-5 mr-2" />
                View Dashboard
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Globe className="h-5 w-5 mr-2" />
                Explore Features
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* System Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Database</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(systemStatus.database)}>
                      {getStatusIcon(systemStatus.database)}
                      <span className="ml-1 capitalize">{systemStatus.database}</span>
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">API Services</CardTitle>
                  <Server className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(systemStatus.api)}>
                      {getStatusIcon(systemStatus.api)}
                      <span className="ml-1 capitalize">{systemStatus.api}</span>
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Real-time</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(systemStatus.realtime)}>
                      {getStatusIcon(systemStatus.realtime)}
                      <span className="ml-1 capitalize">{systemStatus.realtime}</span>
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">AI Engine</CardTitle>
                  <Brain className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(systemStatus.ai)}>
                      {getStatusIcon(systemStatus.ai)}
                      <span className="ml-1 capitalize">{systemStatus.ai}</span>
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Platform Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Project Overview</CardTitle>
                  <CardDescription>Current project statistics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Projects</span>
                    <span className="font-semibold">{platformStats.totalProjects}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Active</span>
                    <span className="font-semibold text-green-600">{platformStats.activeProjects}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Completed</span>
                    <span className="font-semibold text-blue-600">{platformStats.completedProjects}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Average Progress</span>
                      <span className="font-semibold">{platformStats.avgProgress}%</span>
                    </div>
                    <Progress value={platformStats.avgProgress} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Activity Feed</CardTitle>
                  <CardDescription>Recent platform activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold">{platformStats.recentActivities}</p>
                      <p className="text-sm text-muted-foreground">Recent activities (24h)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">System Uptime</CardTitle>
                  <CardDescription>Platform availability</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <div className="bg-green-100 p-3 rounded-full">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold">{platformStats.systemUptime}</p>
                      <p className="text-sm text-muted-foreground">Continuous operation</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="projects">
            <Card>
              <CardHeader>
                <CardTitle>Project Management</CardTitle>
                <CardDescription>Manage and monitor your projects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Project management interface coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
                <CardDescription>AI-powered insights and analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Advanced analytics coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle>System Administration</CardTitle>
                <CardDescription>Platform configuration and monitoring</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">System administration panel coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
