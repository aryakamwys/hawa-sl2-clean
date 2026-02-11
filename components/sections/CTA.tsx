import Link from "next/link";

export default function CTA() {
  return (
    <section id="cta-section" className="py-24 px-6 relative overflow-hidden">
      {/* Background */}

      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5 tracking-tight">
          Siap Lindungi Keluarga Anda?
        </h2>
        <p className="text-lg text-white/80 mb-10 max-w-xl mx-auto leading-relaxed">
          Mulai pantau kualitas udara di sekitar Anda sekarang juga. Gratis dan mudah digunakan.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/map"
            id="cta-button"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#005AE1] rounded-full font-bold text-base hover:bg-gray-100 transition-all duration-200 shadow-xl hover:scale-105"
          >
            Mulai Sekarang
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
