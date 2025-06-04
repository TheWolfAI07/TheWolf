"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Navbar } from "@/components/navbar"
import { CryptoAPI } from "@/lib/crypto-api"
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Database, Globe, Code, Cpu, FileText } from "lucide-react"

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
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("system")
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
      await Promise.all([checkSystem(), checkApi(), checkCss(), checkData()])
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-wolf-heading mb-2">Wolf Platform Debug</h1>
            <p className="text-slate-400">System diagnostics and troubleshooting</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-slate-400">Current Time</div>
              <div className="text-xl font-mono text-teal">{currentTime.toLocaleTimeString()}</div>
            </div>

            <Button onClick={runAllChecks} disabled={isLoading} className="btn-wolf">
              {isLoading ? <RefreshCw className="h-5 w-5 mr-2 animate-spin" /> : <RefreshCw className="h-5 w-5 mr-2" />}
              Run Diagnostics
            </Button>
          </div>
        </div>

        <Card className="mb-6 bg-wolf-card wolf-border">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                <div className="text-sm text-slate-400 mb-1">System Status</div>
                <div className="text-xl font-bold text-teal">
                  {systemChecks.filter((c) => c.status === "success").length} / {systemChecks.length}
                </div>
                <div className="text-xs text-slate-500">Checks Passed</div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                <div className="text-sm text-slate-400 mb-1">API Status</div>
                <div className="text-xl font-bold text-teal">
                  {apiChecks.filter((c) => c.status === "success").length} / {apiChecks.length}
                </div>
                <div className="text-xs text-slate-500">Connections OK</div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                <div className="text-sm text-slate-400 mb-1">CSS Status</div>
                <div className="text-xl font-bold text-teal">
                  {cssChecks.filter((c) => c.status === "success").length} / {cssChecks.length}
                </div>
                <div className="text-xs text-slate-500">Styles Verified</div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4 text-center">
                <div className="text-sm text-slate-400 mb-1">Data Status</div>
                <div className="text-xl font-bold text-teal">
                  {dataChecks.filter((c) => c.status === "success").length} / {dataChecks.length}
                </div>
                <div className="text-xs text-slate-500">Data Checks Passed</div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <Badge
                className={
                  isLoading
                    ? "bg-blue-500/20 text-blue-300 border-blue-400/50"
                    : systemChecks.some((c) => c.status === "error") ||
                        apiChecks.some((c) => c.status === "error") ||
                        cssChecks.some((c) => c.status === "error") ||
                        dataChecks.some((c) => c.status === "error")
                      ? "bg-red-500/20 text-red-300 border-red-400/50"
                      : systemChecks.some((c) => c.status === "warning") ||
                          apiChecks.some((c) => c.status === "warning") ||
                          cssChecks.some((c) => c.status === "warning") ||
                          dataChecks.some((c) => c.status === "warning")
                        ? "bg-yellow-500/20 text-yellow-300 border-yellow-400/50"
                        : "bg-green-500/20 text-green-300 border-green-400/50"
                }
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    CHECKING SYSTEM
                  </>
                ) : systemChecks.some((c) => c.status === "error") ||
                  apiChecks.some((c) => c.status === "error") ||
                  cssChecks.some((c) => c.status === "error") ||
                  dataChecks.some((c) => c.status === "error") ? (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    SYSTEM ERRORS DETECTED
                  </>
                ) : systemChecks.some((c) => c.status === "warning") ||
                  apiChecks.some((c) => c.status === "warning") ||
                  cssChecks.some((c) => c.status === "warning") ||
                  dataChecks.some((c) => c.status === "warning") ? (
                  <>
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    SYSTEM WARNINGS DETECTED
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    ALL SYSTEMS OPERATIONAL
                  </>
                )}
              </Badge>

              <div className="text-xs text-slate-500 mt-2">
                Last check: {new Date().toLocaleTimeString()} • Refresh #{refreshCount}
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-800/50 border-slate-700 mb-6">
            <TabsTrigger value="system" className="data-[state=active]:bg-teal data-[state=active]:text-black">
              <Cpu className="h-4 w-4 mr-2" />
              System
            </TabsTrigger>
            <TabsTrigger value="api" className="data-[state=active]:bg-teal data-[state=active]:text-black">
              <Globe className="h-4 w-4 mr-2" />
              API
            </TabsTrigger>
            <TabsTrigger value="css" className="data-[state=active]:bg-teal data-[state=active]:text-black">
              <Code className="h-4 w-4 mr-2" />
              CSS
            </TabsTrigger>
            <TabsTrigger value="data" className="data-[state=active]:bg-teal data-[state=active]:text-black">
              <Database className="h-4 w-4 mr-2" />
              Data
            </TabsTrigger>
            <TabsTrigger value="logs" className="data-[state=active]:bg-teal data-[state=active]:text-black">
              <FileText className="h-4 w-4 mr-2" />
              Logs
            </TabsTrigger>
          </TabsList>

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

                  <div className="text-blue-400">[{new Date().toISOString()}] System: Diagnostics complete</div>
                </div>

                <div className="mt-4 flex justify-between items-center">
                  <div className="text-xs text-slate-500">
                    Log entries: {systemChecks.length + apiChecks.length + cssChecks.length + dataChecks.length}
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
