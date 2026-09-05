import React from "react";
import { Laptop, Smartphone, Tablet, Settings, Layers, Sliders, Check } from "lucide-react";

export default function ResponsiveMockup() {
  return (
    <div className="relative rounded-2xl border border-[#232542] bg-[#0c0d1c] p-6 sm:p-8 shadow-2xl overflow-hidden flex flex-col items-center justify-center">
      {/* Subtle background circuit/grid */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(#7C5CFF 1px, transparent 1px), radial-gradient(#7C5CFF 1px, #0c0d1c 1px)",
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 10px 10px",
        }}
      />

      {/* Main Responsive Composition Container */}
      <div className="relative z-10 w-full max-w-md py-4">
        {/* Floating Top UI Window */}
        <div className="mx-auto w-48 rounded-lg border border-[#3b3d68] bg-[#14162e]/90 p-2.5 shadow-lg backdrop-blur-md mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#FF5F56]" />
            <div className="w-2 h-2 rounded-full bg-[#FFBD2E]" />
            <div className="w-2 h-2 rounded-full bg-[#27C93F]" />
          </div>
          <span className="text-[10px] font-mono text-[#A6A6C1]">Desktop 1440px</span>
        </div>

        {/* Central Illustrated Laptop Frame & Person Workspace */}
        <div className="relative mx-auto w-full max-w-[320px] rounded-xl border-2 border-[#3d4170] bg-[#111326] p-4 shadow-2xl">
          {/* Mock screen content */}
          <div className="rounded-lg bg-[#0a0a14] p-3 border border-[#242747]">
            {/* Header bar */}
            <div className="flex items-center justify-between pb-2 border-b border-[#1b1c34] mb-2">
              <div className="w-12 h-2 rounded bg-[#5243F7]" />
              <div className="flex gap-1">
                <div className="w-6 h-1.5 rounded bg-[#2e3157]" />
                <div className="w-6 h-1.5 rounded bg-[#2e3157]" />
              </div>
            </div>

            {/* Responsive grid split */}
            <div className="grid grid-cols-3 gap-2 py-1">
              <div className="h-10 rounded bg-[#171833] border border-[#2b2e57] p-1 flex flex-col justify-between">
                <div className="w-4 h-1 bg-[#7C5CFF] rounded" />
                <div className="w-full h-1 bg-[#252847] rounded" />
              </div>
              <div className="h-10 rounded bg-[#171833] border border-[#2b2e57] p-1 flex flex-col justify-between">
                <div className="w-5 h-1 bg-[#5243F7] rounded" />
                <div className="w-full h-1 bg-[#252847] rounded" />
              </div>
              <div className="h-10 rounded bg-[#171833] border border-[#2b2e57] p-1 flex flex-col justify-between">
                <div className="w-3 h-1 bg-[#10b981] rounded" />
                <div className="w-full h-1 bg-[#252847] rounded" />
              </div>
            </div>
          </div>

          {/* Laptop Base */}
          <div className="w-36 h-2 bg-[#262847] rounded-b-md mx-auto -mb-2 mt-1 border-t border-[#3a3c66]" />

          {/* Floating Callout 1: Connected "74" Counter */}
          <div className="absolute -left-6 top-8 bg-[#181938] border border-[#5243F7] rounded-xl p-2 shadow-xl flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#5243F7]/30 text-[#c2baff] flex items-center justify-center font-mono font-bold text-xs">
              74
            </div>
            <div className="text-[9px] text-[#A6A6C1] leading-tight">
              <span className="font-semibold text-white block">Breakpoints</span>
              Auto-tested
            </div>
          </div>

          {/* Floating Callout 2: Gear / Settings Box */}
          <div className="absolute -right-5 -bottom-3 bg-[#181938] border border-[#3b3e6e] rounded-xl p-2.5 shadow-xl flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#272950] text-[#7C5CFF] flex items-center justify-center">
              <Settings size={13} className="animate-spin-slow" />
            </div>
            <div className="text-[9px] text-[#A6A6C1]">
              <span className="font-semibold text-white block">Zero Refactor</span>
              CSS Grid Ready
            </div>
          </div>
        </div>

        {/* Caption Banner */}
        <div className="mt-8 text-center">
          <p className="font-sans text-xs font-medium text-[#c4bcff] tracking-wide">
            Responsive Design: Optimizing UX/UI Across Devices
          </p>
        </div>
      </div>
    </div>
  );
}
