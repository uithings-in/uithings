import React from "react";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import StackingProcessSection from "@/components/landing/StackingProcessSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import FaqSection from "@/components/landing/FaqSection";
import PricingSection from "@/components/landing/PricingSection";
import CtaAndFooterSection from "@/components/landing/CtaAndFooterSection";

export default function Home() {
  return (
    <div className="relative min-h-screen [overflow-x:clip] bg-black font-sans text-white selection:bg-[#4343D5] selection:text-white">
      <Navbar />

      <main className="relative z-10">
        <HeroSection />
        <StackingProcessSection />
        <TestimonialsSection />
        <FaqSection />
        <PricingSection />
        <CtaAndFooterSection />
      </main>
    </div>
  );
}
