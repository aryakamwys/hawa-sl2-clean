"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/sections/Hero";
import Features from "@/components/sections/Features";
import DemoShowcase from "@/components/sections/DemoShowcase";
import HowItWorks from "@/components/sections/HowItWorks";
import AboutUs from "@/components/sections/AboutUs";
import Footer from "@/components/sections/Footer";
import SplashScreen from "@/components/SplashScreen";
import FlyingMascot from "@/components/FlyingMascot";

import CTA from "@/components/sections/CTA";

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      <div className={`min-h-screen transition-opacity duration-1000 ${showSplash ? "opacity-0" : "opacity-100"}`}>
        <Navbar />
        <div id="hero">
          <HeroSection />
        </div>
        <Features />
        <DemoShowcase />
        <HowItWorks />
        <AboutUs />
        <div style={{ background: 'linear-gradient(180deg, #70D8FF 0%, #399AF0 41%, #005AE1 100%)' }}>
          <CTA />
          <Footer />
        </div>
        <FlyingMascot />
      </div>
    </>
  );
}