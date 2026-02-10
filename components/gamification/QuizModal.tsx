"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
  difficulty: string;
  xpReward: number;
  timeLimit: number;
}

interface QuizModalProps {
  onClose: () => void;
  ageGroup?: "ANAK" | "REMAJA" | "DEWASA" | "LANSIA" | null;
}

export default function QuizModal({ onClose, ageGroup = "REMAJA" }: QuizModalProps) {
  const [quiz, setQuiz] = useState<QuizQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<{
    isCorrect: boolean;
    xpEarned: number;
    newLevel?: number;
    leveledUp?: boolean;
  } | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [draggedOption, setDraggedOption] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    generateQuiz();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const generateQuiz = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/gamification/quiz/generate?difficulty=MEDIUM", {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setQuiz(data);
        setTimeLeft(data.timeLimit);
        startTimer(data.timeLimit);
      }
    } catch (error) {
      console.error("Failed to generate quiz:", error);
    } finally {
      setLoading(false);
    }
  };

  const startTimer = (seconds: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(seconds);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeout = () => {
    // Time's up - count as wrong answer
    submitAnswer(-1);
  };

  const submitAnswer = async (answerIndex: number) => {
    if (!quiz) return;

    clearInterval(timerRef.current!);

    try {
      const res = await fetch("/api/gamification/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: quiz.question,
          options: quiz.options,
          correctAnswer: quiz.correctAnswer,
          userAnswer: answerIndex,
          difficulty: quiz.difficulty,
          category: quiz.category,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
        setShowResult(true);
        setSelectedAnswer(answerIndex);
      }
    } catch (error) {
      console.error("Failed to submit answer:", error);
    }
  };

  const handleOptionClick = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
    submitAnswer(index);
  };

  const handleNextQuestion = () => {
    setShowResult(false);
    setSelectedAnswer(null);
    setResult(null);
    generateQuiz();
  };

  const handleClose = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    onClose();
  };

  // Touch handlers for drag simulation
  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    if (showResult) return;
    setTouchStartY(e.touches[0].clientY);
    setDraggedOption(index);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!draggedOption) return;
    // Visual feedback during drag could be added here
  };

  const handleTouchEnd = (e: React.TouchEvent, index: number) => {
    if (!draggedOption) return;

    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchEndY - (touchStartY || 0);

    // If swiped up significantly, select this answer
    if (deltaY < -50) {
      handleOptionClick(index);
    }

    setDraggedOption(null);
    setTouchStartY(null);
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        // Don't close if quiz is active, only if no quiz loaded
        if (!quiz && !loading) {
          handleClose();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [quiz, loading]);

  if (loading) {
    return (
      <div className="!fixed !inset-0 !bg-black/50 !flex !items-center !justify-center !z-[50]">
        <div className="!bg-white !rounded-2xl !p-8 !max-w-md !w-full !mx-4 !border-2 !border-black !text-center">
          <div className="!text-4xl !mb-4">🎯</div>
          <p className="!text-black">Memuat soal...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return null;
  }

  return (
    <div ref={containerRef} className="!fixed !inset-0 !bg-black/50 !flex !items-center !justify-center !z-[50]">
      <div className="!bg-white !rounded-2xl !p-6 !max-w-lg !w-full !mx-4 !border-2 !border-black">
        {/* Header with timer */}
        <div className="!flex !items-center !justify-between !mb-4">
          <button
            onClick={handleClose}
            className="!text-black !text-2xl hover:!scale-110 !transition-transform"
          >
            ✕
          </button>
          <div
            className={`!px-4 !py-2 !rounded-full !font-bold ${
              timeLeft <= 5
                ? "!bg-red-500 !text-white"
                : "!bg-black !text-white"
            }`}
          >
            {timeLeft}s
          </div>
          <div className="!text-black !text-sm">+{quiz.xpReward} XP</div>
        </div>

        {/* Question */}
        <div className="!mb-6">
          <div className="!text-center !mb-2">
            <span className="!inline-block !px-3 !py-1 !bg-gray-200 !rounded-full !text-xs !font-semibold !text-black">
              {quiz.category}
            </span>
          </div>
          <h2 className="!text-xl !font-bold !text-black !text-center">
            {quiz.question}
          </h2>
        </div>

        {/* Options */}
        {!showResult ? (
          <div className="!space-y-3">
            {quiz.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionClick(index)}
                onTouchStart={(e) => handleTouchStart(e, index)}
                onTouchMove={handleTouchMove}
                onTouchEnd={(e) => handleTouchEnd(e, index)}
                className={`!w-full !p-4 !border-2 !rounded-xl !text-left !transition-all ${
                  selectedAnswer === index
                    ? "!border-black !bg-black !text-white"
                    : "!border-gray-300 !bg-white !text-black hover:!border-gray-500"
                } ${
                  draggedOption === index ? "!scale-105" : ""
                }`}
              >
                <div className="!flex !items-center !gap-3">
                  <span className="!w-8 !h-8 !rounded-full !border-2 !flex !items-center !justify-center !font-bold !text-sm">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="!flex-1">{option}</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          /* Result */
          <div className="!text-center">
            <div className="!text-6xl !mb-4">
              {result?.isCorrect ? "🎉" : "😢"}
            </div>
            <h3
              className={`!text-2xl !font-bold !mb-2 ${
                result?.isCorrect ? "!text-green-600" : "!text-red-600"
              }`}
            >
              {result?.isCorrect ? "Benar!" : "Salah!"}
            </h3>
            {result?.isCorrect && (
              <p className="!text-black !mb-4">
                +{result.xpEarned} XP earned!
              </p>
            )}
            {result?.leveledUp && (
              <div className="!bg-yellow-100 !border-2 !border-yellow-400 !rounded-lg !p-3 !mb-4">
                <div className="!text-2xl">🎊</div>
                <div className="!font-bold !text-black">
                  Level Up! Level {result.newLevel}
                </div>
              </div>
            )}
            <p className="!text-gray-600 !mb-6 !text-sm">{quiz.explanation}</p>

            <div className="!flex !gap-3">
              <button
                onClick={handleNextQuestion}
                className="!flex-1 !px-4 !py-3 !bg-black !text-white !border-2 !border-black !rounded-lg !font-semibold"
              >
                Soal Berikutnya
              </button>
              <button
                onClick={handleClose}
                className="!px-4 !py-3 !border-2 !border-black !bg-white !text-black !rounded-lg !font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
