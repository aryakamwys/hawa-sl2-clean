"use client";

import { useState, useEffect } from "react";
import ProfileCheckModal from "./ProfileCheckModal";
import QuizModal from "./QuizModal";
import LeaderboardModal from "./LeaderboardModal";

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
      <div className="!fixed !inset-0 !bg-black/50 !flex !items-center !justify-center !z-50">
        <div className="!bg-white !rounded-2xl !p-8 !max-w-md !w-full !mx-4 !border-2 !border-black">
          {/* Header */}
          <div className="!text-center !mb-8">
            <h2 className="!text-3xl !font-bold !text-black">
              Point Quiz
            </h2>
            <div className="!mt-4">
              {userLevel && (
                <div className="!flex !items-center !justify-center !gap-4">
                  <div className="!text-center">
                    <div className="!text-sm !text-gray-600">Level</div>
                    <div className="!text-xl !font-bold !text-black">
                      {userLevel.level}
                    </div>
                  </div>
                  <div className="!text-center">
                    <div className="!text-sm !text-gray-600">XP</div>
                    <div className="!text-xl !font-bold !text-black">
                      {userLevel.xp}
                    </div>
                  </div>
                  <div className="!text-center">
                    <div className="!text-sm !text-gray-600">Streak</div>
                    <div className="!text-xl !font-bold !text-black">
                      🔥 {userLevel.streak}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Menu Buttons */}
          <div className="!space-y-4">
            <button
              onClick={handleQuizClick}
              className="!w-full !h-24 !text-xl !bg-white !text-black !border-2 !border-[#005AE1] !rounded-xl !flex !items-center !gap-4 !px-6 !transition-all hover:!scale-105 active:!scale-95 hover:!bg-[#E0F4FF]"
            >
              <span className="!text-4xl">🎯</span>
              <div className="!text-left">
                <div className="!font-bold">Quiz Game</div>
                <div className="!text-sm">Jawab soal & dapat XP!</div>
              </div>
            </button>

            <button
              onClick={handleLeaderboardClick}
              className="!w-full !h-24 !text-xl !bg-white !text-black !border-2 !border-[#005AE1] !rounded-xl !flex !items-center !gap-4 !px-6 !transition-all hover:!scale-105 active:!scale-95 hover:!bg-[#E0F4FF]"
            >
              <span className="!text-4xl">🏆</span>
              <div className="!text-left">
                <div className="!font-bold">Leaderboard</div>
                <div className="!text-sm">Lihat peringkatmu!</div>
              </div>
            </button>
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            className="!mt-6 !w-full !py-3 !bg-white !text-black !border-2 !border-[#005AE1] !rounded-lg !font-semibold hover:!bg-[#E0F4FF]"
          >
            Tutup
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
          ageGroup={userProfile?.ageGroup}
        />
      )}

      {showLeaderboard && (
        <LeaderboardModal onClose={() => setShowLeaderboard(false)} />
      )}
    </>
  );
}
