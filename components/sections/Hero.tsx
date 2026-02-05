import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="min-h-screen flex items-center justify-center px-6 pt-32 overflow-hidden">
      <div className="max-w-6xl mx-auto w-full">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Mascot Image */}
          <div className="flex-1 flex justify-center lg:justify-start animate-fade-in-left">
            <div className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[440px] animate-float">
              <Image
                src="/maskot.png"
                alt="Hawa Mascot"
                fill
                sizes="(max-width: 768px) 300px, (max-width: 1024px) 400px, 500px"
                className="object-contain drop-shadow-2xl"
                priority
              />
            </div>
          </div>

          {/* Text Content */}
          <div className="flex-1 text-center lg:text-left">
            <h1 
              className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight bg-gradient-to-r from-[#005AE1] to-[#70D8FF] bg-clip-text text-transparent animate-fade-in-up animation-delay-100" 
              style={{ fontStyle: 'italic' }}
            >
              HAWA
            </h1>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 animate-fade-in-up animation-delay-200">
              Monitor Air Quality
            </h2>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#005AE1] to-[#70D8FF] bg-clip-text text-transparent !mb-8 animate-fade-in-up animation-delay-300">
              the Smart Way
            </h2>
            <p className="text-base md:text-lg text-gray-900 !mb-10 max-w-md mx-auto lg:mx-0 animate-fade-in-up animation-delay-400">
              Informasi kualitas udara sendiri dan dapatkan rekomendasi aktivitas secara langsung 
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up animation-delay-500">
              <Link
                href="/get-started"
                className="btn rounded-full !px-6 !py-4 text-base font-semibold bg-[#005AE1] text-white border-none hover:bg-[#0048b8] hover:scale-105 shadow-lg shadow-[#005AE1]/30 transition-all duration-200 flex items-center justify-center gap-2"
              >
                Mulai Gratis
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/demo"
                className="btn rounded-full !px-8 !py-4 text-base font-semibold bg-white text-[#005AE1] border-2 border-[#005AE1] hover:bg-[#E0F4FF] hover:scale-105 transition-all duration-200"
              >
                Lihat Demo
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}