/**
 * Wolf Platform AI Insights Engine
 *
 * Advanced machine learning and AI-powered analytics for project insights
 */

import { logger } from "./logger"
import { createServerSupabaseClient } from "./supabase"

// Types for AI insights
export interface AIInsight {
  id: string
  projectId?: string
  type: "prediction" | "recommendation" | "risk" | "opportunity" | "anomaly"
  title: string
  description: string
  confidence: number
  impact: "low" | "medium" | "high" | "critical"
  category: "timeline" | "resources" | "quality" | "budget" | "scope" | "team" | "technical" | "business"
  suggestedActions?: string[]
  metadata?: Record<string, any>
  createdAt: Date
  expiresAt?: Date
  status: "active" | "acknowledged" | "resolved" | "dismissed"
  acknowledgedBy?: string
  resolvedBy?: string
  dismissedBy?: string
}

export interface ProjectMetrics {
  id: string
  projectId: string
  timelineAdherence: number
  budgetAdherence: number
  scopeStability: number
  teamVelocity: number
  qualityScore: number
  riskScore: number
  healthScore: number
  predictedCompletion?: Date
  predictedBudget?: number
  lastUpdated: Date
}

export interface AIAnalysisRequest {
  projectId: string
  includeRisks?: boolean
  includeOpportunities?: boolean
  includePredictions?: boolean
  includeRecommendations?: boolean
  includeAnomalies?: boolean
}

export interface AIAnalysisResponse {
  projectId: string
  insights: AIInsight[]
  metrics: ProjectMetrics
  summary: string
  timestamp: Date
}

export class AIInsightsEngine {
  private static instance: AIInsightsEngine
  private insights: Map<string, AIInsight[]> = new Map()
  private metrics: Map<string, ProjectMetrics> = new Map()
  private analysisCache: Map<string, { response: AIAnalysisResponse; timestamp: Date }> = new Map()
  private cacheTTL = 30 * 60 * 1000 // 30 minutes

  private constructor() {
    logger.info("AI Insights Engine initialized")
  }

  static getInstance(): AIInsightsEngine {
    if (!AIInsightsEngine.instance) {
      AIInsightsEngine.instance = new AIInsightsEngine()
    }
    return AIInsightsEngine.instance
  }

  /**
   * Analyze a project and generate AI insights
   */
  async analyzeProject(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    const { projectId } = request

    try {
      logger.info("Starting AI analysis for project", { projectId })

      // Check cache first
      const cached = this.analysisCache.get(projectId)
      if (cached && Date.now() - cached.timestamp.getTime() < this.cacheTTL) {
        logger.debug("Returning cached AI analysis", { projectId })
        return cached.response
      }

      // Get project data from database
      const supabase = createServerSupabaseClient()

      // Get project details
      const { data: project } = await supabase.from("wolf_projects").select("*").eq("id", projectId).single()

      if (!project) {
        throw new Error(`Project not found: ${projectId}`)
      }

      // Get project activities
      const { data: activities } = await supabase
        .from("wolf_activities")
        .select("*")
        .eq("resource_id", projectId)
        .order("created_at", { ascending: false })
        .limit(100)

      // Get project tasks
      const { data: tasks } = await supabase
        .from("wolf_tasks")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })

      // Calculate project metrics
      const metrics = await this.calculateProjectMetrics(project, tasks || [], activities || [])

      // Generate insights based on metrics and project data
      const insights = await this.generateInsights(project, metrics, tasks || [], activities || [], request)

      // Generate summary using AI
      const summary = await this.generateAISummary(project, metrics, insights)

      // Create response
      const response: AIAnalysisResponse = {
        projectId,
        insights,
        metrics,
        summary,
        timestamp: new Date(),
      }

      // Cache the response
      this.analysisCache.set(projectId, { response, timestamp: new Date() })

      // Store insights and metrics for later retrieval
      this.insights.set(projectId, insights)
      this.metrics.set(projectId, metrics)

      logger.info("AI analysis completed", {
        projectId,
        insightCount: insights.length,
      })

      return response
    } catch (error: any) {
      logger.error("AI analysis failed", {
        projectId,
        error: error.message,
      })
      throw error
    }
  }

  /**
   * Get insights for a project
   */
  getInsights(projectId: string): AIInsight[] {
    return this.insights.get(projectId) || []
  }

  /**
   * Get metrics for a project
   */
  getMetrics(projectId: string): ProjectMetrics | null {
    return this.metrics.get(projectId) || null
  }

  /**
   * Update insight status
   */
  async updateInsightStatus(insightId: string, status: AIInsight["status"], userId: string): Promise<AIInsight | null> {
    try {
      // Find the insight in our cache
      let foundInsight: AIInsight | null = null
      let projectId: string | undefined

      for (const [pid, insights] of this.insights.entries()) {
        const insight = insights.find((i) => i.id === insightId)
        if (insight) {
          foundInsight = insight
          projectId = pid
          break
        }
      }

      if (!foundInsight || !projectId) {
        logger.warn("Insight not found for status update", { insightId })
        return null
      }

      // Update the insight status
      foundInsight.status = status

      // Set the appropriate user field
      if (status === "acknowledged") {
        foundInsight.acknowledgedBy = userId
      } else if (status === "resolved") {
        foundInsight.resolvedBy = userId
      } else if (status === "dismissed") {
        foundInsight.dismissedBy = userId
      }

      logger.info("Insight status updated", {
        insightId,
        status,
        userId,
      })

      return foundInsight
    } catch (error: any) {
      logger.error("Failed to update insight status", {
        insightId,
        status,
        error: error.message,
      })
      return null
    }
  }

  /**
   * Clear cache for a project
   */
  clearCache(projectId?: string): void {
    if (projectId) {
      this.analysisCache.delete(projectId)
      logger.debug("Cleared AI analysis cache for project", { projectId })
    } else {
      this.analysisCache.clear()
      logger.debug("Cleared all AI analysis cache")
    }
  }

  /**
   * Calculate project metrics
   */
  private async calculateProjectMetrics(project: any, tasks: any[], activities: any[]): Promise<ProjectMetrics> {
    // Calculate timeline adherence
    const timelineAdherence = this.calculateTimelineAdherence(project, tasks)

    // Calculate budget adherence
    const budgetAdherence = this.calculateBudgetAdherence(project)

    // Calculate scope stability
    const scopeStability = this.calculateScopeStability(tasks, activities)

    // Calculate team velocity
    const teamVelocity = this.calculateTeamVelocity(tasks)

    // Calculate quality score
    const qualityScore = this.calculateQualityScore(tasks, activities)

    // Calculate risk score
    const riskScore = this.calculateRiskScore(
      timelineAdherence,
      budgetAdherence,
      scopeStability,
      teamVelocity,
      qualityScore,
    )

    // Calculate overall health score
    const healthScore = this.calculateHealthScore(
      timelineAdherence,
      budgetAdherence,
      scopeStability,
      teamVelocity,
      qualityScore,
      riskScore,
    )

    // Predict completion date
    const predictedCompletion = this.predictCompletionDate(project, tasks, teamVelocity)

    // Predict final budget
    const predictedBudget = this.predictFinalBudget(project, budgetAdherence)

    return {
      id: `metrics_${project.id}_${Date.now()}`,
      projectId: project.id,
      timelineAdherence,
      budgetAdherence,
      scopeStability,
      teamVelocity,
      qualityScore,
      riskScore,
      healthScore,
      predictedCompletion,
      predictedBudget,
      lastUpdated: new Date(),
    }
  }

  /**
   * Calculate timeline adherence (0-100)
   */
  private calculateTimelineAdherence(project: any, tasks: any[]): number {
    if (!project.start_date || !project.end_date) {
      return 50 // Neutral score if no dates set
    }

    const startDate = new Date(project.start_date)
    const endDate = new Date(project.end_date)
    const now = new Date()

    // If project is not started yet
    if (now < startDate) return 100

    // If project is past end date
    if (now > endDate) {
      // Check if project is completed
      if (project.progress >= 100) {
        return 80 // Completed but possibly late
      }
      return Math.max(20, 100 - ((now.getTime() - endDate.getTime()) / 86400000) * 5)
    }

    // Project is in progress
    const totalDuration = endDate.getTime() - startDate.getTime()
    const elapsedDuration = now.getTime() - startDate.getTime()
    const elapsedPercentage = (elapsedDuration / totalDuration) * 100

    // Compare progress to elapsed time
    const progressDifference = project.progress - elapsedPercentage

    if (progressDifference >= 10) return 100 // Ahead of schedule
    if (progressDifference >= 0) return 90 // On schedule
    if (progressDifference >= -10) return 80 // Slightly behind
    if (progressDifference >= -20) return 60 // Behind
    if (progressDifference >= -30) return 40 // Significantly behind
    return 20 // Critically behind
  }

  /**
   * Calculate budget adherence (0-100)
   */
  private calculateBudgetAdherence(project: any): number {
    if (!project.budget || project.budget <= 0) {
      return 50 // Neutral score if no budget set
    }

    const budget = project.budget
    const spent = project.spent || 0

    // Calculate expected spend based on progress
    const expectedSpend = (project.progress / 100) * budget

    // Compare actual spend to expected spend
    if (spent <= expectedSpend * 0.8) return 100 // Well under budget
    if (spent <= expectedSpend * 0.9) return 90 // Under budget
    if (spent <= expectedSpend * 1.1) return 80 // On budget
    if (spent <= expectedSpend * 1.2) return 60 // Over budget
    if (spent <= expectedSpend * 1.3) return 40 // Significantly over budget
    return 20 // Critically over budget
  }

  /**
   * Calculate scope stability (0-100)
   */
  private calculateScopeStability(tasks: any[], activities: any[]): number {
    if (tasks.length === 0) {
      return 50 // Neutral score if no tasks
    }

    // Count scope changes in activities
    const scopeChangeActivities = activities.filter(
      (a) => a.action === "add_task" || a.action === "remove_task" || a.action === "modify_scope",
    )

    // Calculate ratio of scope changes to tasks
    const scopeChangeRatio = scopeChangeActivities.length / tasks.length

    if (scopeChangeRatio <= 0.05) return 100 // Very stable
    if (scopeChangeRatio <= 0.1) return 90 // Stable
    if (scopeChangeRatio <= 0.2) return 80 // Mostly stable
    if (scopeChangeRatio <= 0.3) return 60 // Some instability
    if (scopeChangeRatio <= 0.5) return 40 // Unstable
    return 20 // Very unstable
  }

  /**
   * Calculate team velocity (0-100)
   */
  private calculateTeamVelocity(tasks: any[]): number {
    if (tasks.length === 0) {
      return 50 // Neutral score if no tasks
    }

    // Count completed tasks
    const completedTasks = tasks.filter((t) => t.status === "completed")

    // Calculate completion ratio
    const completionRatio = completedTasks.length / tasks.length

    // Calculate average time to complete tasks
    const completionTimes = completedTasks
      .filter((t) => t.completed_at && t.created_at)
      .map((t) => new Date(t.completed_at).getTime() - new Date(t.created_at).getTime())

    if (completionTimes.length === 0) {
      // Base score just on completion ratio
      if (completionRatio >= 0.8) return 90
      if (completionRatio >= 0.6) return 80
      if (completionRatio >= 0.4) return 60
      if (completionRatio >= 0.2) return 40
      return 20
    }

    // Calculate average completion time in days
    const avgCompletionTime = completionTimes.reduce((sum, time) => sum + time, 0) / (completionTimes.length * 86400000)

    // Score based on completion time and ratio
    let velocityScore = 0

    // Score based on average completion time
    if (avgCompletionTime <= 1)
      velocityScore += 50 // Very fast
    else if (avgCompletionTime <= 3)
      velocityScore += 40 // Fast
    else if (avgCompletionTime <= 7)
      velocityScore += 30 // Average
    else if (avgCompletionTime <= 14)
      velocityScore += 20 // Slow
    else velocityScore += 10 // Very slow

    // Score based on completion ratio
    if (completionRatio >= 0.8) velocityScore += 50
    else if (completionRatio >= 0.6) velocityScore += 40
    else if (completionRatio >= 0.4) velocityScore += 30
    else if (completionRatio >= 0.2) velocityScore += 20
    else velocityScore += 10

    return velocityScore
  }

  /**
   * Calculate quality score (0-100)
   */
  private calculateQualityScore(tasks: any[], activities: any[]): number {
    if (tasks.length === 0) {
      return 50 // Neutral score if no tasks
    }

    // Count quality-related activities
    const qualityIssues = activities.filter(
      (a) => a.action === "report_bug" || a.action === "report_issue" || a.action === "reopen_task",
    )

    // Calculate ratio of quality issues to tasks
    const qualityIssueRatio = qualityIssues.length / tasks.length

    if (qualityIssueRatio === 0) return 100 // Perfect quality
    if (qualityIssueRatio <= 0.05) return 90 // Excellent quality
    if (qualityIssueRatio <= 0.1) return 80 // Good quality
    if (qualityIssueRatio <= 0.2) return 60 // Average quality
    if (qualityIssueRatio <= 0.3) return 40 // Poor quality
    return 20 // Very poor quality
  }

  /**
   * Calculate risk score (0-100, higher is riskier)
   */
  private calculateRiskScore(
    timelineAdherence: number,
    budgetAdherence: number,
    scopeStability: number,
    teamVelocity: number,
    qualityScore: number,
  ): number {
    // Invert scores so higher means more risk
    const timelineRisk = 100 - timelineAdherence
    const budgetRisk = 100 - budgetAdherence
    const scopeRisk = 100 - scopeStability
    const velocityRisk = 100 - teamVelocity
    const qualityRisk = 100 - qualityScore

    // Weight the factors
    const weightedRisk =
      timelineRisk * 0.25 + budgetRisk * 0.2 + scopeRisk * 0.2 + velocityRisk * 0.15 + qualityRisk * 0.2

    return Math.round(weightedRisk)
  }

  /**
   * Calculate overall health score (0-100)
   */
  private calculateHealthScore(
    timelineAdherence: number,
    budgetAdherence: number,
    scopeStability: number,
    teamVelocity: number,
    qualityScore: number,
    riskScore: number,
  ): number {
    // Weight the factors
    const weightedHealth =
      timelineAdherence * 0.25 +
      budgetAdherence * 0.2 +
      scopeStability * 0.15 +
      teamVelocity * 0.15 +
      qualityScore * 0.15 -
      riskScore * 0.1

    return Math.round(Math.max(0, Math.min(100, weightedHealth)))
  }

  /**
   * Predict project completion date
   */
  private predictCompletionDate(project: any, tasks: any[], teamVelocity: number): Date | undefined {
    if (!project.start_date || project.progress >= 100) {
      return undefined
    }

    const startDate = new Date(project.start_date)
    const now = new Date()
    const elapsedDays = (now.getTime() - startDate.getTime()) / 86400000

    // If no progress or just started, use end date if available
    if (project.progress <= 5 || elapsedDays <= 3) {
      return project.end_date ? new Date(project.end_date) : undefined
    }

    // Calculate daily progress rate
    const progressRate = project.progress / elapsedDays

    // Adjust rate based on team velocity
    let adjustedRate = progressRate
    if (teamVelocity >= 80)
      adjustedRate *= 1.1 // Team is fast
    else if (teamVelocity <= 40) adjustedRate *= 0.9 // Team is slow

    // Calculate remaining days
    const remainingProgress = 100 - project.progress
    const remainingDays = remainingProgress / adjustedRate

    // Calculate predicted completion date
    const predictedDate = new Date(now)
    predictedDate.setDate(predictedDate.getDate() + Math.ceil(remainingDays))

    return predictedDate
  }

  /**
   * Predict final budget
   */
  private predictFinalBudget(project: any, budgetAdherence: number): number | undefined {
    if (!project.budget || project.budget <= 0) {
      return undefined
    }

    const budget = project.budget
    const spent = project.spent || 0
    const progress = project.progress

    // If project is complete, return actual spent
    if (progress >= 100) {
      return spent
    }

    // Calculate burn rate
    const burnRate = spent / progress

    // Adjust burn rate based on budget adherence
    let adjustedBurnRate = burnRate
    if (budgetAdherence >= 80)
      adjustedBurnRate *= 0.95 // Under budget trend
    else if (budgetAdherence <= 40) adjustedBurnRate *= 1.1 // Over budget trend

    // Calculate predicted total
    const predictedTotal = adjustedBurnRate * 100

    return Math.round(predictedTotal * 100) / 100
  }

  /**
   * Generate insights based on metrics and project data
   */
  private async generateInsights(
    project: any,
    metrics: ProjectMetrics,
    tasks: any[],
    activities: any[],
    request: AIAnalysisRequest,
  ): Promise<AIInsight[]> {
    const insights: AIInsight[] = []

    // Generate timeline insights
    if (request.includeRisks !== false) {
      this.generateTimelineInsights(project, metrics, insights)
    }

    // Generate budget insights
    if (request.includeRisks !== false) {
      this.generateBudgetInsights(project, metrics, insights)
    }

    // Generate scope insights
    if (request.includeRisks !== false || request.includeOpportunities !== false) {
      this.generateScopeInsights(project, metrics, tasks, insights)
    }

    // Generate team insights
    if (request.includeRecommendations !== false) {
      this.generateTeamInsights(project, metrics, tasks, insights)
    }

    // Generate quality insights
    if (request.includeRisks !== false) {
      this.generateQualityInsights(project, metrics, tasks, activities, insights)
    }

    // Generate opportunity insights
    if (request.includeOpportunities !== false) {
      this.generateOpportunityInsights(project, metrics, insights)
    }

    // Generate prediction insights
    if (request.includePredictions !== false) {
      this.generatePredictionInsights(project, metrics, insights)
    }

    // Generate anomaly insights
    if (request.includeAnomalies !== false) {
      this.generateAnomalyInsights(project, metrics, tasks, activities, insights)
    }

    return insights
  }

  /**
   * Generate timeline insights
   */
  private generateTimelineInsights(project: any, metrics: ProjectMetrics, insights: AIInsight[]): void {
    // Check if project is behind schedule
    if (metrics.timelineAdherence <= 40) {
      insights.push({
        id: `timeline_risk_${project.id}_${Date.now()}`,
        projectId: project.id,
        type: "risk",
        title: "Project Significantly Behind Schedule",
        description: `The project is significantly behind schedule with a timeline adherence score of ${metrics.timelineAdherence}/100. Current progress is ${project.progress}% but should be higher based on elapsed time.`,
        confidence: 0.9,
        impact: "high",
        category: "timeline",
        suggestedActions: [
          "Review and reprioritize remaining tasks",
          "Consider adding resources to critical path tasks",
          "Evaluate scope reduction options",
          "Update stakeholders on revised timeline",
        ],
        createdAt: new Date(),
        status: "active",
      })
    } else if (metrics.timelineAdherence <= 60) {
      insights.push({
        id: `timeline_risk_${project.id}_${Date.now()}`,
        projectId: project.id,
        type: "risk",
        title: "Project Behind Schedule",
        description: `The project is behind schedule with a timeline adherence score of ${metrics.timelineAdherence}/100. Current progress is ${project.progress}% but should be higher based on elapsed time.`,
        confidence: 0.8,
        impact: "medium",
        category: "timeline",
        suggestedActions: [
          "Identify and address bottlenecks",
          "Focus resources on critical path tasks",
          "Consider timeline adjustment",
        ],
        createdAt: new Date(),
        status: "active",
      })
    }
  }

  /**
   * Generate budget insights
   */
  private generateBudgetInsights(project: any, metrics: ProjectMetrics, insights: AIInsight[]): void {
    if (!project.budget || project.budget <= 0) {
      return
    }

    const spent = project.spent || 0
    const budget = project.budget

    // Check if project is over budget
    if (metrics.budgetAdherence <= 40) {
      insights.push({
        id: `budget_risk_${project.id}_${Date.now()}`,
        projectId: project.id,
        type: "risk",
        title: "Project Significantly Over Budget",
        description: `The project is significantly over budget with a budget adherence score of ${metrics.budgetAdherence}/100. ${spent} spent of ${budget} budget (${Math.round((spent / budget) * 100)}%) with only ${project.progress}% progress.`,
        confidence: 0.9,
        impact: "high",
        category: "budget",
        suggestedActions: [
          "Conduct immediate budget review",
          "Identify cost overruns",
          "Implement cost control measures",
          "Prepare budget adjustment request",
        ],
        createdAt: new Date(),
        status: "active",
      })
    }
  }

  /**
   * Generate scope insights
   */
  private generateScopeInsights(project: any, metrics: ProjectMetrics, tasks: any[], insights: AIInsight[]): void {
    if (metrics.scopeStability <= 60) {
      insights.push({
        id: `scope_risk_${project.id}_${Date.now()}`,
        projectId: project.id,
        type: "risk",
        title: "Scope Instability Detected",
        description: `The project scope has been unstable with a stability score of ${metrics.scopeStability}/100. Frequent scope changes can impact timeline and budget.`,
        confidence: 0.8,
        impact: "medium",
        category: "scope",
        suggestedActions: [
          "Implement change control process",
          "Review and freeze scope where possible",
          "Communicate scope changes to stakeholders",
        ],
        createdAt: new Date(),
        status: "active",
      })
    }
  }

  /**
   * Generate team insights
   */
  private generateTeamInsights(project: any, metrics: ProjectMetrics, tasks: any[], insights: AIInsight[]): void {
    if (metrics.teamVelocity <= 40) {
      insights.push({
        id: `team_risk_${project.id}_${Date.now()}`,
        projectId: project.id,
        type: "recommendation",
        title: "Low Team Velocity",
        description: `Team velocity is low at ${metrics.teamVelocity}/100. This may indicate resource constraints or process inefficiencies.`,
        confidence: 0.7,
        impact: "medium",
        category: "team",
        suggestedActions: [
          "Review team workload and capacity",
          "Identify and remove blockers",
          "Consider process improvements",
          "Provide additional training or resources",
        ],
        createdAt: new Date(),
        status: "active",
      })
    }
  }

  /**
   * Generate quality insights
   */
  private generateQualityInsights(
    project: any,
    metrics: ProjectMetrics,
    tasks: any[],
    activities: any[],
    insights: AIInsight[],
  ): void {
    if (metrics.qualityScore <= 60) {
      insights.push({
        id: `quality_risk_${project.id}_${Date.now()}`,
        projectId: project.id,
        type: "risk",
        title: "Quality Issues Detected",
        description: `Quality score is concerning at ${metrics.qualityScore}/100. Multiple issues or bugs have been reported.`,
        confidence: 0.8,
        impact: "high",
        category: "quality",
        suggestedActions: [
          "Implement additional quality checks",
          "Review and improve testing processes",
          "Address outstanding quality issues",
          "Consider code review improvements",
        ],
        createdAt: new Date(),
        status: "active",
      })
    }
  }

  /**
   * Generate opportunity insights
   */
  private generateOpportunityInsights(project: any, metrics: ProjectMetrics, insights: AIInsight[]): void {
    if (metrics.healthScore >= 80) {
      insights.push({
        id: `opportunity_${project.id}_${Date.now()}`,
        projectId: project.id,
        type: "opportunity",
        title: "Project Performing Well",
        description: `Project health score is excellent at ${metrics.healthScore}/100. Consider leveraging this success for other projects.`,
        confidence: 0.9,
        impact: "medium",
        category: "business",
        suggestedActions: [
          "Document best practices",
          "Share learnings with other teams",
          "Consider early delivery opportunities",
          "Plan for resource reallocation",
        ],
        createdAt: new Date(),
        status: "active",
      })
    }
  }

  /**
   * Generate prediction insights
   */
  private generatePredictionInsights(project: any, metrics: ProjectMetrics, insights: AIInsight[]): void {
    if (metrics.predictedCompletion) {
      const originalEnd = project.end_date ? new Date(project.end_date) : null
      if (originalEnd && metrics.predictedCompletion > originalEnd) {
        const delayDays = Math.ceil((metrics.predictedCompletion.getTime() - originalEnd.getTime()) / 86400000)
        insights.push({
          id: `prediction_${project.id}_${Date.now()}`,
          projectId: project.id,
          type: "prediction",
          title: "Completion Delay Predicted",
          description: `Based on current progress, the project is predicted to complete ${delayDays} days late on ${metrics.predictedCompletion.toDateString()}.`,
          confidence: 0.75,
          impact: "high",
          category: "timeline",
          suggestedActions: [
            "Review critical path",
            "Consider resource reallocation",
            "Communicate delay to stakeholders",
            "Explore scope reduction options",
          ],
          createdAt: new Date(),
          status: "active",
        })
      }
    }
  }

  /**
   * Generate anomaly insights
   */
  private generateAnomalyInsights(
    project: any,
    metrics: ProjectMetrics,
    tasks: any[],
    activities: any[],
    insights: AIInsight[],
  ): void {
    // Check for unusual activity patterns
    const recentActivities = activities.filter((a) => {
      const activityDate = new Date(a.created_at)
      const daysSince = (Date.now() - activityDate.getTime()) / 86400000
      return daysSince <= 7
    })

    if (recentActivities.length === 0 && project.progress < 100) {
      insights.push({
        id: `anomaly_${project.id}_${Date.now()}`,
        projectId: project.id,
        type: "anomaly",
        title: "No Recent Activity Detected",
        description:
          "No project activity has been recorded in the past 7 days. This may indicate the project is stalled or not being actively managed.",
        confidence: 0.8,
        impact: "medium",
        category: "team",
        suggestedActions: [
          "Check project status with team",
          "Review for blockers or issues",
          "Update project activity",
          "Consider project health check",
        ],
        createdAt: new Date(),
        status: "active",
      })
    }
  }

  /**
   * Generate AI summary using available data
   */
  private async generateAISummary(project: any, metrics: ProjectMetrics, insights: AIInsight[]): Promise<string> {
    try {
      // Create a comprehensive summary based on metrics and insights
      const healthStatus =
        metrics.healthScore >= 80
          ? "excellent"
          : metrics.healthScore >= 60
            ? "good"
            : metrics.healthScore >= 40
              ? "concerning"
              : "critical"

      const riskLevel =
        metrics.riskScore <= 20
          ? "low"
          : metrics.riskScore <= 40
            ? "moderate"
            : metrics.riskScore <= 60
              ? "high"
              : "critical"

      const criticalInsights = insights.filter((i) => i.impact === "critical" || i.impact === "high")

      let summary = `Project "${project.name}" is currently in ${healthStatus} health with a ${riskLevel} risk level. `

      summary += `Key metrics: Timeline adherence ${metrics.timelineAdherence}%, Budget adherence ${metrics.budgetAdherence}%, Team velocity ${metrics.teamVelocity}%, Quality score ${metrics.qualityScore}%. `

      if (criticalInsights.length > 0) {
        summary += `There are ${criticalInsights.length} critical insights requiring immediate attention. `
      }

      if (metrics.predictedCompletion) {
        summary += `Predicted completion: ${metrics.predictedCompletion.toDateString()}. `
      }

      if (metrics.predictedBudget && project.budget) {
        const budgetVariance = ((metrics.predictedBudget / project.budget - 1) * 100).toFixed(1)
        summary += `Predicted budget variance: ${budgetVariance}%. `
      }

      summary += `Recommendations: Focus on ${criticalInsights.length > 0 ? "addressing critical issues" : "maintaining current performance"}.`

      return summary
    } catch (error: any) {
      logger.error("Failed to generate AI summary", { error: error.message })
      return "AI summary generation failed. Please review metrics and insights manually."
    }
  }
}

// Export singleton instance
export const aiInsightsEngine = AIInsightsEngine.getInstance()
