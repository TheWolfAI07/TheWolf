import { NextResponse } from "next/server"
import { createServerSupabaseClient, testEdgeFunctions } from "@/lib/supabase"
import { config } from "@/lib/config"
import { logger } from "@/lib/logger"

export async function GET() {
  const startTime = Date.now()

  try {
    logger.info("Starting comprehensive health check")

    // Initialize health status
    const healthStatus = {
      status: "unknown" as "healthy" | "degraded" | "unhealthy" | "unknown",
      timestamp: new Date().toISOString(),
      responseTime: 0,
      version: config.system.version,
      environment: config.system.environment,
      checks: {
        database: { status: "unknown", error: null, details: {} },
        auth: { status: "unknown", error: null, details: {} },
        tables: { status: "unknown", error: null, details: {} },
        edgeFunctions: { status: "unknown", error: null, details: {} },
        environment: { status: "unknown", error: null, details: {} },
      },
      environment: {
        nodeEnv: config.system.environment,
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        appUrl: process.env.NEXT_PUBLIC_APP_URL || "not_set",
      },
      setupRequired: false,
      message: "",
    }

    // Check environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      healthStatus.checks.environment = {
        status: "unhealthy",
        error: "Missing required environment variables",
        details: {
          missingVars: [
            !process.env.NEXT_PUBLIC_SUPABASE_URL && "NEXT_PUBLIC_SUPABASE_URL",
            !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && "NEXT_PUBLIC_SUPABASE_ANON_KEY",
          ].filter(Boolean),
        },
      }

      healthStatus.status = "unhealthy"
      healthStatus.message = "❌ Critical environment variables missing"
      healthStatus.responseTime = Date.now() - startTime

      logger.critical("Health check failed - missing environment variables", {
        missingVars: healthStatus.checks.environment.details.missingVars,
      })

      return NextResponse.json(healthStatus, { status: 500 })
    }

    healthStatus.checks.environment = { status: "healthy", error: null, details: {} }

    // Test database connection
    let supabase
    try {
      supabase = createServerSupabaseClient()

      // Test auth connection
      const { error: authError } = await supabase.auth.getSession()

      if (authError && !authError.message.includes("session")) {
        throw new Error(`Auth connection failed: ${authError.message}`)
      }

      healthStatus.checks.auth = { status: "healthy", error: null, details: {} }

      // Test database connection with a simple query
      const { data: dbTest, error: dbError } = await supabase
        .from("wolf_settings")
        .select("count(*)", { count: "exact", head: true })

      if (dbError) {
        healthStatus.checks.database = {
          status: "degraded",
          error: dbError.message,
          details: { code: dbError.code, hint: dbError.hint },
        }

        logger.warn("Database connection degraded", {
          error: dbError.message,
          code: dbError.code,
        })
      } else {
        healthStatus.checks.database = {
          status: "healthy",
          error: null,
          details: { connectionTest: "passed" },
        }

        logger.info("Database connection healthy")
      }
    } catch (error: any) {
      logger.error("Database connection failed", {
        error: error.message,
        stack: error.stack,
      })

      healthStatus.checks.database = {
        status: "unhealthy",
        error: error.message,
        details: { type: "connection_error" },
      }
    }

    // Check required tables
    const requiredTables = [
      "wolf_settings",
      "wolf_analytics",
      "wolf_projects",
      "wolf_activities",
      "wolf_notifications",
      "wolf_logs",
    ]

    const tableStatus: Record<string, boolean> = {}
    let tablesHealthy = 0

    if (supabase && healthStatus.checks.database.status !== "unhealthy") {
      for (const table of requiredTables) {
        try {
          const { error } = await supabase.from(table).select("count(*)", { count: "exact", head: true })

          tableStatus[table] = !error
          if (!error) tablesHealthy++
        } catch (error) {
          tableStatus[table] = false
        }
      }
    }

    const allTablesExist = tablesHealthy === requiredTables.length
    healthStatus.setupRequired = !allTablesExist

    healthStatus.checks.tables = {
      status: allTablesExist ? "healthy" : tablesHealthy > 0 ? "degraded" : "unhealthy",
      error: allTablesExist ? null : `${tablesHealthy}/${requiredTables.length} tables available`,
      details: {
        tables: tableStatus,
        healthy: tablesHealthy,
        total: requiredTables.length,
      },
    }

    logger.info("Tables check completed", {
      tablesHealthy,
      totalTables: requiredTables.length,
      allTablesExist,
    })

    // Check Edge Functions
    try {
      const edgeFunctionsResult = await testEdgeFunctions()

      healthStatus.checks.edgeFunctions = {
        status: edgeFunctionsResult.success ? "healthy" : "degraded",
        error: edgeFunctionsResult.error || null,
        details: {
          status: edgeFunctionsResult.status,
          message: edgeFunctionsResult.message,
        },
      }

      logger.info("Edge Functions check completed", {
        status: edgeFunctionsResult.status,
        success: edgeFunctionsResult.success,
      })
    } catch (error: any) {
      logger.error("Edge Functions check failed", {
        error: error.message,
        stack: error.stack,
      })

      healthStatus.checks.edgeFunctions = {
        status: "degraded",
        error: error.message,
        details: { type: "check_error" },
      }
    }

    // Determine overall status
    const checkStatuses = Object.values(healthStatus.checks).map((check) => check.status)

    if (checkStatuses.includes("unhealthy")) {
      healthStatus.status = "unhealthy"
      healthStatus.message = "❌ Critical system components are failing"
    } else if (checkStatuses.includes("degraded")) {
      healthStatus.status = "degraded"
      healthStatus.message = "⚠️ Some system components need attention"
    } else {
      healthStatus.status = "healthy"
      healthStatus.message = "✅ All systems operational"
    }

    if (healthStatus.setupRequired) {
      healthStatus.message += " - Database setup required"
    }

    healthStatus.responseTime = Date.now() - startTime

    logger.info(`Health check completed in ${healthStatus.responseTime}ms - Status: ${healthStatus.status}`)

    const statusCode = healthStatus.status === "healthy" ? 200 : healthStatus.status === "degraded" ? 200 : 503

    return NextResponse.json(healthStatus, { status: statusCode })
  } catch (error: any) {
    const responseTime = Date.now() - startTime

    logger.critical("Health check failed with exception", {
      error: error.message,
      stack: error.stack,
      responseTime,
    })

    const errorResponse = {
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      responseTime,
      error: error?.message || "Health check failed",
      message: "❌ System health check failed",
      setupRequired: true,
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}
