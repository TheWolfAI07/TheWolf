// Database Connection Setup Script
console.log("🔍 Checking database connection requirements...")

// Check environment variables
const requiredVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"]

console.log("📋 Required Environment Variables:")
requiredVars.forEach((varName) => {
  const value = process.env[varName]
  console.log(`${varName}: ${value ? "✅ Set" : "❌ Missing"}`)
  if (value) {
    console.log(`  Value: ${value.substring(0, 20)}...`)
  }
})

// Test connection if variables are present
if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.log("\n🔗 Testing database connection...")

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    console.log(`Database URL: ${supabaseUrl}`)
    console.log(`Key present: ${supabaseKey ? "Yes" : "No"}`)

    // Test basic connectivity
    fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    })
      .then((response) => {
        if (response.ok) {
          console.log("✅ Database connection successful!")
          console.log("🚀 Ready to run SQL scripts")
        } else {
          console.log("❌ Database connection failed")
          console.log(`Status: ${response.status}`)
        }
      })
      .catch((error) => {
        console.log("❌ Connection test failed:", error.message)
      })
  } catch (error) {
    console.log("❌ Connection setup error:", error.message)
  }
} else {
  console.log("\n❌ Cannot test connection - missing environment variables")
  console.log("\n📝 Next steps:")
  console.log("1. Set up Supabase integration")
  console.log("2. Add environment variables")
  console.log("3. Run this script again")
}
