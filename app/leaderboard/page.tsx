"use client";

import { useState, useEffect } from "react";
import { Home, Trophy } from "lucide-react";
import Link from "next/link";

interface LeaderboardEntry {
  rank: number;
  name: string;
  xp: number;
  level: number;
  title: string;
  streak: number;
}

interface LeaderboardData {
  users: LeaderboardEntry[];
  total: number;
  hasMore: boolean;
  userRank: number | null;
}

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"global" | "district">("global");

  useEffect(() => {
    fetchLeaderboard();
  }, [filter]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const url = filter === "global"
        ? "/api/gamification/leaderboard?limit=50"
        : "/api/gamification/leaderboard?limit=50";
      const res = await fetch(url);
      if (res.ok) {
        const leaderboardData = await res.json();
        setData(leaderboardData);
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return "!text-yellow-500";
    if (rank === 2) return "!text-gray-400";
    if (rank === 3) return "!text-amber-600";
    return "!text-gray-600";
  };

  return (
    <div className="!min-h-screen !bg-gray-50 !pb-24">
      {/* Header */}
      <div className="!bg-white !border-b-2 !border-black">
        <div className="!max-w-4xl !mx-auto !px-4 !py-6">
          <Link
            href="/"
            className="!inline-flex !items-center !gap-2 !text-black hover:!text-gray-600 !mb-4"
          >
            <Home className="!w-5 !h-5" />
            <span className="!font-semibold">Beranda</span>
          </Link>
          <h1 className="!text-3xl !font-bold !text-black !flex !items-center !gap-3">
            <Trophy className="!w-8 !h-8" />
            Leaderboard
          </h1>
          <p className="!text-gray-600 !mt-2">
            Lihat peringkat pengguna berdasarkan XP
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="!max-w-4xl !mx-auto !px-4 !py-4">
        <div className="!flex !gap-2">
          <button
            onClick={() => setFilter("global")}
            className={`!px-4 !py-2 !rounded-lg !font-semibold !border-2 ${
              filter === "global"
                ? "!bg-black !text-white !border-black"
                : "!bg-white !text-black !border-gray-300"
            }`}
          >
            🌍 Global
          </button>
          <button
            onClick={() => setFilter("district")}
            className={`!px-4 !py-2 !rounded-lg !font-semibold !border-2 ${
              filter === "district"
                ? "!bg-black !text-white !border-black"
                : "!bg-white !text-black !border-gray-300"
            }`}
          >
            🏘️ District
          </button>
        </div>
      </div>

      {/* Your Rank */}
      {data?.userRank && (
        <div className="!max-w-4xl !mx-auto !px-4 !mb-4">
          <div className="!bg-yellow-50 !border-2 !border-yellow-400 !rounded-xl !p-4">
            <div className="!flex !items-center !justify-between">
              <span className="!text-black !font-semibold">Peringkatmu:</span>
              <span className="!text-2xl !font-bold !text-black">
                #{data.userRank}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="!max-w-4xl !mx-auto !px-4">
        {loading ? (
          <div className="!text-center !py-12">
            <div className="!text-4xl !mb-4">🏆</div>
            <p className="!text-black">Memuat leaderboard...</p>
          </div>
        ) : data && data.users.length > 0 ? (
          <div className="!space-y-3">
            {data.users.map((entry) => (
              <div
                key={entry.rank}
                className="!bg-white !border-2 !border-black !rounded-xl !p-4 !flex !items-center !gap-4"
              >
                <div className={`!text-2xl !font-bold ${getRankColor(entry.rank)} !w-12 !text-center`}>
                  {getRankIcon(entry.rank)}
                </div>
                <div className="!flex-1">
                  <div className="!font-bold !text-black">{entry.name}</div>
                  <div className="!text-sm !text-gray-600">{entry.title}</div>
                </div>
                <div className="!text-right">
                  <div className="!font-bold !text-black">Level {entry.level}</div>
                  <div className="!text-sm !text-gray-600">{entry.xp} XP</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="!text-center !py-12">
            <p className="!text-black">Belum ada data leaderboard</p>
          </div>
        )}
      </div>
    </div>
  );
}
