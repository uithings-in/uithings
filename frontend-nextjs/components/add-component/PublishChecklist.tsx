"use client";

import React from "react";
import { CheckCircle2, Circle, ListChecks, Check } from "lucide-react";
import type { ChecklistItem } from "./types";

interface PublishChecklistProps {
  checklist: ChecklistItem[];
  completedCount: number;
}

export function PublishChecklist({
  checklist,
  completedCount,
}: PublishChecklistProps) {
  const total = checklist.length;
  const percentage = Math.round((completedCount / total) * 100);

  return (
    <div className="rounded-xl border border-gray-200/80 dark:border-white/[0.08] bg-white dark:bg-[#111113] p-4 shadow-xs space-y-3 transition-colors">
      <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 dark:border-white/[0.06]">
        <div className="flex items-center gap-1.5">
          <ListChecks size={13} className="text-[#F97316]" />
          <h3 className="text-xs font-semibold text-gray-900 dark:text-[#F5F5F5]">
            Publish Checklist
          </h3>
        </div>
        <span className="font-mono text-[11px] font-semibold text-[#EA580C] dark:text-[#FB923C]">
          {completedCount} of {total} done
        </span>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="h-1 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-[#F97316] transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-gray-400 dark:text-[#71717A]">
          <span>Completion</span>
          <span>{percentage}%</span>
        </div>
      </div>

      {/* Checklist Items */}
      <ul className="space-y-2 pt-0.5" aria-label="Component readiness checklist">
        {checklist.map((item) => (
          <li key={item.id} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              {item.completed ? (
                <div className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <Check size={9} strokeWidth={3} />
                </div>
              ) : (
                <Circle size={13} className="text-gray-300 dark:text-[#71717A] shrink-0" />
              )}
              <span
                className={`text-xs ${
                  item.completed
                    ? "font-medium text-gray-900 dark:text-[#F5F5F5]"
                    : "text-gray-500 dark:text-[#71717A]"
                }`}
              >
                {item.label}
              </span>
            </div>

            {item.required && !item.completed && (
              <span className="text-[9.5px] font-semibold text-orange-500 dark:text-orange-400 uppercase tracking-wider">
                Required
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
