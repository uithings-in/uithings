import React from "react";
import PillBadge from "./PillBadge";
import { Globe, Copy, ClipboardCheck } from "lucide-react";

export default function StepsSection() {
  const steps = [
    {
      badge: "Step - 01",
      badgeVariant: "dark" as const,
      icon: <Globe size={26} className="text-[#A6A6C1]" />,
      iconBg: "bg-[#16172a] border-[#252847]",
      title: "Brows",
      description:
        "Explore hundreds of finely crafted, auto-layout ready components and section variants tailored for modern web apps.",
      isHighlighted: false,
    },
    {
      badge: "STEP -02",
      badgeVariant: "highlight" as const,
      icon: <Copy size={26} className="text-[#c7bdfa]" />,
      iconBg: "bg-[#33227a] border-[#7C5CFF]/70 shadow-[0_0_20px_rgba(124,92,255,0.5)]",
      title: "Copy",
      description:
        "One-click copy into your Figma canvas or front-end project with preserved tokens and responsive auto-layout structures.",
      isHighlighted: true,
    },
    {
      badge: "Step - 03",
      badgeVariant: "dark" as const,
      icon: <ClipboardCheck size={26} className="text-[#A6A6C1]" />,
      iconBg: "bg-[#16172a] border-[#252847]",
      title: "Paste",
      description:
        "Paste directly into your codebase and start customizing colors, content, and dynamic interactions seamlessly.",
      isHighlighted: false,
    },
  ];

  return (
    <section id="process" className="relative py-20 md:py-28 overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="font-heading text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
            Design your dream website <br className="hidden sm:inline" />
            in minutes, not weeks.
          </h2>
          <p className="font-sans text-[#A6A6C1] text-base sm:text-lg mt-4 font-normal">
            Brand it. Build it. Go live—fully responsive, zero hassle.
          </p>
        </div>

        {/* Large Rounded Indigo Glow Panel */}
        <div className="relative rounded-3xl border border-[#20223f] bg-[#0A0A16] p-6 sm:p-10 lg:p-12 shadow-[0_15px_60px_rgba(0,0,0,0.6)] overflow-hidden">
          {/* Subtle Ambient Radial Glow */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] pointer-events-none -z-0 opacity-40"
            style={{
              background:
                "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(75, 61, 245, 0.4) 0%, rgba(108, 92, 231, 0.15) 50%, transparent 80%)",
            }}
          />

          {/* Panel Eyebrow */}
          <div className="relative z-10 text-center max-w-xl mx-auto mb-10">
            <PillBadge variant="default" className="mb-3">
              Step Taken
            </PillBadge>
            <p className="font-sans text-xs sm:text-sm text-[#A6A6C1]">
              Seamless three-step design workflow built to eliminate repetitive layout work.
            </p>
          </div>

          {/* 3-Column Card Row */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className={`relative rounded-2xl p-7 sm:p-8 flex flex-col items-center text-center transition-all duration-300 ${
                  step.isHighlighted
                    ? "bg-gradient-to-b from-[#211652] via-[#14122d] to-[#0d0d1f] border-2 border-[#6C5CE7]/60 shadow-[0_0_35px_rgba(108,92,231,0.3)] scale-[1.02]"
                    : "bg-[#0c0d1b] border border-[#1e2038] hover:border-[#2f3256]"
                }`}
              >
                {/* Step Badge */}
                <div className="mb-6">
                  <span
                    className={`font-sans text-[11px] font-semibold px-3 py-1 rounded-full border ${
                      step.isHighlighted
                        ? "bg-[#6C5CE7]/25 border-[#7C5CFF]/60 text-white shadow-sm"
                        : "bg-[#141528] border-[#222440] text-[#9a9ab8]"
                    }`}
                  >
                    {step.badge}
                  </span>
                </div>

                {/* Centered Line Icon */}
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center border mb-6 ${step.iconBg}`}
                >
                  {step.icon}
                </div>

                {/* Bold Title */}
                <h3 className="font-heading text-xl sm:text-2xl font-bold text-white mb-3">
                  {step.title}
                </h3>

                {/* Muted Description */}
                <p className="font-sans text-xs sm:text-sm text-[#A6A6C1] leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
