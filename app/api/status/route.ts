import { NextResponse } from "next/server"

export async function GET() {
  try {
    const startTime = Date.now()

    const status = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      message: "✅ Wolf Platform is operational",
      environment: {
        nodeEnv: process.env.NODE_ENV || "development",
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasPostgresUrl: !!process.env.POSTGRES_URL,
        platform: "vercel",
      },
      version: "1.0.0",
      responseTime: Date.now() - startTime,
      serverTime: new Date().toLocaleString(),
    }

    return NextResponse.json(status, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    })
  } catch (error: any) {
    console.error("Status API error:", error)

    return NextResponse.json(
      {
        status: "error",
        message: "❌ Platform status check failed",
        error: error.message,
        timestamp: new Date().toISOString(),
        version: "1.0.0",
      },
      { status: 500 },
    )
  }
}
