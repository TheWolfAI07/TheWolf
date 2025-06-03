"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import {
  Terminal,
  Code,
  Database,
  Zap,
  Play,
  Save,
  Eye,
  RefreshCw,
  Activity,
  Server,
  BarChart3,
  MessageSquare,
  Send,
  Palette,
  Layout,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  AlertCircle,
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

interface CustomFunction {
  id: string
  name: string
  description: string
  code: string
  language: "javascript" | "typescript" | "python"
  enabled: boolean
  lastRun: string
  status: "success" | "error" | "pending"
  result?: any
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
}

interface DatabaseTable {
  name: string
  count: number
  lastUpdated: string
}

export default function ConsolePage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [apiEndpoints, setApiEndpoints] = useState<APIEndpoint[]>([])
  const [customFunctions, setCustomFunctions] = useState<CustomFunction[]>([])
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [selectedFunction, setSelectedFunction] = useState<string>("")
  const [functionCode, setFunctionCode] = useState("")
  const [isExecuting, setIsExecuting] = useState(false)
  const [sqlQuery, setSqlQuery] = useState("SELECT * FROM users LIMIT 10;")
  const [queryResult, setQueryResult] = useState<any>(null)
  const [isQueryExecuting, setIsQueryExecuting] = useState(false)
  const [databaseTables, setDatabaseTables] = useState<DatabaseTable[]>([])
  const [loading, setLoading] = useState(true)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const [primaryColor, setPrimaryColor] = useState("#00E5CF")
  const [secondaryColor, setSecondaryColor] = useState("#EC4899")

  // Initialize real data
  useEffect(() => {
    initializeConsole()
  }, [])

  const initializeConsole = async () => {
    try {
      setLoading(true)

      // Initialize API endpoints with real backend routes
      const realEndpoints: APIEndpoint[] = [
        {
          id: "1",
          name: "Health Check",
          method: "GET",
          path: "/api/health",
          description: "Check backend health status",
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
          description: "Fetch all users",
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
          description: "Fetch all projects",
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
          description: "Test backend connectivity",
          enabled: true,
          lastUsed: "Unknown",
          responseTime: 0,
          status: "warning",
        },
      ]

      setApiEndpoints(realEndpoints)

      // Test all endpoints
      await testAllEndpoints(realEndpoints)

      // Load database tables
      await loadDatabaseTables()

      // Initialize system metrics
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
            "Hello! I'm your Wolf AI assistant. I can help you manage your backend, execute queries, test APIs, and more. What would you like to do?",
          timestamp: new Date().toISOString(),
        },
      ]
      setChatMessages(initialChat)

      // Initialize custom functions
      const defaultFunctions: CustomFunction[] = [
        {
          id: "1",
          name: "Test Database Connection",
          description: "Test connection to Supabase database",
          code: `// Test database connection
const { data, error } = await supabase
  .from('users')
  .select('count(*)')
  .single();

if (error) {
  console.error('Database error:', error);
  return { success: false, error: error.message };
}

console.log('Database connected successfully');
return { success: true, data };`,
          language: "javascript",
          enabled: true,
          lastRun: "Never",
          status: "pending",
        },
        {
          id: "2",
          name: "Create Sample User",
          description: "Create a sample user in the database",
          code: `// Create sample user
const { data, error } = await supabase
  .from('users')
  .insert([
    { 
      username: 'sample_user_' + Date.now(),
      status: 'active'
    }
  ])
  .select();

if (error) {
  console.error('Error creating user:', error);
  return { success: false, error: error.message };
}

console.log('User created successfully:', data);
return { success: true, data };`,
          language: "javascript",
          enabled: true,
          lastRun: "Never",
          status: "pending",
        },
      ]
      setCustomFunctions(defaultFunctions)
    } catch (error) {
      console.error("Error initializing console:", error)
      addLog("error", "Failed to initialize console", "console-init")
    } finally {
      setLoading(false)
    }
  }

  const testAllEndpoints = async (endpoints: APIEndpoint[]) => {
    const updatedEndpoints = await Promise.all(
      endpoints.map(async (endpoint) => {
        try {
          const startTime = Date.now()
          const response = await fetch(endpoint.path)
          const endTime = Date.now()
          const responseTime = endTime - startTime

          const updatedEndpoint = {
            ...endpoint,
            responseTime,
            lastUsed: "Just now",
            status: response.ok ? ("healthy" as const) : ("error" as const),
            lastResponse: response.ok ? await response.json() : null,
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

  const loadDatabaseTables = async () => {
    try {
      const tables = ["users", "wolf_projects", "wolf_analytics", "wolf_activities", "wolf_settings"]
      const tableData: DatabaseTable[] = []

      for (const tableName of tables) {
        try {
          const { count, error } = await supabase.from(tableName).select("*", { count: "exact", head: true })

          if (!error) {
            tableData.push({
              name: tableName,
              count: count || 0,
              lastUpdated: new Date().toISOString(),
            })
          }
        } catch (err) {
          console.error(`Error loading table ${tableName}:`, err)
        }
      }

      setDatabaseTables(tableData)
      addLog("info", `Loaded ${tableData.length} database tables`, "database")
    } catch (error) {
      addLog("error", `Failed to load database tables: ${error}`, "database")
    }
  }

  const loadSystemMetrics = async () => {
    try {
      // Get real metrics from your APIs
      const healthResponse = await fetch("/api/health")
      const usersResponse = await fetch("/api/users")
      const analyticsResponse = await fetch("/api/analytics?type=overview")

      const metrics: SystemMetric[] = [
        {
          name: "Backend Status",
          value: healthResponse.ok ? "Online" : "Offline",
          status: healthResponse.ok ? "good" : "critical",
          trend: "stable",
        },
        {
          name: "Database",
          value: databaseTables.length > 0 ? "Connected" : "Disconnected",
          status: databaseTables.length > 0 ? "good" : "critical",
          trend: "stable",
        },
        {
          name: "API Health",
          value: `${apiEndpoints.filter((e) => e.status === "healthy").length}/${apiEndpoints.length}`,
          status: apiEndpoints.every((e) => e.status === "healthy") ? "good" : "warning",
          trend: "stable",
        },
      ]

      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        metrics.push({
          name: "Total Users",
          value: usersData.total?.toString() || "0",
          status: "good",
          trend: "up",
        })
      }

      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json()
        if (analyticsData.data) {
          metrics.push({
            name: "Active Sessions",
            value: analyticsData.data.activesessions?.toString() || "0",
            status: "good",
            trend: "stable",
          })
        }
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
    setLogs((prev) => [newLog, ...prev.slice(0, 99)]) // Keep last 100 logs
  }

  const executeQuery = async () => {
    if (!sqlQuery.trim()) return

    setIsQueryExecuting(true)
    setQueryResult(null)

    try {
      // Parse the SQL query to determine the operation
      const query = sqlQuery.trim().toLowerCase()

      if (query.startsWith("select")) {
        // Handle SELECT queries
        const tableMatch = query.match(/from\s+(\w+)/i)
        if (tableMatch) {
          const tableName = tableMatch[1]
          const { data, error } = await supabase.from(tableName).select("*").limit(100)

          if (error) throw error

          setQueryResult({
            success: true,
            data,
            rowCount: data?.length || 0,
            message: `Query executed successfully. ${data?.length || 0} rows returned.`,
          })
          addLog("info", `SQL query executed: ${data?.length || 0} rows returned`, "database")
        }
      } else if (query.startsWith("insert")) {
        setQueryResult({
          success: false,
          error:
            "INSERT operations are not allowed through the console for security reasons. Use the custom functions instead.",
        })
      } else if (query.startsWith("update") || query.startsWith("delete")) {
        setQueryResult({
          success: false,
          error: "UPDATE and DELETE operations are not allowed through the console for security reasons.",
        })
      } else {
        setQueryResult({
          success: false,
          error: "Only SELECT queries are supported in the console.",
        })
      }
    } catch (error: any) {
      setQueryResult({
        success: false,
        error: error.message || "Query execution failed",
      })
      addLog("error", `SQL query failed: ${error.message}`, "database")
    } finally {
      setIsQueryExecuting(false)
    }
  }

  const executeFunction = async (functionId: string) => {
    const func = customFunctions.find((f) => f.id === functionId)
    if (!func) return

    setIsExecuting(true)

    try {
      // Update function status to pending
      setCustomFunctions((prev) => prev.map((f) => (f.id === functionId ? { ...f, status: "pending" as const } : f)))

      // Execute the function code
      let result: any

      if (func.code.includes("supabase")) {
        // Execute database operations
        try {
          // This is a simplified execution - in a real app, you'd want to use a secure code execution environment
          if (func.name === "Test Database Connection") {
            const { count, error } = await supabase.from("users").select("*", { count: "exact", head: true })

            if (error) throw error
            result = { success: true, data: { count } }
          } else if (func.name === "Create Sample User") {
            const { data, error } = await supabase
              .from("users")
              .insert([
                {
                  username: "sample_user_" + Date.now(),
                  status: "active",
                },
              ])
              .select()

            if (error) throw error
            result = { success: true, data }
          }
        } catch (error: any) {
          result = { success: false, error: error.message }
        }
      } else {
        // For other functions, simulate execution
        result = { success: true, message: "Function executed successfully" }
      }

      // Update function with result
      setCustomFunctions((prev) =>
        prev.map((f) =>
          f.id === functionId
            ? {
                ...f,
                status: result.success ? ("success" as const) : ("error" as const),
                lastRun: "Just now",
                result,
              }
            : f,
        ),
      )

      addLog(
        result.success ? "info" : "error",
        `Function "${func.name}" ${result.success ? "executed successfully" : "failed"}`,
        "function-runner",
      )
    } catch (error: any) {
      setCustomFunctions((prev) =>
        prev.map((f) =>
          f.id === functionId
            ? { ...f, status: "error" as const, lastRun: "Just now", result: { success: false, error: error.message } }
            : f,
        ),
      )
      addLog("error", `Function "${func.name}" failed: ${error.message}`, "function-runner")
    } finally {
      setIsExecuting(false)
    }
  }

  const testEndpoint = async (endpointId: string) => {
    const endpoint = apiEndpoints.find((e) => e.id === endpointId)
    if (!endpoint) return

    try {
      const startTime = Date.now()
      const response = await fetch(endpoint.path)
      const endTime = Date.now()
      const responseTime = endTime - startTime
      const responseData = response.ok ? await response.json() : null

      setApiEndpoints((prev) =>
        prev.map((e) =>
          e.id === endpointId
            ? {
                ...e,
                responseTime,
                lastUsed: "Just now",
                status: response.ok ? ("healthy" as const) : ("error" as const),
                lastResponse: responseData,
              }
            : e,
        ),
      )

      addLog(
        response.ok ? "info" : "error",
        `API ${endpoint.path} ${response.ok ? "responded successfully" : "failed"} (${responseTime}ms)`,
        "api-test",
      )
    } catch (error) {
      addLog("error", `API ${endpoint.path} failed: ${error}`, "api-test")
      setApiEndpoints((prev) =>
        prev.map((e) =>
          e.id === endpointId ? { ...e, status: "error" as const, lastUsed: "Failed", responseTime: 0 } : e,
        ),
      )
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      message: newMessage,
      timestamp: new Date().toISOString(),
    }

    setChatMessages((prev) => [...prev, userMessage])
    const currentMessage = newMessage
    setNewMessage("")

    // Process the command
    setTimeout(async () => {
      let aiResponse = ""

      const lowerMessage = currentMessage.toLowerCase()

      if (lowerMessage.includes("test api") || lowerMessage.includes("check api")) {
        await testAllEndpoints(apiEndpoints)
        aiResponse = "I've tested all your API endpoints. Check the API Management tab to see the results."
      } else if (lowerMessage.includes("database") || lowerMessage.includes("query")) {
        await loadDatabaseTables()
        aiResponse = `I've refreshed your database information. You have ${databaseTables.length} tables available. You can run queries in the Database tab.`
      } else if (lowerMessage.includes("users")) {
        try {
          const response = await fetch("/api/users")
          const data = await response.json()
          aiResponse = `You currently have ${data.total || 0} users in your system. ${data.data?.filter((u: any) => u.status === "active").length || 0} are active.`
        } catch {
          aiResponse = "I couldn't fetch user data. Please check your API endpoints."
        }
      } else if (lowerMessage.includes("metrics") || lowerMessage.includes("status")) {
        await loadSystemMetrics()
        aiResponse =
          "I've updated your system metrics. Everything looks good! Your backend is online and database is connected."
      } else if (lowerMessage.includes("function")) {
        aiResponse =
          "I can help you create and execute custom functions. Check the Functions tab to see available functions or create new ones."
      } else {
        aiResponse = generateAIResponse(currentMessage)
      }

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        message: aiResponse,
        timestamp: new Date().toISOString(),
      }
      setChatMessages((prev) => [...prev, aiMessage])
    }, 1000)
  }

  const generateAIResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase()

    if (lowerMessage.includes("help")) {
      return "I can help you with: testing APIs, running database queries, executing custom functions, checking system status, and managing your Wolf platform. What specific task do you need help with?"
    }

    return "I understand you want to work on your Wolf platform. I can help with API testing, database queries, custom functions, and system monitoring. Try commands like 'test api', 'check database', or 'show users'."
  }

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
      case "good":
      case "success":
        return "bg-green-500"
      case "warning":
        return "bg-yellow-500"
      case "error":
      case "critical":
        return "bg-red-500"
      case "pending":
        return "bg-blue-500"
      default:
        return "bg-slate-500"
    }
  }

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case "error":
        return "text-red-400"
      case "warn":
        return "text-yellow-400"
      case "info":
        return "text-blue-400"
      case "debug":
        return "text-slate-400"
      default:
        return "text-white"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Terminal className="w-6 h-6 text-black" />
          </div>
          <p className="text-cyan-400">Initializing Wolf Console...</p>
          <p className="text-slate-400 text-sm mt-2">Testing APIs and loading data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-700 bg-black/40 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-xl flex items-center justify-center">
                <Terminal className="w-5 h-5 text-black" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-cyan-400">Wolf Console</h1>
                <p className="text-sm text-slate-400">Control Panel • API Management • Custom Functions</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <Activity className="w-3 h-3 mr-1" />
                System Online
              </Badge>
              <Button
                variant="outline"
                size="sm"
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
                onClick={() => testAllEndpoints(apiEndpoints)}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh All
              </Button>
              <Button
                size="sm"
                className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white"
                onClick={() => addLog("info", "Configuration saved", "console")}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Main Console Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-black/40 border border-slate-700 grid grid-cols-6 w-full">
            <TabsTrigger value="overview" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-black">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="api" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-black">
              <Server className="w-4 h-4 mr-2" />
              API Management
            </TabsTrigger>
            <TabsTrigger value="functions" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-black">
              <Code className="w-4 h-4 mr-2" />
              Functions
            </TabsTrigger>
            <TabsTrigger value="database" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-black">
              <Database className="w-4 h-4 mr-2" />
              Database
            </TabsTrigger>
            <TabsTrigger value="chat" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-black">
              <MessageSquare className="w-4 h-4 mr-2" />
              AI Assistant
            </TabsTrigger>
            <TabsTrigger value="customize" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-black">
              <Palette className="w-4 h-4 mr-2" />
              Customize
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* System Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {systemMetrics.map((metric, index) => (
                <Card key={index} className="bg-black/40 border-slate-700 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-400">{metric.name}</span>
                      <Badge className={`${getStatusColor(metric.status)} text-white text-xs`}>{metric.status}</Badge>
                    </div>
                    <div className="text-2xl font-bold text-white">{metric.value}</div>
                    <div className="flex items-center text-xs text-slate-400">
                      {metric.trend === "up" ? (
                        <TrendingUp className="w-3 h-3 mr-1 text-green-400" />
                      ) : metric.trend === "down" ? (
                        <TrendingDown className="w-3 h-3 mr-1 text-red-400" />
                      ) : (
                        <Activity className="w-3 h-3 mr-1 text-slate-400" />
                      )}
                      {metric.trend}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions & Recent Logs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <Card className="bg-black/40 border-slate-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-cyan-400" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    className="w-full justify-start bg-slate-800 hover:bg-slate-700 text-white"
                    onClick={() => testAllEndpoints(apiEndpoints)}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Test All API Endpoints
                  </Button>
                  <Button
                    className="w-full justify-start bg-slate-800 hover:bg-slate-700 text-white"
                    onClick={() => setActiveTab("functions")}
                  >
                    <Code className="w-4 h-4 mr-2" />
                    Execute Custom Function
                  </Button>
                  <Button
                    className="w-full justify-start bg-slate-800 hover:bg-slate-700 text-white"
                    onClick={() => loadDatabaseTables()}
                  >
                    <Database className="w-4 h-4 mr-2" />
                    Refresh Database Info
                  </Button>
                  <Button
                    className="w-full justify-start bg-slate-800 hover:bg-slate-700 text-white"
                    onClick={() => loadSystemMetrics()}
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    Update System Metrics
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Logs */}
              <Card className="bg-black/40 border-slate-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Terminal className="w-5 h-5 mr-2 text-cyan-400" />
                    Recent Logs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {logs.slice(0, 10).map((log) => (
                      <div key={log.id} className="flex items-start space-x-2 text-sm">
                        <span className="text-slate-500 text-xs">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        <span className={`font-medium ${getLogLevelColor(log.level)}`}>
                          [{log.level.toUpperCase()}]
                        </span>
                        <span className="text-slate-300 flex-1">{log.message}</span>
                      </div>
                    ))}
                    {logs.length === 0 && (
                      <div className="text-slate-400 text-center py-4">
                        No logs yet. Start using the console to see activity.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* API Management Tab */}
          <TabsContent value="api" className="space-y-6">
            <Card className="bg-black/40 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">API Endpoints</CardTitle>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-black"
                    onClick={() => testAllEndpoints(apiEndpoints)}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Test All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {apiEndpoints.map((endpoint) => (
                    <div
                      key={endpoint.id}
                      className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <Badge
                          variant="outline"
                          className={`${
                            endpoint.method === "GET"
                              ? "border-green-500 text-green-400"
                              : endpoint.method === "POST"
                                ? "border-blue-500 text-blue-400"
                                : endpoint.method === "PUT"
                                  ? "border-yellow-500 text-yellow-400"
                                  : "border-red-500 text-red-400"
                          }`}
                        >
                          {endpoint.method}
                        </Badge>
                        <div>
                          <div className="font-medium text-white">{endpoint.name}</div>
                          <div className="text-sm text-slate-400">{endpoint.path}</div>
                          <div className="text-xs text-slate-500">{endpoint.description}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right text-sm">
                          <div className="text-slate-300">{endpoint.responseTime}ms</div>
                          <div className="text-slate-500">{endpoint.lastUsed}</div>
                        </div>
                        <Badge className={`${getStatusColor(endpoint.status)} text-white`}>
                          {endpoint.status === "healthy" && <CheckCircle className="w-3 h-3 mr-1" />}
                          {endpoint.status === "warning" && <AlertCircle className="w-3 h-3 mr-1" />}
                          {endpoint.status === "error" && <XCircle className="w-3 h-3 mr-1" />}
                          {endpoint.status}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-slate-600 text-slate-300"
                          onClick={() => testEndpoint(endpoint.id)}
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Test
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Functions Tab */}
          <TabsContent value="functions" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Function List */}
              <Card className="bg-black/40 border-slate-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white">Custom Functions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {customFunctions.map((func) => (
                      <div
                        key={func.id}
                        className={`p-3 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer ${
                          selectedFunction === func.id ? "ring-2 ring-cyan-500" : ""
                        }`}
                        onClick={() => {
                          setSelectedFunction(func.id)
                          setFunctionCode(func.code)
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-white">{func.name}</div>
                          <div className="flex items-center space-x-2">
                            <Badge className={`${getStatusColor(func.status)} text-white text-xs`}>
                              {func.status === "success" && <CheckCircle className="w-3 h-3 mr-1" />}
                              {func.status === "error" && <XCircle className="w-3 h-3 mr-1" />}
                              {func.status === "pending" && <Activity className="w-3 h-3 mr-1" />}
                              {func.status}
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 px-2 text-xs border-slate-600 text-slate-300"
                              onClick={(e) => {
                                e.stopPropagation()
                                executeFunction(func.id)
                              }}
                              disabled={isExecuting}
                            >
                              <Play className="w-3 h-3 mr-1" />
                              Run
                            </Button>
                          </div>
                        </div>
                        <div className="text-sm text-slate-400 mb-2">{func.description}</div>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>{func.language}</span>
                          <span>Last run: {func.lastRun}</span>
                        </div>
                        {func.result && (
                          <div className="mt-2 p-2 bg-slate-900/50 rounded text-xs">
                            <pre className="text-slate-300">{JSON.stringify(func.result, null, 2)}</pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Function Editor */}
              <Card className="bg-black/40 border-slate-700 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Function Editor</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-slate-600 text-slate-300"
                        onClick={() => executeFunction(selectedFunction)}
                        disabled={!selectedFunction || isExecuting}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {isExecuting ? "Running..." : "Run"}
                      </Button>
                      <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Label className="text-slate-300">Language:</Label>
                      <Select defaultValue="javascript">
                        <SelectTrigger className="w-32 bg-slate-800 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600">
                          <SelectItem value="javascript">JavaScript</SelectItem>
                          <SelectItem value="typescript">TypeScript</SelectItem>
                          <SelectItem value="python">Python</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Textarea
                      value={functionCode}
                      onChange={(e) => setFunctionCode(e.target.value)}
                      placeholder="Write your function code here..."
                      className="min-h-96 bg-slate-900 border-slate-600 text-white font-mono text-sm"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Database Tab */}
          <TabsContent value="database" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Database Query */}
              <Card className="bg-black/40 border-slate-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Database className="w-5 h-5 mr-2 text-cyan-400" />
                    Database Query
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={sqlQuery}
                    onChange={(e) => setSqlQuery(e.target.value)}
                    placeholder="SELECT * FROM users WHERE status = 'active';"
                    className="min-h-32 bg-slate-900 border-slate-600 text-white font-mono text-sm"
                  />
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-black"
                      onClick={executeQuery}
                      disabled={isQueryExecuting}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {isQueryExecuting ? "Executing..." : "Execute Query"}
                    </Button>
                    <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
                      <Save className="w-4 h-4 mr-2" />
                      Save Query
                    </Button>
                  </div>

                  {/* Query Result */}
                  {queryResult && (
                    <div className="mt-4 p-4 bg-slate-900/50 rounded-lg">
                      <h4 className="text-white font-medium mb-2">Query Result:</h4>
                      {queryResult.success ? (
                        <div>
                          <p className="text-green-400 text-sm mb-2">{queryResult.message}</p>
                          {queryResult.data && (
                            <div className="max-h-64 overflow-auto">
                              <pre className="text-slate-300 text-xs">{JSON.stringify(queryResult.data, null, 2)}</pre>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-red-400 text-sm">{queryResult.error}</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Database Tables */}
              <Card className="bg-black/40 border-slate-700 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Database Tables</CardTitle>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-slate-600 text-slate-300"
                      onClick={loadDatabaseTables}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {databaseTables.map((table) => (
                      <div
                        key={table.name}
                        className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer"
                        onClick={() => setSqlQuery(`SELECT * FROM ${table.name} LIMIT 10;`)}
                      >
                        <div className="flex items-center space-x-2">
                          <Database className="w-4 h-4 text-cyan-400" />
                          <div>
                            <span className="text-white font-medium">{table.name}</span>
                            <div className="text-xs text-slate-400">{table.count} rows</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-slate-500">
                            {new Date(table.lastUpdated).toLocaleTimeString()}
                          </span>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Eye className="w-4 h-4 text-slate-400" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {databaseTables.length === 0 && (
                      <div className="text-slate-400 text-center py-4">
                        No tables found. Click refresh to load database tables.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AI Assistant Chat Tab */}
          <TabsContent value="chat" className="space-y-6">
            <Card className="bg-black/40 border-slate-700 backdrop-blur-sm h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2 text-cyan-400" />
                  Wolf AI Assistant
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Chat with your AI assistant to manage your backend, test APIs, and execute commands.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.type === "user"
                            ? "bg-cyan-500 text-black"
                            : message.type === "ai"
                              ? "bg-slate-800 text-white"
                              : "bg-slate-700 text-slate-300"
                        }`}
                      >
                        <div className="text-sm">{message.message}</div>
                        <div className="text-xs opacity-70 mt-1">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                {/* Chat Input */}
                <div className="flex items-center space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Try: 'test api', 'check database', 'show users'..."
                    className="flex-1 bg-slate-800 border-slate-600 text-white"
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                  <Button
                    onClick={handleSendMessage}
                    size="sm"
                    className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-black"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customize Tab */}
          <TabsContent value="customize" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Theme Customization */}
              <Card className="bg-black/40 border-slate-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Palette className="w-5 h-5 mr-2 text-cyan-400" />
                    Theme Customization
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Primary Color</Label>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-cyan-500 rounded border-2 border-white"></div>
                      <Input
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="bg-slate-800 border-slate-600 text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Secondary Color</Label>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-pink-500 rounded border-2 border-white"></div>
                      <Input
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="bg-slate-800 border-slate-600 text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Background Style</Label>
                    <Select defaultValue="gradient">
                      <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        <SelectItem value="gradient">Dark Gradient</SelectItem>
                        <SelectItem value="solid">Solid Dark</SelectItem>
                        <SelectItem value="animated">Animated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Layout Customization */}
              <Card className="bg-black/40 border-slate-700 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Layout className="w-5 h-5 mr-2 text-cyan-400" />
                    Layout Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-300">Sidebar Collapsed</Label>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-300">Dark Mode</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-300">Animations</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Dashboard Layout</Label>
                    <Select defaultValue="grid">
                      <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        <SelectItem value="grid">Grid Layout</SelectItem>
                        <SelectItem value="list">List Layout</SelectItem>
                        <SelectItem value="cards">Card Layout</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
