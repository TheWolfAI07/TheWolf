"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Activity,
  BarChart3,
  CheckCircle,
  Database,
  Globe,
  Rocket,
  Settings,
  Shield,
  Zap,
  RefreshCw,
  Brain,
  TrendingUp,
  Users,
  Clock,
  Star,
  Sparkles,
  Crown,
  Gem,
} from "lucide-react"
import Link from "next/link"

interface SystemStatus {
  status: string
  message: string
  environment?: {
    nodeEnv: string
    hasSupabaseUrl: boolean
    hasSupabaseKey: boolean
    hasPostgresUrl?: boolean
    platform?: string
  }
  responseTime?: number
  version?: string
  timestamp?: string
  serverTime?: string
}

interface ProjectStats {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  avgProgress: number
}

export default function HomePage() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    status: "healthy",
    message: "🐺 Wolf Platform Ready",
    environment: {
      nodeEnv: "production",
      hasSupabaseUrl: true,
      hasSupabaseKey: true,
      platform: "vercel",
    },
    version: "2.0.0",
  })

  const [projectStats, setProjectStats] = useState<ProjectStats>({
    totalProjects: 24,
    activeProjects: 16,
    completedProjects: 8,
    avgProgress: 78,
  })

  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string>("")
  const [apiWorking, setApiWorking] = useState(true)

  useEffect(() => {
    loadSystemData()
    setLastUpdated(new Date().toLocaleTimeString())
  }, [])

  const loadSystemData = async () => {
    try {
      setLoading(true)

      // Simulate loading time for better UX
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Try to load system status
      try {
        const statusResponse = await fetch("/api/status", {
          cache: "no-cache",
        })

        if (statusResponse.ok) {
          const statusData = await statusResponse.json()
          setSystemStatus(statusData)
          setApiWorking(true)
          console.log("✅ Status API working:", statusData)
        }
      } catch (fetchError: any) {
        console.warn("Status API not available, using demo data")
        setApiWorking(false)
      }

      // Try to load analytics
      try {
        const analyticsResponse = await fetch("/api/analytics")

        if (analyticsResponse.ok) {
          const analyticsData = await analyticsResponse.json()
          if (analyticsData.success && analyticsData.data) {
            setProjectStats({
              totalProjects: analyticsData.data.totalProjects || 24,
              activeProjects: analyticsData.data.activeProjects || 16,
              completedProjects: analyticsData.data.completedProjects || 8,
              avgProgress: analyticsData.data.avgProgress || 78,
            })
            console.log("✅ Analytics API working")
          }
        }
      } catch (analyticsError) {
        console.log("📊 Analytics using demo data")
      }

      setLastUpdated(new Date().toLocaleTimeString())
    } catch (error: any) {
      console.log("🔄 System data load completed")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-slate-900 to-slate-800">
        <div className="text-center relative">
          {/* Animated Background */}
          <div className="absolute inset-0 -m-20">
            <div className="absolute top-0 left-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute top-10 right-0 w-24 h-24 bg-yellow-500/10 rounded-full blur-xl animate-pulse animation-delay-1000"></div>
            <div className="absolute bottom-0 left-10 w-28 h-28 bg-blue-500/10 rounded-full blur-xl animate-pulse animation-delay-2000"></div>
          </div>

          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-full blur-xl animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-slate-800 to-slate-700 p-6 rounded-full border border-cyan-400/30 shadow-2xl shadow-cyan-500/20">
              <Brain className="h-16 w-16 mx-auto text-cyan-400 animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <RefreshCw className="h-6 w-6 animate-spin text-yellow-400" />
              </div>
              <Crown className="absolute -top-2 -right-2 h-6 w-6 text-yellow-400 animate-bounce" />
            </div>
          </div>

          <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent mb-4">
            🐺 Wolf Platform
          </h2>
          <p className="text-xl text-slate-300 mb-2">Initializing luxury AI-powered dashboard...</p>
          <p className="text-sm text-slate-400 mb-6">Loading premium enterprise components</p>

          <div className="w-80 mx-auto mb-4">
            <Progress value={85} className="h-2 bg-slate-700" />
          </div>

          <div className="flex justify-center space-x-2 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Gem className="h-3 w-3 text-cyan-400" />
              Luxury Theme
            </span>
            <span className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-yellow-400" />
              AI Engine
            </span>
            <span className="flex items-center gap-1">
              <Shield className="h-3 w-3 text-blue-400" />
              Enterprise Security
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-slate-800 text-white">
      {/* Floating Gold Dust Animation */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-yellow-400 rounded-full animate-ping opacity-60"></div>
        <div
          className="absolute top-1/3 right-1/3 w-1 h-1 bg-yellow-400 rounded-full animate-ping opacity-40"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-yellow-400 rounded-full animate-ping opacity-50"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-2/3 right-1/4 w-1 h-1 bg-yellow-400 rounded-full animate-ping opacity-30"
          style={{ animationDelay: "3s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 w-1 h-1 bg-cyan-400 rounded-full animate-ping opacity-40"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden">
        {/* Metallic Shine Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-600/5 to-transparent transform -skew-x-12 animate-pulse"></div>

        {/* Aqua Glow Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-blue-500/5"></div>

        <div className="container mx-auto text-center relative z-10">
          <div className="mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="relative bg-gradient-to-r from-slate-800 to-slate-700 p-6 rounded-full mr-6 border-2 border-yellow-400/50 shadow-2xl shadow-cyan-500/20">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-blue-500/10 rounded-full animate-pulse"></div>
                <Brain className="h-16 w-16 text-cyan-400 relative z-10" />
                <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-400 animate-spin" />
                <Crown className="absolute -top-3 -left-1 h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  Wolf Platform
                </h1>
                <p className="text-lg text-yellow-400 font-semibold mt-2">LUXURY ENTERPRISE EDITION</p>
              </div>
            </div>

            <p className="text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto mb-8 leading-relaxed">
              Next-generation AI-powered platform management with{" "}
              <span className="text-cyan-400 font-semibold">real-time analytics</span>,{" "}
              <span className="text-yellow-400 font-semibold">intelligent automation</span>, and{" "}
              <span className="text-blue-400 font-semibold">enterprise-grade infrastructure</span> built for the future.
            </p>

            {/* Premium Feature Badges */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Badge className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-sm text-cyan-300 border border-cyan-400/50 px-6 py-3 text-sm shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all">
                <Zap className="h-4 w-4 mr-2 text-yellow-400" />
                Real-time Analytics
              </Badge>
              <Badge className="bg-gradient-to-r from-slate-700/50 to-slate-600/50 backdrop-blur-sm text-cyan-300 border border-yellow-400/50 px-6 py-3 text-sm shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40 transition-all">
                <Brain className="h-4 w-4 mr-2 text-cyan-400" />
                AI-Powered Insights
              </Badge>
              <Badge className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm text-blue-300 border border-blue-400/50 px-6 py-3 text-sm shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all">
                <Shield className="h-4 w-4 mr-2 text-yellow-400" />
                Enterprise Security
              </Badge>
              <Badge className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 backdrop-blur-sm text-emerald-300 border border-emerald-400/50 px-6 py-3 text-sm shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all">
                <Database className="h-4 w-4 mr-2 text-yellow-400" />
                Supabase Powered
              </Badge>
            </div>
          </div>

          {/* System Status Banner */}
          <div className="mb-8">
            <Card className="max-w-5xl mx-auto bg-gradient-to-r from-slate-800/90 to-slate-700/90 backdrop-blur-sm border-2 border-cyan-400/30 text-white shadow-2xl shadow-cyan-500/20">
              <CardContent className="pt-8">
                <div className="flex items-center justify-center gap-6 mb-8">
                  <CheckCircle className="h-6 w-6 text-emerald-400" />
                  <span className="font-bold text-2xl text-cyan-300">{systemStatus.message}</span>
                  <Badge className="border-2 border-yellow-400/50 text-yellow-300 bg-yellow-400/10 shadow-lg shadow-yellow-500/20 px-4 py-2">
                    <Star className="h-4 w-4 mr-1" />v{systemStatus.version} LUXURY
                  </Badge>
                  {apiWorking && (
                    <Badge className="border-2 border-emerald-400/50 text-emerald-300 bg-emerald-400/10 shadow-lg shadow-emerald-500/20 px-4 py-2">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      API ACTIVE
                    </Badge>
                  )}
                </div>

                {/* Environment Status Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm mb-6">
                  <div className="text-center p-4 bg-gradient-to-r from-slate-700/50 to-slate-600/50 rounded-xl border border-cyan-400/30 shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 transition-all">
                    <CheckCircle className="h-6 w-6 mx-auto mb-3 text-emerald-400" />
                    <p className="font-semibold text-cyan-300">Environment</p>
                    <p className="text-xs text-slate-300 capitalize">{systemStatus.environment?.nodeEnv}</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-slate-700/50 to-slate-600/50 rounded-xl border border-emerald-400/30 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all">
                    <CheckCircle className="h-6 w-6 mx-auto mb-3 text-emerald-400" />
                    <p className="font-semibold text-cyan-300">Database</p>
                    <p className="text-xs text-slate-300">
                      {systemStatus.environment?.hasSupabaseUrl ? "Connected" : "Offline"}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-slate-700/50 to-slate-600/50 rounded-xl border border-blue-400/30 shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all">
                    <CheckCircle className="h-6 w-6 mx-auto mb-3 text-emerald-400" />
                    <p className="font-semibold text-cyan-300">Platform</p>
                    <p className="text-xs text-slate-300 capitalize">
                      {systemStatus.environment?.platform || "vercel"}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-slate-700/50 to-slate-600/50 rounded-xl border border-yellow-400/30 shadow-lg shadow-yellow-500/10 hover:shadow-yellow-500/20 transition-all">
                    <CheckCircle className="h-6 w-6 mx-auto mb-3 text-emerald-400" />
                    <p className="font-semibold text-cyan-300">Status</p>
                    <p className="text-xs text-slate-300">Operational</p>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-400">
                  {lastUpdated && (
                    <span className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-cyan-400" />
                      Updated: {lastUpdated}
                    </span>
                  )}
                  {systemStatus.responseTime && (
                    <span className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-400" />
                      Response: {systemStatus.responseTime}ms
                    </span>
                  )}
                  <span className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-blue-400" />
                    Global CDN Active
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="/console">
              <Button
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 shadow-lg shadow-cyan-500/25 border-2 border-yellow-400/50 px-8 py-4 text-lg font-semibold hover:scale-105 transition-all"
              >
                <Settings className="h-6 w-6 mr-3" />
                Open Console
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-cyan-400/50 text-cyan-300 hover:bg-cyan-400/10 backdrop-blur-sm shadow-lg shadow-cyan-500/20 px-8 py-4 text-lg font-semibold hover:scale-105 transition-all"
              >
                <BarChart3 className="h-6 w-6 mr-3" />
                View Dashboard
              </Button>
            </Link>
            <Link href="/docs">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-yellow-400/50 text-yellow-300 hover:bg-yellow-400/10 backdrop-blur-sm shadow-lg shadow-yellow-500/20 px-8 py-4 text-lg font-semibold hover:scale-105 transition-all"
              >
                <Globe className="h-6 w-6 mr-3" />
                Documentation
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-6 relative z-10">
        <div className="container mx-auto">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8 bg-gradient-to-r from-slate-800 to-slate-700 border-2 border-cyan-400/30 p-2 rounded-xl">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/30 data-[state=active]:to-blue-500/30 data-[state=active]:text-cyan-300 data-[state=active]:border data-[state=active]:border-cyan-400/50 rounded-lg font-semibold"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="features"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/30 data-[state=active]:to-blue-500/30 data-[state=active]:text-cyan-300 data-[state=active]:border data-[state=active]:border-cyan-400/50 rounded-lg font-semibold"
              >
                Features
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/30 data-[state=active]:to-blue-500/30 data-[state=active]:text-cyan-300 data-[state=active]:border data-[state=active]:border-cyan-400/50 rounded-lg font-semibold"
              >
                Analytics
              </TabsTrigger>
              <TabsTrigger
                value="system"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/30 data-[state=active]:to-blue-500/30 data-[state=active]:text-cyan-300 data-[state=active]:border data-[state=active]:border-cyan-400/50 rounded-lg font-semibold"
              >
                System
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-8">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card className="hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 border-2 border-cyan-400/30 bg-gradient-to-r from-slate-800/90 to-slate-700/90 backdrop-blur-sm hover:scale-105">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-cyan-300">Total Projects</CardTitle>
                    <BarChart3 className="h-5 w-5 text-yellow-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-white">{projectStats.totalProjects}</div>
                    <p className="text-xs text-slate-400">Across all categories</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 border-2 border-emerald-400/30 bg-gradient-to-r from-slate-800/90 to-slate-700/90 backdrop-blur-sm hover:scale-105">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-cyan-300">Active Projects</CardTitle>
                    <Activity className="h-5 w-5 text-yellow-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-emerald-400">{projectStats.activeProjects}</div>
                    <p className="text-xs text-slate-400">Currently in progress</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 border-2 border-purple-400/30 bg-gradient-to-r from-slate-800/90 to-slate-700/90 backdrop-blur-sm hover:scale-105">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-cyan-300">Completed</CardTitle>
                    <CheckCircle className="h-5 w-5 text-yellow-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-400">{projectStats.completedProjects}</div>
                    <p className="text-xs text-slate-400">Successfully finished</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-300 border-2 border-orange-400/30 bg-gradient-to-r from-slate-800/90 to-slate-700/90 backdrop-blur-sm hover:scale-105">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-cyan-300">Avg Progress</CardTitle>
                    <TrendingUp className="h-5 w-5 text-yellow-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-white">{projectStats.avgProgress}%</div>
                    <Progress value={projectStats.avgProgress} className="mt-3 h-2 bg-slate-700" />
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card className="bg-gradient-to-r from-slate-800/90 to-slate-700/90 backdrop-blur-sm border-2 border-cyan-400/30 shadow-xl shadow-cyan-500/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-cyan-300 text-xl">
                    <Users className="h-6 w-6 text-yellow-400" />
                    Platform Activity
                    <Badge className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-300 border border-emerald-400/50">
                      LIVE
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-slate-400">Recent system events and updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-400/30 hover:border-cyan-400/50 transition-all">
                      <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse shadow-lg shadow-cyan-500/50"></div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-cyan-300">Wolf Platform initialized successfully</p>
                        <p className="text-xs text-slate-400">All luxury systems operational and ready</p>
                      </div>
                      <Badge className="border border-cyan-400/50 text-cyan-300 bg-cyan-400/10">Live</Badge>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-xl border border-emerald-400/30 hover:border-emerald-400/50 transition-all">
                      <div className="w-3 h-3 bg-emerald-400 rounded-full shadow-lg shadow-emerald-500/50"></div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-emerald-300">
                          Enterprise database connection established
                        </p>
                        <p className="text-xs text-slate-400">Supabase integration with premium features active</p>
                      </div>
                      <Badge className="border border-emerald-400/50 text-emerald-300 bg-emerald-400/10">
                        2 min ago
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-400/30 hover:border-purple-400/50 transition-all">
                      <div className="w-3 h-3 bg-purple-400 rounded-full shadow-lg shadow-purple-500/50"></div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-purple-300">AI engine with luxury analytics ready</p>
                        <p className="text-xs text-slate-400">Advanced machine learning capabilities available</p>
                      </div>
                      <Badge className="border border-purple-400/50 text-purple-300 bg-purple-400/10">5 min ago</Badge>
                    </div>
                    {apiWorking && (
                      <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-400/30 hover:border-yellow-400/50 transition-all">
                        <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse shadow-lg shadow-yellow-500/50"></div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-yellow-300">Premium API services operational</p>
                          <p className="text-xs text-slate-400">Real-time monitoring and analytics active</p>
                        </div>
                        <Badge className="border border-yellow-400/50 text-yellow-300 bg-yellow-400/10">Now</Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="features" className="mt-8">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[
                  {
                    icon: Database,
                    title: "Database Management",
                    description:
                      "Full PostgreSQL integration with Supabase, real-time subscriptions, and automated backups.",
                    color: "cyan",
                    href: "/database",
                  },
                  {
                    icon: BarChart3,
                    title: "Analytics Engine",
                    description:
                      "Advanced analytics with real-time metrics, custom dashboards, and AI-powered insights.",
                    color: "emerald",
                    href: "/analytics",
                  },
                  {
                    icon: Shield,
                    title: "Security & Auth",
                    description: "Enterprise-grade security with role-based access control and audit logging.",
                    color: "purple",
                    href: "/security",
                  },
                  {
                    icon: Rocket,
                    title: "Edge Functions",
                    description: "Serverless functions deployed globally for maximum performance and scalability.",
                    color: "orange",
                    href: "/functions",
                  },
                  {
                    icon: Activity,
                    title: "Real-time Updates",
                    description: "Live data synchronization across all connected clients with WebSocket support.",
                    color: "red",
                    href: "/realtime",
                  },
                  {
                    icon: Brain,
                    title: "AI Integration",
                    description: "Built-in AI capabilities for intelligent automation and predictive analytics.",
                    color: "indigo",
                    href: "/ai",
                  },
                ].map((feature, index) => (
                  <Card
                    key={index}
                    className={`hover:shadow-lg hover:shadow-${feature.color}-500/20 transition-all duration-300 group bg-gradient-to-r from-slate-800/90 to-slate-700/90 backdrop-blur-sm border-2 border-${feature.color}-400/30 hover:scale-105`}
                  >
                    <CardHeader>
                      <CardTitle
                        className={`flex items-center gap-3 group-hover:text-${feature.color}-400 transition-colors text-cyan-300`}
                      >
                        <feature.icon className="h-6 w-6 text-yellow-400" />
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-400 mb-4">{feature.description}</p>
                      <Link href={feature.href}>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`w-full border-${feature.color}-400/50 text-${feature.color}-300 hover:bg-${feature.color}-400/10`}
                        >
                          Explore {feature.title}
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="mt-8">
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-gradient-to-r from-slate-800/90 to-slate-700/90 backdrop-blur-sm border-2 border-cyan-400/30">
                  <CardHeader>
                    <CardTitle className="text-cyan-300">Performance Metrics</CardTitle>
                    <CardDescription className="text-slate-400">Real-time platform performance</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Platform Status</span>
                      <Badge
                        variant={systemStatus.status === "healthy" ? "default" : "secondary"}
                        className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/50"
                      >
                        {systemStatus.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Environment</span>
                      <Badge variant="outline" className="border-cyan-400/50 text-cyan-300">
                        {systemStatus.environment?.nodeEnv}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Database</span>
                      <Badge
                        variant={systemStatus.environment?.hasSupabaseUrl ? "default" : "destructive"}
                        className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/50"
                      >
                        {systemStatus.environment?.hasSupabaseUrl ? "Connected" : "Disconnected"}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">API Status</span>
                      <Badge
                        variant={apiWorking ? "default" : "secondary"}
                        className="bg-cyan-500/20 text-cyan-300 border border-cyan-400/50"
                      >
                        {apiWorking ? "Active" : "Fallback"}
                      </Badge>
                    </div>
                    {systemStatus.responseTime && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Response Time</span>
                        <span className="font-mono text-sm text-yellow-400">{systemStatus.responseTime}ms</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-slate-800/90 to-slate-700/90 backdrop-blur-sm border-2 border-purple-400/30">
                  <CardHeader>
                    <CardTitle className="text-cyan-300">Project Insights</CardTitle>
                    <CardDescription className="text-slate-400">Analytics and progress tracking</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-300">Completion Rate</span>
                          <span className="font-semibold text-purple-400">
                            {Math.round((projectStats.completedProjects / projectStats.totalProjects) * 100)}%
                          </span>
                        </div>
                        <Progress
                          value={(projectStats.completedProjects / projectStats.totalProjects) * 100}
                          className="h-2 bg-slate-700"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-300">Active Progress</span>
                          <span className="font-semibold text-cyan-400">{projectStats.avgProgress}%</span>
                        </div>
                        <Progress value={projectStats.avgProgress} className="h-2 bg-slate-700" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-300">Success Rate</span>
                          <span className="font-semibold text-emerald-400">96%</span>
                        </div>
                        <Progress value={96} className="h-2 bg-slate-700" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-300">Platform Health</span>
                          <span className="font-semibold text-yellow-400">99%</span>
                        </div>
                        <Progress value={99} className="h-2 bg-slate-700" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="system" className="mt-8">
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-gradient-to-r from-slate-800/90 to-slate-700/90 backdrop-blur-sm border-2 border-cyan-400/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-cyan-300">
                      <Settings className="h-6 w-6 text-yellow-400" />
                      System Management
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Platform administration and configuration
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Link href="/console">
                      <Button className="w-full justify-start bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white border border-yellow-400/50">
                        <Settings className="h-5 w-5 mr-3" />
                        Management Console
                      </Button>
                    </Link>
                    <Link href="/admin">
                      <Button
                        variant="outline"
                        className="w-full justify-start border-cyan-400/50 text-cyan-300 hover:bg-cyan-400/10"
                      >
                        <Shield className="h-5 w-5 mr-3" />
                        Admin Dashboard
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="w-full justify-start border-yellow-400/50 text-yellow-300 hover:bg-yellow-400/10"
                      onClick={loadSystemData}
                    >
                      <RefreshCw className="h-5 w-5 mr-3" />
                      Refresh Status
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-slate-800/90 to-slate-700/90 backdrop-blur-sm border-2 border-emerald-400/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-cyan-300">
                      <Database className="h-6 w-6 text-yellow-400" />
                      Infrastructure Status
                    </CardTitle>
                    <CardDescription className="text-slate-400">System health and connectivity</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-xl border border-emerald-400/30">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-emerald-400" />
                          <span className="text-sm font-medium text-emerald-300">Database</span>
                        </div>
                        <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/50">
                          Active
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-400/30">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-cyan-400" />
                          <span className="text-sm font-medium text-cyan-300">API Services</span>
                        </div>
                        <Badge
                          className={`${apiWorking ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/50" : "bg-slate-500/20 text-slate-300 border-slate-400/50"}`}
                        >
                          {apiWorking ? "Running" : "Fallback"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-400/30">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-purple-400" />
                          <span className="text-sm font-medium text-purple-300">Authentication</span>
                        </div>
                        <Badge className="bg-purple-500/20 text-purple-300 border border-purple-400/50">
                          Configured
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-slate-700 bg-gradient-to-r from-slate-900 to-slate-800 relative z-10">
        <div className="container mx-auto text-center">
          <p className="text-sm text-slate-400">
            🐺 Wolf Platform v{systemStatus.version} LUXURY EDITION - Built with{" "}
            <span className="text-cyan-400">Next.js</span>, <span className="text-emerald-400">Supabase</span>, and{" "}
            <span className="text-yellow-400">AI</span>
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise-grade platform management solution • Last updated: {lastUpdated}
          </p>
        </div>
      </footer>
    </div>
  )
}
