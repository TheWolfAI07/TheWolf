import { Navbar } from "@/components/navbar"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Crown, BarChart3, Settings, Activity, Shield, Zap, Lock, Globe, Brain } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-slate-800 text-white">
      <Navbar />

      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background Grid */}
        <div className="absolute inset-0 wolf-grid opacity-30"></div>

        {/* Floating Orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full filter blur-3xl animate-wolf-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full filter blur-3xl animate-wolf-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full filter blur-3xl animate-wolf-pulse"
          style={{ animationDelay: "2s" }}
        ></div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            {/* Premium Logo */}
            <div className="mb-8 relative">
              <div className="inline-block relative">
                <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 blur-xl opacity-50 animate-wolf-glow"></div>
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-gold/30 to-cyan-400/30 blur-md opacity-40 animate-pulse"></div>
                <div className="relative bg-black rounded-full p-8 border-2 border-cyan-500/30 shadow-2xl shadow-cyan-500/30">
                  <div className="flex items-center justify-center">
                    <div className="w-16 h-16">{/* Custom logo will go here */}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Title */}
            <h1 className="text-7xl md:text-9xl font-bold mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-cyan-300 via-blue-500 to-purple-600 bg-clip-text text-transparent animate-gradient metallic-shine">
                WOLF PLATFORM
              </span>
            </h1>

            {/* Luxury Subtitle */}
            <div className="flex items-center justify-center mb-8">
              <div className="h-px w-16 bg-gradient-to-r from-transparent via-gold to-transparent"></div>
              <p className="px-6 text-gold text-2xl tracking-[0.3em] font-light">ENTERPRISE EDITION</p>
              <div className="h-px w-16 bg-gradient-to-l from-transparent via-gold to-transparent"></div>
            </div>

            {/* Status Badges */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 px-4 py-2 text-sm font-medium">
                <Activity className="h-4 w-4 mr-2" />
                SYSTEM ONLINE
              </Badge>
              <Badge className="bg-blue-500/20 text-blue-300 border border-blue-400/50 px-4 py-2 text-sm font-medium">
                <Shield className="h-4 w-4 mr-2" />
                ENTERPRISE READY
              </Badge>
              <Badge className="bg-purple-500/20 text-purple-300 border border-purple-400/50 px-4 py-2 text-sm font-medium">
                <Crown className="h-4 w-4 mr-2" />
                v2.0 RELEASE
              </Badge>
            </div>

            {/* Description */}
            <p className="text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto mb-16 leading-relaxed">
              Next-generation AI-powered platform management with{" "}
              <span className="text-cyan-400 font-semibold">real-time analytics</span>,{" "}
              <span className="text-gold font-semibold">intelligent automation</span>, and{" "}
              <span className="text-blue-400 font-semibold">enterprise-grade infrastructure</span>.
            </p>
          </div>

          {/* Premium Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {/* Feature 1 - Real-time Analytics */}
            <div className="group relative bg-wolf-card rounded-2xl overflow-hidden wolf-border hover:wolf-border-gold transition-all duration-500 wolf-shadow hover:wolf-shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="p-8 relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/25 group-hover:shadow-cyan-500/50 transition-all duration-300">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">
                  Real-time Analytics
                </h3>
                <p className="text-slate-400 group-hover:text-slate-300 transition-colors">
                  Advanced metrics and insights with millisecond precision for enterprise decision making.
                </p>
              </div>
            </div>

            {/* Feature 2 - AI Intelligence */}
            <div className="group relative bg-wolf-card rounded-2xl overflow-hidden wolf-border hover:wolf-border-gold transition-all duration-500 wolf-shadow hover:wolf-shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-amber-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="p-8 relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-gold to-amber-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-gold/25 group-hover:shadow-gold/50 transition-all duration-300">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-gold transition-colors">
                  AI-Powered Intelligence
                </h3>
                <p className="text-slate-400 group-hover:text-slate-300 transition-colors">
                  Advanced machine learning algorithms delivering predictive intelligence and automation.
                </p>
              </div>
            </div>

            {/* Feature 3 - Enterprise Security */}
            <div className="group relative bg-wolf-card rounded-2xl overflow-hidden wolf-border hover:wolf-border-gold transition-all duration-500 wolf-shadow hover:wolf-shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="p-8 relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/50 transition-all duration-300">
                  <Lock className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">
                  Enterprise Security
                </h3>
                <p className="text-slate-400 group-hover:text-slate-300 transition-colors">
                  Military-grade encryption and compliance with global security standards and protocols.
                </p>
              </div>
            </div>

            {/* Feature 4 - Global Infrastructure */}
            <div className="group relative bg-wolf-card rounded-2xl overflow-hidden wolf-border hover:wolf-border-gold transition-all duration-500 wolf-shadow hover:wolf-shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="p-8 relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/50 transition-all duration-300">
                  <Globe className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-300 transition-colors">
                  Global Infrastructure
                </h3>
                <p className="text-slate-400 group-hover:text-slate-300 transition-colors">
                  High-performance distributed architecture with global replication and redundancy.
                </p>
              </div>
            </div>
          </div>

          {/* Premium Call to Action */}
          <div className="text-center mb-20">
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/dashboard">
                <Button className="group relative px-10 py-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-lg font-semibold rounded-xl shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 transform hover:scale-105">
                  <BarChart3 className="h-5 w-5 mr-3" />
                  Launch Dashboard
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                </Button>
              </Link>

              <Link href="/console">
                <Button
                  variant="outline"
                  className="px-10 py-6 border-2 border-gold/50 text-gold hover:bg-gold/10 text-lg font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Settings className="h-5 w-5 mr-3" />
                  Access Console
                </Button>
              </Link>

              <Link href="/auth/signin">
                <Button
                  variant="outline"
                  className="px-10 py-6 border-2 border-slate-600 text-slate-300 hover:bg-slate-800 text-lg font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Shield className="h-5 w-5 mr-3" />
                  Enterprise Login
                </Button>
              </Link>
            </div>
          </div>

          {/* Premium System Status Dashboard */}
          <div className="max-w-6xl mx-auto">
            <div className="bg-wolf-card rounded-3xl overflow-hidden wolf-border shadow-2xl">
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-white flex items-center">
                    <Activity className="h-6 w-6 mr-3 text-emerald-400" />
                    System Status Dashboard
                  </h3>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full mr-3 animate-pulse"></div>
                    <span className="text-emerald-400 font-semibold">All Systems Operational</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/50 hover:border-emerald-500/30 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-slate-400 font-medium">System Uptime</span>
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/50 text-xs">
                        OPTIMAL
                      </Badge>
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">99.99%</div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                        style={{ width: "99.99%" }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/50 hover:border-cyan-500/30 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-slate-400 font-medium">API Response</span>
                      <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-400/50 text-xs">FAST</Badge>
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">47ms</div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                        style={{ width: "95%" }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/50 hover:border-blue-500/30 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-slate-400 font-medium">Database</span>
                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/50 text-xs">STABLE</Badge>
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">Optimal</div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                        style={{ width: "98%" }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/50 hover:border-purple-500/30 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-slate-400 font-medium">Active Users</span>
                      <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/50 text-xs">GROWING</Badge>
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">2.4K+</div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                        style={{ width: "87%" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Footer */}
      <footer className="relative bg-black/50 backdrop-blur-sm border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-6 md:mb-0">
              <div className="flex items-center">
                <div className="w-8 h-8 text-cyan-400 mr-3">{/* Custom logo will go here */}</div>
              </div>
              <div className="ml-4">
                <p className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  WOLF PLATFORM
                </p>
                <p className="text-xs text-gold tracking-wider">ENTERPRISE EDITION</p>
              </div>
            </div>

            <div className="text-center md:text-right">
              <p className="text-sm text-slate-400 mb-1">🐺 Wolf Platform v2.0.0 ENTERPRISE EDITION</p>
              <p className="text-xs text-slate-500">
                Enterprise AI Management Platform • Ready for Launch • {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
