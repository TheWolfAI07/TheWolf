"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Target,
  Zap,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Sparkles,
  Rocket,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { logger } from "@/lib/logger"

interface AIInsight {
  id: string
  type: "recommendation" | "warning" | "opportunity" | "prediction"
  title: string
  description: string
  confidence: number
  impact: "low" | "medium" | "high" | "critical"
  actionable: boolean
  actions?: string[]
  timestamp: string
}

interface ProjectHealth {
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

interface DashboardMetrics {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  avgProgress: number
  successRate: number
  errorRate: number
  responseTime: number
  uptime: number
  trends: {
    projects: number
    completion: number
    performance: number
  }
}

export default function AIDashboard() {
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [projectHealth, setProjectHealth] = useState<Record<string, ProjectHealth>>({})
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadDashboardData = async () => {
    try {
      setRefreshing(true)
      logger.info("Loading AI dashboard data")

      // Load AI insights
      const insightsResponse = await apiClient.get<{ data: AIInsight[] }>("/api/ai/insights")
      if (insightsResponse.success && insightsResponse.data?.data) {
        setInsights(insightsResponse.data.data)
      }

      // Load metrics
      const metricsResponse = await apiClient.get<{ data: DashboardMetrics }>("/api/ai/metrics")
      if (metricsResponse.success && metricsResponse.data?.data) {
        setMetrics(metricsResponse.data.data)
      }

      // Load project health
      const healthResponse = await apiClient.get<{ data: Record<string, ProjectHealth> }>("/api/ai/health")
      if (healthResponse.success && healthResponse.data?.data) {
        setProjectHealth(healthResponse.data.data)
      }
    } catch (error: any) {
      logger.error("Failed to load dashboard data", { error: error.message })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadDashboardData()

    // Auto-refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "recommendation":
        return <Lightbulb className="h-4 w-4 text-blue-600" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "opportunity":
        return <Target className="h-4 w-4 text-green-600" />
      case "prediction":
        return <Brain className="h-4 w-4 text-purple-600" />
      default:
        return <Sparkles className="h-4 w-4 text-gray-600" />
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case "recommendation":
        return "border-blue-200 bg-blue-50"
      case "warning":
        return "border-yellow-200 bg-yellow-50"
      case "opportunity":
        return "border-green-200 bg-green-50"
      case "prediction":
        return "border-purple-200 bg-purple-50"
      default:
        return "border-gray-200 bg-gray-50"
    }
  }

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case "critical":
        return <Badge variant="destructive">Critical</Badge>
      case "high":
        return <Badge className="bg-orange-100 text-orange-800">High</Badge>
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
      case "low":
        return <Badge variant="outline">Low</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getHealthColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "text-green-600"
      case "good":
        return "text-blue-600"
      case "warning":
        return "text-yellow-600"
      case "critical":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getHealthIcon = (status: string) => {
    switch (status) {
      case "excellent":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "good":
        return <CheckCircle className="h-4 w-4 text-blue-600" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "critical":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const getTrendIcon = (value: number) => {
    if (value > 0) return <ArrowUp className="h-3 w-3 text-green-600" />
    if (value < 0) return <ArrowDown className="h-3 w-3 text-red-600" />
    return <Minus className="h-3 w-3 text-gray-600" />
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Brain className="h-6 w-6 text-purple-600 animate-pulse" />
          <h2 className="text-2xl font-bold">AI-Powered Dashboard</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Brain className="h-6 w-6 text-purple-600" />
          <h2 className="text-2xl font-bold">AI-Powered Dashboard</h2>
          <Badge className="bg-purple-100 text-purple-800">
            <Sparkles className="h-3 w-3 mr-1" />
            AI Enhanced
          </Badge>
        </div>
        <Button variant="outline" size="sm" onClick={loadDashboardData} disabled={refreshing}>
          {refreshing ? <Activity className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
          Refresh Insights
        </Button>
      </div>

      {/* Key Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Target className="h-4 w-4 mr-2" />
                Active Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.activeProjects}</div>
              <div className="flex items-center text-blue-100 text-xs">
                {getTrendIcon(metrics.trends.projects)}
                <span className="ml-1">{Math.abs(metrics.trends.projects)}% vs last week</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.successRate}%</div>
              <div className="flex items-center text-green-100 text-xs">
                {getTrendIcon(metrics.trends.completion)}
                <span className="ml-1">{Math.abs(metrics.trends.completion)}% vs last week</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Zap className="h-4 w-4 mr-2" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.responseTime}ms</div>
              <div className="flex items-center text-purple-100 text-xs">
                {getTrendIcon(-metrics.trends.performance)}
                <span className="ml-1">{Math.abs(metrics.trends.performance)}% vs last week</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                System Uptime
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.uptime}%</div>
              <div className="text-orange-100 text-xs">Last 30 days</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="insights" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="health">Project Health</TabsTrigger>
          <TabsTrigger value="analytics">Smart Analytics</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
        </TabsList>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {insights.length > 0 ? (
              insights.map((insight) => (
                <Card key={insight.id} className={`${getInsightColor(insight.type)} border-l-4`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        {getInsightIcon(insight.type)}
                        <CardTitle className="text-sm font-medium">{insight.title}</CardTitle>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getImpactBadge(insight.impact)}
                        <Badge variant="outline" className="text-xs">
                          {Math.round(insight.confidence * 100)}% confidence
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-700">{insight.description}</p>

                    {insight.actionable && insight.actions && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                          Recommended Actions
                        </h4>
                        <ul className="space-y-1">
                          {insight.actions.map((action, index) => (
                            <li key={index} className="text-xs text-gray-600 flex items-center">
                              <Rocket className="h-3 w-3 mr-2 text-blue-500" />
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Generated {new Date(insight.timestamp).toLocaleString()}</span>
                      <Badge variant="outline" className="capitalize">
                        {insight.type}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-2 text-center py-12">
                <Brain className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No AI Insights Available</h3>
                <p className="text-gray-500">AI is analyzing your data. Check back soon for personalized insights.</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Project Health Tab */}
        <TabsContent value="health" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {Object.entries(projectHealth).map(([projectId, health]) => (
              <Card key={projectId}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Project Health</CardTitle>
                    <div className="flex items-center space-x-2">
                      {getHealthIcon(health.status)}
                      <span className={`text-sm font-medium ${getHealthColor(health.status)}`}>{health.status}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">{health.score}</div>
                    <Progress value={health.score} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">Health Factors</h4>
                    {Object.entries(health.factors).map(([factor, score]) => (
                      <div key={factor} className="flex items-center justify-between text-sm">
                        <span className="capitalize">{factor}</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={score} className="h-1 w-16" />
                          <span className="text-xs font-medium w-8">{score}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {health.recommendations.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">Recommendations</h4>
                      <ul className="space-y-1">
                        {health.recommendations.map((rec, index) => (
                          <li key={index} className="text-xs text-gray-600 flex items-start">
                            <Lightbulb className="h-3 w-3 mr-2 mt-0.5 text-yellow-500 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Smart Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Performance Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Project Completion Rate</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={85} className="h-2 w-20" />
                      <span className="text-sm font-medium">85%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Average Response Time</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={92} className="h-2 w-20" />
                      <span className="text-sm font-medium">92ms</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>System Reliability</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={99} className="h-2 w-20" />
                      <span className="text-sm font-medium">99.9%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Resource Allocation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>High Priority Projects</span>
                    <Badge className="bg-red-100 text-red-800">35%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Medium Priority Projects</span>
                    <Badge className="bg-yellow-100 text-yellow-800">45%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Low Priority Projects</span>
                    <Badge className="bg-green-100 text-green-800">20%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center text-purple-700">
                  <Brain className="h-5 w-5 mr-2" />
                  AI Predictions
                </CardTitle>
                <CardDescription>Machine learning insights based on historical data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="border-blue-200 bg-blue-50">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>Project Completion Forecast:</strong> Based on current trends, you're likely to complete 3
                    more projects this month with 87% confidence.
                  </AlertDescription>
                </Alert>

                <Alert className="border-green-200 bg-green-50">
                  <Target className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>Performance Optimization:</strong> Implementing suggested workflow changes could improve
                    efficiency by 23%.
                  </AlertDescription>
                </Alert>

                <Alert className="border-yellow-200 bg-yellow-50">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    <strong>Resource Planning:</strong> Current workload suggests you'll need 2 additional team members
                    by next quarter.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <LineChart className="h-5 w-5 mr-2" />
                  Trend Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Next 30 Days Forecast</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <ArrowUp className="h-3 w-3 text-green-600 mr-2" />
                        Project completion rate expected to increase by 12%
                      </li>
                      <li className="flex items-center">
                        <ArrowDown className="h-3 w-3 text-red-600 mr-2" />
                        System load may increase due to new projects
                      </li>
                      <li className="flex items-center">
                        <ArrowUp className="h-3 w-3 text-green-600 mr-2" />
                        Team productivity trending upward
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
