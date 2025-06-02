import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "overview"

    const supabase = createServerSupabaseClient()

    if (type === "overview") {
      // Get analytics data from wolf_analytics table
      const { data: analyticsData, error } = await supabase
        .from("wolf_analytics")
        .select("*")
        .order("timestamp", { ascending: false })

      if (error) throw error

      // Transform data into overview format
      const overview = analyticsData.reduce((acc: any, item) => {
        const key = item.metric_name.toLowerCase().replace(/\s+/g, "")
        acc[key] = item.metric_value
        return acc
      }, {})

      return NextResponse.json({
        success: true,
        data: overview,
        message: "Analytics overview retrieved successfully",
      })
    }

    if (type === "projects") {
      // Get projects data
      const { data: projects, error } = await supabase
        .from("wolf_projects")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error

      return NextResponse.json({
        success: true,
        data: projects,
        message: "Projects data retrieved successfully",
      })
    }

    if (type === "activities") {
      // Get recent activities
      const { data: activities, error } = await supabase
        .from("wolf_activities")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10)

      if (error) throw error

      return NextResponse.json({
        success: true,
        data: activities,
        message: "Activities retrieved successfully",
      })
    }

    return NextResponse.json(
      {
        success: false,
        message: "Invalid analytics type",
      },
      { status: 400 },
    )
  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch analytics data" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { metric_name, metric_value, category, comparison_value, comparison_label } = body

    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from("wolf_analytics")
      .insert([
        {
          metric_name,
          metric_value,
          category,
          comparison_value,
          comparison_label,
        },
      ])
      .select()

    if (error) throw error

    return NextResponse.json(
      {
        success: true,
        data: data[0],
        message: "Analytics metric created successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Analytics POST error:", error)
    return NextResponse.json({ success: false, message: "Failed to create analytics metric" }, { status: 500 })
  }
}
