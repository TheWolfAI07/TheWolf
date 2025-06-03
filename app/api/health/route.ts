import { NextResponse } from "next/server"
import { config } from "@/lib/config"

export async function GET() {
  const startTime = Date.now()

  try {
    console.log("🔍 Starting health check...")

    // Initialize health status with safe defaults
    const healthStatus = {
      status: "healthy" as "healthy" | "degraded" | "unhealthy",
      timestamp: new Date().toISOString(),
      responseTime: 0,
      version: config.system.version,
      environment: config.system.environment,
      checks: {
        database: { status: "healthy", error: null, details: {} },
        auth: { status: "healthy", error: null, details: {} },
        environment: { status: "healthy", error: null, details: {} },
      },
      environment_vars: {
        nodeEnv: config.system.environment,
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      },
      setupRequired: false,
      message: "✅ All systems operational",
    }

    // Check environment variables first
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error("❌ Missing environment variables")

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

      return NextResponse.json(healthStatus, { status: 500 })
    }

    console.log("✅ Environment variables OK")

    // Test database connection using dynamic import to avoid server-side issues
    try {
      const { createServerSupabaseClient } = await import("@/lib/supabase")
      const supabase = createServerSupabaseClient()

      console.log("✅ Supabase client created")

      // Test auth connection
      const { error: authError } = await supabase.auth.getSession()
      if (authError && !authError.message.includes("session")) {
        throw new Error(`Auth connection failed: ${authError.message}`)
      }

      console.log("✅ Auth connection OK")
      healthStatus.checks.auth = { status: "healthy", error: null, details: {} }

      // Test database with a simple query
      const { data: dbTest, error: dbError } = await supabase
        .from("wolf_settings")
        .select("count(*)", { count: "exact", head: true })

      if (dbError) {
        console.warn("⚠️ Database query failed:", dbError.message)
        healthStatus.checks.database = {
          status: "degraded",
          error: dbError.message,
          details: { code: dbError.code, hint: dbError.hint },
        }
        healthStatus.setupRequired = true
      } else {
        console.log("✅ Database connection OK")
        healthStatus.checks.database = {
          status: "healthy",
          error: null,
          details: { connectionTest: "passed" },
        }
      }
    } catch (error: any) {
      console.error("❌ Database connection failed:", error.message)
      healthStatus.checks.database = {
        status: "unhealthy",
        error: error.message,
        details: { type: "connection_error" },
      }
      healthStatus.setupRequired = true
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

    console.log(`🎯 Health check completed in ${healthStatus.responseTime}ms - Status: ${healthStatus.status}`)

    const statusCode = healthStatus.status === "healthy" ? 200 : healthStatus.status === "degraded" ? 200 : 503

    return NextResponse.json(healthStatus, { status: statusCode })
  } catch (error: any) {
    const responseTime = Date.now() - startTime

    console.error("💥 Health check failed:", error.message)

    const errorResponse = {
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      responseTime,
      error: error?.message || "Health check failed",
      message: "❌ System health check failed",
      setupRequired: true,
      checks: {
        database: { status: "error", error: error.message, details: {} },
        auth: { status: "error", error: error.message, details: {} },
        environment: { status: "error", error: error.message, details: {} },
      },
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}
