import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    const {
      data: projects,
      error,
      count,
    } = await supabase
      .from("wolf_projects")
      .select(
        `
        *,
        users:owner_id (
          username,
          email
        )
      `,
        { count: "exact" },
      )
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Projects API error:", error)
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          message: "Failed to fetch projects from your Supabase database",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      data: projects || [],
      total: count || 0,
      message: `Found ${count || 0} projects in your database`,
    })
  } catch (error: any) {
    console.error("Projects API error:", error)
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
    const { name, description, priority = "medium", owner_id } = body

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          error: "Project name is required",
        },
        { status: 400 },
      )
    }

    const supabase = createServerSupabaseClient()

    const { data: project, error } = await supabase
      .from("wolf_projects")
      .insert([
        {
          name,
          description,
          priority,
          owner_id,
          status: "active",
          progress: 0,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Project creation error:", error)
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
      data: project,
      message: "Project created successfully in your Supabase database",
    })
  } catch (error: any) {
    console.error("Project creation error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Unknown error",
      },
      { status: 500 },
    )
  }
}
