"use client";

import React, { useState } from "react";
import { ChevronDown, Lightbulb, Check } from "lucide-react";

export function TipsCollapsible() {
  const [isOpen, setIsOpen] = useState(false);

  const tips = [
    "Clean component hierarchy: Flatten unnecessary wrapper frames before copying in Figma.",
    "Auto Layout ready: Ensure components support responsive resizing for fellow designers.",
    "Semantic naming: Use industry conventions like 'Buttons / Primary / Default' for quick search.",
    "Sharp preview screenshots: Take screenshots at 2x resolution with neutral background contrast.",
  ];

  return (
    <div className="rounded-xl border border-gray-200/80 dark:border-white/[0.08] bg-white dark:bg-[#111113] p-3.5 shadow-xs transition-colors">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between text-left cursor-pointer"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-1.5">
          <Lightbulb size={13} className="text-[#F97316]" />
          <span className="text-xs font-semibold text-gray-900 dark:text-[#F5F5F5]">
            Tips for a great listing
          </span>
        </div>
        <ChevronDown
          size={14}
          className={`text-gray-400 dark:text-[#71717A] transition-transform duration-150 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <ul className="mt-2.5 space-y-2 border-t border-gray-100 dark:border-white/[0.06] pt-2.5 text-xs text-gray-600 dark:text-[#A1A1AA] animate-in fade-in duration-100">
          {tips.map((tip, index) => (
            <li key={index} className="flex items-start gap-2 leading-relaxed text-[11px]">
              <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-[#EA580C] dark:text-[#FB923C] text-[9px] font-bold mt-0.5">
                <Check size={8} strokeWidth={3} />
              </span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
