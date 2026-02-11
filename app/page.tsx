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

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      
      <div className={`min-h-screen transition-opacity duration-1000 ${showSplash ? "opacity-0" : "opacity-100"}`}>
        <Navbar
          nav={[
            { label: "Home", href: "#hero" },
            { label: "Feature", href: "#features" },
            { label: "How it work", href: "#how-it-works" },
            { label: "About Us", href: "#about-us" },
          ]}
          lang="EN"
          onLangChange={(v) => console.log(v)}
        />
        <div id="hero">
          <HeroSection />
        </div>
        <Features />
        <DemoShowcase />
        <HowItWorks />
        <AboutUs />
        <Footer />
      </div>
    </>
  );
}