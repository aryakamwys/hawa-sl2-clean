export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: "🔍",
      title: "Pasang Sensor",
      description: "Sensor IoT kami dipasang di berbagai titik strategis di Bandung untuk mengumpulkan data kualitas udara secara real-time"
    },
    {
      number: "02",
      icon: "📡",
      title: "AI Analisis",
      description: "Data dari sensor dianalisis menggunakan AI untuk memberikan insight yang mudah dipahami tentang kondisi udara"
    },
    {
      number: "03",
      icon: "📱",
      title: "Visualisasi Data",
      description: "Lihat hasil analisis dalam bentuk peta interaktif, grafik, dan rekomendasi yang disesuaikan dengan profil Anda"
    },
    {
      number: "04",
      icon: "🎯",
      title: "Tindakan Alert",
      description: "Dapatkan notifikasi dan rekomendasi aktivitas berdasarkan kondisi kualitas udara saat ini di lokasi Anda"
    },
  ];

  return (
    <section id="how-it-works" className="!py-20 !px-6 !bg-gray-50">
      <div className="!max-w-6xl !mx-auto">
        {/* Title */}
        <div className="!text-center !mb-16">
          <h2 className="!text-4xl md:!text-5xl !font-bold !text-gray-900 !mb-4">
            Cara Kerja
          </h2>
          <p className="!text-lg !text-gray-600 !max-w-2xl !mx-auto">
            Dari sensor hingga rekomendasi, begini cara HAWA bekerja untuk Anda
          </p>
        </div>

        {/* Steps Grid */}
        <div className="!grid !grid-cols-1 md:!grid-cols-2 lg:!grid-cols-4 !gap-8">
          {steps.map((step, index) => (
            <div key={index} className="!relative">
              {/* Number Badge */}
              <div className="!flex !items-center !gap-4 !mb-4">
                <div className="!w-16 !h-16 !bg-[#005AE1] !text-white !rounded-full !flex !items-center !justify-center !text-2xl !font-bold !flex-shrink-0">
                  {step.number}
                </div>
                <div className="!text-4xl">{step.icon}</div>
              </div>
              
              {/* Content */}
              <h3 className="!text-xl !font-bold !text-gray-900 !mb-3">
                {step.title}
              </h3>
              <p className="!text-gray-600 !leading-relaxed">
                {step.description}
              </p>

              {/* Connector Line (hidden on mobile, shown on desktop) */}
              {index < steps.length - 1 && (
                <div className="!hidden lg:!block !absolute !top-8 !left-full !w-full !h-0.5 !bg-[#E0F4FF] -!translate-x-1/2" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}