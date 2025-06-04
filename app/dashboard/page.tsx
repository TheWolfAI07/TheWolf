"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Activity, TrendingUp, Crown, Zap, CheckCircle, AlertCircle, RefreshCw, Rocket } from "lucide-react"
import { Navbar } from "@/components/navbar"
import CustomizableLayout from "@/components/customizable-layout"
import AdvancedProjectManager from "@/components/advanced-project-manager"
import CollaborativeDashboard from "@/components/collaborative-dashboard"
import AIDashboard from "@/components/ai-dashboard"
import { apiClient } from "@/lib/api-client"
import { logger } from "@/lib/logger"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [realData, setRealData] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load real data from all APIs
  const loadRealDashboardData = async () => {
    try {
      setLoading(true)
      logger.info("Loading real dashboard data")

      const [analyticsResponse, projectsResponse, statusResponse] = await Promise.all([
        apiClient.get("/api/analytics"),
        apiClient.get("/api/projects"),
        apiClient.get("/api/status"),
      ])

      const dashboardData = {
        analytics: analyticsResponse.success ? analyticsResponse.data : null,
        projects: projectsResponse.success ? projectsResponse.data : null,
        status: statusResponse.success ? statusResponse.data : null,
        timestamp: new Date().toISOString(),
      }

      setRealData(dashboardData)
      logger.info("Real dashboard data loaded successfully")
    } catch (error: any) {
      logger.error("Failed to load dashboard data", { error: error.message })
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRealDashboardData()

    // Refresh data every 30 seconds
    const interval = setInterval(loadRealDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-slate-800 text-white">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
            <div className="text-slate-300">Loading real dashboard data...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-slate-800 text-white">
      <Navbar />

      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <BarChart3 className="h-10 w-10 text-cyan-400" />
                <Crown className="absolute -top-1 -right-1 h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Wolf Platform Dashboard
                </h1>
                <p className="text-slate-400">Real-time analytics and system management</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/50">
                <Activity className="h-3 w-3 mr-1 animate-pulse" />
                LIVE DATA
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={loadRealDashboardData}
                className="border-cyan-400/50 text-cyan-300 hover:bg-cyan-400/10"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Card className="mb-6 border-red-400/50 bg-red-500/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-300">
                <AlertCircle className="h-4 w-4" />
                <span>Error loading dashboard data: {error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Real Data Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-cyan-300">Total Projects</CardTitle>
              <TrendingUp className="h-4 w-4 text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-400">
                {realData.analytics?.totalProjects || realData.projects?.stats?.total || 0}
              </div>
              <p className="text-xs text-slate-400">Real project count</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-400/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-300">Active Projects</CardTitle>
              <Activity className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-400">
                {realData.analytics?.activeProjects || realData.projects?.stats?.active || 0}
              </div>
              <p className="text-xs text-slate-400">Currently active</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-400/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-300">System Status</CardTitle>
              <CheckCircle className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-400">
                {realData.status?.status === "healthy" ? "HEALTHY" : "CHECKING"}
              </div>
              <p className="text-xs text-slate-400">Real system status</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-400/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-300">Response Time</CardTitle>
              <Zap className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-400">{realData.status?.responseTime || 0}ms</div>
              <p className="text-xs text-slate-400">API response time</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8 bg-gradient-to-r from-slate-800 to-slate-700 border border-cyan-400/30">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="customizable">Customizable</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="collaborative">Collaborative</TabsTrigger>
            <TabsTrigger value="ai">AI Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-6">
              <Card className="bg-gradient-to-r from-slate-800/90 to-slate-700/90 backdrop-blur-sm border border-slate-600/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-cyan-400" />
                    Real System Overview
                    <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/50">
                      <Activity className="h-3 w-3 mr-1" />
                      LIVE
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-200 mb-4">System Health</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300">Database</span>
                          <Badge className="bg-emerald-500/20 text-emerald-300">
                            {realData.status?.checks?.database?.status || "Unknown"}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300">Environment</span>
                          <Badge className="bg-cyan-500/20 text-cyan-300">
                            {realData.status?.environment?.nodeEnv || "Unknown"}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300">Platform</span>
                          <Badge className="bg-yellow-500/20 text-yellow-300">
                            {realData.status?.environment?.platform || "Unknown"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-200 mb-4">Real Data Summary</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300">Projects</span>
                          <span className="text-cyan-400 font-bold">{realData.projects?.data?.length || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300">Analytics Records</span>
                          <span className="text-emerald-400 font-bold">{realData.analytics?.metrics?.length || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300">Last Updated</span>
                          <span className="text-slate-400 text-sm">
                            {new Date(realData.timestamp || Date.now()).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Real Projects Preview */}
              {realData.projects?.data && realData.projects.data.length > 0 && (
                <Card className="bg-gradient-to-r from-slate-800/90 to-slate-700/90 backdrop-blur-sm border border-slate-600/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <Rocket className="h-5 w-5 text-purple-400" />
                      Recent Real Projects
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {realData.projects.data.slice(0, 3).map((project: any) => (
                        <Card key={project.id} className="bg-slate-800/50 border border-slate-600/30">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">{project.name}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Status:</span>
                                <Badge className="bg-emerald-500/20 text-emerald-300 text-xs">{project.status}</Badge>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Progress:</span>
                                <span className="text-cyan-400">{project.progress}%</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Priority:</span>
                                <Badge className="bg-yellow-500/20 text-yellow-300 text-xs">{project.priority}</Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="customizable">
            <CustomizableLayout />
          </TabsContent>

          <TabsContent value="projects">
            <AdvancedProjectManager />
          </TabsContent>

          <TabsContent value="collaborative">
            <CollaborativeDashboard projectId="demo-project" projectName="Wolf Platform Demo" />
          </TabsContent>

          <TabsContent value="ai">
            <AIDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
