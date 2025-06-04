import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import Groq from "groq-sdk"
import { Redis } from "@upstash/redis"

// Initialize GROQ with your API key
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

// Initialize Redis with your Upstash credentials
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export async function POST(request: NextRequest) {
  try {
    const { message, userId } = await request.json()

    if (!message || !userId) {
      return NextResponse.json({ error: "Message and userId are required" }, { status: 400 })
    }

    const supabase = createRouteHandlerClient({ cookies })

    // Verify user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session || session.user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check Redis cache first
    const cacheKey = `chat:${userId}:${Buffer.from(message).toString("base64").slice(0, 20)}`
    const cachedResponse = await redis.get(cacheKey)

    if (cachedResponse) {
      console.log("Cache hit for message")
      return NextResponse.json(cachedResponse)
    }

    // Get recent conversation context from Supabase
    const { data: recentMessages } = await supabase
      .from("chat_messages")
      .select("content, role")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10)

    const conversationHistory = recentMessages?.reverse() || []

    // Generate AI response using GROQ
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a helpful AI assistant. Be concise, friendly, and informative. Provide helpful and accurate responses.",
        },
        ...conversationHistory.map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        })),
        {
          role: "user",
          content: message,
        },
      ],
      model: "llama-3.1-70b-versatile",
      temperature: 0.7,
      max_tokens: 1000,
    })

    const aiResponse = completion.choices[0]?.message?.content || "Sorry, I could not generate a response."

    // Save both messages to Supabase database
    const { data: userMessage, error: userError } = await supabase
      .from("chat_messages")
      .insert({
        user_id: userId,
        content: message,
        role: "user",
      })
      .select()
      .single()

    if (userError) throw userError

    const { data: aiMessage, error: aiError } = await supabase
      .from("chat_messages")
      .insert({
        user_id: userId,
        content: aiResponse,
        role: "assistant",
      })
      .select()
      .single()

    if (aiError) throw aiError

    const response = {
      userMessage,
      aiMessage,
    }

    // Cache the response in Redis for 1 hour
    await redis.set(cacheKey, response, { ex: 3600 })

    return NextResponse.json(response)
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
