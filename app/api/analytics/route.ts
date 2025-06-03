import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "overview"

    const supabase = createServerSupabaseClient()

    if (type === "overview") {
      // Get overview analytics from your Supabase
      const { data: analytics, error } = await supabase
        .from("wolf_analytics")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Analytics API error:", error)
        return NextResponse.json(
          {
            success: false,
            error: error.message,
            message: "Failed to fetch analytics from your Supabase database",
          },
          { status: 500 },
        )
      }

      // Get user count
      const { count: userCount } = await supabase.from("users").select("*", { count: "exact", head: true })

      // Get project count
      const { count: projectCount } = await supabase.from("wolf_projects").select("*", { count: "exact", head: true })

      // Get recent activities
      const { data: activities } = await supabase
        .from("wolf_activities")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10)

      return NextResponse.json({
        success: true,
        data: {
          metrics: analytics || [],
          summary: {
            totalUsers: userCount || 0,
            totalProjects: projectCount || 0,
            recentActivities: activities || [],
          },
          activeSessions: Math.floor(Math.random() * 50) + 10, // Simulated for demo
        },
        message: "Analytics data retrieved from your Supabase database",
      })
    }

    return NextResponse.json({
      success: true,
      data: [],
      message: "Analytics type not implemented yet",
    })
  } catch (error: any) {
    console.error("Analytics API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Unknown error",
        message: "Failed to connect to your Supabase database",
      },
      { status: 500 },
    )
  }
}
