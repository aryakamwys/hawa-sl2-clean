import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  getUserLevel,
  processDailyLogin,
  getLevelTitle,
  getLevelFromXP,
} from "@/services/gamification.service";

// GET /api/gamification/level - Get current user level
export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userLevel = await getUserLevel(session.userId);

    return NextResponse.json({
      xp: userLevel.xp,
      level: userLevel.level,
      title: getLevelTitle(userLevel.level),
      streak: userLevel.streak,
      lastLogin: userLevel.lastLogin,
      progressToNext: getProgressToNextLevel(userLevel.xp, userLevel.level),
    });
  } catch (error) {
    console.error("[Level API] Error:", error);
    return NextResponse.json(
      { error: "Failed to get user level" },
      { status: 500 }
    );
  }
}

// POST /api/gamification/level/check-in - Process daily login
export async function POST() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await processDailyLogin(session.userId);

    return NextResponse.json({
      xpEarned: result.xpEarned,
      streak: result.streak,
      leveledUp: result.leveledUp,
      newLevel: result.newLevel,
      newTitle: getLevelTitle(result.newLevel),
    });
  } catch (error) {
    console.error("[Level API] Error:", error);
    return NextResponse.json(
      { error: "Failed to process check-in" },
      { status: 500 }
    );
  }
}

function getProgressToNextLevel(xp: number, currentLevel: number): {
  current: number;
  needed: number;
  percentage: number;
} {
  const currentLevelXP = getXPForLevel(currentLevel);
  const nextLevelXP = getXPForLevel(currentLevel + 1);
  const current = xp - currentLevelXP;
  const needed = nextLevelXP - currentLevelXP;
  const percentage = Math.min(100, Math.max(0, (current / needed) * 100));

  return { current, needed, percentage };
}

function getXPForLevel(level: number): number {
  if (level === 1) return 0;
  if (level <= 10) return (level - 1) * 100;
  if (level <= 20) return 900 + (level - 10) * 200;
  if (level <= 30) return 2900 + (level - 20) * 300;
  return 5900 + (level - 30) * 500;
}
