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
      <div className="!fixed !inset-0 !bg-black/40 !backdrop-blur-sm !flex !items-center !justify-center !z-50 !p-4">
        <div className="!bg-white !rounded-2xl !shadow-2xl !p-6 md:!p-8 !max-w-md !w-full !max-h-[90vh] !overflow-y-auto relative">
          {/* Close button absolute top right */}
          <button
            onClick={onClose}
            className="!absolute !right-4 !top-4 !p-2 !text-gray-400 hover:!text-gray-600 !transition-colors"
          >
            <span className="sr-only">Close</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          {/* Header */}
          <div className="!text-center !mb-8">
            <h2 className="!text-2xl !font-bold !text-gray-900 mb-1">
              {t?.game?.title || "Game Hub"}
            </h2>
            <p className="!text-gray-500 !text-sm">Challenge yourself and earn rewards</p>
            
            <div className="!mt-6">
              {userLevel && (
                <div className="!flex !items-center !justify-center !gap-2 !bg-gray-50 !rounded-xl !p-3 !border !border-gray-100">
                  <div className="!flex-1 !text-center">
                    <div className="!text-xs !text-gray-500 !uppercase !tracking-wider !font-medium">{t?.game?.level || "Level"}</div>
                    <div className="!text-xl !font-bold !text-[#005AE1]">
                      {userLevel.level}
                    </div>
                  </div>
                  <div className="!w-px !h-8 !bg-gray-200"></div>
                  <div className="!flex-1 !text-center">
                    <div className="!text-xs !text-gray-500 !uppercase !tracking-wider !font-medium">XP</div>
                    <div className="!text-xl !font-bold !text-gray-900">
                      {userLevel.xp}
                    </div>
                  </div>
                  <div className="!w-px !h-8 !bg-gray-200"></div>
                  <div className="!flex-1 !text-center">
                    <div className="!text-xs !text-gray-500 !uppercase !tracking-wider !font-medium">{t?.game?.streak || "Streak"}</div>
                    <div className="!text-xl !font-bold !text-orange-500">
                      🔥 {userLevel.streak}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Menu Buttons */}
          <div className="!space-y-3">
            <button
              onClick={handleQuizClick}
              className="!w-full !p-4 !bg-white !text-left !border !border-gray-200 !rounded-xl !flex !items-center !gap-4 !transition-all hover:!border-[#005AE1] hover:!shadow-md hover:!ring-1 hover:!ring-[#005AE1]/10 group"
            >
              <div className="!w-12 !h-12 !rounded-full !bg-blue-50 !flex !items-center !justify-center !text-2xl group-hover:!scale-110 !transition-transform">
                🎯
              </div>
              <div className="!flex-1">
                <div className="!font-bold !text-gray-900 !mb-0.5">{t?.game?.quizGame || "Quiz Game"}</div>
                <div className="!text-xs !text-gray-500">{t?.game?.quizDesc || "Answer questions & earn XP!"}</div>
              </div>
            </button>

            <button
              onClick={handleLeaderboardClick}
              className="!w-full !p-4 !bg-white !text-left !border !border-gray-200 !rounded-xl !flex !items-center !gap-4 !transition-all hover:!border-[#005AE1] hover:!shadow-md hover:!ring-1 hover:!ring-[#005AE1]/10 group"
            >
              <div className="!w-12 !h-12 !rounded-full !bg-yellow-50 !flex !items-center !justify-center !text-2xl group-hover:!scale-110 !transition-transform">
                🏆
              </div>
              <div className="!flex-1">
                <div className="!font-bold !text-gray-900 !mb-0.5">{t?.game?.leaderboard || "Leaderboard"}</div>
                <div className="!text-xs !text-gray-500">{t?.game?.leaderboardDesc || "View your rankings!"}</div>
              </div>
            </button>
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
      )}

      {showQuizModal && (
        <QuizModal
          onClose={() => setShowQuizModal(false)}
        />
      )}

      {showLeaderboard && (
        <LeaderboardModal onClose={() => setShowLeaderboard(false)} />
      )}
    </>
  );
}
