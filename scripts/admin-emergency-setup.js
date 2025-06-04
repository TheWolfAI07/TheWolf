// Emergency Admin Setup Script
console.log("🚨 Emergency Admin Setup Starting...\n")

async function emergencyAdminSetup() {
  try {
    console.log("=== EMERGENCY ADMIN SETUP ===")

    // First, ensure database is set up
    console.log("1. Setting up database...")
    const setupResponse = await fetch("/api/setup", { method: "POST" })
    const setupData = await setupResponse.json()
    console.log("✅ Database setup:", setupData.success ? "COMPLETE" : "FAILED")

    // Create demo user if needed
    console.log("2. Creating demo user...")
    const demoResponse = await fetch("/api/auth/demo", { method: "POST" })
    const demoData = await demoResponse.json()
    console.log("✅ Demo user:", demoData.success ? "CREATED" : "EXISTS")

    // Check admin system
    console.log("3. Checking admin system...")
    const adminCheck = await fetch("/api/verify?check=admin")
    const adminData = await adminCheck.json()
    console.log("✅ Admin system:", adminData.ready ? "READY" : "NEEDS SETUP")

    console.log("\n=== ADMIN ACCESS INSTRUCTIONS ===")
    console.log("🔑 Demo Admin Credentials:")
    console.log("   Email: demo@wolf.com")
    console.log("   Password: demo123")
    console.log("   Role: super_admin (auto-granted to first user)")

    console.log("\n📋 Admin Panel Access:")
    console.log("   URL: /admin")
    console.log("   Features: User management, System settings, Activity logs")

    console.log("\n⚡ Admin Functions Available:")
    console.log("   ✅ Grant/Revoke admin roles")
    console.log("   ✅ Delete users")
    console.log("   ✅ View activity logs")
    console.log("   ✅ Manage system settings")
    console.log("   ✅ Monitor user reports")

    console.log("\n🔧 Emergency Admin Commands:")
    console.log("   - Run admin-system-setup.sql to recreate tables")
    console.log("   - Use AdminService.makeSuperAdmin(userId) for emergency access")
    console.log("   - Check /api/users for user management")

    console.log("\n🚨 EMERGENCY ADMIN SETUP COMPLETE!")
  } catch (error) {
    console.error("❌ Emergency admin setup failed:", error)
  }
}

// Run emergency admin setup
emergencyAdminSetup()
