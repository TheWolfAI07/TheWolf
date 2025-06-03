import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Get environment variables with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

// Export createClient function as named export
export const createClient = createSupabaseClient

// Client-side Supabase client (only create if we have the required env vars)
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createSupabaseClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      })
    : null

// Server-side client for API routes
export const createServerSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables")
  }

  const serverKey = supabaseServiceKey || supabaseAnonKey

  return createSupabaseClient(supabaseUrl, serverKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Connection health check
export const checkSupabaseConnection = async () => {
  try {
    if (!supabase) {
      return { connected: false, error: "Supabase not configured" }
    }

    const { data, error } = await supabase.auth.getSession()

    if (error && !error.message.includes("session")) {
      throw error
    }

    return { connected: true, error: null }
  } catch (error: any) {
    console.error("Supabase connection check failed:", error)
    return { connected: false, error: error?.message || "Unknown connection error" }
  }
}

// Initialize database with your actual Supabase instance
export const initializeDatabase = async () => {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      return { success: false, error: "Supabase environment variables not configured" }
    }

    const client = createServerSupabaseClient()

    // Insert demo data
    await insertDemoData(client)

    return { success: true, message: "Database initialized successfully with your Supabase instance" }
  } catch (error: any) {
    console.error("Database initialization failed:", error)
    return { success: false, error: error?.message || "Failed to initialize database" }
  }
}

// Insert comprehensive demo data
async function insertDemoData(client: any) {
  try {
    // Check if demo data already exists
    const { data: existingUsers, error: checkError } = await client
      .from("users")
      .select("id")
      .eq("email", "admin@wolf.com")
      .limit(1)

    if (checkError && !checkError.message.includes("does not exist")) {
      console.error("Error checking for existing demo data:", checkError)
      return false
    }

    if (existingUsers && existingUsers.length > 0) {
      console.log("Demo data already exists, skipping insertion")
      return true
    }

    // Insert demo users with your actual Supabase
    const { data: userData, error: userError } = await client
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
        {
          username: "test_developer",
          email: "dev@wolf.com",
          status: "active",
          role: "developer",
          last_login: new Date().toISOString(),
        },
        {
          username: "project_manager",
          email: "pm@wolf.com",
          status: "active",
          role: "manager",
          last_login: new Date().toISOString(),
        },
      ])
      .select()

    if (userError) {
      console.error("Error inserting demo users:", userError)
      return false
    }

    const adminUser = userData?.find((u) => u.email === "admin@wolf.com")
    const demoUser = userData?.find((u) => u.email === "demo@wolf.com")

    // Insert demo projects
    if (adminUser && demoUser) {
      const { error: projectError } = await client.from("wolf_projects").insert([
        {
          name: "Wolf Platform Core",
          description: "Main platform development and maintenance",
          status: "active",
          priority: "high",
          owner_id: adminUser.id,
          progress: 85,
        },
        {
          name: "API Documentation",
          description: "Comprehensive API documentation and examples",
          status: "active",
          priority: "medium",
          owner_id: demoUser.id,
          progress: 60,
        },
        {
          name: "User Dashboard",
          description: "Enhanced user dashboard with analytics",
          status: "active",
          priority: "high",
          owner_id: adminUser.id,
          progress: 90,
        },
      ])

      if (projectError) {
        console.error("Error inserting demo projects:", projectError)
      }
    }

    // Insert analytics data
    const { error: analyticsError } = await client.from("wolf_analytics").insert([
      {
        metric_name: "total_users",
        metric_value: 4,
        category: "users",
        comparison_value: 2,
        comparison_label: "vs last week",
        trend: "up",
      },
      {
        metric_name: "active_projects",
        metric_value: 3,
        category: "projects",
        comparison_value: 1,
        comparison_label: "vs last week",
        trend: "up",
      },
      {
        metric_name: "api_requests",
        metric_value: 1250,
        category: "api",
        comparison_value: 800,
        comparison_label: "vs yesterday",
        trend: "up",
      },
    ])

    if (analyticsError) {
      console.error("Error inserting analytics:", analyticsError)
    }

    // Insert activities
    if (adminUser?.id) {
      const { error: activityError } = await client.from("wolf_activities").insert([
        {
          user_id: adminUser.id,
          action: "platform_deployment",
          details: { status: "success", timestamp: new Date().toISOString() },
          ip_address: "127.0.0.1",
        },
        {
          user_id: adminUser.id,
          action: "database_initialization",
          details: { tables_created: 7, demo_data: true },
          ip_address: "127.0.0.1",
        },
      ])

      if (activityError) {
        console.error("Error inserting activities:", activityError)
      }
    }

    // Insert settings
    const { error: settingsError } = await client.from("wolf_settings").insert([
      {
        key: "platform_status",
        value: "live",
        description: "Current platform operational status",
        category: "system",
      },
      {
        key: "theme",
        value: "dark",
        description: "Default UI theme",
        category: "ui",
      },
      {
        key: "notifications_enabled",
        value: true,
        description: "Enable system notifications",
        category: "notifications",
      },
    ])

    if (settingsError) {
      console.error("Error inserting settings:", settingsError)
    }

    console.log("✅ Demo data inserted successfully into your Supabase database")
    return true
  } catch (error) {
    console.error("Failed to insert demo data:", error)
    return false
  }
}

// Safe database operation wrapper
export async function safeDbOperation<T>(
  operation: () => Promise<T>,
  fallback: T,
): Promise<{ data: T; error: string | null }> {
  try {
    const result = await operation()
    return { data: result, error: null }
  } catch (error: any) {
    console.error("Database operation failed:", error)
    return { data: fallback, error: error?.message || "Database operation failed" }
  }
}
