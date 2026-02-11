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
      <div className="!fixed !inset-0 !bg-black/50 !flex !items-center !justify-center !z-50 !p-4">
        <div className="!bg-white !rounded-2xl !p-4 sm:!p-6 md:!p-8 !max-w-md !w-full !border-2 !border-black !max-h-[90vh] !overflow-y-auto">
          {/* Header */}
          <div className="!text-center !mb-6 md:!mb-8">
            <h2 className="!text-2xl sm:!text-3xl !font-bold !text-black">
              {t?.game?.title || "Point Quiz"}
            </h2>
            <div className="!mt-3 md:!mt-4">
              {userLevel && (
                <div className="!flex !items-center !justify-center !gap-3 sm:!gap-4">
                  <div className="!text-center">
                    <div className="!text-xs sm:!text-sm !text-gray-600">{t?.game?.level || "Level"}</div>
                    <div className="!text-lg sm:!text-xl !font-bold !text-black">
                      {userLevel.level}
                    </div>
                  </div>
                  <div className="!text-center">
                    <div className="!text-xs sm:!text-sm !text-gray-600">XP</div>
                    <div className="!text-lg sm:!text-xl !font-bold !text-black">
                      {userLevel.xp}
                    </div>
                  </div>
                  <div className="!text-center">
                    <div className="!text-xs sm:!text-sm !text-gray-600">{t?.game?.streak || "Streak"}</div>
                    <div className="!text-lg sm:!text-xl !font-bold !text-black">
                      🔥 {userLevel.streak}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Menu Buttons */}
          <div className="!space-y-3 md:!space-y-4">
            <button
              onClick={handleQuizClick}
              className="!w-full !h-20 sm:!h-24 !text-lg sm:!text-xl !bg-white !text-black !border-2 !border-[#005AE1] !rounded-xl !flex !items-center !gap-3 sm:!gap-4 !px-4 sm:!px-6 !transition-all hover:!scale-105 active:!scale-95 hover:!bg-[#E0F4FF]"
            >
              <span className="!text-3xl sm:!text-4xl">🎯</span>
              <div className="!text-left">
                <div className="!font-bold">{t?.game?.quizGame || "Quiz Game"}</div>
                <div className="!text-xs sm:!text-sm">{t?.game?.quizDesc || "Answer questions & earn XP!"}</div>
              </div>
            </button>

            <button
              onClick={handleLeaderboardClick}
              className="!w-full !h-20 sm:!h-24 !text-lg sm:!text-xl !bg-white !text-black !border-2 !border-[#005AE1] !rounded-xl !flex !items-center !gap-3 sm:!gap-4 !px-4 sm:!px-6 !transition-all hover:!scale-105 active:!scale-95 hover:!bg-[#E0F4FF]"
            >
              <span className="!text-3xl sm:!text-4xl">🏆</span>
              <div className="!text-left">
                <div className="!font-bold">{t?.game?.leaderboard || "Leaderboard"}</div>
                <div className="!text-xs sm:!text-sm">{t?.game?.leaderboardDesc || "View your rankings!"}</div>
              </div>
            </button>
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            className="!mt-4 md:!mt-6 !w-full !py-2.5 md:!py-3 !bg-white !text-black !border-2 !border-[#005AE1] !rounded-lg !font-semibold hover:!bg-[#E0F4FF]"
          >
            {t?.game?.close || "Close"}
          </button>
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
