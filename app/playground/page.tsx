"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import { HawaModel } from "@/components/three/HawaModel";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PlaygroundPage() {
    return (
        <div className="w-full h-screen bg-gray-50 relative">
            {/* Back Button */}
            <div className="absolute top-6 left-6 z-50">
                <Link
                    href="/"
                    className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors text-gray-700 font-medium border border-gray-200"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </Link>
            </div>

            <div className="absolute top-20 left-6 right-6 md:top-6 md:left-auto md:right-6 z-40 pointer-events-none flex justify-center md:justify-end">
                <div className="px-4 py-2 bg-white/60 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200 text-xs md:text-sm text-gray-600 text-center md:text-right">
                    <p className="hidden md:block">Left Click + Drag to Rotate</p>
                    <p className="hidden md:block">Right Click + Drag to Pan</p>
                    <p className="hidden md:block">Scroll to Zoom</p>
                    <p className="md:hidden">Drag to Rotate • Pinch to Zoom</p>
                </div>
            </div>

            <Suspense fallback={
                <div className="w-full h-full flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-[#005AE1] border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-gray-400 font-medium">Loading 3D Playground...</span>
                    </div>
                </div>
            }>
                <Canvas
                    camera={{ position: [0, 0, 8], fov: 45, near: 0.1, far: 1000 }}
                    className="w-full h-full"
                    dpr={[1, 1.5]}
                    gl={{
                        antialias: true,
                        powerPreference: "high-performance",
                        preserveDrawingBuffer: false, // Helps with memory
                        alpha: true
                    }}
                >
                    <ambientLight intensity={0.5} />
                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
                    <Environment preset="city" />

                    <OrbitControls makeDefault />

                    <HawaModel position={[0, -1, 0]} />
                </Canvas>
            </Suspense>
        </div>
    );
}
