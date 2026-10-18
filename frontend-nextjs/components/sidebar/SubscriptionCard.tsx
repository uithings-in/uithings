"use client";

import React from "react";
import { Crown, ChevronRight, Infinity, Sparkles } from "lucide-react";
import {
  type SubscriptionSummary,
  type SubscriptionCardState,
  deriveSubscriptionInfo,
} from "./subscriptionHelper";

export interface SubscriptionCardProps {
  subscription: SubscriptionSummary | null | undefined;
  isLoading?: boolean;
  onManage?: () => void;
  collapsed?: boolean;
  className?: string;
}

export function SubscriptionCardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-busy="true"
      aria-label="Loading subscription details"
      className={`mx-3 sm:mx-4 mb-6 shrink-0 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.2)] font-manrope animate-pulse ${className}`}
    >
      {/* Header skeleton */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="h-8 w-8 rounded-full bg-white/10 shrink-0" />
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="h-4 w-24 bg-white/20 rounded" />
            <div className="h-3 w-28 bg-white/10 rounded" />
          </div>
        </div>
        <div className="h-4 w-12 bg-white/15 rounded shrink-0 mt-0.5" />
      </div>

      {/* Hero headline skeleton */}
      <div className="mt-3.5 space-y-1">
        <div className="h-6 w-32 bg-white/20 rounded" />
        <div className="h-3.5 w-40 bg-white/10 rounded" />
      </div>

      {/* Progress bar skeleton */}
      <div className="mt-3 h-1.5 w-full bg-white/10 rounded-full" />

      {/* Hairline divider */}
      <div className="my-3.5 border-t border-white/[0.08]" />

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="h-3 w-16 bg-white/10 rounded" />
          <div className="h-4 w-20 bg-white/20 rounded" />
        </div>
        <div className="space-y-1">
          <div className="h-3 w-16 bg-white/10 rounded" />
          <div className="h-4 w-12 bg-white/20 rounded" />
        </div>
      </div>

      {/* Button skeleton */}
      <div className="mt-3.5 h-11 w-full rounded-xl border border-white/[0.14] bg-transparent" />
    </div>
  );
}

export function SubscriptionCard({
  subscription,
  isLoading = false,
  onManage,
  collapsed = false,
  className = "",
}: SubscriptionCardProps) {
  if (isLoading) {
    return <SubscriptionCardSkeleton className={className} />;
  }

  const info = deriveSubscriptionInfo(subscription);

  // ── Collapsed mode ───────────────────────────────────────────────────────────
  if (collapsed) {
    return (
      <div className={`mx-2 mb-4 flex justify-center relative group/collapsed ${className}`}>
        <button
          type="button"
          onClick={onManage}
          aria-label={`Subscription: ${info.headline}`}
          className="h-10 w-10 rounded-full bg-orange-500/[0.12] text-orange-400 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9FE870] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1830] cursor-pointer"
        >
          <Crown size={18} strokeWidth={2.2} />
        </button>

        <div
          role="tooltip"
          className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-0 group-hover/collapsed:opacity-100 group-focus-within/collapsed:opacity-100 transition-opacity duration-150 rounded-lg bg-[#0b1326] border border-white/15 px-3 py-1.5 text-xs text-white shadow-2xl whitespace-nowrap"
        >
          <p className="font-semibold text-white/92">{info.planName}</p>
          <p className="text-white/64 mt-0.5">{info.headline}</p>
        </div>
      </div>
    );
  }

  // ── State styling: status dot, status text & solid progress bar ──────────────
  let statusTextColor = "text-[#9FE870]";
  let statusDotColor = "bg-[#9FE870]";
  let progressSolidColor = "bg-[#9FE870]";
  let pulseDot = true;

  if (info.state === "urgent") {
    statusTextColor = "text-rose-400";
    statusDotColor = "bg-rose-400";
    progressSolidColor = "bg-rose-400";
    pulseDot = true;
  } else if (info.state === "warning") {
    statusTextColor = "text-amber-400";
    statusDotColor = "bg-amber-400";
    progressSolidColor = "bg-amber-400";
    pulseDot = false;
  } else if (info.state === "expired") {
    statusTextColor = "text-rose-400/90";
    statusDotColor = "bg-rose-400/90";
    progressSolidColor = "bg-rose-400/50";
    pulseDot = false;
  } else if (info.state === "none") {
    statusTextColor = "text-white/64";
    statusDotColor = "bg-white/40";
    progressSolidColor = "bg-white/20";
    pulseDot = false;
  }

  const isUrgentOrExpired = info.state === "urgent" || info.state === "expired" || info.state === "none";

  return (
    <section
      aria-label="Subscription summary"
      className={`mx-3 sm:mx-4 mb-6 shrink-0 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.2)] font-manrope ${className}`}
    >
      {/* ── 1. Header (two lines, never wraps price, truncate long title) ─────── */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* 32px circular crown badge with faint orange tint */}
          <div
            aria-hidden="true"
            className="h-8 w-8 rounded-full bg-orange-500/[0.12] text-orange-400 flex items-center justify-center shrink-0"
          >
            <Crown size={16} strokeWidth={2.2} />
          </div>

          <div className="min-w-0 flex-1">
            <h2
              title={info.planName}
              className="text-base font-semibold text-white/92 leading-tight truncate"
            >
              {info.planName}
            </h2>
            <p className="text-sm font-normal text-white/64 leading-normal whitespace-nowrap mt-0.5">
              {info.priceFormatted}
            </p>
          </div>
        </div>

        {/* Status: small dot + text, NO pill background */}
        <div className={`shrink-0 flex items-center gap-1.5 pt-0.5 text-xs font-medium ${statusTextColor}`}>
          <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
            {pulseDot && (
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${statusDotColor}`} />
            )}
            <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${statusDotColor}`} />
          </span>
          <span>{info.statusLabel}</span>
        </div>
      </div>

      {/* ── 2. Hero Headline ─────────────────────────────────────────────────── */}
      <div className="mt-3.5">
        <p className="text-[24px] font-semibold text-white/92 leading-[1.2] tabular-nums tracking-[-0.01em]">
          {info.headline}
        </p>
        {info.subline && (
          <p className="text-sm font-normal text-white/64 mt-1 leading-normal">
            {info.subline}
          </p>
        )}
      </div>

      {/* ── 3. Progress Bar (6px solid fill in state accent) ────────────────── */}
      {info.state !== "none" && (
        <div className="mt-3">
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(info.percentRemaining)}
            aria-label="Subscription time remaining"
            className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden"
          >
            <div
              className={`h-full rounded-full ${progressSolidColor} motion-safe:transition-all motion-safe:duration-700 motion-reduce:transition-none`}
              style={{ width: `${info.percentRemaining}%` }}
            />
          </div>
        </div>
      )}

      {/* ── 4. Hairline Divider ─────────────────────────────────────────────── */}
      <div className="my-3.5 border-t border-white/[0.08]" />

      {/* ── 5. Stats Row (dl with 2 equal columns) ───────────────────────────── */}
      {info.state !== "none" ? (
        <dl className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1 min-w-0">
            <dt className="text-xs font-normal text-white/64">Downloads</dt>
            <dd className="text-base font-semibold text-white/92 tabular-nums">
              {info.isUnlimited ? (
                <span className="flex items-center gap-1.5">
                  <Infinity size={16} strokeWidth={2.2} className="text-white/80 shrink-0" aria-hidden="true" />
                  <span>Unlimited</span>
                </span>
              ) : (
                <span>
                  {info.downloadsUsed} / {info.maxComponents}
                </span>
              )}
            </dd>
          </div>

          <div className="flex flex-col gap-1 min-w-0">
            <dt className="text-xs font-normal text-white/64">Copied</dt>
            <dd className="text-base font-semibold text-white/92 tabular-nums">
              {info.downloadsUsed.toLocaleString()}
            </dd>
          </div>
        </dl>
      ) : (
        <dl className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1 min-w-0">
            <dt className="text-xs font-normal text-white/64">Downloads</dt>
            <dd className="text-base font-semibold text-white/92">
              <span className="flex items-center gap-1.5">
                <Sparkles size={16} className="text-[#9FE870] shrink-0" aria-hidden="true" />
                <span>Unlimited</span>
              </span>
            </dd>
          </div>

          <div className="flex flex-col gap-1 min-w-0">
            <dt className="text-xs font-normal text-white/64">Access</dt>
            <dd className="text-base font-semibold text-white/92 tabular-nums">
              73+
            </dd>
          </div>
        </dl>
      )}

      {/* ── 6. Action Button (44px min-height ghost/outline or solid CTA) ────── */}
      <button
        type="button"
        onClick={onManage}
        className={`w-full mt-3.5 min-h-[44px] h-11 px-4 rounded-xl text-sm flex items-center justify-between transition-all duration-150 cursor-pointer ${
          isUrgentOrExpired
            ? "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:brightness-110 active:scale-[0.99] text-white font-semibold shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1830]"
            : "border border-white/[0.14] bg-transparent hover:bg-white/[0.06] active:bg-white/[0.1] text-white/92 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9FE870] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1830]"
        }`}
      >
        <span>{info.buttonLabel}</span>
        <ChevronRight
          size={16}
          strokeWidth={2}
          className="text-white/70 group-hover:text-white transition-colors shrink-0"
          aria-hidden="true"
        />
      </button>
    </section>
  );
}
