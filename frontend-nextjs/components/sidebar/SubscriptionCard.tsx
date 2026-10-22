"use client";

import React from "react";
import { Crown, ChevronRight, Infinity } from "lucide-react";
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
      className={`mx-3 sm:mx-4 mb-6 shrink-0 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.2)] font-sans animate-pulse h-[243px] flex flex-col justify-between ${className}`}
    >
      {/* Header skeleton */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="h-7 w-7 rounded-full bg-white/10 shrink-0" />
          <div className="space-y-1 flex-1 min-w-0">
            <div className="h-3.5 w-24 bg-white/20 rounded" />
            <div className="h-3 w-16 bg-white/10 rounded" />
          </div>
        </div>
        <div className="h-3.5 w-14 bg-white/15 rounded shrink-0" />
      </div>

      {/* Hero headline skeleton */}
      <div className="mt-3 space-y-1.5">
        <div className="h-4 w-40 bg-white/20 rounded" />
        <div className="h-3.5 w-44 bg-white/10 rounded" />
      </div>

      {/* Hairline divider */}
      <div className="my-3.5 border-t border-white/[0.08]" />

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <div className="h-3 w-16 bg-white/10 rounded" />
          <div className="h-4 w-16 bg-white/20 rounded" />
        </div>
        <div className="space-y-1.5">
          <div className="h-3 w-12 bg-white/10 rounded" />
          <div className="h-4 w-10 bg-white/20 rounded" />
        </div>
      </div>

      {/* Button skeleton */}
      <div className="mt-3.5 h-10 w-full rounded-xl border border-white/[0.14] bg-transparent shrink-0" />
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
      className={`mx-3 sm:mx-4 mb-6 shrink-0 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.2)] font-sans min-h-[232px] ${className}`}
    >
      {/* ── 1. Header (two lines, never wraps price) ─────── */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {/* 28px circular crown badge with faint orange tint */}
          <div
            aria-hidden="true"
            className="h-7 w-7 rounded-full bg-orange-500/[0.12] text-orange-400 flex items-center justify-center shrink-0"
          >
            <Crown size={14} strokeWidth={2.2} />
          </div>

          <div className="min-w-0 flex-1">
            <h2
              title={info.planName}
              className="text-[13px] font-semibold text-white/95 leading-tight truncate"
            >
              {info.planName}
            </h2>
            <p className="text-[11px] font-normal text-white/55 leading-tight whitespace-nowrap mt-0.5">
              {info.priceFormatted}
            </p>
          </div>
        </div>

        {/* Status: small dot + text, NO pill background */}
        <div className={`shrink-0 flex items-center gap-1.5 text-[11px] font-medium ${statusTextColor}`}>
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
      <div className="mt-3">
        <p className="text-[14.5px] sm:text-[15px] font-bold text-white leading-snug tracking-tight">
          {info.headline}
        </p>
        {info.subline && (
          <p className="text-xs font-normal text-white/60 mt-1 leading-relaxed">
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
        <dl className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-0.5 min-w-0">
            <dt className="text-[11px] font-medium text-white/55">Downloads</dt>
            <dd className="text-sm font-semibold text-white tabular-nums">
              {info.isUnlimited ? (
                <span className="flex items-center gap-1.5">
                  <Infinity size={15} strokeWidth={2.2} className="text-white/80 shrink-0" aria-hidden="true" />
                  <span>Unlimited</span>
                </span>
              ) : (
                <span>
                  {info.downloadsUsed} / {info.maxComponents}
                </span>
              )}
            </dd>
          </div>

          <div className="flex flex-col gap-0.5 min-w-0">
            <dt className="text-[11px] font-medium text-white/55">Copied</dt>
            <dd className="text-sm font-semibold text-white tabular-nums">
              {info.downloadsUsed.toLocaleString()}
            </dd>
          </div>
        </dl>
      ) : (
        <dl className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-0.5 min-w-0">
            <dt className="text-[11px] font-medium text-white/55">Downloads</dt>
            <dd className="text-sm font-semibold text-white">
              Unlimited
            </dd>
          </div>

          <div className="flex flex-col gap-0.5 min-w-0">
            <dt className="text-[11px] font-medium text-white/55">Access</dt>
            <dd className="text-sm font-semibold text-white tabular-nums">
              73+
            </dd>
          </div>
        </dl>
      )}

      {/* ── 6. Action Button (ghost/outline or solid CTA) ────── */}
      <button
        type="button"
        onClick={onManage}
        className="w-full mt-3.5 min-h-[40px] h-10 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-between transition-all duration-200 cursor-pointer border border-white/20 hover:border-white/40 bg-transparent hover:bg-white/5 active:scale-[0.99] text-white font-semibold shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1830]"
      >
        <span className="font-semibold text-[13px]">{info.buttonLabel}</span>
        <ChevronRight
          size={15}
          strokeWidth={2.2}
          className="text-white/80 group-hover:text-white transition-colors shrink-0"
          aria-hidden="true"
        />
      </button>
    </section>
  );
}
