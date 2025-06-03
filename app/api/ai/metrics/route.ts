import { NextResponse } from "next/server"
import { createServerSupabaseClient, safeDbOperation } from "@/lib/supabase"
import { logger } from "@/lib/logger"

export async function GET() {
  try {
    logger.info("Generating AI metrics")

    const supabase = createServerSupabaseClient()

    // Get project data
    const { data: projectsData } = await safeDbOperation(() => supabase.from("wolf_projects").select("*"), [])

    // Get activities data
    const { data: activitiesData } = await safeDbOperation(
      () =>
        supabase
          .from("wolf_activities")
          .select("*")
          .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
      [],
    )

    const projects = projectsData.data || []
    const activities = activitiesData.data || []

    // Calculate metrics
    const totalProjects = projects.length
    const activeProjects = projects.filter((p) => p.status === "active").length
    const completedProjects = projects.filter((p) => p.status === "completed").length
    const avgProgress =
      totalProjects > 0 ? Math.round(projects.reduce((sum, p) => sum + (p.progress || 0), 0) / totalProjects) : 0

    const successfulActivities = activities.filter((a) => a.success).length
    const successRate = activities.length > 0 ? Math.round((successfulActivities / activities.length) * 100) : 100

    const errorRate =
      activities.length > 0 ? Math.round(((activities.length - successfulActivities) / activities.length) * 100) : 0

    // Simulate some advanced metrics
    const responseTime = Math.floor(Math.random() * 50) + 50 // 50-100ms
    const uptime = 99.9

    // Calculate trends (simulated for demo)
    const trends = {
      projects: Math.floor(Math.random() * 20) - 10, // -10 to +10
      completion: Math.floor(Math.random() * 15) - 5, // -5 to +10
      performance: Math.floor(Math.random() * 10) - 5, // -5 to +5
    }

    const metrics = {
      totalProjects,
      activeProjects,
      completedProjects,
      avgProgress,
      successRate,
      errorRate,
      responseTime,
      uptime,
      trends,
    }

    logger.info("AI metrics generated", metrics)

    return NextResponse.json({
      success: true,
      data: metrics,
      message: "AI metrics generated successfully",
    })
  } catch (error: any) {
    logger.error("Failed to generate AI metrics", {
      error: error.message,
      stack: error.stack,
    })

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate AI metrics",
      },
      { status: 500 },
    )
  }
}
