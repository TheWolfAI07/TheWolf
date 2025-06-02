"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Book, Code, Zap, Wallet, BarChart3, Terminal, ExternalLink, Copy, CheckCircle } from "lucide-react"

export default function DocsPage() {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-700 bg-black/40 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-xl flex items-center justify-center">
                <Book className="w-5 h-5 text-black" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-cyan-400">Wolf Documentation</h1>
                <p className="text-sm text-slate-400">User Guides • API Reference • Tutorials</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="getting-started" className="space-y-6">
          <TabsList className="bg-black/40 border border-slate-700 grid grid-cols-5 w-full">
            <TabsTrigger
              value="getting-started"
              className="data-[state=active]:bg-cyan-500 data-[state=active]:text-black"
            >
              <Zap className="w-4 h-4 mr-2" />
              Getting Started
            </TabsTrigger>
            <TabsTrigger
              value="api-reference"
              className="data-[state=active]:bg-cyan-500 data-[state=active]:text-black"
            >
              <Code className="w-4 h-4 mr-2" />
              API Reference
            </TabsTrigger>
            <TabsTrigger
              value="wallet-guide"
              className="data-[state=active]:bg-cyan-500 data-[state=active]:text-black"
            >
              <Wallet className="w-4 h-4 mr-2" />
              Wallet Guide
            </TabsTrigger>
            <TabsTrigger
              value="console-guide"
              className="data-[state=active]:bg-cyan-500 data-[state=active]:text-black"
            >
              <Terminal className="w-4 h-4 mr-2" />
              Console Guide
            </TabsTrigger>
            <TabsTrigger value="tutorials" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-black">
              <BarChart3 className="w-4 h-4 mr-2" />
              Tutorials
            </TabsTrigger>
          </TabsList>

          {/* Getting Started */}
          <TabsContent value="getting-started" className="space-y-6">
            <Card className="bg-black/40 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-cyan-400" />
                  Welcome to The Wolf Platform
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Your comprehensive guide to getting started with The Wolf trading and analytics platform.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-slate-800/30 border-slate-600">
                    <CardHeader>
                      <CardTitle className="text-cyan-400 text-lg">🚀 Quick Start</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ol className="list-decimal list-inside space-y-2 text-slate-300">
                        <li>Sign in to your Wolf account</li>
                        <li>Connect your crypto wallet</li>
                        <li>Explore the dashboard</li>
                        <li>Set up your first trading strategy</li>
                        <li>Monitor your portfolio</li>
                      </ol>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/30 border-slate-600">
                    <CardHeader>
                      <CardTitle className="text-pink-400 text-lg">🎯 Key Features</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc list-inside space-y-2 text-slate-300">
                        <li>Real-time crypto portfolio tracking</li>
                        <li>Advanced trading analytics</li>
                        <li>Multi-wallet support</li>
                        <li>Custom function execution</li>
                        <li>Live profit monitoring</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-slate-800/30 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Platform Overview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <BarChart3 className="w-6 h-6 text-cyan-400" />
                      </div>
                      <h4 className="font-semibold text-white">Dashboard</h4>
                      <p className="text-sm text-slate-400">Monitor your portfolio and analytics</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <Wallet className="w-6 h-6 text-pink-400" />
                      </div>
                      <h4 className="font-semibold text-white">Crypto</h4>
                      <p className="text-sm text-slate-400">Manage wallets and transactions</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <Terminal className="w-6 h-6 text-yellow-400" />
                      </div>
                      <h4 className="font-semibold text-white">Console</h4>
                      <p className="text-sm text-slate-400">Execute functions and manage APIs</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Reference */}
          <TabsContent value="api-reference" className="space-y-6">
            <Card className="bg-black/40 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Code className="w-5 h-5 mr-2 text-cyan-400" />
                  API Reference
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Complete reference for The Wolf API endpoints and usage.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Base URL */}
                <div className="bg-slate-800/30 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-2">Base URL</h3>
                  <div className="flex items-center space-x-2">
                    <code className="bg-black px-3 py-1 rounded text-cyan-400">
                      https://your-wolf-app.vercel.app/api
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard("https://your-wolf-app.vercel.app/api")}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Endpoints */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white">Endpoints</h3>

                  {/* Health Check */}
                  <Card className="bg-slate-800/30 border-slate-600">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-green-400 text-lg">GET /health</CardTitle>
                        <Badge className="bg-green-500/20 text-green-400">Public</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 mb-4">Check the health status of the Wolf backend.</p>
                      <div className="bg-black rounded-lg p-4">
                        <h4 className="text-white font-semibold mb-2">Response Example:</h4>
                        <pre className="text-cyan-400 text-sm overflow-x-auto">
                          {`{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "1.0.0",
    "uptime": 3600,
    "services": {
      "database": "connected",
      "cache": "connected"
    }
  }
}`}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Users API */}
                  <Card className="bg-slate-800/30 border-slate-600">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-blue-400 text-lg">GET /users</CardTitle>
                        <Badge className="bg-blue-500/20 text-blue-400">Protected</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 mb-4">Retrieve all users in the system.</p>
                      <div className="bg-black rounded-lg p-4">
                        <h4 className="text-white font-semibold mb-2">Query Parameters:</h4>
                        <ul className="text-slate-300 text-sm space-y-1 mb-4">
                          <li>
                            <code className="text-cyan-400">limit</code> - Maximum number of users to return
                          </li>
                          <li>
                            <code className="text-cyan-400">status</code> - Filter by user status (active, inactive)
                          </li>
                        </ul>
                        <h4 className="text-white font-semibold mb-2">Response Example:</h4>
                        <pre className="text-cyan-400 text-sm overflow-x-auto">
                          {`{
  "success": true,
  "data": [
    {
      "id": "1",
      "username": "thewolf",
      "status": "active"
    }
  ],
  "total": 1
}`}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Analytics API */}
                  <Card className="bg-slate-800/30 border-slate-600">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-purple-400 text-lg">GET /analytics</CardTitle>
                        <Badge className="bg-purple-500/20 text-purple-400">Protected</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 mb-4">Get analytics data and metrics.</p>
                      <div className="bg-black rounded-lg p-4">
                        <h4 className="text-white font-semibold mb-2">Query Parameters:</h4>
                        <ul className="text-slate-300 text-sm space-y-1 mb-4">
                          <li>
                            <code className="text-cyan-400">type</code> - Type of analytics (overview, projects,
                            activities)
                          </li>
                          <li>
                            <code className="text-cyan-400">timeframe</code> - Time period (24h, 7d, 30d)
                          </li>
                        </ul>
                        <h4 className="text-white font-semibold mb-2">Response Example:</h4>
                        <pre className="text-cyan-400 text-sm overflow-x-auto">
                          {`{
  "success": true,
  "data": {
    "totalusers": 1234,
    "activesessions": 567,
    "growthrate": 23.5,
    "revenue": 45000
  }
}`}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wallet Guide */}
          <TabsContent value="wallet-guide" className="space-y-6">
            <Card className="bg-black/40 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Wallet className="w-5 h-5 mr-2 text-cyan-400" />
                  Wallet Integration Guide
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Learn how to connect and manage your crypto wallets with The Wolf platform.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-slate-800/30 border-slate-600">
                    <CardHeader>
                      <CardTitle className="text-cyan-400 text-lg">🔗 Connecting Wallets</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ol className="list-decimal list-inside space-y-2 text-slate-300">
                        <li>Navigate to the Crypto dashboard</li>
                        <li>Click "Connect Wallet" button</li>
                        <li>Choose your preferred wallet (MetaMask, WalletConnect, etc.)</li>
                        <li>Approve the connection in your wallet</li>
                        <li>Your wallet is now connected!</li>
                      </ol>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/30 border-slate-600">
                    <CardHeader>
                      <CardTitle className="text-pink-400 text-lg">🌐 Supported Networks</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-slate-300">
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                          Ethereum Mainnet
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                          Polygon
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                          Arbitrum
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                          Optimism
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                          Base
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-slate-800/30 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Wallet Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-semibold text-cyan-400 mb-2">Portfolio Tracking</h4>
                      <p className="text-sm text-slate-300">Real-time balance updates and token discovery</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-pink-400 mb-2">Transaction History</h4>
                      <p className="text-sm text-slate-300">Complete transaction logs and analytics</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-yellow-400 mb-2">Multi-Chain Support</h4>
                      <p className="text-sm text-slate-300">Manage assets across multiple blockchains</p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <h4 className="text-yellow-400 font-semibold mb-2">⚠️ Security Best Practices</h4>
                  <ul className="text-slate-300 text-sm space-y-1">
                    <li>• Never share your private keys or seed phrases</li>
                    <li>• Always verify transaction details before signing</li>
                    <li>• Use hardware wallets for large amounts</li>
                    <li>• Keep your wallet software updated</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Console Guide */}
          <TabsContent value="console-guide" className="space-y-6">
            <Card className="bg-black/40 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Terminal className="w-5 h-5 mr-2 text-cyan-400" />
                  Console Guide
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Master the Wolf Console for advanced platform management and automation.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-slate-800/30 border-slate-600">
                    <CardHeader>
                      <CardTitle className="text-cyan-400 text-lg">🎛️ Console Features</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-slate-300">
                        <li>• Real-time API monitoring</li>
                        <li>• Custom function execution</li>
                        <li>• Database query interface</li>
                        <li>• AI-powered assistance</li>
                        <li>• System metrics dashboard</li>
                        <li>• Live log streaming</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/30 border-slate-600">
                    <CardHeader>
                      <CardTitle className="text-pink-400 text-lg">🤖 AI Commands</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-slate-300">
                        <li>
                          <code className="text-cyan-400">"test api"</code> - Test all endpoints
                        </li>
                        <li>
                          <code className="text-cyan-400">"check database"</code> - Verify DB connection
                        </li>
                        <li>
                          <code className="text-cyan-400">"show users"</code> - Display user count
                        </li>
                        <li>
                          <code className="text-cyan-400">"run function"</code> - Execute custom function
                        </li>
                        <li>
                          <code className="text-cyan-400">"system status"</code> - Show health metrics
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-slate-800/30 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Custom Functions</h3>
                  <p className="text-slate-300 mb-4">
                    Create and execute custom JavaScript functions to automate your workflow:
                  </p>
                  <div className="bg-black rounded-lg p-4">
                    <pre className="text-cyan-400 text-sm overflow-x-auto">
                      {`// Example: Database Connection Test
async function testConnection() {
  const { data, error } = await supabase
    .from('users')
    .select('count(*)')
    .single();
    
  if (error) {
    return { success: false, error: error.message };
  }
  
  return { success: true, data };
}`}
                    </pre>
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <h4 className="text-blue-400 font-semibold mb-2">💡 Pro Tips</h4>
                  <ul className="text-slate-300 text-sm space-y-1">
                    <li>• Use the AI assistant for complex operations</li>
                    <li>• Save frequently used queries for quick access</li>
                    <li>• Monitor API response times to optimize performance</li>
                    <li>• Set up custom functions for repetitive tasks</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tutorials */}
          <TabsContent value="tutorials" className="space-y-6">
            <Card className="bg-black/40 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-cyan-400" />
                  Tutorials & Examples
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Step-by-step tutorials to help you master The Wolf platform.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-slate-800/30 border-slate-600">
                    <CardHeader>
                      <CardTitle className="text-cyan-400 text-lg">📊 Setting Up Your First Dashboard</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ol className="list-decimal list-inside space-y-2 text-slate-300 text-sm">
                        <li>Navigate to the Wolf Grid dashboard</li>
                        <li>Connect your crypto wallet</li>
                        <li>Drag and drop widgets to customize layout</li>
                        <li>Add your first task in the Active Tasks widget</li>
                        <li>Monitor your live profit in real-time</li>
                      </ol>
                      <Button className="mt-4 bg-cyan-500 hover:bg-cyan-600 text-black">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Try Now
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/30 border-slate-600">
                    <CardHeader>
                      <CardTitle className="text-pink-400 text-lg">🔧 Creating Custom Functions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ol className="list-decimal list-inside space-y-2 text-slate-300 text-sm">
                        <li>Open the Console and go to Functions tab</li>
                        <li>Click "New Function" to create a custom function</li>
                        <li>Write your JavaScript/TypeScript code</li>
                        <li>Test the function with sample data</li>
                        <li>Save and enable for automatic execution</li>
                      </ol>
                      <Button className="mt-4 bg-pink-500 hover:bg-pink-600 text-white">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Learn More
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/30 border-slate-600">
                    <CardHeader>
                      <CardTitle className="text-yellow-400 text-lg">💰 Portfolio Optimization</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ol className="list-decimal list-inside space-y-2 text-slate-300 text-sm">
                        <li>Connect multiple wallets to track all assets</li>
                        <li>Set up automated rebalancing rules</li>
                        <li>Monitor performance across different chains</li>
                        <li>Use analytics to identify trends</li>
                        <li>Set profit targets and stop-loss levels</li>
                      </ol>
                      <Button className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-black">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Start Tutorial
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/30 border-slate-600">
                    <CardHeader>
                      <CardTitle className="text-green-400 text-lg">🤖 AI Assistant Mastery</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ol className="list-decimal list-inside space-y-2 text-slate-300 text-sm">
                        <li>Learn basic AI commands and syntax</li>
                        <li>Use natural language for complex queries</li>
                        <li>Automate routine tasks with AI assistance</li>
                        <li>Set up intelligent alerts and notifications</li>
                        <li>Create AI-powered trading strategies</li>
                      </ol>
                      <Button className="mt-4 bg-green-500 hover:bg-green-600 text-black">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Explore AI
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-gradient-to-r from-cyan-500/10 to-pink-500/10 border border-cyan-500/30 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-white mb-4">🎯 Advanced Use Cases</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-cyan-400 mb-2">DeFi Strategy Automation</h4>
                      <p className="text-sm text-slate-300">
                        Automate yield farming, liquidity provision, and arbitrage opportunities
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-pink-400 mb-2">Risk Management</h4>
                      <p className="text-sm text-slate-300">
                        Set up automated stop-losses and position sizing based on volatility
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-yellow-400 mb-2">Tax Optimization</h4>
                      <p className="text-sm text-slate-300">
                        Track transactions for tax reporting and optimize harvesting strategies
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-400 mb-2">Multi-Chain Analytics</h4>
                      <p className="text-sm text-slate-300">
                        Monitor and analyze performance across multiple blockchain networks
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
