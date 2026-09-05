import React from "react";

export default function WireframeMockup() {
  return (
    <div className="relative rounded-2xl border border-[#232542] bg-[#0c0d1c] p-5 sm:p-7 shadow-2xl overflow-hidden">
      {/* Container header */}
      <div className="flex items-center justify-between border-b border-[#1b1d33] pb-3 mb-5">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#2a2c47]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#2a2c47]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#2a2c47]" />
        </div>
        <span className="text-[11px] font-mono text-[#717191]">Wireframe Layouts (v2.4)</span>
      </div>

      {/* 4 Grayscale Wireframe App Mockup Screens side by side */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Screen 1: Dashboard Feed */}
        <div className="rounded-xl border border-[#272945] bg-[#121324] p-2.5 flex flex-col gap-2 min-h-[200px] shadow-sm">
          {/* Mock Status Bar */}
          <div className="flex justify-between items-center py-0.5 opacity-40">
            <div className="w-4 h-1 bg-white rounded" />
            <div className="w-3 h-1 bg-white rounded" />
          </div>
          {/* Header */}
          <div className="w-8 h-2 bg-[#43466d] rounded" />
          {/* Hero Banner Box */}
          <div className="w-full h-14 rounded-lg bg-[#1a1b32] border border-dashed border-[#343657] flex items-center justify-center">
            <div className="w-6 h-6 rounded bg-[#2a2c4e] opacity-60" />
          </div>
          {/* Card list */}
          <div className="space-y-1.5 mt-1">
            <div className="w-full h-4 rounded bg-[#1c1d33]" />
            <div className="w-3/4 h-3 rounded bg-[#1c1d33]" />
            <div className="w-1/2 h-3 rounded bg-[#1c1d33]" />
          </div>
          {/* Bottom Nav */}
          <div className="mt-auto pt-2 flex justify-around border-t border-[#1a1b30] opacity-40">
            <div className="w-2.5 h-2.5 rounded bg-white" />
            <div className="w-2.5 h-2.5 rounded bg-white" />
            <div className="w-2.5 h-2.5 rounded bg-white" />
          </div>
        </div>

        {/* Screen 2: Profile & Stats */}
        <div className="rounded-xl border border-[#272945] bg-[#121324] p-2.5 flex flex-col gap-2 min-h-[200px] shadow-sm">
          <div className="flex justify-between items-center py-0.5 opacity-40">
            <div className="w-4 h-1 bg-white rounded" />
            <div className="w-3 h-1 bg-white rounded" />
          </div>
          <div className="mx-auto w-8 h-8 rounded-full bg-[#27294c] border border-[#3b3d6b] mt-1" />
          <div className="mx-auto w-12 h-2 bg-[#43466d] rounded" />
          {/* Grid Stats */}
          <div className="grid grid-cols-2 gap-1.5 mt-1">
            <div className="h-8 rounded bg-[#1b1c34] border border-[#2b2d4f]" />
            <div className="h-8 rounded bg-[#1b1c34] border border-[#2b2d4f]" />
          </div>
          <div className="w-full h-10 rounded-lg bg-[#191a30] border border-dashed border-[#353759]" />
          <div className="mt-auto pt-2 flex justify-around border-t border-[#1a1b30] opacity-40">
            <div className="w-2.5 h-2.5 rounded bg-white" />
            <div className="w-2.5 h-2.5 rounded bg-white" />
            <div className="w-2.5 h-2.5 rounded bg-white" />
          </div>
        </div>

        {/* Screen 3: List & Filter View */}
        <div className="rounded-xl border border-[#272945] bg-[#121324] p-2.5 flex flex-col gap-2 min-h-[200px] shadow-sm">
          <div className="flex justify-between items-center py-0.5 opacity-40">
            <div className="w-4 h-1 bg-white rounded" />
            <div className="w-3 h-1 bg-white rounded" />
          </div>
          {/* Search bar mockup */}
          <div className="w-full h-5 rounded-md bg-[#191a32] border border-[#2c2e4e]" />
          {/* 3 list items */}
          <div className="space-y-1.5 mt-1">
            <div className="flex items-center gap-1.5 p-1 rounded bg-[#17182d]">
              <div className="w-3 h-3 rounded bg-[#2f3258]" />
              <div className="w-12 h-2 bg-[#3f426a] rounded" />
            </div>
            <div className="flex items-center gap-1.5 p-1 rounded bg-[#17182d]">
              <div className="w-3 h-3 rounded bg-[#2f3258]" />
              <div className="w-10 h-2 bg-[#3f426a] rounded" />
            </div>
            <div className="flex items-center gap-1.5 p-1 rounded bg-[#17182d]">
              <div className="w-3 h-3 rounded bg-[#2f3258]" />
              <div className="w-14 h-2 bg-[#3f426a] rounded" />
            </div>
          </div>
          <div className="mt-auto pt-2 flex justify-around border-t border-[#1a1b30] opacity-40">
            <div className="w-2.5 h-2.5 rounded bg-white" />
            <div className="w-2.5 h-2.5 rounded bg-white" />
            <div className="w-2.5 h-2.5 rounded bg-white" />
          </div>
        </div>

        {/* Screen 4: Checkout / Action Card */}
        <div className="rounded-xl border border-[#272945] bg-[#121324] p-2.5 flex flex-col gap-2 min-h-[200px] shadow-sm">
          <div className="flex justify-between items-center py-0.5 opacity-40">
            <div className="w-4 h-1 bg-white rounded" />
            <div className="w-3 h-1 bg-white rounded" />
          </div>
          <div className="w-10 h-2 bg-[#43466d] rounded" />
          <div className="w-full h-8 rounded bg-[#1d1e37] border border-[#303359]" />
          <div className="space-y-1 mt-1">
            <div className="flex justify-between">
              <div className="w-6 h-1.5 bg-[#2f3258] rounded" />
              <div className="w-4 h-1.5 bg-[#4f5387] rounded" />
            </div>
            <div className="flex justify-between">
              <div className="w-8 h-1.5 bg-[#2f3258] rounded" />
              <div className="w-5 h-1.5 bg-[#4f5387] rounded" />
            </div>
          </div>
          {/* Action pill */}
          <div className="w-full h-4 rounded-full bg-[#3c3f68] mt-auto" />
          <div className="pt-2 flex justify-around border-t border-[#1a1b30] opacity-40">
            <div className="w-2.5 h-2.5 rounded bg-white" />
            <div className="w-2.5 h-2.5 rounded bg-white" />
            <div className="w-2.5 h-2.5 rounded bg-white" />
          </div>
        </div>
      </div>
    </div>
  );
}
