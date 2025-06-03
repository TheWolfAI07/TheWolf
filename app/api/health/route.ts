import { NextResponse } from "next/server"
import { checkSupabaseConnection, createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    const startTime = Date.now()

    // Check database connection using your actual Supabase
    const dbStatus = await checkSupabaseConnection()

    // Check if tables exist
    const tablesStatus = {
      users: false,
      wolf_projects: false,
      wolf_analytics: false,
      wolf_activities: false,
      wolf_settings: false,
      wolf_chat_messages: false,
      wolf_function_logs: false,
    }

    if (dbStatus.connected) {
      try {
        const supabase = createServerSupabaseClient()

        // Check each table
        for (const table of Object.keys(tablesStatus)) {
          try {
            const { error } = await supabase.from(table).select("count(*)", { count: "exact", head: true })
            tablesStatus[table as keyof typeof tablesStatus] = !error
          } catch (error) {
            console.log(`Table ${table} check failed:`, error)
          }
        }
      } catch (error) {
        console.error("Table check error:", error)
      }
    }

    const responseTime = Date.now() - startTime
    const tablesExist = Object.values(tablesStatus).some((exists) => exists)

    const healthData = {
      status: dbStatus.connected && tablesExist ? "healthy" : "needs_setup",
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      database: {
        connected: dbStatus.connected,
        error: dbStatus.error,
        tables: tablesStatus,
        tablesExist,
      },
      environment: {
        supabaseConfigured: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
        nodeEnv: process.env.NODE_ENV || "development",
      },
      setupRequired: !tablesExist,
      message: tablesExist
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
