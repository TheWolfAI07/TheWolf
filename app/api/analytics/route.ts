import { NextResponse } from "next/server"
import { createServerSupabaseClient, safeDbOperation } from "@/lib/supabase"
import { logger } from "@/lib/logger"
import { config } from "@/lib/config"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get("timeframe") || "24h"
    const category = searchParams.get("category")

    logger.info("Analytics API GET request", { timeframe, category })

    const supabase = createServerSupabaseClient()

    // Calculate time range
    const now = new Date()
    let startTime: Date

    switch (timeframe) {
      case "1h":
        startTime = new Date(now.getTime() - 60 * 60 * 1000)
        break
      case "24h":
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case "7d":
        startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "30d":
        startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      default:
        startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    }

    // Get project statistics
    const { data: projectsData } = await safeDbOperation(
      () => supabase.from("wolf_projects").select("status, priority, progress, created_at"),
      [],
    )

    const totalProjects = projectsData.data?.length || 0
    const activeProjects = projectsData.data?.filter((p) => p.status === "active").length || 0
    const completedProjects = projectsData.data?.filter((p) => p.status === "completed").length || 0
    const avgProgress =
      totalProjects > 0
        ? Math.round(projectsData.data.reduce((sum, p) => sum + (p.progress || 0), 0) / totalProjects)
        : 0

    // Get recent activities count
    const { data: activitiesData } = await safeDbOperation(
      () =>
        supabase
          .from("wolf_activities")
          .select("count(*)", { count: "exact", head: true })
          .gte("created_at", startTime.toISOString()),
      { count: 0 },
    )

    const recentActivities = activitiesData.count || 0

    // Calculate system uptime
    const launchDate = config.system.launchDate
    const uptimeMs = now.getTime() - launchDate.getTime()
    const uptimeDays = Math.floor(uptimeMs / (1000 * 60 * 60 * 24))
    const uptimeHours = Math.floor((uptimeMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const systemUptime = `${uptimeDays}d ${uptimeHours}h`

    // Get analytics metrics if category is specified
    let metrics = []
    if (category) {
      const { data: metricsData } = await safeDbOperation(
        () =>
          supabase
            .from("wolf_analytics")
            .select("*")
            .eq("category", category)
            .gte("timestamp", startTime.toISOString())
            .order("timestamp", { ascending: false }),
        [],
      )

      metrics = metricsData.data || []
    }

    const analytics = {
      totalProjects,
      activeProjects,
      completedProjects,
      avgProgress,
      recentActivities,
      systemUptime,
      timeframe,
      metrics,
      timestamp: now.toISOString(),
    }

    logger.info("Analytics data retrieved successfully", {
      totalProjects,
      activeProjects,
      recentActivities,
    })

    return NextResponse.json({
      success: true,
      data: analytics,
      message: "Analytics data retrieved successfully",
    })
  } catch (error: any) {
    logger.error("Analytics API error", {
      error: error.message,
      stack: error.stack,
    })

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch analytics",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { metric_name, metric_value, metric_type = "counter", category, subcategory, dimensions = {} } = body

    logger.info("Analytics API POST request", {
      metric_name,
      metric_value,
      category,
    })

    if (!metric_name || metric_value === undefined || !category) {
      return NextResponse.json(
        {
          success: false,
          error: "metric_name, metric_value, and category are required",
        },
        { status: 400 },
      )
    }

    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from("wolf_analytics")
      .insert([
        {
          metric_name,
          metric_value: Number(metric_value),
          metric_type,
          category,
          subcategory,
          dimensions,
          timestamp: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) {
      logger.error("Failed to create analytics entry", {
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

    logger.info("Analytics entry created successfully", {
      id: data.id,
      metric_name,
    })

    return NextResponse.json({
      success: true,
      data,
      message: "Analytics entry created successfully",
    })
  } catch (error: any) {
    logger.error("Create analytics entry error", {
      error: error.message,
      stack: error.stack,
    })

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create analytics entry",
      },
      { status: 500 },
    )
  }
}
