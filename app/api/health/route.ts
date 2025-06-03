import { NextResponse } from "next/server"

export async function GET() {
  try {
    const startTime = Date.now()

    // Check database connection
    const dbStatus = { connected: false, error: null, tables: {}, tablesExist: false }

    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        const { createClient } = await import("@supabase/supabase-js")
        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

        // Test connection
        const { error: connectionError } = await supabase.auth.getSession()

        if (!connectionError || connectionError.message.includes("session")) {
          dbStatus.connected = true

          // Check tables
          const tables = [
            "users",
            "wolf_projects",
            "wolf_analytics",
            "wolf_activities",
            "wolf_settings",
            "wolf_chat_messages",
            "wolf_function_logs",
          ]
          const tableStatus: Record<string, boolean> = {}

          for (const table of tables) {
            try {
              const { error } = await supabase.from(table).select("count(*)", { count: "exact", head: true })
              tableStatus[table] = !error
            } catch (error) {
              tableStatus[table] = false
            }
          }

          dbStatus.tables = tableStatus
          dbStatus.tablesExist = Object.values(tableStatus).some((exists) => exists)
        } else {
          dbStatus.error = connectionError.message
        }
      } else {
        dbStatus.error = "Environment variables not configured"
      }
    } catch (error: any) {
      dbStatus.error = error.message
    }

    const responseTime = Date.now() - startTime

    const healthData = {
      status: dbStatus.connected && dbStatus.tablesExist ? "healthy" : "needs_setup",
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      database: dbStatus,
      environment: {
        supabaseConfigured: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
        nodeEnv: process.env.NODE_ENV || "development",
        appUrl: process.env.NEXT_PUBLIC_APP_URL || "not_set",
      },
      setupRequired: !dbStatus.tablesExist,
      message: dbStatus.tablesExist
        ? "🎉 Wolf Platform is fully operational!"
        : "⚙️ Database setup required - visit /api/setup to initialize",
    }

    return NextResponse.json(healthData)
  } catch (error: any) {
    console.error("Health check error:", error)

    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: error?.message || "Health check failed",
        message: "❌ Platform health check failed",
      },
      { status: 500 },
    )
  }
}
