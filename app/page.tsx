"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuthContext } from "@/components/auth/auth-provider"
import { ArrowRight, BarChart3, Wallet, Terminal, Shield, Zap, Globe, Sparkles } from "lucide-react"

export default function HomePage() {
  const { user, loading } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard/wolf-grid")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-black font-bold text-xl">W</span>
          </div>
          <p className="text-cyan-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return null // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-700 bg-black/40 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-xl flex items-center justify-center">
                <span className="text-black font-bold text-xl">W</span>
              </div>
              <span className="text-white font-bold text-2xl">Wolf</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/signin">
                <Button variant="ghost" className="text-slate-300 hover:text-white">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-black">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <Badge className="mb-6 bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
            <Sparkles className="w-4 h-4 mr-2" />
            Next-Generation Platform
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            The Ultimate
            <span className="bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent"> Wolf </span>
            Platform
          </h1>
          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
            Advanced crypto tracking, real-time analytics, powerful console tools, and intelligent project management -
            all in one unified platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-black"
              >
                Start Building
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/docs">
              <Button size="lg" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                View Documentation
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Everything You Need to Succeed</h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Powerful tools and features designed for modern developers and crypto enthusiasts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Crypto Dashboard */}
          <Card className="bg-black/40 border-slate-700 backdrop-blur-sm hover:border-cyan-500/50 transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center mb-4">
                <Wallet className="w-6 h-6 text-black" />
              </div>
              <CardTitle className="text-white">Crypto Dashboard</CardTitle>
              <CardDescription className="text-slate-400">
                Real-time crypto tracking with portfolio management and price alerts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>• Live price tracking</li>
                <li>• Portfolio analytics</li>
                <li>• Price alerts</li>
                <li>• Market insights</li>
              </ul>
            </CardContent>
          </Card>

          {/* Analytics */}
          <Card className="bg-black/40 border-slate-700 backdrop-blur-sm hover:border-cyan-500/50 transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-white">Advanced Analytics</CardTitle>
              <CardDescription className="text-slate-400">
                Comprehensive analytics and reporting for data-driven decisions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>• Real-time metrics</li>
                <li>• Custom dashboards</li>
                <li>• Data visualization</li>
                <li>• Export capabilities</li>
              </ul>
            </CardContent>
          </Card>

          {/* Console */}
          <Card className="bg-black/40 border-slate-700 backdrop-blur-sm hover:border-cyan-500/50 transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mb-4">
                <Terminal className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-white">Developer Console</CardTitle>
              <CardDescription className="text-slate-400">
                Powerful console with API testing, database queries, and custom functions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>• API management</li>
                <li>• Database queries</li>
                <li>• Custom functions</li>
                <li>• AI assistant</li>
              </ul>
            </CardContent>
          </Card>

          {/* Security */}
          <Card className="bg-black/40 border-slate-700 backdrop-blur-sm hover:border-cyan-500/50 transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-white">Enterprise Security</CardTitle>
              <CardDescription className="text-slate-400">
                Bank-grade security with admin controls and user management.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>• Role-based access</li>
                <li>• Activity logging</li>
                <li>• Secure authentication</li>
                <li>• Admin panel</li>
              </ul>
            </CardContent>
          </Card>

          {/* Performance */}
          <Card className="bg-black/40 border-slate-700 backdrop-blur-sm hover:border-cyan-500/50 transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-black" />
              </div>
              <CardTitle className="text-white">Lightning Fast</CardTitle>
              <CardDescription className="text-slate-400">
                Optimized for speed with real-time updates and instant responses.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>• Real-time updates</li>
                <li>• Optimized queries</li>
                <li>• Fast loading</li>
                <li>• Responsive design</li>
              </ul>
            </CardContent>
          </Card>

          {/* Scalability */}
          <Card className="bg-black/40 border-slate-700 backdrop-blur-sm hover:border-cyan-500/50 transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-white">Global Scale</CardTitle>
              <CardDescription className="text-slate-400">
                Built to scale globally with enterprise-grade infrastructure.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>• Global CDN</li>
                <li>• Auto-scaling</li>
                <li>• 99.9% uptime</li>
                <li>• Multi-region</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-cyan-400 mb-2">99.9%</div>
            <div className="text-slate-400">Uptime</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-pink-400 mb-2">1M+</div>
            <div className="text-slate-400">API Calls</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-green-400 mb-2">50ms</div>
            <div className="text-slate-400">Response Time</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-yellow-400 mb-2">24/7</div>
            <div className="text-slate-400">Support</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Transform Your Workflow?</h2>
          <p className="text-xl text-slate-400 mb-8">
            Join thousands of developers and crypto enthusiasts who trust Wolf Platform for their projects.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-black"
              >
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button size="lg" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-black/40 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-lg flex items-center justify-center">
                <span className="text-black font-bold">W</span>
              </div>
              <span className="text-white font-bold text-xl">Wolf Platform</span>
            </div>
            <div className="text-slate-400 text-sm">© 2024 Wolf Platform. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
