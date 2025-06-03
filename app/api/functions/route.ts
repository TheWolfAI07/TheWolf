import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { functionId } = body

    if (!functionId) {
      return NextResponse.json(
        {
          success: false,
          message: "Function ID is required",
        },
        { status: 400 },
      )
    }

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json(
        {
          success: false,
          message: "Database not configured - missing environment variables",
        },
        { status: 503 },
      )
    }

    // Execute the function based on its ID
    let result: any

    try {
      switch (functionId) {
        case "1": // Test Database Connection
          result = await testDatabaseConnection()
          break
        case "2": // Create Sample User
          result = await createSampleUser()
          break
        default:
          result = { success: false, error: "Unknown function ID" }
      }

      // Log the execution
      await logFunctionExecution(functionId, result)

      return NextResponse.json({
        success: result.success,
        data: result,
        message: result.success ? "Function executed successfully" : "Function execution failed",
      })
    } catch (execError: any) {
      console.error("Function execution error:", execError)

      return NextResponse.json(
        {
          success: false,
          data: { success: false, error: execError.message },
          message: "Function execution failed",
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("Functions API error:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Failed to execute function",
        error: error?.message || "Unknown error",
      },
      { status: 500 },
    )
  }
}

async function testDatabaseConnection() {
  try {
    const supabase = createServerSupabaseClient()

    // Check if users table exists and get count
    const { count, error } = await supabase.from("users").select("*", { count: "exact", head: true })

    if (error) {
      console.error("Database connection test failed:", error)
      return {
        success: false,
        error: error.message,
        suggestion: "Check if database tables exist. Try running /api/setup first.",
      }
    }

    return {
      success: true,
      data: {
        count,
        message: "Database connection successful",
        tables: {
          users: true,
        },
      },
    }
  } catch (error: any) {
    console.error("Database connection test error:", error)
    return {
      success: false,
      error: error?.message || "Database connection failed",
    }
  }
}

async function createSampleUser() {
  try {
    const supabase = createServerSupabaseClient()
    const timestamp = Date.now()
    const username = `sample_user_${timestamp}`
    const email = `sample_${timestamp}@example.com`

    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          username,
          email,
          status: "active",
        },
      ])
      .select()

    if (error) {
      console.error("Sample user creation failed:", error)
      return {
        success: false,
        error: error.message,
        suggestion: "Check if users table exists. Try running /api/setup first.",
      }
    }

    return {
      success: true,
      data: data[0],
      message: "Sample user created successfully",
    }
  } catch (error: any) {
    console.error("Sample user creation error:", error)
    return {
      success: false,
      error: error?.message || "User creation failed",
    }
  }
}

async function logFunctionExecution(functionId: string, result: any) {
  try {
    const supabase = createServerSupabaseClient()

    const { error } = await supabase.from("wolf_function_logs").insert([
      {
        function_id: functionId,
        executed_at: new Date().toISOString(),
        success: result.success,
        result: JSON.stringify(result),
      },
    ])

    if (error) {
      console.error("Failed to log function execution:", error)
    }
  } catch (error) {
    console.error("Function logging error:", error)
    // Don't throw - logging failure shouldn't break the function
  }
}
