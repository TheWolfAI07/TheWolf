import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    // Get function logs
    const { data: logs, error } = await supabase
      .from("wolf_function_logs")
      .select("*")
      .order("executed_at", { ascending: false })
      .limit(50)

    if (error) {
      console.error("Function logs error:", error)
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          message: "Failed to fetch function logs",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      data: logs || [],
      total: logs?.length || 0,
      message: "Function logs retrieved successfully",
    })
  } catch (error: any) {
    console.error("Functions API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Unknown error",
        message: "Failed to connect to database",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { function_id, function_name, code, language = "javascript" } = body

    if (!function_id || !code) {
      return NextResponse.json(
        {
          success: false,
          error: "Function ID and code are required",
        },
        { status: 400 },
      )
    }

    const startTime = Date.now()
    let result: any = null
    let success = false
    let errorMessage = null

    try {
      // Simple function execution simulation
      if (language === "javascript") {
        // For security, we'll just simulate execution
        result = {
          message: "Function executed successfully",
          timestamp: new Date().toISOString(),
          simulated: true,
        }
        success = true
      } else {
        throw new Error(`Language ${language} not supported`)
      }
    } catch (execError: any) {
      errorMessage = execError.message
      success = false
    }

    const executionTime = Date.now() - startTime

    // Log the execution
    const supabase = createServerSupabaseClient()
    await supabase.from("wolf_function_logs").insert([
      {
        function_id,
        function_name: function_name || function_id,
        execution_time: executionTime,
        success,
        result: result || {},
        error_message: errorMessage,
      },
    ])

    return NextResponse.json({
      success,
      data: {
        function_id,
        execution_time: executionTime,
        result,
        error: errorMessage,
      },
      message: success ? "Function executed successfully" : "Function execution failed",
    })
  } catch (error: any) {
    console.error("Function execution error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Unknown error",
      },
      { status: 500 },
    )
  }
}
