import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  const startTime = Date.now()

  try {
    console.log("🔍 Starting comprehensive verification...")

    const verification = {
      timestamp: new Date().toISOString(),
      environment: {
        supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        serviceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        nodeEnv: process.env.NODE_ENV,
      },
      tests: {
        supabaseConnection: { status: "pending", details: {} },
        databaseAccess: { status: "pending", details: {} },
        apiEndpoints: { status: "pending", details: {} },
      },
      overall: "pending",
      responseTime: 0,
    }

    // Test 1: Supabase Connection
    try {
      const supabase = createServerSupabaseClient()
      const { error } = await supabase.auth.getSession()

      if (error && !error.message.includes("session")) {
        throw error
      }

      verification.tests.supabaseConnection = {
        status: "✅ PASS",
        details: { message: "Supabase client connected successfully" },
      }
      console.log("✅ Supabase connection: PASS")
    } catch (error: any) {
      verification.tests.supabaseConnection = {
        status: "❌ FAIL",
        details: { error: error.message },
      }
      console.log("❌ Supabase connection: FAIL")
    }

    // Test 2: Database Access
    try {
      const supabase = createServerSupabaseClient()

      // Try to query a system table
      const { data, error } = await supabase
        .from("information_schema.tables")
        .select("table_name")
        .eq("table_schema", "public")
        .limit(1)

      if (error) {
        throw error
      }

      verification.tests.databaseAccess = {
        status: "✅ PASS",
        details: {
          message: "Database query successful",
          tablesFound: data?.length || 0,
        },
      }
      console.log("✅ Database access: PASS")
    } catch (error: any) {
      verification.tests.databaseAccess = {
        status: "❌ FAIL",
        details: { error: error.message },
      }
      console.log("❌ Database access: FAIL")
    }

    // Test 3: API Endpoints
    try {
      const endpoints = ["/api/health", "/api/setup"]
      const results = []

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}${endpoint}`)
          results.push({
            endpoint,
            status: response.status,
            ok: response.ok,
          })
        } catch (error: any) {
          results.push({
            endpoint,
            status: "error",
            error: error.message,
          })
        }
      }

      const allPassed = results.every((r) => r.ok || r.status === 200)

      verification.tests.apiEndpoints = {
        status: allPassed ? "✅ PASS" : "⚠️ PARTIAL",
        details: { results },
      }
      console.log(`${allPassed ? "✅" : "⚠️"} API endpoints: ${allPassed ? "PASS" : "PARTIAL"}`)
    } catch (error: any) {
      verification.tests.apiEndpoints = {
        status: "❌ FAIL",
        details: { error: error.message },
      }
      console.log("❌ API endpoints: FAIL")
    }

    // Overall Status
    const testResults = Object.values(verification.tests)
    const allPass = testResults.every((t) => t.status.includes("✅"))
    const anyFail = testResults.some((t) => t.status.includes("❌"))

    if (allPass) {
      verification.overall = "🎉 ALL SYSTEMS GO!"
    } else if (anyFail) {
      verification.overall = "⚠️ SOME ISSUES DETECTED"
    } else {
      verification.overall = "✅ MOSTLY OPERATIONAL"
    }

    verification.responseTime = Date.now() - startTime

    console.log(`🏁 Verification completed in ${verification.responseTime}ms`)
    console.log(`📊 Overall status: ${verification.overall}`)

    return NextResponse.json({
      success: true,
      verification,
      message: "System verification completed",
    })
  } catch (error: any) {
    console.error("💥 Verification failed:", error.message)

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        verification: {
          timestamp: new Date().toISOString(),
          overall: "❌ VERIFICATION FAILED",
          responseTime: Date.now() - startTime,
        },
      },
      { status: 500 },
    )
  }
}
