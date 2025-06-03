/**
 * Comprehensive System Testing Script
 * Run this to test all connections, functions, and components
 */

import { supabase, createServerSupabaseClient } from "@/lib/supabase"
import { AuthService } from "@/lib/auth"

interface TestResult {
  name: string
  status: "pass" | "fail" | "warning"
  message: string
  details?: any
}

class SystemTester {
  private results: TestResult[] = []

  private addResult(name: string, status: "pass" | "fail" | "warning", message: string, details?: any) {
    this.results.push({ name, status, message, details })
    console.log(`${status.toUpperCase()}: ${name} - ${message}`)
    if (details) console.log("Details:", details)
  }

  // Test 1: Database Connections
  async testDatabaseConnections() {
    console.log("\n🔍 Testing Database Connections...")

    try {
      // Test client-side connection
      if (!supabase) {
        this.addResult("Supabase Client", "fail", "Supabase client not initialized")
        return
      }

      const { data, error } = await supabase.from("users").select("count(*)")
      if (error) {
        this.addResult("Supabase Connection", "fail", `Connection failed: ${error.message}`, error)
      } else {
        this.addResult("Supabase Connection", "pass", "Successfully connected to database")
      }

      // Test server-side connection
      try {
        const serverClient = createServerSupabaseClient()
        const { data: serverData, error: serverError } = await serverClient.from("users").select("count(*)")

        if (serverError) {
          this.addResult("Server Supabase Connection", "fail", `Server connection failed: ${serverError.message}`)
        } else {
          this.addResult("Server Supabase Connection", "pass", "Server connection successful")
        }
      } catch (serverErr: any) {
        this.addResult("Server Supabase Connection", "fail", `Server connection error: ${serverErr.message}`)
      }
    } catch (err: any) {
      this.addResult("Database Test", "fail", `Unexpected error: ${err.message}`, err)
    }
  }

  // Test 2: Authentication System
  async testAuthentication() {
    console.log("\n🔐 Testing Authentication System...")

    try {
      // Test current session
      const { data: session, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) {
        this.addResult("Session Check", "warning", `Session error: ${sessionError.message}`)
      } else {
        this.addResult("Session Check", "pass", session.session ? "User logged in" : "No active session")
      }

      // Test demo user creation (safe test)
      try {
        const demoResult = await AuthService.createDemoUser()
        if (demoResult.success) {
          this.addResult("Demo User Creation", "pass", "Demo user creation works")
        } else {
          this.addResult("Demo User Creation", "warning", `Demo user issue: ${demoResult.error}`)
        }
      } catch (authErr: any) {
        this.addResult("Demo User Creation", "fail", `Auth service error: ${authErr.message}`)
      }
    } catch (err: any) {
      this.addResult("Authentication Test", "fail", `Auth test failed: ${err.message}`)
    }
  }

  // Test 3: API Endpoints
  async testAPIEndpoints() {
    console.log("\n🌐 Testing API Endpoints...")

    const endpoints = [
      { name: "Health Check", path: "/api/health", method: "GET" },
      { name: "Users API", path: "/api/users", method: "GET" },
      { name: "Projects API", path: "/api/projects", method: "GET" },
      { name: "Analytics API", path: "/api/analytics", method: "GET" },
      { name: "Test API", path: "/api/test", method: "GET" },
      { name: "Chat API", path: "/api/chat", method: "POST" },
      { name: "Functions API", path: "/api/functions", method: "GET" },
    ]

    for (const endpoint of endpoints) {
      try {
        const startTime = Date.now()

        const options: RequestInit = {
          method: endpoint.method,
          headers: { "Content-Type": "application/json" },
        }

        // Add body for POST requests
        if (endpoint.method === "POST" && endpoint.path === "/api/chat") {
          options.body = JSON.stringify({ message: "test message" })
        }

        const response = await fetch(endpoint.path, options)
        const endTime = Date.now()
        const responseTime = endTime - startTime

        if (response.ok) {
          const data = await response.json()
          this.addResult(
            endpoint.name,
            "pass",
            `${endpoint.method} ${endpoint.path} - ${response.status} (${responseTime}ms)`,
            { status: response.status, responseTime, data },
          )
        } else {
          const errorData = await response.text()
          this.addResult(
            endpoint.name,
            "fail",
            `${endpoint.method} ${endpoint.path} - ${response.status} (${responseTime}ms)`,
            { status: response.status, responseTime, error: errorData },
          )
        }
      } catch (err: any) {
        this.addResult(endpoint.name, "fail", `Network error: ${err.message}`, err)
      }
    }
  }

  // Test 4: Database Operations
  async testDatabaseOperations() {
    console.log("\n💾 Testing Database Operations...")

    try {
      // Test reading from each table
      const tables = ["users", "wolf_projects", "wolf_analytics", "wolf_activities", "wolf_settings"]

      for (const table of tables) {
        try {
          const { data, error, count } = await supabase.from(table).select("*", { count: "exact", head: true })

          if (error) {
            this.addResult(`Table: ${table}`, "fail", `Read failed: ${error.message}`)
          } else {
            this.addResult(`Table: ${table}`, "pass", `Read successful - ${count || 0} records`)
          }
        } catch (tableErr: any) {
          this.addResult(`Table: ${table}`, "fail", `Table error: ${tableErr.message}`)
        }
      }

      // Test a safe write operation (insert a test record)
      try {
        const testRecord = {
          key: "system_test",
          value: "test_value",
          description: "System test record",
          category: "testing",
        }

        const { data, error } = await supabase.from("wolf_settings").upsert(testRecord, { onConflict: "key" }).select()

        if (error) {
          this.addResult("Database Write", "fail", `Write failed: ${error.message}`)
        } else {
          this.addResult("Database Write", "pass", "Write operation successful")

          // Clean up test record
          await supabase.from("wolf_settings").delete().eq("key", "system_test")
        }
      } catch (writeErr: any) {
        this.addResult("Database Write", "fail", `Write error: ${writeErr.message}`)
      }
    } catch (err: any) {
      this.addResult("Database Operations", "fail", `Database ops failed: ${err.message}`)
    }
  }

  // Test 5: Environment Variables
  async testEnvironmentVariables() {
    console.log("\n⚙️ Testing Environment Variables...")

    const requiredEnvVars = [
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "SUPABASE_SERVICE_ROLE_KEY",
      "SUPABASE_JWT_SECRET",
      "GROQ_API_KEY",
      "XAI_API_KEY",
      "KV_URL",
      "REDIS_URL",
    ]

    for (const envVar of requiredEnvVars) {
      const value = process.env[envVar]
      if (value) {
        this.addResult(`ENV: ${envVar}`, "pass", `Set (${value.length} chars)`, {
          length: value.length,
          preview: value.substring(0, 10) + "...",
        })
      } else {
        this.addResult(`ENV: ${envVar}`, "fail", "Not set or empty")
      }
    }
  }

  // Test 6: External Services
  async testExternalServices() {
    console.log("\n🌍 Testing External Services...")

    // Test Groq AI
    try {
      const groqResponse = await fetch("https://api.groq.com/openai/v1/models", {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      })

      if (groqResponse.ok) {
        this.addResult("Groq AI", "pass", "API key valid and service accessible")
      } else {
        this.addResult("Groq AI", "fail", `API error: ${groqResponse.status}`)
      }
    } catch (groqErr: any) {
      this.addResult("Groq AI", "fail", `Connection error: ${groqErr.message}`)
    }

    // Test Redis/Upstash
    try {
      const redisResponse = await fetch(process.env.KV_REST_API_URL + "/ping", {
        headers: {
          Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
        },
      })

      if (redisResponse.ok) {
        this.addResult("Redis/Upstash", "pass", "Connection successful")
      } else {
        this.addResult("Redis/Upstash", "fail", `Connection failed: ${redisResponse.status}`)
      }
    } catch (redisErr: any) {
      this.addResult("Redis/Upstash", "fail", `Connection error: ${redisErr.message}`)
    }
  }

  // Run all tests
  async runAllTests() {
    console.log("🚀 Starting Comprehensive System Test...\n")

    await this.testEnvironmentVariables()
    await this.testDatabaseConnections()
    await this.testAuthentication()
    await this.testAPIEndpoints()
    await this.testDatabaseOperations()
    await this.testExternalServices()

    this.generateReport()
  }

  // Generate final report
  generateReport() {
    console.log("\n📊 SYSTEM TEST REPORT")
    console.log("=".repeat(50))

    const passed = this.results.filter((r) => r.status === "pass").length
    const failed = this.results.filter((r) => r.status === "fail").length
    const warnings = this.results.filter((r) => r.status === "warning").length

    console.log(`✅ Passed: ${passed}`)
    console.log(`❌ Failed: ${failed}`)
    console.log(`⚠️  Warnings: ${warnings}`)
    console.log(`📈 Success Rate: ${((passed / this.results.length) * 100).toFixed(1)}%`)

    if (failed > 0) {
      console.log("\n🔥 CRITICAL ISSUES:")
      this.results.filter((r) => r.status === "fail").forEach((r) => console.log(`   ❌ ${r.name}: ${r.message}`))
    }

    if (warnings > 0) {
      console.log("\n⚠️  WARNINGS:")
      this.results.filter((r) => r.status === "warning").forEach((r) => console.log(`   ⚠️  ${r.name}: ${r.message}`))
    }

    console.log("\n" + "=".repeat(50))

    if (failed === 0) {
      console.log("🎉 ALL SYSTEMS OPERATIONAL!")
    } else {
      console.log("🚨 SYSTEM ISSUES DETECTED - REVIEW FAILURES ABOVE")
    }

    return {
      total: this.results.length,
      passed,
      failed,
      warnings,
      successRate: (passed / this.results.length) * 100,
      results: this.results,
    }
  }
}

// Export for use
export { SystemTester }

// Auto-run if called directly
if (typeof window === "undefined") {
  const tester = new SystemTester()
  tester.runAllTests().catch(console.error)
}
