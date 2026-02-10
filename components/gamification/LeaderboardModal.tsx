"use client";

import { useState, useEffect } from "react";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  xp: number;
  level: number;
  title: string;
  streak: number;
}

interface LeaderboardModalProps {
  onClose: () => void;
}

export default function LeaderboardModal({ onClose }: LeaderboardModalProps) {
  const [activeTab, setActiveTab] = useState<"global" | "district">("global");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [activeTab]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const url = activeTab === "global"
        ? "/api/gamification/leaderboard"
        : `/api/gamification/leaderboard?district=Bandung`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data.users || []);
        setUserRank(data.userRank || null);
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="!fixed !inset-0 !bg-black/50 !flex !items-center !justify-center !z-[55]">
      <div className="!bg-white !rounded-2xl !p-6 !max-w-lg !w-full !mx-4 !border-2 !border-black !max-h-[80vh] !flex !flex-col">
        {/* Header */}
        <div className="!flex !items-center !justify-between !mb-4">
          <h2 className="!text-2xl !font-bold !text-black">🏆 Leaderboard</h2>
          <button
            onClick={onClose}
            className="!text-black !text-2xl hover:!scale-110 !transition-transform"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="!flex !gap-2 !mb-4">
          <button
            onClick={() => setActiveTab("global")}
            className={`!flex-1 !py-2 !px-4 !rounded-lg !font-semibold !transition-all ${
              activeTab === "global"
                ? "!bg-black !text-white"
                : "!bg-gray-200 !text-black"
            }`}
          >
            Global
          </button>
          <button
            onClick={() => setActiveTab("district")}
            className={`!flex-1 !py-2 !px-4 !rounded-lg !font-semibold !transition-all ${
              activeTab === "district"
                ? "!bg-black !text-white"
                : "!bg-gray-200 !text-black"
            }`}
          >
            District
          </button>
        </div>

        {/* User Rank Highlight */}
        {userRank && (
          <div className="!mb-4 !p-3 !bg-yellow-100 !border-2 !border-yellow-400 !rounded-lg">
            <div className="!text-center">
              <span className="!text-sm !text-gray-700">Peringkatmu: </span>
              <span className="!text-xl !font-bold !text-black">#{userRank}</span>
            </div>
          </div>
        )}

        {/* Leaderboard List */}
        <div className="!flex-1 !overflow-y-auto">
          {loading ? (
            <div className="!text-center !py-8">
              <div className="!text-black">Loading...</div>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="!text-center !py-8">
              <div className="!text-gray-600">Belum ada data</div>
            </div>
          ) : (
            <div className="!space-y-2">
              {leaderboard.slice(0, 10).map((entry) => (
                <div
                  key={entry.userId}
                  className={`!flex !items-center !gap-3 !p-3 !rounded-lg !border-2 ${
                    entry.rank === 1
                      ? "!bg-yellow-100 !border-yellow-400"
                      : entry.rank === 2
                      ? "!bg-gray-200 !border-gray-400"
                      : entry.rank === 3
                      ? "!bg-orange-100 !border-orange-400"
                      : "!bg-white !border-gray-200"
                  }`}
                >
                  {/* Rank */}
                  <div className={`!w-8 !h-8 !rounded-full !flex !items-center !justify-center !font-bold ${
                    entry.rank === 1
                      ? "!bg-yellow-400 !text-white"
                      : entry.rank === 2
                      ? "!bg-gray-400 !text-white"
                      : entry.rank === 3
                      ? "!bg-orange-400 !text-white"
                      : "!bg-gray-200 !text-black"
                  }`}>
                    {entry.rank}
                  </div>

                  {/* Avatar & Name */}
                  <div className="!flex-1">
                    <div className="!font-semibold !text-black">{entry.name}</div>
                    <div className="!text-xs !text-gray-600">{entry.title}</div>
                  </div>

                  {/* Stats */}
                  <div className="!text-right">
                    <div className="!font-bold !text-black">Lvl {entry.level}</div>
                    <div className="!text-sm !text-gray-600">{entry.xp} XP</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="!mt-4 !pt-4 !border-t !border-gray-200">
          <button
            onClick={onClose}
            className="!w-full !py-3 !bg-white !text-black !border-2 !border-[#005AE1] !rounded-lg !font-semibold hover:!bg-[#E0F4FF]"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
