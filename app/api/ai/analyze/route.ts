import { NextRequest, NextResponse } from "next/server";
import { analyzeAirQuality, DeviceData } from "@/services/ai.service";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface AnalyzeResponse {
  status: string;
  headline: string;
  targetGroups?: string;
  analysis: {
    meaningForCitizens: string;
    actionRequired: string;
    safetySteps: string;
  };
  confidence?: number;
  usage?: {
    tokenUsage: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
    cost: string;
  };
}

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // 10 requests per minute
const RATE_WINDOW = 60 * 1000;

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT) {
    return false;
  }

  userLimit.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Please login first." },
        { status: 401 }
      );
    }

    // Rate limiting
    if (!checkRateLimit(session.userId)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Max 10 requests per minute." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const deviceData: DeviceData = {
      timestamp: body.timestamp,
      pm25Raw: body.pm25Raw,
      pm25Density: body.pm25Density,
      pm10Density: body.pm10Density,
      airQualityLevel: body.airQualityLevel,
      temperature: body.temperature,
      humidity: body.humidity,
      pressure: body.pressure,
      deviceId: body.deviceId,
      location: body.location || "Bandung, Indonesia",
    };

    // Analyze with AI
    const analysis = await analyzeAirQuality(deviceData);

    // Save usage to database (skip if table doesn't exist yet)
    try {
      if (prisma.aIUsageLog) {
        await prisma.aIUsageLog.create({
          data: {
            userId: session.userId,
            model: analysis.model,
            promptTokens: analysis.tokenUsage.promptTokens,
            completionTokens: analysis.tokenUsage.completionTokens,
            totalTokens: analysis.tokenUsage.totalTokens,
            cost: analysis.cost,
          },
        });
      }
    } catch (dbError) {
      console.error("[AI Analyze] Failed to save usage log:", dbError);
      // Don't fail the request if logging fails
    }

    // Response structure
    const response: AnalyzeResponse = {
      status: analysis.status,
      headline: analysis.headline,
      targetGroups: analysis.targetGroups,
      analysis: {
        meaningForCitizens: analysis.meaningForCitizens,
        actionRequired: analysis.actionRequired,
        safetySteps: analysis.safetySteps,
      },
      confidence: analysis.confidence,
    };

    // Add usage info for admin only
    if (session.role === "ADMIN") {
      response.usage = {
        tokenUsage: analysis.tokenUsage,
        cost: `$${analysis.cost.toFixed(6)}`,
      };
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("[AI Analyze] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to analyze air quality",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
