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
    <div className="!fixed !inset-0 !bg-black/50 !flex !items-center !justify-center !z-[60]">
      <div className="!bg-white !rounded-2xl !p-8 !max-w-md !w-full !mx-4 !border-2 !border-black">
        <div className="!text-center !mb-6">
          <h2 className="!text-2xl !font-bold !text-black">
            Sebelum Mulai Quiz... 
          </h2>
          <p className="!mt-2 !text-gray-800">
            Pilih kelompok usiamu agar kami bisa menyesuaikan soal untukmu
          </p>
        </div>

        <div className="!space-y-3">
          {ageGroups.map((group) => (
            <button
              key={group.value}
              onClick={() => setSelectedAge(group.value)}
              className={`!w-full !p-4 !border-2 !rounded-lg !text-left !transition-all ${
                selectedAge === group.value
                  ? "!border-black !bg-black !text-white"
                  : "!border-gray-300 !bg-white !text-black hover:!border-gray-500"
              }`}
            >
              <div className="!flex !items-center !gap-3">
                <span className="!text-3xl">{group.icon}</span>
                <div>
                  <div className="!font-bold">{group.label}</div>
                  <div className="!text-sm !opacity-80">{group.range}</div>
                  <div className="!text-xs !opacity-70 !mt-1">
                    {group.description}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="!flex !gap-3 !mt-6">
          <button
            onClick={onClose}
            className="!flex-1 !px-4 !py-3 !border-2 !border-black !bg-white !text-black !rounded-lg !font-semibold"
          >
            Nanti Saja
          </button>
          <button
            disabled={!selectedAge}
            onClick={() => selectedAge && onSave(selectedAge)}
            className="!flex-1 !px-4 !py-3 !bg-black !text-white !border-2 !border-black !rounded-lg !font-semibold disabled:!opacity-50 disabled:!cursor-not-allowed"
          >
            Mulai Quiz!
          </button>
        </div>
      </div>
    </div>
  );
}
