import { NextResponse } from "next/server"
import { createServerSupabaseClient, initializeDatabase } from "@/lib/supabase"
import { logger } from "@/lib/logger"
import { config } from "@/lib/config"

export async function GET() {
  return await setupDatabase()
}

export async function POST() {
  return await setupDatabase()
}

async function setupDatabase() {
  const startTime = Date.now()

  try {
    logger.info("Starting Wolf Platform database setup")

    // Validate environment
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const error = "Missing required Supabase environment variables"
      logger.critical(error, {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      })

      throw new Error(error)
    }

    const supabase = createServerSupabaseClient()

    // Test connection
    logger.info("Testing database connection")
    const { error: connectionError } = await supabase.auth.getSession()
    if (connectionError && !connectionError.message.includes("session")) {
      throw new Error(`Database connection failed: ${connectionError.message}`)
    }
    logger.info("Database connection successful")

    // Initialize database
    const result = await initializeDatabase()

    if (!result.success) {
      throw new Error(result.error || "Database initialization failed")
    }

    // Verify setup
    logger.info("Verifying setup")
    const verification = await verifySetup(supabase)

    const setupTime = Date.now() - startTime
    logger.info(`Wolf Platform setup completed in ${setupTime}ms`, {
      tablesCreated: verification.tablesExist,
      totalTables: verification.totalTables,
      settingsConfigured: verification.settingsConfigured,
    })

    return NextResponse.json({
      success: true,
      message: "Wolf Platform database setup completed successfully",
      details: {
        tables: result.tablesCreated,
        configuration: result.dataInserted,
        verification,
        setupTime: `${setupTime}ms`,
        timestamp: new Date().toISOString(),
        version: config.system.version,
      },
    })
  } catch (error: any) {
    const setupTime = Date.now() - startTime
    logger.critical("Database setup failed", {
      error: error.message,
      stack: error.stack,
      setupTime,
    })

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Database setup failed",
        details: {
          setupTime: `${setupTime}ms`,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 },
    )
  }
}

async function verifySetup(supabase: any) {
  const verification = {
    tablesExist: 0,
    totalTables: 0,
    settingsConfigured: false,
    rlsEnabled: 0,
    indexesCreated: 0,
  }

  const requiredTables = [
    "wolf_settings",
    "wolf_analytics",
    "wolf_projects",
    "wolf_activities",
    "wolf_notifications",
    "wolf_logs",
  ]

  verification.totalTables = requiredTables.length

  // Check tables exist
  for (const table of requiredTables) {
    try {
      const { error } = await supabase.from(table).select("count(*)", { count: "exact", head: true })

      if (!error) {
        verification.tablesExist++
      }
    } catch (error) {
      // Table doesn't exist
    }
  }

  // Check settings
  try {
    const { data, error } = await supabase.from("wolf_settings").select("key").eq("key", "setup_completed").single()

    verification.settingsConfigured = !error && data
  } catch (error) {
    verification.settingsConfigured = false
  }

  return verification
}
