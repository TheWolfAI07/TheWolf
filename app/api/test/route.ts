import { NextResponse } from "next/server"

export async function GET() {
  try {
    const timestamp = new Date().toISOString()

    // Basic system checks
    const checks = {
      server: "online",
      timestamp,
      environment: process.env.NODE_ENV || "unknown",
      supabaseConfigured: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    }

    return NextResponse.json({
      success: true,
      message: "Test API endpoint is working",
      data: checks,
      timestamp,
    })
  } catch (error: any) {
    console.error("Test API error:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Test API endpoint failed",
        error: error?.message || "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
