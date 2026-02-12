"use client";

import { useState } from "react";
import { Map, Newspaper, Trophy } from "lucide-react";
import MetaIcon from "@/components/MetaIcon";
import { useLanguage } from "@/hooks/useLanguage";
import SectionTransition from "@/components/SectionTransition";
import FluidTabs from "@/components/animata/card/fluid-tabs";

export default function DemoShowcase() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("map");

  const demos = [
    {
      id: "map",
      label: t?.demo?.map?.label || "Peta Interaktif",
      icon: <Map size={18} />,
      title: t?.demo?.map?.title || "Visualisasi Kualitas Udara di Peta Bandung",
      description: t?.demo?.map?.desc || "Klik kecamatan untuk melihat data iklim dan prediksi AI. Sensor IoT menampilkan data PM2.5 dan PM10 secara real-time dengan analisis dari Meta AI.",
      features: t?.demo?.map?.features || ["30 kecamatan Bandung", "Data iklim BPS", "Prediksi AI per wilayah", "Sensor IoT real-time"],
    },
    {
      id: "ai",
      label: t?.demo?.ai?.label || "Analisis AI",
      icon: <MetaIcon size={18} />,
      title: t?.demo?.ai?.title || "Analisis Cerdas dari Meta AI",
      description: t?.demo?.ai?.desc || "Dapatkan rekomendasi kesehatan yang dipersonalisasi berdasarkan kondisi udara terkini. AI menganalisis data sensor dan memberikan saran aktivitas yang aman.",
      features: t?.demo?.ai?.features || ["Rekomendasi personal", "Analisis PM2.5 & PM10", "Tips keamanan", "Kirim ke WhatsApp"],
    },
    {
      id: "news",
      label: t?.demo?.news?.label || "Berita AI",
      icon: <Newspaper size={18} />,
      title: t?.demo?.news?.title || "Berita Kualitas Udara dengan Ringkasan AI",
      description: t?.demo?.news?.desc || "Berita terkini dari berbagai sumber mengenai kualitas udara, dilengkapi dengan ringkasan otomatis dari Meta AI untuk kemudahan membaca.",
      features: t?.demo?.news?.features || ["Multi-sumber berita", "Ringkasan Meta AI", "Google News & BMKG", "Update harian"],
    },
    {
      id: "quiz",
      label: t?.demo?.quiz?.label || "Quiz & Game",
      icon: <Trophy size={18} />,
      title: t?.demo?.quiz?.title || "Belajar Sambil Bermain tentang Kualitas Udara",
      description: t?.demo?.quiz?.desc || "Jawab quiz interaktif, kumpulkan poin, dan naik level sambil meningkatkan pengetahuan tentang polusi udara dan cara melindungi diri.",
      features: t?.demo?.quiz?.features || ["Quiz interaktif AI", "Sistem poin & level", "Leaderboard", "Edukasi lingkungan"],
    },
  ];

  const activeDemo = demos.find((d) => d.id === activeTab)!;

  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <SectionTransition className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#E0F4FF] rounded-full text-sm font-semibold text-[#005AE1] mb-5">
            {t?.demo?.badge || "Fitur Lengkap"}
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-5 tracking-tight">
            {t?.demo?.headline || "Semua dalam Satu Platform"}
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            {t?.demo?.subtitle || "Click any tab to see detailed feature explanations"}
          </p>
        </SectionTransition>

        {/* Fluid Tabs */}
        <SectionTransition delay={0.2}>
          <FluidTabs
            tabs={demos.map((d) => ({ id: d.id, label: d.label, icon: d.icon }))}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            className="mb-10"
          />
        </SectionTransition>

        {/* Demo Content Card */}
        <SectionTransition delay={0.4}>
          <div className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              {/* Left: Description */}
              <div className="p-8 lg:p-10 flex flex-col justify-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
                  {activeDemo.title}
                </h3>
                <p className="text-gray-500 mb-6 leading-relaxed">
                  {activeDemo.description}
                </p>

                {/* Feature List */}
                <div className="grid grid-cols-2 gap-3">
                  {activeDemo.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#005AE1] flex-shrink-0" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Visual Preview */}
              <div className="bg-gradient-to-br from-[#e8f0ff] to-[#d8e8ff] p-8 lg:p-10 flex items-center justify-center min-h-[320px]">
                <div className="w-full max-w-sm bg-white rounded-xl shadow-xl border border-gray-200/60 overflow-hidden">
                  {/* Mock Window Bar */}
                  <div className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-100 border-b border-gray-200">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                    <div className="flex-1 ml-3 h-5 bg-gray-200 rounded-md" />
                  </div>

                  {/* Mock Content */}
                  <div className="p-5">
                    {activeTab === "map" && (
                      <div className="space-y-3">
                        <div className="h-32 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg flex items-center justify-center">
                          <Map size={32} className="text-[#005AE1] opacity-60" />
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1 h-8 bg-green-50 rounded-lg border border-green-200 flex items-center justify-center text-xs font-semibold text-green-700">AMAN</div>
                          <div className="flex-1 h-8 bg-orange-50 rounded-lg border border-orange-200 flex items-center justify-center text-xs font-semibold text-orange-700">PM2.5: 12</div>
                        </div>
                      </div>
                    )}
                    {activeTab === "ai" && (
                      <div className="rounded-lg overflow-hidden border border-gray-200/60 bg-white shadow-lg">
                        <img
                          src="https://aicdn.picsart.com/4d68d399-f7bf-41bc-bcf8-c3d56a2f98f3.png"
                          alt="Meta AI Analysis Interface"
                          className="w-full h-auto"
                        />
                      </div>
                    )}
                    {activeTab === "news" && (
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex gap-3 items-start">
                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex-shrink-0 flex items-center justify-center">
                              <Newspaper size={14} className="text-[#005AE1] opacity-60" />
                            </div>
                            <div className="flex-1 space-y-1.5">
                              <div className="h-2.5 bg-gray-100 rounded-full w-full" />
                              <div className="h-2.5 bg-gray-100 rounded-full w-3/4" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {activeTab === "quiz" && (
                      <div className="space-y-3">
                        <div className="text-center">
                          <Trophy size={24} className="text-amber-500 mx-auto mb-2" />
                          <div className="text-sm font-bold text-gray-800 mb-1">Quiz Kualitas Udara</div>
                        </div>
                        {["A. Oksigen", "B. PM2.5", "C. Nitrogen"].map((opt, i) => (
                          <div key={i} className={`p-2.5 rounded-lg border text-xs font-medium ${i === 1 ? "bg-blue-50 border-[#005AE1] text-[#005AE1]" : "bg-gray-50 border-gray-200 text-gray-600"}`}>
                            {opt}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SectionTransition>
      </div>
    </section>
  );
}
