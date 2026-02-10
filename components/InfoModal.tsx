"use client";

import { useEffect, useState } from "react";
import { X, RefreshCw, Newspaper, AlertCircle } from "lucide-react";
import NewsCard from "./NewsCard";

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  imageUrl: string | null;
  source: string;
  sourceUrl: string;
  publishedAt: string;
  category: "bmkg";
}

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InfoModal({ isOpen, onClose }: InfoModalProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNews = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const url = `/api/news${showRefreshing ? "?refresh=true" : ""}`;
      const res = await fetch(url);

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal mengambil berita");
      }

      setNews(data.news || []);
    } catch (err) {
      console.error("Error fetching news:", err);
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNews();
    }
  }, [isOpen]);

  const handleRefresh = () => {
    fetchNews(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[2000] flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[85vh] !mx-4 flex flex-col animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between !px-6 !py-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Berita BMKG</h2>
            <p className="text-sm text-gray-500">
              Informasi terbaru dari BMKG seputar cuaca dan iklim
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={loading || refreshing}
              className="inline-flex items-center gap-2 px-4 !py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Memuat..." : "Refresh"}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* News List */}
        <div className="flex-1 overflow-y-auto !px-6 !py-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-gray-100 rounded-2xl p-4 animate-pulse"
                >
                  <div className="aspect-video bg-gray-200 rounded-xl mb-4" />
                  <div className="h-5 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded mb-2 w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Gagal Memuat Berita
              </h3>
              <p className="text-gray-600 mb-6 text-sm">{error}</p>
              <button
                onClick={handleRefresh}
                className="inline-flex items-center gap-2 px-6 !py-3 rounded-xl bg-[#005AE1] text-white font-semibold hover:bg-[#004BB8] transition-colors"
              >
                <RefreshCw size={16} />
                Coba Lagi
              </button>
            </div>
          ) : news.length === 0 ? (
            <div className="text-center py-16">
              <Newspaper size={64} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Belum Ada Berita
              </h3>
              <p className="text-gray-600 mb-6 text-sm">
                Berita BMKG akan ditampilkan di sini
              </p>
            </div>
          ) : (
            <>
              {/* News Count */}
              <div className="mb-4 text-sm text-gray-500">
                Menampilkan{" "}
                <span className="font-semibold text-gray-900">{news.length}</span> berita
                <span> dari <span className="font-semibold text-gray-900">BMKG</span></span>
              </div>

              {/* News Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                {news.map((item) => (
                  <NewsCard
                    key={item.id}
                    title={item.title}
                    summary={item.summary}
                    imageUrl={item.imageUrl}
                    source={item.source}
                    sourceUrl={item.sourceUrl}
                    publishedAt={item.publishedAt}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
