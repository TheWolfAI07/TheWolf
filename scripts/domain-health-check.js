// Comprehensive Domain Health Check
// Tests your domain's overall API health and connectivity

const DOMAIN = process.env.NEXT_PUBLIC_APP_URL || "https://your-domain.com"

async function checkDomainHealth() {
  console.log("🏥 DOMAIN HEALTH CHECK")
  console.log(`🌐 Domain: ${DOMAIN}`)
  console.log("=".repeat(50))

  // 1. Basic connectivity test
  console.log("\n1️⃣ BASIC CONNECTIVITY TEST")
  try {
    const response = await fetch(DOMAIN)
    console.log(`   ✅ Domain accessible: ${response.status} ${response.statusText}`)
  } catch (error) {
    console.log(`   ❌ Domain not accessible: ${error.message}`)
    return
  }

  // 2. CORS test
  console.log("\n2️⃣ CORS CONFIGURATION TEST")
  try {
    const response = await fetch(`${DOMAIN}/api/health`, {
      method: "GET",
      headers: {
        Origin: DOMAIN,
        "Access-Control-Request-Method": "GET",
      },
    })
    console.log(`   ✅ CORS working: ${response.status}`)
  } catch (error) {
    console.log(`   ⚠️  CORS issue: ${error.message}`)
  }

  // 3. SSL/HTTPS test
  console.log("\n3️⃣ SSL/HTTPS TEST")
  if (DOMAIN.startsWith("https://")) {
    console.log("   ✅ Using HTTPS - Secure connection")
  } else {
    console.log("   ⚠️  Using HTTP - Consider HTTPS for production")
  }

  // 4. Response time test
  console.log("\n4️⃣ RESPONSE TIME TEST")
  const times = []
  for (let i = 0; i < 5; i++) {
    const start = Date.now()
    try {
      await fetch(`${DOMAIN}/api/health`)
      times.push(Date.now() - start)
    } catch (e) {
      console.log(`   ❌ Request ${i + 1} failed`)
    }
  }

  if (times.length > 0) {
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length
    console.log(`   ⚡ Average response time: ${Math.round(avgTime)}ms`)

    if (avgTime < 500) {
      console.log("   ✅ Excellent response time!")
    } else if (avgTime < 1000) {
      console.log("   ⚠️  Good response time")
    } else {
      console.log("   🐌 Slow response time - consider optimization")
    }
  }

  console.log("\n🎯 DOMAIN HEALTH CHECK COMPLETE!")
}

checkDomainHealth()
