"use client";

import Navbar from "@/components/Navbar";
import HeroSection from "@/components/sections/Hero";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar
        nav={[
          { label: "Home", href: "/" },
          { label: "Feature", href: "/feature" },
          { label: "How it work", href: "/how-it-works" },
          { label: "About Us", href: "/about-us" },
        ]}
        lang="EN"
        onLangChange={(v) => console.log(v)}
        loginHref="/login"
      />
      <HeroSection />
    </div>
  );
}