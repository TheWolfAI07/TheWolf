import { NextResponse } from "next/server"
import { checkSupabaseConnection, testEdgeFunctions } from "@/lib/supabase"
import { logger } from "@/lib/logger"
import { config } from "@/lib/config"

export async function GET() {
  try {
    const startTime = Date.now()

    logger.info("Starting comprehensive system verification")

    // Check environment variables
    const envCheck = {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasPostgresUrl: !!process.env.POSTGRES_URL,
      nodeEnv: process.env.NODE_ENV,
      isVercel: !!process.env.VERCEL,
    }

    // Test database connection
    const dbCheck = await checkSupabaseConnection()

    // Test Edge Functions
    const edgeCheck = await testEdgeFunctions()

    // Test API routes
    const apiRoutes = ["/api/status", "/api/health"]
    const apiChecks = []

    for (const route of apiRoutes) {
      try {
        const apiStartTime = Date.now()
        const response = await fetch(`${config.api.baseUrl}${route}`, {
          method: "GET",
          headers: { "User-Agent": "Wolf-Platform-Verify" },
        })
        const apiResponseTime = Date.now() - apiStartTime

        apiChecks.push({
          route,
          status: response.ok ? "success" : "error",
          statusCode: response.status,
          responseTime: apiResponseTime,
        })
      } catch (error: any) {
        apiChecks.push({
          route,
          status: "error",
          error: error.message,
        })
      }
    }

    // Overall system health
    const overallHealth = {
      environment: envCheck.hasSupabaseUrl && envCheck.hasSupabaseKey ? "healthy" : "error",
      database: dbCheck.connected ? "healthy" : "error",
      edgeFunctions: edgeCheck.success ? "healthy" : "warning",
      apis: apiChecks.every((check) => check.status === "success") ? "healthy" : "warning",
    }

    const allHealthy = Object.values(overallHealth).every((status) => status === "healthy")
    const hasWarnings = Object.values(overallHealth).some((status) => status === "warning")

    const systemStatus = allHealthy ? "healthy" : hasWarnings ? "degraded" : "error"

    const responseTime = Date.now() - startTime

    const verification = {
      status: systemStatus,
      message: `System verification ${systemStatus === "healthy" ? "passed" : systemStatus === "degraded" ? "completed with warnings" : "failed"}`,
      timestamp: new Date().toISOString(),
      responseTime,
      checks: {
        environment: {
          status: overallHealth.environment,
          details: envCheck,
        },
        database: {
          status: overallHealth.database,
          connected: dbCheck.connected,
          responseTime: dbCheck.responseTime,
          error: dbCheck.error,
        },
        edgeFunctions: {
          status: overallHealth.edgeFunctions,
          success: edgeCheck.success,
          message: edgeCheck.message || edgeCheck.error,
        },
        apis: {
          status: overallHealth.apis,
          routes: apiChecks,
        },
      },
      recommendations: [],
    }

    // Add recommendations based on issues found
    if (!envCheck.hasSupabaseUrl || !envCheck.hasSupabaseKey) {
      verification.recommendations.push("Configure Supabase environment variables")
    }

    if (!dbCheck.connected) {
      verification.recommendations.push("Fix database connection issues")
    }

    if (!edgeCheck.success) {
      verification.recommendations.push("Check Edge Functions configuration")
    }

    const failedApis = apiChecks.filter((check) => check.status === "error")
    if (failedApis.length > 0) {
      verification.recommendations.push(`Fix API routes: ${failedApis.map((api) => api.route).join(", ")}`)
    }

    logger.info("System verification completed", {
      status: systemStatus,
      responseTime,
      issues: verification.recommendations.length,
    })

    return NextResponse.json(verification)
  } catch (error: any) {
    logger.error("System verification failed", {
      error: error.message,
      stack: error.stack,
    })

    return NextResponse.json(
      {
        status: "error",
        message: "System verification failed",
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
