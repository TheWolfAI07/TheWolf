import { NextResponse } from "next/server"
import { createSafeSupabaseClient } from "@/lib/supabase"
import { logger } from "@/lib/logger"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const priority = searchParams.get("priority")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    logger.info("Projects API GET request", { status, priority, limit })

    const supabase = createSafeSupabaseClient()

    if (!supabase) {
      throw new Error("Failed to initialize Supabase client")
    }

    // Build query with filters
    let query = supabase.from("wolf_projects").select("*").order("created_at", { ascending: false }).limit(limit)

    if (status) {
      query = query.eq("status", status)
    }

    if (priority) {
      query = query.eq("priority", priority)
    }

    const { data: projects, error } = await query

    if (error) {
      logger.error("Failed to fetch projects", { error: error.message })
      throw error
    }

    // Calculate project statistics
    const stats = {
      total: projects?.length || 0,
      active: projects?.filter((p) => p.status === "active").length || 0,
      completed: projects?.filter((p) => p.status === "completed").length || 0,
      inactive: projects?.filter((p) => p.status === "inactive").length || 0,
      archived: projects?.filter((p) => p.status === "archived").length || 0,
      avgProgress:
        projects?.length > 0
          ? Math.round(projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length)
          : 0,
    }

    logger.info("Projects data retrieved successfully", {
      count: projects?.length || 0,
      stats,
    })

    return NextResponse.json({
      success: true,
      data: {
        projects: projects || [],
        stats,
        timestamp: new Date().toISOString(),
      },
      message: "Projects retrieved successfully",
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
      progress = 0,
      start_date,
      end_date,
      budget,
      tags = [],
      metadata = {},
    } = body

    logger.info("Projects API POST request", { name, status, priority })

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          error: "Project name is required",
        },
        { status: 400 },
      )
    }

    const supabase = createSafeSupabaseClient()

    if (!supabase) {
      throw new Error("Failed to initialize Supabase client")
    }

    // Create new project
    const { data: project, error } = await supabase
      .from("wolf_projects")
      .insert([
        {
          name,
          description,
          status,
          priority,
          progress: Math.max(0, Math.min(100, progress)), // Ensure progress is between 0-100
          start_date,
          end_date,
          budget: budget ? Number.parseFloat(budget) : null,
          tags,
          metadata,
        },
      ])
      .select()
      .single()

    if (error) {
      logger.error("Failed to create project", { error: error.message })
      throw error
    }

    // Log project creation activity
    await supabase.from("wolf_activities").insert([
      {
        action: "project_created",
        resource_type: "project",
        resource_id: project.id,
        details: {
          project_name: name,
          status,
          priority,
        },
      },
    ])

    logger.info("Project created successfully", {
      id: project.id,
      name,
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
    const { id, ...updates } = body

    logger.info("Projects API PUT request", { id, updates: Object.keys(updates) })

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Project ID is required",
        },
        { status: 400 },
      )
    }

    const supabase = createSafeSupabaseClient()

    if (!supabase) {
      throw new Error("Failed to initialize Supabase client")
    }

    // Validate progress if provided
    if (updates.progress !== undefined) {
      updates.progress = Math.max(0, Math.min(100, updates.progress))
    }

    // Update project
    const { data: project, error } = await supabase
      .from("wolf_projects")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      logger.error("Failed to update project", { error: error.message, id })
      throw error
    }

    // Log project update activity
    await supabase.from("wolf_activities").insert([
      {
        action: "project_updated",
        resource_type: "project",
        resource_id: id,
        details: {
          project_name: project.name,
          updates: Object.keys(updates),
        },
      },
    ])

    logger.info("Project updated successfully", { id, name: project.name })

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

    const supabase = createSafeSupabaseClient()

    if (!supabase) {
      throw new Error("Failed to initialize Supabase client")
    }

    // Get project details before deletion
    const { data: project, error: fetchError } = await supabase
      .from("wolf_projects")
      .select("name")
      .eq("id", id)
      .single()

    if (fetchError) {
      logger.error("Failed to fetch project for deletion", { error: fetchError.message, id })
      throw fetchError
    }

    // Delete project
    const { error } = await supabase.from("wolf_projects").delete().eq("id", id)

    if (error) {
      logger.error("Failed to delete project", { error: error.message, id })
      throw error
    }

    // Log project deletion activity
    await supabase.from("wolf_activities").insert([
      {
        action: "project_deleted",
        resource_type: "project",
        resource_id: id,
        details: {
          project_name: project.name,
        },
      },
    ])

    logger.info("Project deleted successfully", { id, name: project.name })

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
