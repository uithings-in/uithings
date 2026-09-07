import React from "react";
import StarField from "./StarField";
import { ArrowUpRight, SlidersHorizontal } from "lucide-react";

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
    <section id="hero" className="relative pt-24 sm:pt-28 md:pt-32 pb-20 md:pb-28 overflow-hidden bg-[#080605] text-white">
      {/* Upper Bright Blue Radial Aura behind Navbar and Headline */}
      <div
        className="absolute -top-[150px] left-1/2 -translate-x-1/2 w-[1600px] h-[950px] pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 20%, #025FF7 0%, #0251D3 25%, #4343D5 45%, #080A2F 70%, transparent 95%)",
          opacity: 0.95,
        }}
      />

      {/* Secondary Left Sky Blue Blur Arc */}
      <div
        className="absolute top-[100px] left-[-250px] w-[950px] h-[800px] pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(circle, rgba(177, 193, 228, 0.8) 0%, rgba(70, 127, 224, 0.5) 45%, transparent 75%)",
          filter: "blur(70px)",
        }}
      />

      {/* Inner Concentric Bright Glowing Spotlights */}
      <div
        className="absolute top-[120px] left-1/2 -translate-x-1/2 w-[900px] h-[500px] pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(102, 124, 255, 0.85) 0%, rgba(67, 67, 213, 0.6) 50%, transparent 80%)",
          filter: "blur(50px)",
        }}
      />

      {/* Star Field & Shooting Star Flares */}
      <StarField showShootingStars={true} className="z-0" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Main H1 Headline */}
        <h1
          className="font-bold text-4xl sm:text-6xl md:text-7xl lg:text-[75px] tracking-normal text-[#F7F7FD] leading-[1.12] max-w-4xl mx-auto"
          style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
        >
          Streamline Design with <br />
          Components
        </h1>

        {/* Subtitle */}
        <p
          className="text-[#B4B3B4] text-base sm:text-lg max-w-xl mx-auto mt-6 leading-normal font-medium"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Accelerate your workflow with highly adaptable, accessible and consistent components build for modern design system
        </p>

        {/* Primary CTA Button */}
        <div className="mt-8 flex justify-center">
          <a
            href="#download"
            className="inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 text-base font-medium text-[#F7F7FD] transition-all duration-200 hover:brightness-110 active:scale-95 shadow-lg"
            style={{
              background: "linear-gradient(99deg, #FFFFFF 0%, #6366F1 21%, #4338CA 90%)",
              outline: "1px rgba(248, 250, 252, 0.4) solid",
              outlineOffset: "-1px",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            <span>Download Now</span>
            <ArrowUpRight className="w-5 h-5 text-[#F7F7FD]" />
          </a>
        </div>

        {/* 6 Sub-links row */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-lg sm:text-2xl font-semibold text-white">
          {quickLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="hover:text-[#F7F7FD] transition-colors duration-200"
              style={{ fontFamily: "'Maven Pro', sans-serif" }}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Hero Showcase Panel */}
        <div
          className="mt-14 sm:mt-20 mx-auto max-w-5xl rounded-xl p-6 sm:p-10 lg:p-12 relative overflow-hidden text-left"
          style={{
            background: "linear-gradient(180deg, #000000 0%, #0A0A0A 100%)",
            outline: "6px rgba(250, 250, 250, 0.1) solid",
            backdropFilter: "blur(6px)",
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Copy Column */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              <div className="pb-3 mb-6 border-b border-white/10">
                <span
                  className="text-sm font-normal text-gray-500"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  Individuals
                </span>
              </div>

              <h2
                className="text-3xl sm:text-4xl text-[#F7F7FD] font-medium leading-snug mb-8"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
              >
                Elevate Your Creative Workflow
              </h2>

              <ul className="space-y-5 mb-10">
                <li className="flex items-start gap-3">
                  <span className="text-[#A1A1AA] text-sm mt-1">✦</span>
                  <p
                    className="text-base text-zinc-400 leading-normal"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    Endless customization option
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#A1A1AA] text-sm mt-1">✦</span>
                  <p
                    className="text-base text-zinc-400 leading-normal"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    Stop starting from scratch and drag-and-drop complex, nested components directly into your workspace.
                  </p>
                </li>
              </ul>

              <div>
                <a
                  href="#start"
                  className="inline-flex items-center justify-center rounded-full px-8 py-3.5 text-lg font-medium text-[#F7F7FD] transition-all hover:brightness-110 active:scale-95 shadow-md"
                  style={{
                    background: "linear-gradient(99deg, #FFFFFF 0%, #6366F1 21%, #4338CA 90%)",
                    outline: "1px rgba(248, 250, 252, 0.4) solid",
                    outlineOffset: "-1px",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  Start Creation
                </a>
              </div>
            </div>

            {/* Right UI Dashboard Mockup Column */}
            <div className="lg:col-span-7 relative pt-12 sm:pt-6 min-h-[380px]">
              <div className="relative mx-auto max-w-lg lg:max-w-none">
                {/* Floating Tooltip Pill: "Auto smart sorting, no effort" */}
                <div
                  className="absolute -top-12 right-20 z-30 hidden sm:flex items-center px-4 py-2 bg-slate-900/60 rounded-xl border border-neutral-50/10 backdrop-blur-md text-slate-50 text-xs font-medium shadow-xl"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  Auto smart sorting, no effort
                </div>

                {/* Floating Sofia G. Badge */}
                <div className="absolute top-[18px] right-[42%] z-30 hidden sm:flex items-center gap-1.5">
                  <div
                    className="px-3 py-1.5 rounded-lg text-slate-50 text-xs font-medium shadow-[0_0_8px_rgba(67,67,213,0.5)]"
                    style={{
                      background: "linear-gradient(99deg, #FFFFFF 0%, #6366F1 21%, #4338CA 90%)",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    Sofia G.
                  </div>
                  <div
                    className="w-2 h-3 rounded-[0.84px] transform rotate-180"
                    style={{ background: "linear-gradient(180deg, #A5B4FC 0%, #4D7C0F 100%)" }}
                  />
                </div>

                {/* Base Card: "My task" */}
                <div
                  className="w-[85%] sm:w-[80%] rounded-xl p-6 shadow-2xl relative z-10 bg-slate-900/60 border border-neutral-50/20 backdrop-blur-md"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-4">
                      <span className="text-base font-semibold text-slate-50">
                        My task
                      </span>
                      <div className="pt-3 border-t border-slate-50/10 flex items-center gap-5 text-xs font-medium">
                        <span className="text-gray-400">Today</span>
                        <span className="text-gray-500">Later</span>
                        <span className="text-gray-500">Done</span>
                      </div>
                    </div>

                    {/* Task Box */}
                    <div className="rounded-md p-3.5 bg-purple-50/10 backdrop-blur-[6px] flex flex-col gap-6">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-normal text-slate-50">
                            Finance app
                          </span>
                          <div className="flex gap-1">
                            <div className="w-1 h-1 rounded-full bg-zinc-400" />
                            <div className="w-1 h-1 rounded-full bg-zinc-400" />
                            <div className="w-1 h-1 rounded-full bg-zinc-400" />
                          </div>
                        </div>
                        <p className="text-[10px] text-gray-500">
                          Make a landing and mobile app
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center text-[10px] font-bold text-slate-900">
                          S
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-violet-200">
                            Samantha
                          </span>
                          <span className="text-[10px] text-zinc-400">
                            Project maneger
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Overlapping Floating "Filter" Panel */}
                <div
                  className="absolute top-16 right-0 w-[85%] sm:w-[80%] rounded-xl p-5 shadow-2xl z-20 bg-slate-900 border border-neutral-50/10 backdrop-blur-[9.43px]"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  <div className="flex items-center justify-between pb-3 mb-4">
                    <span className="text-sm font-medium text-slate-50">
                      Filter
                    </span>
                    <SlidersHorizontal className="w-3.5 h-3.5 text-slate-50" />
                  </div>

                  <div className="space-y-2 text-xs">
                    {/* Item 1 */}
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-purple-50/5 opacity-30">
                      <div className="flex items-center gap-2">
                        <div className="w-0.5 h-7 bg-gray-400" />
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500">14:00</span>
                          <span className="text-xs font-medium text-slate-50">
                            Design onboarding screen
                          </span>
                        </div>
                      </div>
                      <span className="text-[9px] text-stone-300 opacity-50">On progress</span>
                    </div>

                    {/* Item 2 - Highlighted Active Item */}
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-purple-50/10 border border-neutral-50/10">
                      <div className="flex items-center gap-2">
                        <div className="w-0.5 h-7 bg-indigo-700" />
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500">15:00</span>
                          <span className="text-xs font-medium text-slate-50">
                            Plan sprint backlog
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-1 h-1 rounded-full bg-green-500" />
                        <div className="w-1 h-1 rounded-full bg-green-500 blur-[1px]" />
                        <span className="text-[9px] text-stone-300 opacity-50">On progress</span>
                      </div>
                    </div>

                    {/* Item 3 */}
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-purple-50/5 opacity-30">
                      <div className="flex items-center gap-2">
                        <div className="w-0.5 h-7 bg-gray-400" />
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500">17:00</span>
                          <span className="text-xs font-medium text-slate-50">
                            Update pricing page copy
                          </span>
                        </div>
                      </div>
                      <span className="text-[9px] text-stone-300 opacity-50">1 hour later</span>
                    </div>

                    {/* Item 4 */}
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-purple-50/5 opacity-30">
                      <div className="flex items-center gap-2">
                        <div className="w-0.5 h-7 bg-gray-400" />
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500">18:00</span>
                          <span className="text-xs font-medium text-slate-50">
                            Prepare launch checklist
                          </span>
                        </div>
                      </div>
                      <span className="text-[9px] text-stone-300 opacity-50">3 hours later</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
