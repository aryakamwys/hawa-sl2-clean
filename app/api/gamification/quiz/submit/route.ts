import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { addXP, XP_REWARDS } from "@/services/gamification.service";
import { prisma } from "@/lib/prisma";

// POST /api/gamification/quiz/submit - Submit quiz answer
export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { question, options, correctAnswer, userAnswer, difficulty, category } = body;

    if (userAnswer === undefined || typeof userAnswer !== "number") {
      return NextResponse.json(
        { error: "Invalid user answer" },
        { status: 400 }
      );
    }

    const isCorrect = userAnswer === correctAnswer;

    // Calculate XP reward
    const baseXP = difficulty === "EASY" ? 30 : difficulty === "MEDIUM" ? 50 : 80;
    const xpEarned = isCorrect ? baseXP : 0;

    // Save quiz history
    await prisma.quizHistory.create({
      data: {
        userId: session.userId,
        question,
        options,
        correctAnswer,
        userAnswer,
        isCorrect,
        difficulty: difficulty || "MEDIUM",
        xpEarned,
      },
    });

    // Add XP if correct
    if (isCorrect && xpEarned > 0) {
      const xpResult = await addXP(
        session.userId,
        xpEarned,
        "QUIZ_COMPLETE",
        `Quiz completed - ${category || "General"}`,
        { difficulty, category }
      );

      return NextResponse.json({
        isCorrect,
        xpEarned,
        newXP: xpResult.newXP,
        newLevel: xpResult.newLevel,
        leveledUp: xpResult.leveledUp,
        previousLevel: xpResult.previousLevel,
      });
    }

    return NextResponse.json({
      isCorrect,
      xpEarned: 0,
      message: isCorrect ? "Correct!" : "Wrong answer, no XP earned",
    });
  } catch (error) {
    console.error("[Quiz Submit API] Error:", error);
    return NextResponse.json(
      { error: "Failed to submit quiz" },
      { status: 500 }
    );
  }
}

// GET /api/gamification/quiz/history - Get user's quiz history
export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const history = await prisma.quizHistory.findMany({
      where: { userId: session.userId },
      orderBy: { completedAt: "desc" },
      take: 20,
    });

    const stats = await prisma.quizHistory.aggregate({
      where: { userId: session.userId },
      _count: { id: true },
      _sum: { xpEarned: true },
    });

    const correctCount = await prisma.quizHistory.count({
      where: { userId: session.userId, isCorrect: true },
    });

    return NextResponse.json({
      history: history.map((h) => ({
        id: h.id,
        question: h.question,
        isCorrect: h.isCorrect,
        difficulty: h.difficulty,
        xpEarned: h.xpEarned,
        completedAt: h.completedAt,
      })),
      stats: {
        totalQuizzes: stats._count.id,
        totalXP: stats._sum.xpEarned || 0,
        correctCount,
        accuracy: stats._count.id > 0 ? (correctCount / stats._count.id) * 100 : 0,
      },
    });
  } catch (error) {
    console.error("[Quiz History API] Error:", error);
    return NextResponse.json(
      { error: "Failed to get quiz history" },
      { status: 500 }
    );
  }
}
