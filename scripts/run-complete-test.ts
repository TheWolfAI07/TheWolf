/**
 * Complete System Test Runner
 * Combines all testing scripts for comprehensive validation
 */

import { SystemTester } from "./test-all-systems"
import { UIComponentTester } from "./ui-component-tester"

interface CompleteTestReport {
  systemTests: any
  uiTests: any
  overallStatus: "pass" | "fail" | "warning"
  summary: {
    totalTests: number
    totalPassed: number
    totalFailed: number
    totalWarnings: number
    overallSuccessRate: number
  }
  recommendations: string[]
}

class CompleteSystemValidator {
  async runCompleteValidation(): Promise<CompleteTestReport> {
    console.log("🚀 STARTING COMPLETE WOLF PLATFORM VALIDATION")
    console.log("=".repeat(60))
    console.log("This will test EVERYTHING - connections, APIs, UI, database, auth, etc.")
    console.log("=".repeat(60))

    // Run system tests
    console.log("\n🔧 PHASE 1: SYSTEM & BACKEND TESTS")
    const systemTester = new SystemTester()
    const systemResults = await systemTester.runAllTests()

    // Run UI tests (if in browser environment)
    let uiResults = null
    if (typeof window !== "undefined") {
      console.log("\n🎨 PHASE 2: UI & FRONTEND TESTS")
      const uiTester = new UIComponentTester()
      uiResults = uiTester.runAllUITests()
    } else {
      console.log("\n⚠️  PHASE 2: UI tests skipped (not in browser environment)")
    }

    // Generate complete report
    const report = this.generateCompleteReport(systemResults, uiResults)
    this.displayFinalReport(report)

    return report
  }

  private generateCompleteReport(systemResults: any, uiResults: any): CompleteTestReport {
    const totalTests = systemResults.total + (uiResults?.total || 0)
    const totalPassed = systemResults.passed + (uiResults?.passed || 0)
    const totalFailed = systemResults.failed + (uiResults?.failed || 0)
    const totalWarnings = systemResults.warnings + (uiResults?.warnings || 0)
    const overallSuccessRate = (totalPassed / totalTests) * 100

    let overallStatus: "pass" | "fail" | "warning" = "pass"
    if (totalFailed > 0) overallStatus = "fail"
    else if (totalWarnings > 0) overallStatus = "warning"

    const recommendations = this.generateRecommendations(systemResults, uiResults)

    return {
      systemTests: systemResults,
      uiTests: uiResults,
      overallStatus,
      summary: {
        totalTests,
        totalPassed,
        totalFailed,
        totalWarnings,
        overallSuccessRate,
      },
      recommendations,
    }
  }

  private generateRecommendations(systemResults: any, uiResults: any): string[] {
    const recommendations: string[] = []

    // System recommendations
    if (systemResults.failed > 0) {
      recommendations.push("🔥 CRITICAL: Fix failed system tests before deployment")

      const failedTests = systemResults.results.filter((r: any) => r.status === "fail")
      failedTests.forEach((test: any) => {
        if (test.name.includes("Database")) {
          recommendations.push("   → Check Supabase connection and environment variables")
        }
        if (test.name.includes("API")) {
          recommendations.push("   → Verify API endpoints are properly configured")
        }
        if (test.name.includes("Auth")) {
          recommendations.push("   → Check authentication configuration and JWT secret")
        }
      })
    }

    // UI recommendations
    if (uiResults && uiResults.failed > 0) {
      recommendations.push("🎨 UI: Fix failed UI component tests")

      const failedUITests = uiResults.results.filter((r: any) => r.status === "fail")
      failedUITests.forEach((test: any) => {
        if (test.component === "Accessibility") {
          recommendations.push("   → Improve accessibility with proper alt text and ARIA labels")
        }
        if (test.component === "Forms") {
          recommendations.push("   → Fix form validation and input attributes")
        }
      })
    }

    // Performance recommendations
    if (systemResults.results.some((r: any) => r.details?.responseTime > 2000)) {
      recommendations.push("⚡ PERFORMANCE: Some API endpoints are slow (>2s response time)")
    }

    // Security recommendations
    const envTests = systemResults.results.filter((r: any) => r.name.includes("ENV"))
    const missingEnvVars = envTests.filter((r: any) => r.status === "fail")
    if (missingEnvVars.length > 0) {
      recommendations.push("🔒 SECURITY: Missing critical environment variables")
    }

    // Success recommendations
    if (recommendations.length === 0) {
      recommendations.push("🎉 EXCELLENT: All systems are operational!")
      recommendations.push("✅ Ready for production deployment")
      recommendations.push("🚀 Consider setting up monitoring and alerts")
    }

    return recommendations
  }

  private displayFinalReport(report: CompleteTestReport) {
    console.log("\n" + "=".repeat(60))
    console.log("🏁 FINAL WOLF PLATFORM VALIDATION REPORT")
    console.log("=".repeat(60))

    // Overall status
    const statusEmoji = report.overallStatus === "pass" ? "🟢" : report.overallStatus === "fail" ? "🔴" : "🟡"
    console.log(`${statusEmoji} OVERALL STATUS: ${report.overallStatus.toUpperCase()}`)

    // Summary
    console.log(`\n📊 SUMMARY:`)
    console.log(`   Total Tests: ${report.summary.totalTests}`)
    console.log(`   ✅ Passed: ${report.summary.totalPassed}`)
    console.log(`   ❌ Failed: ${report.summary.totalFailed}`)
    console.log(`   ⚠️  Warnings: ${report.summary.totalWarnings}`)
    console.log(`   📈 Success Rate: ${report.summary.overallSuccessRate.toFixed(1)}%`)

    // Breakdown
    console.log(`\n🔧 SYSTEM TESTS: ${report.systemTests.passed}/${report.systemTests.total} passed`)
    if (report.uiTests) {
      console.log(`🎨 UI TESTS: ${report.uiTests.passed}/${report.uiTests.total} passed`)
    }

    // Recommendations
    console.log(`\n💡 RECOMMENDATIONS:`)
    report.recommendations.forEach((rec) => console.log(`   ${rec}`))

    // Final verdict
    console.log("\n" + "=".repeat(60))
    if (report.overallStatus === "pass") {
      console.log("🎉 WOLF PLATFORM IS READY TO ROCK!")
      console.log("🚀 All systems operational - you can deploy with confidence!")
    } else if (report.overallStatus === "fail") {
      console.log("🚨 CRITICAL ISSUES DETECTED")
      console.log("🔧 Please fix the failed tests before deployment")
    } else {
      console.log("⚠️  MINOR ISSUES DETECTED")
      console.log("✅ System is functional but could be improved")
    }
    console.log("=".repeat(60))
  }
}

// Export for use
export { CompleteSystemValidator }

// Auto-run if called directly
if (require.main === module) {
  const validator = new CompleteSystemValidator()
  validator.runCompleteValidation().catch(console.error)
}
