"use client";

import { Map } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import SectionTransition from "@/components/SectionTransition";
import CardSpread, { CardSpreadItem } from "@/components/animata/card/card-spread";
import { WifiIcon, BotMessageSquareIcon } from "@/components/animated-icons";
import MetaIcon from "@/components/MetaIcon";

export default function HowItWorks() {
  const { t } = useLanguage();

  const steps: CardSpreadItem[] = [
    {
      id: "step1",
      number: "1",
      title: t?.howItWorks?.step1Title || "Sensor Mengumpulkan Data",
      description: t?.howItWorks?.step1Desc || "Sensor HAWA IoT yang terpasang di Bandung mengukur PM2.5, PM10, suhu, dan kelembaban setiap detik secara otomatis.",
      icon: <WifiIcon size={22} />,
    },
    {
      id: "step2",
      number: "2",
      title: t?.howItWorks?.step2Title || "AI Menganalisis Kondisi",
      description: t?.howItWorks?.step2Desc || "Data dikirim ke Meta Llama 4 yang mengolah dan memberikan analisis kondisi udara beserta tingkat risikonya.",
      icon: <MetaIcon size={22} />,
    },
    {
      id: "step3",
      number: "3",
      title: t?.howItWorks?.step3Title || "Visualisasi di Peta",
      description: t?.howItWorks?.step3Desc || "Hasil ditampilkan di peta interaktif Bandung lengkap dengan prediksi iklim per kecamatan dan grafik tren.",
      icon: <Map size={22} />,
    },
    {
      id: "step4",
      number: "4",
      title: t?.howItWorks?.step4Title || "Rekomendasi untuk Anda",
      description: t?.howItWorks?.step4Desc || "Dapatkan saran aktivitas, notifikasi WhatsApp, dan tips keamanan berdasarkan data terkini di area Anda.",
      icon: <BotMessageSquareIcon size={22} />,
    },
  ];

  return (
    <section id="how-it-works" className="py-24 px-6 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <SectionTransition className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-full text-sm font-semibold text-[#005AE1] mb-5">
            {t?.howItWorks?.badge}
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-5 tracking-tight">
            {t?.howItWorks?.headline || "Dari Sensor ke Rekomendasi"}
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            {t?.howItWorks?.subtitle || "Empat langkah sederhana untuk udara yang lebih sehat"}
          </p>
        </SectionTransition>

        {/* Card Spread */}
        <SectionTransition className="min-h-[400px] flex items-center justify-center" delay={0.2}>
          <CardSpread cards={steps} />
        </SectionTransition>
      </div>
    </section>
  );
}