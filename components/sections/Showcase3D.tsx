"use client";

import { useRef } from "react";
import { useInView, motion } from "framer-motion";
import SectionTransition from "@/components/SectionTransition";
import { useLanguage } from "@/hooks/useLanguage";
import Link from "next/link";
import Image from "next/image";
import { Maximize2 } from "lucide-react";

export default function Showcase3D() {
    const { t } = useLanguage();
    const ref = useRef(null);
    const isInView = useInView(ref, { amount: 0.1, margin: "0px 0px -100px 0px" });

    return (
        <section ref={ref} className="py-24 px-6 bg-gradient-to-br from-gray-50 to-white relative overflow-visible">
            <div className="max-w-7xl mx-auto relative">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">

                    {/* Left Column: Text */}
                    <div className="">
                        <SectionTransition>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#E0F4FF] rounded-full text-sm font-semibold text-[#005AE1] mb-5">
                                3D Showcase
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                                Experience
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#005AE1] to-[#60A5FA] ml-2">
                                    HAWA
                                </span>
                            </h2>
                            <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-lg">
                                Lihat lebih dekat perangkat inovatif kami. Klik tombol di bawah untuk masuk ke mode interaktif 3D penuh dan memutar perangkat 360 derajat.
                            </p>

                            <Link href="/playground" className="inline-flex items-center gap-3 text-sm font-medium text-white bg-[#005AE1] hover:bg-[#004bb5] px-6 py-3 rounded-lg transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all">
                                <Maximize2 className="w-4 h-4" />
                                <span>Buka Mode Interaktif 3D</span>
                            </Link>

                            <div className="mt-4 flex items-center gap-3 text-sm text-gray-500 bg-white/50 p-3 rounded-lg border border-gray-100 w-fit">
                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#005AE1]">
                                        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <span>Tampilan Preview Static</span>
                            </div>
                        </SectionTransition>
                    </div>

                    {/* Right Column: Spacer for Mobile, but Image is absolute on Desktop */}
                    <div className="hidden lg:block h-[400px] lg:h-auto lg:min-h-[600px] pointer-events-none">
                        {/* Spacer */}
                    </div>

                </div>

                {/* Static Image - Relative on Mobile, Absolute on Desktop */}
                <div className="relative w-full h-[500px] lg:absolute lg:top-0 lg:right-0 lg:w-[65%] lg:h-[120%] lg:-top-[10%] flex items-center justify-center pl-12 lg:pl-0 z-0 lg:-mr-32 pointer-events-none mt-4 lg:mt-0">
                    <SectionTransition delay={0.2} className="relative w-full h-full flex items-center justify-center">
                        {/* Floating Animation Wrapper */}
                        <motion.div
                            className="w-full h-full relative"
                            animate={{ y: [0, -20, 0] }}
                            transition={{
                                duration: 6,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            <Image
                                src="/hawa-device.png"
                                alt="Hawa Device Preview"
                                fill
                                className="object-contain drop-shadow-2xl scale-125 lg:scale-125"
                                priority
                            />
                        </motion.div>
                    </SectionTransition>
                </div>

            </div>
        </section>
    );
}
