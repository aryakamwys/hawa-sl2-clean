"use client";

import Navbar from "@/components/Navbar";
import Features from "@/components/sections/Features";

export default function FeaturePage() {
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
      <Features />
    </div>
  );
}