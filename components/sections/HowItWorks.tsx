export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Sensor Mengumpulkan Data",
      description: "Sensor HAWA IoT yang terpasang di Bandung mengukur PM2.5, PM10, suhu, dan kelembaban setiap detik secara otomatis.",
    },
    {
      number: "02",
      title: "AI Menganalisis Kondisi",
      description: "Data dikirim ke Groq AI yang mengolah dan memberikan analisis kondisi udara beserta tingkat risikonya.",
    },
    {
      number: "03",
      title: "Visualisasi di Peta",
      description: "Hasil ditampilkan di peta interaktif Bandung lengkap dengan prediksi iklim per kecamatan dan grafik tren.",
    },
    {
      number: "04",
      title: "Rekomendasi untuk Anda",
      description: "Dapatkan saran aktivitas, notifikasi WhatsApp, dan tips keamanan berdasarkan data terkini di area Anda.",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#E0F4FF] rounded-full text-sm font-semibold text-[#005AE1] mb-5">
            Cara Kerja
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-5 tracking-tight">
            Dari Sensor ke Rekomendasi
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Empat langkah sederhana untuk udara yang lebih sehat
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="p-6 bg-white rounded-2xl border border-gray-200 h-full hover:shadow-lg hover:border-[#005AE1]/20 transition-all duration-300">
                {/* Number */}
                <div className="w-10 h-10 bg-[#005AE1] text-white rounded-xl flex items-center justify-center text-sm font-bold mb-4">
                  {step.number}
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Connector Arrow (desktop only) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:flex absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-300">
                    <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}