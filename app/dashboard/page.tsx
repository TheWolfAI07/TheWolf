"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart3,
  Activity,
  TrendingUp,
  Crown,
  Zap,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Rocket,
  Clock,
  Eye,
  Shield,
  Database,
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import CustomizableLayout from "@/components/customizable-layout"
import AdvancedProjectManager from "@/components/advanced-project-manager"
import CollaborativeDashboard from "@/components/collaborative-dashboard"
import AIDashboard from "@/components/ai-dashboard"
import { apiClient } from "@/lib/api-client"
import { logger } from "@/lib/logger"

interface TimestampData {
  analytics: string | null
  projects: string | null
  status: string | null
  dashboard: string
  refreshId: string
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [realData, setRealData] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshCount, setRefreshCount] = useState(0)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [nextRefresh, setNextRefresh] = useState<Date | null>(null)
  const [countdown, setCountdown] = useState(30)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [timestamps, setTimestamps] = useState<TimestampData>({
    analytics: null,
    projects: null,
    status: null,
    dashboard: new Date().toISOString(),
    refreshId: `refresh-${Date.now()}`,
  })
  const [isRefreshing, setIsRefreshing] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)
  const clockRef = useRef<NodeJS.Timeout | null>(null)

  // Format timestamp for display
  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return "Never"
    const date = new Date(timestamp)
    return `${date.toLocaleTimeString()}.${date.getMilliseconds().toString().padStart(3, "0")}`
  }

  // Calculate time difference
  const getTimeDiff = (timestamp: string | null) => {
    if (!timestamp) return "N/A"
    const diff = Date.now() - new Date(timestamp).getTime()
    if (diff < 1000) return `${diff}ms ago`
    if (diff < 60000) return `${Math.round(diff / 1000)}s ago`
    return `${Math.round(diff / 60000)}m ago`
  }

  // Load real data from all APIs with enhanced error handling
  const loadRealDashboardData = async (isAutoRefresh = false) => {
    try {
      setIsRefreshing(true)
      setLoading(true)
      setError(null)

      const refreshType = isAutoRefresh ? "Auto-refresh" : "Manual refresh"
      const currentRefreshCount = refreshCount + 1
      const refreshId = `refresh-${Date.now()}-${currentRefreshCount}`
      const dashboardTimestamp = new Date().toISOString()

      logger.info(`🔄 ${refreshType} #${currentRefreshCount} STARTED`, {
        refreshId,
        timestamp: dashboardTimestamp,
      })

      // Use Promise.allSettled for graceful error handling
      const startTime = Date.now()
      const [analyticsResult, projectsResult, statusResult] = await Promise.allSettled([
        apiClient.get("/api/analytics").catch((err) => ({
          success: false,
          error: err.message,
          data: {
            totalProjects: 0,
            activeProjects: 0,
            completedProjects: 0,
            avgProgress: 0,
            timestamp: dashboardTimestamp,
          },
        })),
        apiClient.get("/api/projects").catch((err) => ({
          success: false,
          error: err.message,
          data: {
            projects: [],
            stats: { total: 0, active: 0, completed: 0 },
            timestamp: dashboardTimestamp,
          },
        })),
        apiClient.get("/api/status").catch((err) => ({
          success: false,
          error: err.message,
          data: {
            status: "checking",
            timestamp: dashboardTimestamp,
          },
        })),
      ])
      const endTime = Date.now()

      // Extract data with fallbacks
      const newTimestamps: TimestampData = {
        analytics:
          analyticsResult.status === "fulfilled" && analyticsResult.value.success
            ? analyticsResult.value.data?.timestamp || dashboardTimestamp
            : dashboardTimestamp,
        projects:
          projectsResult.status === "fulfilled" && projectsResult.value.success
            ? projectsResult.value.data?.timestamp || dashboardTimestamp
            : dashboardTimestamp,
        status:
          statusResult.status === "fulfilled" && statusResult.value.success
            ? statusResult.value.data?.timestamp || dashboardTimestamp
            : dashboardTimestamp,
        dashboard: dashboardTimestamp,
        refreshId,
      }

      const dashboardData = {
        analytics: analyticsResult.status === "fulfilled" ? analyticsResult.value.data : null,
        projects: projectsResult.status === "fulfilled" ? projectsResult.value.data : null,
        status: statusResult.status === "fulfilled" ? statusResult.value.data : null,
        timestamp: dashboardTimestamp,
        refreshCount: currentRefreshCount,
        refreshType,
        refreshId,
        loadTime: endTime - startTime,
        timestamps: newTimestamps,
      }

      setRealData(dashboardData)
      setRefreshCount(currentRefreshCount)
      setLastRefresh(new Date())
      setNextRefresh(new Date(Date.now() + 30000))
      setTimestamps(newTimestamps)

      logger.info(`✅ ${refreshType} #${currentRefreshCount} COMPLETED`, {
        refreshId,
        loadTime: `${endTime - startTime}ms`,
        hasAnalytics: !!dashboardData.analytics,
        hasProjects: !!dashboardData.projects,
        hasStatus: !!dashboardData.status,
      })
    } catch (error: any) {
      logger.error("❌ Failed to load dashboard data", {
        error: error.message,
        refreshCount,
        timestamp: new Date().toISOString(),
      })
      setError(error.message)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  // Start countdown timer
  const startCountdown = () => {
    setCountdown(30)
    if (countdownRef.current) clearInterval(countdownRef.current)
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 30 : prev - 1))
    }, 1000)
  }

  // Start real-time clock
  const startClock = () => {
    if (clockRef.current) clearInterval(clockRef.current)
    clockRef.current = setInterval(() => {
      setCurrentTime(new Date())
    }, 100)
  }

  // Manual refresh handler
  const handleManualRefresh = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (countdownRef.current) clearInterval(countdownRef.current)

    loadRealDashboardData(false)

    intervalRef.current = setInterval(() => {
      loadRealDashboardData(true)
      startCountdown()
    }, 30000)

    startCountdown()
  }

  useEffect(() => {
    loadRealDashboardData(false)

    intervalRef.current = setInterval(() => {
      loadRealDashboardData(true)
      startCountdown()
    }, 30000)

    startCountdown()
    startClock()

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (countdownRef.current) clearInterval(countdownRef.current)
      if (clockRef.current) clearInterval(clockRef.current)
    }
  }, [])

  if (loading && refreshCount === 0) {
    return (
      <div className="min-h-screen bg-wolf-gradient">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal border-t-transparent mx-auto mb-6"></div>
            <div className="text-2xl font-bold text-wolf-heading mb-2">Wolf Platform Loading</div>
            <div className="text-slate-400">Initializing real-time dashboard...</div>
            <div className="text-slate-600 text-sm mt-2">
              Current time: {formatTimestamp(currentTime.toISOString())}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-wolf-gradient">
      <Navbar />

      <div className="container mx-auto px-6 py-8">
        {/* RESTORED BEAUTIFUL HEADER */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-teal to-dark-teal rounded-xl flex items-center justify-center wolf-shadow-lg">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <Crown className="absolute -top-2 -right-2 h-6 w-6 text-gold animate-wolf-pulse" />
              </div>
              <div>
                <h1 className="text-5xl font-bold text-wolf-heading metallic-shine mb-2">Wolf Platform Dashboard</h1>
                <p className="text-slate-300 text-lg">
                  Enterprise AI Management • Live Clock: {formatTimestamp(currentTime.toISOString())}
                </p>
                <p className="text-slate-500 text-sm">
                  Last updated: {formatTimestamp(timestamps.dashboard)} • Refresh #{refreshCount}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge className="badge-wolf-gold px-4 py-2">
                <Activity className="h-4 w-4 mr-2 animate-pulse" />
                LIVE DATA
              </Badge>
              <Badge
                className={`px-4 py-2 ${countdown <= 5 ? "badge-wolf bg-red-500/20 text-red-300 animate-pulse" : countdown <= 10 ? "bg-yellow-500/20 text-yellow-300" : "badge-wolf"}`}
              >
                <Clock className="h-4 w-4 mr-2" />
                Next: {countdown}s
              </Badge>
              <Button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="btn-wolf px-6 py-3 text-lg font-semibold"
              >
                <RefreshCw className={`h-5 w-5 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* LIVE MONITORING CARD - RESTORED DESIGN */}
        <Card className="mb-8 bg-wolf-card wolf-border wolf-shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-4 text-2xl text-wolf-heading">
              <Eye className="h-6 w-6 text-teal animate-wolf-glow" />
              Live System Monitor - Real-Time Data Streaming
              <Badge className="badge-wolf-gold">
                <Shield className="h-4 w-4 mr-2" />
                {isRefreshing ? "REFRESHING" : "MONITORING"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-teal">Live Clock</h3>
                <div className="bg-slate-800/50 rounded-lg p-4 wolf-border">
                  <div className="text-2xl font-mono text-teal mb-2">{formatTimestamp(currentTime.toISOString())}</div>
                  <div className="text-sm text-slate-400">System Time</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gold">Countdown</h3>
                <div className="bg-slate-800/50 rounded-lg p-4 wolf-border">
                  <div
                    className={`text-3xl font-bold mb-2 ${countdown <= 5 ? "text-red-400 animate-pulse" : countdown <= 10 ? "text-yellow-400" : "text-gold"}`}
                  >
                    {countdown}s
                  </div>
                  <div className="text-sm text-slate-400">Until Refresh</div>
                  <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-1000 ${
                        countdown <= 5 ? "bg-red-400" : countdown <= 10 ? "bg-yellow-400" : "bg-gold"
                      }`}
                      style={{ width: `${((30 - countdown) / 30) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-dark-teal">Data Status</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Analytics:</span>
                    <Badge className={realData.analytics ? "badge-wolf" : "bg-red-500/20 text-red-300"}>
                      {realData.analytics ? "Connected" : "Offline"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Projects:</span>
                    <Badge className={realData.projects ? "badge-wolf" : "bg-red-500/20 text-red-300"}>
                      {realData.projects ? "Connected" : "Offline"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">System:</span>
                    <Badge className={realData.status ? "badge-wolf" : "bg-red-500/20 text-red-300"}>
                      {realData.status ? "Healthy" : "Checking"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-purple-400">Performance</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Refreshes:</span>
                    <span className="text-purple-400 font-bold">{refreshCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Load Time:</span>
                    <span className="text-gold font-mono">{realData.loadTime || 0}ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Type:</span>
                    <Badge className={realData.refreshType?.includes("Auto") ? "badge-wolf" : "badge-wolf-gold"}>
                      {realData.refreshType || "Initial"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ERROR ALERT - ENHANCED DESIGN */}
        {error && (
          <Card className="mb-6 bg-red-500/10 border-2 border-red-400/50 wolf-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <AlertCircle className="h-6 w-6 text-red-400" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-300 mb-1">System Error Detected</h3>
                  <p className="text-red-200">{error}</p>
                </div>
                <Button onClick={handleManualRefresh} className="bg-red-500 hover:bg-red-600 text-white">
                  Retry Connection
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* BEAUTIFUL METRICS CARDS - RESTORED */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 wolf-border wolf-shadow animate-wolf-glow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-cyan-300">
                <span>Total Projects</span>
                <TrendingUp className="h-5 w-5" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-cyan-400 mb-2">
                {realData.analytics?.totalProjects || realData.projects?.stats?.total || 0}
              </div>
              <p className="text-xs text-cyan-200">
                Updated: {formatTimestamp(timestamps.analytics || timestamps.projects)}
              </p>
              <p className="text-xs text-slate-500">{getTimeDiff(timestamps.analytics || timestamps.projects)}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 wolf-border wolf-shadow animate-wolf-glow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-emerald-300">
                <span>Active Projects</span>
                <Activity className="h-5 w-5" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-emerald-400 mb-2">
                {realData.analytics?.activeProjects || realData.projects?.stats?.active || 0}
              </div>
              <p className="text-xs text-emerald-200">
                Refresh #{refreshCount} • {formatTimestamp(timestamps.projects)}
              </p>
              <p className="text-xs text-slate-500">{getTimeDiff(timestamps.projects)}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 wolf-border wolf-shadow animate-wolf-glow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-purple-300">
                <span>System Status</span>
                <CheckCircle className="h-5 w-5" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-purple-400 mb-2">
                {realData.status?.status === "healthy" ? "HEALTHY" : "ONLINE"}
              </div>
              <p className="text-xs text-purple-200">Status: {formatTimestamp(timestamps.status)}</p>
              <p className="text-xs text-slate-500">{getTimeDiff(timestamps.status)}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gold/20 to-yellow-500/20 wolf-border wolf-shadow animate-wolf-glow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-gold">
                <span>Performance</span>
                <Zap className="h-5 w-5" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-gold mb-2">
                {realData.loadTime ? `${realData.loadTime}ms` : "N/A"}
              </div>
              <p className="text-xs text-yellow-200">Load Time</p>
              <p className="text-xs text-slate-500">{isRefreshing ? "Refreshing..." : "Ready"}</p>
            </CardContent>
          </Card>
        </div>

        {/* ENHANCED TABS - RESTORED DESIGN */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8 bg-gradient-to-r from-gunmetal to-dark-gunmetal wolf-border p-2">
            <TabsTrigger
              value="overview"
              className="text-white data-[state=active]:bg-teal data-[state=active]:text-white"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="customizable"
              className="text-white data-[state=active]:bg-teal data-[state=active]:text-white"
            >
              Customizable
            </TabsTrigger>
            <TabsTrigger
              value="projects"
              className="text-white data-[state=active]:bg-teal data-[state=active]:text-white"
            >
              Projects
            </TabsTrigger>
            <TabsTrigger
              value="collaborative"
              className="text-white data-[state=active]:bg-teal data-[state=active]:text-white"
            >
              Collaborative
            </TabsTrigger>
            <TabsTrigger value="ai" className="text-white data-[state=active]:bg-teal data-[state=active]:text-white">
              AI Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-6">
              {/* BEAUTIFUL PROJECT CARDS */}
              {realData.projects?.projects && realData.projects.projects.length > 0 ? (
                <Card className="bg-wolf-card wolf-border wolf-shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-4 text-2xl text-wolf-heading">
                      <Rocket className="h-6 w-6 text-purple-400 animate-wolf-pulse" />
                      Live Project Data
                      <Badge className="badge-wolf-gold">{realData.projects.projects.length} Projects</Badge>
                      <Badge className="badge-wolf">Data: {formatTimestamp(timestamps.projects)}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {realData.projects.projects.slice(0, 6).map((project: any) => (
                        <Card
                          key={project.id}
                          className="bg-slate-800/50 wolf-border hover:wolf-shadow-lg transition-all duration-300"
                        >
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg text-teal">{project.name}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-slate-300">Status:</span>
                                <Badge className="badge-wolf">{project.status}</Badge>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-slate-300">Progress:</span>
                                <span className="text-teal font-bold">{project.progress || 0}%</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-slate-300">Priority:</span>
                                <Badge className="badge-wolf-gold">{project.priority}</Badge>
                              </div>
                              <div className="progress-wolf rounded-full h-2">
                                <div
                                  className="h-2 rounded-full bg-gradient-to-r from-teal to-gold transition-all duration-500"
                                  style={{ width: `${project.progress || 0}%` }}
                                ></div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-wolf-card wolf-border wolf-shadow-lg">
                  <CardContent className="p-12 text-center">
                    <Database className="h-16 w-16 text-slate-400 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-wolf-heading mb-4">No Projects Found</h3>
                    <p className="text-slate-400 mb-6 text-lg">
                      Create your first project to get started with the Wolf Platform.
                    </p>
                    <p className="text-sm text-slate-500 mb-6">
                      Last checked: {formatTimestamp(timestamps.projects)} ({getTimeDiff(timestamps.projects)})
                    </p>
                    <Button onClick={() => setActiveTab("projects")} className="btn-wolf px-8 py-3 text-lg">
                      <Rocket className="h-5 w-5 mr-2" />
                      Create Project
                    </Button>
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
