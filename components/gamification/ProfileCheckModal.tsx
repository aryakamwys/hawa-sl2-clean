"use client";

import { useState } from "react";

interface ProfileCheckModalProps {
  onClose: () => void;
  onSave: (ageGroup: "ANAK" | "REMAJA" | "DEWASA") => void;
}

const ageGroups = [
  {
    value: "ANAK" as const,
    label: "Anak-anak",
    range: "6-12 tahun",
    icon: "🧒",
    description: "Soal-soal fun dan mudah dipahami",
  },
  {
    value: "REMAJA" as const,
    label: "Remaja",
    range: "13-17 tahun",
    icon: "🧑",
    description: "Soal yang relevan dengan kehidupan sehari-hari",
  },
  {
    value: "DEWASA" as const,
    label: "Dewasa",
    range: "18+ tahun",
    icon: "👨",
    description: "Soal lebih mendalam dan teknis",
  },
];

export default function ProfileCheckModal({
  onClose,
  onSave,
}: ProfileCheckModalProps) {
  const [selectedAge, setSelectedAge] = useState<"ANAK" | "REMAJA" | "DEWASA" | null>(null);

  return (
    <div className="!fixed !inset-0 !bg-black/40 !backdrop-blur-sm !flex !items-center !justify-center !z-[60] !p-4 !font-sans !text-slate-900 !tracking-tight">
      <div className="!relative !bg-[#F8FAFC] !rounded-[2rem] !p-8 !max-w-md !w-full !shadow-2xl !overflow-hidden">
        {/* Soft radial glow background behind header */}
        <div className="!absolute !top-0 !left-0 !w-full !h-32 !bg-gradient-to-b !from-slate-200/50 !to-transparent !pointer-events-none !z-0"></div>

        <div className="!relative !z-10 !text-center !mb-8">
          <div className="!w-16 !h-16 !mx-auto !bg-white !rounded-2xl !flex !items-center !justify-center !shadow-sm !mb-5 !text-3xl">
            👤
          </div>
          <h2 className="!text-[22px] !font-bold !text-slate-900 !mb-2">
            Sebelum Mulai Quiz...
          </h2>
          <p className="!text-[15px] !text-slate-500 !font-medium !leading-relaxed !px-2">
            Pilih kelompok usiamu agar kami bisa menyesuaikan soal untukmu
          </p>
        </div>

        <div className="!space-y-3 !relative !z-10">
          {ageGroups.map((group) => {
            const isSelected = selectedAge === group.value;
            return (
              <button
                key={group.value}
                onClick={() => setSelectedAge(group.value)}
                className={`!w-full !p-4 !rounded-2xl !text-left !transition-all !border-[1.5px] !cursor-pointer hover:-!translate-y-[2px] ${isSelected
                    ? "!border-[#005AE1] !bg-blue-50/50 !ring-4 !ring-[#005AE1]/10 !shadow-sm"
                    : "!border-slate-200 !bg-white hover:!border-[#005AE1] hover:!shadow-md"
                  }`}
              >
                <div className="!flex !items-center !gap-4">
                  <div className={`!w-12 !h-12 !rounded-xl !flex !items-center !justify-center !text-2xl !flex-shrink-0 !transition-colors ${isSelected ? "!bg-white !shadow-sm" : "!bg-slate-50"
                    }`}>
                    {group.icon}
                  </div>
                  <div className="!flex-1">
                    <div className={`!font-bold !mb-0.5 !text-[16px] ${isSelected ? "!text-[#005AE1]" : "!text-slate-800"}`}>{group.label}</div>
                    <div className="!text-[13px] !font-semibold !text-slate-400 !mb-1">{group.range}</div>
                    <div className={`!text-[12px] !font-medium !leading-snug ${isSelected ? "!text-[#005AE1]/80" : "!text-slate-500"}`}>
                      {group.description}
                    </div>
                  </div>
                  <div className={`!w-5 !h-5 !rounded-full !border-2 !flex !items-center !justify-center !transition-colors !flex-shrink-0 ${isSelected ? "!border-[#005AE1] !bg-[#005AE1]" : "!border-slate-300"
                    }`}>
                    {isSelected && <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="!flex !gap-3 !mt-8 !relative !z-10">
          <button
            onClick={onClose}
            className="!flex-1 !py-3.5 !bg-white hover:!bg-slate-50 !text-slate-700 !rounded-full !font-bold !transition-all !cursor-pointer !text-[15px] !border !border-slate-200 !shadow-sm"
          >
            Nanti Saja
          </button>
          <button
            disabled={!selectedAge}
            onClick={() => selectedAge && onSave(selectedAge)}
            className="!flex-1 !py-3.5 !bg-gradient-to-r !from-[#005AE1] !to-[#399AF0] hover:!from-[#004BB8] hover:!to-[#2D8BE0] !text-white !rounded-full !font-bold hover:!shadow-lg hover:-!translate-y-[1px] !transition-all !border-none !cursor-pointer !text-[15px] disabled:!opacity-50 disabled:!cursor-not-allowed disabled:hover:!transform-none disabled:hover:!shadow-none"
          >
            Mulai Quiz!
          </button>
        </div>
      </div>
    </div>
  );
}
