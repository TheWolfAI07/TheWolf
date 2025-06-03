import { NextResponse } from "next/server"
import { aiInsights } from "@/lib/ai-insights"
import { logger } from "@/lib/logger"

export async function GET() {
  try {
    logger.info("Generating AI insights")

    // Generate system-wide insights
    const systemInsights = await aiInsights.generateSystemInsights()

    // Get existing insights
    const existingInsights = aiInsights.getInsights()

    // Combine and deduplicate
    const allInsights = [...systemInsights, ...existingInsights]
    const uniqueInsights = allInsights.filter(
      (insight, index, self) => index === self.findIndex((i) => i.id === insight.id),
    )

    // Sort by impact and confidence
    const sortedInsights = uniqueInsights.sort((a, b) => {
      const impactOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      const aScore = impactOrder[a.impact] * a.confidence
      const bScore = impactOrder[b.impact] * b.confidence
      return bScore - aScore
    })

    logger.info("AI insights generated", {
      count: sortedInsights.length,
      types: sortedInsights.map((i) => i.type),
    })

    return NextResponse.json({
      success: true,
      data: sortedInsights,
      message: `Generated ${sortedInsights.length} AI insights`,
    })
  } catch (error: any) {
    logger.error("Failed to generate AI insights", {
      error: error.message,
      stack: error.stack,
    })

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate AI insights",
      },
      { status: 500 },
    )
  }
}
