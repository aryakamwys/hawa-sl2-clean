"use client";

import { useEffect, useState } from "react";
import { X, Search, RefreshCw, Loader2, Newspaper, AlertCircle } from "lucide-react";
import NewsCard from "./NewsCard";

type Category = "all" | "bmkg" | "ispu" | "arimbi" | "iqair" | "nafas" | "aqicn";

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  imageUrl: string | null;
  source: string;
  sourceUrl: string;
  publishedAt: string;
  category: Category;
}

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_LABELS: Record<Category, string> = {
  all: "Semua",
  bmkg: "BMKG",
  ispu: "ISPU",
  arimbi: "ARIMBI",
  iqair: "IQAir",
  nafas: "Nafas",
  aqicn: "AQICN",
};

export default function InfoModal({ isOpen, onClose }: InfoModalProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchNews = async (category: Category, showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const url = `/api/news?category=${category}${showRefreshing ? "&refresh=true" : ""}`;
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
      fetchNews(activeCategory);
    }
  }, [isOpen, activeCategory]);

  // Filter news by search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredNews(news);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = news.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.summary.toLowerCase().includes(query) ||
          item.source.toLowerCase().includes(query)
      );
      setFilteredNews(filtered);
    }
  }, [searchQuery, news]);

  const handleCategoryChange = (category: Category) => {
    setActiveCategory(category);
    setSearchQuery("");
  };

  const handleRefresh = () => {
    fetchNews(activeCategory, true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[2000] flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[85vh] !mx-4 flex flex-col animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between !px-6 !py-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Berita Kualitas Udara</h2>
            <p className="text-sm text-gray-500">
              Informasi terbaru dari sumber terpercaya seputar kualitas udara dan lingkungan
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="!px-6 !py-4 border-b border-gray-100">
          <div className="relative">
            {/* Search icon removed as requested */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berita..."
              className="w-full pl-12 pr-4 !py-3 rounded-xl bg-gray-50 border border-gray-200 text-[15px] text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#005AE1]/25 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Category Tabs & Refresh */}
        <div className="flex items-center justify-between !px-6 !py-3 border-b border-gray-100">
          <div className="inline-flex bg-gray-100 rounded-full p-1 flex-wrap gap-3">
            {(Object.keys(CATEGORY_LABELS) as Category[]).map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-3 !py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
                  activeCategory === cat
                    ? "bg-[#005AE1] text-white shadow-md"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white"
                }`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading || refreshing}
            className="inline-flex items-center gap-2 px-4 !py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Memuat..." : "Refresh"}
          </button>
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
          ) : filteredNews.length === 0 ? (
            <div className="text-center py-16">
              <Newspaper size={64} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery ? "Tidak Ada Berita Ditemukan" : "Belum Ada Berita"}
              </h3>
              <p className="text-gray-600 mb-6 text-sm">
                {searchQuery
                  ? "Coba kata kunci lain"
                  : "Berita kualitas udara akan ditampilkan di sini"}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="inline-flex items-center gap-2 px-6 !py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
                >
                  Hapus Pencarian
                </button>
              )}
            </div>
          ) : (
            <>
              {/* News Count */}
              <div className="mb-4 text-sm text-gray-500">
                Menampilkan{" "}
                <span className="font-semibold text-gray-900">{filteredNews.length}</span> berita
                {searchQuery && (
                  <span> dari hasil pencarian &quot;<span className="font-semibold">{searchQuery}</span>&quot;</span>
                )}
                {activeCategory !== "all" && !searchQuery && (
                  <span> dari <span className="font-semibold text-gray-900">{CATEGORY_LABELS[activeCategory]}</span></span>
                )}
              </div>

              {/* News Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                {filteredNews.map((item) => (
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
