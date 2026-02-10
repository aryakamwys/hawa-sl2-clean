export default function Features() {
  const features = [
    {
      icon: "📊",
      title: "Data Real-time",
      description: "Pantau kualitas udara secara langsung dari sensor IoT di Bandung"
    },
    {
      icon: "🤖",
      title: "AI Groq",
      description: "Seputar kualitas udara dengan AI yang cerdas"
    },
    {
      icon: "📍",
      title: "Analisa Lokasi",
      description: "Lihat kualitas udara di berbagai titik lokasi di Bandung"
    },
    {
      icon: "🎯",
      title: "Target Spesifik",
      description: "Rekomendasi disesuaikan dengan usia dan kondisi kesehatan"
    },
    {
      icon: "🏆",
      title: "Gamifikasi",
      description: "Dapatkan poin dan level dengan belajar tentang kualitas udara"
    },
    {
      icon: "🤖",
      title: "AI Powered",
      description: "Analisis mendalam menggunakan teknologi AI terkini"
    },
  ];

  return (
    <section id="features" className="!py-20 !px-6 !bg-white">
      <div className="!max-w-6xl !mx-auto">
        {/* Title */}
        <div className="!text-center !mb-16">
          <h2 className="!text-4xl md:!text-5xl !font-bold !text-gray-900 !mb-4">
            Alat Powerful untuk Udara Sehat
          </h2>
          <p className="!text-lg !text-gray-600 !max-w-2xl !mx-auto">
            Fitur lengkap untuk memantau dan memahami kualitas udara di sekitar Anda
          </p>
        </div>

        {/* Feature Grid */}
        <div className="!grid !grid-cols-1 md:!grid-cols-2 lg:!grid-cols-3 !gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="!p-6 !bg-white !border !border-gray-200 !rounded-2xl hover:!shadow-lg !transition-all !duration-300 hover:!-translate-y-1"
            >
              <div className="!w-14 !h-14 !bg-[#E0F4FF] !rounded-full !flex !items-center !justify-center !text-3xl !mb-4">
                {feature.icon}
              </div>
              <h3 className="!text-xl !font-bold !text-gray-900 !mb-2">
                {feature.title}
              </h3>
              <p className="!text-gray-600 !leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}