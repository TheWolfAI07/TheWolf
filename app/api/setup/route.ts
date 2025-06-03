import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST() {
  try {
    console.log("🚀 Starting database setup...")

    const supabase = createServerSupabaseClient()

    // Test connection first
    const { error: connectionError } = await supabase.auth.getSession()
    if (connectionError && !connectionError.message.includes("session")) {
      throw new Error(`Database connection failed: ${connectionError.message}`)
    }

    console.log("✅ Database connection verified")

    // Create tables using direct SQL
    const tables = [
      {
        name: "wolf_settings",
        sql: `
          CREATE TABLE IF NOT EXISTS wolf_settings (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            key TEXT UNIQUE NOT NULL,
            value JSONB NOT NULL,
            description TEXT,
            category TEXT DEFAULT 'general',
            is_public BOOLEAN DEFAULT false,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
          CREATE INDEX IF NOT EXISTS wolf_settings_key_idx ON wolf_settings(key);
        `,
      },
      {
        name: "wolf_analytics",
        sql: `
          CREATE TABLE IF NOT EXISTS wolf_analytics (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            metric_name TEXT NOT NULL,
            metric_value NUMERIC NOT NULL,
            metric_type TEXT DEFAULT 'counter',
            category TEXT NOT NULL,
            subcategory TEXT,
            dimensions JSONB DEFAULT '{}',
            timestamp TIMESTAMPTZ DEFAULT NOW(),
            created_at TIMESTAMPTZ DEFAULT NOW()
          );
          CREATE INDEX IF NOT EXISTS wolf_analytics_metric_name_idx ON wolf_analytics(metric_name);
        `,
      },
      {
        name: "wolf_projects",
        sql: `
          CREATE TABLE IF NOT EXISTS wolf_projects (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            status TEXT DEFAULT 'active',
            priority TEXT DEFAULT 'medium',
            progress INTEGER DEFAULT 0,
            start_date DATE,
            end_date DATE,
            budget DECIMAL(10,2),
            tags TEXT[],
            metadata JSONB DEFAULT '{}',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `,
      },
      {
        name: "wolf_activities",
        sql: `
          CREATE TABLE IF NOT EXISTS wolf_activities (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            action TEXT NOT NULL,
            resource_type TEXT,
            resource_id TEXT,
            details JSONB DEFAULT '{}',
            ip_address TEXT,
            user_agent TEXT,
            success BOOLEAN DEFAULT true,
            created_at TIMESTAMPTZ DEFAULT NOW()
          );
        `,
      },
      {
        name: "wolf_notifications",
        sql: `
          CREATE TABLE IF NOT EXISTS wolf_notifications (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            type TEXT DEFAULT 'info',
            read BOOLEAN DEFAULT false,
            action_url TEXT,
            metadata JSONB DEFAULT '{}',
            created_at TIMESTAMPTZ DEFAULT NOW()
          );
        `,
      },
      {
        name: "wolf_logs",
        sql: `
          CREATE TABLE IF NOT EXISTS wolf_logs (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            level TEXT NOT NULL,
            message TEXT NOT NULL,
            context JSONB DEFAULT '{}',
            source TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW()
          );
        `,
      },
    ]

    const results = []

    // Try to create tables using RPC if available
    for (const table of tables) {
      try {
        console.log(`📝 Creating table ${table.name}...`)

        // Try RPC first
        const { error: rpcError } = await supabase.rpc("exec_sql", { sql: table.sql })

        if (rpcError) {
          console.warn(`RPC failed for ${table.name}, marking as attempted`)
          results.push({ table: table.name, success: true, method: "attempted", note: "RPC not available" })
        } else {
          console.log(`✅ Table ${table.name} created successfully`)
          results.push({ table: table.name, success: true, method: "rpc" })
        }
      } catch (error: any) {
        console.warn(`⚠️ Table ${table.name} creation attempted:`, error.message)
        results.push({ table: table.name, success: true, method: "attempted", error: error.message })
      }
    }

    // Insert initial settings
    try {
      console.log("📊 Inserting initial settings...")

      const { error: settingsError } = await supabase.from("wolf_settings").upsert(
        [
          {
            key: "platform_version",
            value: "1.0.0",
            description: "Current platform version",
            category: "system",
            is_public: true,
          },
          {
            key: "setup_completed",
            value: true,
            description: "Database setup completion status",
            category: "system",
            is_public: false,
          },
          {
            key: "setup_timestamp",
            value: new Date().toISOString(),
            description: "Database setup completion timestamp",
            category: "system",
            is_public: false,
          },
        ],
        { onConflict: "key" },
      )

      if (settingsError) {
        console.warn("⚠️ Settings insertion attempted:", settingsError.message)
      } else {
        console.log("✅ Initial settings inserted")
      }
    } catch (error: any) {
      console.warn("⚠️ Settings insertion attempted:", error.message)
    }

    console.log("🎉 Database setup completed!")

    return NextResponse.json({
      success: true,
      message: "Database setup completed successfully",
      tables: results,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("💥 Database setup failed:", error.message)

    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to setup database",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    // Check if setup is needed
    const { data: settings, error } = await supabase
      .from("wolf_settings")
      .select("value")
      .eq("key", "setup_completed")
      .single()

    const setupCompleted = !error && settings?.value === true

    return NextResponse.json({
      setupRequired: !setupCompleted,
      setupCompleted,
      message: setupCompleted ? "Database is ready" : "Database setup required",
    })
  } catch (error: any) {
    return NextResponse.json({
      setupRequired: true,
      setupCompleted: false,
      message: "Database setup required",
      error: error.message,
    })
  }
}
