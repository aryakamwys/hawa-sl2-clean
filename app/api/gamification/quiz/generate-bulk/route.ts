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

    const [profile, user] = await Promise.all([
      prisma.userProfile.findUnique({
        where: { userId: session.userId },
      }),
      prisma.user.findUnique({
        where: { id: session.userId },
        select: { language: true },
      }),
    ]);

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const difficulty = (searchParams.get("difficulty") || "MEDIUM") as "EASY" | "MEDIUM" | "HARD";
    // Prioritize query param language, then user profile language, then default to EN
    const langParam = searchParams.get("lang")?.toUpperCase();
    const language = (langParam === "ID" || langParam === "EN" ? langParam : (user?.language as "EN" | "ID") || "EN");

    const questions = await generateBulkFillInTheBlank({ difficulty, ageGroup: profile.ageGroup, language });
    const totalXP = questions.reduce((sum, q) => sum + q.xpReward, 0);

    return NextResponse.json({
      questions,
      totalXP,
      ageGroup: profile.ageGroup,
      difficulty,
      language,
    });
  } catch (error) {
    console.error("[Bulk Quiz API] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate quiz" },
      { status: 500 }
    );
  }
}
