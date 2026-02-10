import { NextResponse } from "next/server";
import { getLeaderboard, getUserRank } from "@/services/gamification.service";
import { getSession } from "@/lib/auth";

// GET /api/gamification/leaderboard - Get leaderboard
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const district = searchParams.get("district") || undefined;

    const leaderboard = await getLeaderboard({ limit, offset, district });

    // Get current user's rank if authenticated
    let userRank = null;
    const session = await getSession();
    if (session) {
      userRank = await getUserRank(session.userId);
    }

    return NextResponse.json({
      ...leaderboard,
      userRank,
    });
  } catch (error) {
    console.error("[Leaderboard API] Error:", error);
    return NextResponse.json(
      { error: "Failed to get leaderboard" },
      { status: 500 }
    );
  }
}
