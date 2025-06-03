"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Activity,
  Database,
  MessageSquare,
  Play,
  RefreshCw,
  Settings,
  Terminal,
  Zap,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
} from "lucide-react"

interface APIEndpoint {
  id: string
  name: string
  method: "GET" | "POST" | "PUT" | "DELETE"
  path: string
  description: string
  enabled: boolean
  lastUsed: string
  responseTime: number
  status: "healthy" | "warning" | "error"
  lastResponse?: any
}

interface SystemMetric {
  name: string
  value: string
  status: "good" | "warning" | "critical"
  trend: "up" | "down" | "stable"
}

interface LogEntry {
  id: string
  timestamp: string
  level: "info" | "warn" | "error" | "debug"
  message: string
  source: string
}

interface ChatMessage {
  id: string
  type: "user" | "system" | "ai"
  message: string
  timestamp: string
  metadata?: any
}

export default function ConsolePage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [apiEndpoints, setApiEndpoints] = useState<APIEndpoint[]>([])
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [sqlQuery, setSqlQuery] = useState("SELECT * FROM users LIMIT 10;")
  const [queryResult, setQueryResult] = useState<any>(null)
  const [isQueryExecuting, setIsQueryExecuting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [setupRequired, setSetupRequired] = useState(false)
  const [isSettingUp, setIsSettingUp] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    initializeConsole()
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages])

  const initializeConsole = async () => {
    try {
      setLoading(true)

      // Initialize API endpoints
      const endpoints: APIEndpoint[] = [
        {
          id: "1",
          name: "Health Check",
          method: "GET",
          path: "/api/health",
          description: "Check system health status",
          enabled: true,
          lastUsed: "Unknown",
          responseTime: 0,
          status: "warning",
        },
        {
          id: "2",
          name: "Users API",
          method: "GET",
          path: "/api/users",
          description: "Manage users",
          enabled: true,
          lastUsed: "Unknown",
          responseTime: 0,
          status: "warning",
        },
        {
          id: "3",
          name: "Analytics API",
          method: "GET",
          path: "/api/analytics",
          description: "Get analytics data",
          enabled: true,
          lastUsed: "Unknown",
          responseTime: 0,
          status: "warning",
        },
        {
          id: "4",
          name: "Projects API",
          method: "GET",
          path: "/api/projects",
          description: "Manage projects",
          enabled: true,
          lastUsed: "Unknown",
          responseTime: 0,
          status: "warning",
        },
        {
          id: "5",
          name: "Test API",
          method: "GET",
          path: "/api/test",
          description: "Test connectivity",
          enabled: true,
          lastUsed: "Unknown",
          responseTime: 0,
          status: "warning",
        },
      ]

      setApiEndpoints(endpoints)

      // Check system health
      await checkSystemHealth()

      // Test all endpoints
      await testAllEndpoints(endpoints)

      // Load system metrics
      await loadSystemMetrics()

      // Initialize chat
      const initialChat: ChatMessage[] = [
        {
          id: "1",
          type: "system",
          message: "Wolf Console initialized successfully. All systems online.",
          timestamp: new Date().toISOString(),
        },
        {
          id: "2",
          type: "ai",
          message:
            "Hello! I'm your Wolf AI assistant. I can help you manage your platform, test APIs, and more. Type 'help' to see available commands.",
          timestamp: new Date().toISOString(),
        },
      ]
      setChatMessages(initialChat)

      addLog("info", "Console initialized successfully", "console")
    } catch (error) {
      console.error("Error initializing console:", error)
      addLog("error", "Failed to initialize console", "console")
    } finally {
      setLoading(false)
    }
  }

  const checkSystemHealth = async () => {
    try {
      const response = await fetch("/api/health")
      const healthData = await response.json()

      setSetupRequired(healthData.setupRequired === true)

      if (healthData.setupRequired) {
        addLog("warn", "Database setup required. Click 'Initialize Database' to set up required tables.", "system")
      } else {
        addLog("info", "System health check completed successfully", "system")
      }
    } catch (error) {
      addLog("error", "Health check failed", "system")
    }
  }

  const setupDatabase = async () => {
    try {
      setIsSettingUp(true)
      addLog("info", "Setting up database...", "system")

      const response = await fetch("/api/setup")
      const result = await response.json()

      if (result.success) {
        addLog("info", "Database setup successful!", "system")
        setSetupRequired(false)

        // Refresh data
        await testAllEndpoints(apiEndpoints)
        await loadSystemMetrics()
      } else {
        addLog("error", `Database setup failed: ${result.error || "Unknown error"}`, "system")
      }
    } catch (error) {
      console.error("Database setup error:", error)
      addLog("error", `Database setup error: ${error}`, "system")
    } finally {
      setIsSettingUp(false)
    }
  }

  const testAllEndpoints = async (endpoints: APIEndpoint[]) => {
    const updatedEndpoints = await Promise.all(
      endpoints.map(async (endpoint) => {
        try {
          const startTime = Date.now()
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 5000)

          const response = await fetch(endpoint.path, { signal: controller.signal })
          clearTimeout(timeoutId)

          const endTime = Date.now()
          const responseTime = endTime - startTime

          let responseData = null
          try {
            responseData = await response.json()
          } catch (jsonError) {
            console.error(`Error parsing JSON from ${endpoint.path}:`, jsonError)
          }

          const updatedEndpoint = {
            ...endpoint,
            responseTime,
            lastUsed: "Just now",
            status: response.ok ? ("healthy" as const) : ("error" as const),
            lastResponse: responseData,
          }

          addLog(
            response.ok ? "info" : "error",
            `API ${endpoint.path} ${response.ok ? "responded successfully" : "failed"} (${responseTime}ms)`,
            "api-test",
          )

          return updatedEndpoint
        } catch (error) {
          addLog("error", `API ${endpoint.path} failed: ${error}`, "api-test")
          return {
            ...endpoint,
            status: "error" as const,
            lastUsed: "Failed",
            responseTime: 0,
          }
        }
      }),
    )

    setApiEndpoints(updatedEndpoints)
  }

  const loadSystemMetrics = async () => {
    try {
      const healthResponse = await fetch("/api/health")
      const healthData = await healthResponse.json()

      let usersResponse, analyticsResponse

      try {
        usersResponse = await fetch("/api/users")
        analyticsResponse = await fetch("/api/analytics?type=overview")
      } catch (error) {
        console.error("Error fetching API data:", error)
      }

      const metrics: SystemMetric[] = [
        {
          name: "Backend Status",
          value: healthData.status || "Unknown",
          status: healthData.status === "healthy" ? "good" : healthData.status === "degraded" ? "warning" : "critical",
          trend: "stable",
        },
        {
          name: "Database",
          value: healthData.database?.connected ? "Connected" : "Disconnected",
          status: healthData.database?.connected ? "good" : "critical",
          trend: "stable",
        },
        {
          name: "API Health",
          value: `${apiEndpoints.filter((e) => e.status === "healthy").length}/${apiEndpoints.length}`,
          status: apiEndpoints.every((e) => e.status === "healthy") ? "good" : "warning",
          trend: "stable",
        },
      ]

      if (usersResponse && usersResponse.ok) {
        const usersData = await usersResponse.json()
        metrics.push({
          name: "Total Users",
          value: usersData.total?.toString() || "0",
          status: "good",
          trend: "up",
        })
      }

      setSystemMetrics(metrics)
    } catch (error) {
      addLog("error", `Failed to load system metrics: ${error}`, "metrics")
    }
  }

  const addLog = (level: "info" | "warn" | "error" | "debug", message: string, source: string) => {
    const newLog: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      level,
      message,
      source,
    }
    setLogs((prev) => [newLog, ...prev.slice(0, 99)])
  }

  const sendChatMessage = async () => {
    if (!newMessage.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      message: newMessage,
      timestamp: new Date().toISOString(),
    }

    setChatMessages((prev) => [...prev, userMessage])
    setNewMessage("")

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newMessage }),
      })

      const result = await response.json()

      if (result.success) {
        setChatMessages((prev) => [...prev, result.data])
      } else {
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: "ai",
          message: "Sorry, I encountered an error processing your message.",
          timestamp: new Date().toISOString(),
        }
        setChatMessages((prev) => [...prev, errorMessage])
      }
    } catch (error) {
      console.error("Chat error:", error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        message: "I'm having trouble connecting right now. Please try again.",
        timestamp: new Date().toISOString(),
      }
      setChatMessages((prev) => [...prev, errorMessage])
    }
  }

  const executeQuery = async () => {
    if (!sqlQuery.trim()) return

    setIsQueryExecuting(true)
    setQueryResult(null)

    try {
      // For now, we'll simulate query execution
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setQueryResult({
        success: true,
        message: "Query executed successfully (simulated)",
        data: [
          { id: 1, username: "demo_user", email: "demo@wolf.com", status: "active" },
          { id: 2, username: "test_user", email: "test@wolf.com", status: "active" },
        ],
        rowCount: 2,
        executionTime: "1.2ms",
      })

      addLog("info", `SQL query executed: ${sqlQuery}`, "database")
    } catch (error) {
      setQueryResult({
        success: false,
        error: "Query execution failed",
        message: "Database query simulation failed",
      })
      addLog("error", `SQL query failed: ${error}`, "database")
    } finally {
      setIsQueryExecuting(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
      case "good":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case "error":
      case "critical":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Initializing Wolf Console...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Wolf Console</h1>
          <p className="text-muted-foreground">Platform management and monitoring</p>
        </div>
        {setupRequired && (
          <Button onClick={setupDatabase} disabled={isSettingUp} className="bg-blue-600 hover:bg-blue-700">
            {isSettingUp ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Setting up...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                Initialize Database
              </>
            )}
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="apis">APIs</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {systemMetrics.map((metric, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                  {getStatusIcon(metric.status)}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {metric.trend === "up" ? "↗" : metric.trend === "down" ? "↘" : "→"} {metric.trend}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  API Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {apiEndpoints.slice(0, 5).map((endpoint) => (
                    <div key={endpoint.id} className="flex items-center justify-between">
                      <span className="text-sm">{endpoint.name}</span>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(endpoint.status)}
                        <span className="text-xs text-muted-foreground">{endpoint.responseTime}ms</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => testAllEndpoints(apiEndpoints)}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Test All APIs
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab("database")}>
                  <Database className="h-4 w-4 mr-2" />
                  Query Database
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab("chat")}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Open Chat
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="apis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                API Endpoints
              </CardTitle>
              <CardDescription>Monitor and test your API endpoints</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiEndpoints.map((endpoint) => (
                  <div key={endpoint.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={endpoint.method === "GET" ? "default" : "secondary"}>{endpoint.method}</Badge>
                        <span className="font-medium">{endpoint.name}</span>
                        {getStatusIcon(endpoint.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{endpoint.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {endpoint.path} • Last used: {endpoint.lastUsed} • {endpoint.responseTime}ms
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testAllEndpoints([endpoint])}
                      disabled={!endpoint.enabled}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Test
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Console
              </CardTitle>
              <CardDescription>Execute SQL queries and manage your database</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">SQL Query</label>
                <Textarea
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  placeholder="Enter your SQL query here..."
                  className="mt-1"
                  rows={4}
                />
              </div>
              <Button onClick={executeQuery} disabled={isQueryExecuting}>
                {isQueryExecuting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Execute Query
                  </>
                )}
              </Button>
              {queryResult && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Query Result</h4>
                  <div className="bg-muted p-4 rounded-lg">
                    <pre className="text-sm overflow-auto">{JSON.stringify(queryResult, null, 2)}</pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                AI Assistant
              </CardTitle>
              <CardDescription>Chat with your Wolf AI assistant</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96 w-full border rounded-lg p-4">
                <div className="space-y-4">
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.type === "user"
                            ? "bg-blue-600 text-white"
                            : message.type === "system"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-muted"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                        <p className="text-xs opacity-70 mt-1">{new Date(message.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
              </ScrollArea>
              <div className="flex gap-2 mt-4">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={(e) => e.key === "Enter" && sendChatMessage()}
                />
                <Button onClick={sendChatMessage}>Send</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                System Logs
              </CardTitle>
              <CardDescription>View system activity and debug information</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96 w-full">
                <div className="space-y-2">
                  {logs.map((log) => (
                    <div key={log.id} className="flex items-start gap-2 text-sm">
                      <span className="text-muted-foreground text-xs">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <Badge
                        variant={log.level === "error" ? "destructive" : log.level === "warn" ? "secondary" : "default"}
                        className="text-xs"
                      >
                        {log.level}
                      </Badge>
                      <span className="text-xs text-muted-foreground">[{log.source}]</span>
                      <span className="flex-1">{log.message}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Console Settings
              </CardTitle>
              <CardDescription>Configure your Wolf Console preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Environment</h4>
                <p className="text-sm text-muted-foreground">
                  Current environment: {process.env.NODE_ENV || "development"}
                </p>
              </div>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-medium">Database Status</h4>
                <p className="text-sm text-muted-foreground">
                  {setupRequired ? "Database setup required" : "Database connected and ready"}
                </p>
              </div>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-medium">Actions</h4>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => window.location.reload()}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Console
                  </Button>
                  <Button variant="outline" onClick={() => testAllEndpoints(apiEndpoints)}>
                    <Zap className="h-4 w-4 mr-2" />
                    Test All APIs
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
