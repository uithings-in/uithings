"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Copy,
  Monitor,
  Smartphone,
  Sparkles,
  Crown,
  Eye,
  Check,
  Moon,
  Sun,
  Layers,
} from "lucide-react";
import type { ComponentFormValues } from "./types";

interface LivePreviewCardProps {
  values: ComponentFormValues;
}

const THEME_OPTIONS: Array<{
  id: "light" | "dark" | "wireframe";
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}> = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "wireframe", label: "Wireframe", icon: Layers },
];

export function LivePreviewCard({ values }: LivePreviewCardProps) {
  const {
    name,
    previewUrl,
    lightPreviewUrl,
    darkPreviewUrl,
    wireframePreviewUrl,
    tags,
    platformTag,
    pricingType,
    designType,
  } = values;

  const [activeTheme, setActiveTheme] = useState<"light" | "dark" | "wireframe">("light");

  // Auto-switch to whichever preview is available if only one is uploaded
  useEffect(() => {
    if (lightPreviewUrl && !darkPreviewUrl && !wireframePreviewUrl) {
      setActiveTheme("light");
    } else if (darkPreviewUrl && !lightPreviewUrl && !wireframePreviewUrl) {
      setActiveTheme("dark");
    } else if (wireframePreviewUrl && !lightPreviewUrl && !darkPreviewUrl) {
      setActiveTheme("wireframe");
    }
  }, [lightPreviewUrl, darkPreviewUrl, wireframePreviewUrl]);

  const activeUrl =
    activeTheme === "light"
      ? lightPreviewUrl || previewUrl || darkPreviewUrl || wireframePreviewUrl
      : activeTheme === "dark"
        ? darkPreviewUrl || previewUrl || lightPreviewUrl || wireframePreviewUrl
        : wireframePreviewUrl || previewUrl || lightPreviewUrl || darkPreviewUrl;

  return (
    <div className="rounded-xl border border-gray-200/80 dark:border-white/[0.08] bg-white dark:bg-[#111113] p-4 shadow-xs space-y-3 transition-colors">
      <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 dark:border-white/[0.06] gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <Eye size={13} className="text-[#F97316]" />
          <h3 className="text-xs font-semibold text-gray-900 dark:text-[#F5F5F5]">
            Live Library Preview
          </h3>
        </div>

        {/* Theme Preview Switcher with Sliding Pill Animation */}
        <div className="relative grid grid-cols-3 rounded-md bg-gray-100 dark:bg-white/[0.06] p-0.5 border border-gray-200/60 dark:border-white/[0.08] min-w-[210px]">
          {THEME_OPTIONS.map((theme) => {
            const Icon = theme.icon;
            const isActive = activeTheme === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => setActiveTheme(theme.id)}
                className="relative flex h-6 items-center justify-center gap-1 px-2 rounded text-[10px] font-semibold transition-colors cursor-pointer select-none"
                title={`Preview ${theme.label} Mode`}
              >
                {isActive && (
                  <motion.div
                    layoutId="live-preview-theme-pill"
                    className="absolute inset-0 rounded bg-white dark:bg-[#222226] shadow-2xs"
                    transition={{
                      type: "spring",
                      stiffness: 420,
                      damping: 32,
                    }}
                  />
                )}
                <span
                  className={`relative z-10 flex items-center justify-center gap-1 whitespace-nowrap leading-none transition-colors duration-150 ${
                    isActive
                      ? "text-gray-900 dark:text-white"
                      : "text-gray-500 hover:text-gray-900 dark:text-gray-400"
                  }`}
                >
                  <Icon size={10} className="shrink-0" />
                  <span>{theme.label}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mock Component Card */}
      <article className="group relative overflow-hidden rounded-lg border border-gray-200/90 dark:border-white/[0.1] bg-white dark:bg-[#17171A] shadow-2xs flex flex-col transition-all">
        {/* Screenshot Container */}
        <div
          className={`relative aspect-[16/9] border-b border-gray-100 dark:border-white/[0.06] flex items-center justify-center overflow-hidden transition-colors ${
            activeTheme === "dark"
              ? "bg-[#0A0A0B]"
              : activeTheme === "wireframe"
                ? "bg-[#18181B] bg-grid-dots-gray"
                : "bg-[#F8F9FA]"
          }`}
          style={
            activeTheme === "wireframe"
              ? {
                  backgroundImage:
                    "radial-gradient(rgba(156, 163, 175, 0.35) 1.25px, transparent 1.25px)",
                  backgroundSize: "16px 16px",
                }
              : undefined
          }
        >
          {activeUrl ? (
            <Image
              src={activeUrl}
              alt={name || `${activeTheme} component preview`}
              fill
              unoptimized
              className="object-contain w-full h-full"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-1 text-gray-400 dark:text-[#71717A] p-3 text-center">
              <div className="h-8 w-8 rounded-lg bg-gray-200/60 dark:bg-white/[0.05] flex items-center justify-center">
                <Eye size={15} />
              </div>
              <span className="text-[11px] font-medium">
                Upload {activeTheme === "wireframe" ? "wireframe" : `${activeTheme} mode`} screenshot to preview
              </span>
            </div>
          )}

          {/* Badges Overlay */}
          <div className="absolute top-2 left-2 flex items-center gap-1">
            {designType === "Both" ? (
              <>
                <span className="rounded bg-black/60 backdrop-blur-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                  UI Design
                </span>
                <span className="rounded bg-black/60 backdrop-blur-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                  Wireframe
                </span>
              </>
            ) : designType ? (
              <span className="rounded bg-black/60 backdrop-blur-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                {designType}
              </span>
            ) : null}
          </div>

          <div className="absolute top-2 right-2 flex items-center gap-1">
            {pricingType === "Pro" ? (
              <span className="inline-flex items-center gap-1 rounded bg-orange-500/90 backdrop-blur-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-2xs">
                <Crown size={9} />
                PRO
              </span>
            ) : (
              <span className="inline-flex items-center rounded bg-emerald-600/90 backdrop-blur-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-2xs">
                FREE
              </span>
            )}
          </div>
        </div>

        {/* Card Body */}
        <div className="p-3 flex flex-col flex-1 justify-between gap-2.5">
          <div>
            <div className="flex items-center justify-between gap-1.5">
              <h4 className="truncate text-xs font-semibold text-gray-900 dark:text-[#F5F5F5] leading-snug">
                {name.trim() || "Untitled Component"}
              </h4>
              <span
                className="shrink-0 text-gray-400 dark:text-[#71717A]"
                title={
                  platformTag === "web" ? "Web Component" : "Mobile Component"
                }
              >
                {platformTag === "web" ? (
                  <Monitor size={11} />
                ) : (
                  <Smartphone size={11} />
                )}
              </span>
            </div>

            {/* Tags */}
            <div className="mt-1.5 flex flex-wrap gap-1 min-h-[18px]">
              {tags.length > 0 ? (
                tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded bg-gray-100 dark:bg-white/[0.06] px-1.5 py-0.5 text-[9.5px] font-medium text-gray-600 dark:text-[#A1A1AA]"
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <span className="text-[10px] text-gray-400 dark:text-[#71717A] italic">
                  No tags added yet
                </span>
              )}
            </div>
          </div>

          {/* Action Row Preview */}
          <div className="pt-2 border-t border-gray-100 dark:border-white/[0.06] flex items-center justify-between">
            <div className="flex-1 flex items-center justify-center gap-1 rounded-md bg-gray-100 dark:bg-white/[0.06] py-1 text-[11px] font-medium text-gray-600 dark:text-[#D4D4D8] opacity-80 cursor-default">
              <Copy size={11} />
              <span>Copy to Figma</span>
            </div>
          </div>
        </div>
      </article>

      <p className="text-[10px] text-gray-400 dark:text-[#71717A] leading-normal text-center">
        Updates in real time as you configure fields.
      </p>
    </div>
  );
}
