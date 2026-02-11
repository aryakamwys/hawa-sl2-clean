"use client";

import { useEffect, useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onFinish, 500); // Wait for fade out
    }, 3000); // Show splash for 3 seconds

    return () => clearTimeout(timer);
  }, [onFinish]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-white transition-opacity duration-500 ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="w-64 h-64 md:w-80 md:h-80">
        <DotLottieReact
          src="https://lottie.host/e1d29b6b-c12a-4332-a25b-c86118c42d37/Ifn0SMPM75.lottie"
          loop
          autoplay
        />
      </div>
    </div>
  );
}
