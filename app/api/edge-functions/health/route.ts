import { NextResponse } from "next/server"
import { testEdgeFunctions } from "@/lib/supabase"

export async function GET() {
  try {
    // Test Edge Functions connectivity with improved error handling
    const result = await testEdgeFunctions()

    // Always return a successful response, but include the actual status
    return NextResponse.json({
      success: true,
      status: result.status || "unknown",
      message: result.message || "Edge Functions status checked",
      edgeFunctionsWorking: result.success,
      data: result.data || null,
      error: result.success ? null : result.error,
      details: result.details || null,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Edge Functions health check failed:", error)

    // Even if there's an error, return a successful HTTP response
    // but indicate the Edge Functions status
    return NextResponse.json({
      success: true,
      status: "error",
      message: "Edge Functions health check completed with errors",
      edgeFunctionsWorking: false,
      error: error.message,
      details: {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      timestamp: new Date().toISOString(),
    })
  }
}
