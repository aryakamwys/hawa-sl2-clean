"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Newspaper, AlertCircle } from "lucide-react";
import NewsCard from "@/components/NewsCard";
import Navbar from "@/components/Navbar";
import LottieLoader from "@/components/LottieLoader";
import { useLanguage } from "@/hooks/useLanguage";

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  imageUrl: string | null;
  source: string;
  sourceUrl: string;
  publishedAt: string;
  category: string;
}

export default function NewsPage() {
  const { t, language } = useLanguage();
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
    fetchNews();
  }, [language]);

  const handleRefresh = () => {
    fetchNews(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />

      <main className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
              {t?.news?.title || "Berita Kualitas Udara"}
            </h1>
            <p className="text-lg text-gray-600">
              {t?.news?.subtitle || "Informasi terkini seputar kualitas udara dari berbagai sumber dunia"}
            </p>
          </div>

          {/* Refresh Button */}
          <div className="flex justify-end mb-6">
            <button
              onClick={handleRefresh}
              disabled={loading || refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? (t?.news?.loading || "Memuat...") : (t?.news?.refresh || "Refresh")}
            </button>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <LottieLoader size={160} text={t?.news?.loading || "Memuat berita kualitas udara..."} />
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t?.news?.errorTitle || "Gagal Memuat Berita"}
              </h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={handleRefresh}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#005AE1] text-white font-semibold hover:bg-[#004BB8] transition-colors"
              >
                <RefreshCw size={16} />
                {t?.news?.retry || "Coba Lagi"}
              </button>
            </div>
          ) : news.length === 0 ? (
            <div className="text-center py-16">
              <Newspaper size={64} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t?.news?.noNews || "Belum Ada Berita"}
              </h3>
              <p className="text-gray-600 mb-6">
                {t?.news?.noNewsDesc || "Berita kualitas udara akan ditampilkan di sini"}
              </p>
              <button
                onClick={handleRefresh}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#005AE1] text-white font-semibold hover:bg-[#004BB8] transition-colors"
              >
                <RefreshCw size={16} />
                {t?.news?.retry || "Muat Ulang"}
              </button>
            </div>
          ) : (
            <>
              {/* News Count */}
              <div className="mb-6 text-sm text-gray-500">
                {(t?.news?.showingNews || "Menampilkan {count} berita terkini").replace("{count}", news.length.toString())}
              </div>

              {/* News Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      </main>
    </div>
  );
}
