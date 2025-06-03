"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { ArrowLeft, Book, Shield, Zap, Terminal, Wallet, BarChart3, ExternalLink } from "lucide-react"

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-700 bg-black/40 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center space-x-2 text-slate-300 hover:text-cyan-400 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Link>
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-lg flex items-center justify-center">
                <Book className="w-4 h-4 text-black" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-cyan-400">Documentation</h1>
                <p className="text-sm text-slate-400">Complete guide to Wolf Platform</p>
              </div>
            </div>
            <Link href="/auth/signup">
              <Button className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-black">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Introduction */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
              <Zap className="w-4 h-4 mr-2" />
              Getting Started
            </Badge>
            <h2 className="text-4xl font-bold text-white mb-4">Welcome to Wolf Platform</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Your comprehensive guide to using Wolf Platform's powerful features for crypto tracking, analytics, and
              development tools.
            </p>
          </div>
        </div>

        {/* Quick Start */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-black/40 border border-slate-700 grid grid-cols-5 w-full">
            <TabsTrigger value="overview" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-black">
              Overview
            </TabsTrigger>
            <TabsTrigger value="crypto" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-black">
              Crypto
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-black">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="console" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-black">
              Console
            </TabsTrigger>
            <TabsTrigger value="api" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-black">
              API
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="bg-black/40 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Platform Overview</CardTitle>
                <CardDescription className="text-slate-400">
                  Learn about Wolf Platform's core features and capabilities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <Wallet className="w-5 h-5 mr-2 text-cyan-400" />
                      Crypto Dashboard
                    </h3>
                    <p className="text-slate-300">
                      Real-time cryptocurrency tracking with portfolio management, price alerts, and market analysis.
                    </p>
                    <ul className="space-y-2 text-sm text-slate-400">
                      <li>• Live price tracking for 1000+ cryptocurrencies</li>
                      <li>• Portfolio management with P&L tracking</li>
                      <li>• Customizable price alerts</li>
                      <li>• Market sentiment analysis</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2 text-pink-400" />
                      Analytics Suite
                    </h3>
                    <p className="text-slate-300">
                      Comprehensive analytics and reporting tools for data-driven decision making.
                    </p>
                    <ul className="space-y-2 text-sm text-slate-400">
                      <li>• Real-time metrics and KPIs</li>
                      <li>• Custom dashboard creation</li>
                      <li>• Data visualization tools</li>
                      <li>• Export and sharing capabilities</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <Terminal className="w-5 h-5 mr-2 text-green-400" />
                      Developer Console
                    </h3>
                    <p className="text-slate-300">
                      Powerful development tools including API testing, database queries, and custom functions.
                    </p>
                    <ul className="space-y-2 text-sm text-slate-400">
                      <li>• API endpoint testing and monitoring</li>
                      <li>• Database query interface</li>
                      <li>• Custom function execution</li>
                      <li>• AI-powered assistant</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <Shield className="w-5 h-5 mr-2 text-red-400" />
                      Security & Admin
                    </h3>
                    <p className="text-slate-300">
                      Enterprise-grade security with comprehensive admin controls and user management.
                    </p>
                    <ul className="space-y-2 text-sm text-slate-400">
                      <li>• Role-based access control</li>
                      <li>• Activity logging and monitoring</li>
                      <li>• User management tools</li>
                      <li>• System configuration</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Crypto Tab */}
          <TabsContent value="crypto" className="space-y-6">
            <Card className="bg-black/40 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Crypto Dashboard Guide</CardTitle>
                <CardDescription className="text-slate-400">
                  Master the crypto tracking and portfolio management features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Getting Started</h3>
                  <p className="text-slate-300">
                    The crypto dashboard provides real-time tracking of cryptocurrency prices, portfolio management, and
                    market analysis tools.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Key Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-800/30 rounded-lg">
                      <h4 className="font-medium text-cyan-400 mb-2">Live Price Tracking</h4>
                      <p className="text-sm text-slate-300">
                        Monitor real-time prices for over 1000 cryptocurrencies with 1-minute update intervals.
                      </p>
                    </div>
                    <div className="p-4 bg-slate-800/30 rounded-lg">
                      <h4 className="font-medium text-cyan-400 mb-2">Portfolio Management</h4>
                      <p className="text-sm text-slate-300">
                        Track your holdings across multiple wallets and exchanges with automatic P&L calculations.
                      </p>
                    </div>
                    <div className="p-4 bg-slate-800/30 rounded-lg">
                      <h4 className="font-medium text-cyan-400 mb-2">Price Alerts</h4>
                      <p className="text-sm text-slate-300">
                        Set custom price alerts with email and push notification support.
                      </p>
                    </div>
                    <div className="p-4 bg-slate-800/30 rounded-lg">
                      <h4 className="font-medium text-cyan-400 mb-2">Market Analysis</h4>
                      <p className="text-sm text-slate-300">
                        Access market sentiment data, fear & greed index, and technical indicators.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card className="bg-black/40 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Analytics Documentation</CardTitle>
                <CardDescription className="text-slate-400">
                  Learn how to use the analytics suite for data insights
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Analytics Overview</h3>
                  <p className="text-slate-300">
                    The analytics suite provides comprehensive data visualization and reporting tools to help you make
                    informed decisions.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Available Metrics</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-800/30 rounded-lg">
                      <h4 className="font-medium text-pink-400">User Analytics</h4>
                      <p className="text-sm text-slate-300">Track user engagement, retention, and growth metrics.</p>
                    </div>
                    <div className="p-3 bg-slate-800/30 rounded-lg">
                      <h4 className="font-medium text-pink-400">Performance Metrics</h4>
                      <p className="text-sm text-slate-300">
                        Monitor system performance, API response times, and uptime.
                      </p>
                    </div>
                    <div className="p-3 bg-slate-800/30 rounded-lg">
                      <h4 className="font-medium text-pink-400">Financial Data</h4>
                      <p className="text-sm text-slate-300">Analyze portfolio performance and trading metrics.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Console Tab */}
          <TabsContent value="console" className="space-y-6">
            <Card className="bg-black/40 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Developer Console</CardTitle>
                <CardDescription className="text-slate-400">Powerful development tools and utilities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Console Features</h3>
                  <p className="text-slate-300">
                    The developer console provides a comprehensive set of tools for API testing, database management,
                    and custom function execution.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium text-green-400">API Management</h4>
                    <ul className="space-y-1 text-sm text-slate-300">
                      <li>• Test API endpoints</li>
                      <li>• Monitor response times</li>
                      <li>• View request/response data</li>
                      <li>• Set up automated testing</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium text-green-400">Database Tools</h4>
                    <ul className="space-y-1 text-sm text-slate-300">
                      <li>• Execute SQL queries</li>
                      <li>• Browse database tables</li>
                      <li>• View table schemas</li>
                      <li>• Export query results</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Tab */}
          <TabsContent value="api" className="space-y-6">
            <Card className="bg-black/40 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">API Reference</CardTitle>
                <CardDescription className="text-slate-400">Complete API documentation and examples</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Available Endpoints</h3>
                  <div className="space-y-3">
                    <div className="p-4 bg-slate-800/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-white">Health Check</h4>
                        <Badge className="bg-green-500/20 text-green-400">GET</Badge>
                      </div>
                      <code className="text-sm text-cyan-400">/api/health</code>
                      <p className="text-sm text-slate-300 mt-2">Check the health status of the API.</p>
                    </div>

                    <div className="p-4 bg-slate-800/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-white">Users</h4>
                        <Badge className="bg-green-500/20 text-green-400">GET</Badge>
                      </div>
                      <code className="text-sm text-cyan-400">/api/users</code>
                      <p className="text-sm text-slate-300 mt-2">Retrieve user data and statistics.</p>
                    </div>

                    <div className="p-4 bg-slate-800/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-white">Analytics</h4>
                        <Badge className="bg-green-500/20 text-green-400">GET</Badge>
                      </div>
                      <code className="text-sm text-cyan-400">/api/analytics</code>
                      <p className="text-sm text-slate-300 mt-2">Access analytics data and metrics.</p>
                    </div>

                    <div className="p-4 bg-slate-800/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-white">Projects</h4>
                        <Badge className="bg-green-500/20 text-green-400">GET</Badge>
                      </div>
                      <code className="text-sm text-cyan-400">/api/projects</code>
                      <p className="text-sm text-slate-300 mt-2">Manage projects and project data.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <Card className="bg-gradient-to-r from-cyan-500/10 to-pink-500/10 border-cyan-500/30 backdrop-blur-sm">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-white mb-4">Ready to Get Started?</h3>
              <p className="text-slate-300 mb-6">
                Join thousands of developers and crypto enthusiasts using Wolf Platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/signup">
                  <Button className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-black">
                    Start Free Trial
                  </Button>
                </Link>
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View GitHub
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
