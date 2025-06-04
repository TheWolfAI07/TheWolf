import { NextResponse } from "next/server"
import { createSafeSupabaseClient } from "@/lib/supabase"
import { logger } from "@/lib/logger"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get("timeframe") || "24h"
    const category = searchParams.get("category")

    logger.info("Analytics API GET request", { timeframe, category })

    const supabase = createSafeSupabaseClient()

    if (!supabase) {
      throw new Error("Failed to initialize Supabase client")
    }

    // Get real analytics data from database with correct column names
    const { data: analyticsData, error: analyticsError } = await supabase
      .from("wolf_analytics")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100)

    if (analyticsError) {
      logger.error("Failed to fetch analytics", { error: analyticsError.message })
      // If table doesn't exist, return empty data instead of failing
      if (analyticsError.message.includes("does not exist")) {
        logger.warn("Analytics table does not exist, returning empty data")
        return NextResponse.json({
          success: true,
          data: {
            totalProjects: 0,
            activeProjects: 0,
            completedProjects: 0,
            avgProgress: 0,
            recentActivities: 0,
            systemUptime: calculateUptime(),
            timeframe,
            metrics: [],
            timestamp: new Date().toISOString(),
          },
          message: "Analytics table not found - please run database setup",
        })
      }
      throw analyticsError
    }

    // Get real project data
    const { data: projectsData, error: projectsError } = await supabase
      .from("wolf_projects")
      .select("*")

    if (projectsError) {
      logger.error("Failed to fetch projects", { error: projectsError.message })
    }

    // Calculate real metrics
    const totalProjects = projectsData?.length || 0
    const activeProjects = projectsData?.filter((p) => p.status === "active").length || 0
    const completedProjects = projectsData?.filter((p) => p.status === "completed").length || 0
    const avgProgress =
      projectsData?.length > 0
        ? Math.round(projectsData.reduce((sum, p) => sum + (p.progress || 0), 0) / projectsData.length)
        : 0

    // Get real activities
    const { data: activitiesData, error: activitiesError } = await supabase
      .from("wolf_activities")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50)

    if (activitiesError) {
      logger.error("Failed to fetch activities", { error: activitiesError.message })
    }

    const analytics = {
      totalProjects,
      activeProjects,
      completedProjects,
      avgProgress,
      recentActivities: activitiesData?.length || 0,
      systemUptime: calculateUptime(),
      timeframe,
      metrics: analyticsData || [],
      timestamp: new Date().toISOString(),
    }

    logger.info("Real analytics data retrieved successfully", {
      totalProjects,
      activeProjects,
      metricsCount: analyticsData?.length || 0,
    })

    return NextResponse.json({
      success: true,
      data: analytics,
      message: "Real analytics data retrieved successfully",
    })
  } catch (error: any) {
    logger.error("Analytics API error", {
      error: error.message,
      stack: error.stack,
    })

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message: "Failed to retrieve analytics data",
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

    const supabase = createSafeSupabaseClient()

    if (!supabase) {
      throw new Error("Failed to initialize Supabase client")
    }

    // Insert real analytics entry with correct column names
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
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) {
      logger.error("Failed to create analytics entry", { error: error.message })
      throw error
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
        error: error.message,
        message: "Failed to create analytics entry",
      },
      { status: 500 },
    )
  }
}

function calculateUptime(): string {
  const launchDate = new Date("2024-01-01")
  const now = new Date()
  const uptimeMs = now.getTime() - launchDate.getTime()
  const uptimeDays = Math.floor(uptimeMs / (1000 * 60 * 60 * 24))
  const uptimeHours = Math.floor((uptimeMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  return `${uptimeDays}d ${uptimeHours}h`
}
