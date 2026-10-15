"use client";

import React, { useState } from "react";
import { Info, Loader2, Check, Trash2, AlertCircle } from "lucide-react";

interface StickyActionBarProps {
  canPublish: boolean;
  missingFields: string[];
  isSubmitting: boolean;
  lastSavedTime?: number | null;
  onPublish: () => void;
  onCancel: () => void;
  onClearDraft?: () => void;
  isDirty?: boolean;
  publishLabel?: string;
  publishingLabel?: string;
}

export function StickyActionBar({
  canPublish,
  missingFields,
  isSubmitting,
  lastSavedTime,
  onPublish,
  onCancel,
  onClearDraft,
  isDirty,
  publishLabel,
  publishingLabel,
}: StickyActionBarProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="sticky bottom-0 z-30 mt-6 -mx-4 lg:-mx-6 px-4 lg:px-6 py-2.5 sm:py-3 bg-white/95 dark:bg-[#0A0A0B]/95 backdrop-blur-md border-t border-gray-200 dark:border-white/[0.08] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.4)]">
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2.5">
        {/* Left: Info note & draft status */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs text-gray-500 dark:text-[#A1A1AA]">
          <div className="flex items-center gap-1.5 font-medium">
            <Info size={13} className="text-[#F97316] shrink-0" />
            <span className="text-[11px] sm:text-xs">Components are verified automatically before publication</span>
          </div>

          {lastSavedTime && isDirty && (
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-white/[0.1] text-[11px] text-gray-400 dark:text-[#71717A]">
              <span className="flex items-center gap-1 text-emerald-500">
                <Check size={10} strokeWidth={3} />
                Draft autosaved
              </span>
              <button
                type="button"
                onClick={onClearDraft}
                className="hover:text-rose-500 transition cursor-pointer underline text-[10px]"
                title="Discard draft and reset form"
              >
                Clear draft
              </button>
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="h-8.5 rounded-lg border border-gray-300 dark:border-white/[0.1] bg-white dark:bg-[#17171A] hover:bg-gray-100 dark:hover:bg-white/[0.06] px-3.5 text-xs font-medium text-gray-700 dark:text-[#E4E4E7] transition cursor-pointer shadow-2xs disabled:opacity-50"
          >
            Cancel
          </button>

          {/* Publish Button Container with Missing Fields Tooltip */}
          <div
            className="relative"
            onMouseEnter={() => !canPublish && setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <button
              type="button"
              onClick={onPublish}
              disabled={!canPublish || isSubmitting}
              className={`h-8.5 px-4 rounded-lg text-xs font-semibold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                canPublish && !isSubmitting
                  ? "bg-[#F97316] hover:bg-[#FB8A3C] active:bg-[#EA6A0A] text-white shadow-orange-500/20 shadow-sm cursor-pointer"
                  : "bg-gray-200 dark:bg-white/[0.08] text-gray-400 dark:text-[#71717A] cursor-not-allowed opacity-70"
              }`}
            >
              {isSubmitting && <Loader2 size={13} className="animate-spin text-white" />}
              <span>{isSubmitting ? (publishingLabel || "Publishing...") : (publishLabel || "Publish Component")}</span>
            </button>

            {/* Tooltip listing what's missing when disabled */}
            {!canPublish && showTooltip && (
              <div className="absolute bottom-full right-0 mb-2 w-60 rounded-xl border border-gray-200 dark:border-white/[0.1] bg-white dark:bg-[#17171A] p-2.5 shadow-xl text-left z-30 animate-in fade-in duration-100">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-900 dark:text-white pb-1.5 border-b border-gray-100 dark:border-white/[0.08]">
                  <AlertCircle size={12} className="text-[#F97316]" />
                  <span>Required to publish:</span>
                </div>
                <ul className="mt-1.5 space-y-1 text-[11px] text-gray-500 dark:text-[#A1A1AA]">
                  {missingFields.map((field) => (
                    <li key={field} className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400 font-medium">
                      <span className="h-1 w-1 rounded-full bg-[#F97316]" />
                      <span>{field}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
