import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check if environment variables are configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({
        success: false,
        error: "Supabase environment variables not configured",
        message: "Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY",
      })
    }

    const { createClient } = await import("@supabase/supabase-js")
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    )

    // Test connection first
    const { error: connectionError } = await supabase.auth.getSession()
    if (connectionError && !connectionError.message.includes("session")) {
      return NextResponse.json({
        success: false,
        error: "Database connection failed",
        details: connectionError.message,
      })
    }

    // Check if tables already exist
    const tables = [
      "users",
      "wolf_projects",
      "wolf_analytics",
      "wolf_activities",
      "wolf_settings",
      "wolf_chat_messages",
      "wolf_function_logs",
    ]
    const existingTables = []

    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select("count(*)", { count: "exact", head: true })
        if (!error) {
          existingTables.push(table)
        }
      } catch (error) {
        // Table doesn't exist
      }
    }

    if (existingTables.length === tables.length) {
      return NextResponse.json({
        success: true,
        message: "Database already set up",
        existingTables,
      })
    }

    // Insert demo data if tables exist
    if (existingTables.length > 0) {
      await insertDemoData(supabase)
    }

    return NextResponse.json({
      success: true,
      message: "Database setup completed successfully",
      tablesFound: existingTables,
      note: "If tables are missing, please create them manually in your Supabase dashboard using the SQL from database-setup.sql",
    })
  } catch (error: any) {
    console.error("Setup error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Setup failed",
      },
      { status: 500 },
    )
  }
}

async function insertDemoData(supabase: any) {
  try {
    // Check if demo data already exists
    const { data: existingUsers } = await supabase.from("users").select("id").eq("email", "admin@wolf.com").limit(1)

    if (existingUsers && existingUsers.length > 0) {
      return { success: true, message: "Demo data already exists" }
    }

    // Insert demo users
    const { data: userData, error: userError } = await supabase
      .from("users")
      .insert([
        {
          username: "wolf_admin",
          email: "admin@wolf.com",
          status: "active",
          role: "admin",
          last_login: new Date().toISOString(),
        },
        {
          username: "demo_user",
          email: "demo@wolf.com",
          status: "active",
          role: "user",
          last_login: new Date().toISOString(),
        },
      ])
      .select()

    if (userError) {
      console.error("Error inserting demo users:", userError)
      return { success: false, error: userError.message }
    }

    // Insert other demo data
    const adminUser = userData?.find((u) => u.email === "admin@wolf.com")

    if (adminUser) {
      // Insert demo projects
      await supabase.from("wolf_projects").insert([
        {
          name: "Wolf Platform Core",
          description: "Main platform development",
          status: "active",
          priority: "high",
          owner_id: adminUser.id,
          progress: 85,
        },
      ])

      // Insert demo analytics
      await supabase.from("wolf_analytics").insert([
        {
          metric_name: "total_users",
          metric_value: 2,
          category: "users",
          trend: "up",
        },
      ])
    }

    return { success: true, message: "Demo data inserted successfully" }
  } catch (error: any) {
    console.error("Demo data insertion failed:", error)
    return { success: false, error: error.message }
  }
}
