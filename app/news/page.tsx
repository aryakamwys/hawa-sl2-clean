"use client";

import { useEffect, useState } from "react";
import { Loader2, RefreshCw, Newspaper, AlertCircle } from "lucide-react";
import NewsCard from "@/components/NewsCard";
import Navbar from "@/components/Navbar";

type Category = "all" | "bandung" | "indonesia";

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  imageUrl: string | null;
  source: string;
  sourceUrl: string;
  publishedAt: string;
  category: "bandung" | "indonesia";
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [refreshing, setRefreshing] = useState(false);

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
    fetchNews(activeCategory);
  }, []);

  const handleCategoryChange = (category: Category) => {
    setActiveCategory(category);
    fetchNews(category);
  };

  const handleRefresh = () => {
    fetchNews(activeCategory, true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar
        nav={[
          { label: "Home", href: "/" },
          { label: "Feature", href: "/feature" },
          { label: "How it work", href: "/how-it-works" },
          { label: "About Us", href: "/about-us" },
          { label: "Info", href: "/news" },
        ]}
        lang="ID"
        onLangChange={(v) => console.log(v)}
      />

      <main className="pt-32 pb-20 px-4">{/* (!) pt-32 pb-20 px-4: main padding */}
        <div className="max-w-7xl mx-auto">{/* (!) mx-auto: center content */}
          {/* Header */}
          <div className="text-center mb-8">{/* (!) mb-8: header margin-bottom */}
            <h1 className="text-4xl font-extrabold text-gray-900 mb-3">{/* (!) mb-3: title margin-bottom */}
              Berita Kualitas Udara
            </h1>
            <p className="text-lg text-gray-600">{/* (!) no margin */}
              Informasi terbaru seputar kualitas udara dan lingkungan di Bandung & Indonesia
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex justify-center mb-8">{/* (!) mb-8: tabs margin-bottom */}
            <div className="inline-flex bg-white rounded-full p-1.5 shadow-sm border border-gray-200">{/* (!) p-1.5: tabs padding */}
              {[
                { value: "all", label: "Semua" },
                { value: "bandung", label: "Bandung" },
                { value: "indonesia", label: "Indonesia" },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => handleCategoryChange(tab.value as Category)}
                  className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    activeCategory === tab.value
                      ? "bg-[#005AE1] text-white shadow-md"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Refresh Button */}
          <div className="flex justify-end mb-6">{/* (!) mb-6: refresh margin-bottom */}
            <button
              onClick={handleRefresh}
              disabled={loading || refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Memuat..." : "Refresh"}
            </button>
          </div>

          {/* Content */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{/* (!) gap-6: news grid gap */}
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse"
                >
                  {/* (!) p-4: skeleton card padding */}
                  <div className="aspect-video bg-gray-200 rounded-xl mb-4" />{/* (!) mb-4: skeleton image margin-bottom */}
                  <div className="h-6 bg-gray-200 rounded mb-2" />{/* (!) mb-2: skeleton title margin-bottom */}
                  <div className="h-4 bg-gray-200 rounded mb-2 w-3/4" />{/* (!) mb-2: skeleton summary margin-bottom */}
                  <div className="h-4 bg-gray-200 rounded w-1/2" />{/* (!) no margin-bottom */}
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Gagal Memuat Berita
              </h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={handleRefresh}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#005AE1] text-white font-semibold hover:bg-[#004BB8] transition-colors"
              >
                <RefreshCw size={16} />
                Coba Lagi
              </button>
            </div>
          ) : news.length === 0 ? (
            <div className="text-center py-16">
              <Newspaper size={64} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Belum Ada Berita
              </h3>
              <p className="text-gray-600 mb-6">
                Berita kualitas udara akan ditampilkan di sini
              </p>
              <button
                onClick={handleRefresh}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#005AE1] text-white font-semibold hover:bg-[#004BB8] transition-colors"
              >
                <RefreshCw size={16} />
                Muat Ulang
              </button>
            </div>
          ) : (
            <>
              {/* News Count */}
              <div className="mb-6 text-sm text-gray-500">{/* (!) mb-6: news count margin-bottom */}
                Menampilkan <span className="font-semibold text-gray-900">{news.length}</span> berita
                {activeCategory !== "all" && (
                  <span> kategori <span className="font-semibold text-gray-900 capitalize">{activeCategory}</span></span>
                )}
              </div>

              {/* News Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{/* (!) gap-6: news grid gap */}
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
