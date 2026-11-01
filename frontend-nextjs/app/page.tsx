import React from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import StackingProcessSection from "@/components/landing/StackingProcessSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";

const FaqSection = dynamic(() => import("@/components/landing/FaqSection"));
const PricingSection = dynamic(() => import("@/components/landing/PricingSection"));
const CtaAndFooterSection = dynamic(() => import("@/components/landing/CtaAndFooterSection"));

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
