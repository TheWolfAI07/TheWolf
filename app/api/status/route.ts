import { NextResponse } from "next/server"
import { checkSupabaseConnection } from "@/lib/supabase"
import { logger } from "@/lib/logger"
import { config } from "@/lib/config"

export async function GET() {
  try {
    const startTime = Date.now()

    logger.info("Status API: Starting system health check")

    // Check real Supabase connection
    const dbStatus = await checkSupabaseConnection()

    const responseTime = Date.now() - startTime

    // Determine overall status based on real checks
    let status = "healthy"
    let message = "🐺 Wolf Platform - All Systems Operational"

    if (!dbStatus.connected) {
      status = "degraded"
      message = "🐺 Wolf Platform - Database Connection Issues"
    }

    const systemStatus = {
      status,
      message,
      environment: {
        nodeEnv: process.env.NODE_ENV || "development",
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasPostgresUrl: !!process.env.POSTGRES_URL,
        platform: process.env.VERCEL ? "vercel" : "local",
      },
      checks: {
        database: {
          status: dbStatus.connected ? "healthy" : "error",
          responseTime: dbStatus.responseTime || 0,
          error: dbStatus.error || null,
        },
      },
      responseTime,
      version: config.system.version,
      timestamp: new Date().toISOString(),
      serverTime: new Date().toLocaleString(),
      setupRequired: !dbStatus.connected,
    }

    logger.info("Status check completed", {
      status,
      responseTime,
      dbConnected: dbStatus.connected,
    })

    return NextResponse.json(systemStatus)
  } catch (error: any) {
    logger.error("Status API error", {
      error: error.message,
      stack: error.stack,
    })

    return NextResponse.json(
      {
        status: "error",
        message: "🐺 Wolf Platform - System Error",
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
