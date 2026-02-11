"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";

interface LottieLoaderProps {
  size?: number;
  text?: string;
  className?: string;
}

export default function LottieLoader({ size = 120, text, className = "" }: LottieLoaderProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
      <DotLottieReact
        src="https://lottie.host/b7de9274-9147-4694-9fe4-cd6f09f4529a/cYqsueTkAg.lottie"
        loop
        autoplay
        style={{ width: size, height: size }}
      />
      {text && (
        <p className="text-sm text-gray-500 font-medium animate-pulse">{text}</p>
      )}
    </div>
  );
}
