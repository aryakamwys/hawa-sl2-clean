"use client";

import Navbar from "@/components/Navbar";
import AboutUs from "@/components/sections/AboutUs";
import HowImportant from "@/components/sections/HowImportant";

export default function AboutUsPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HowImportant />
      <AboutUs />
    </div>
  );
}