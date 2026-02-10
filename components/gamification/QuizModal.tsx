"use client";

import { useState, useEffect } from "react";
import { X, RefreshCw, CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface FillInTheBlankQuestion {
  id: string;
  questionText: string;
  correctAnswers: string[];
  allOptions: string[];
  explanation: string;
  category: string;
  difficulty: string;
  xpReward: number;
}

interface QuizModalProps {
  onClose: () => void;
}

interface UserAnswer {
  questionId: string;
  userAnswers: string[];
  questionText: string;
  correctAnswers: string[];
  category: string;
}

export default function QuizModal({ onClose }: QuizModalProps) {
  const [questions, setQuestions] = useState<FillInTheBlankQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Map<string, string[]>>(new Map());
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    generateQuestions();
  }, []);

  const generateQuestions = async () => {
    setLoading(true);
    setShowResults(false);
    setResults(null);
    setUserAnswers(new Map());
    setCurrentQuestionIndex(0);

    try {
      const res = await fetch("/api/gamification/quiz/generate-bulk?difficulty=MEDIUM", {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions || []);
      }
    } catch (error) {
      console.error("Failed to generate quiz:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, option: string) => {
    e.dataTransfer.setData("text/plain", option);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (e: React.DragEvent, questionId: string, blankIndex: number) => {
    e.preventDefault();
    const option = e.dataTransfer.getData("text/plain");

    const currentAnswers = userAnswers.get(questionId) || [];
    const newAnswers = [...currentAnswers];
    newAnswers[blankIndex] = option;

    const newMap = new Map(userAnswers);
    newMap.set(questionId, newAnswers);
    setUserAnswers(newMap);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const removeAnswer = (questionId: string, blankIndex: number) => {
    const currentAnswers = userAnswers.get(questionId) || [];
    const newAnswers = [...currentAnswers];
    newAnswers[blankIndex] = "";

    const newMap = new Map(userAnswers);
    newMap.set(questionId, newAnswers);
    setUserAnswers(newMap);
  };

  const submitAllAnswers = async () => {
    setSubmitting(true);

    try {
      const answersArray: UserAnswer[] = questions.map((q) => ({
        questionId: q.id,
        userAnswers: userAnswers.get(q.id) || [],
        questionText: q.questionText,
        correctAnswers: q.correctAnswers,
        category: q.category,
      }));

      const res = await fetch("/api/gamification/quiz/submit-bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: answersArray,
          difficulty: questions[0]?.difficulty || "MEDIUM",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setResults(data);
        setShowResults(true);
      }
    } catch (error) {
      console.error("Failed to submit quiz:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const getQuestionStatus = (questionId: string) => {
    if (!showResults) {
      const answers = userAnswers.get(questionId);
      return answers && answers.some((a) => a) ? "answered" : "unanswered";
    }

    const result = results?.results?.find((r: any) => r.questionId === questionId);
    return result?.isCorrect ? "correct" : "incorrect";
  };

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswers = currentQuestion ? userAnswers.get(currentQuestion.id) || [] : [];

  // Parse question text to find blanks
  const parseQuestionText = (text: string) => {
    const parts = text.split("___");
    return parts;
  };

  // Loading state
  if (loading) {
    return (
      <div className="!fixed !inset-0 !bg-black/50 !backdrop-blur-sm !z-[2000] !flex !items-center !justify-center">
        <div className="!bg-white !rounded-2xl !p-8 !max-w-md !w-full !mx-4 !shadow-2xl">
          <div className="!flex !flex-col !items-center !gap-4">
            <Loader2 className="!animate-spin !text-[#005AE1]" size={48} />
            <p className="!text-gray-700 !font-medium !text-base">Generating 10 questions...</p>
          </div>
        </div>
      </div>
    );
  }

  // Results state
  if (showResults && results) {
    return (
      <div className="!fixed !inset-0 !bg-black/50 !backdrop-blur-sm !z-[2000] !flex !items-center !justify-center !p-4">
        <div className="!bg-white !rounded-2xl !p-8 !max-w-2xl !w-full !shadow-2xl">
          <div className="!text-center !mb-6">
            <div className="!text-6xl !mb-4">
              {results.totalCorrect >= 7 ? "🎉" : results.totalCorrect >= 5 ? "👍" : "💪"}
            </div>
            <h2 className="!text-3xl !font-bold !text-gray-900 !mb-2">Quiz Completed!</h2>
            <p className="!text-xl !text-gray-700">
              You got <span className="!font-bold !text-[#005AE1]">{results.totalCorrect}</span> out of{" "}
              <span className="!font-bold">{results.totalQuestions}</span> correct
            </p>
            {results.xpEarned > 0 && (
              <div className="!mt-4 !inline-block !bg-[#E0F4FF] !border-2 !border-[#005AE1] !rounded-full !px-6 !py-2">
                <p className="!text-lg !font-bold !text-[#005AE1]">+{results.xpEarned} XP Earned!</p>
              </div>
            )}
            {results.leveledUp && (
              <div className="!mt-4 !bg-yellow-100 !border-2 !border-yellow-400 !rounded-xl !p-4">
                <p className="!text-2xl">🎊</p>
                <p className="!font-bold !text-gray-900">Level Up! Level {results.newLevel}</p>
              </div>
            )}
          </div>

          <div className="!flex !gap-3">
            <button
              onClick={generateQuestions}
              className="!flex-1 !flex !items-center !justify-center !gap-2 !px-6 !py-3 !bg-[#005AE1] !text-white !rounded-xl !font-semibold hover:!bg-[#004BB8] !transition-colors !border-none !cursor-pointer"
            >
              <RefreshCw size={20} />
              Try Again
            </button>
            <button
              onClick={onClose}
              className="!px-6 !py-3 !border-2 !border-gray-300 !text-gray-700 !rounded-xl !font-semibold hover:!bg-gray-50 !transition-colors !bg-white !cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="!fixed !inset-0 !bg-black/50 !backdrop-blur-sm !z-[2000] !flex !items-center !justify-center !p-4">
      <div className="!bg-white !rounded-2xl !shadow-2xl !w-full !max-w-6xl !max-h-[90vh] !flex !flex-col !overflow-hidden">
        {/* Header */}
        <div className="!flex !items-center !justify-between !px-6 !py-4 !border-b !border-gray-200">
          <h2 className="!text-xl !font-bold !text-gray-900 !m-0">Air Quality Quiz</h2>
          <div className="!flex !items-center !gap-3">
            <button
              onClick={generateQuestions}
              className="!flex !items-center !gap-2 !px-4 !py-2 !border-2 !border-[#005AE1] !text-[#005AE1] !rounded-xl !font-semibold hover:!bg-[#E0F4FF] !transition-colors !bg-white !cursor-pointer !text-sm"
            >
              <RefreshCw size={16} />
              Generate Again
            </button>
            <button
              onClick={onClose}
              className="!p-2 hover:!bg-gray-100 !rounded-lg !transition-colors !bg-transparent !border-none !cursor-pointer"
            >
              <X size={22} className="!text-gray-500" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="!flex !flex-1 !overflow-hidden !min-h-0">
          {/* Left Panel - Question List */}
          <div className="!w-72 !border-r !border-gray-200 !py-4 !px-3 !overflow-y-auto !bg-gray-50/50 !flex-shrink-0">
            <h3 className="!text-xs !font-semibold !text-gray-500 !mb-3 !uppercase !tracking-wider !px-2">
              Questions
            </h3>
            <div className="!flex !flex-col !gap-1">
              {questions.map((q, index) => {
                const status = getQuestionStatus(q.id);
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`!w-full !flex !items-center !gap-3 !px-3 !py-3 !rounded-xl !transition-all !border-none !cursor-pointer !text-left ${
                      currentQuestionIndex === index
                        ? "!bg-[#005AE1] !text-white !shadow-md"
                        : "!bg-white !text-gray-700 hover:!bg-gray-100"
                    }`}
                  >
                    <div
                      className={`!w-7 !h-7 !rounded-full !flex !items-center !justify-center !font-bold !text-xs !flex-shrink-0 ${
                        currentQuestionIndex === index
                          ? "!bg-white !text-[#005AE1]"
                          : "!bg-gray-100 !text-gray-600"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="!flex-1 !min-w-0">
                      <p className="!text-xs !font-medium !truncate !m-0 !leading-tight">
                        {q.category}
                      </p>
                    </div>
                    {status === "answered" && (
                      <div className="!w-2 !h-2 !rounded-full !bg-[#005AE1] !flex-shrink-0" />
                    )}
                    {status === "correct" && (
                      <CheckCircle2 size={16} className="!text-green-500 !flex-shrink-0" />
                    )}
                    {status === "incorrect" && (
                      <XCircle size={16} className="!text-red-500 !flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Panel - Current Question */}
          <div className="!flex-1 !flex !flex-col !p-8 !overflow-y-auto">
            {currentQuestion && (
              <>
                {/* Question Header */}
                <div className="!mb-6">
                  <div className="!inline-block !px-3 !py-1 !bg-[#E0F4FF] !text-[#005AE1] !rounded-full !text-xs !font-semibold !mb-2">
                    {currentQuestion.category}
                  </div>
                  <p className="!text-sm !text-gray-500 !m-0">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </p>
                </div>

                {/* Question with Blanks */}
                <div className="!mb-8 !p-6 !bg-gray-50 !rounded-xl !border !border-gray-200">
                  <div className="!text-lg !font-medium !text-gray-900 !leading-relaxed">
                    {parseQuestionText(currentQuestion.questionText).map((part, index) => (
                      <span key={index} className="!inline">
                        <span>{part}</span>
                        {index < currentQuestion.correctAnswers.length && (
                          <span
                            onDrop={(e) => handleDrop(e, currentQuestion.id, index)}
                            onDragOver={handleDragOver}
                            className="!inline-flex !items-center !mx-1 !min-w-[100px] !px-4 !py-1.5 !border-2 !border-dashed !border-[#005AE1] !rounded-lg !bg-white !align-middle"
                            style={{ verticalAlign: "middle" }}
                          >
                            {currentAnswers[index] ? (
                              <span className="!flex !items-center !gap-2">
                                <span className="!font-semibold !text-[#005AE1] !text-base">
                                  {currentAnswers[index]}
                                </span>
                                <button
                                  onClick={() => removeAnswer(currentQuestion.id, index)}
                                  className="!text-red-400 hover:!text-red-600 !bg-transparent !border-none !cursor-pointer !p-0 !leading-none"
                                >
                                  <X size={14} />
                                </button>
                              </span>
                            ) : (
                              <span className="!text-gray-400 !text-sm">Drop here</span>
                            )}
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Answer Options */}
                <div className="!mb-6">
                  <h4 className="!text-xs !font-semibold !text-gray-500 !mb-3 !uppercase !tracking-wider !m-0">
                    Drag answers below
                  </h4>
                  <div className="!flex !flex-wrap !gap-3">
                    {currentQuestion.allOptions.map((option, index) => {
                      const isUsed = currentAnswers.includes(option);
                      return (
                        <div
                          key={index}
                          draggable={!isUsed}
                          onDragStart={(e) => handleDragStart(e, option)}
                          className={`!px-5 !py-2.5 !rounded-lg !border-2 !font-medium !text-sm !transition-all !select-none ${
                            isUsed
                              ? "!bg-gray-100 !border-gray-200 !text-gray-400 !cursor-not-allowed !opacity-50"
                              : "!bg-white !border-[#005AE1] !text-[#005AE1] !cursor-grab hover:!bg-[#E0F4FF] hover:!shadow-md active:!cursor-grabbing"
                          }`}
                        >
                          {option}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Explanation (shown after submission) */}
                {showResults && (
                  <div className="!p-4 !bg-gray-50 !border !border-gray-200 !rounded-xl !mt-auto">
                    <h4 className="!font-semibold !text-gray-900 !mb-2 !text-sm !m-0">Explanation:</h4>
                    <p className="!text-gray-600 !text-sm !m-0">{currentQuestion.explanation}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="!flex !items-center !justify-between !px-6 !py-4 !border-t !border-gray-200 !bg-white">
          <div className="!text-sm !text-gray-500">
            {userAnswers.size} of {questions.length} answered
          </div>
          <div className="!flex !gap-3">
            <button
              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
              className="!px-5 !py-2.5 !border-2 !border-gray-300 !text-gray-700 !rounded-xl !font-semibold hover:!bg-gray-50 !transition-colors disabled:!opacity-40 disabled:!cursor-not-allowed !bg-white !cursor-pointer !text-sm"
            >
              Previous
            </button>
            {currentQuestionIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                className="!px-5 !py-2.5 !bg-[#005AE1] !text-white !rounded-xl !font-semibold hover:!bg-[#004BB8] !transition-colors !border-none !cursor-pointer !text-sm"
              >
                Next
              </button>
            ) : (
              <button
                onClick={submitAllAnswers}
                disabled={submitting || userAnswers.size === 0}
                className="!px-6 !py-2.5 !bg-green-600 !text-white !rounded-xl !font-semibold hover:!bg-green-700 !transition-colors disabled:!opacity-40 disabled:!cursor-not-allowed !flex !items-center !gap-2 !border-none !cursor-pointer !text-sm"
              >
                {submitting ? (
                  <>
                    <Loader2 className="!animate-spin" size={16} />
                    Submitting...
                  </>
                ) : (
                  "Submit All"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
