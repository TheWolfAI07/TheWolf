import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Redirect to setup endpoint for initialization
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    const setupUrl = `${baseUrl}/api/setup`

    // Call setup endpoint
    const response = await fetch(setupUrl)
    const result = await response.json()

    return NextResponse.json({
      message: "🚀 Wolf Platform Auto-Initialization",
      setup_result: result,
      status: result.success ? "LIVE" : "SETUP_REQUIRED",
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "❌ Auto-initialization failed",
        error: error?.message,
        manual_setup: "Visit /api/setup to initialize manually",
      },
      { status: 500 },
    )
  }
}
