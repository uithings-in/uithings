"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  SlidersHorizontal,
  Layout,
  PenTool,
  Monitor,
  Smartphone,
  Crown,
  Sparkles,
  Lock,
} from "lucide-react";
import type { DesignType, PlatformTag, PricingType } from "./types";

interface ClassificationCardProps {
  designType: DesignType;
  platformTag: PlatformTag;
  pricingType: PricingType;
  allowPro: boolean;
  onDesignTypeChange: (val: DesignType) => void;
  onPlatformTagChange: (val: PlatformTag) => void;
  onPricingTypeChange: (val: PricingType) => void;
}

export function ClassificationCard({
  designType,
  platformTag,
  pricingType,
  allowPro,
  onDesignTypeChange,
  onPlatformTagChange,
  onPricingTypeChange,
}: ClassificationCardProps) {
  return (
    <div className="rounded-xl border border-gray-200/80 dark:border-white/[0.08] bg-white dark:bg-[#111113] p-4 sm:p-5 shadow-xs space-y-3.5 transition-colors">
      {/* Header */}
      <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100 dark:border-white/[0.06]">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500/10 text-[#F97316]">
          <SlidersHorizontal size={14} />
        </div>
        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-[#F5F5F5]">
            Classification & Access
          </h3>
          <p className="text-[11px] text-gray-500 dark:text-[#A1A1AA] mt-0.5">
            Configure system categorization, responsive platform target, and member permissions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* 1. Design Type */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-700 dark:text-[#A1A1AA] block">
            Design Type
          </label>
          <div className="relative grid grid-cols-2 rounded-lg bg-gray-100 dark:bg-[#17171A] p-0.5 border border-gray-200/80 dark:border-white/[0.06]">
            <button
              type="button"
              onClick={() => onDesignTypeChange("UI Design")}
              className="relative flex h-8 items-center justify-center gap-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer select-none"
            >
              {designType === "UI Design" && (
                <motion.div
                  layoutId="classification-design-type-pill"
                  className="absolute inset-0 rounded-md bg-white dark:bg-[#222226] shadow-2xs border border-orange-500/20"
                  transition={{ type: "spring", stiffness: 480, damping: 34 }}
                />
              )}
              <span
                className={`relative z-10 flex items-center justify-center gap-1.5 transition-colors duration-150 ${
                  designType === "UI Design"
                    ? "text-[#EA580C] dark:text-[#FB923C] font-semibold"
                    : "text-gray-600 dark:text-[#A1A1AA] hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <Layout size={12} />
                <span>UI Design</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => onDesignTypeChange("Wireframe")}
              className="relative flex h-8 items-center justify-center gap-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer select-none"
            >
              {designType === "Wireframe" && (
                <motion.div
                  layoutId="classification-design-type-pill"
                  className="absolute inset-0 rounded-md bg-white dark:bg-[#222226] shadow-2xs border border-orange-500/20"
                  transition={{ type: "spring", stiffness: 480, damping: 34 }}
                />
              )}
              <span
                className={`relative z-10 flex items-center justify-center gap-1.5 transition-colors duration-150 ${
                  designType === "Wireframe"
                    ? "text-[#EA580C] dark:text-[#FB923C] font-semibold"
                    : "text-gray-600 dark:text-[#A1A1AA] hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <PenTool size={12} />
                <span>Wireframe</span>
              </span>
            </button>
          </div>
        </div>

        {/* 2. Platform */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-700 dark:text-[#A1A1AA] block">
            Platform Target
          </label>
          <div className="relative grid grid-cols-2 rounded-lg bg-gray-100 dark:bg-[#17171A] p-0.5 border border-gray-200/80 dark:border-white/[0.06]">
            <button
              type="button"
              onClick={() => onPlatformTagChange("web")}
              className="relative flex h-8 items-center justify-center gap-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer select-none"
            >
              {platformTag === "web" && (
                <motion.div
                  layoutId="classification-platform-target-pill"
                  className="absolute inset-0 rounded-md bg-white dark:bg-[#222226] shadow-2xs border border-orange-500/20"
                  transition={{ type: "spring", stiffness: 480, damping: 34 }}
                />
              )}
              <span
                className={`relative z-10 flex items-center justify-center gap-1.5 transition-colors duration-150 ${
                  platformTag === "web"
                    ? "text-[#EA580C] dark:text-[#FB923C] font-semibold"
                    : "text-gray-600 dark:text-[#A1A1AA] hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <Monitor size={12} />
                <span>Web</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => onPlatformTagChange("app")}
              className="relative flex h-8 items-center justify-center gap-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer select-none"
            >
              {platformTag === "app" && (
                <motion.div
                  layoutId="classification-platform-target-pill"
                  className="absolute inset-0 rounded-md bg-white dark:bg-[#222226] shadow-2xs border border-orange-500/20"
                  transition={{ type: "spring", stiffness: 480, damping: 34 }}
                />
              )}
              <span
                className={`relative z-10 flex items-center justify-center gap-1.5 transition-colors duration-150 ${
                  platformTag === "app"
                    ? "text-[#EA580C] dark:text-[#FB923C] font-semibold"
                    : "text-gray-600 dark:text-[#A1A1AA] hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <Smartphone size={12} />
                <span>App</span>
              </span>
            </button>
          </div>
        </div>

        {/* 3. Access Level */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-gray-700 dark:text-[#A1A1AA]">
              Access Level
            </label>
            {!allowPro && (
              <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400">
                Admin approval required
              </span>
            )}
          </div>

          <div className="relative grid grid-cols-2 rounded-lg bg-gray-100 dark:bg-[#17171A] p-0.5 border border-gray-200/80 dark:border-white/[0.06]">
            <button
              type="button"
              onClick={() => onPricingTypeChange("Free")}
              className="relative flex h-8 items-center justify-center gap-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer select-none"
            >
              {pricingType === "Free" && (
                <motion.div
                  layoutId="classification-pricing-type-pill"
                  className="absolute inset-0 rounded-md bg-white dark:bg-[#222226] shadow-2xs border border-orange-500/20"
                  transition={{ type: "spring", stiffness: 480, damping: 34 }}
                />
              )}
              <span
                className={`relative z-10 flex items-center justify-center gap-1.5 transition-colors duration-150 ${
                  pricingType === "Free"
                    ? "text-[#EA580C] dark:text-[#FB923C] font-semibold"
                    : "text-gray-600 dark:text-[#A1A1AA] hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <Sparkles size={12} />
                <span>Free</span>
              </span>
            </button>

            {/* Pro Option (disabled if user is not authorized to upload Pro) */}
            <button
              type="button"
              disabled={!allowPro}
              onClick={() => allowPro && onPricingTypeChange("Pro")}
              title={!allowPro ? "Only admin can activate Pro component uploads for your account" : undefined}
              className={`relative flex h-8 items-center justify-center gap-1.5 rounded-md text-xs font-medium transition-colors select-none ${
                !allowPro
                  ? "opacity-50 cursor-not-allowed text-gray-400 dark:text-[#71717A]"
                  : "cursor-pointer"
              }`}
            >
              {pricingType === "Pro" && (
                <motion.div
                  layoutId="classification-pricing-type-pill"
                  className="absolute inset-0 rounded-md bg-white dark:bg-[#222226] shadow-2xs border border-orange-500/20"
                  transition={{ type: "spring", stiffness: 480, damping: 34 }}
                />
              )}
              <span
                className={`relative z-10 flex items-center justify-center gap-1.5 transition-colors duration-150 ${
                  pricingType === "Pro"
                    ? "text-[#EA580C] dark:text-[#FB923C] font-semibold"
                    : !allowPro
                      ? "text-gray-400 dark:text-[#71717A]"
                      : "text-gray-600 dark:text-[#A1A1AA] hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {!allowPro ? <Lock size={11} /> : <Crown size={12} />}
                <span>Pro</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
