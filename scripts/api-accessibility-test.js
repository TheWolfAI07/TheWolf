// API Accessibility Test Script
// Run this to test all your API endpoints from your domain

const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://your-domain.com"

const endpoints = [
  "/api/health",
  "/api/status",
  "/api/analytics",
  "/api/projects",
  "/api/users",
  "/api/auth/demo",
  "/api/ai/health",
  "/api/edge-functions/health",
  "/api/setup",
  "/api/verify",
]

async function testEndpoint(endpoint) {
  const url = `${API_BASE_URL}${endpoint}`
  console.log(`\n🔍 Testing: ${url}`)

  try {
    const startTime = Date.now()
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": "API-Test-Script",
      },
    })

    const responseTime = Date.now() - startTime
    const status = response.status
    const statusText = response.statusText

    console.log(`   Status: ${status} ${statusText}`)
    console.log(`   Response Time: ${responseTime}ms`)

    if (response.ok) {
      try {
        const data = await response.json()
        console.log(`   ✅ SUCCESS - Data received:`, Object.keys(data))
      } catch (e) {
        console.log(`   ✅ SUCCESS - Non-JSON response`)
      }
    } else {
      console.log(`   ❌ FAILED - HTTP ${status}`)
    }

    return { endpoint, status, responseTime, success: response.ok }
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`)
    return { endpoint, status: 0, responseTime: 0, success: false, error: error.message }
  }
}

async function runAccessibilityTest() {
  console.log(`🚀 API ACCESSIBILITY TEST`)
  console.log(`📍 Testing domain: ${API_BASE_URL}`)
  console.log(`⏰ Started at: ${new Date().toISOString()}`)
  console.log("=".repeat(60))

  const results = []

  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint)
    results.push(result)

    // Small delay between requests
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  console.log("\n" + "=".repeat(60))
  console.log("📊 SUMMARY REPORT")
  console.log("=".repeat(60))

  const successful = results.filter((r) => r.success).length
  const failed = results.filter((r) => !r.success).length

  console.log(`✅ Successful: ${successful}/${results.length}`)
  console.log(`❌ Failed: ${failed}/${results.length}`)

  if (failed > 0) {
    console.log("\n🚨 FAILED ENDPOINTS:")
    results
      .filter((r) => !r.success)
      .forEach((r) => {
        console.log(`   ${r.endpoint} - Status: ${r.status} ${r.error ? `(${r.error})` : ""}`)
      })
  }

  const avgResponseTime =
    results.filter((r) => r.responseTime > 0).reduce((sum, r) => sum + r.responseTime, 0) /
    results.filter((r) => r.responseTime > 0).length

  console.log(`⚡ Average Response Time: ${Math.round(avgResponseTime)}ms`)

  if (successful === results.length) {
    console.log("\n🎉 ALL APIS ARE ACCESSIBLE FROM YOUR DOMAIN!")
  } else {
    console.log("\n⚠️  SOME APIS ARE NOT ACCESSIBLE - CHECK FAILED ENDPOINTS")
  }
}

// Run the test
runAccessibilityTest()
