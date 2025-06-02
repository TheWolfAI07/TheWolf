import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const limit = searchParams.get("limit")

    const supabase = createServerSupabaseClient()

    let query = supabase.from("wolf_projects").select("*").order("created_at", { ascending: false })

    if (status) {
      query = query.eq("status", status)
    }

    if (limit) {
      query = query.limit(Number.parseInt(limit))
    }

    const { data: projects, error } = await query

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: projects,
      total: projects.length,
      message: "Projects retrieved successfully",
    })
  } catch (error) {
    console.error("Projects GET error:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch projects" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, status = "active", owner_id } = body

    if (!name) {
      return NextResponse.json({ success: false, message: "Project name is required" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from("wolf_projects")
      .insert([
        {
          name,
          description,
          status,
          owner_id,
        },
      ])
      .select()

    if (error) throw error

    return NextResponse.json(
      {
        success: true,
        data: data[0],
        message: "Project created successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Projects POST error:", error)
    return NextResponse.json({ success: false, message: "Failed to create project" }, { status: 500 })
  }
}
