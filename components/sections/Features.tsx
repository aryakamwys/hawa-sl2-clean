"use client";

import { Map, Brain, Wifi, Target, Trophy, Newspaper } from "lucide-react";
import MetaIcon from "@/components/MetaIcon";
import { useLanguage } from "@/hooks/useLanguage";
import { motion, Variants } from "framer-motion";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
  },
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

export default function Features() {
  const { t } = useLanguage();

  const features = [
    {
      icon: <Wifi size={22} className="text-[#005AE1]" />,
      title: t?.features?.realtimeIoT || "Data Real-time IoT",
      description: t?.features?.realtimeIoTDesc || "Sensor HAWA IoT tersebar di titik-titik strategis Bandung, mengirim data PM2.5, PM10, suhu, dan kelembaban secara langsung.",
    },
    {
      icon: <MetaIcon size={22} className="text-[#F55036]" />,
      title: t?.features?.metaAI || "Analisis Meta AI",
      description: t?.features?.metaAIDesc || "AI dari Meta Llama 4 menganalisis data sensor dan memberikan rekomendasi kesehatan yang mudah dipahami oleh warga.",
    },
    {
      icon: <Map size={22} className="text-[#005AE1]" />,
      title: t?.features?.interactiveMap || "Peta Interaktif",
      description: t?.features?.interactiveMapDesc || "Visualisasi kualitas udara di seluruh kecamatan Bandung. Klik untuk melihat prediksi dan data iklim.",
    },
    {
      icon: <Target size={22} className="text-[#005AE1]" />,
      title: t?.features?.personalRec || "Rekomendasi Personal",
      description: t?.features?.personalRecDesc || "Saran aktivitas disesuaikan dengan usia, kondisi kesehatan, dan tingkat kualitas udara saat ini.",
    },
    {
      icon: <Trophy size={22} className="text-amber-500" />,
      title: t?.features?.gamification || "Gamifikasi & Quiz",
      description: t?.features?.gamificationDesc || "Dapatkan poin, naik level, dan jawab quiz tentang kualitas udara untuk meningkatkan kesadaran lingkungan.",
    },
    {
      icon: <Newspaper size={22} className="text-[#005AE1]" />,
      title: t?.features?.newsAI || "Berita & Ringkasan AI",
      description: t?.features?.newsAIDesc || "Berita kualitas udara terkini dari berbagai sumber, dengan ringkasan otomatis dari Meta AI.",
    },
  ];

  return (
    <section id="features" className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#E0F4FF] rounded-full text-sm font-semibold text-[#005AE1] mb-5">
            {t?.features?.badge || "Fitur Utama"}
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-5 tracking-tight">
            {t?.features?.headline || "Semua yang Anda Butuhkan untuk"}{" "}
            <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-[#005AE1] to-[#4D9EFF] bg-clip-text text-transparent">
              {t?.features?.headlineHighlight || "Udara Lebih Sehat"}
            </span>
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            {t?.features?.description || "Platform lengkap untuk memantau, memahami, dan bertindak berdasarkan kondisi kualitas udara di sekitar Anda."}
          </p>
        </motion.div>

        {/* Feature Grid with Staggered Animation */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="group p-6 bg-white border border-gray-200 rounded-2xl hover:shadow-xl hover:border-[#005AE1]/20 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#E0F4FF] transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}