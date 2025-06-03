import type { NextRequest } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

// WebSocket-like functionality using Server-Sent Events
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type") || "general"

  // Create a readable stream for Server-Sent Events
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()

      // Send initial connection message
      const initialData = {
        type: "connection",
        message: "Connected to Wolf Console",
        timestamp: new Date().toISOString(),
      }

      controller.enqueue(encoder.encode(`data: ${JSON.stringify(initialData)}\n\n`))

      // Set up periodic updates
      const interval = setInterval(async () => {
        try {
          const supabase = createServerSupabaseClient()

          if (type === "system") {
            // Send system metrics
            const metrics = await getSystemMetrics(supabase)
            const data = {
              type: "system_update",
              data: metrics,
              timestamp: new Date().toISOString(),
            }
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
          }

          if (type === "logs") {
            // Send recent logs
            const logs = await getRecentLogs(supabase)
            const data = {
              type: "logs_update",
              data: logs,
              timestamp: new Date().toISOString(),
            }
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
          }
        } catch (error) {
          console.error("WebSocket update error:", error)
        }
      }, 5000) // Update every 5 seconds

      // Clean up on close
      request.signal.addEventListener("abort", () => {
        clearInterval(interval)
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
    },
  })
}

async function getSystemMetrics(supabase: any) {
  try {
    const { count: userCount } = await supabase.from("users").select("*", { count: "exact", head: true })

    const { count: projectCount } = await supabase.from("wolf_projects").select("*", { count: "exact", head: true })

    return {
      users: userCount || 0,
      projects: projectCount || 0,
      uptime: "99.9%",
      memory: Math.floor(Math.random() * 30) + 40, // Simulated
      cpu: Math.floor(Math.random() * 20) + 10, // Simulated
    }
  } catch (error) {
    return {
      users: 0,
      projects: 0,
      uptime: "Unknown",
      memory: 0,
      cpu: 0,
    }
  }
}

async function getRecentLogs(supabase: any) {
  try {
    const { data: logs } = await supabase
      .from("wolf_function_logs")
      .select("*")
      .order("executed_at", { ascending: false })
      .limit(5)

    return logs || []
  } catch (error) {
    return []
  }
}
