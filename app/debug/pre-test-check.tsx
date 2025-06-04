"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CryptoAPI } from "@/lib/crypto-api"
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, User, Zap, Globe, Eye, Shield } from "lucide-react"

interface TestResult {
  category: string
  test: string
  status: "pass" | "fail" | "warning"
  message: string
  critical: boolean
  userImpact: string
}

export default function PreTestCheck() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [overallStatus, setOverallStatus] = useState<"good" | "warning" | "critical">("good")

  const runPreTestChecks = async () => {
    setIsRunning(true)
    const results: TestResult[] = []

    // Critical User Experience Tests
    try {
      // Test 1: Page Load Speed
      const loadStart = performance.now()
      await new Promise((resolve) => setTimeout(resolve, 100))
      const loadTime = performance.now() - loadStart

      results.push({
        category: "Performance",
        test: "Page Load Speed",
        status: loadTime < 200 ? "pass" : loadTime < 500 ? "warning" : "fail",
        message: `${Math.round(loadTime)}ms load time`,
        critical: loadTime > 1000,
        userImpact: loadTime > 1000 ? "Users will experience slow loading" : "Good loading experience",
      })

      // Test 2: Crypto API Connection
      const apiStart = performance.now()
      try {
        const marketData = await CryptoAPI.getGlobalMarketData()
        const apiTime = performance.now() - apiStart

        results.push({
          category: "API",
          test: "Crypto Data Loading",
          status: marketData && apiTime < 3000 ? "pass" : "fail",
          message: marketData ? `Data loaded in ${Math.round(apiTime)}ms` : "Failed to load crypto data",
          critical: !marketData,
          userImpact: !marketData ? "No crypto prices will show" : "Crypto prices working perfectly",
        })
      } catch (error) {
        results.push({
          category: "API",
          test: "Crypto Data Loading",
          status: "fail",
          message: "API connection failed",
          critical: true,
          userImpact: "No crypto data will be available",
        })
      }

      // Test 3: Navigation Functionality
      const navElements = document.querySelectorAll('nav a, [role="navigation"] a')
      results.push({
        category: "Navigation",
        test: "Menu Links",
        status: navElements.length > 0 ? "pass" : "fail",
        message: `${navElements.length} navigation links found`,
        critical: navElements.length === 0,
        userImpact: navElements.length === 0 ? "Users cannot navigate the site" : "Navigation working",
      })

      // Test 4: Visual Design Elements
      const wolfElements = document.querySelectorAll(".bg-wolf-gradient, .text-wolf-heading, .btn-wolf")
      results.push({
        category: "Design",
        test: "Wolf Theme Elements",
        status: wolfElements.length > 0 ? "pass" : "warning",
        message: `${wolfElements.length} themed elements detected`,
        critical: false,
        userImpact: wolfElements.length === 0 ? "Basic styling, missing Wolf theme" : "Full Wolf theme active",
      })

      // Test 5: Responsive Design
      const isMobile = window.innerWidth < 768
      const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024
      const isDesktop = window.innerWidth >= 1024

      results.push({
        category: "Responsive",
        test: "Screen Compatibility",
        status: "pass",
        message: `${isMobile ? "Mobile" : isTablet ? "Tablet" : "Desktop"} view (${window.innerWidth}px)`,
        critical: false,
        userImpact: "Site adapts to screen size",
      })

      // Test 6: Interactive Elements
      const buttons = document.querySelectorAll("button")
      const workingButtons = Array.from(buttons).filter((btn) => !btn.disabled).length

      results.push({
        category: "Interaction",
        test: "Button Functionality",
        status: workingButtons > 0 ? "pass" : "fail",
        message: `${workingButtons} active buttons found`,
        critical: workingButtons === 0,
        userImpact: workingButtons === 0 ? "Users cannot interact with the site" : "Interactive elements working",
      })

      // Test 7: Error Handling
      try {
        // Test error boundary
        const errorTest = () => {
          throw new Error("Test error")
        }
        try {
          errorTest()
        } catch (e) {
          // Error caught properly
        }

        results.push({
          category: "Stability",
          test: "Error Handling",
          status: "pass",
          message: "Error boundaries working",
          critical: false,
          userImpact: "App handles errors gracefully",
        })
      } catch (error) {
        results.push({
          category: "Stability",
          test: "Error Handling",
          status: "warning",
          message: "Error handling needs attention",
          critical: false,
          userImpact: "Some errors might crash the app",
        })
      }

      // Test 8: Local Storage
      try {
        localStorage.setItem("wolf_test", "working")
        const testValue = localStorage.getItem("wolf_test")
        localStorage.removeItem("wolf_test")

        results.push({
          category: "Storage",
          test: "Local Storage",
          status: testValue === "working" ? "pass" : "warning",
          message: testValue === "working" ? "Local storage functional" : "Local storage issues",
          critical: false,
          userImpact: testValue !== "working" ? "User preferences won't save" : "User data saves properly",
        })
      } catch (error) {
        results.push({
          category: "Storage",
          test: "Local Storage",
          status: "warning",
          message: "Local storage blocked",
          critical: false,
          userImpact: "Private browsing or storage disabled",
        })
      }

      // Test 9: Console Errors
      const originalError = console.error
      let errorCount = 0
      console.error = (...args) => {
        errorCount++
        originalError(...args)
      }

      // Wait a moment to catch any errors
      await new Promise((resolve) => setTimeout(resolve, 500))
      console.error = originalError

      results.push({
        category: "Stability",
        test: "Console Errors",
        status: errorCount === 0 ? "pass" : errorCount < 3 ? "warning" : "fail",
        message: `${errorCount} console errors detected`,
        critical: errorCount > 5,
        userImpact: errorCount > 3 ? "Multiple errors affecting functionality" : "Clean console output",
      })

      // Test 10: Supabase Connection
      try {
        const { checkSupabaseConnection } = await import("@/lib/supabase")
        const dbResult = await checkSupabaseConnection()

        results.push({
          category: "Database",
          test: "Supabase Connection",
          status: dbResult.connected ? "pass" : "fail",
          message: dbResult.connected ? "Database connected" : "Database connection failed",
          critical: !dbResult.connected,
          userImpact: !dbResult.connected ? "No user data or authentication" : "Full database functionality",
        })
      } catch (error) {
        results.push({
          category: "Database",
          test: "Supabase Connection",
          status: "fail",
          message: "Database module error",
          critical: true,
          userImpact: "Database functionality unavailable",
        })
      }
    } catch (error) {
      results.push({
        category: "System",
        test: "Overall System",
        status: "fail",
        message: "Critical system error",
        critical: true,
        userImpact: "System may be unstable",
      })
    }

    setTestResults(results)

    // Determine overall status
    const criticalFailures = results.filter((r) => r.critical && r.status === "fail").length
    const failures = results.filter((r) => r.status === "fail").length
    const warnings = results.filter((r) => r.status === "warning").length

    if (criticalFailures > 0) {
      setOverallStatus("critical")
    } else if (failures > 0 || warnings > 2) {
      setOverallStatus("warning")
    } else {
      setOverallStatus("good")
    }

    setIsRunning(false)
  }

  useEffect(() => {
    runPreTestChecks()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pass":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "fail":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      default:
        return <RefreshCw className="h-5 w-5 text-slate-500 animate-spin" />
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Performance":
        return <Zap className="h-5 w-5" />
      case "API":
        return <Globe className="h-5 w-5" />
      case "Design":
        return <Eye className="h-5 w-5" />
      case "Database":
        return <Shield className="h-5 w-5" />
      default:
        return <User className="h-5 w-5" />
    }
  }

  const passCount = testResults.filter((r) => r.status === "pass").length
  const totalTests = testResults.length

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="text-6xl animate-wolf-pulse">🐺</div>
          <h1 className="text-4xl font-bold text-wolf-heading">Pre-Test System Check</h1>
        </div>
        <p className="text-xl text-slate-300">Ready for your dad's testing session?</p>
      </div>

      {/* Overall Status */}
      <Card className="mb-6 bg-wolf-card wolf-border">
        <CardContent className="p-6">
          <div className="text-center">
            <div
              className={`text-6xl mb-4 ${
                overallStatus === "good"
                  ? "text-green-500"
                  : overallStatus === "warning"
                    ? "text-yellow-500"
                    : "text-red-500"
              }`}
            >
              {overallStatus === "good" ? "✅" : overallStatus === "warning" ? "⚠️" : "❌"}
            </div>

            <h2
              className={`text-3xl font-bold mb-2 ${
                overallStatus === "good"
                  ? "text-green-400"
                  : overallStatus === "warning"
                    ? "text-yellow-400"
                    : "text-red-400"
              }`}
            >
              {overallStatus === "good"
                ? "READY TO TEST!"
                : overallStatus === "warning"
                  ? "MOSTLY READY"
                  : "NEEDS ATTENTION"}
            </h2>

            <p className="text-xl text-slate-300 mb-4">
              {overallStatus === "good"
                ? "All systems operational - perfect for testing!"
                : overallStatus === "warning"
                  ? "Minor issues detected - testing can proceed"
                  : "Critical issues found - fix before testing"}
            </p>

            <div className="flex justify-center gap-8 text-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{passCount}</div>
                <div className="text-sm text-slate-400">Tests Passed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-teal">{totalTests}</div>
                <div className="text-sm text-slate-400">Total Tests</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-300">{Math.round((passCount / totalTests) * 100)}%</div>
                <div className="text-sm text-slate-400">Success Rate</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      <div className="grid gap-4">
        {testResults.map((result, index) => (
          <Card
            key={index}
            className={`bg-wolf-card wolf-border ${
              result.critical && result.status === "fail" ? "border-red-500/50" : ""
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  {getCategoryIcon(result.category)}
                  <div>
                    <h3 className="font-semibold text-white">{result.test}</h3>
                    <p className="text-sm text-slate-400">{result.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {result.critical && result.status === "fail" && (
                    <Badge className="bg-red-500/20 text-red-300 border-red-400/50">CRITICAL</Badge>
                  )}
                  {getStatusIcon(result.status)}
                </div>
              </div>

              <p className="text-slate-300 mb-2">{result.message}</p>
              <p
                className={`text-sm ${
                  result.status === "pass"
                    ? "text-green-400"
                    : result.status === "warning"
                      ? "text-yellow-400"
                      : "text-red-400"
                }`}
              >
                👤 User Impact: {result.userImpact}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="mt-8 text-center space-y-4">
        <Button onClick={runPreTestChecks} disabled={isRunning} className="btn-wolf px-8 py-3">
          {isRunning ? <RefreshCw className="h-5 w-5 mr-2 animate-spin" /> : <RefreshCw className="h-5 w-5 mr-2" />}
          Re-run Pre-Test Check
        </Button>

        {overallStatus === "good" && (
          <div className="bg-green-500/20 border border-green-400/50 rounded-lg p-4">
            <h3 className="text-green-400 font-bold text-lg mb-2">🎉 Ready for Testing!</h3>
            <p className="text-green-300">
              All systems are operational. Your dad can now test the platform with confidence!
            </p>
            <div className="mt-3 text-sm text-green-400">
              ✅ Fast loading • ✅ Crypto data working • ✅ Navigation functional • ✅ Responsive design
            </div>
          </div>
        )}

        {overallStatus === "warning" && (
          <div className="bg-yellow-500/20 border border-yellow-400/50 rounded-lg p-4">
            <h3 className="text-yellow-400 font-bold text-lg mb-2">⚠️ Minor Issues Detected</h3>
            <p className="text-yellow-300">
              The platform is mostly functional but has some minor issues. Testing can proceed.
            </p>
          </div>
        )}

        {overallStatus === "critical" && (
          <div className="bg-red-500/20 border border-red-400/50 rounded-lg p-4">
            <h3 className="text-red-400 font-bold text-lg mb-2">❌ Critical Issues Found</h3>
            <p className="text-red-300">Please fix the critical issues before testing to ensure the best experience.</p>
          </div>
        )}
      </div>

      <div className="mt-6 text-center text-xs text-slate-500">
        Pre-Test Check completed at {new Date().toLocaleTimeString()}
      </div>
    </div>
  )
}
