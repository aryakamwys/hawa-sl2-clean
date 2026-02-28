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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [activeTab]);

  useEffect(() => {
    // Fetch current user id explicitly for styling "You"
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.profile) {
          setCurrentUserId(data.profile.userId || data.profile.id);
        }
      })
      .catch((e) => console.error(e));
  }, []);

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
    <div className="!fixed !inset-0 !bg-black/40 !backdrop-blur-sm !flex !items-center !justify-center !z-[55] !p-4 !font-sans !text-slate-900 !tracking-tight">
      <div className="!relative !bg-[#F8FAFC] !rounded-[2rem] !w-full !max-w-[420px] !shadow-2xl !overflow-hidden !max-h-[90vh] !flex !flex-col">

        {/* Soft radial glow background behind header */}
        <div className="!absolute !top-0 !left-0 !w-full !h-40 !bg-gradient-to-b !from-slate-200/50 !to-transparent !pointer-events-none"></div>

        {/* Header Region */}
        <div className="!px-6 !pt-8 !pb-4 !relative !z-10 !flex-shrink-0">
          <button
            onClick={onClose}
            className="!absolute !right-4 !top-4 !text-slate-400 hover:!text-slate-800 !transition-colors !bg-transparent !border-none !p-2 !cursor-pointer !z-20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>

          <div className="!flex !items-center !justify-center !gap-3 !mb-6">
            <div className="!w-10 !h-10 !bg-white !rounded-xl !flex !items-center !justify-center !shadow-sm">
              <span className="!text-[22px]">🏆</span>
            </div>
            <h2 className="!text-[1.5rem] !font-bold !text-slate-900">Leaderboard</h2>
          </div>

          {/* Modern Pill Tabs */}
          <div className="!flex !gap-2 !bg-slate-200/60 !p-1.5 !rounded-full !mb-2">
            <button
              onClick={() => setActiveTab("global")}
              className={`!flex-1 !py-[10px] !px-4 !rounded-full !font-bold !text-[14px] !transition-all !duration-300 ${activeTab === "global"
                ? "!bg-white !text-slate-900 !shadow-sm"
                : "!text-slate-500 hover:!text-slate-700"
                }`}
            >
              Global
            </button>
            <button
              onClick={() => setActiveTab("district")}
              className={`!flex-1 !py-[10px] !px-4 !rounded-full !font-bold !text-[14px] !transition-all !duration-300 ${activeTab === "district"
                ? "!bg-white !text-slate-900 !shadow-sm"
                : "!text-slate-500 hover:!text-slate-700"
                }`}
            >
              District
            </button>
          </div>
        </div>

        {/* Content Area with smooth scrolling */}
        <div className="!flex-1 !overflow-y-auto !px-4 !pb-2 !custom-scrollbar">
          {/* User Rank Highlight */}
          {userRank && (
            <div className="!mb-5 !p-4 !bg-gradient-to-r !from-[#005AE1] !to-[#399AF0] !text-white !rounded-2xl !shadow-md !flex !items-center !justify-between !relative !overflow-hidden">
              <div className="!absolute !right-0 !top-0 !bottom-0 !w-32 !bg-white/10 !skew-x-[-20deg] !translate-x-10"></div>
              <div className="!relative !z-10">
                <span className="!text-[13px] !font-medium !text-white/90 !block !mb-0.5">Your Ranking</span>
                <span className="!text-[22px] !font-bold">Top #{userRank}</span>
              </div>
              <div className="!relative !z-10 !w-12 !h-12 !bg-white/20 !rounded-full !flex !items-center !justify-center !backdrop-blur-sm">
                <span className="!text-xl">🌟</span>
              </div>
            </div>
          )}

          {/* Leaderboard List */}
          {loading ? (
            <div className="!flex !flex-col !items-center !justify-center !py-12 !space-y-4">
              <div className="!w-10 !h-10 !border-4 !border-blue-200 !border-t-blue-500 !rounded-full !animate-spin"></div>
              <div className="!text-slate-500 !font-medium !text-[14px]">Loading Rankings...</div>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="!flex !flex-col !items-center !justify-center !py-12 !text-center">
              <div className="!text-4xl !mb-3 opacity-50">📭</div>
              <div className="!text-slate-500 !font-medium !text-[15px]">No rankings found</div>
            </div>
          ) : (
            <div className="!space-y-3">
              {leaderboard.slice(0, 10).map((entry) => {
                const isFirst = entry.rank === 1;
                const isSecond = entry.rank === 2;
                const isThird = entry.rank === 3;
                const isTop3 = isFirst || isSecond || isThird;

                return (
                  <div
                    key={entry.userId}
                    className={`!relative !flex !items-center !gap-4 !p-3.5 !rounded-2xl !transition-transform hover:-!translate-y-[2px] ${isFirst
                      ? "!bg-gradient-to-r !from-[#FFFBF0] !to-white !border !border-amber-200/60 !shadow-[0_4px_12px_rgba(251,191,36,0.15)]"
                      : isSecond
                        ? "!bg-gradient-to-r !from-[#F8FAFC] !to-white !border !border-slate-200 !shadow-[0_4px_12px_rgba(148,163,184,0.1)]"
                        : isThird
                          ? "!bg-gradient-to-r !from-[#FFF7F0] !to-white !border !border-orange-200/50 !shadow-[0_4px_12px_rgba(251,146,60,0.1)]"
                          : "!bg-white !border !border-slate-100 !shadow-sm"
                      }`}
                  >
                    {/* Rank Indicator */}
                    <div className={`!w-[38px] !h-[38px] !rounded-full !flex !items-center !justify-center !font-bold !text-[15px] !flex-shrink-0 ${isFirst
                      ? "!bg-gradient-to-br !from-amber-300 !to-yellow-500 !text-white !shadow-md"
                      : isSecond
                        ? "!bg-gradient-to-br !from-slate-300 !to-slate-400 !text-white !shadow-md"
                        : isThird
                          ? "!bg-gradient-to-br !from-orange-300 !to-orange-400 !text-white !shadow-md"
                          : "!bg-slate-100 !text-slate-500 !font-semibold"
                      }`}>
                      {isTop3 ? <span className="!drop-shadow-sm">{entry.rank}</span> : entry.rank}
                    </div>

                    {/* Avatar & Name */}
                    <div className="!flex-1 !min-w-0">
                      <div className={`!font-bold !truncate !text-[15px] ${isTop3 ? "!text-slate-900" : "!text-slate-700"}`}>
                        {entry.name}
                        {currentUserId && entry.userId === currentUserId && (
                          <span className="!ml-2 !text-[13px] !text-[#005AE1] !font-bold !bg-blue-50 !px-2 !py-0.5 !rounded-full">(Kamu)</span>
                        )}
                      </div>
                      <div className="!text-[12px] !text-slate-500 !font-medium !truncate">
                        {entry.title || "Explorer"}
                      </div>
                    </div>

                    {/* Stats Pill */}
                    <div className={`!text-right !px-3 !py-1.5 !rounded-lg !flex !flex-col !items-end !justify-center ${isFirst ? "!bg-amber-50" : isSecond ? "!bg-slate-50" : isThird ? "!bg-orange-50" : "!bg-slate-50"
                      }`}>
                      <div className={`!font-bold !text-[14px] leading-none !mb-1 ${isFirst ? "!text-amber-600" : isSecond ? "!text-slate-600" : isThird ? "!text-orange-600" : "!text-slate-700"
                        }`}>
                        {entry.xp} <span className="!text-[10px] !font-bold">XP</span>
                      </div>
                      <div className="!text-[11px] !font-semibold !text-slate-500 leading-none">
                        Lvl {entry.level}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Overlay */}
        <div className="!px-6 !pt-4 !pb-6 !bg-gradient-to-t !from-[#F8FAFC] !via-[#F8FAFC] !to-transparent !relative !z-10 !flex-shrink-0">
          <button
            onClick={onClose}
            className="!w-full !py-3.5 !bg-transparent hover:!bg-slate-200/50 !text-slate-600 hover:!text-slate-900 !rounded-full !font-bold !text-[15px] !transition-all !cursor-pointer !border !border-slate-300"
          >
            Close Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
}
