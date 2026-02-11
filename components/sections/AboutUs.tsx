import Image from "next/image";

export default function AboutUs() {
  return (
    <section id="about-us" className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text Content */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#E0F4FF] rounded-full text-sm font-semibold text-[#005AE1] mb-5">
              Tentang Kami
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 tracking-tight leading-tight">
              Melindungi Masyarakat Bandung dengan Data & AI
            </h2>
            <p className="text-gray-500 mb-5 leading-relaxed">
              HAWA adalah platform monitoring kualitas udara berbasis IoT dan AI yang dirancang khusus untuk membantu warga Bandung memahami dan merespons kondisi udara di lingkungan mereka.
            </p>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Dengan sensor yang tersebar di berbagai titik strategis dan analisis AI dari Groq, kami memberikan informasi real-time yang akurat dan mudah dipahami.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="text-2xl font-bold text-[#005AE1] mb-1">4+</div>
                <div className="text-xs text-gray-500 font-medium">Sensor IoT</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="text-2xl font-bold text-[#005AE1] mb-1">30</div>
                <div className="text-xs text-gray-500 font-medium">Kecamatan</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="text-2xl font-bold text-[#005AE1] mb-1">24/7</div>
                <div className="text-xs text-gray-500 font-medium">Monitoring</div>
              </div>
            </div>
          </div>

          {/* Right: Mascot */}
          <div className="flex justify-center">
            <div className="relative w-[320px] h-[320px] md:w-[400px] md:h-[400px]">
              <div className="absolute inset-0 rounded-3xl" style={{ background: 'linear-gradient(180deg, #70D8FF 0%, #399AF0 25%, #005AE1 75%)' }} />
              <Image
                src="/maskot.png"
                alt="HAWA Mascot"
                fill
                className="object-contain p-8 drop-shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}