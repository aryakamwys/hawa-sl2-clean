import Link from "next/link";

export default function CTA() {
  return (
    <section className="!py-20 !px-6 !bg-gradient-to-r !from-[#005AE1] !to-[#0066FF]">
      <div className="!max-w-4xl !mx-auto !text-center">
        <h2 className="!text-4xl md:!text-5xl !font-bold !text-white !mb-6">
          Siap Lindungi Keluarga Anda?
        </h2>
        <p className="!text-xl !text-white/90 !mb-10 !max-w-2xl !mx-auto">
          Mulai pantau kualitas udara di sekitar Anda sekarang juga
        </p>
        <Link
          href="/map"
          className="!inline-block !px-8 !py-4 !bg-white !text-[#005AE1] !rounded-full !font-bold !text-lg hover:!bg-gray-100 !transition-all !duration-300 hover:!scale-105 !shadow-xl"
        >
          Mulai Sekarang →
        </Link>
      </div>
    </section>
  );
}
