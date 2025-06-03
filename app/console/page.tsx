"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"

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
  metadata?: any
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
  const [setupRequired, setSetupRequired] = useState(false)
  const [isSettingUp, setIsSettingUp] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

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

      // Check if setup is required
      const healthResponse = await fetch("/api/health")
      const healthData = await healthResponse.json()
      
      setSetupRequired(healthData.setupRequired === true)
      
      if (healthData.setupRequired) {
        addLog("warn", "Database setup required. Click 'Initialize Database' to set up required tables.", "system")
      }

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
      email: 'sample_' + Date.now() + '@example.com',
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
        await loadDatabaseTables()
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
          
          // Set up timeout for fetch
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
          
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

      if (analyticsResponse && analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json()
        if (analyticsData.data) {
          metrics.push({
            name: "Active Sessions",
            value: analyticsData.data.activeSessions?.toString() || "0",
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
        if\
