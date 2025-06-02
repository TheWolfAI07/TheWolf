import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "The Wolf backend is working perfectly!",
    timestamp: new Date().toISOString(),
    endpoints: {
      users: "/api/users",
      analytics: "/api/analytics",
      health: "/api/health",
    },
  })
}
