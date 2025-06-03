/**
 * Wolf Platform AI Insights Engine
 *
 * Advanced AI-powered analytics and recommendations system
 */

import { logger } from "./logger"
import { createServerSupabaseClient } from "./supabase"

export interface AIInsight {
  id: string
  type: "recommendation" | "warning" | "opportunity" | "prediction"
  title: string
  description: string
  confidence: number
  impact: "low" | "medium" | "high" | "critical"
  actionable: boolean
  actions?: string[]
  data?: any
  timestamp: string
}

export interface ProjectHealth {
  score: number
  status: "excellent" | "good" | "warning" | "critical"
  factors: {
    progress: number
    timeline: number
    resources: number
    quality: number
  }
  recommendations: string[]
}

export class AIInsightsEngine {
  private static instance: AIInsightsEngine
  private insights: AIInsight[] = []

  static getInstance(): AIInsightsEngine {
    if (!AIInsightsEngine.instance) {
      AIInsightsEngine.instance = new AIInsightsEngine()
    }
    return AIInsightsEngine.instance
  }

  async generateProjectInsights(projectId: string): Promise<AIInsight[]> {
    try {
      logger.info("Generating AI insights for project", { projectId })

      const supabase = createServerSupabaseClient()

      // Get project data
      const { data: project } = await supabase.from("wolf_projects").select("*").eq("id", projectId).single()

      if (!project) {
        throw new Error("Project not found")
      }

      // Get project activities
      const { data: activities } = await supabase
        .from("wolf_activities")
        .select("*")
        .eq("resource_id", projectId)
        .order("created_at", { ascending: false })
        .limit(50)

      const insights: AIInsight[] = []

      // Progress Analysis
      if (project.progress < 30 && this.daysSinceCreated(project.created_at) > 7) {
        insights.push({
          id: `progress-${projectId}`,
          type: "warning",
          title: "Slow Progress Detected",
          description: `Project progress is at ${project.progress}% after ${this.daysSinceCreated(project.created_at)} days. Consider reviewing timeline and resources.`,
          confidence: 0.85,
          impact: "medium",
          actionable: true,
          actions: ["Review project timeline", "Allocate additional resources", "Break down tasks"],
          timestamp: new Date().toISOString(),
        })
      }

      // Timeline Prediction
      if (project.end_date) {
        const daysRemaining = this.daysUntil(project.end_date)
        const progressRate = project.progress / this.daysSinceCreated(project.created_at)
        const estimatedDaysToComplete = (100 - project.progress) / progressRate

        if (estimatedDaysToComplete > daysRemaining) {
          insights.push({
            id: `timeline-${projectId}`,
            type: "warning",
            title: "Timeline Risk Detected",
            description: `At current pace, project will take ${Math.ceil(estimatedDaysToComplete)} days but only ${daysRemaining} days remain.`,
            confidence: 0.75,
            impact: "high",
            actionable: true,
            actions: ["Accelerate development", "Adjust scope", "Extend deadline"],
            timestamp: new Date().toISOString(),
          })
        }
      }

      // Activity Pattern Analysis
      const recentActivities = activities?.filter((a) => this.daysSinceCreated(a.created_at) <= 3) || []

      if (recentActivities.length === 0 && project.status === "active") {
        insights.push({
          id: `activity-${projectId}`,
          type: "warning",
          title: "No Recent Activity",
          description: "No activity recorded in the last 3 days for an active project.",
          confidence: 0.9,
          impact: "medium",
          actionable: true,
          actions: ["Check project status", "Contact team members", "Review blockers"],
          timestamp: new Date().toISOString(),
        })
      }

      // Success Prediction
      if (project.progress > 80 && project.status === "active") {
        insights.push({
          id: `success-${projectId}`,
          type: "opportunity",
          title: "Project Near Completion",
          description: `Project is ${project.progress}% complete. Consider preparing for launch and next steps.`,
          confidence: 0.95,
          impact: "high",
          actionable: true,
          actions: ["Prepare launch checklist", "Plan post-launch activities", "Document lessons learned"],
          timestamp: new Date().toISOString(),
        })
      }

      // Priority Optimization
      if (project.priority === "low" && project.progress > 50) {
        insights.push({
          id: `priority-${projectId}`,
          type: "recommendation",
          title: "Consider Priority Upgrade",
          description:
            "Project showing good progress despite low priority. Consider upgrading priority for better resource allocation.",
          confidence: 0.7,
          impact: "medium",
          actionable: true,
          actions: ["Review priority level", "Allocate more resources", "Fast-track completion"],
          timestamp: new Date().toISOString(),
        })
      }

      this.insights = [...this.insights, ...insights]

      logger.info("Generated AI insights", {
        projectId,
        insightCount: insights.length,
        types: insights.map((i) => i.type),
      })

      return insights
    } catch (error: any) {
      logger.error("Failed to generate AI insights", {
        projectId,
        error: error.message,
      })
      return []
    }
  }

  async generateSystemInsights(): Promise<AIInsight[]> {
    try {
      logger.info("Generating system-wide AI insights")

      const supabase = createServerSupabaseClient()

      // Get all projects
      const { data: projects } = await supabase.from("wolf_projects").select("*")

      // Get recent activities
      const { data: activities } = await supabase
        .from("wolf_activities")
        .select("*")
        .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

      const insights: AIInsight[] = []

      if (projects) {
        // System Performance Analysis
        const activeProjects = projects.filter((p) => p.status === "active")
        const avgProgress = activeProjects.reduce((sum, p) => sum + p.progress, 0) / activeProjects.length

        if (avgProgress < 40) {
          insights.push({
            id: "system-performance",
            type: "warning",
            title: "System-wide Performance Concern",
            description: `Average project progress is ${Math.round(avgProgress)}%. Consider reviewing project management processes.`,
            confidence: 0.8,
            impact: "high",
            actionable: true,
            actions: ["Review project methodologies", "Provide team training", "Optimize workflows"],
            timestamp: new Date().toISOString(),
          })
        }

        // Resource Utilization
        const highPriorityProjects = projects.filter((p) => p.priority === "high" || p.priority === "urgent")
        const completedHighPriority = highPriorityProjects.filter((p) => p.status === "completed")

        if (highPriorityProjects.length > 0) {
          const successRate = (completedHighPriority.length / highPriorityProjects.length) * 100

          if (successRate > 80) {
            insights.push({
              id: "resource-success",
              type: "opportunity",
              title: "Excellent High-Priority Success Rate",
              description: `${Math.round(successRate)}% success rate on high-priority projects. Consider scaling successful practices.`,
              confidence: 0.9,
              impact: "high",
              actionable: true,
              actions: ["Document best practices", "Scale successful methods", "Share knowledge"],
              timestamp: new Date().toISOString(),
            })
          }
        }

        // Trend Analysis
        const recentProjects = projects.filter((p) => this.daysSinceCreated(p.created_at) <= 30)

        if (recentProjects.length > projects.length * 0.5) {
          insights.push({
            id: "growth-trend",
            type: "opportunity",
            title: "Rapid Project Growth Detected",
            description: `${recentProjects.length} new projects in the last 30 days. Consider scaling infrastructure and processes.`,
            confidence: 0.85,
            impact: "medium",
            actionable: true,
            actions: ["Scale infrastructure", "Hire additional resources", "Optimize processes"],
            timestamp: new Date().toISOString(),
          })
        }
      }

      // Activity Analysis
      if (activities) {
        const errorActivities = activities.filter((a) => !a.success)
        const errorRate = (errorActivities.length / activities.length) * 100

        if (errorRate > 10) {
          insights.push({
            id: "error-rate",
            type: "warning",
            title: "High Error Rate Detected",
            description: `${Math.round(errorRate)}% of recent activities resulted in errors. System stability may be at risk.`,
            confidence: 0.9,
            impact: "critical",
            actionable: true,
            actions: ["Investigate error patterns", "Improve error handling", "Review system stability"],
            timestamp: new Date().toISOString(),
          })
        }
      }

      logger.info("Generated system insights", {
        insightCount: insights.length,
      })

      return insights
    } catch (error: any) {
      logger.error("Failed to generate system insights", {
        error: error.message,
      })
      return []
    }
  }

  calculateProjectHealth(project: any, activities: any[] = []): ProjectHealth {
    let score = 100
    const factors = {
      progress: 100,
      timeline: 100,
      resources: 100,
      quality: 100,
    }
    const recommendations: string[] = []

    // Progress factor
    const daysSinceStart = this.daysSinceCreated(project.created_at)
    const expectedProgress = Math.min(daysSinceStart * 5, 100) // 5% per day baseline

    if (project.progress < expectedProgress * 0.8) {
      factors.progress = 60
      recommendations.push("Accelerate development to meet timeline")
    } else if (project.progress < expectedProgress) {
      factors.progress = 80
    }

    // Timeline factor
    if (project.end_date) {
      const daysRemaining = this.daysUntil(project.end_date)
      const progressRate = project.progress / daysSinceStart
      const estimatedDaysToComplete = (100 - project.progress) / progressRate

      if (estimatedDaysToComplete > daysRemaining * 1.2) {
        factors.timeline = 40
        recommendations.push("Timeline at risk - consider scope adjustment")
      } else if (estimatedDaysToComplete > daysRemaining) {
        factors.timeline = 70
        recommendations.push("Monitor timeline closely")
      }
    }

    // Activity quality factor
    const recentErrors = activities.filter((a) => !a.success && this.daysSinceCreated(a.created_at) <= 7).length

    if (recentErrors > 5) {
      factors.quality = 50
      recommendations.push("High error rate - review quality processes")
    } else if (recentErrors > 2) {
      factors.quality = 75
      recommendations.push("Monitor error patterns")
    }

    // Calculate overall score
    score = (factors.progress + factors.timeline + factors.resources + factors.quality) / 4

    let status: ProjectHealth["status"]
    if (score >= 90) status = "excellent"
    else if (score >= 75) status = "good"
    else if (score >= 60) status = "warning"
    else status = "critical"

    return {
      score: Math.round(score),
      status,
      factors,
      recommendations,
    }
  }

  private daysSinceCreated(dateString: string): number {
    const created = new Date(dateString)
    const now = new Date()
    return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
  }

  private daysUntil(dateString: string): number {
    const target = new Date(dateString)
    const now = new Date()
    return Math.floor((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  }

  getInsights(): AIInsight[] {
    return this.insights
  }

  clearInsights(): void {
    this.insights = []
  }
}

export const aiInsights = AIInsightsEngine.getInstance()
