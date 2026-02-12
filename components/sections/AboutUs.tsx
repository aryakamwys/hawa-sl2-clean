import Image from "next/image";
import SectionTransition from "@/components/SectionTransition";
import { useLanguage } from "@/hooks/useLanguage";

export default function AboutUs() {
  const { t } = useLanguage();

  return (
    <section id="about-us" className=" px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text Content */}
          <SectionTransition>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 tracking-tight leading-tight">
              {t?.aboutUs?.headline || "Melindungi Masyarakat Bandung dengan Data & AI"}
            </h2>
            <p className="text-gray-500 mb-5 leading-relaxed text-justify">
              {t?.aboutUs?.desc1 || "HAWA adalah platform monitoring kualitas udara berbasis IoT dan AI yang dirancang khusus untuk membantu warga Bandung memahami dan merespons kondisi udara di lingkungan mereka. Dengan sensor yang tersebar di berbagai titik strategis dan analisis AI dari Groq, kami memberikan informasi real-time yang akurat dan mudah dipahami."}
            </p>
            <p className="text-gray-500 mb-8 leading-relaxed text-justify">
              {t?.aboutUs?.initiative || "HAWA dikembangkan melalui program YDCT by SL2 sebagai inisiatif pemanfaatan teknologi berbasis data untuk menciptakan solusi nyata terhadap tantangan lingkungan perkotaan."}
            </p>
          </SectionTransition>

          {/* Right: Mascot */}
          <SectionTransition className="flex justify-center" delay={0.2}>
            <div className="relative w-[320px] h-[320px] md:w-[400px] md:h-[400px]">
              <div className="absolute inset-0 rounded-3xl" style={{ background: 'white' }} />
              <Image
                src="/maskot.png"
                alt="HAWA Mascot"
                fill
                className="object-contain p-8 drop-shadow-lg relative z-10"
              />
              {/* Decorative Element */}
              <div className="absolute -top-6 -right-6 w-20 h-20 md:-top-8 md:-right-8 md:w-28 md:h-28 z-20">
                <Image
                  src="/sl2.png"
                  alt=""
                  fill
                  sizes="(max-width: 768px) 80px, 112px"
                  className="object-contain"
                />
              </div>
            </div>
          </SectionTransition>
        </div>
      </div>
    </section>
  );
}