import { Map, Brain, Wifi, Target, Trophy, Newspaper } from "lucide-react";
import GroqIcon from "@/components/GroqIcon";

export default function Features() {
  const features = [
    {
      icon: <Wifi size={22} className="text-[#005AE1]" />,
      title: "Data Real-time IoT",
      description: "Sensor HAWA IoT tersebar di titik-titik strategis Bandung, mengirim data PM2.5, PM10, suhu, dan kelembaban secara langsung.",
    },
    {
      icon: <GroqIcon size={22} className="text-[#F55036]" />,
      title: "Analisis Groq AI",
      description: "AI dari Groq menganalisis data sensor dan memberikan rekomendasi kesehatan yang mudah dipahami oleh warga.",
    },
    {
      icon: <Map size={22} className="text-[#005AE1]" />,
      title: "Peta Interaktif",
      description: "Visualisasi kualitas udara di seluruh kecamatan Bandung. Klik untuk melihat prediksi dan data iklim.",
    },
    {
      icon: <Target size={22} className="text-[#005AE1]" />,
      title: "Rekomendasi Personal",
      description: "Saran aktivitas disesuaikan dengan usia, kondisi kesehatan, dan tingkat kualitas udara saat ini.",
    },
    {
      icon: <Trophy size={22} className="text-amber-500" />,
      title: "Gamifikasi & Quiz",
      description: "Dapatkan poin, naik level, dan jawab quiz tentang kualitas udara untuk meningkatkan kesadaran lingkungan.",
    },
    {
      icon: <Newspaper size={22} className="text-[#005AE1]" />,
      title: "Berita & Ringkasan AI",
      description: "Berita kualitas udara terkini dari berbagai sumber, dengan ringkasan otomatis dari Groq AI.",
    },
  ];

  return (
    <section id="features" className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#E0F4FF] rounded-full text-sm font-semibold text-[#005AE1] mb-5">
            Fitur Utama
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-5 tracking-tight">
            Semua yang Anda Butuhkan untuk{" "}
            <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-[#005AE1] to-[#4D9EFF] bg-clip-text text-transparent">
              Udara Lebih Sehat
            </span>
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Platform lengkap untuk memantau, memahami, dan bertindak berdasarkan kondisi kualitas udara di sekitar Anda.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, index) => (
            <div
              key={index}
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}