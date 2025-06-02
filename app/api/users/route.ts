import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get("limit")

    const supabase = createServerSupabaseClient()

    let query = supabase.from("users").select("*").order("id", { ascending: true })

    if (limit) {
      query = query.limit(Number.parseInt(limit))
    }

    const { data: users, error } = await query

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: users || [],
      total: users?.length || 0,
      message: "Users retrieved successfully",
    })
  } catch (error) {
    console.error("Users GET error:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, status = "active" } = body

    if (!username) {
      return NextResponse.json({ success: false, message: "Username is required" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Check if user already exists
    const { data: existingUser } = await supabase.from("users").select("username").eq("username", username).single()

    if (existingUser) {
      return NextResponse.json({ success: false, message: "User with this username already exists" }, { status: 409 })
    }

    const { data, error } = await supabase.from("users").insert([{ username, status }]).select()

    if (error) throw error

    return NextResponse.json(
      {
        success: true,
        data: data[0],
        message: "User created successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Users POST error:", error)
    return NextResponse.json({ success: false, message: "Failed to create user" }, { status: 500 })
  }
}
