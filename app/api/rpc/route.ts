import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { procedure, params } = body

    if (!procedure) {
      return NextResponse.json({ success: false, error: "Procedure name is required" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Execute the RPC
    const { data, error } = await supabase.rpc(procedure, params || {})

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data,
      message: `Procedure ${procedure} executed successfully`,
    })
  } catch (error: any) {
    console.error("RPC API error:", error)

    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to execute procedure",
      },
      { status: 500 },
    )
  }
}
