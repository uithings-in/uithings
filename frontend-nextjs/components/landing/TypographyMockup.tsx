import React from "react";

export default function TypographyMockup() {
  return (
    <div className="relative rounded-2xl border border-[#232542] bg-[#0c0d1c] p-6 sm:p-8 shadow-2xl overflow-hidden">
      {/* Top Swatch Row of 4 Circles */}
      <div className="flex items-center justify-between border-b border-[#1b1d33] pb-4 mb-6">
        <div className="flex items-center gap-2.5">
          <span className="w-3.5 h-3.5 rounded-full bg-[#4B3DF5] shadow-[0_0_8px_rgba(75,61,245,0.6)]" />
          <span className="w-3.5 h-3.5 rounded-full bg-[#FF6B6B] shadow-[0_0_8px_rgba(255,107,107,0.6)]" />
          <span className="w-3.5 h-3.5 rounded-full bg-[#7C5CFF] shadow-[0_0_8px_rgba(124,92,255,0.6)]" />
          <span className="w-3.5 h-3.5 rounded-full bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
        </div>
        <div className="text-[11px] font-sans text-[#7E7E9E] tracking-wider uppercase">
          Anatomy & Scale
        </div>
      </div>

      {/* Typography Anatomy Diagram */}
      <div className="relative py-8 sm:py-10 flex flex-col items-center justify-center">
        {/* Baseline & Guide Lines */}
        <div className="absolute top-[28%] w-full border-t border-dashed border-[#34375a]/70" />
        <div className="absolute top-[62%] w-full border-t border-dashed border-[#5243F7]/50" />
        <div className="absolute top-[82%] w-full border-t border-dashed border-[#34375a]/70" />

        {/* The large Serif Word "Typography" */}
        <div className="relative z-10 font-serif text-3xl sm:text-5xl md:text-6xl text-white tracking-tight select-none">
          <span>Typo</span>
          <span className="text-[#8e7fff]">graphy</span>
        </div>

        {/* Anatomical Leader Line Annotations */}
        {/* Ascender - Top Left */}
        <div className="absolute top-2 left-6 sm:left-10 flex flex-col items-center">
          <span className="bg-[#1a1b33] border border-[#2d3059] text-[10px] text-[#A6A6C1] px-2 py-0.5 rounded font-mono">
            ascender
          </span>
          <div className="w-[1px] h-6 bg-[#5243F7]" />
        </div>

        {/* Counter - Top Mid */}
        <div className="absolute top-4 left-[38%] flex flex-col items-center">
          <span className="bg-[#1a1b33] border border-[#2d3059] text-[10px] text-[#A6A6C1] px-2 py-0.5 rounded font-mono">
            counter
          </span>
          <div className="w-[1px] h-5 bg-[#5243F7]" />
        </div>

        {/* Shoulder - Top Right */}
        <div className="absolute top-3 right-8 sm:right-16 flex flex-col items-center">
          <span className="bg-[#1a1b33] border border-[#2d3059] text-[10px] text-[#A6A6C1] px-2 py-0.5 rounded font-mono">
            shoulder
          </span>
          <div className="w-[1px] h-6 bg-[#5243F7]" />
        </div>

        {/* Serif - Bottom Left */}
        <div className="absolute -bottom-2 left-8 sm:left-14 flex flex-col items-center">
          <div className="w-[1px] h-5 bg-[#5243F7]" />
          <span className="bg-[#1a1b33] border border-[#2d3059] text-[10px] text-[#A6A6C1] px-2 py-0.5 rounded font-mono">
            serif
          </span>
        </div>

        {/* Stem - Bottom Mid */}
        <div className="absolute -bottom-3 left-[46%] flex flex-col items-center">
          <div className="w-[1px] h-5 bg-[#5243F7]" />
          <span className="bg-[#1a1b33] border border-[#2d3059] text-[10px] text-[#A6A6C1] px-2 py-0.5 rounded font-mono">
            stem
          </span>
        </div>

        {/* Descender - Bottom Right */}
        <div className="absolute -bottom-2 right-6 sm:right-12 flex flex-col items-center">
          <div className="w-[1px] h-5 bg-[#5243F7]" />
          <span className="bg-[#1a1b33] border border-[#2d3059] text-[10px] text-[#A6A6C1] px-2 py-0.5 rounded font-mono">
            descender
          </span>
        </div>
      </div>

      {/* Footer Metrics */}
      <div className="mt-8 pt-3 border-t border-[#1b1d33] flex items-center justify-between text-[11px] font-sans text-[#7E7E9E]">
        <span>Baseline: 48px</span>
        <span>Line height: 1.2</span>
        <span>Tracking: -0.02em</span>
      </div>
    </div>
  );
}
