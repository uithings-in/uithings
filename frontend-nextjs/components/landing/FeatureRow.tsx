import React from "react";
import PillBadge from "./PillBadge";
import StarField from "./StarField";

export interface FeatureItem {
  title: string;
  description: string;
}

interface FeatureRowProps {
  pillLabel: string;
  headline: string;
  description?: string;
  items: FeatureItem[];
  reverse?: boolean; // If true, visual is right, text is left.
  children: React.ReactNode; // The visual mockup
  id?: string;
  glowPosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
}

export default function FeatureRow({
  pillLabel,
  headline,
  description,
  items,
  reverse = false,
  children,
  id,
  glowPosition = "top-right",
}: FeatureRowProps) {
  // Configurable ambient gradient glow ray position for matching the image exact lighting
  const glowStyles = {
    "top-left": "top-0 left-0 bg-gradient-to-br from-[#4B3DF5]/30 via-[#6C5CE7]/15 to-transparent",
    "top-right": "top-0 right-0 bg-gradient-to-bl from-[#4B3DF5]/30 via-[#3B2FE0]/15 to-transparent",
    "bottom-left": "bottom-0 left-0 bg-gradient-to-tr from-[#3B2FE0]/30 via-[#6C5CE7]/15 to-transparent",
    "bottom-right": "bottom-0 right-0 bg-gradient-to-tl from-[#4B3DF5]/30 via-[#7C5CFF]/15 to-transparent",
    center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#4B3DF5]/35 via-[#2A2470]/20 to-transparent",
  };

  return (
    <div
      id={id}
      className="relative rounded-3xl border border-[#1e2038] bg-[#0A0A14]/90 p-6 sm:p-10 lg:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl overflow-hidden mb-16 sm:mb-24"
    >
      {/* Background Starfield for continuous cosmic vibe */}
      <StarField showShootingStars={false} className="opacity-60" />

      {/* Diagonal Ambient Indigo Gradient Ray matching reference image */}
      <div
        className={`absolute w-[600px] h-[400px] pointer-events-none -z-0 opacity-40 blur-3xl rounded-full ${glowStyles[glowPosition]}`}
      />
      <div
        className="absolute inset-0 pointer-events-none -z-0"
        style={{
          background: reverse
            ? "linear-gradient(135deg, rgba(59,47,224,0.12) 0%, rgba(108,92,231,0.05) 45%, transparent 80%)"
            : "linear-gradient(225deg, rgba(75,61,245,0.12) 0%, rgba(42,36,112,0.05) 50%, transparent 80%)",
        }}
      />

      <div
        className={`relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center ${reverse ? "lg:flex-row-reverse" : ""
          }`}
      >
        {/* Visual Slot */}
        <div
          className={`lg:col-span-6 ${reverse ? "order-2 lg:order-2" : "order-2 lg:order-1"
            }`}
        >
          {children}
        </div>

        {/* Text Slot */}
        <div
          className={`lg:col-span-6 flex flex-col justify-center ${reverse ? "order-1 lg:order-1" : "order-1 lg:order-2"
            }`}
        >
          {/* Eyebrow Pill */}
          <div className="mb-4">
            <PillBadge variant="default">{pillLabel}</PillBadge>
          </div>

          {/* Headline */}
          <h3 className="font-heading text-2xl sm:text-3xl lg:text-[34px] font-bold text-white leading-tight tracking-tight mb-4">
            {headline}
          </h3>

          {description && (
            <p className="font-sans text-xs sm:text-sm text-[#A6A6C1] mb-8 leading-relaxed">
              {description}
            </p>
          )}

          {/* 3 Stacked Feature Items with Vertical Accent Bar */}
          <div className="space-y-6">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="relative pl-4 border-l-2 border-[#5243F7] transition-all hover:border-[#7C5CFF] group"
              >
                <h4 className="font-heading text-sm sm:text-base font-semibold text-white group-hover:text-[#c4bcff] transition-colors mb-1">
                  {item.title}
                </h4>
                <p className="font-sans text-xs sm:text-sm text-[#9494B8] leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
