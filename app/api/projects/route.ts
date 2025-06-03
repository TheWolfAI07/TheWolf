import { NextResponse } from "next/server"
import { createServerSupabaseClient, safeDbOperation } from "@/lib/supabase"
import { logger } from "@/lib/logger"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const status = searchParams.get("status")
    const priority = searchParams.get("priority")
    const search = searchParams.get("search") || ""
    const sortBy = searchParams.get("sortBy") || "created_at"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    logger.info("Projects API GET request", {
      page,
      limit,
      status,
      priority,
      search,
      sortBy,
      sortOrder,
    })

    const supabase = createServerSupabaseClient()

    // Build query
    let query = supabase.from("wolf_projects").select(
      `
        id,
        name,
        description,
        status,
        priority,
        progress,
        start_date,
        end_date,
        budget,
        tags,
        metadata,
        created_at,
        updated_at
      `,
      { count: "exact" },
    )

    // Add filters
    if (status) {
      query = query.eq("status", status)
    }

    if (priority) {
      query = query.eq("priority", priority)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Add sorting
    if (sortBy && ["name", "created_at", "updated_at", "status", "priority", "progress"].includes(sortBy)) {
      query = query.order(sortBy, { ascending: sortOrder === "asc" })
    } else {
      query = query.order("created_at", { ascending: false })
    }

    // Add pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      logger.error("Failed to fetch projects", {
        error: error.message,
        code: error.code,
      })

      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 },
      )
    }

    // Get project statistics
    const { data: statsData } = await safeDbOperation(
      () => supabase.from("wolf_projects").select("status, priority, progress, created_at"),
      [],
    )

    const stats = {
      total: count || 0,
      active: statsData.data?.filter((p) => p.status === "active").length || 0,
      completed: statsData.data?.filter((p) => p.status === "completed").length || 0,
      high_priority: statsData.data?.filter((p) => p.priority === "high").length || 0,
      avg_progress:
        statsData.data?.length > 0
          ? Math.round(statsData.data.reduce((sum, p) => sum + (p.progress || 0), 0) / statsData.data.length)
          : 0,
    }

    logger.info("Projects fetched successfully", {
      count: data?.length || 0,
      total: count || 0,
    })

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
      message: `Retrieved ${data?.length || 0} projects`,
    })
  } catch (error: any) {
    logger.error("Projects API error", {
      error: error.message,
      stack: error.stack,
    })

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch projects",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, status = "active", priority = "medium", start_date, end_date, budget, tags = [] } = body

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

    const { data, error } = await supabase
      .from("wolf_projects")
      .insert([
        {
          name,
          description,
          status,
          priority,
          start_date,
          end_date,
          budget: budget ? Number.parseFloat(budget) : null,
          tags,
          progress: 0,
          metadata: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) {
      logger.error("Failed to create project", {
        error: error.message,
        code: error.code,
        name,
      })

      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 },
      )
    }

    // Log project creation activity
    await supabase.from("wolf_activities").insert([
      {
        action: "project_created",
        resource_type: "project",
        resource_id: data.id,
        details: { name, priority },
        success: true,
      },
    ])

    // Create analytics entry
    await supabase.from("wolf_analytics").insert([
      {
        metric_name: "project_created",
        metric_value: 1,
        metric_type: "counter",
        category: "projects",
      },
    ])

    logger.info("Project created successfully", {
      id: data.id,
      name: data.name,
    })

    return NextResponse.json({
      success: true,
      data,
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
        error: error.message || "Failed to create project",
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

    // Add updated_at timestamp
    const dataToUpdate = {
      ...updateData,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from("wolf_projects").update(dataToUpdate).eq("id", id).select().single()

    if (error) {
      logger.error("Failed to update project", {
        error: error.message,
        code: error.code,
        id,
      })

      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 },
      )
    }

    // Log project update activity
    await supabase.from("wolf_activities").insert([
      {
        action: "project_updated",
        resource_type: "project",
        resource_id: id,
        details: { updatedFields: Object.keys(updateData) },
        success: true,
      },
    ])

    logger.info("Project updated successfully", {
      id,
      name: data.name,
    })

    return NextResponse.json({
      success: true,
      data,
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
        error: error.message || "Failed to update project",
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

    // Get project details before deletion
    const { data: project } = await supabase.from("wolf_projects").select("name").eq("id", id).single()

    const { error } = await supabase.from("wolf_projects").delete().eq("id", id)

    if (error) {
      logger.error("Failed to delete project", {
        error: error.message,
        code: error.code,
        id,
      })

      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 },
      )
    }

    // Log project deletion activity
    await supabase.from("wolf_activities").insert([
      {
        action: "project_deleted",
        resource_type: "project",
        resource_id: id,
        details: { name: project?.name },
        success: true,
      },
    ])

    logger.info("Project deleted successfully", {
      id,
      name: project?.name,
    })

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
        error: error.message || "Failed to delete project",
      },
      { status: 500 },
    )
  }
}
