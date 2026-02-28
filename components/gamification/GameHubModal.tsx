"use client";

import { useState, useEffect } from "react";
import ProfileCheckModal from "./ProfileCheckModal";
import QuizModal from "./QuizModal";
import LeaderboardModal from "./LeaderboardModal";
import { useLanguage } from "@/hooks/useLanguage";

interface UserLevel {
  xp: number;
  level: number;
  title: string;
  streak: number;
}

interface UserProfile {
  ageGroup?: "ANAK" | "REMAJA" | "DEWASA" | "LANSIA" | null;
}

interface GameHubModalProps {
  onClose: () => void;
}

export default function GameHubModal({ onClose }: GameHubModalProps) {
  const { t } = useLanguage();
  const [userLevel, setUserLevel] = useState<UserLevel | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showProfileCheck, setShowProfileCheck] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch user level
      const levelRes = await fetch("/api/gamification/level");
      if (levelRes.ok) {
        const levelData = await levelRes.json();
        setUserLevel(levelData);
      }

      // Fetch user profile
      const profileRes = await fetch("/api/profile");
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setUserProfile(profileData.profile);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  const handleQuizClick = () => {
    if (!userProfile?.ageGroup) {
      setShowProfileCheck(true);
    } else {
      setShowQuizModal(true);
    }
  };

  const handleLeaderboardClick = () => {
    setShowLeaderboard(true);
  };

  return (
    <>
      <div className="!fixed !inset-0 !bg-black/60 !backdrop-blur-sm !flex !items-center !justify-center !z-50 !p-4">
        {/* Main Card mimicking the FeedSpring reference */}
        <div className="!relative !bg-gradient-to-b !from-[#89CDEB] !via-[#FAFBFD] !to-[#FAFBFD] !rounded-[2rem] !w-full !max-w-[420px] !shadow-2xl !overflow-hidden">

          {/* Subtle connecting lines pattern (simulated with SVG background behind content) */}
          <div className="!absolute !top-[100px] !left-0 !w-full !flex !items-center !justify-center !opacity-20 !pointer-events-none">
            <div className="!h-px !w-full !bg-gradient-to-r !from-transparent !via-white !to-transparent"></div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="!absolute !right-4 !top-4 !text-slate-600 hover:!text-slate-900 !transition-colors !bg-transparent !border-none !p-2 !cursor-pointer z-20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>

          <div className="!p-8 !pt-12 !flex !flex-col !items-center !relative !z-10">
            {/* Floating Icon */}
            <div className="!w-14 !h-14 !bg-white !rounded-[1rem] !flex !items-center !justify-center !shadow-sm !mb-6 !mt-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0057BB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="7.5 4.21 12 6.81 16.5 4.21" />
                <polyline points="7.5 19.79 7.5 14.6 3 12" />
                <polyline points="21 12 16.5 14.6 16.5 19.79" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </div>

            {/* Pill Subtitle */}
            <div className="!inline-flex !items-center !justify-center !gap-2 !px-4 !py-[6px] !bg-white/50 !backdrop-blur-sm !border !border-white/60 !rounded-full !mb-6">
              <span className="!text-[14px] !font-medium !text-slate-700">
                {userLevel ? `Level ${userLevel.level} • ${userLevel.xp} XP` : "Welcome to Game Hub"}
              </span>
              {userLevel && (
                <span className="!text-[14px] !font-bold !text-orange-500 !flex !items-center !gap-1">
                  <span>🔥</span> {userLevel.streak}
                </span>
              )}
            </div>

            {/* Title */}
            <h2 className="!text-[1.65rem] !font-bold !text-slate-900 !leading-tight !mb-3 !text-center">
              {t?.game?.title || "Get Started with Gaming"}
            </h2>

            {/* Description */}
            <p className="!text-[14.5px] !text-slate-600 !leading-relaxed !mb-8 !text-center !px-2">
              Welcome to the Gamification center. Test your knowledge with the <span className="!font-bold !text-slate-800">Quiz Game</span>, or check your rank in the <span className="!font-bold !text-slate-800">Leaderboard</span> below.
            </p>

            {/* Bottom Action Area */}
            <div className="!w-full !flex !flex-col !gap-3">

              {/* Secondary/Leaderboard Button */}
              <button
                onClick={handleLeaderboardClick}
                className="!w-full !py-[15px] !bg-white/60 hover:!bg-white !backdrop-blur-sm !border !border-solid !border-slate-200/80 !text-slate-600 hover:!text-slate-800 !rounded-full !font-semibold !text-[15.5px] !transition-all !cursor-pointer !shadow-sm"
              >
                {t?.game?.leaderboard || "View Leaderboard Rankings"}
              </button>

              {/* Primary/Quiz Button */}
              <button
                onClick={handleQuizClick}
                className="!relative !w-full !flex !items-center !justify-center !py-[13px] !bg-gradient-to-r !from-[#005AE1] !to-[#399AF0] hover:!from-[#004BB8] hover:!to-[#2D8BE0] !text-white !rounded-full !transition-colors !cursor-pointer !group !border-none !shadow-[0_8px_20px_rgba(0,90,225,0.25)] hover:!shadow-[0_12px_24px_rgba(0,90,225,0.3)] hover:-!translate-y-[1px]"
              >
                <div className="!font-bold !text-[16px] !z-10 !text-center">
                  {t?.game?.quizGame || "Play Quiz Game"}
                </div>
                <div className="!absolute !right-2 !top-2 !bottom-2 !w-[42px] !rounded-full !bg-white/20 group-hover:!bg-white/30 !flex !items-center !justify-center !transition-colors !flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showProfileCheck && (
        <ProfileCheckModal
          onClose={() => setShowProfileCheck(false)}
          onSave={async (ageGroup) => {
            // Update profile
            const res = await fetch("/api/profile", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ageGroup, gender: "OTHER" }),
            });
            if (res.ok) {
              const data = await res.json();
              setUserProfile(data.profile);
              setShowProfileCheck(false);
              setShowQuizModal(true);
            }
          }}
        />
      )
      }

      {
        showQuizModal && (
          <QuizModal
            onClose={() => setShowQuizModal(false)}
            onViewLeaderboard={() => setShowLeaderboard(true)}
          />
        )
      }

      {
        showLeaderboard && (
          <LeaderboardModal onClose={() => setShowLeaderboard(false)} />
        )
      }
    </>
  );
}
