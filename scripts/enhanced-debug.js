// Enhanced Wolf Platform Debug Script
console.log("🐺 Enhanced Wolf Platform Debug Script")
console.log("=====================================")

const fs = require("fs")
const path = require("path")

// Check environment
console.log("\n📊 Environment Check:")
console.log(`- Node.js version: ${process.version}`)
console.log(`- Platform: ${process.platform}`)
console.log(`- Architecture: ${process.arch}`)
console.log(`- Memory usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`)

// Check critical files
console.log("\n📁 Critical Files Check:")
const criticalFiles = [
  "app/layout.tsx",
  "app/page.tsx",
  "app/debug/page.tsx",
  "lib/supabase.ts",
  "lib/crypto-api.ts",
  "lib/config.ts",
  "lib/logger.ts",
  "components/navbar.tsx",
  "app/globals.css",
  "tailwind.config.js",
  "package.json",
]

criticalFiles.forEach((file) => {
  const filePath = path.join(process.cwd(), file)
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath)
    console.log(`- ✅ ${file} (${Math.round(stats.size / 1024)} KB)`)
  } else {
    console.log(`- ❌ ${file} (missing)`)
  }
})

// Check package.json dependencies
console.log("\n📦 Dependencies Check:")
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), "package.json"), "utf8"))

  const criticalDeps = ["@supabase/supabase-js", "next", "react", "tailwindcss", "lucide-react"]

  criticalDeps.forEach((dep) => {
    const version = packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]
    if (version) {
      console.log(`- ✅ ${dep}: ${version}`)
    } else {
      console.log(`- ❌ ${dep}: not found`)
    }
  })
} catch (error) {
  console.log(`- Error reading package.json: ${error.message}`)
}

// Check Supabase configuration
console.log("\n🗄️ Supabase Configuration Check:")
try {
  const supabaseFile = path.join(process.cwd(), "lib", "supabase.ts")
  if (fs.existsSync(supabaseFile)) {
    const content = fs.readFileSync(supabaseFile, "utf8")

    const hasCreateClient = content.includes("createClient")
    const hasCreateClientSupabaseClient = content.includes("createClientSupabaseClient")
    const hasSafeDbOperation = content.includes("safeDbOperation")
    const hasTestEdgeFunctions = content.includes("testEdgeFunctions")

    console.log(`- createClient import: ${hasCreateClient ? "✅" : "❌"}`)
    console.log(`- createClientSupabaseClient export: ${hasCreateClientSupabaseClient ? "✅" : "❌"}`)
    console.log(`- safeDbOperation export: ${hasSafeDbOperation ? "✅" : "❌"}`)
    console.log(`- testEdgeFunctions export: ${hasTestEdgeFunctions ? "✅" : "❌"}`)

    // Check for syntax issues
    const syntaxIssues = []
    if (content.includes("async <T>(\\")) syntaxIssues.push("Backslash in function declaration")
    if (content.includes("<T>") && !content.includes("Promise<")) syntaxIssues.push("Unbalanced generic tags")

    if (syntaxIssues.length > 0) {
      console.log(`- ⚠️ Potential syntax issues:`)
      syntaxIssues.forEach((issue) => console.log(`  - ${issue}`))
    } else {
      console.log(`- No syntax issues detected: ✅`)
    }
  } else {
    console.log(`- supabase.ts not found: ❌`)
  }
} catch (error) {
  console.log(`- Error checking Supabase file: ${error.message}`)
}

// Check API files
console.log("\n🌐 API Files Check:")
const apiFiles = [
  "app/api/health/route.ts",
  "app/api/status/route.ts",
  "app/api/test/route.ts",
  "app/api/analytics/route.ts",
]

apiFiles.forEach((file) => {
  const filePath = path.join(process.cwd(), file)
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, "utf8")
    const hasExport = content.includes("export") && (content.includes("GET") || content.includes("POST"))
    console.log(`- ✅ ${file} ${hasExport ? "(has exports)" : "(⚠️ no exports)"}`)
  } else {
    console.log(`- ❌ ${file} (missing)`)
  }
})

// Check environment variables
console.log("\n🔐 Environment Variables Check:")
const requiredEnvVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"]

const optionalEnvVars = ["NEXT_PUBLIC_APP_URL", "VERCEL", "GROQ_API_KEY", "XAI_API_KEY"]

requiredEnvVars.forEach((envVar) => {
  const value = process.env[envVar]
  console.log(`- ${envVar}: ${value ? "✅ set" : "❌ missing"}`)
})

console.log("\n🔧 Optional Environment Variables:")
optionalEnvVars.forEach((envVar) => {
  const value = process.env[envVar]
  console.log(`- ${envVar}: ${value ? "✅ set" : "⚠️ not set"}`)
})

// Performance check
console.log("\n⚡ Performance Check:")
const startTime = process.hrtime.bigint()
// Simulate some work
for (let i = 0; i < 1000000; i++) {
  Math.random()
}
const endTime = process.hrtime.bigint()
const duration = Number(endTime - startTime) / 1000000 // Convert to milliseconds

console.log(`- CPU performance test: ${duration.toFixed(2)}ms`)
console.log(`- Memory usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`)

// Final recommendations
console.log("\n💡 Recommendations:")
console.log("1. Visit /debug in your browser for real-time diagnostics")
console.log("2. Check the browser console for any JavaScript errors")
console.log("3. Verify all environment variables are set correctly")
console.log("4. Test API endpoints individually if issues persist")
console.log("5. Check network connectivity for external API calls")

console.log("\n🐺 Enhanced Debug Complete")
console.log(`Timestamp: ${new Date().toISOString()}`)
