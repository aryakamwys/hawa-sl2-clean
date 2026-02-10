import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { generateBulkFillInTheBlank } from "@/services/quiz-ai.service";
import { prisma } from "@/lib/prisma";

// POST /api/gamification/quiz/generate-bulk - Generate 10 fill-in-the-blank questions
export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile to check age group
    const profile = await prisma.userProfile.findUnique({
      where: { userId: session.userId },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const difficulty = (searchParams.get("difficulty") || "MEDIUM") as "EASY" | "MEDIUM" | "HARD";

    // Generate 10 quiz questions based on user's age group
    const questions = await generateBulkFillInTheBlank(difficulty, profile.ageGroup);

    // Calculate total XP
    const totalXP = questions.reduce((sum, q) => sum + q.xpReward, 0);

    return NextResponse.json({
      questions,
      totalXP,
      ageGroup: profile.ageGroup,
      difficulty,
    });
  } catch (error) {
    console.error("[Bulk Quiz API] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate quiz" },
      { status: 500 }
    );
  }
}
