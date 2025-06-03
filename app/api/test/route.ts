import { NextResponse } from "next/server"

export async function GET() {
  try {
    const timestamp = new Date().toISOString()
    const uptime = process.uptime ? Math.floor(process.uptime()) : 0

    return NextResponse.json({
      success: true,
      message: "Wolf Platform API is operational",
      timestamp,
      uptime: `${uptime} seconds`,
      environment: process.env.NODE_ENV || "development",
      version: "1.0.0",
      endpoints: {
        health: "/api/health",
        users: "/api/users",
        projects: "/api/projects",
        analytics: "/api/analytics",
        chat: "/api/chat",
        setup: "/api/setup",
      },
    })
  } catch (error: any) {
    console.error("Test API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Test API failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
