import { NextResponse } from "next/server"
import { streamText } from "ai"
import { groq } from "@ai-sdk/groq"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const { message } = await request.json()

    if (!message) {
      return NextResponse.json({ success: false, error: "Message is required" }, { status: 400 })
    }

    // Use Groq for AI responses
    const { text } = await streamText({
      model: groq("llama-3.1-70b-versatile"),
      prompt: `You are Wolf AI, an intelligent assistant for the Wolf Platform. 
      
      User message: ${message}
      
      Respond helpfully and concisely. If the user asks about platform features, explain what the Wolf Platform can do:
      - Dashboard analytics and monitoring
      - Project management
      - User authentication and profiles  
      - Real-time chat and notifications
      - Database management
      - API endpoints and integrations
      - Edge Functions for serverless computing
      
      Keep responses under 200 words and be friendly but professional.`,
    })

    // Save chat message to database
    try {
      const supabase = createServerSupabaseClient()
      await supabase.from("wolf_chat_messages").insert([
        {
          message,
          response: text,
          metadata: { timestamp: new Date().toISOString() },
        },
      ])
    } catch (dbError) {
      console.error("Failed to save chat message:", dbError)
    }

    return NextResponse.json({
      success: true,
      data: {
        id: Date.now().toString(),
        type: "ai",
        message: text,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error: any) {
    console.error("Chat API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Chat failed",
      },
      { status: 500 },
    )
  }
}
