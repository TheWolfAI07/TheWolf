import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    console.log("Creating demo user via API...")

    // Check if demo user already exists
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("email", "demo@wolf.com")
      .single()

    if (existingUser) {
      return NextResponse.json({
        success: true,
        message: "Demo user already exists",
        user: existingUser,
      })
    }

    // Create demo user
    const { data, error } = await supabase.auth.admin.createUser({
      email: "demo@wolf.com",
      password: "demo123",
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: "Demo User",
      },
    })

    if (error) {
      console.error("Demo user creation error:", error)
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 400 },
      )
    }

    console.log("Demo user created successfully:", data.user?.email)

    return NextResponse.json({
      success: true,
      message: "Demo user created successfully",
      user: data.user,
    })
  } catch (error: any) {
    console.error("Demo user API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    // Check demo user status
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, email, full_name, created_at")
      .eq("email", "demo@wolf.com")
      .single()

    if (!profile) {
      return NextResponse.json({
        exists: false,
        message: "Demo user does not exist",
      })
    }

    return NextResponse.json({
      exists: true,
      message: "Demo user exists",
      profile,
    })
  } catch (error: any) {
    console.error("Demo user check error:", error)
    return NextResponse.json(
      {
        exists: false,
        error: error.message,
      },
      { status: 500 },
    )
  }
}
