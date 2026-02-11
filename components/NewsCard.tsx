"use client";

import { useState } from "react";
import { ExternalLink, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import LottieLoader from "./LottieLoader";
import GroqIcon from "./GroqIcon";

interface NewsCardProps {
  title: string;
  summary: string;
  imageUrl: string | null;
  source: string;
  sourceUrl: string;
  publishedAt: string;
}

export default function NewsCard({
  title,
  summary,
  source,
  sourceUrl,
  publishedAt,
}: NewsCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [aiSummary, setAiSummary] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);

  // Format date to Indonesian
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      return date.toLocaleDateString("id-ID", options);
    } catch {
      return dateString;
    }
  };

  const handleExpandClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (expanded) {
      setExpanded(false);
      return;
    }
    setExpanded(true);

    // Fetch AI summary if not already loaded
    if (!aiSummary) {
      setLoadingSummary(true);
      try {
        const res = await fetch("/api/news/summarize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, sourceUrl, content: summary }),
        });
        if (res.ok) {
          const data = await res.json();
          setAiSummary(data.summary);
        } else {
          setAiSummary("Gagal memuat rangkuman AI. Silakan coba lagi.");
        }
      } catch {
        setAiSummary("Gagal memuat rangkuman AI. Silakan coba lagi.");
      } finally {
        setLoadingSummary(false);
      }
    }
  };

  const handleReadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(sourceUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <article className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-[#005AE1]/20 transition-all duration-300 overflow-hidden flex flex-col">
      {/* Content */}
      <div className="flex-1 flex flex-col p-5">
        {/* Source badge */}
        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full bg-[#005AE1]/10 text-[#005AE1]">
            {source}
          </span>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Calendar size={11} />
            <span>{formatDate(publishedAt)}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-[#005AE1] transition-colors leading-snug">
          {title}
        </h3>

        {/* Summary */}
        <p className={`text-sm text-gray-600 leading-relaxed flex-1 ${expanded ? "" : "line-clamp-3"}`}>
          {summary}
        </p>

        {/* AI Summary toggle */}
        <button
          onClick={handleExpandClick}
          className="flex items-center gap-1.5 text-xs text-[#F55036] hover:text-[#E8380D] mt-3 mb-2 font-medium transition-colors"
        >
          <GroqIcon size={13} />
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          <span>{expanded ? "Tutup ringkasan AI" : "Ringkasan Groq AI"}</span>
        </button>

        {/* AI Summary Section */}
        {expanded && (
          <div className="mb-3 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-200 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <GroqIcon size={14} className="text-[#F55036]" />
              <span className="text-xs font-bold text-gray-800">Ringkasan Groq AI</span>
            </div>
            {loadingSummary ? (
              <LottieLoader size={64} text="Menganalisis berita..." />
            ) : (
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {aiSummary}
              </p>
            )}
          </div>
        )}

        {/* Footer with Baca Disini button */}
        <div className="flex items-center justify-end pt-3 border-t border-gray-100">
          <button
            onClick={handleReadClick}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-[#005AE1] rounded-xl hover:bg-[#004BB8] active:scale-95 transition-all duration-200 shadow-sm"
          >
            <ExternalLink size={14} />
            Baca Disini
          </button>
        </div>
      </div>
    </article>
  );
}
