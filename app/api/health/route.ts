import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"

export async function GET() {
  try {
    const startTime = Date.now()

    // Basic health checks
    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime ? Math.floor(process.uptime()) : 0,
      memory: process.memoryUsage ? process.memoryUsage() : null,
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        nodeEnv: process.env.NODE_ENV,
      },
      responseTime: Date.now() - startTime,
    }

    logger.info("Health check completed", {
      status: health.status,
      responseTime: health.responseTime,
    })

    return NextResponse.json(health)
  } catch (error: any) {
    logger.error("Health check failed", {
      error: error.message,
    })

    return NextResponse.json(
      {
        status: "error",
        message: "Health check failed",
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
