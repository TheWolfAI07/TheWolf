import { NextResponse } from "next/server"
import { createServerSupabaseClient, safeDbOperation } from "@/lib/supabase"
import { aiInsights } from "@/lib/ai-insights"
import { logger } from "@/lib/logger"

export async function GET() {
  try {
    logger.info("Calculating project health scores")

    const supabase = createServerSupabaseClient()

    // Get all projects
    const { data: projectsData } = await safeDbOperation(() => supabase.from("wolf_projects").select("*"), [])

    const projects = projectsData.data || []
    const healthScores: Record<string, any> = {}

    // Calculate health for each project
    for (const project of projects) {
      // Get activities for this project
      const { data: activitiesData } = await safeDbOperation(
        () => supabase.from("wolf_activities").select("*").eq("resource_id", project.id),
        [],
      )

      const activities = activitiesData.data || []

      // Calculate health score
      const health = aiInsights.calculateProjectHealth(project, activities)
      healthScores[project.id] = {
        ...health,
        projectName: project.name,
        projectId: project.id,
      }

      // Generate project-specific insights
      await aiInsights.generateProjectInsights(project.id)
    }

    logger.info("Project health calculated", {
      projectCount: projects.length,
      healthScores: Object.keys(healthScores).length,
    })

    return NextResponse.json({
      success: true,
      data: healthScores,
      message: `Health calculated for ${projects.length} projects`,
    })
  } catch (error: any) {
    logger.error("Failed to calculate project health", {
      error: error.message,
      stack: error.stack,
    })

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to calculate project health",
      },
      { status: 500 },
    )
  }
}
