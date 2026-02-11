import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { generateQuiz, getQuizXP, getQuizTimeLimit } from "@/services/quiz-ai.service";
import { prisma } from "@/lib/prisma";

// POST /api/gamification/quiz/generate - Generate a new quiz question
export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile with language
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

    // Get query params
    const { searchParams } = new URL(request.url);
    const difficulty = (searchParams.get("difficulty") || "MEDIUM") as "EASY" | "MEDIUM" | "HARD";
    const language = (user?.language as "EN" | "ID") || "EN";

    // Generate quiz based on user's age group and language
    const quiz = await generateQuiz(difficulty, profile.ageGroup, language);

    return NextResponse.json({
      question: quiz.question,
      options: quiz.options,
      correctAnswer: quiz.correctAnswer,
      explanation: quiz.explanation,
      category: quiz.category,
      difficulty,
      xpReward: getQuizXP(difficulty),
      timeLimit: getQuizTimeLimit(difficulty),
      ageGroup: profile.ageGroup,
      language,
    });
  } catch (error) {
    console.error("[Quiz API] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate quiz" },
      { status: 500 }
    );
  }
}
