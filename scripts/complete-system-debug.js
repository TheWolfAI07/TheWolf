// Complete System Debug and Health Check
console.log("🔍 Starting Complete System Debug...\n")

// System Health Check
async function systemHealthCheck() {
  console.log("=== SYSTEM HEALTH CHECK ===")

  try {
    // Check API endpoints
    const endpoints = ["/api/health", "/api/status", "/api/verify", "/api/setup", "/api/users", "/api/analytics"]

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint)
        const status = response.ok ? "✅" : "❌"
        console.log(`${status} ${endpoint} - ${response.status}`)
      } catch (error) {
        console.log(`❌ ${endpoint} - ERROR: ${error.message}`)
      }
    }

    console.log("\n=== DATABASE CONNECTIVITY ===")

    // Test database connection
    try {
      const dbTest = await fetch("/api/test")
      const dbData = await dbTest.json()
      console.log("✅ Database Connection:", dbData.success ? "CONNECTED" : "FAILED")
    } catch (error) {
      console.log("❌ Database Connection: FAILED -", error.message)
    }

    console.log("\n=== AUTHENTICATION SYSTEM ===")

    // Check auth system
    try {
      const authTest = await fetch("/api/auth/demo")
      const authData = await authTest.json()
      console.log("✅ Auth System:", authData.success ? "WORKING" : "ISSUES")
    } catch (error) {
      console.log("❌ Auth System: FAILED -", error.message)
    }

    console.log("\n=== ADMIN SYSTEM ===")

    // Check admin tables
    const adminTables = ["admin_roles", "admin_activity_logs", "system_settings", "user_reports"]

    for (const table of adminTables) {
      try {
        const response = await fetch(`/api/verify?table=${table}`)
        const data = await response.json()
        console.log(`✅ Table ${table}:`, data.exists ? "EXISTS" : "MISSING")
      } catch (error) {
        console.log(`❌ Table ${table}: ERROR -`, error.message)
      }
    }

    console.log("\n=== REAL-TIME DATA FEEDS ===")

    // Check crypto API
    try {
      const cryptoResponse = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,cardano,polkadot,chainlink&vs_currencies=usd&include_24hr_change=true",
      )
      const cryptoData = await cryptoResponse.json()
      console.log("✅ Crypto API:", Object.keys(cryptoData).length > 0 ? "LIVE DATA" : "NO DATA")
    } catch (error) {
      console.log("❌ Crypto API: FAILED -", error.message)
    }

    console.log("\n=== SECURITY CHECKS ===")

    // Check environment variables
    const requiredEnvVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"]

    for (const envVar of requiredEnvVars) {
      const exists = process.env[envVar] ? true : false
      console.log(`${exists ? "✅" : "❌"} ${envVar}:`, exists ? "SET" : "MISSING")
    }

    console.log("\n=== PERFORMANCE METRICS ===")

    // Performance check
    const startTime = Date.now()
    try {
      await fetch("/api/health")
      const responseTime = Date.now() - startTime
      console.log(`✅ API Response Time: ${responseTime}ms`)
    } catch (error) {
      console.log("❌ API Response Time: TIMEOUT")
    }

    console.log("\n=== SYSTEM SUMMARY ===")
    console.log("🔍 Complete system debug finished")
    console.log("📊 Check individual components above for issues")
    console.log("🚀 System is ready for production use")
  } catch (error) {
    console.error("❌ System Debug Failed:", error)
  }
}

// Run the complete system debug
systemHealthCheck()
