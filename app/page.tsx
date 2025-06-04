"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3,
  Activity,
  TrendingUp,
  Zap,
  Target,
  Brain,
  Rocket,
  Shield,
  Globe,
  ArrowRight,
  CheckCircle,
  Wallet,
  Bitcoin,
  TrendingDown,
  RefreshCw,
  ExternalLink,
} from "lucide-react"
import Link from "next/link"
import { WalletConnector, type WalletConnection } from "@/lib/wallet-connector"
import { CryptoAPI, type CryptoPrice } from "@/lib/crypto-api"
import { useToast } from "@/hooks/use-toast"

export default function HomePage() {
  const { toast } = useToast()
  const [walletConnector] = useState(() => WalletConnector.getInstance())
  const [connection, setConnection] = useState<WalletConnection | null>(null)
  const [cryptoData, setCryptoData] = useState<CryptoPrice[]>([])
  const [loading, setLoading] = useState(false)
  const [cryptoLoading, setCryptoLoading] = useState(true)

  // Load crypto data
  useEffect(() => {
    const loadCryptoData = async () => {
      try {
        setCryptoLoading(true)
        const data = await CryptoAPI.getTopCryptocurrencies(5)
        setCryptoData(data)
      } catch (error) {
        console.error("Failed to load crypto data:", error)
      } finally {
        setCryptoLoading(false)
      }
    }

    loadCryptoData()

    // Set up wallet connection listener
    const unsubscribe = walletConnector.onConnectionChange((newConnection) => {
      setConnection(newConnection)
    })

    // Auto-refresh crypto data every 30 seconds
    const interval = setInterval(loadCryptoData, 30000)

    return () => {
      unsubscribe()
      clearInterval(interval)
    }
  }, [walletConnector])

  const connectWallet = async () => {
    try {
      setLoading(true)
      const connection = await walletConnector.connectMetaMask()
      const displayAddress = connection.ensName || `${connection.address.slice(0, 6)}...${connection.address.slice(-4)}`

      toast({
        title: "Wallet Connected",
        description: `Connected to ${displayAddress}`,
      })
    } catch (error: any) {
      console.error("Wallet connection error:", error)
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const disconnectWallet = async () => {
    try {
      await walletConnector.disconnect()
      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected",
      })
    } catch (error: any) {
      console.error("Disconnect error:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-slate-800">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-black/40 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-xl flex items-center justify-center">
                <span className="text-black font-bold text-lg">W</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Wolf Platform</h1>
                <p className="text-xs text-slate-400">Advanced Business Intelligence</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Wallet Connection */}
              {connection ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 bg-slate-800/50 rounded-lg px-3 py-2">
                    <Wallet className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-white font-mono">
                      {connection.ensName || `${connection.address.slice(0, 6)}...${connection.address.slice(-4)}`}
                    </span>
                    <Badge variant="outline" className="text-xs text-green-400 border-green-400">
                      Connected
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={disconnectWallet}
                    className="border-red-400/50 text-red-400 hover:bg-red-400/10"
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={connectWallet}
                  disabled={loading}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
                >
                  {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Wallet className="w-4 h-4 mr-2" />}
                  Connect Wallet
                </Button>
              )}

              <Link href="/dashboard">
                <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-6">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-6 bg-cyan-500/20 text-cyan-300 border border-cyan-400/50">
              <Zap className="w-3 h-3 mr-1" />
              Live Platform • Real-time Data
            </Badge>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Wolf Platform
            </h1>

            <p className="text-xl md:text-2xl text-slate-300 mb-8 leading-relaxed">
              Next-generation business intelligence with{" "}
              <span className="text-cyan-400 font-semibold">AI-powered insights</span>,{" "}
              <span className="text-blue-400 font-semibold">real-time analytics</span>, and{" "}
              <span className="text-purple-400 font-semibold">live crypto integration</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-lg px-8 py-3"
                >
                  <Rocket className="w-5 h-5 mr-2" />
                  Launch Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>

              <Link href="/crypto">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-800 text-lg px-8 py-3"
                >
                  <Bitcoin className="w-5 h-5 mr-2" />
                  Crypto Dashboard
                </Button>
              </Link>
            </div>

            {/* Live Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700">
                <div className="text-2xl font-bold text-cyan-400">99.9%</div>
                <div className="text-xs text-slate-400">Uptime</div>
              </div>
              <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700">
                <div className="text-2xl font-bold text-green-400">Live</div>
                <div className="text-xs text-slate-400">Real-time</div>
              </div>
              <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700">
                <div className="text-2xl font-bold text-purple-400">AI</div>
                <div className="text-xs text-slate-400">Powered</div>
              </div>
              <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700">
                <div className="text-2xl font-bold text-yellow-400">24/7</div>
                <div className="text-xs text-slate-400">Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Crypto Preview */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Live Crypto Market</h2>
            <p className="text-slate-400">Real-time cryptocurrency prices and market data</p>
          </div>

          <Card className="bg-black/40 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center">
                  <Bitcoin className="w-5 h-5 mr-2 text-orange-400" />
                  Top Cryptocurrencies
                </CardTitle>
                <Badge className="bg-green-500/20 text-green-300 border border-green-400/50">
                  <Activity className="w-3 h-3 mr-1 animate-pulse" />
                  LIVE
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {cryptoLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg animate-pulse"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-slate-700 rounded-full"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-slate-700 rounded w-20"></div>
                          <div className="h-3 bg-slate-700 rounded w-12"></div>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="h-4 bg-slate-700 rounded w-16"></div>
                        <div className="h-3 bg-slate-700 rounded w-12"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {cryptoData.slice(0, 5).map((crypto) => (
                    <div
                      key={crypto.id}
                      className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={crypto.image || "/placeholder.svg"}
                          alt={crypto.name}
                          className="w-8 h-8 rounded-full"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = "/placeholder.svg?height=32&width=32"
                          }}
                        />
                        <div>
                          <div className="font-medium text-white">{crypto.name}</div>
                          <div className="text-sm text-slate-400">{crypto.symbol.toUpperCase()}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-white">{CryptoAPI.formatPrice(crypto.current_price)}</div>
                        <div
                          className={`text-sm flex items-center ${
                            crypto.price_change_percentage_24h >= 0 ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {crypto.price_change_percentage_24h >= 0 ? (
                            <TrendingUp className="w-3 h-3 mr-1" />
                          ) : (
                            <TrendingDown className="w-3 h-3 mr-1" />
                          )}
                          {CryptoAPI.formatPercentage(crypto.price_change_percentage_24h)}
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="pt-4 border-t border-slate-700">
                    <Link href="/crypto">
                      <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Full Crypto Dashboard
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Platform Features</h2>
            <p className="text-slate-400">Everything you need for modern business intelligence</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Real-time Analytics */}
            <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-400/30 hover:border-cyan-400/50 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-cyan-400" />
                </div>
                <CardTitle className="text-white">Real-time Analytics</CardTitle>
                <CardDescription className="text-slate-400">
                  Live data visualization with interactive dashboards and real-time updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-slate-300">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                    Live data streaming
                  </div>
                  <div className="flex items-center text-sm text-slate-300">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                    Interactive charts
                  </div>
                  <div className="flex items-center text-sm text-slate-300">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                    Custom metrics
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/30 hover:border-purple-400/50 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-purple-400" />
                </div>
                <CardTitle className="text-white">AI-Powered Insights</CardTitle>
                <CardDescription className="text-slate-400">
                  Machine learning algorithms provide intelligent recommendations and predictions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-slate-300">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                    Predictive analytics
                  </div>
                  <div className="flex items-center text-sm text-slate-300">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                    Smart recommendations
                  </div>
                  <div className="flex items-center text-sm text-slate-300">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                    Automated insights
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Crypto Integration */}
            <Card className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border border-orange-400/30 hover:border-orange-400/50 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Bitcoin className="w-6 h-6 text-orange-400" />
                </div>
                <CardTitle className="text-white">Crypto Integration</CardTitle>
                <CardDescription className="text-slate-400">
                  Live cryptocurrency data, wallet integration, and DeFi analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-slate-300">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                    Wallet connectivity
                  </div>
                  <div className="flex items-center text-sm text-slate-300">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                    Live price feeds
                  </div>
                  <div className="flex items-center text-sm text-slate-300">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                    Portfolio tracking
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Project Management */}
            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-400/30 hover:border-green-400/50 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-green-400" />
                </div>
                <CardTitle className="text-white">Project Management</CardTitle>
                <CardDescription className="text-slate-400">
                  Advanced project tracking with collaborative tools and automation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-slate-300">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                    Task automation
                  </div>
                  <div className="flex items-center text-sm text-slate-300">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                    Team collaboration
                  </div>
                  <div className="flex items-center text-sm text-slate-300">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                    Progress tracking
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            <Card className="bg-gradient-to-br from-red-500/10 to-pink-500/10 border border-red-400/30 hover:border-red-400/50 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-red-400" />
                </div>
                <CardTitle className="text-white">Enterprise Security</CardTitle>
                <CardDescription className="text-slate-400">
                  Bank-grade security with encryption, audit logs, and compliance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-slate-300">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                    End-to-end encryption
                  </div>
                  <div className="flex items-center text-sm text-slate-300">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                    Audit trails
                  </div>
                  <div className="flex items-center text-sm text-slate-300">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                    Compliance ready
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Global Scale */}
            <Card className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-400/30 hover:border-blue-400/50 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-blue-400" />
                </div>
                <CardTitle className="text-white">Global Scale</CardTitle>
                <CardDescription className="text-slate-400">
                  Worldwide infrastructure with edge computing and CDN optimization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-slate-300">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                    Global CDN
                  </div>
                  <div className="flex items-center text-sm text-slate-300">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                    Edge computing
                  </div>
                  <div className="flex items-center text-sm text-slate-300">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                    99.9% uptime
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Business?</h2>
            <p className="text-xl text-slate-300 mb-8">
              Join thousands of companies using Wolf Platform to drive growth and innovation
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-lg px-8 py-3"
                >
                  <Rocket className="w-5 h-5 mr-2" />
                  Get Started Now
                </Button>
              </Link>

              <Link href="/docs">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-800 text-lg px-8 py-3"
                >
                  View Documentation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-black/40 backdrop-blur-sm py-12 px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-lg flex items-center justify-center">
                  <span className="text-black font-bold">W</span>
                </div>
                <span className="text-white font-bold">Wolf Platform</span>
              </div>
              <p className="text-slate-400 text-sm">
                Next-generation business intelligence platform with AI-powered insights and real-time analytics.
              </p>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <Link href="/dashboard" className="hover:text-cyan-400 transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/crypto" className="hover:text-cyan-400 transition-colors">
                    Crypto
                  </Link>
                </li>
                <li>
                  <Link href="/analytics" className="hover:text-cyan-400 transition-colors">
                    Analytics
                  </Link>
                </li>
                <li>
                  <Link href="/projects" className="hover:text-cyan-400 transition-colors">
                    Projects
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <Link href="/docs" className="hover:text-cyan-400 transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/api" className="hover:text-cyan-400 transition-colors">
                    API Reference
                  </Link>
                </li>
                <li>
                  <Link href="/support" className="hover:text-cyan-400 transition-colors">
                    Support
                  </Link>
                </li>
                <li>
                  <Link href="/status" className="hover:text-cyan-400 transition-colors">
                    Status
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <Link href="/about" className="hover:text-cyan-400 transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="hover:text-cyan-400 transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-cyan-400 transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-cyan-400 transition-colors">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-700 mt-8 pt-8 text-center text-sm text-slate-400">
            <p>&copy; 2024 Wolf Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
