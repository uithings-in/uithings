"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Clipboard,
  CheckCircle2,
  Trash2,
  MonitorSmartphone,
  Loader2,
  AlertCircle,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { extractFigmaBase64FromPaste } from "../../lib/clipboard";

interface FigmaPayloadZoneProps {
  payload: string;
  onPayloadChange: (payload: string) => void;
  error?: string;
  onBlur?: () => void;
}

export function FigmaPayloadZone({
  payload,
  onPayloadChange,
  error,
  onBlur,
}: FigmaPayloadZoneProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Global Ctrl+V listener
  useEffect(() => {
    const handleGlobalPaste = async (event: ClipboardEvent) => {
      const activeEl = document.activeElement as HTMLElement | null;
      // Allow paste if user is on our paste box OR outside of other input/textareas
      const isOtherInput =
        activeEl &&
        (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA") &&
        activeEl !== textareaRef.current;

      if (isOtherInput) return;

      setIsProcessing(true);
      setLocalError(null);
      try {
        const extracted = await extractFigmaBase64FromPaste(event);
        if (extracted) {
          onPayloadChange(extracted);
        } else {
          setLocalError("No valid Figma component data detected in clipboard. Copy a layer in Figma and try again.");
        }
      } catch (err) {
        setLocalError(err instanceof Error ? err.message : "Failed to extract Figma payload.");
      } finally {
        setIsProcessing(false);
      }
    };

    window.addEventListener("paste", handleGlobalPaste);
    return () => window.removeEventListener("paste", handleGlobalPaste);
  }, [onPayloadChange]);

  const handleManualPaste = async (event: React.ClipboardEvent) => {
    setIsProcessing(true);
    setLocalError(null);
    try {
      const extracted = await extractFigmaBase64FromPaste(event.nativeEvent);
      if (extracted) {
        onPayloadChange(extracted);
      } else {
        setLocalError("No valid Figma component data detected in clipboard.");
      }
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Failed to extract Figma payload.");
    } finally {
      setIsProcessing(false);
    }
  };

  const payloadSizeKb = payload ? Math.round(payload.length / 1024) : 0;

  return (
    <div className="rounded-xl border border-gray-200/80 dark:border-white/[0.08] bg-white dark:bg-[#111113] p-4 sm:p-5 shadow-xs transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500/10 text-[#F97316]">
            <Clipboard size={14} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-[#F5F5F5]">
                Figma Asset Payload
              </h3>
              <span className="text-[#EA580C] dark:text-[#FB923C] text-xs font-bold" aria-hidden="true">
                *
              </span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-[#A1A1AA] mt-0.5">
              Copy any layer or component from Figma and paste it directly here.
            </p>
          </div>
        </div>

        {/* Status Badge */}
        {payload ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 size={11} />
            READY
          </span>
        ) : (
          <span className="inline-flex items-center rounded-md bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 text-[10px] font-semibold text-[#EA580C] dark:text-[#FB923C]">
            REQUIRED
          </span>
        )}
      </div>

      {/* Main Paste Box */}
      <div className="mt-3">
        {payload ? (
          /* Success State */
          <div className="rounded-lg border border-emerald-500/30 dark:border-emerald-900/50 bg-[#0A0A0B] p-3 text-white">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400">
                <CheckCircle2 size={13} />
                <span className="font-semibold text-[11px]">Valid Figma Stream Verified</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-400">
                <span>{payloadSizeKb} KB</span>
                <span className="text-white/20">•</span>
                <span className="text-emerald-400 font-semibold">Ready to copy</span>
              </div>
            </div>

            <div className="my-2 rounded bg-black/60 p-2 font-mono text-[10px] text-emerald-400/90 leading-tight max-h-16 overflow-hidden border border-white/[0.05]">
              <code>
                {`<!-- figma-component -->\n[STREAM: base64-encoded] verified\n${payload.slice(0, 100)}...`}
              </code>
            </div>

            <div className="flex items-center justify-between pt-1.5 border-t border-white/[0.08]">
              <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                <Sparkles size={11} className="text-emerald-400" />
                Copies back to Figma with vector accuracy
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onPayloadChange("")}
                  className="inline-flex items-center gap-1 rounded-md bg-white/10 hover:bg-white/15 px-2.5 py-1 text-[11px] font-medium text-white transition cursor-pointer"
                >
                  <RefreshCw size={11} />
                  <span>Replace</span>
                </button>
                <button
                  type="button"
                  onClick={() => onPayloadChange("")}
                  className="inline-flex items-center gap-1 rounded-md bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 px-2.5 py-1 text-[11px] font-medium transition cursor-pointer"
                  title="Remove payload"
                >
                  <Trash2 size={11} />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Empty / Pasting State */
          <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`relative min-h-[130px] flex flex-col items-center justify-center rounded-xl border border-dashed transition-all duration-150 p-4 text-center cursor-pointer ${isHovered
                ? "border-[#F97316] bg-orange-500/[0.03] dark:bg-orange-500/[0.05]"
                : error || localError
                  ? "border-rose-400 bg-rose-500/[0.03]"
                  : "border-gray-300 dark:border-white/[0.12] bg-gray-50/60 dark:bg-[#17171A]/70 hover:border-[#F97316]"
              }`}
            onClick={() => textareaRef.current?.focus()}
          >
            {isProcessing ? (
              <div className="flex flex-col items-center gap-1.5 py-3">
                <Loader2 size={20} className="animate-spin text-[#F97316]" />
                <span className="text-xs font-medium text-gray-700 dark:text-[#F5F5F5]">
                  Reading Figma clipboard data...
                </span>
              </div>
            ) : (
              <>
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg transition-transform ${isHovered
                      ? "scale-105 bg-orange-500/15 text-[#F97316]"
                      : "bg-gray-200/80 dark:bg-white/[0.06] text-gray-500 dark:text-[#A1A1AA]"
                    }`}
                >
                  <MonitorSmartphone size={18} />
                </div>

                <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-gray-800 dark:text-[#F5F5F5]">
                  <span>Click here and press</span>
                  <kbd className="inline-flex items-center gap-1 rounded bg-gray-200 dark:bg-white/[0.12] px-1.5 py-0.5 font-mono text-[11px] font-semibold text-gray-800 dark:text-white border border-gray-300 dark:border-white/[0.15]">
                    Ctrl + V
                  </kbd>
                  <span className="text-[11px] text-gray-400">(or ⌘ + V)</span>
                </div>

                <p className="mt-0.5 text-[11px] text-gray-500 dark:text-[#A1A1AA]">
                  Global paste active — paste anywhere on this page without clicking.
                </p>

                {/* 3-Step Hint Pills */}
                <div className="mt-2.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 pt-2 border-t border-gray-200/60 dark:border-white/[0.06]">
                  <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-[#A1A1AA]">
                    <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-orange-500/15 text-[#EA580C] dark:text-[#FB923C] font-semibold">
                      1
                    </span>
                    <span>Select in Figma</span>
                  </div>
                  <span className="text-gray-300 dark:text-neutral-700 text-[10px]">→</span>
                  <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-[#A1A1AA]">
                    <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-orange-500/15 text-[#EA580C] dark:text-[#FB923C] font-semibold">
                      2
                    </span>
                    <span>Copy (Ctrl+C)</span>
                  </div>
                  <span className="text-gray-300 dark:text-neutral-700 text-[10px]">→</span>
                  <div className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-[#A1A1AA]">
                    <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-orange-500/15 text-[#EA580C] dark:text-[#FB923C] font-semibold">
                      3
                    </span>
                    <span>Paste here</span>
                  </div>
                </div>

                {/* Invisible focusable textarea for paste events */}
                <textarea
                  ref={textareaRef}
                  id="figmaAssetPasteArea"
                  onPaste={handleManualPaste}
                  onBlur={onBlur}
                  className="absolute inset-0 h-full w-full cursor-pointer resize-none opacity-0"
                  aria-label="Paste Figma component payload"
                />
              </>
            )}
          </div>
        )}
      </div>

      {/* Inline Error State */}
      {(error || localError) && (
        <div className="mt-2.5 flex items-center gap-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 px-3 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300">
          <AlertCircle size={13} className="shrink-0" />
          <span className="flex-1 text-[11px]">{error || localError}</span>
          {localError && (
            <button
              type="button"
              onClick={() => setLocalError(null)}
              className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-200 underline text-[11px] cursor-pointer"
            >
              Dismiss
            </button>
          )}
        </div>
      )}
    </div>
  );
}
