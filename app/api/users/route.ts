import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    const {
      data: users,
      error,
      count,
    } = await supabase.from("users").select("*", { count: "exact" }).order("created_at", { ascending: false })

    if (error) {
      console.error("Users API error:", error)
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          message: "Failed to fetch users from your Supabase database",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      data: users || [],
      total: count || 0,
      message: `Found ${count || 0} users in your database`,
    })
  } catch (error: any) {
    console.error("Users API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Unknown error",
        message: "Failed to connect to your Supabase database",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, email, role = "user" } = body

    if (!username || !email) {
      return NextResponse.json(
        {
          success: false,
          error: "Username and email are required",
        },
        { status: 400 },
      )
    }

    const supabase = createServerSupabaseClient()

    const { data: user, error } = await supabase
      .from("users")
      .insert([
        {
          username,
          email,
          role,
          status: "active",
          last_login: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("User creation error:", error)
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      data: user,
      message: "User created successfully in your Supabase database",
    })
  } catch (error: any) {
    console.error("User creation error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Unknown error",
      },
      { status: 500 },
    )
  }
}
