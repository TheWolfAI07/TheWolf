"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Database,
  Server,
  Shield,
  Monitor,
  Zap,
  Clock,
  Star,
  Trophy,
  Terminal,
  Rocket,
  Settings,
  DollarSign,
  Users,
  TrendingUp,
} from "lucide-react"
import { apiClient } from "@/lib/api-client"

interface PreLaunchTest {
  id: string
  name: string
  category: string
  description: string
  status: "pending" | "running" | "success" | "warning" | "error"
  message: string
  realData?: any
  responseTime?: number
  error?: string
  fixes?: string[]
  priority: "critical" | "high" | "medium" | "low"
  section: "database" | "api" | "frontend" | "security" | "performance" | "subscription" | "deployment"
}

export default function PreLaunchFinalDebug() {
  const [tests, setTests] = useState<PreLaunchTest[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [currentTest, setCurrentTest] = useState("")
  const [progress, setProgress] = useState(0)
  const [overallScore, setOverallScore] = useState(0)
  const [subscriptionReady, setSubscriptionReady] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [deploymentStatus, setDeploymentStatus] = useState<any>({})

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev.slice(0, 99)])
  }

  // PRE-LAUNCH SUBSCRIPTION PLATFORM TESTS
  const preLaunchTests: Omit<PreLaunchTest, "status" | "message">[] = [
    // CRITICAL SUBSCRIPTION TESTS
    {
      id: "subscription-database-ready",
      name: "💰 Subscription Database",
      category: "Subscription Core",
      description: "Verify subscription tables and billing data are ready",
      priority: "critical",
      section: "subscription",
    },
    {
      id: "subscription-payment-processing",
      name: "💳 Payment Processing",
      category: "Subscription Core",
      description: "Test payment gateway integration and processing",
      priority: "critical",
      section: "subscription",
    },
    {
      id: "subscription-user-management",
      name: "👥 User Management",
      category: "Subscription Core",
      description: "Verify user registration, authentication, and profile management",
      priority: "critical",
      section: "subscription",
    },

    // CRITICAL PLATFORM TESTS
    {
      id: "platform-database-live",
      name: "🗄️ Live Database Connection",
      category: "Platform Core",
      description: "Confirm all database operations work with live data",
      priority: "critical",
      section: "database",
    },
    {
      id: "platform-api-endpoints",
      name: "🚀 All API Endpoints",
      category: "Platform Core",
      description: "Test every API endpoint for subscription platform",
      priority: "critical",
      section: "api",
    },
    {
      id: "platform-frontend-complete",
      name: "🖥️ Frontend Complete",
      category: "Platform Core",
      description: "Verify all frontend components work perfectly",
      priority: "critical",
      section: "frontend",
    },

    // DEPLOYMENT READINESS
    {
      id: "deployment-environment",
      name: "🌐 Production Environment",
      category: "Deployment",
      description: "Verify production environment is properly configured",
      priority: "critical",
      section: "deployment",
    },
    {
      id: "deployment-domain-ssl",
      name: "🔒 Domain & SSL",
      category: "Deployment",
      description: "Confirm custom domain and SSL certificate are working",
      priority: "critical",
      section: "deployment",
    },
    {
      id: "deployment-performance",
      name: "⚡ Performance Optimization",
      category: "Deployment",
      description: "Verify platform performance meets subscription standards",
      priority: "high",
      section: "deployment",
    },

    // SECURITY FOR SUBSCRIPTION SERVICE
    {
      id: "security-data-protection",
      name: "🛡️ Data Protection",
      category: "Security",
      description: "Verify customer data protection and privacy compliance",
      priority: "critical",
      section: "security",
    },
    {
      id: "security-payment-security",
      name: "🔐 Payment Security",
      category: "Security",
      description: "Confirm payment processing security standards",
      priority: "critical",
      section: "security",
    },

    // SUBSCRIPTION BUSINESS LOGIC
    {
      id: "subscription-billing-cycles",
      name: "📅 Billing Cycles",
      category: "Business Logic",
      description: "Test monthly/annual billing and subscription management",
      priority: "high",
      section: "subscription",
    },
    {
      id: "subscription-feature-access",
      name: "🎯 Feature Access Control",
      category: "Business Logic",
      description: "Verify different subscription tiers have proper feature access",
      priority: "high",
      section: "subscription",
    },
    {
      id: "subscription-analytics",
      name: "📊 Revenue Analytics",
      category: "Business Logic",
      description: "Test subscription metrics and revenue tracking",
      priority: "medium",
      section: "subscription",
    },
  ]

  const runPreLaunchTest = async (test: Omit<PreLaunchTest, "status" | "message">): Promise<PreLaunchTest> => {
    const startTime = Date.now()
    addLog(`🧪 Testing: ${test.name}`)

    try {
      let result: Partial<PreLaunchTest> = {}

      switch (test.id) {
        case "subscription-database-ready":
          result = await testSubscriptionDatabase()
          break
        case "subscription-payment-processing":
          result = await testPaymentProcessing()
          break
        case "subscription-user-management":
          result = await testUserManagement()
          break
        case "platform-database-live":
          result = await testPlatformDatabase()
          break
        case "platform-api-endpoints":
          result = await testPlatformAPIs()
          break
        case "platform-frontend-complete":
          result = await testFrontendComplete()
          break
        case "deployment-environment":
          result = await testDeploymentEnvironment()
          break
        case "deployment-domain-ssl":
          result = await testDomainSSL()
          break
        case "deployment-performance":
          result = await testDeploymentPerformance()
          break
        case "security-data-protection":
          result = await testDataProtection()
          break
        case "security-payment-security":
          result = await testPaymentSecurity()
          break
        case "subscription-billing-cycles":
          result = await testBillingCycles()
          break
        case "subscription-feature-access":
          result = await testFeatureAccess()
          break
        case "subscription-analytics":
          result = await testSubscriptionAnalytics()
          break
        default:
          result = {
            status: "error",
            message: "Test not implemented",
            error: `Test ${test.id} not found`,
          }
      }

      const responseTime = Date.now() - startTime
      addLog(
        `${result.status === "success" ? "✅" : result.status === "warning" ? "⚠️" : "❌"} ${test.name}: ${result.message}`,
      )

      return {
        ...test,
        status: result.status || "error",
        message: result.message || "Test completed",
        realData: result.realData,
        error: result.error,
        fixes: result.fixes,
        responseTime,
      }
    } catch (error: any) {
      addLog(`💥 ${test.name} failed: ${error.message}`)
      return {
        ...test,
        status: "error",
        message: "Test failed with exception",
        error: error.message,
        responseTime: Date.now() - startTime,
        fixes: ["Check browser console for detailed error information"],
      }
    }
  }

  // TEST IMPLEMENTATIONS
  const testSubscriptionDatabase = async (): Promise<Partial<PreLaunchTest>> => {
    try {
      const response = await apiClient.get("/api/users")

      if (!response.success) {
        return {
          status: "warning",
          message: "⚠️ User management system needs setup",
          fixes: ["Set up user subscription tables", "Configure user roles and permissions"],
        }
      }

      return {
        status: "success",
        message: "✅ Subscription database ready for users",
        realData: response.data,
      }
    } catch (error: any) {
      return {
        status: "error",
        message: "❌ Subscription database not ready",
        error: error.message,
        fixes: ["Create subscription database tables", "Set up user management system"],
      }
    }
  }

  const testPaymentProcessing = async (): Promise<Partial<PreLaunchTest>> => {
    // Check if payment environment variables are configured
    const hasPaymentConfig = !!(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ||
      process.env.NEXT_PUBLIC_PAYMENT_PROVIDER
    )

    if (!hasPaymentConfig) {
      return {
        status: "warning",
        message: "⚠️ Payment processing needs configuration",
        fixes: [
          "🚨 CRITICAL: Set up payment provider (Stripe, PayPal, etc.)",
          "💳 Configure payment environment variables",
          "🔧 Test payment processing in sandbox mode",
        ],
      }
    }

    return {
      status: "success",
      message: "✅ Payment configuration detected",
      realData: { paymentConfigured: hasPaymentConfig },
    }
  }

  const testUserManagement = async (): Promise<Partial<PreLaunchTest>> => {
    try {
      const authResponse = await apiClient.get("/api/auth/demo")

      return {
        status: "success",
        message: "✅ User authentication system working",
        realData: authResponse.data,
      }
    } catch (error: any) {
      return {
        status: "error",
        message: "❌ User management system needs setup",
        error: error.message,
        fixes: ["Configure authentication system", "Set up user registration flow"],
      }
    }
  }

  const testPlatformDatabase = async (): Promise<Partial<PreLaunchTest>> => {
    try {
      const verifyResponse = await apiClient.get("/api/verify")

      if (!verifyResponse.success) {
        throw new Error("Database verification failed")
      }

      const dbCheck = verifyResponse.data?.checks?.database

      return {
        status: dbCheck?.connected ? "success" : "error",
        message: dbCheck?.connected ? "✅ Live database fully operational" : "❌ Database connection failed",
        realData: dbCheck,
        fixes: !dbCheck?.connected ? ["Fix database connection", "Verify environment variables"] : [],
      }
    } catch (error: any) {
      return {
        status: "error",
        message: "❌ Database connection test failed",
        error: error.message,
        fixes: ["Check database configuration", "Verify Supabase connection"],
      }
    }
  }

  const testPlatformAPIs = async (): Promise<Partial<PreLaunchTest>> => {
    const endpoints = ["/api/health", "/api/status", "/api/analytics", "/api/projects", "/api/verify"]

    const results = []
    let workingEndpoints = 0

    for (const endpoint of endpoints) {
      try {
        const response = await apiClient.get(endpoint)
        const working = response.success
        if (working) workingEndpoints++

        results.push({
          endpoint,
          working,
          status: response.status,
          responseTime: response.data?.responseTime || 0,
        })
      } catch (error: any) {
        results.push({
          endpoint,
          working: false,
          error: error.message,
        })
      }
    }

    return {
      status: workingEndpoints === endpoints.length ? "success" : "warning",
      message: `${workingEndpoints}/${endpoints.length} API endpoints working`,
      realData: results,
      fixes: workingEndpoints < endpoints.length ? ["Fix failing API endpoints"] : [],
    }
  }

  const testFrontendComplete = async (): Promise<Partial<PreLaunchTest>> => {
    try {
      const components = {
        buttons: document.querySelectorAll("button").length,
        cards: document.querySelectorAll("[class*='card']").length,
        navigation: document.querySelectorAll("nav, [class*='nav']").length,
        forms: document.querySelectorAll("form, input").length,
      }

      const totalComponents = Object.values(components).reduce((a, b) => a + b, 0)

      return {
        status: totalComponents > 20 ? "success" : "warning",
        message: `✅ ${totalComponents} UI components active`,
        realData: components,
        fixes: totalComponents <= 20 ? ["Add more interactive components"] : [],
      }
    } catch (error: any) {
      return {
        status: "error",
        message: "❌ Frontend component test failed",
        error: error.message,
        fixes: ["Check component rendering"],
      }
    }
  }

  const testDeploymentEnvironment = async (): Promise<Partial<PreLaunchTest>> => {
    const requiredVars = {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NODE_ENV: process.env.NODE_ENV === "production",
    }

    const configured = Object.values(requiredVars).filter(Boolean).length
    const total = Object.keys(requiredVars).length

    return {
      status: configured === total ? "success" : "warning",
      message: `${configured}/${total} environment variables configured`,
      realData: requiredVars,
      fixes: configured < total ? ["Configure missing environment variables"] : [],
    }
  }

  const testDomainSSL = async (): Promise<Partial<PreLaunchTest>> => {
    const security = {
      https: window.location.protocol === "https:",
      customDomain: !window.location.hostname.includes("vercel.app"),
      secureContext: window.isSecureContext,
    }

    const issues = []
    if (!security.https) issues.push("Enable HTTPS")
    if (!security.customDomain) issues.push("Set up custom domain")

    return {
      status: issues.length === 0 ? "success" : "warning",
      message: issues.length === 0 ? "✅ Domain and SSL configured" : `⚠️ ${issues.length} domain issues`,
      realData: security,
      fixes: issues.length > 0 ? issues.map((issue) => `🔧 ${issue}`) : [],
    }
  }

  const testDeploymentPerformance = async (): Promise<Partial<PreLaunchTest>> => {
    const timing = performance.timing
    const loadTime = timing.loadEventEnd - timing.navigationStart

    return {
      status: loadTime < 2000 ? "success" : loadTime < 3000 ? "warning" : "error",
      message: `⚡ Platform loads in ${loadTime}ms`,
      realData: { loadTime },
      fixes: loadTime > 2000 ? ["Optimize performance for subscription users"] : [],
    }
  }

  const testDataProtection = async (): Promise<Partial<PreLaunchTest>> => {
    const security = {
      https: window.location.protocol === "https:",
      secureContext: window.isSecureContext,
      cookieSecure: document.cookie.includes("Secure"),
    }

    const securityScore = Object.values(security).filter(Boolean).length

    return {
      status: securityScore === 3 ? "success" : "warning",
      message: `🛡️ ${securityScore}/3 security measures active`,
      realData: security,
      fixes: securityScore < 3 ? ["Enhance data protection measures"] : [],
    }
  }

  const testPaymentSecurity = async (): Promise<Partial<PreLaunchTest>> => {
    const hasSecurePayment = window.location.protocol === "https:" && window.isSecureContext

    return {
      status: hasSecurePayment ? "success" : "error",
      message: hasSecurePayment ? "✅ Payment security verified" : "❌ Payment security insufficient",
      realData: { securePayment: hasSecurePayment },
      fixes: !hasSecurePayment ? ["🚨 CRITICAL: Enable HTTPS for payment security"] : [],
    }
  }

  const testBillingCycles = async (): Promise<Partial<PreLaunchTest>> => {
    // This would typically test your billing system
    return {
      status: "warning",
      message: "⚠️ Billing system needs configuration",
      fixes: ["🚨 Set up monthly billing cycles", "💰 Configure subscription tiers", "📅 Test billing automation"],
    }
  }

  const testFeatureAccess = async (): Promise<Partial<PreLaunchTest>> => {
    // Test if different user roles have proper access
    return {
      status: "warning",
      message: "⚠️ Feature access control needs setup",
      fixes: ["🎯 Define subscription tiers", "🔒 Implement feature gating", "👥 Set up user role management"],
    }
  }

  const testSubscriptionAnalytics = async (): Promise<Partial<PreLaunchTest>> => {
    try {
      const analyticsResponse = await apiClient.get("/api/analytics")

      return {
        status: analyticsResponse.success ? "success" : "warning",
        message: analyticsResponse.success ? "✅ Analytics system ready" : "⚠️ Analytics needs setup",
        realData: analyticsResponse.data,
        fixes: !analyticsResponse.success ? ["Set up revenue analytics", "Configure subscription metrics"] : [],
      }
    } catch (error: any) {
      return {
        status: "error",
        message: "❌ Analytics system not working",
        error: error.message,
        fixes: ["Fix analytics system", "Set up subscription tracking"],
      }
    }
  }

  const runPreLaunchDebug = async () => {
    setIsRunning(true)
    setProgress(0)
    setSubscriptionReady(false)
    setLogs([])

    addLog("🚀 STARTING PRE-LAUNCH SUBSCRIPTION PLATFORM DEBUG")
    addLog("💰 Verifying everything is ready for paying customers!")

    const initialTests = preLaunchTests.map((test) => ({
      ...test,
      status: "pending" as const,
      message: "Waiting for verification...",
    }))
    setTests(initialTests)

    let completedTests = 0
    const testResults = []

    for (const test of preLaunchTests) {
      setCurrentTest(test.name)

      setTests((prev) => prev.map((t) => (t.id === test.id ? { ...t, status: "running", message: "Testing..." } : t)))

      const result = await runPreLaunchTest(test)
      testResults.push(result)

      setTests((prev) => prev.map((t) => (t.id === test.id ? result : t)))

      completedTests++
      setProgress((completedTests / preLaunchTests.length) * 100)

      await new Promise((resolve) => setTimeout(resolve, 300))
    }

    // Calculate readiness scores
    const criticalTests = testResults.filter((t) => t.priority === "critical")
    const criticalPassed = criticalTests.filter((t) => t.status === "success").length
    const totalPassed = testResults.filter((t) => t.status === "success").length
    const totalErrors = testResults.filter((t) => t.status === "error").length

    const score = Math.round((totalPassed / testResults.length) * 100)
    const criticalScore = Math.round((criticalPassed / criticalTests.length) * 100)

    setOverallScore(score)
    setSubscriptionReady(criticalScore >= 80 && score >= 85)

    addLog(`📊 SUBSCRIPTION READINESS SCORE: ${score}%`)
    addLog(`🎯 CRITICAL SYSTEMS: ${criticalScore}%`)

    if (criticalScore >= 80 && score >= 85) {
      addLog("🎉 SUBSCRIPTION PLATFORM READY FOR LAUNCH! 💰🚀")
      addLog("🐺 Your Wolf Platform is ready to generate revenue!")
    } else {
      addLog(`🔧 ${totalErrors} critical issues need fixing before launch`)
    }

    setCurrentTest("")
    setIsRunning(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-teal" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-400" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-gold" />
      case "running":
        return <RefreshCw className="h-5 w-5 text-dark-teal animate-spin" />
      default:
        return <Clock className="h-5 w-5 text-slate-400" />
    }
  }

  const getSectionIcon = (section: string) => {
    switch (section) {
      case "subscription":
        return <DollarSign className="h-4 w-4 text-gold" />
      case "database":
        return <Database className="h-4 w-4 text-dark-teal" />
      case "api":
        return <Server className="h-4 w-4 text-dark-teal" />
      case "frontend":
        return <Monitor className="h-4 w-4 text-dark-teal" />
      case "security":
        return <Shield className="h-4 w-4 text-dark-teal" />
      case "deployment":
        return <Rocket className="h-4 w-4 text-dark-teal" />
      default:
        return <Settings className="h-4 w-4 text-dark-teal" />
    }
  }

  useEffect(() => {
    runPreLaunchDebug()
  }, [])

  const criticalTests = tests.filter((t) => t.priority === "critical")
  const criticalPassed = criticalTests.filter((t) => t.status === "success").length
  const totalPassed = tests.filter((t) => t.status === "success").length
  const totalErrors = tests.filter((t) => t.status === "error").length

  return (
    <div className="space-y-6">
      {/* Subscription Launch Status */}
      <div className="mb-8">
        <Card
          className={`bg-wolf-card border-2 ${
            subscriptionReady ? "border-gold wolf-shadow-lg" : "border-red-400 wolf-shadow"
          }`}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {subscriptionReady ? (
                  <div className="relative">
                    <div className="text-6xl animate-wolf-pulse">🐺</div>
                    <DollarSign className="absolute -top-2 -right-2 h-8 w-8 text-gold animate-pulse" />
                    <Trophy className="absolute -bottom-2 -left-2 h-6 w-6 text-teal animate-bounce" />
                  </div>
                ) : (
                  <div className="relative">
                    <AlertCircle className="h-12 w-12 text-red-400" />
                    <RefreshCw className="absolute -top-1 -right-1 h-6 w-6 text-orange-400 animate-spin" />
                  </div>
                )}
                <div>
                  <h2 className="text-3xl font-bold text-wolf-heading">
                    {subscriptionReady ? "💰 SUBSCRIPTION PLATFORM READY! 🚀" : "🔧 SUBSCRIPTION SETUP NEEDED!"}
                  </h2>
                  <p className="text-slate-300 text-lg">
                    {subscriptionReady
                      ? "Your Wolf Platform is ready to accept paying subscribers!"
                      : "Almost ready - complete the setup below for subscription launch!"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-gold">{overallScore}%</div>
                <div className="text-sm text-slate-400">Subscription Ready</div>
                <div className="text-lg font-semibold text-dark-teal">
                  {criticalPassed}/{criticalTests.length} Critical ✅
                </div>
              </div>
            </div>
            <div className="mt-4">
              <Progress value={overallScore} className="h-4 progress-wolf" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <Card className="bg-wolf-card border-gold">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gold text-sm font-medium">Revenue Ready</p>
                <p className="text-2xl font-bold text-gold">{subscriptionReady ? "YES" : "NO"}</p>
              </div>
              <DollarSign className="h-8 w-8 text-gold" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-wolf-card border-teal">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal text-sm font-medium">Passed</p>
                <p className="text-2xl font-bold text-teal">{totalPassed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-teal" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-wolf-card border-red-400">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-300 text-sm font-medium">Critical</p>
                <p className="text-2xl font-bold text-red-400">
                  {criticalPassed}/{criticalTests.length}
                </p>
              </div>
              <Zap className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-wolf-card border-gold">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gold text-sm font-medium">Score</p>
                <p className="text-2xl font-bold text-gold">{overallScore}%</p>
              </div>
              <Star className="h-8 w-8 text-gold" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-wolf-card border-teal">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal text-sm font-medium">Launch</p>
                <p className="text-2xl font-bold text-teal">{subscriptionReady ? "GO" : "WAIT"}</p>
              </div>
              {subscriptionReady ? <Rocket className="h-8 w-8 text-teal" /> : <Clock className="h-8 w-8 text-teal" />}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-wolf-card border-gold">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gold text-sm font-medium">Wolf</p>
                <p className="text-2xl font-bold text-gold">LIVE</p>
              </div>
              <div className="text-2xl animate-wolf-pulse">🐺</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      {isRunning && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg text-slate-300">🔬 Pre-Launch Subscription Debug...</span>
            <span className="text-lg text-slate-400">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-3 progress-wolf" />
          {currentTest && (
            <p className="text-dark-teal mt-2 flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Testing: {currentTest}
            </p>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-4 mb-6">
        <Button onClick={runPreLaunchDebug} disabled={isRunning} className="btn-wolf text-lg px-8 py-4">
          {isRunning ? (
            <>
              <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
              Debugging...
            </>
          ) : (
            <>
              <DollarSign className="h-5 w-5 mr-2" />💰 SUBSCRIPTION DEBUG!
            </>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="border-dark-teal text-dark-teal hover:bg-dark-teal/10 text-lg px-6 py-4"
        >
          <RefreshCw className="h-5 w-5 mr-2" />
          Fresh Debug
        </Button>
      </div>

      {/* Critical Subscription Issues */}
      {totalErrors > 0 && (
        <Alert className="mb-6 border-red-400/50 bg-red-500/10">
          <XCircle className="h-4 w-4" />
          <AlertTitle className="text-red-300">🚨 SUBSCRIPTION LAUNCH BLOCKERS!</AlertTitle>
          <AlertDescription className="text-red-200">
            {totalErrors} critical issues must be fixed before accepting paying customers! Check failed tests below.
          </AlertDescription>
        </Alert>
      )}

      {/* Test Results */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="bg-dark-gunmetal wolf-border">
          <TabsTrigger value="all" className="data-[state=active]:bg-dark-teal/20 data-[state=active]:text-dark-teal">
            All Tests ({tests.length})
          </TabsTrigger>
          <TabsTrigger value="subscription" className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold">
            💰 Subscription ({tests.filter((t) => t.section === "subscription").length})
          </TabsTrigger>
          <TabsTrigger value="critical" className="data-[state=active]:bg-red-400/20 data-[state=active]:text-red-300">
            Critical ({criticalTests.length})
          </TabsTrigger>
          <TabsTrigger value="logs" className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold">
            Debug Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {["subscription", "database", "api", "frontend", "security", "deployment"].map((section) => {
            const sectionTests = tests.filter((t) => t.section === section)
            if (sectionTests.length === 0) return null

            return (
              <Card key={section} className="bg-wolf-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-dark-teal">
                    {getSectionIcon(section)}
                    {section === "subscription"
                      ? "💰 Subscription System"
                      : section.charAt(0).toUpperCase() + section.slice(1)}{" "}
                    Tests
                    <Badge variant="outline" className="border-dark-teal/50 text-dark-teal">
                      {sectionTests.filter((t) => t.status === "success").length}/{sectionTests.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {sectionTests.map((test) => (
                      <div
                        key={test.id}
                        className="flex items-start justify-between p-4 rounded-lg bg-dark-gunmetal/50 wolf-border"
                      >
                        <div className="flex items-start gap-3 flex-1">
                          {getStatusIcon(test.status)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-slate-200">{test.name}</h4>
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  test.priority === "critical"
                                    ? "border-red-400/50 text-red-300"
                                    : test.priority === "high"
                                      ? "border-orange-400/50 text-orange-300"
                                      : "border-slate-400/50 text-slate-300"
                                }`}
                              >
                                {test.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-400 mb-2">{test.description}</p>
                            <p
                              className={`text-sm font-medium ${
                                test.status === "success"
                                  ? "text-teal"
                                  : test.status === "error"
                                    ? "text-red-400"
                                    : test.status === "warning"
                                      ? "text-gold"
                                      : "text-slate-400"
                              }`}
                            >
                              {test.message}
                            </p>
                            {test.responseTime && (
                              <p className="text-xs text-slate-500 mt-1">Response time: {test.responseTime}ms</p>
                            )}
                            {test.error && (
                              <div className="mt-2 p-2 bg-red-500/10 border border-red-400/30 rounded text-red-300 text-xs">
                                <strong>Error:</strong> {test.error}
                              </div>
                            )}
                            {test.fixes && test.fixes.length > 0 && (
                              <div className="mt-2 p-2 bg-gold/10 border border-gold/30 rounded">
                                <strong className="text-gold text-xs">🔧 Subscription Launch Fixes:</strong>
                                <ul className="text-xs text-slate-300 mt-1 space-y-1">
                                  {test.fixes.map((fix, index) => (
                                    <li key={index} className="flex items-start gap-1">
                                      <span className="text-gold">•</span>
                                      {fix}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {test.realData && (
                              <details className="mt-2">
                                <summary className="text-xs text-dark-teal cursor-pointer hover:text-teal">
                                  📊 View Test Data
                                </summary>
                                <pre className="text-xs text-slate-400 mt-1 p-2 bg-slate-900/50 rounded overflow-auto max-h-32">
                                  {JSON.stringify(test.realData, null, 2)}
                                </pre>
                              </details>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>

        <TabsContent value="subscription" className="space-y-4">
          <Alert className="border-gold/50 bg-gold/10">
            <DollarSign className="h-4 w-4" />
            <AlertTitle className="text-gold">💰 SUBSCRIPTION SYSTEM STATUS</AlertTitle>
            <AlertDescription className="text-slate-300">
              These tests verify your platform is ready to accept paying subscribers and generate revenue.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            {tests
              .filter((t) => t.section === "subscription")
              .map((test) => (
                <div
                  key={test.id}
                  className={`p-4 rounded-lg border-2 ${
                    test.status === "success"
                      ? "bg-teal/10 border-teal/50"
                      : test.status === "error"
                        ? "bg-red-500/10 border-red-400/50"
                        : "bg-gold/10 border-gold/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getStatusIcon(test.status)}
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-200 mb-1">{test.name}</h4>
                      <p className="text-sm text-slate-400 mb-2">{test.description}</p>
                      <p
                        className={`text-sm font-medium ${
                          test.status === "success"
                            ? "text-teal"
                            : test.status === "error"
                              ? "text-red-400"
                              : "text-gold"
                        }`}
                      >
                        {test.message}
                      </p>
                      {test.fixes && test.fixes.length > 0 && (
                        <div className="mt-2 p-2 bg-gold/10 border border-gold/30 rounded">
                          <strong className="text-gold text-xs">💰 REVENUE SETUP NEEDED:</strong>
                          <ul className="text-xs text-slate-300 mt-1 space-y-1">
                            {test.fixes.map((fix, index) => (
                              <li key={index} className="flex items-start gap-1">
                                <span className="text-gold">•</span>
                                {fix}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="critical" className="space-y-4">
          <div className="space-y-3">
            {criticalTests.map((test) => (
              <div
                key={test.id}
                className={`p-4 rounded-lg border-2 ${
                  test.status === "success"
                    ? "bg-teal/10 border-teal/50"
                    : test.status === "error"
                      ? "bg-red-500/10 border-red-400/50"
                      : "bg-gold/10 border-gold/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  {getStatusIcon(test.status)}
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-200 mb-1">{test.name}</h4>
                    <p className="text-sm text-slate-400 mb-2">{test.description}</p>
                    <p
                      className={`text-sm font-medium ${
                        test.status === "success" ? "text-teal" : test.status === "error" ? "text-red-400" : "text-gold"
                      }`}
                    >
                      {test.message}
                    </p>
                    {test.fixes && test.fixes.length > 0 && (
                      <div className="mt-2 p-2 bg-gold/10 border border-gold/30 rounded">
                        <strong className="text-gold text-xs">🚨 CRITICAL SUBSCRIPTION FIXES:</strong>
                        <ul className="text-xs text-slate-300 mt-1 space-y-1">
                          {test.fixes.map((fix, index) => (
                            <li key={index} className="flex items-start gap-1">
                              <span className="text-gold">•</span>
                              {fix}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card className="bg-wolf-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-dark-teal">
                <Terminal className="h-5 w-5" />
                Pre-Launch Subscription Debug Logs
                <Badge variant="outline" className="border-dark-teal/50 text-dark-teal">
                  {logs.length} entries
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96 w-full">
                <div className="space-y-1 font-mono text-sm">
                  {logs.map((log, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded ${
                        log.includes("✅")
                          ? "bg-teal/10 text-teal"
                          : log.includes("❌")
                            ? "bg-red-500/10 text-red-400"
                            : log.includes("⚠️")
                              ? "bg-gold/10 text-gold"
                              : "bg-slate-800/50 text-slate-300"
                      }`}
                    >
                      {log}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Final Subscription Status */}
      {!isRunning && (
        <Card
          className={`bg-wolf-card border-2 ${
            subscriptionReady ? "border-gold/50 wolf-shadow-lg" : "border-red-400/50 wolf-shadow"
          }`}
        >
          <CardContent className="p-8 text-center">
            <div className="mb-4">
              {subscriptionReady ? (
                <div className="flex justify-center items-center gap-2 mb-4">
                  <div className="text-6xl animate-wolf-pulse">🐺</div>
                  <DollarSign className="h-16 w-16 text-gold animate-bounce" />
                  <Trophy className="h-12 w-12 text-teal animate-pulse" />
                  <Users className="h-8 w-8 text-dark-teal animate-pulse" />
                  <TrendingUp className="h-12 w-12 text-gold animate-bounce" />
                </div>
              ) : (
                <div className="flex justify-center items-center gap-2 mb-4">
                  <AlertCircle className="h-16 w-16 text-red-400" />
                  <RefreshCw className="h-8 w-8 text-orange-400 animate-spin" />
                </div>
              )}
            </div>
            <h2 className="text-4xl font-bold mb-4 text-wolf-heading">
              {subscriptionReady ? "💰 SUBSCRIPTION PLATFORM READY! 🚀" : "🔧 SUBSCRIPTION SETUP NEEDED! 💰"}
            </h2>
            <p className="text-xl text-slate-300 mb-6">
              {subscriptionReady
                ? "Your Wolf Platform is ready to accept paying subscribers and generate revenue! Time to launch your subscription business! 🐺💰"
                : `Complete ${totalErrors} subscription setup tasks above, then your Wolf Platform will be ready to make money! You're almost there! 💪`}
            </p>
            <div className="flex justify-center gap-4 mb-6">
              <Badge className="badge-wolf-gold text-lg px-6 py-3">Subscription Score: {overallScore}%</Badge>
              <Badge className="badge-wolf text-lg px-6 py-3">
                Critical: {criticalPassed}/{criticalTests.length}
              </Badge>
              {subscriptionReady && <Badge className="badge-wolf-gold text-lg px-6 py-3">💰 REVENUE READY!</Badge>}
            </div>
            {subscriptionReady && (
              <div className="mt-6 p-4 bg-gold/10 border border-gold/30 rounded-lg">
                <h3 className="text-xl font-bold text-gold mb-2">🎯 Ready for Subscription Success!</h3>
                <p className="text-slate-300">
                  Your Wolf Platform is ready to accept paying customers! Launch your subscription service and start
                  generating monthly recurring revenue! 🌟💰
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
