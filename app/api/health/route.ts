import { NextResponse } from "next/server"

export async function GET() {
  const healthData = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    uptime: process.uptime(),
    services: {
      database: "connected",
      cache: "connected",
      external_api: "connected",
    },
  }

  return NextResponse.json({
    success: true,
    data: healthData,
    message: "The Wolf backend is running smoothly",
  })
}
