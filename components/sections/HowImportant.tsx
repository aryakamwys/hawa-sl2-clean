import SectionTransition from "@/components/SectionTransition";
import { useLanguage } from "@/hooks/useLanguage";
import { ShieldPlus, Brain, Baby } from "lucide-react";

export default function HowImportant() {
  const { t } = useLanguage();
  
  const points = [
    {
      icon: <ShieldPlus className="w-8 h-8 text-blue-600" />,
      title: t?.howImportant?.health || "Perlindungan Kesehatan",
      desc: t?.howImportant?.healthDesc || "Paparan udara berpolusi dalam jangka panjang dapat menyebabkan penyakit pernapasan, masalah jantung, dan gangguan kesehatan lainnya."
    },
    {
      icon: <Brain className="w-8 h-8 text-blue-600" />,
      title: t?.howImportant?.productivity || "Produktivitas Harian",
      desc: t?.howImportant?.productivityDesc || "Udara bersih meningkatkan fokus, fungsi otak, dan kesejahteraan, menjaga Anda tetap aktif dan produktif."
    },
    {
      icon: <Baby className="w-8 h-8 text-blue-600" />,
      title: t?.howImportant?.future || "Generasi Masa Depan",
      desc: t?.howImportant?.futureDesc || "Memantau dan memperbaiki kualitas udara hari ini memastikan lingkungan yang lebih sehat bagi anak-anak kita esok."
    }
  ];

  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: Title & Description */}
          <SectionTransition className="lg:col-span-5">
            <div className="text-left">
              <span className="text-blue-600 font-semibold tracking-wider text-sm uppercase">
                {t?.howImportant?.badge || "Mengapa Penting"}
              </span>
              <h2 className="text-3xl md:text-5xl font-bold mt-3 text-gray-900 leading-tight">
                {t?.howImportant?.headline || "Seberapa Penting"} <br className="hidden lg:block" />
                <span className="text-blue-600">{t?.howImportant?.headlineHighlight || "Kualitas Udara?"}</span>
              </h2>
              <p className="mt-6 text-gray-500 leading-relaxed text-lg">
                {t?.howImportant?.description || "Memahami kualitas udara membantu melindungi Anda dan keluarga dari ancaman tak terlihat di lingkungan."}
              </p>
            </div>
          </SectionTransition>

          {/* Right: Cards */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {points.map((point, idx) => (
              <SectionTransition 
                key={idx} 
                delay={idx * 0.1}
                className={idx === 2 ? "sm:col-span-2" : ""}
              >
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 h-full">
                  <div className="bg-blue-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
                    {point.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{point.title}</h3>
                  <p className="text-gray-500 leading-relaxed text-sm">
                    {point.desc}
                  </p>
                </div>
              </SectionTransition>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
