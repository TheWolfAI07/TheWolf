import { NextResponse } from "next/server"
import { createServerSupabaseClient, safeDbOperation } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""

    const supabase = createServerSupabaseClient()

    // Build query
    let query = supabase
      .from("profiles")
      .select(
        `
        id,
        email,
        username,
        full_name,
        avatar_url,
        role,
        status,
        last_sign_in_at,
        created_at
      `,
        { count: "exact" },
      )
      .order("created_at", { ascending: false })

    // Add search filter if provided
    if (search) {
      query = query.or(`email.ilike.%${search}%,username.ilike.%${search}%,full_name.ilike.%${search}%`)
    }

    // Add pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      console.error("❌ Failed to fetch users:", error)
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 },
      )
    }

    // Get user statistics
    const { data: statsData } = await safeDbOperation(
      () => supabase.from("profiles").select("status, role, created_at"),
      [],
    )

    const stats = {
      total: count || 0,
      active: statsData.data?.filter((u) => u.status === "active").length || 0,
      inactive: statsData.data?.filter((u) => u.status === "inactive").length || 0,
      admins: statsData.data?.filter((u) => u.role === "admin" || u.role === "super_admin").length || 0,
      newThisWeek:
        statsData.data?.filter((u) => {
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          return new Date(u.created_at) > weekAgo
        }).length || 0,
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      stats,
      message: `Retrieved ${data?.length || 0} users`,
    })
  } catch (error: any) {
    console.error("❌ Users API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch users",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, username, full_name, role = "user" } = body

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: "Email is required",
        },
        { status: 400 },
      )
    }

    const supabase = createServerSupabaseClient()

    // Create user profile (assuming auth user already exists)
    const { data, error } = await supabase
      .from("profiles")
      .insert([
        {
          email,
          username: username || email.split("@")[0],
          full_name,
          role,
          status: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("❌ Failed to create user:", error)
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 },
      )
    }

    // Log user creation activity
    await supabase.from("wolf_activities").insert([
      {
        user_id: data.id,
        action: "user_created",
        details: { email, role },
        success: true,
      },
    ])

    return NextResponse.json({
      success: true,
      data,
      message: "User created successfully",
    })
  } catch (error: any) {
    console.error("❌ Create user error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create user",
      },
      { status: 500 },
    )
  }
}
