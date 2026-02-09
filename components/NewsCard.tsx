"use client";

import { ExternalLink, Calendar } from "lucide-react";

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
  imageUrl,
  source,
  sourceUrl,
  publishedAt,
}: NewsCardProps) {
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

  const handleClick = () => {
    window.open(sourceUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <article
      onClick={handleClick}
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer flex flex-col"
    >
      {/* (!) Card container: no padding, only border-radius and shadow */}
      {/* Image */}
      <div className="relative aspect-video bg-gradient-to-br from-[#005AE1]/10 to-[#70D8FF]/10 overflow-hidden">
        {/* (!) No padding, only aspect ratio */}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#005AE1]/20 to-[#70D8FF]/20">
            <span className="text-4xl">📰</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-4">{/* (!) p-4: card content padding */}
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-[#005AE1] transition-colors">{/* (!) mb-2: title margin-bottom */}
          {title}
        </h3>

        {/* Summary */}
        <p className="text-sm text-gray-600 line-clamp-3 mb-4 flex-1">{/* (!) mb-4: summary margin-bottom */}
          {summary}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">{/* (!) pt-3: footer padding-top */}
          <div className="flex items-center gap-1.5">
            <Calendar size={12} />
            <span>{formatDate(publishedAt)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#005AE1]">
            <ExternalLink size={12} />
            <span>{source}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
