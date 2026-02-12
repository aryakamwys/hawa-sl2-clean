"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export interface CardSpreadItem {
  id: string;
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface CardSpreadProps {
  cards: CardSpreadItem[];
  className?: string;
}

export default function CardSpread({ cards, className = "" }: CardSpreadProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleCardClick = (index: number) => {
    if (expandedIndex === index) {
      setExpandedIndex(null);
    } else {
      setExpandedIndex(index);
    }
  };

  return (
    <div className={cn("w-full py-12", className)}>
      <div className="flex items-center justify-center gap-4 md:gap-8 overflow-x-auto pb-8">
        {cards.map((card, index) => {
          const isExpanded = expandedIndex === index;
          const isDimmed = expandedIndex !== null && !isExpanded;

          return (
            <div key={card.id} className="flex items-center gap-3 md:gap-4 flex-shrink-0">
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{
                  opacity: isDimmed ? 0.3 : 1,
                  y: 0,
                  scale: isExpanded ? 1.05 : 1,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 25,
                }}
                onClick={() => handleCardClick(index)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                whileHover={{ scale: 1.02 }}
                className="relative cursor-pointer"
              >
                <div className={cn(
                  "p-5 md:p-6 bg-white rounded-2xl border shadow-lg hover:shadow-xl transition-all duration-300 w-[220px] md:w-[260px]",
                  isExpanded
                    ? "border-[#005AE1] shadow-2xl shadow-[#005AE1]/20 ring-2 ring-[#005AE1]/10"
                    : "border-gray-200 hover:border-[#005AE1]/40"
                )}>
                  {/* Number Badge */}
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold mb-3 md:mb-4 transition-colors",
                    isExpanded ? "bg-[#005AE1] text-white" : "bg-[#005AE1] text-white"
                  )}>
                    {card.number}
                  </div>

                  {/* Icon */}
                  {card.icon && (
                    <div className={cn(
                      "w-11 h-11 md:w-12 md:h-12 rounded-xl flex items-center justify-center mb-3 md:mb-4 transition-colors",
                      isExpanded ? "bg-[#005AE1]/10" : "bg-[#E0F4FF]"
                    )}>
                      <div className={cn("transition-colors", isExpanded ? "text-[#005AE1]" : "text-[#005AE1]")}>
                        {card.icon}
                      </div>
                    </div>
                  )}

                  <h3 className={cn(
                    "text-base md:text-lg font-bold mb-2",
                    isExpanded ? "text-[#005AE1]" : "text-gray-900"
                  )}>
                    {card.title}
                  </h3>

                  <p className={cn(
                    "text-xs md:text-sm leading-relaxed",
                    isExpanded ? "text-gray-700" : "text-gray-500"
                  )}>
                    {isExpanded ? card.description : `${card.description.substring(0, 80)}...`}
                  </p>

                  {/* Expanded content */}
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ duration: 0.3 }}
                      className="pt-2 border-t border-gray-200 mt-3"
                    >
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {card.description}
                      </p>
                    </motion.div>
                  )}

                  {/* Click hint */}
                  {!isExpanded && (
                    <div className="mt-3 md:mt-4 text-xs text-[#005AE1] font-medium flex items-center gap-1">
                      <span>Click to expand</span>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Arrow between cards */}
              {index < cards.length - 1 && (
                <div className={cn(
                  "flex items-center justify-center flex-shrink-0 transition-opacity duration-300",
                  isDimmed ? "opacity-30" : "opacity-100"
                )}>
                  <ChevronRight className={cn(
                    "text-[#005AE1]/30",
                    isDimmed && "grayscale"
                  )} size={18} strokeWidth={2} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Collapse button */}
      {expandedIndex !== null && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => setExpandedIndex(null)}
          className="mx-auto mt-6 px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl text-sm font-semibold transition-colors"
        >
          Show All Steps
        </motion.button>
      )}
    </div>
  );
}
