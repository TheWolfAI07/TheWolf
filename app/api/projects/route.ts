import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { logger } from "@/lib/logger"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status")
    const search = searchParams.get("search") || ""
    const sortBy = searchParams.get("sortBy") || "created_at"
    const sortOrder = searchParams.get("sortOrder") || "desc"
    const priority = searchParams.get("priority")

    logger.info("Projects API GET request", {
      page,
      limit,
      status,
      search,
      sortBy,
      sortOrder,
      priority,
    })

    const supabase = createServerSupabaseClient()

    // Build query
    let query = supabase.from("wolf_projects").select("*", { count: "exact" })

    // Apply filters
    if (status) {
      query = query.eq("status", status)
    }

    if (priority) {
      query = query.eq("priority", priority)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === "asc" })

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: projects, error, count } = await query

    if (error) {
      logger.error("Failed to fetch projects", { error: error.message })
      throw error
    }

    // Calculate real stats
    const { data: allProjects, error: statsError } = await supabase
      .from("wolf_projects")
      .select("status, priority, progress")

    if (statsError) {
      logger.error("Failed to fetch project stats", { error: statsError.message })
    }

    const stats = {
      total: count || 0,
      active: allProjects?.filter((p) => p.status === "active").length || 0,
      completed: allProjects?.filter((p) => p.status === "completed").length || 0,
      high_priority: allProjects?.filter((p) => p.priority === "high").length || 0,
      avg_progress:
        allProjects?.length > 0
          ? Math.round(allProjects.reduce((sum, p) => sum + (p.progress || 0), 0) / allProjects.length)
          : 0,
    }

    logger.info("Real projects fetched successfully", {
      count: projects?.length || 0,
      total: count || 0,
    })

    return NextResponse.json({
      success: true,
      data: projects || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      stats,
      message: `Retrieved ${projects?.length || 0} real projects`,
    })
  } catch (error: any) {
    logger.error("Projects API error", {
      error: error.message,
      stack: error.stack,
    })

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message: "Failed to retrieve projects",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      name,
      description,
      status = "active",
      priority = "medium",
      start_date,
      end_date,
      budget,
      tags = [],
      progress = 0,
    } = body

    logger.info("Projects API POST request", {
      name,
      status,
      priority,
    })

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

    // Insert real project
    const { data: project, error } = await supabase
      .from("wolf_projects")
      .insert([
        {
          name,
          description,
          status,
          priority,
          progress,
          start_date,
          end_date,
          budget: budget ? Number.parseFloat(budget) : null,
          tags,
          metadata: {},
        },
      ])
      .select()
      .single()

    if (error) {
      logger.error("Failed to create project", { error: error.message })
      throw error
    }

    // Log activity
    await supabase.from("wolf_activities").insert([
      {
        action: "create_project",
        resource_type: "project",
        resource_id: project.id,
        details: { project_name: name, status, priority },
      },
    ])

    logger.info("Real project created successfully", {
      id: project.id,
      name: project.name,
    })

    return NextResponse.json({
      success: true,
      data: project,
      message: "Project created successfully",
    })
  } catch (error: any) {
    logger.error("Create project error", {
      error: error.message,
      stack: error.stack,
    })

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message: "Failed to create project",
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    logger.info("Projects API PUT request", {
      id,
      updateFields: Object.keys(updateData),
    })

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Project ID is required",
        },
        { status: 400 },
      )
    }

    const supabase = createServerSupabaseClient()

    // Update real project
    const { data: project, error } = await supabase
      .from("wolf_projects")
      .update({
        ...updateData,
        budget: updateData.budget ? Number.parseFloat(updateData.budget) : updateData.budget,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      logger.error("Failed to update project", { error: error.message })
      throw error
    }

    // Log activity
    await supabase.from("wolf_activities").insert([
      {
        action: "update_project",
        resource_type: "project",
        resource_id: id,
        details: { updated_fields: Object.keys(updateData) },
      },
    ])

    logger.info("Real project updated successfully", { id })

    return NextResponse.json({
      success: true,
      data: project,
      message: "Project updated successfully",
    })
  } catch (error: any) {
    logger.error("Update project error", {
      error: error.message,
      stack: error.stack,
    })

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message: "Failed to update project",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    logger.info("Projects API DELETE request", { id })

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Project ID is required",
        },
        { status: 400 },
      )
    }

    const supabase = createServerSupabaseClient()

    // Delete real project
    const { error } = await supabase.from("wolf_projects").delete().eq("id", id)

    if (error) {
      logger.error("Failed to delete project", { error: error.message })
      throw error
    }

    // Log activity
    await supabase.from("wolf_activities").insert([
      {
        action: "delete_project",
        resource_type: "project",
        resource_id: id,
        details: { deleted: true },
      },
    ])

    logger.info("Real project deleted successfully", { id })

    return NextResponse.json({
      success: true,
      message: "Project deleted successfully",
    })
  } catch (error: any) {
    logger.error("Delete project error", {
      error: error.message,
      stack: error.stack,
    })

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message: "Failed to delete project",
      },
      { status: 500 },
    )
  }
}
