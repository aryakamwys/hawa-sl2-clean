"use client";

import { useState, useEffect } from "react";
import { X, RefreshCw, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

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
  onViewLeaderboard?: () => void;
}

interface UserAnswer {
  questionId: string;
  userAnswers: string[];
  questionText: string;
  correctAnswers: string[];
  category: string;
}

export default function QuizModal({ onClose, onViewLeaderboard }: QuizModalProps) {
  const { language } = useLanguage(); // Get current language
  const [questions, setQuestions] = useState<FillInTheBlankQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Map<string, string[]>>(new Map());
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedBlankIndex, setSelectedBlankIndex] = useState<number | null>(null);

  useEffect(() => {
    generateQuestions();
  }, [language]); // Re-generate if language changes

  const generateQuestions = async () => {
    setLoading(true);
    setShowResults(false);
    setResults(null);
    setUserAnswers(new Map());
    setResults(null);
    setUserAnswers(new Map());
    setCurrentQuestionIndex(0);
    setSelectedBlankIndex(null); // Reset selection

    try {
      // Pass language to API
      const res = await fetch(`/api/gamification/quiz/generate-bulk?difficulty=MEDIUM&lang=${language}`, {
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

  // Click to fill logic
  const handleOptionClick = (option: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;

    // Determine target blank: use selected or find first empty
    let targetIndex = selectedBlankIndex;

    if (targetIndex === null) {
      // Find first empty blank
      const currentAnswers = userAnswers.get(currentQuestion.id) || [];
      // Calculate total blanks based on parsing
      const parts = currentQuestion.questionText.split("___");
      const blankCount = parts.length - 1;

      for (let i = 0; i < blankCount; i++) {
        if (!currentAnswers[i]) {
          targetIndex = i;
          break;
        }
      }
    }

    if (targetIndex !== null) {
      updateAnswer(currentQuestion.id, targetIndex, option);
      // Move selection to next blank or clear
      setSelectedBlankIndex(null);
    }
  };

  const updateAnswer = (questionId: string, blankIndex: number, value: string) => {
    const currentAnswers = userAnswers.get(questionId) || [];
    const newAnswers = [...currentAnswers];
    newAnswers[blankIndex] = value;

    const newMap = new Map(userAnswers);
    newMap.set(questionId, newAnswers);
    setUserAnswers(newMap);
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
      <div className="!fixed !inset-0 !bg-black/40 !backdrop-blur-sm !z-[2000] !flex !items-center !justify-center !p-4 !font-sans !text-slate-900 !tracking-tight">
        <div className="!relative !bg-[#F8FAFC] !rounded-[2rem] !p-8 !max-w-2xl !w-full !shadow-2xl !overflow-hidden">
          {/* Subtle glow background */}
          <div className="!absolute !top-0 !left-0 !w-full !h-48 !bg-gradient-to-b !from-slate-200/50 !to-transparent !pointer-events-none !z-0"></div>

          <div className="!relative !z-10 !text-center !mb-8">
            <div className="!w-20 !h-20 !mx-auto !bg-white !rounded-3xl !flex !items-center !justify-center !shadow-sm !mb-6 !text-4xl">
              {results.totalCorrect >= 7 ? "🎉" : results.totalCorrect >= 5 ? "👍" : "💪"}
            </div>
            <h2 className="!text-3xl !font-bold !text-slate-900 !mb-3">Quiz Completed!</h2>
            <p className="!text-[17px] !text-slate-600 !font-medium">
              You got <span className="!font-bold !text-[#005AE1]">{results.totalCorrect}</span> out of{" "}
              <span className="!font-bold">{results.totalQuestions}</span> correct
            </p>
            <div className="!flex !flex-col md:!flex-row !items-stretch !justify-center !gap-3 !mt-6">
              {results.xpEarned > 0 && (
                <div className="!flex !items-center !justify-center !bg-gradient-to-r !from-[#005AE1] !to-[#399AF0] !rounded-2xl !px-6 !py-3.5 !shadow-[0_8px_20px_rgba(0,90,225,0.25)]">
                  <p className="!text-[15px] !font-bold !text-white !m-0">+{results.xpEarned} XP Earned!</p>
                </div>
              )}
              {results.leveledUp && (
                <div className="!flex !items-center !justify-center !bg-gradient-to-r !from-amber-100 !to-yellow-50 !border !border-amber-200 !rounded-2xl !px-6 !py-3.5 !gap-3 !shadow-sm">
                  <span className="!text-[22px] !m-0 !drop-shadow-sm !leading-none">🎊</span>
                  <p className="!font-bold !text-slate-900 !text-[15px] !m-0">Level Up! Level {results.newLevel}</p>
                </div>
              )}
            </div>

            {/* Mock Leaderboard Status (Can be hooked up to real API later) */}
            {onViewLeaderboard ? (
              <button
                onClick={() => {
                  onClose();
                  onViewLeaderboard();
                }}
                className="!mt-5 !inline-flex !items-center !justify-center !gap-2 !bg-white hover:!bg-slate-50 !border !border-slate-200 hover:!border-slate-300 !rounded-full !px-5 !py-2 !transition-all !cursor-pointer !shadow-sm hover:!shadow-md hover:-!translate-y-[1px]"
              >
                <span className="!text-amber-500">🏆</span>
                <p className="!text-[13px] !font-semibold !text-slate-600 !m-0">Naik ke peringkat <span className="!text-slate-900 !font-bold">#12</span> di District! 👉</p>
              </button>
            ) : (
              <div className="!mt-5 !inline-flex !items-center !justify-center !gap-2 !bg-slate-50 !border !border-slate-200 !rounded-full !px-5 !py-2">
                <span className="!text-amber-500">🏆</span>
                <p className="!text-[13px] !font-semibold !text-slate-600 !m-0">Naik ke peringkat <span className="!text-slate-900 !font-bold">#12</span> di District!</p>
              </div>
            )}
          </div>

          <div className="!flex !gap-4 !relative !z-10">
            <button
              onClick={generateQuestions}
              className="!flex-1 !flex !items-center !justify-center !gap-2 !px-6 !py-3.5 !bg-gradient-to-r !from-[#005AE1] !to-[#399AF0] hover:!from-[#004BB8] hover:!to-[#2D8BE0] !text-white !rounded-full !font-bold hover:!shadow-lg hover:-!translate-y-[1px] !transition-all !border-none !cursor-pointer !text-[15px]"
            >
              <RefreshCw size={18} strokeWidth={2.5} />
              Try Again
            </button>

            <button
              onClick={onClose}
              className="!px-8 !py-3.5 !bg-white hover:!bg-slate-50 !text-slate-700 !rounded-full !font-bold !transition-all !cursor-pointer !text-[15px] !border !border-slate-200 !shadow-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="!fixed !inset-0 !bg-black/40 !backdrop-blur-sm !z-[2000] !flex !items-center !justify-center !p-4 !font-sans !text-slate-900 !tracking-tight">
      <div className="!relative !bg-[#F8FAFC] !rounded-[2rem] !shadow-2xl !w-full !max-w-6xl !max-h-[90vh] !flex !flex-col !overflow-hidden">
        {/* Soft radial glow background behind header */}
        <div className="!absolute !top-0 !left-0 !w-full !h-40 !bg-gradient-to-b !from-slate-200/50 !to-transparent !pointer-events-none !z-0"></div>

        {/* Header */}
        <div className="!flex !items-center !justify-between !px-6 !py-5 !border-b !border-slate-200/60 !relative !z-10 !bg-white/40 !backdrop-blur-sm">
          <div className="!flex !items-center !gap-3">
            <div className="!w-10 !h-10 !bg-white !rounded-xl !flex !items-center !justify-center !shadow-sm">
              <span className="!text-[22px]">🧠</span>
            </div>
            <h2 className="!text-[1.25rem] !font-bold !text-slate-900 !m-0">Air Quality Quiz</h2>
          </div>
          <div className="!flex !items-center !gap-3">
            <button
              onClick={generateQuestions}
              className="!flex !items-center !gap-2 !px-4 !py-2.5 !bg-white !border !border-slate-200 hover:!border-slate-300 !text-slate-700 !rounded-full !font-bold hover:!bg-slate-50 !transition-all !cursor-pointer !shadow-sm !text-[13px]"
            >
              <RefreshCw size={16} />
              Generate Again
            </button>
            <button
              onClick={onClose}
              className="!text-slate-400 hover:!text-slate-800 !transition-colors !bg-transparent !border-none !p-2 !cursor-pointer"
            >
              <X size={24} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="!flex !flex-1 !overflow-hidden !min-h-0 !relative !z-10">
          {/* Left Panel - Question List (Hidden on Mobile) */}
          <div className="!hidden md:!flex !w-72 !border-r !border-slate-200/60 !py-5 !px-4 !overflow-y-auto !bg-slate-50/50 !flex-shrink-0 !flex-col !custom-scrollbar">
            <h3 className="!text-xs !font-semibold !text-gray-500 !mb-3 !uppercase !tracking-wider !px-2">
              Questions
            </h3>
            <div className="!flex !flex-col !gap-1">
              {questions.map((q, index) => {
                const status = getQuestionStatus(q.id);
                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentQuestionIndex(index);
                      setSelectedBlankIndex(null);
                    }}
                    className={`!w-full !flex !items-center !gap-3 !px-3 !py-3 !rounded-2xl !transition-all !border-none !cursor-pointer !text-left ${currentQuestionIndex === index
                      ? "!bg-gradient-to-r !from-[#005AE1] !to-[#399AF0] !text-white !shadow-md"
                      : "!bg-transparent hover:!bg-white !text-slate-700 hover:!shadow-sm"
                      }`}
                  >
                    <div
                      className={`!w-7 !h-7 !rounded-full !flex !items-center !justify-center !font-bold !text-xs !flex-shrink-0 ${currentQuestionIndex === index
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
          <div className="!flex-1 !flex !flex-col !p-4 md:!p-8 !overflow-y-auto">
            {/* Mobile Progress Bar */}
            <div className="!mb-4 md:!hidden">
              <div className="!flex !items-center !justify-between !mb-2">
                <span className="!text-xs !font-semibold !text-gray-500">
                  Question {currentQuestionIndex + 1} / {questions.length}
                </span>
                <span className="!text-xs !text-[#005AE1] !font-medium">
                  {getQuestionStatus(questions[currentQuestionIndex]?.id) === "answered" ? "Answered" : "Unanswered"}
                </span>
              </div>
              <div className="!w-full !h-1.5 !bg-gray-100 !rounded-full !overflow-hidden">
                <div
                  className="!h-full !bg-[#005AE1] !transition-all !duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>
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
                <div className="!mb-6 md:!mb-8 !p-5 md:!p-8 !bg-white !rounded-[2rem] !border !border-slate-100 !shadow-sm">
                  <div className="!text-base md:!text-lg !font-medium !text-slate-800 !leading-loose">
                    {parseQuestionText(currentQuestion.questionText).map((part, index) => (
                      <span key={index} className="!inline">
                        <span>{part}</span>
                        {index < currentQuestion.correctAnswers.length && (
                          <span
                            onClick={() => setSelectedBlankIndex(selectedBlankIndex === index ? null : index)}
                            onDrop={(e) => handleDrop(e, currentQuestion.id, index)}
                            onDragOver={handleDragOver}
                            className={`!inline-flex !items-center !mx-1 !min-w-[80px] md:!min-w-[100px] !px-3 md:!px-4 !py-1.5 !border-2 !rounded-xl !align-middle !transition-all !cursor-pointer ${selectedBlankIndex === index
                              ? "!border-[#005AE1] !bg-blue-50/50 !ring-4 !ring-[#005AE1]/10"
                              : "!border-dashed !border-slate-300 !bg-slate-50 hover:!border-[#005AE1] hover:!bg-white"
                              }`}
                            style={{ verticalAlign: "middle" }}
                          >
                            {currentAnswers[index] ? (
                              <span className="!flex !items-center !gap-1.5">
                                <span className="!font-semibold !text-[#005AE1] !text-sm md:!text-base">
                                  {currentAnswers[index]}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevent toggling selection
                                    removeAnswer(currentQuestion.id, index);
                                  }}
                                  className="!text-slate-400 hover:!text-slate-600 !bg-transparent !border-none !cursor-pointer !p-1 !transition-colors"
                                >
                                  <X size={14} strokeWidth={2.5} />
                                </button>
                              </span>
                            ) : (
                              <span className={`!text-sm ${selectedBlankIndex === index ? "!text-[#005AE1]" : "!text-slate-400"}`}>
                                {selectedBlankIndex === index ? "Select..." : "Empty"}
                              </span>
                            )}
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Answer Options */}
                <div className="!mb-6">
                  <h4 className="!text-xs !font-bold !text-slate-400 !mb-3 !uppercase !tracking-wider !m-0">
                    Tap or Drag to Fill
                  </h4>
                  <div className="!flex !flex-wrap !gap-2 md:!gap-3">
                    {currentQuestion.allOptions.map((option, index) => {
                      const isUsed = currentAnswers.includes(option);
                      return (
                        <div
                          key={index}
                          draggable={!isUsed}
                          onDragStart={(e) => handleDragStart(e, option)}
                          onClick={() => !isUsed && handleOptionClick(option)}
                          className={`!px-5 md:!px-6 !py-2.5 md:!py-3 !rounded-full !border-[1.5px] !font-bold !text-[14px] !transition-all !select-none !shadow-sm ${isUsed
                            ? "!bg-slate-100 !border-slate-200 !text-slate-400 !cursor-not-allowed !opacity-50 !shadow-none"
                            : "!bg-white !border-slate-200 !text-[#005AE1] !cursor-pointer hover:!border-[#005AE1] hover:!bg-[#F8FAFC] hover:-!translate-y-[2px] hover:!shadow-md active:!scale-95"
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
                  <div className="!p-4 !bg-slate-50 !border !border-slate-200 !rounded-2xl !mt-auto">
                    <h4 className="!font-bold !text-slate-900 !mb-2 !text-sm !m-0">Explanation:</h4>
                    <p className="!text-slate-600 !text-sm !leading-relaxed !m-0">{currentQuestion.explanation}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="!flex !items-center !justify-between !px-6 !py-5 !border-t !border-slate-200/60 !bg-white/40 !backdrop-blur-sm !relative !z-10">
          <div className="!text-[14px] !font-bold !text-slate-500">
            {userAnswers.size} of {questions.length} answered
          </div>
          <div className="!flex !gap-3">
            <button
              onClick={() => {
                setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1));
                setSelectedBlankIndex(null);
              }}
              disabled={currentQuestionIndex === 0}
              className="!px-5 md:!px-6 !py-2.5 md:!py-3 !bg-white !border !border-slate-200 !text-slate-700 !rounded-full !font-bold hover:!bg-slate-50 !transition-all disabled:!opacity-40 disabled:!cursor-not-allowed !cursor-pointer !text-[14px] !shadow-sm"
            >
              Previous
            </button>
            {currentQuestionIndex < questions.length - 1 ? (
              <button
                onClick={() => {
                  setCurrentQuestionIndex(currentQuestionIndex + 1);
                  setSelectedBlankIndex(null);
                }}
                className="!px-6 md:!px-8 !py-2.5 md:!py-3 !bg-gradient-to-r !from-[#005AE1] !to-[#399AF0] hover:!from-[#004BB8] hover:!to-[#2D8BE0] !text-white !rounded-full !font-bold !transition-all hover:!shadow-lg hover:-!translate-y-[1px] !border-none !cursor-pointer !text-[14px] !shadow-md"
              >
                Next
              </button>
            ) : (
              <button
                onClick={submitAllAnswers}
                disabled={submitting || userAnswers.size === 0}
                className="!px-6 md:!px-8 !py-2.5 md:!py-3 !bg-gradient-to-r !from-emerald-500 !to-teal-400 hover:!from-emerald-600 hover:!to-teal-500 !text-white !rounded-full !font-bold !transition-all disabled:!opacity-40 disabled:!cursor-not-allowed !flex !items-center !gap-2 !border-none !cursor-pointer !text-[14px] !shadow-md hover:!shadow-lg hover:-!translate-y-[1px]"
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
