import Image from "next/image";

export default function AboutUs() {
  return (
    <section id="about-us" className="!py-20 !px-6 !bg-white">
      <div className="!max-w-6xl !mx-auto">
        <div className="!grid !grid-cols-1 lg:!grid-cols-2 !gap-12 !items-center">
          {/* Left: Text Content */}
          <div>
            <h2 className="!text-4xl md:!text-5xl !font-bold !text-gray-900 !mb-6">
              Tentang HAWA
            </h2>
            <p className="!text-lg !text-gray-600 !mb-6 !leading-relaxed">
              HAWA adalah platform monitoring kualitas udara berbasis IoT dan AI yang dirancang khusus untuk membantu masyarakat Bandung memahami dan merespons kondisi udara di sekitar mereka.
            </p>
            <p className="!text-lg !text-gray-600 !mb-8 !leading-relaxed">
              Dengan sensor yang tersebar di berbagai lokasi dan analisis AI yang canggih, kami memberikan informasi real-time yang mudah dipahami dan rekomendasi yang disesuaikan dengan kebutuhan Anda.
            </p>

            {/* Stats */}
            <div className="!grid !grid-cols-2 !gap-6">
              <div className="!p-6 !bg-[#E0F4FF] !rounded-2xl !border-2 !border-[#005AE1]">
                <div className="!text-4xl !font-bold !text-[#005AE1] !mb-2">10+</div>
                <div className="!text-sm !text-gray-700 !font-medium">Active Users</div>
              </div>
              <div className="!p-6 !bg-[#E0F4FF] !rounded-2xl !border-2 !border-[#005AE1]">
                <div className="!text-4xl !font-bold !text-[#005AE1] !mb-2">99.9%</div>
                <div className="!text-sm !text-gray-700 !font-medium">Uptime</div>
              </div>
            </div>
          </div>

          {/* Right: Illustration */}
          <div className="!relative !w-full !h-[400px] !bg-gradient-to-br !from-[#005AE1] !to-[#70D8FF] !rounded-3xl !flex !items-center !justify-center !p-8">
            <div className="!relative !w-64 !h-64">
              <Image
                src="/maskot.png"
                alt="HAWA Mascot"
                fill
                className="!object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}