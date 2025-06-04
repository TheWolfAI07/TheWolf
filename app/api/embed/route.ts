import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse, type NextRequest } from "next/server"
import Groq from "groq-sdk"

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { text, userId } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    const supabase = createRouteHandlerClient({ cookies })

    // Verify user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session || (userId && session.user.id !== userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get embeddings from Groq
    const embeddings = await groq.embeddings.create({
      model: "llama-3-embedding-v1",
      input: text,
    })

    return NextResponse.json({
      embedding: embeddings.data[0].embedding,
    })
  } catch (error: any) {
    console.error("Embedding generation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
