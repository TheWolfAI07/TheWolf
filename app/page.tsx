"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Activity,
  BarChart3,
  CheckCircle,
  Database,
  Globe,
  Settings,
  RefreshCw,
  TrendingUp,
  Clock,
  Star,
  Crown,
  Zap,
  Shield,
  Dog,
} from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const [loading, setLoading] = useState(true)
  const [systemStatus, setSystemStatus] = useState({
    status: "healthy",
    message: "🐺 Wolf Platform Ready",
    version: "2.0.0",
    environment: {
      nodeEnv: "production",
      hasSupabaseUrl: true,
      hasSupabaseKey: true,
      platform: "vercel",
    },
  })

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-slate-900 to-slate-800">
        <div className="text-center relative">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-full blur-xl animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-slate-800 to-slate-700 p-6 rounded-full border border-cyan-400/30 shadow-2xl shadow-cyan-500/20">
              <Dog className="h-16 w-16 mx-auto text-cyan-400 animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <RefreshCw className="h-6 w-6 animate-spin text-yellow-400" />
              </div>
            </div>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent mb-4">
            🐺 Wolf Platform
          </h2>
          <p className="text-xl text-slate-300 mb-2">Initializing Enterprise Platform...</p>
          <p className="text-sm text-slate-400 mb-6">Loading luxury components</p>
          <div className="w-80 mx-auto mb-4">
            <Progress value={75} className="h-2 bg-slate-700" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-slate-800 text-white">
      {/* Floating particles */}
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
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-slate-700 bg-gradient-to-r from-slate-900/90 to-slate-800/90 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Crown className="absolute -top-1 -right-1 h-4 w-4 text-yellow-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Wolf Platform
                </h1>
                <p className="text-xs text-yellow-400">LUXURY EDITION</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/50">
                <CheckCircle className="h-3 w-3 mr-1" />
                LIVE
              </Badge>
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="border-cyan-400/50 text-cyan-300 hover:bg-cyan-400/10">
                  Dashboard
                </Button>
              </Link>
              <Link href="/console">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                >
                  Console
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="container mx-auto text-center relative z-10">
          <div className="mb-8">
            <div className="flex items-center justify-center mb-6">
              <div>
                <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  Wolf Platform
                </h1>
                <p className="text-lg text-yellow-400 font-semibold mt-2">ENTERPRISE EDITION</p>
              </div>
            </div>

            <p className="text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto mb-8 leading-relaxed">
              Next-generation AI-powered platform management with{" "}
              <span className="text-cyan-400 font-semibold">real-time analytics</span>,{" "}
              <span className="text-yellow-400 font-semibold">intelligent automation</span>, and{" "}
              <span className="text-blue-400 font-semibold">enterprise-grade infrastructure</span>.
            </p>

            {/* Feature Badges */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Badge className="bg-gradient-to-r from-slate-800/90 to-slate-700/90 backdrop-blur-sm text-cyan-300 border border-cyan-400/50 px-6 py-3 text-sm shadow-lg shadow-cyan-500/20">
                <Zap className="h-4 w-4 mr-2 text-yellow-400" />
                Real-time Analytics
              </Badge>
              <Badge className="bg-gradient-to-r from-slate-800/90 to-slate-700/90 backdrop-blur-sm text-cyan-300 border border-yellow-400/50 px-6 py-3 text-sm shadow-lg shadow-yellow-500/20">
                <Zap className="h-4 w-4 mr-2 text-yellow-400" />
                AI-Powered Insights
              </Badge>
              <Badge className="bg-gradient-to-r from-slate-800/90 to-slate-700/90 backdrop-blur-sm text-cyan-300 border border-pink-400/50 px-6 py-3 text-sm shadow-lg shadow-pink-500/20">
                <Shield className="h-4 w-4 mr-2 text-pink-400" />
                Enterprise Security
              </Badge>
              <Badge className="bg-gradient-to-r from-slate-800/90 to-slate-700/90 backdrop-blur-sm text-cyan-300 border border-cyan-400/50 px-6 py-3 text-sm shadow-lg shadow-cyan-500/20">
                <Database className="h-4 w-4 mr-2 text-cyan-400" />
                Database Powered
              </Badge>
            </div>
          </div>

          {/* System Status */}
          <div className="mb-8">
            <Card className="max-w-4xl mx-auto bg-gradient-to-r from-slate-800/90 to-slate-700/90 backdrop-blur-sm border-2 border-cyan-400/30 text-white shadow-2xl shadow-cyan-500/20">
              <CardContent className="pt-8">
                <div className="flex items-center justify-center gap-6 mb-8">
                  <CheckCircle className="h-6 w-6 text-emerald-400" />
                  <span className="font-bold text-2xl text-cyan-300">{systemStatus.message}</span>
                  <Badge className="border-2 border-yellow-400/50 text-yellow-300 bg-yellow-400/10 shadow-lg shadow-yellow-500/20 px-4 py-2">
                    <Star className="h-4 w-4 mr-1" />v{systemStatus.version}
                  </Badge>
                  <Badge className="border-2 border-emerald-400/50 text-emerald-300 bg-emerald-400/10 shadow-lg shadow-emerald-500/20 px-4 py-2">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    DEPLOYED
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm mb-6">
                  <div className="text-center p-4 bg-gradient-to-r from-slate-700/50 to-slate-600/50 rounded-xl border border-cyan-400/30">
                    <CheckCircle className="h-6 w-6 mx-auto mb-3 text-emerald-400" />
                    <p className="font-semibold text-cyan-300">Environment</p>
                    <p className="text-xs text-slate-300">{systemStatus.environment.nodeEnv}</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-slate-700/50 to-slate-600/50 rounded-xl border border-emerald-400/30">
                    <CheckCircle className="h-6 w-6 mx-auto mb-3 text-emerald-400" />
                    <p className="font-semibold text-cyan-300">Platform</p>
                    <p className="text-xs text-slate-300">{systemStatus.environment.platform}</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-slate-700/50 to-slate-600/50 rounded-xl border border-blue-400/30">
                    <CheckCircle className="h-6 w-6 mx-auto mb-3 text-emerald-400" />
                    <p className="font-semibold text-cyan-300">Status</p>
                    <p className="text-xs text-slate-300">Operational</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-slate-700/50 to-slate-600/50 rounded-xl border border-yellow-400/30">
                    <CheckCircle className="h-6 w-6 mx-auto mb-3 text-emerald-400" />
                    <p className="font-semibold text-cyan-300">Version</p>
                    <p className="text-xs text-slate-300">Latest</p>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-400">
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-cyan-400" />
                    Updated: {new Date().toLocaleTimeString()}
                  </span>
                  <span className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-blue-400" />
                    Global CDN
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

      {/* Stats Section */}
      <section className="py-16 px-6 relative z-10">
        <div className="container mx-auto">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card className="hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 border-2 border-cyan-400/30 bg-gradient-to-r from-slate-800/90 to-slate-700/90 backdrop-blur-sm hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-cyan-300">Platform Status</CardTitle>
                <Activity className="h-5 w-5 text-yellow-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-400">LIVE</div>
                <p className="text-xs text-slate-400">Fully operational</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 border-2 border-emerald-400/30 bg-gradient-to-r from-slate-800/90 to-slate-700/90 backdrop-blur-sm hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-cyan-300">Deployment</CardTitle>
                <CheckCircle className="h-5 w-5 text-yellow-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-400">SUCCESS</div>
                <p className="text-xs text-slate-400">Latest version deployed</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 border-2 border-purple-400/30 bg-gradient-to-r from-slate-800/90 to-slate-700/90 backdrop-blur-sm hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-cyan-300">Performance</CardTitle>
                <TrendingUp className="h-5 w-5 text-yellow-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-400">99%</div>
                <Progress value={99} className="mt-3 h-2 bg-slate-700" />
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-300 border-2 border-orange-400/30 bg-gradient-to-r from-slate-800/90 to-slate-700/90 backdrop-blur-sm hover:scale-105">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-cyan-300">Uptime</CardTitle>
                <Clock className="h-5 w-5 text-yellow-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-400">100%</div>
                <p className="text-xs text-slate-400">24/7 availability</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-slate-700 bg-gradient-to-r from-slate-900 to-slate-800 relative z-10">
        <div className="container mx-auto text-center">
          <p className="text-sm text-slate-400">
            🐺 Wolf Platform v{systemStatus.version} ENTERPRISE EDITION - Deployed Successfully
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise platform management solution • {new Date().toLocaleDateString()}
          </p>
        </div>
      </footer>
    </div>
  )
}
