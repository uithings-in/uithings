import React from "react";
import PillBadge from "./PillBadge";
import StarField from "./StarField";
import { ArrowRight } from "lucide-react";

export default function FinalCtaSection() {
  return (
    <section id="cta" className="relative pt-20 pb-20 md:pt-28 md:pb-28">
      {/* Background Starfield and Shooting Streaks */}
      <StarField showShootingStars={true} />

      {/* Ambient center glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] pointer-events-none -z-10 opacity-50"
        style={{
          background:
            "radial-gradient(circle, rgba(75, 61, 245, 0.5) 0%, rgba(108, 92, 231, 0.2) 50%, transparent 80%)",
        }}
      />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Eyebrow Pill */}
        <PillBadge variant="default" className="mb-5">
          Start
        </PillBadge>

        {/* Headline */}
        <h2 className="font-heading text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.12]">
          Powerful tools for creators
        </h2>

        {/* Muted Subtext */}
        <p className="font-sans text-[#A6A6C1] text-base sm:text-lg max-w-xl mx-auto mt-5 leading-relaxed font-normal">
          Accelerate your design system, eliminate repetitive work, and deploy production-ready web interfaces today.
        </p>

        {/* Centered Gradient Pill CTA */}
        <div className="mt-9 flex justify-center">
          <a
            href="#download"
            className="font-sans inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-[#4B3DF5] via-[#6355ff] to-[#7C5CFF] px-8 py-3.5 text-sm sm:text-base font-semibold text-white shadow-[0_0_35px_rgba(75,61,245,0.65)] hover:shadow-[0_0_45px_rgba(124,92,255,0.8)] hover:brightness-110 active:scale-95 transition-all duration-200"
          >
            <span>Download Now</span>
            <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}
