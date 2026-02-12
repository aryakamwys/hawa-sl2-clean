import { NextResponse } from "next/server";
import { getAllNews } from "@/services/news.service";
import { getSession } from "@/lib/auth";

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
 * Get air quality news from multiple sources
 * Query params:
 * - refresh: "true" to force refresh cache
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const refresh = searchParams.get("refresh") === "true";

    // Try to get user's language preference
    let language: "EN" | "ID" = "EN";  // DEFAULT EN
    try {
      const session = await getSession();
      if (session) {
        const userRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/me`, {
          headers: {
            cookie: req.headers.get('cookie') || '',
          },
        });
        const userData = await userRes.json();
        language = (userData.user?.language as "EN" | "ID") || "EN";
      }
    } catch {
      // Use default EN if can't get user language
    }

    // Simple rate limiting by IP
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    console.log(`[API /news] Fetching air quality news - refresh: ${refresh}, language: ${language}`);

    const news = await getAllNews(refresh, language);

    return NextResponse.json({
      success: true,
      news,
      count: news.length,
      cached: !refresh,
      source: "multi",
      language,
    });
  } catch (error) {
    console.error("[API /news] Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch news",
        news: [],
      },
      { status: 500 }
    );
  }
}
