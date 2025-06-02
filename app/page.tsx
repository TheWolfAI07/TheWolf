import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Activity, Users, TrendingUp, Zap } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <h1 className="text-xl font-bold text-slate-900">The Wolf</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/dashboard" className="text-slate-600 hover:text-slate-900 transition-colors">
                Dashboard
              </Link>
              <Link href="/crypto" className="text-slate-600 hover:text-slate-900 transition-colors">
                Crypto
              </Link>
              <Link href="/console" className="text-slate-600 hover:text-slate-900 transition-colors">
                Console
              </Link>
              <Link href="/docs" className="text-slate-600 hover:text-slate-900 transition-colors">
                Docs
              </Link>
            </nav>
            <Link href="/auth/signin">
              <Button variant="outline">Sign In</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Cover Page / Sign-In Welcome */}
      <section className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-slate-800 flex items-center justify-center relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-pink-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-yellow-400 rounded-full blur-2xl animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          {/* Wolf Logo */}
          <div className="mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-cyan-500/25 animate-pulse">
              <span className="text-black font-bold text-3xl">W</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-cyan-400 via-cyan-300 to-pink-400 bg-clip-text text-transparent mb-4">
              THE WOLF
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-2">Advanced Trading & Analytics Platform</p>
            <p className="text-sm text-slate-400 mb-8">Crypto • Console • Live Operations • Profit Tracking</p>
          </div>

          {/* Welcome Message */}
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Welcome Back, <span className="text-cyan-400">Randy</span>
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Your command center awaits. Monitor crypto portfolios, execute trades, track profits, and unleash the full
              power of automated trading strategies.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <Link href="/dashboard/wolf-grid">
              <Button
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-black font-bold px-8 py-4 text-lg shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:scale-105"
              >
                Enter Dashboard
              </Button>
            </Link>
            <Link href="/console">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-pink-500 text-pink-400 hover:bg-pink-500 hover:text-black font-bold px-8 py-4 text-lg transition-all duration-300 hover:scale-105"
              >
                Quick Access
              </Button>
            </Link>
          </div>

          {/* Quick Stats Preview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="bg-black/40 backdrop-blur-sm border border-slate-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-cyan-400">$47.2K</div>
              <div className="text-sm text-slate-400">Portfolio Value</div>
            </div>
            <div className="bg-black/40 backdrop-blur-sm border border-slate-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-pink-400">+23.5%</div>
              <div className="text-sm text-slate-400">24h Change</div>
            </div>
            <div className="bg-black/40 backdrop-blur-sm border border-slate-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-400">12</div>
              <div className="text-sm text-slate-400">Active Trades</div>
            </div>
            <div className="bg-black/40 backdrop-blur-sm border border-slate-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-400">Live</div>
              <div className="text-sm text-slate-400">Wolf Status</div>
            </div>
          </div>

          {/* Navigation Hint */}
          <div className="mt-12 text-center">
            <p className="text-slate-500 text-sm mb-4">Navigate to your command center</p>
            <div className="flex justify-center space-x-8">
              <Link
                href="/dashboard/wolf-grid"
                className="flex items-center space-x-2 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
              >
                <Activity className="w-4 h-4" />
                <span className="text-sm">Dashboard</span>
              </Link>
              <Link
                href="/crypto"
                className="flex items-center space-x-2 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
              >
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">Crypto</span>
              </Link>
              <Link
                href="/console"
                className="flex items-center space-x-2 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
              >
                <Users className="w-4 h-4" />
                <span className="text-sm">Console</span>
              </Link>
              <Link
                href="/docs"
                className="flex items-center space-x-2 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span className="text-sm">Docs</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-slate-600 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-cyan-400 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,847</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">+8% from last hour</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23.5%</div>
              <p className="text-xs text-muted-foreground">+4% from last quarter</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-slate-900 mb-4">Built for Performance</h3>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            The Wolf combines powerful backend capabilities with a beautiful, responsive frontend that's easy to
            customize and scale.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mr-3">
                  <Activity className="w-5 h-5 text-slate-700" />
                </div>
                Real-time Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Monitor your application performance with real-time metrics and insights.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mr-3">
                  <Users className="w-5 h-5 text-slate-700" />
                </div>
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Comprehensive user authentication and authorization system built-in.</CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mr-3">
                  <TrendingUp className="w-5 h-5 text-slate-700" />
                </div>
                Scalable Architecture
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Built with Next.js for optimal performance and seamless scaling.</CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-slate-900 font-bold text-sm">W</span>
                </div>
                <span className="text-xl font-bold">The Wolf</span>
              </div>
              <p className="text-slate-400">Building the future of web applications with Next.js.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <Link href="/dashboard" className="hover:text-white transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/crypto" className="hover:text-white transition-colors">
                    Crypto
                  </Link>
                </li>
                <li>
                  <Link href="/console" className="hover:text-white transition-colors">
                    Console
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <Link href="/docs" className="hover:text-white transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Status
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2024 The Wolf. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
