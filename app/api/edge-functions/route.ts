import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    // List of available Edge Functions
    const edgeFunctions = [
      {
        name: "advanced-dashboard-builder",
        url: "https://kpihdtozzfhwjagwuidy.supabase.co/functions/v1/advanced-dashboard-builder",
        description: "Build advanced dashboards with custom widgets",
        status: "active",
      },
      {
        name: "authenticate-user",
        url: "https://kpihdtozzfhwjagwuidy.supabase.co/functions/v1/authenticate-user",
        description: "Handle user authentication and validation",
        status: "active",
      },
      {
        name: "register-user",
        url: "https://kpihdtozzfhwjagwuidy.supabase.co/functions/v1/register-user",
        description: "Register new users with validation",
        status: "active",
      },
      {
        name: "update-user-profile",
        url: "https://kpihdtozzfhwjagwuidy.supabase.co/functions/v1/update-user-profile",
        description: "Update user profile information",
        status: "active",
      },
      {
        name: "get-user-profile",
        url: "https://kpihdtozzfhwjagwuidy.supabase.co/functions/v1/get-user-profile",
        description: "Retrieve user profile data",
        status: "active",
      },
      {
        name: "send-notification",
        url: "https://kpihdtozzfhwjagwuidy.supabase.co/functions/v1/send-notification",
        description: "Send notifications to users",
        status: "active",
      },
      {
        name: "generate-report",
        url: "https://kpihdtozzfhwjagwuidy.supabase.co/functions/v1/generate-report",
        description: "Generate analytics and reports",
        status: "active",
      },
      {
        name: "request-password-reset",
        url: "https://kpihdtozzfhwjagwuidy.supabase.co/functions/v1/request-password-reset",
        description: "Handle password reset requests",
        status: "active",
      },
    ]

    return NextResponse.json({
      success: true,
      data: edgeFunctions,
      total: edgeFunctions.length,
      message: "Edge Functions retrieved successfully",
    })
  } catch (error: any) {
    console.error("Edge Functions API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to retrieve Edge Functions",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const { functionName, payload } = await request.json()

    if (!functionName) {
      return NextResponse.json({ success: false, error: "Function name is required" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Call the Edge Function with proper authentication
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: payload || {},
      headers: {
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY}`,
      },
    })

    if (error) {
      console.error(`Edge Function error (${functionName}):`, error)
      throw new Error(`Edge Function error: ${error.message}`)
    }

    // Log the function call
    await supabase.from("wolf_function_logs").insert([
      {
        function_id: functionName,
        function_name: functionName,
        execution_time: 0, // Would need to measure this
        success: true,
        result: data,
      },
    ])

    return NextResponse.json({
      success: true,
      data,
      message: `Edge Function ${functionName} executed successfully`,
    })
  } catch (error: any) {
    console.error("Edge Function execution error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Edge Function execution failed",
      },
      { status: 500 },
    )
  }
}
