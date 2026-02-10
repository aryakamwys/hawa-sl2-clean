"use client";

import Navbar from "@/components/Navbar";
import HeroSection from "@/components/sections/Hero";
import Features from "@/components/sections/Features";
import HowItWorks from "@/components/sections/HowItWorks";
import AboutUs from "@/components/sections/AboutUs";
import CTA from "@/components/sections/CTA";
import Footer from "@/components/sections/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen">
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
      <HowItWorks />
      <AboutUs />
      <CTA />
      <Footer />
    </div>
  );
}