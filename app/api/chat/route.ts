import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { message, context } = body

    if (!message) {
      return NextResponse.json(
        {
          success: false,
          error: "Message is required",
        },
        { status: 400 },
      )
    }

    // Process the message and generate a response
    const response = await generateResponse(message, context)

    // Log the chat message if database is available
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      await logChatMessage(message, response)
    }

    return NextResponse.json({
      success: true,
      data: {
        id: Date.now().toString(),
        type: "ai",
        message: response.message,
        timestamp: new Date().toISOString(),
        metadata: response.metadata,
      },
    })
  } catch (error: any) {
    console.error("Chat API error:", error)

    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to process message",
        data: {
          id: Date.now().toString(),
          type: "ai",
          message: "I'm experiencing technical difficulties. Please try again.",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 },
    )
  }
}

async function generateResponse(message: string, context: any) {
  const lowerMessage = message.toLowerCase()

  // Test API endpoints
  if (lowerMessage.includes("test api") || lowerMessage.includes("api test")) {
    const apiResults = await testAllAPIs()
    return {
      message: `I've tested all your API endpoints:

${apiResults
  .map((r) => `• ${r.name}: ${r.status === "healthy" ? "✅ Working" : "❌ Failed"} (${r.responseTime}ms)`)
  .join("\n")}

Overall health: ${apiResults.filter((r) => r.status === "healthy").length}/${apiResults.length} endpoints working.`,
      metadata: { apiResults },
    }
  }

  // Database queries
  if (lowerMessage.includes("database") || lowerMessage.includes("check database")) {
    try {
      const dbInfo = await getDatabaseInfo()
      return {
        message: `Here's your database status:

${dbInfo.tables.map((t) => `• ${t.name}: ${t.count} records`).join("\n")}

Total records: ${dbInfo.totalRecords}
Last updated: ${new Date().toLocaleTimeString()}`,
        metadata: { databaseInfo: dbInfo },
      }
    } catch (error) {
      return {
        message: "I couldn't check the database status. Please ensure your database is properly configured.",
        metadata: { error: "Database check failed" },
      }
    }
  }

  // System status
  if (lowerMessage.includes("status") || lowerMessage.includes("health") || lowerMessage.includes("system")) {
    try {
      const systemStatus = await getSystemStatus()
      return {
        message: `System Status Report:

• Backend: ${systemStatus.backend}
• Database: ${systemStatus.database}
• APIs: ${systemStatus.apis}
• Environment: ${systemStatus.environment}`,
        metadata: { systemStatus },
      }
    } catch (error) {
      return {
        message: "I couldn't get the system status. There might be a configuration issue.",
        metadata: { error: "System check failed" },
      }
    }
  }

  // Help and commands
  if (lowerMessage.includes("help") || lowerMessage.includes("commands")) {
    return {
      message: `Available Commands:

🔧 **System Management:**
• "test api" - Test all API endpoints
• "check database" - View database status
• "system status" - Get system health

📊 **Analytics:**
• "show analytics" - View system analytics
• "user stats" - Get user statistics

⚡ **Functions:**
• "run function" - Execute custom functions
• "create user" - Add sample user

💬 **General:**
• "help" - Show this help menu

Just type naturally - I understand context!`,
      metadata: { commandList: true },
    }
  }

  // Default response
  return {
    message:
      "I understand you want to work with your Wolf platform. I can help with API testing, database management, system monitoring, and more. Try asking me to 'test api', 'check database', or 'system status'.",
    metadata: { contextAware: true },
  }
}

async function testAllAPIs() {
  const endpoints = [
    { name: "Health Check", path: "/api/health" },
    { name: "Users API", path: "/api/users" },
    { name: "Analytics API", path: "/api/analytics" },
    { name: "Projects API", path: "/api/projects" },
    { name: "Test API", path: "/api/test" },
  ]

  const results = await Promise.all(
    endpoints.map(async (endpoint) => {
      try {
        const startTime = Date.now()
        const response = await fetch(`${endpoint.path}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        })
        const endTime = Date.now()

        return {
          name: endpoint.name,
          path: endpoint.path,
          status: response.ok ? "healthy" : "error",
          responseTime: endTime - startTime,
          statusCode: response.status,
        }
      } catch (error: any) {
        return {
          name: endpoint.name,
          path: endpoint.path,
          status: "error",
          responseTime: 0,
          error: error.message,
        }
      }
    }),
  )

  return results
}

async function getDatabaseInfo() {
  // Only try to access database if environment variables are available
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return {
      tables: [
        { name: "users", count: 0 },
        { name: "wolf_projects", count: 0 },
        { name: "wolf_analytics", count: 0 },
        { name: "wolf_activities", count: 0 },
        { name: "wolf_settings", count: 0 },
      ],
      totalRecords: 0,
    }
  }

  // Import Supabase dynamically to avoid build-time errors
  const { createClient } = await import("@supabase/supabase-js")
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  const tables = ["users", "wolf_projects", "wolf_analytics", "wolf_activities", "wolf_settings"]
  const tableInfo = []
  let totalRecords = 0

  for (const tableName of tables) {
    try {
      const { count, error } = await supabase.from(tableName).select("*", { count: "exact", head: true })

      if (!error && count !== null) {
        tableInfo.push({ name: tableName, count })
        totalRecords += count
      } else {
        tableInfo.push({ name: tableName, count: 0 })
      }
    } catch (err) {
      tableInfo.push({ name: tableName, count: 0 })
    }
  }

  return { tables: tableInfo, totalRecords }
}

async function getSystemStatus() {
  const hasSupabaseConfig = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  let dbStatus = "Not configured"
  let userCount = 0

  if (hasSupabaseConfig) {
    try {
      const { createClient } = await import("@supabase/supabase-js")
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
      const { data: dbTest } = await supabase.from("users").select("count(*)", { count: "exact", head: true })
      dbStatus = dbTest ? "Connected" : "Error"

      const { count } = await supabase.from("users").select("*", { count: "exact", head: true })
      userCount = count || 0
    } catch (error) {
      dbStatus = "Error"
    }
  }

  return {
    backend: "Online",
    database: dbStatus,
    apis: "Available",
    environment: process.env.NODE_ENV || "unknown",
    totalUsers: userCount,
  }
}

async function logChatMessage(message: string, response: any) {
  try {
    const { createClient } = await import("@supabase/supabase-js")
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

    const { error } = await supabase.from("wolf_chat_messages").insert([
      {
        message,
        response: response.message,
        type: "user",
        context: {},
        metadata: response.metadata || {},
      },
    ])

    if (error) {
      console.error("Failed to log chat message:", error)
    }
  } catch (error) {
    console.error("Chat logging error:", error)
    // Don't throw - logging failure shouldn't break the function
  }
}
