"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function LogoCarousel() {
  // Duplicate the logos to ensure seamless scrolling
  // We need enough copies to fill the screen width + some buffer
  const logos = [
    {
      label: "A Program of Sustainable Living Lab (SL2)",
      title: "YDCT",
      src: "https://sustainablelivinglab.org/images/logo.svg",
      width: 150,
      height: 40,
    },
    {
      label: "Powered by",
      title: "LLaMA 4 Scout",
      src: "https://static.xx.fbcdn.net/rsrc.php/y9/r/tL_v571NdZ0.svg",
      width: 106,
      height: 19,
      isMeta: true,
    },
    {
      label: "Integrated with",
      title: "WhatsApp",
      src: "https://static.whatsapp.net/rsrc.php/yZ/r/JvsnINJ2CZv.svg",
      width: 120,
      height: 30,
    },
  ];

  return (
    <section className="py-10 bg-white overflow-hidden relative">
      <div className="flex w-full">
        {/* First marquee container */}
        <div className="flex animate-marquee whitespace-nowrap min-w-full shrink-0 items-center justify-around gap-16 px-8 will-change-transform">
          {logos.map((logo, index) => (
            <div key={`logo-1-${index}`} className="flex flex-col items-center justify-center opacity-70 hover:opacity-100 transition-opacity duration-300 group cursor-default mx-8">
              <span className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">{logo.label}</span>
              <div className="h-12 flex items-center justify-center relative">
                 <img 
                    src={logo.src} 
                    alt={logo.title} 
                    className={`h-auto w-auto max-h-8 object-contain ${logo.isMeta ? 'brightness-0 opacity-60 group-hover:opacity-100 group-hover:brightness-100 transition-all' : 'grayscale group-hover:grayscale-0 transition-all'}`}
                    style={{ maxHeight: logo.isMeta ? '20px' : '32px' }}
                 />
              </div>
            </div>
          ))}
           {/* Add duplicate logos inside to ensure wrap if screen is very wide */}
           {logos.map((logo, index) => (
            <div key={`logo-1-dup-${index}`} className="flex flex-col items-center justify-center opacity-70 hover:opacity-100 transition-opacity duration-300 group cursor-default mx-8">
              <span className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">{logo.label}</span>
              <div className="h-12 flex items-center justify-center relative">
                 <img 
                    src={logo.src} 
                    alt={logo.title} 
                    className={`h-auto w-auto max-h-8 object-contain ${logo.isMeta ? 'brightness-0 opacity-60 group-hover:opacity-100 group-hover:brightness-100 transition-all' : 'grayscale group-hover:grayscale-0 transition-all'}`}
                    style={{ maxHeight: logo.isMeta ? '20px' : '32px' }}
                 />
              </div>
            </div>
          ))}
        </div>

        {/* Second marquee container (duplicate for seamless loop) */}
        <div className="flex animate-marquee whitespace-nowrap min-w-full shrink-0 items-center justify-around gap-16 px-8 will-change-transform">
          {logos.map((logo, index) => (
            <div key={`logo-2-${index}`} className="flex flex-col items-center justify-center opacity-70 hover:opacity-100 transition-opacity duration-300 group cursor-default mx-8">
              <span className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">{logo.label}</span>
              <div className="h-12 flex items-center justify-center relative">
                 <img 
                    src={logo.src} 
                    alt={logo.title} 
                    className={`h-auto w-auto max-h-8 object-contain ${logo.isMeta ? 'brightness-0 opacity-60 group-hover:opacity-100 group-hover:brightness-100 transition-all' : 'grayscale group-hover:grayscale-0 transition-all'}`}
                    style={{ maxHeight: logo.isMeta ? '20px' : '32px' }}
                 />
              </div>
            </div>
          ))}
           {/* Add duplicate logos inside to ensure wrap if screen is very wide */}
           {logos.map((logo, index) => (
            <div key={`logo-2-dup-${index}`} className="flex flex-col items-center justify-center opacity-70 hover:opacity-100 transition-opacity duration-300 group cursor-default mx-8">
              <span className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">{logo.label}</span>
              <div className="h-12 flex items-center justify-center relative">
                 <img 
                    src={logo.src} 
                    alt={logo.title} 
                    className={`h-auto w-auto max-h-8 object-contain ${logo.isMeta ? 'brightness-0 opacity-60 group-hover:opacity-100 group-hover:brightness-100 transition-all' : 'grayscale group-hover:grayscale-0 transition-all'}`}
                    style={{ maxHeight: logo.isMeta ? '20px' : '32px' }}
                 />
              </div>
            </div>
          ))}
        </div>
      </div>
     
     {/* Gradient overlay for fade effect */}
     <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-white to-transparent pointer-events-none" />
     <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-white to-transparent pointer-events-none" />
    </section>
  );
}
