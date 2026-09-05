import React from "react";
import { Activity, Flame, Heart, TrendingUp, Zap, ArrowUpRight } from "lucide-react";

export default function FullUiMockup() {
  return (
    <div className="relative rounded-2xl border border-[#232542] bg-[#0c0d1c] p-5 sm:p-6 shadow-2xl overflow-hidden">
      {/* 3 Colorful Mobile App Mockup Screens */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-center">
        {/* Screen 1: Health & Activity Tracker */}
        <div className="rounded-2xl border border-[#2c2754] bg-gradient-to-b from-[#181438] to-[#0f0e21] p-3 shadow-lg flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-white">Daily Vitality</span>
            <div className="w-4 h-4 rounded-full bg-[#FF4565]/20 text-[#FF4565] flex items-center justify-center">
              <Heart size={9} />
            </div>
          </div>

          {/* Circular progress stat mock */}
          <div className="relative py-2 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full border-4 border-[#2d2557] border-t-[#FF4565] border-r-[#7C5CFF] flex flex-col items-center justify-center">
              <span className="text-[13px] font-heading font-extrabold text-white">84%</span>
              <span className="text-[8px] text-[#A6A6C1]">Score</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <div className="bg-[#1c183b] p-1.5 rounded-lg border border-[#322b63]">
              <div className="flex items-center gap-1 text-[#FF8A00] text-[9px]">
                <Flame size={9} /> <span>720 kcal</span>
              </div>
            </div>
            <div className="bg-[#1c183b] p-1.5 rounded-lg border border-[#322b63]">
              <div className="flex items-center gap-1 text-[#00E5FF] text-[9px]">
                <Activity size={9} /> <span>142 bpm</span>
              </div>
            </div>
          </div>
        </div>

        {/* Screen 2: Vibrant Blue Finance / App screen (Centerpiece) */}
        <div className="rounded-2xl border border-[#4338ca] bg-gradient-to-b from-[#2e2692] via-[#1d1b61] to-[#0c0d29] p-3.5 shadow-xl flex flex-col gap-2.5 sm:-translate-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-blue-200">Balance</span>
            <span className="text-[9px] bg-blue-500/30 text-blue-200 px-1.5 py-0.5 rounded-full">
              +14.2%
            </span>
          </div>

          <div>
            <div className="text-lg font-heading font-bold text-white tracking-tight">
              $24,850.00
            </div>
            <div className="text-[9px] text-blue-300/80">Available assets</div>
          </div>

          {/* Mini Wave Bar Chart */}
          <div className="h-10 flex items-end gap-1 pt-2">
            <div className="w-2 h-4 bg-blue-400/40 rounded-t" />
            <div className="w-2 h-6 bg-blue-400/60 rounded-t" />
            <div className="w-2 h-3 bg-blue-400/40 rounded-t" />
            <div className="w-2 h-8 bg-blue-400 rounded-t" />
            <div className="w-2 h-6 bg-blue-300 rounded-t" />
            <div className="w-2 h-9 bg-white rounded-t shadow-[0_0_8px_white]" />
            <div className="w-2 h-7 bg-blue-400 rounded-t" />
          </div>

          {/* Send pill button */}
          <button className="w-full py-1 rounded-full bg-white text-[#2a2470] text-[10px] font-bold flex items-center justify-center gap-1 shadow">
            <span>Transfer</span>
            <ArrowUpRight size={10} />
          </button>
        </div>

        {/* Screen 3: Step Count & Wellness */}
        <div className="rounded-2xl border border-[#23354b] bg-gradient-to-b from-[#13233b] to-[#0d1627] p-3 shadow-lg flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-white">Step Count</span>
            <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Zap size={9} />
            </div>
          </div>

          <div>
            <div className="text-base font-heading font-bold text-white">12,480</div>
            <div className="text-[9px] text-emerald-300">Goal: 10,000 steps</div>
          </div>

          {/* Progress fill */}
          <div className="w-full bg-[#1e3452] h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-400 h-full w-[85%] rounded-full shadow-[0_0_8px_#34d399]" />
          </div>

          <div className="bg-[#182b45] p-1.5 rounded-lg border border-[#294263] mt-1 text-[9px] text-[#A6A6C1] flex items-center justify-between">
            <span>Active Streak</span>
            <span className="text-white font-bold">14 Days 🔥</span>
          </div>
        </div>
      </div>
    </div>
  );
}
