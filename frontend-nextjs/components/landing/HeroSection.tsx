import React from "react";
import StarField from "./StarField";
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  SlidersHorizontal,
  Calendar,
  Clock,
  Search,
  MoreHorizontal,
} from "lucide-react";

export default function HeroSection() {
  const quickLinks = [
    { label: "Hero Section", href: "#hero" },
    { label: "Pricing", href: "#pricing" },
    { label: "CTA", href: "#cta" },
    { label: "Contact Form", href: "#contact" },
    { label: "Process", href: "#process" },
    { label: "Testimonials", href: "#testimonials" },
  ];

  return (
    <section id="hero" className="relative pt-12 pb-24 md:pt-20 md:pb-32 overflow-hidden">
      {/* Deep Indigo/Purple Radial Glow Background */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1400px] h-[750px] pointer-events-none -z-10"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 15%, rgba(75, 61, 245, 0.45) 0%, rgba(108, 92, 231, 0.22) 40%, rgba(5, 5, 10, 0) 75%)",
        }}
      />
      {/* Secondary subtle ambient spot */}
      <div
        className="absolute top-36 left-1/4 w-[500px] h-[300px] pointer-events-none -z-10 opacity-40 blur-3xl"
        style={{
          background: "radial-gradient(circle, #3B2FE0 0%, transparent 70%)",
        }}
      />

      {/* Star Field & Shooting Star Streaks */}
      <StarField showShootingStars={true} />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Main H1 Headline */}
        <h1 className="font-heading font-extrabold text-4xl sm:text-6xl md:text-7xl lg:text-[76px] tracking-[-0.03em] text-white leading-[1.08] max-w-4xl mx-auto">
          Streamline Design with <br className="hidden sm:inline" />
          Components
        </h1>

        {/* Muted Subtext */}
        <p className="font-sans text-[#A6A6C1] text-base sm:text-lg max-w-2xl mx-auto mt-6 leading-relaxed font-normal">
          Accelerate your workflow with highly adaptable, accessible and consistent components build for modern design system
        </p>

        {/* Primary CTA Button */}
        <div className="mt-8 flex justify-center">
          <a
            href="#download"
            className="font-sans inline-flex items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-[#4B3DF5] via-[#5e4ff7] to-[#7C5CFF] px-8 py-3.5 text-sm sm:text-base font-semibold text-white shadow-[0_0_28px_rgba(75,61,245,0.45)] hover:shadow-[0_0_36px_rgba(124,92,255,0.65)] hover:brightness-110 active:scale-95 transition-all duration-200"
          >
            <span>Download Now</span>
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </a>
        </div>

        {/* 6 Sub-links row */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs sm:text-sm font-normal text-[#E2E2F0]">
          {quickLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-sans hover:text-white transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Product Screenshot Mockup Panel */}
        <div className="mt-16 sm:mt-20 mx-auto max-w-5xl rounded-2xl sm:rounded-3xl border border-[#1e1f38] bg-[#0A0A14]/90 p-6 sm:p-8 lg:p-12 shadow-[0_20px_70px_rgba(0,0,0,0.7)] backdrop-blur-xl relative overflow-hidden text-left">
          {/* Internal subtle glow corner */}
          <div
            className="absolute -top-24 -right-24 w-80 h-80 pointer-events-none rounded-full blur-3xl opacity-20"
            style={{ background: "#7C5CFF" }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Copy block */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              <span className="font-sans inline-block w-fit rounded-full border border-[#2e3054] bg-[#161729] px-3.5 py-1 text-xs font-medium text-[#c4bcff] mb-4">
                Individuals
              </span>

              <h3 className="font-heading text-2xl sm:text-3xl font-bold text-white leading-tight mb-4">
                Elevate Your Creative Workflow
              </h3>

              <div className="space-y-3 mb-8">
                <div className="flex items-start gap-2.5">
                  <div className="mt-1 flex-shrink-0 text-[#7C5CFF]">
                    <CheckCircle2 size={16} />
                  </div>
                  <p className="font-sans text-xs sm:text-sm text-[#A6A6C1] leading-relaxed">
                    Modular components engineered for rapid prototyping and production scale.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="mt-1 flex-shrink-0 text-[#7C5CFF]">
                    <CheckCircle2 size={16} />
                  </div>
                  <p className="font-sans text-xs sm:text-sm text-[#A6A6C1] leading-relaxed">
                    Seamless sync between Figma auto-layout and clean Tailwind code exports.
                  </p>
                </div>
              </div>

              <div>
                <a
                  href="#start"
                  className="font-sans inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#4B3DF5] to-[#7C5CFF] px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-md hover:brightness-110 active:scale-95 transition-all"
                >
                  <span>Start Creation</span>
                  <ArrowRight size={14} />
                </a>
              </div>
            </div>

            {/* Right Dashboard Mockup */}
            <div className="lg:col-span-7 relative">
              <div className="rounded-2xl border border-[#22243d] bg-[#0d0e1b] p-5 shadow-2xl relative">
                {/* Dashboard Header */}
                <div className="flex items-center justify-between border-b border-[#1c1d32] pb-3 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="font-heading text-sm font-semibold text-white">My task</span>
                    <div className="flex items-center gap-1 bg-[#16172b] p-0.5 rounded-lg border border-[#252742]">
                      <button className="font-sans text-[11px] font-semibold bg-[#4B3DF5] text-white px-2.5 py-0.5 rounded-md shadow-sm">
                        Today
                      </button>
                      <button className="font-sans text-[11px] text-[#8e8ea8] hover:text-white px-2 py-0.5">
                        Later
                      </button>
                      <button className="font-sans text-[11px] text-[#8e8ea8] hover:text-white px-2 py-0.5">
                        Done
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[#7d7d96]">
                    <Search size={14} className="hover:text-white cursor-pointer" />
                    <MoreHorizontal size={14} className="hover:text-white cursor-pointer" />
                  </div>
                </div>

                {/* Main Task Card */}
                <div className="rounded-xl border border-[#272948] bg-[#141528] p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-sans text-xs font-semibold text-white">Finance app</span>
                    <span className="font-sans text-[10px] font-medium bg-[#1e2338] text-[#9b8aff] px-2 py-0.5 rounded-full border border-[#3b3570]">
                      High priority
                    </span>
                  </div>
                  <p className="font-sans text-[11px] text-[#9393ad] mb-3">
                    Redesign the portfolio analytics cards and deposit interaction flow.
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-[#1f2038]">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#FF5E7E] to-[#FFA462] flex items-center justify-center text-[9px] font-bold text-white">
                        S
                      </div>
                      <span className="font-sans text-[11px] text-[#c0c0d8]">
                        Samantha - Project manager
                      </span>
                    </div>
                    <span className="font-sans text-[10px] text-[#71718c] flex items-center gap-1">
                      <Clock size={11} /> 2h left
                    </span>
                  </div>
                </div>

                {/* Task Rows / Filter list */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#111224] border border-[#1b1d33]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                      <span className="font-sans text-xs text-white">Plan sprint backlog</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-sans text-[10px] text-[#767694]">09:30 AM</span>
                      <span className="font-sans text-[10px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 px-2 py-0.5 rounded-full">
                        On progress
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#111224] border border-[#1b1d33]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
                      <span className="font-sans text-xs text-white">Update pricing page copy</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-sans text-[10px] text-[#767694]">11:15 AM</span>
                      <span className="font-sans text-[10px] font-semibold bg-indigo-950/60 text-indigo-300 border border-indigo-800/50 px-2 py-0.5 rounded-full">
                        On progress
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#111224] border border-[#1b1d33]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" />
                      <span className="font-sans text-xs text-white">Prepare launch checklist</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-sans text-[10px] text-[#767694]">03:45 PM</span>
                      <span className="font-sans text-[10px] font-semibold bg-purple-950/60 text-purple-300 border border-purple-800/50 px-2 py-0.5 rounded-full">
                        On progress
                      </span>
                    </div>
                  </div>
                </div>

                {/* Floating Tooltip Pill: "Auto smart sorting, no effort" */}
                <div className="hidden sm:flex absolute -top-4 -right-4 items-center gap-1.5 bg-[#1f1a4a] border border-[#7C5CFF]/60 text-white px-3 py-1.5 rounded-full shadow-[0_4px_20px_rgba(124,92,255,0.4)] text-[11px] font-sans font-medium backdrop-blur-md">
                  <Sparkles size={12} className="text-[#a594ff]" />
                  <span>Auto smart sorting, no effort</span>
                </div>

                {/* Floating User Chip: "Sofia G." */}
                <div className="hidden sm:flex absolute -bottom-3 -left-3 items-center gap-2 bg-[#121326] border border-[#2b2d4f] px-3 py-1.5 rounded-full shadow-lg text-xs font-sans text-white">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-r from-teal-400 to-indigo-500" />
                  <span className="font-medium text-[11px]">Sofia G.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
