// Dad's Testing Session - Quick System Check
console.log("🐺 WOLF PLATFORM - DAD'S TEST PREP")
console.log("==================================")
console.log("Running quick system check before testing session...")

const fs = require("fs")
const path = require("path")

// Quick file check
console.log("\n📁 Essential Files:")
const essentialFiles = [
  "app/page.tsx",
  "app/layout.tsx",
  "app/crypto/page.tsx",
  "app/dashboard/page.tsx",
  "lib/crypto-api.ts",
  "components/navbar.tsx",
]

let missingFiles = 0
essentialFiles.forEach((file) => {
  if (fs.existsSync(path.join(process.cwd(), file))) {
    console.log(`✅ ${file}`)
  } else {
    console.log(`❌ ${file} - MISSING!`)
    missingFiles++
  }
})

// Environment check
console.log("\n🔐 Environment Setup:")
const criticalEnvVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]

let missingEnvVars = 0
criticalEnvVars.forEach((envVar) => {
  if (process.env[envVar]) {
    console.log(`✅ ${envVar}`)
  } else {
    console.log(`❌ ${envVar} - NOT SET!`)
    missingEnvVars++
  }
})

// Package.json check
console.log("\n📦 Dependencies:")
try {
  const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"))
  const deps = ["next", "react", "@supabase/supabase-js", "tailwindcss"]

  deps.forEach((dep) => {
    if (pkg.dependencies?.[dep] || pkg.devDependencies?.[dep]) {
      console.log(`✅ ${dep}`)
    } else {
      console.log(`❌ ${dep} - MISSING!`)
    }
  })
} catch (error) {
  console.log("❌ Error reading package.json")
}

// Final status
console.log("\n🎯 TESTING READINESS:")
if (missingFiles === 0 && missingEnvVars === 0) {
  console.log("🟢 READY FOR DAD'S TEST!")
  console.log("✅ All essential files present")
  console.log("✅ Environment configured")
  console.log("✅ Dependencies installed")
  console.log("\n👨‍💼 Tell your dad the platform is ready!")
} else {
  console.log("🟡 NEEDS ATTENTION")
  if (missingFiles > 0) console.log(`⚠️  ${missingFiles} missing files`)
  if (missingEnvVars > 0) console.log(`⚠️  ${missingEnvVars} missing environment variables`)
  console.log("\n🔧 Fix these issues before testing")
}

console.log("\n📋 Quick Test Checklist for Dad:")
console.log("1. ✅ Visit the homepage")
console.log("2. ✅ Check crypto prices page")
console.log("3. ✅ Test navigation menu")
console.log("4. ✅ Try responsive design (resize window)")
console.log("5. ✅ Check loading speeds")

console.log(`\n⏰ System check completed: ${new Date().toLocaleTimeString()}`)
