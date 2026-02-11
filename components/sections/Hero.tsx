"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/hooks/useLanguage";
import SectionTransition from "@/components/SectionTransition";

export default function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#d8e8ff] via-[#e8f0ff] to-white" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(rgba(0,90,225,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,90,225,1) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      <SectionTransition className="relative z-10 max-w-5xl mx-auto px-6 pt-36 pb-8 text-center" delay={0.2}>
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full text-sm font-medium text-gray-700 mb-8 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          {t?.hero?.badge || "Platform IoT & AI Kualitas Udara"}
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6 tracking-tight">
          {t?.hero?.headline || "Pantau Kualitas Udara"}{" "}
          <span className="bg-gradient-to-r from-[#005AE1] to-[#4D9EFF] bg-clip-text text-transparent">
            {t?.hero?.headlineHighlight || "Secara Cerdas"}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          {t?.hero?.subtitle || "Data real-time dari sensor IoT, analisis AI dari Meta Llama 4, dan rekomendasi yang dipersonalisasi untuk masyarakat Bandung."}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link
            href="/map"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#005AE1] text-white rounded-full font-semibold text-base hover:bg-[#004BB8] transition-all duration-200 shadow-lg shadow-[#005AE1]/25 hover:shadow-xl hover:shadow-[#005AE1]/30"
          >
            {t?.hero?.ctaStart || "Mulai Sekarang"}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <a
            href="#features"
            className="inline-flex items-center justify-center px-7 py-3.5 bg-white text-gray-700 rounded-full font-semibold text-base border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
          >
            {t?.hero?.ctaFeatures || "Lihat Fitur"}
          </a>
        </div>

        {/* Hero Image — App Screenshot */}
        <div className="relative mx-auto max-w-5xl mt-8">
          <div className="rounded-xl overflow-hidden shadow-2xl shadow-[#005AE1]/20 border border-gray-200/60 bg-white p-2">
            <img
              src="https://aicdn.picsart.com/4d68d399-f7bf-41bc-bcf8-c3d56a2f98f3.png"
              alt="HAWA Platform Interface"
              className="w-full h-auto rounded-lg"
            />
          </div>
          {/* Glow effect */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#005AE1]/20 blur-[100px] -z-10 rounded-full opacity-50 pointer-events-none" />
        </div>
      </SectionTransition>
    </section>
  );
}