import { NextResponse } from "next/server";
import { getAllNews } from "@/services/news.service";

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 100; // 100 requests
const RATE_LIMIT_WINDOW = 5 * 60 * 1000; // 5 minutes

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * GET /api/news
 * Get BMKG news articles
 * Query params:
 * - category: "bmkg" (only option now)
 * - refresh: "true" to force refresh cache
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const refresh = searchParams.get("refresh") === "true";

    // Simple rate limiting by IP
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // Only BMKG is supported now
    console.log(`[API /news] Fetching BMKG news - refresh: ${refresh}`);

    const news = await getAllNews(refresh);

    return NextResponse.json({
      success: true,
      news,
      count: news.length,
      cached: !refresh,
      source: "BMKG",
    });
  } catch (error) {
    console.error("[API /news] Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch BMKG news",
        news: [],
      },
      { status: 500 }
    );
  }
}
