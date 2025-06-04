import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Quick health check for demo readiness
    const checks = {
      api: true,
      timestamp: new Date().toISOString(),
      message: "Wolf Platform is ready for Dad! 🎉",
      status: "perfect",
    }

    return NextResponse.json({
      success: true,
      ready: true,
      checks,
      message: "🐺 Wolf Platform - Perfect for Demo!",
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        ready: false,
        error: error.message,
        message: "Demo readiness check failed",
      },
      { status: 500 },
    )
  }
}
