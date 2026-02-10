import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { addXP } from "@/services/gamification.service";
import { prisma } from "@/lib/prisma";

interface AnswerSubmission {
  questionId: string;
  userAnswers: string[];
  correctAnswers: string[];
  questionText: string;
  category: string;
}

// POST /api/gamification/quiz/submit-bulk - Submit answers for 10 questions
export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { answers, difficulty } = body as { 
      answers: AnswerSubmission[]; 
      difficulty: "EASY" | "MEDIUM" | "HARD" 
    };

    if (!Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json(
        { error: "Invalid answers format" },
        { status: 400 }
      );
    }

    // Calculate XP per question
    const xpPerQuestion = difficulty === "EASY" ? 30 : difficulty === "MEDIUM" ? 50 : 80;

    // Check each answer
    const results = answers.map((answer) => {
      const isCorrect = answer.userAnswers.every((userAns, index) => 
        userAns.toLowerCase().trim() === answer.correctAnswers[index]?.toLowerCase().trim()
      );

      return {
        questionId: answer.questionId,
        isCorrect,
        correctAnswers: answer.correctAnswers,
        userAnswers: answer.userAnswers,
      };
    });

    const totalCorrect = results.filter(r => r.isCorrect).length;
    const totalQuestions = results.length;
    const xpEarned = totalCorrect * xpPerQuestion;

    // Save quiz history for each question
    await Promise.all(
      answers.map((answer, index) =>
        prisma.quizHistory.create({
          data: {
            userId: session.userId,
            question: answer.questionText,
            options: [answer.correctAnswers[0], ...answer.userAnswers], // Store as JSON
            correctAnswer: 0, // First option is always correct in fill-in-the-blank
            userAnswer: results[index].isCorrect ? 0 : -1,
            isCorrect: results[index].isCorrect,
            difficulty: difficulty || "MEDIUM",
            xpEarned: results[index].isCorrect ? xpPerQuestion : 0,
          },
        })
      )
    );

    // Add total XP if any correct answers
    if (xpEarned > 0) {
      const xpResult = await addXP(
        session.userId,
        xpEarned,
        "QUIZ_COMPLETE",
        `Completed ${totalCorrect}/${totalQuestions} quiz questions`,
        { difficulty, totalCorrect, totalQuestions }
      );

      return NextResponse.json({
        totalCorrect,
        totalQuestions,
        xpEarned,
        results,
        newXP: xpResult.newXP,
        newLevel: xpResult.newLevel,
        leveledUp: xpResult.leveledUp,
      });
    }

    return NextResponse.json({
      totalCorrect,
      totalQuestions,
      xpEarned: 0,
      results,
      message: "No XP earned",
    });
  } catch (error) {
    console.error("[Bulk Quiz Submit API] Error:", error);
    return NextResponse.json(
      { error: "Failed to submit quiz" },
      { status: 500 }
    );
  }
}
