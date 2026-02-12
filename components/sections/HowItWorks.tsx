"use client";

import { Wifi, Brain, Map, Target } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import SectionTransition from "@/components/SectionTransition";
import CardSpread, { CardSpreadItem } from "@/components/animata/card/card-spread";

export default function HowItWorks() {
  const { t } = useLanguage();

  const steps: CardSpreadItem[] = [
    {
      id: "step1",
      number: "01",
      title: t?.howItWorks?.step1Title || "Sensor Mengumpulkan Data",
      description: t?.howItWorks?.step1Desc || "Sensor HAWA IoT yang terpasang di Bandung mengukur PM2.5, PM10, suhu, dan kelembaban setiap detik secara otomatis.",
      icon: <Wifi size={22} />,
    },
    {
      id: "step2",
      number: "02",
      title: t?.howItWorks?.step2Title || "AI Menganalisis Kondisi",
      description: t?.howItWorks?.step2Desc || "Data dikirim ke Meta Llama 4 yang mengolah dan memberikan analisis kondisi udara beserta tingkat risikonya.",
      icon: <Brain size={22} />,
    },
    {
      id: "step3",
      number: "03",
      title: t?.howItWorks?.step3Title || "Visualisasi di Peta",
      description: t?.howItWorks?.step3Desc || "Hasil ditampilkan di peta interaktif Bandung lengkap dengan prediksi iklim per kecamatan dan grafik tren.",
      icon: <Map size={22} />,
    },
    {
      id: "step4",
      number: "04",
      title: t?.howItWorks?.step4Title || "Rekomendasi untuk Anda",
      description: t?.howItWorks?.step4Desc || "Dapatkan saran aktivitas, notifikasi WhatsApp, dan tips keamanan berdasarkan data terkini di area Anda.",
      icon: <Target size={22} />,
    },
  ];

  return (
    <section id="how-it-works" className="py-24 px-6 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <SectionTransition className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#E0F4FF] rounded-full text-sm font-semibold text-[#005AE1] mb-5">
            {t?.howItWorks?.badge || "Cara Kerja"}
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