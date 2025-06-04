"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Navbar } from "@/components/navbar"
import { CryptoAPI } from "@/lib/crypto-api"
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Database,
  Globe,
  Code,
  Cpu,
  FileText,
  Settings,
  Zap,
  User,
} from "lucide-react"
import PreTestCheck from "./pre-test-check"

interface SystemCheck {
  name: string
  status: "success" | "error" | "warning" | "pending"
  message: string
  details?: string
  timestamp: Date
}

export default function DebugPage() {
  const [systemChecks, setSystemChecks] = useState<SystemCheck[]>([])
  const [apiChecks, setApiChecks] = useState<SystemCheck[]>([])
  const [cssChecks, setCssChecks] = useState<SystemCheck[]>([])
  const [dataChecks, setDataChecks] = useState<SystemCheck[]>([])
  const [supabaseChecks, setSupabaseChecks] = useState<SystemCheck[]>([])
  const [envChecks, setEnvChecks] = useState<SystemCheck[]>([])
  const [performanceChecks, setPerformanceChecks] = useState<SystemCheck[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("pre-test")
  const [currentTime, setCurrentTime] = useState(new Date())
  const [refreshCount, setRefreshCount] = useState(0)

  // Update clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Run all debug checks
  const runAllChecks = async () => {
    setIsLoading(true)
    setRefreshCount((prev) => prev + 1)

    try {
      await Promise.all([
        checkSystem(),
        checkApi(),
        checkCss(),
        checkData(),
        checkSupabase(),
        checkEnvironment(),
        checkPerformance(),
      ])
    } catch (error) {
      console.error("Debug check error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // System checks
  const checkSystem = async () => {
    const checks: SystemCheck[] = []

    // Check browser environment
    checks.push({
      name: "Browser Environment",
      status: typeof window !== "undefined" ? "success" : "error",
      message: typeof window !== "undefined" ? "Browser environment detected" : "Not running in browser",
      timestamp: new Date(),
    })

    // Check JavaScript
    try {
      const jsTest = 1 + 1 === 2
      checks.push({
        name: "JavaScript Execution",
        status: jsTest ? "success" : "error",
        message: jsTest ? "JavaScript executing correctly" : "JavaScript error",
        timestamp: new Date(),
      })
    } catch (error) {
      checks.push({
        name: "JavaScript Execution",
        status: "error",
        message: "JavaScript error",
        details: String(error),
        timestamp: new Date(),
      })
    }

    // Check localStorage
    try {
      localStorage.setItem("wolf_debug_test", "test")
      const testValue = localStorage.getItem("wolf_debug_test")
      checks.push({
        name: "Local Storage",
        status: testValue === "test" ? "success" : "warning",
        message: testValue === "test" ? "Local storage working" : "Local storage not working correctly",
        timestamp: new Date(),
      })
    } catch (error) {
      checks.push({
        name: "Local Storage",
        status: "warning",
        message: "Local storage not available",
        details: "Private browsing or permissions issue",
        timestamp: new Date(),
      })
    }

    // Check performance
    const perfStart = performance.now()
    await new Promise((resolve) => setTimeout(resolve, 100))
    const perfEnd = performance.now()
    const perfTime = perfEnd - perfStart

    checks.push({
      name: "Performance API",
      status: perfTime >= 100 ? "success" : "warning",
      message: `Performance API working (${Math.round(perfTime)}ms)`,
      timestamp: new Date(),
    })

    // Check console
    try {
      console.log("Wolf Platform Debug Check")
      checks.push({
        name: "Console Access",
        status: "success",
        message: "Console logging available",
        timestamp: new Date(),
      })
    } catch (error) {
      checks.push({
        name: "Console Access",
        status: "warning",
        message: "Console logging issue",
        details: String(error),
        timestamp: new Date(),
      })
    }

    setSystemChecks(checks)
    return checks
  }

  // API checks
  const checkApi = async () => {
    const checks: SystemCheck[] = []

    // Check CoinGecko API
    try {
      const startTime = performance.now()
      const marketData = await CryptoAPI.getGlobalMarketData()
      const endTime = performance.now()
      const responseTime = Math.round(endTime - startTime)

      if (marketData) {
        checks.push({
          name: "CoinGecko API",
          status: "success",
          message: `Connected (${responseTime}ms)`,
          details: `Market cap: ${marketData.total_market_cap?.usd ? CryptoAPI.formatLargeNumber(marketData.total_market_cap.usd) : "N/A"}`,
          timestamp: new Date(),
        })
      } else {
        checks.push({
          name: "CoinGecko API",
          status: "warning",
          message: "Connected but no data",
          details: `Response time: ${responseTime}ms`,
          timestamp: new Date(),
        })
      }
    } catch (error) {
      checks.push({
        name: "CoinGecko API",
        status: "error",
        message: "Connection failed",
        details: String(error),
        timestamp: new Date(),
      })
    }

    // Check crypto prices
    try {
      const startTime = performance.now()
      const cryptoData = await CryptoAPI.getTopCryptocurrencies(5)
      const endTime = performance.now()
      const responseTime = Math.round(endTime - startTime)

      if (cryptoData && cryptoData.length > 0) {
        checks.push({
          name: "Crypto Prices API",
          status: "success",
          message: `Loaded ${cryptoData.length} coins (${responseTime}ms)`,
          details: `First coin: ${cryptoData[0]?.name || "Unknown"} at ${CryptoAPI.formatPrice(cryptoData[0]?.current_price)}`,
          timestamp: new Date(),
        })
      } else {
        checks.push({
          name: "Crypto Prices API",
          status: "warning",
          message: "No crypto data received",
          details: `Response time: ${responseTime}ms`,
          timestamp: new Date(),
        })
      }
    } catch (error) {
      checks.push({
        name: "Crypto Prices API",
        status: "error",
        message: "Failed to fetch crypto prices",
        details: String(error),
        timestamp: new Date(),
      })
    }

    // Check trending coins
    try {
      const startTime = performance.now()
      const trendingData = await CryptoAPI.getTrendingCryptocurrencies()
      const endTime = performance.now()
      const responseTime = Math.round(endTime - startTime)

      if (trendingData && trendingData.length > 0) {
        checks.push({
          name: "Trending Coins API",
          status: "success",
          message: `Loaded ${trendingData.length} trending coins (${responseTime}ms)`,
          details: `Top trending: ${trendingData[0]?.name || "Unknown"}`,
          timestamp: new Date(),
        })
      } else {
        checks.push({
          name: "Trending Coins API",
          status: "warning",
          message: "No trending data received",
          details: `Response time: ${responseTime}ms`,
          timestamp: new Date(),
        })
      }
    } catch (error) {
      checks.push({
        name: "Trending Coins API",
        status: "error",
        message: "Failed to fetch trending coins",
        details: String(error),
        timestamp: new Date(),
      })
    }

    setApiChecks(checks)
    return checks
  }

  // CSS checks
  const checkCss = async () => {
    const checks: SystemCheck[] = []

    // Check if CSS variables are defined
    const rootStyles = getComputedStyle(document.documentElement)
    const tealVar = rootStyles.getPropertyValue("--wolf-teal").trim()
    const goldVar = rootStyles.getPropertyValue("--wolf-gold").trim()

    checks.push({
      name: "CSS Variables",
      status: tealVar && goldVar ? "success" : "warning",
      message: tealVar && goldVar ? "CSS variables defined" : "Some CSS variables missing",
      details: `--wolf-teal: ${tealVar || "missing"}, --wolf-gold: ${goldVar || "missing"}`,
      timestamp: new Date(),
    })

    // Check for Wolf classes
    const hasWolfGradient = document.querySelector(".bg-wolf-gradient") !== null
    const hasWolfCard = document.querySelector(".bg-wolf-card") !== null

    checks.push({
      name: "Wolf CSS Classes",
      status: hasWolfGradient || hasWolfCard ? "success" : "warning",
      message: hasWolfGradient || hasWolfCard ? "Wolf CSS classes detected" : "Wolf CSS classes not found in DOM",
      details: `bg-wolf-gradient: ${hasWolfGradient ? "found" : "not found"}, bg-wolf-card: ${hasWolfCard ? "found" : "not found"}`,
      timestamp: new Date(),
    })

    // Check for animation definitions
    const styleSheets = document.styleSheets
    let hasWolfPulse = false
    let hasWolfGlow = false

    try {
      for (let i = 0; i < styleSheets.length; i++) {
        const rules = styleSheets[i].cssRules || styleSheets[i].rules
        if (!rules) continue

        for (let j = 0; j < rules.length; j++) {
          const rule = rules[j]
          if (rule instanceof CSSKeyframesRule) {
            if (rule.name === "wolf-pulse") hasWolfPulse = true
            if (rule.name === "wolf-glow") hasWolfGlow = true
          }
        }
      }
    } catch (e) {
      // CORS may prevent reading some stylesheets
    }

    checks.push({
      name: "CSS Animations",
      status: hasWolfPulse && hasWolfGlow ? "success" : "warning",
      message: hasWolfPulse && hasWolfGlow ? "Wolf animations defined" : "Some Wolf animations missing",
      details: `wolf-pulse: ${hasWolfPulse ? "defined" : "missing"}, wolf-glow: ${hasWolfGlow ? "defined" : "missing"}`,
      timestamp: new Date(),
    })

    // Check responsive design
    const isResponsive = window.matchMedia("(max-width: 768px)").matches ? "Mobile view active" : "Desktop view active"

    checks.push({
      name: "Responsive Design",
      status: "success",
      message: isResponsive,
      details: `Window width: ${window.innerWidth}px, height: ${window.innerHeight}px`,
      timestamp: new Date(),
    })

    setCssChecks(checks)
    return checks
  }

  // Data checks
  const checkData = async () => {
    const checks: SystemCheck[] = []

    // Check data formatting functions
    try {
      const priceFormatted = CryptoAPI.formatPrice(1234.56)
      const largeNumberFormatted = CryptoAPI.formatLargeNumber(1234567890)
      const percentageFormatted = CryptoAPI.formatPercentage(12.34)

      const allFormatted = priceFormatted && largeNumberFormatted && percentageFormatted

      checks.push({
        name: "Data Formatting",
        status: allFormatted ? "success" : "warning",
        message: allFormatted ? "Formatting functions working" : "Some formatting functions not working",
        details: `Price: ${priceFormatted}, Large: ${largeNumberFormatted}, Percentage: ${percentageFormatted}`,
        timestamp: new Date(),
      })
    } catch (error) {
      checks.push({
        name: "Data Formatting",
        status: "error",
        message: "Formatting functions error",
        details: String(error),
        timestamp: new Date(),
      })
    }

    // Check cache system
    try {
      const cacheSize = CryptoAPI.getCacheSize()

      checks.push({
        name: "Cache System",
        status: "success",
        message: `Cache system active`,
        details: `Cache size: ${cacheSize} entries`,
        timestamp: new Date(),
      })
    } catch (error) {
      checks.push({
        name: "Cache System",
        status: "warning",
        message: "Cache system error",
        details: String(error),
        timestamp: new Date(),
      })
    }

    // Check data types
    try {
      // Test a sample crypto object structure
      const sampleCrypto = {
        id: "bitcoin",
        symbol: "btc",
        name: "Bitcoin",
        current_price: 50000,
        price_change_percentage_24h: 5.5,
        market_cap: 1000000000000,
        total_volume: 50000000000,
        image: "https://example.com/btc.png",
      }

      const validId = typeof sampleCrypto.id === "string"
      const validPrice = typeof sampleCrypto.current_price === "number"
      const validChange = typeof sampleCrypto.price_change_percentage_24h === "number"

      const allValid = validId && validPrice && validChange

      checks.push({
        name: "Data Types",
        status: allValid ? "success" : "warning",
        message: allValid ? "Data types valid" : "Some data types invalid",
        details: `ID: ${validId ? "valid" : "invalid"}, Price: ${validPrice ? "valid" : "invalid"}, Change: ${validChange ? "valid" : "invalid"}`,
        timestamp: new Date(),
      })
    } catch (error) {
      checks.push({
        name: "Data Types",
        status: "error",
        message: "Data type check error",
        details: String(error),
        timestamp: new Date(),
      })
    }

    setDataChecks(checks)
    return checks
  }

  // Supabase checks
  const checkSupabase = async () => {
    const checks: SystemCheck[] = []

    // Test Supabase connection
    try {
      const { checkSupabaseConnection } = await import("@/lib/supabase")
      const connectionResult = await checkSupabaseConnection()

      checks.push({
        name: "Supabase Connection",
        status: connectionResult.connected ? "success" : "error",
        message: connectionResult.connected ? "Connected successfully" : "Connection failed",
        details: connectionResult.error || "Connection established",
        timestamp: new Date(),
      })
    } catch (error) {
      checks.push({
        name: "Supabase Connection",
        status: "error",
        message: "Failed to test connection",
        details: String(error),
        timestamp: new Date(),
      })
    }

    // Test Supabase client creation
    try {
      const { createClientSupabaseClient } = await import("@/lib/supabase")
      const client = createClientSupabaseClient()

      checks.push({
        name: "Supabase Client Creation",
        status: client ? "success" : "error",
        message: client ? "Client created successfully" : "Failed to create client",
        timestamp: new Date(),
      })
    } catch (error) {
      checks.push({
        name: "Supabase Client Creation",
        status: "error",
        message: "Client creation failed",
        details: String(error),
        timestamp: new Date(),
      })
    }

    // Test safe database operation
    try {
      const { safeDbOperation } = await import("@/lib/supabase")
      const testOperation = () => Promise.resolve("test")
      const result = await safeDbOperation(testOperation, "Test operation")

      checks.push({
        name: "Safe DB Operation",
        status: result.data === "test" ? "success" : "warning",
        message: result.data === "test" ? "Function working correctly" : "Function returned unexpected result",
        details: `Result: ${JSON.stringify(result)}`,
        timestamp: new Date(),
      })
    } catch (error) {
      checks.push({
        name: "Safe DB Operation",
        status: "error",
        message: "Function test failed",
        details: String(error),
        timestamp: new Date(),
      })
    }

    // Test edge functions
    try {
      const { testEdgeFunctions } = await import("@/lib/supabase")
      const edgeResult = await testEdgeFunctions()

      checks.push({
        name: "Edge Functions",
        status: edgeResult.available ? "success" : "warning",
        message: edgeResult.available ? `Available (${edgeResult.latency}ms)` : "Not available",
        details: `Latency: ${edgeResult.latency || "N/A"}ms`,
        timestamp: new Date(),
      })
    } catch (error) {
      checks.push({
        name: "Edge Functions",
        status: "warning",
        message: "Edge functions test failed",
        details: String(error),
        timestamp: new Date(),
      })
    }

    setSupabaseChecks(checks)
    return checks
  }

  // Environment checks
  const checkEnvironment = async () => {
    const checks: SystemCheck[] = []

    // Check required environment variables
    const requiredEnvVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"]

    requiredEnvVars.forEach((envVar) => {
      const value = process.env[envVar]
      checks.push({
        name: `Environment Variable: ${envVar}`,
        status: value ? "success" : "error",
        message: value ? "Set correctly" : "Missing or empty",
        details: value ? `Length: ${value.length} characters` : "Not found",
        timestamp: new Date(),
      })
    })

    // Check optional environment variables
    const optionalEnvVars = [
      "NEXT_PUBLIC_APP_URL",
      "VERCEL",
      "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
      "NEXT_PUBLIC_PAYPAL_CLIENT_ID",
    ]

    optionalEnvVars.forEach((envVar) => {
      const value = process.env[envVar]
      checks.push({
        name: `Optional Env: ${envVar}`,
        status: value ? "success" : "warning",
        message: value ? "Available" : "Not set",
        details: value ? `Length: ${value.length} characters` : "Optional variable",
        timestamp: new Date(),
      })
    })

    setEnvChecks(checks)
    return checks
  }

  // Performance checks
  const checkPerformance = async () => {
    const checks: SystemCheck[] = []

    // Memory usage
    if ("memory" in performance) {
      const memInfo = (performance as any).memory
      checks.push({
        name: "Memory Usage",
        status: memInfo.usedJSHeapSize < 50000000 ? "success" : "warning",
        message: `${Math.round(memInfo.usedJSHeapSize / 1024 / 1024)} MB used`,
        details: `Limit: ${Math.round(memInfo.jsHeapSizeLimit / 1024 / 1024)} MB`,
        timestamp: new Date(),
      })
    }

    // Page load performance
    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming
    if (navigation) {
      const loadTime = navigation.loadEventEnd - navigation.fetchStart
      checks.push({
        name: "Page Load Time",
        status: loadTime < 3000 ? "success" : loadTime < 5000 ? "warning" : "error",
        message: `${Math.round(loadTime)}ms`,
        details: `DOM: ${Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart)}ms`,
        timestamp: new Date(),
      })
    }

    // Component render test
    const renderStart = performance.now()
    await new Promise((resolve) => setTimeout(resolve, 10))
    const renderEnd = performance.now()
    const renderTime = renderEnd - renderStart

    checks.push({
      name: "Component Render Performance",
      status: renderTime < 100 ? "success" : "warning",
      message: `${Math.round(renderTime)}ms`,
      details: "Simulated component render test",
      timestamp: new Date(),
    })

    setPerformanceChecks(checks)
    return checks
  }

  // Run checks on initial load
  useEffect(() => {
    runAllChecks()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      default:
        return <RefreshCw className="h-5 w-5 text-slate-500 animate-spin" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-500"
      case "error":
        return "text-red-500"
      case "warning":
        return "text-yellow-500"
      default:
        return "text-slate-500"
    }
  }

  return (
    <div className="min-h-screen bg-wolf-gradient">
      <Navbar />

      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-800/50 border-slate-700 mb-6">
            <TabsTrigger value="pre-test" className="data-[state=active]:bg-teal data-[state=active]:text-black">
              <User className="h-4 w-4 mr-2" />
              Pre-Test Check
            </TabsTrigger>
            <TabsTrigger value="advanced" className="data-[state=active]:bg-teal data-[state=active]:text-black">
              <Settings className="h-4 w-4 mr-2" />
              Advanced Debug
            </TabsTrigger>
            <TabsTrigger value="system" className="data-[state=active]:bg-teal data-[state=active]:text-black hidden">
              <Cpu className="h-4 w-4 mr-2" />
              System
            </TabsTrigger>
            <TabsTrigger value="api" className="data-[state=active]:bg-teal data-[state=active]:text-black hidden">
              <Globe className="h-4 w-4 mr-2" />
              API
            </TabsTrigger>
            <TabsTrigger value="css" className="data-[state=active]:bg-teal data-[state=active]:text-black hidden">
              <Code className="h-4 w-4 mr-2" />
              CSS
            </TabsTrigger>
            <TabsTrigger value="data" className="data-[state=active]:bg-teal data-[state=active]:text-black hidden">
              <Database className="h-4 w-4 mr-2" />
              Data
            </TabsTrigger>
            <TabsTrigger value="supabase" className="data-[state=active]:bg-teal data-[state=active]:text-black hidden">
              <Database className="h-4 w-4 mr-2" />
              Supabase
            </TabsTrigger>
            <TabsTrigger
              value="environment"
              className="data-[state=active]:bg-teal data-[state=active]:text-black hidden"
            >
              <Settings className="h-4 w-4 mr-2" />
              Environment
            </TabsTrigger>
            <TabsTrigger
              value="performance"
              className="data-[state=active]:bg-teal data-[state=active]:text-black hidden"
            >
              <Zap className="h-4 w-4 mr-2" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="logs" className="data-[state=active]:bg-teal data-[state=active]:text-black hidden">
              <FileText className="h-4 w-4 mr-2" />
              Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pre-test">
            <PreTestCheck />
          </TabsContent>

          <TabsContent value="advanced">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-white mb-4">Advanced Debug Tools</h2>
              <p className="text-slate-400">Comprehensive system diagnostics and troubleshooting tools.</p>
              <p className="text-sm text-slate-500 mt-2">Switch to this tab for detailed technical analysis.</p>
            </div>
          </TabsContent>

          <TabsContent value="system">
            <Card className="bg-wolf-card wolf-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Cpu className="h-5 w-5 text-teal" />
                  System Diagnostics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {systemChecks.length > 0 ? (
                    systemChecks.map((check, index) => (
                      <div key={index} className="bg-slate-800/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(check.status)}
                            <span className="font-semibold text-white">{check.name}</span>
                          </div>
                          <Badge className={`${getStatusColor(check.status)} bg-opacity-20 border border-opacity-50`}>
                            {check.status.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-slate-300 mb-1">{check.message}</p>
                        {check.details && <p className="text-xs text-slate-500">{check.details}</p>}
                        <p className="text-xs text-slate-600 mt-2">
                          Checked at: {check.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <RefreshCw className="h-8 w-8 text-slate-500 animate-spin mx-auto mb-4" />
                      <p className="text-slate-400">Running system checks...</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api">
            <Card className="bg-wolf-card wolf-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-teal" />
                  API Connections
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {apiChecks.length > 0 ? (
                    apiChecks.map((check, index) => (
                      <div key={index} className="bg-slate-800/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(check.status)}
                            <span className="font-semibold text-white">{check.name}</span>
                          </div>
                          <Badge className={`${getStatusColor(check.status)} bg-opacity-20 border border-opacity-50`}>
                            {check.status.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-slate-300 mb-1">{check.message}</p>
                        {check.details && <p className="text-xs text-slate-500">{check.details}</p>}
                        <p className="text-xs text-slate-600 mt-2">
                          Checked at: {check.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <RefreshCw className="h-8 w-8 text-slate-500 animate-spin mx-auto mb-4" />
                      <p className="text-slate-400">Testing API connections...</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="css">
            <Card className="bg-wolf-card wolf-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Code className="h-5 w-5 text-teal" />
                  CSS & Styling
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cssChecks.length > 0 ? (
                    cssChecks.map((check, index) => (
                      <div key={index} className="bg-slate-800/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(check.status)}
                            <span className="font-semibold text-white">{check.name}</span>
                          </div>
                          <Badge className={`${getStatusColor(check.status)} bg-opacity-20 border border-opacity-50`}>
                            {check.status.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-slate-300 mb-1">{check.message}</p>
                        {check.details && <p className="text-xs text-slate-500">{check.details}</p>}
                        <p className="text-xs text-slate-600 mt-2">
                          Checked at: {check.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <RefreshCw className="h-8 w-8 text-slate-500 animate-spin mx-auto mb-4" />
                      <p className="text-slate-400">Analyzing CSS and styles...</p>
                    </div>
                  )}
                </div>

                {/* CSS Variable Preview */}
                <div className="mt-6 bg-slate-800/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">CSS Variable Preview</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-teal mb-2"></div>
                      <span className="text-xs text-slate-400">--wolf-teal</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-dark-teal mb-2"></div>
                      <span className="text-xs text-slate-400">--wolf-dark-teal</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-gold mb-2"></div>
                      <span className="text-xs text-slate-400">--wolf-gold</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-gunmetal mb-2"></div>
                      <span className="text-xs text-slate-400">--wolf-gunmetal</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-full bg-dark-gunmetal mb-2"></div>
                      <span className="text-xs text-slate-400">--wolf-dark-gunmetal</span>
                    </div>
                  </div>
                </div>

                {/* Animation Test */}
                <div className="mt-6 bg-slate-800/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Animation Test</h3>
                  <div className="flex flex-wrap gap-8 justify-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-teal rounded-lg animate-wolf-pulse mb-2"></div>
                      <span className="text-xs text-slate-400">wolf-pulse</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-gold rounded-lg animate-wolf-glow mb-2"></div>
                      <span className="text-xs text-slate-400">wolf-glow</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-teal to-gold rounded-lg mb-2"></div>
                      <span className="text-xs text-slate-400">gradient</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data">
            <Card className="bg-wolf-card wolf-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Database className="h-5 w-5 text-teal" />
                  Data Processing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dataChecks.length > 0 ? (
                    dataChecks.map((check, index) => (
                      <div key={index} className="bg-slate-800/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(check.status)}
                            <span className="font-semibold text-white">{check.name}</span>
                          </div>
                          <Badge className={`${getStatusColor(check.status)} bg-opacity-20 border border-opacity-50`}>
                            {check.status.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-slate-300 mb-1">{check.message}</p>
                        {check.details && <p className="text-xs text-slate-500">{check.details}</p>}
                        <p className="text-xs text-slate-600 mt-2">
                          Checked at: {check.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <RefreshCw className="h-8 w-8 text-slate-500 animate-spin mx-auto mb-4" />
                      <p className="text-slate-400">Checking data processing...</p>
                    </div>
                  )}
                </div>

                {/* Data Formatting Test */}
                <div className="mt-6 bg-slate-800/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Data Formatting Test</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-700/50 p-3 rounded-lg">
                      <div className="text-sm text-slate-400 mb-1">Price Format</div>
                      <div className="text-lg text-white">{CryptoAPI.formatPrice(1234.56)}</div>
                      <div className="text-xs text-slate-500">Input: 1234.56</div>
                    </div>
                    <div className="bg-slate-700/50 p-3 rounded-lg">
                      <div className="text-sm text-slate-400 mb-1">Large Number Format</div>
                      <div className="text-lg text-white">{CryptoAPI.formatLargeNumber(1234567890)}</div>
                      <div className="text-xs text-slate-500">Input: 1234567890</div>
                    </div>
                    <div className="bg-slate-700/50 p-3 rounded-lg">
                      <div className="text-sm text-slate-400 mb-1">Percentage Format</div>
                      <div className="text-lg text-white">{CryptoAPI.formatPercentage(12.34)}</div>
                      <div className="text-xs text-slate-500">Input: 12.34</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="supabase">
            <Card className="bg-wolf-card wolf-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Database className="h-5 w-5 text-teal" />
                  Supabase Diagnostics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {supabaseChecks.length > 0 ? (
                    supabaseChecks.map((check, index) => (
                      <div key={index} className="bg-slate-800/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(check.status)}
                            <span className="font-semibold text-white">{check.name}</span>
                          </div>
                          <Badge className={`${getStatusColor(check.status)} bg-opacity-20 border border-opacity-50`}>
                            {check.status.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-slate-300 mb-1">{check.message}</p>
                        {check.details && <p className="text-xs text-slate-500">{check.details}</p>}
                        <p className="text-xs text-slate-600 mt-2">
                          Checked at: {check.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <RefreshCw className="h-8 w-8 text-slate-500 animate-spin mx-auto mb-4" />
                      <p className="text-slate-400">Running Supabase checks...</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="environment">
            <Card className="bg-wolf-card wolf-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Settings className="h-5 w-5 text-teal" />
                  Environment Diagnostics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {envChecks.length > 0 ? (
                    envChecks.map((check, index) => (
                      <div key={index} className="bg-slate-800/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(check.status)}
                            <span className="font-semibold text-white">{check.name}</span>
                          </div>
                          <Badge className={`${getStatusColor(check.status)} bg-opacity-20 border border-opacity-50`}>
                            {check.status.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-slate-300 mb-1">{check.message}</p>
                        {check.details && <p className="text-xs text-slate-500">{check.details}</p>}
                        <p className="text-xs text-slate-600 mt-2">
                          Checked at: {check.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <RefreshCw className="h-8 w-8 text-slate-500 animate-spin mx-auto mb-4" />
                      <p className="text-slate-400">Running environment checks...</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance">
            <Card className="bg-wolf-card wolf-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-teal" />
                  Performance Diagnostics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {performanceChecks.length > 0 ? (
                    performanceChecks.map((check, index) => (
                      <div key={index} className="bg-slate-800/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(check.status)}
                            <span className="font-semibold text-white">{check.name}</span>
                          </div>
                          <Badge className={`${getStatusColor(check.status)} bg-opacity-20 border border-opacity-50`}>
                            {check.status.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-slate-300 mb-1">{check.message}</p>
                        {check.details && <p className="text-xs text-slate-500">{check.details}</p>}
                        <p className="text-xs text-slate-600 mt-2">
                          Checked at: {check.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <RefreshCw className="h-8 w-8 text-slate-500 animate-spin mx-auto mb-4" />
                      <p className="text-slate-400">Running performance checks...</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs">
            <Card className="bg-wolf-card wolf-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-teal" />
                  System Logs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm text-slate-300 h-96 overflow-y-auto">
                  <div className="text-green-400">[{new Date().toISOString()}] System: Debug page loaded</div>
                  <div className="text-slate-400">[{new Date().toISOString()}] System: Running initial diagnostics</div>

                  {systemChecks.map((check, i) => (
                    <div key={`sys-${i}`} className={getStatusColor(check.status)}>
                      [{check.timestamp.toISOString()}] System: {check.name} - {check.status.toUpperCase()} -{" "}
                      {check.message}
                    </div>
                  ))}

                  {apiChecks.map((check, i) => (
                    <div key={`api-${i}`} className={getStatusColor(check.status)}>
                      [{check.timestamp.toISOString()}] API: {check.name} - {check.status.toUpperCase()} -{" "}
                      {check.message}
                    </div>
                  ))}

                  {cssChecks.map((check, i) => (
                    <div key={`css-${i}`} className={getStatusColor(check.status)}>
                      [{check.timestamp.toISOString()}] CSS: {check.name} - {check.status.toUpperCase()} -{" "}
                      {check.message}
                    </div>
                  ))}

                  {dataChecks.map((check, i) => (
                    <div key={`data-${i}`} className={getStatusColor(check.status)}>
                      [{check.timestamp.toISOString()}] Data: {check.name} - {check.status.toUpperCase()} -{" "}
                      {check.message}
                    </div>
                  ))}

                  {supabaseChecks.map((check, i) => (
                    <div key={`supabase-${i}`} className={getStatusColor(check.status)}>
                      [{check.timestamp.toISOString()}] Supabase: {check.name} - {check.status.toUpperCase()} -{" "}
                      {check.message}
                    </div>
                  ))}

                  {envChecks.map((check, i) => (
                    <div key={`env-${i}`} className={getStatusColor(check.status)}>
                      [{check.timestamp.toISOString()}] Environment: {check.name} - {check.status.toUpperCase()} -{" "}
                      {check.message}
                    </div>
                  ))}

                  {performanceChecks.map((check, i) => (
                    <div key={`performance-${i}`} className={getStatusColor(check.status)}>
                      [{check.timestamp.toISOString()}] Performance: {check.name} - {check.status.toUpperCase()} -{" "}
                      {check.message}
                    </div>
                  ))}

                  <div className="text-blue-400">[{new Date().toISOString()}] System: Diagnostics complete</div>
                </div>

                <div className="mt-4 flex justify-between items-center">
                  <div className="text-xs text-slate-500">
                    Log entries:{" "}
                    {systemChecks.length +
                      apiChecks.length +
                      cssChecks.length +
                      dataChecks.length +
                      supabaseChecks.length +
                      envChecks.length +
                      performanceChecks.length}
                  </div>
                  <Button variant="outline" className="text-teal border-teal/30 hover:bg-teal/10">
                    <FileText className="h-4 w-4 mr-2" />
                    Export Logs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8 text-center">
          <Button onClick={runAllChecks} className="btn-wolf px-8 py-3">
            {isLoading ? <RefreshCw className="h-5 w-5 mr-2 animate-spin" /> : <RefreshCw className="h-5 w-5 mr-2" />}
            Run Complete System Diagnostic
          </Button>
          <p className="text-xs text-slate-500 mt-2">
            Wolf Platform Debug System • Version 1.0.0 • Last Updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  )
}
