"use client";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { componentsApi } from "../../api/components";
import { paymentsApi, type CurrentSubscriptionData, type SubscriptionData } from "../../api/payments";
import { copyToFigma } from "../../lib/clipboard";
import type { PaginatedComponentResponse, ComponentItem } from "../../lib/types";
import Navbar from "../../components/landing/Navbar";
import { useAuth } from "../../context/AuthContext";
import { Scaling, Frame, Copy, ArrowDownToLine, Crown, Heart, Database } from "lucide-react";




// ── icons (inline SVGs to avoid extra deps) ──────────────────────────────────
function IconGrid() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="0" y="0" width="6" height="6" rx="1" fill="currentColor" />
      <rect x="8" y="0" width="6" height="6" rx="1" fill="currentColor" />
      <rect x="0" y="8" width="6" height="6" rx="1" fill="currentColor" />
      <rect x="8" y="8" width="6" height="6" rx="1" fill="currentColor" />
    </svg>
  );
}
function IconChevron() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M5 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconWireframe() {
  return <Frame size={18} />;
}
function IconPalette() {
  return <Scaling size={18} />;
}
function IconX() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function IconUnlock({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
    </svg>
  );
}
function IconCheck() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );
}
// ── constants ─────────────────────────────────────────────────────────────────

// CATEGORIES are now loaded dynamically from the backend

type ViewMode = "wireframe" | "ui-design";
type PriceMode = "free" | "pro" | "all";
type PlatformMode = "all" | "web" | "app";

const PAGE_SIZE = 15;
const INITIAL_VIEW_MODE: ViewMode = "ui-design";
const INITIAL_PRICE_MODE: PriceMode = "all";
const INITIAL_PLATFORM_MODE: PlatformMode = "all";

function isProComponent(item: Pick<ComponentItem, "pricingType" | "tags">) {
  return item.pricingType === "Pro" || item.tags.some((t) => /pro/i.test(t));
}

function formatCompactCount(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1)}m`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(value >= 10_000 ? 0 : 1)}k`;
  return String(value);
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-5 right-5 z-[220]">
      <div className="flex items-center gap-3 rounded-xl bg-black/90 text-white px-4 py-3 shadow-lg border border-white/10">
        <span className="text-sm font-semibold">{message}</span>
        <button
          type="button"
          onClick={onClose}
          className="text-white/70 hover:text-white transition-colors"
          aria-label="Dismiss"
        >
          <IconX />
        </button>
      </div>
    </div>
  );
}

// ── Pro subscription usage card ───────────────────────────────────────────────
type SubscriptionSummary = CurrentSubscriptionData | SubscriptionData;

function formatPlanPrice(price?: number, durationDays?: number) {
  if (!price || !durationDays) return "Active plan";
  return `₹${(price / 100).toFixed(2)} / ${durationDays} Days`;
}

function getDaysBetween(startDate?: string, endDate?: string) {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 0;
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
}

function getDaysLeft(endDate?: string) {
  if (!endDate) return 0;
  const end = new Date(endDate).getTime();
  if (!Number.isFinite(end)) return 0;
  return Math.max(0, Math.ceil((end - Date.now()) / (1000 * 60 * 60 * 24)));
}

function UsageMeter({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}) {
  const progress = total <= 0 ? 100 : Math.min(100, Math.max(0, (value / total) * 100));

  return (
    <div>
      <div className="mb-1 flex items-end justify-between gap-2">
        <span className="text-[0.72rem] font-bold text-slate-700">{label}</span>
        <span className="text-[0.68rem] font-semibold text-slate-500">
          {value} / {total}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-[#22C55E] transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function IconInfinity({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.133-8-12.739-8-4.585 0-4.585 8 0 8 5.606 0 7.644-8 12.74-8z" />
    </svg>
  );
}

function ProSubscriptionCard({ subscription }: { subscription: SubscriptionSummary | null }) {
  const plan = subscription && "plan" in subscription ? subscription.plan : undefined;
  const planName = plan?.displayName ? `${plan.displayName} Plan` : "Pro Plan";
  const maxComponents = subscription?.maxComponents ?? plan?.componentLimit ?? 0;
  const isUnlimited = maxComponents >= 999999;
  const downloadsUsed = Math.max(0, subscription?.componentCountUsed ?? 0);
  const durationDays =
    plan?.durationDays ||
    getDaysBetween(subscription && "startDate" in subscription ? subscription.startDate : undefined, subscription?.endDate) ||
    180;
  const daysLeft = getDaysLeft(subscription?.endDate);
  const daysPassed = Math.max(0, durationDays - daysLeft);
  const expiresSoon = daysLeft <= 7;

  // ── Unlimited / Premium+ card ──────────────────────────────────────────
  if (isUnlimited) {
    return (
      <div className="mx-4 mb-6 shrink-0 rounded-2xl border border-white p-[1px] shadow-[0_10px_30px_rgba(15,23,42,0.07)]"
        style={{ background: "radial-gradient(120% 120% at 50% 50%, rgba(255,255,255,0.24), rgba(255,255,255,0.06))" }}>
        <div className="rounded-[15px] p-4" style={{ background: "linear-gradient(146deg, rgba(255,255,255,0.06) 39%, rgba(255,255,255,0.24) 107%)" }}>
          {/* Header — stacked to avoid overlap */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <div className="shrink-0 flex h-7 w-7 items-center justify-center rounded-[4px]"
                style={{ background: "#d66a04" }}>
                <Crown size={14} color="white" strokeWidth={2.5} />
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-[0.56rem] font-extrabold uppercase tracking-wider flex items-center gap-1 ${expiresSoon
                ? "bg-red-50 text-red-600"
                : daysLeft > 0
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                  : "bg-red-50 text-red-600"
                }`}>
                <span className={`inline-block h-1.5 w-1.5 rounded-full ${expiresSoon ? "bg-red-500" : daysLeft > 0 ? "bg-emerald-500 animate-pulse" : "bg-red-500"
                  }`} />
                {daysLeft > 0 ? "Active" : "Expired"}
              </span>
            </div>
            <p className="text-[0.92rem] font-extrabold text-white leading-tight">{planName}</p>
            <p className="text-[0.65rem] font-bold text-[#d5d5d5] mt-0.5">
              {formatPlanPrice(plan?.price, plan?.durationDays)}
            </p>
          </div>

          {/* Unlimited downloads highlight */}
          <div className="rounded-xl p-3 mb-3 shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
            style={{ background: "radial-gradient(140% 160% at 42% 36%, rgba(255,255,255,0.26), rgba(255,255,255,0.06))" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[0.72rem] font-bold text-white">Downloads</span>
              <div className="flex items-center gap-1 text-[#f2f2f2]">
                <IconInfinity className="w-4 h-4" />
                <span className="text-[0.65rem] font-extrabold uppercase tracking-wider">Unlimited</span>
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[1.4rem] font-black text-white tabular-nums leading-none">
                {downloadsUsed.toLocaleString()}
              </span>
              <span className="text-[0.65rem] font-semibold text-[#f2f2f2]">components copied</span>
            </div>
          </div>

          {/* Days remaining — text only, no progress bar */}
          <div className="rounded-lg p-3 flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.1)]" style={{ background: "radial-gradient(120% 120% at 42% 36%, rgba(255,255,255,0.26), rgba(255,255,255,0.06))" }}>
            <span className="text-[0.72rem] font-bold text-white">Validity</span>
            <span className="text-[0.68rem] font-semibold text-[#fbfcfd]">
              {daysLeft > 0 ? `${daysLeft} days remaining` : "Plan expired"}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ── Limited plan card (Basic / Advance) ────────────────────────────────
  return (
    <div className="mx-4 mb-6 shrink-0 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[0.95rem] font-extrabold text-slate-900">{planName}</p>
          <p className="mt-1 text-[0.72rem] font-bold text-[#238B45]">
            {formatPlanPrice(plan?.price, plan?.durationDays)}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-md px-2 py-1 text-[0.56rem] font-extrabold uppercase tracking-wide ${expiresSoon ? "bg-red-50 text-red-600" : "bg-sky-50 text-sky-700"
            }`}
        >
          {daysLeft > 0 ? `${daysLeft} days left` : "Expired"}
        </span>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[0.75rem] font-bold text-slate-700">Plan Usage</span>
          <span className="text-[0.65rem] font-semibold text-slate-400">Current cycle</span>
        </div>
        <div className="space-y-3">
          <UsageMeter label="Downloads" value={downloadsUsed} total={maxComponents} />
          <UsageMeter label="Days passed" value={daysPassed} total={durationDays} />
        </div>
      </div>
    </div>
  );
}

// ── SkeletonCard ──────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <article
      className="w-full aspect-[390/320] rounded-[20px] border border-[rgba(229,231,235,0.8)] overflow-hidden shadow-sm flex flex-col p-2.5 animate-pulse bg-white/10"
    >
      {/* Preview placeholder */}
      <div className="flex-1 bg-white/20 rounded-xl min-h-0" />

      {/* Footer row placeholder */}
      <div className="px-2 pt-2 pb-1.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-3.5 w-24 bg-white/25 rounded-full" />
          <div className="h-3 w-8 bg-white/15 rounded-md" />
        </div>
        <div className="flex gap-2">
          <div className="h-4 w-4 bg-white/20 rounded-full" />
          <div className="h-4 w-4 bg-white/20 rounded-full" />
          <div className="h-4 w-6 bg-white/20 rounded-full" />
        </div>
      </div>

      {/* Actions placeholder */}
      <div className="px-1 pb-1 shrink-0">
        <div className="w-full h-8 bg-white/15 rounded-full" />
      </div>
    </article>
  );
}

// ── PreviewModal ──────────────────────────────────────────────────────────────
function getInitials(name: string) {
  if (!name) return "U";
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function PreviewModal({
  item,
  onClose,
  onCopy,
  isCopying,
  isFavorite,
  onFavoriteToggle,
  isFavoritePending,
  onDownloadRecorded,
}: {
  item: ComponentItem;
  onClose: () => void;
  onCopy: (item: ComponentItem, closePreview: () => void) => Promise<boolean>;
  isCopying: boolean;
  isFavorite: boolean;
  onFavoriteToggle: (item: ComponentItem) => void;
  isFavoritePending: boolean;
  onDownloadRecorded: (item: ComponentItem) => Promise<number | null>;
}) {
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleCopy() {
    if (isCopying || isSuccess) return;
    const success = await onCopy(item, onClose);
    if (success) {
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 2000);
      void onDownloadRecorded(item);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 md:p-6"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[24px] shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden font-manrope animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 shrink-0 border-b border-gray-50">
          <div className="flex items-center gap-2.5">
            <div className="text-[#238B45] w-5 h-5 flex items-center justify-center">
              <Database size={18} strokeWidth={2.25} />
            </div>
            <span className="font-bold text-[0.95rem] text-gray-900 tracking-tight">{item.name}</span>
            {isProComponent(item) && (
              <span className="flex items-center gap-1 shrink-0 ml-2 bg-[#9FE870]/20 text-[#2c5114] text-[0.65rem] font-bold px-2 py-0.5 rounded-md tracking-wider">
                <Crown size={14} color="#d66a04" strokeWidth={2.5} />
                PRO
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-900 text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Content - Image Preview */}
        <div className="px-6 py-4 relative overflow-hidden flex flex-col items-center">
          <div className="relative group/preview w-full h-[35vh] sm:h-[42vh] md:h-[46vh] max-h-[460px] min-h-[240px] rounded-xl border border-gray-100 overflow-hidden bg-[#FAFBFD] flex items-center justify-center">
            {item.previewImageUrl ? (
              <Image
                src={item.previewImageUrl}
                alt={item.name}
                fill
                priority
                className="object-contain p-2"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                No preview available
              </div>
            )}
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onFavoriteToggle(item);
              }}
              disabled={isFavoritePending}
              aria-pressed={isFavorite}
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
              className={`absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-white/95 text-gray-700 shadow-sm backdrop-blur transition-all hover:scale-105 hover:text-red-500 disabled:cursor-wait disabled:opacity-70 ${isFavorite ? "opacity-100 text-red-500" : "opacity-0 group-hover/preview:opacity-100"
                }`}
            >
              <Heart size={18} strokeWidth={2} fill={isFavorite ? "currentColor" : "none"} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 pb-6 pt-2 shrink-0">
          {/* User Info */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#9FE870] to-[#54992e] flex items-center justify-center text-black font-extrabold text-xs shadow-sm shrink-0">
              {getInitials(item.createdBy?.name || "System")}
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-[0.88rem] text-gray-900 tracking-tight leading-tight">
                {item.createdBy?.name || "System Uploader"}
              </span>
              <span className="text-[0.72rem] text-gray-400 font-medium">Contributor</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              disabled={isCopying || isSuccess}
              className={`ml-2 w-[120px] shrink-0 py-2 rounded-xl border text-sm font-bold transition-all duration-300 flex items-center justify-center gap-1.5 ${isSuccess
                ? "bg-green-500 text-white border-green-500 shadow-md shadow-green-500/20 scale-[0.98]"
                : "bg-white text-black border-black hover:bg-black hover:text-white active:scale-95 cursor-pointer"
                }`}
            >
              {isSuccess ? (
                <span className="flex items-center gap-1.5 animate-in fade-in zoom-in duration-300">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <polyline points="13.33 4 5.33 12 2.67 9.33" />
                  </svg>
                  Copied!
                </span>
              ) : isCopying ? (
                <span className="flex items-center gap-1.5">
                  <svg className="animate-spin h-3.5 w-3.5 text-current" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M12 2a10 10 0 00-10 10h2a8 8 0 018-8V2z" />
                  </svg>
                  Copying...
                </span>
              ) : (
                <>
                  <Copy size={18} color="currentColor" strokeWidth={2} className="mr-0.5" />
                  Copy
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ComponentCard ─────────────────────────────────────────────────────────────
function ComponentCard({
  item,
  isCopying,
  onCopy,
  onDownloadRecorded,
  onPreview,
  isFavorite,
  onFavoriteToggle,
  isFavoritePending,
  isProUser = false,
  priority = false,
}: {
  item: ComponentItem;
  isCopying: boolean;
  onCopy: () => Promise<boolean>;
  onDownloadRecorded: () => Promise<number | null>;
  onPreview: () => void;
  isFavorite: boolean;
  onFavoriteToggle: () => void;
  isFavoritePending: boolean;
  isProUser?: boolean;
  priority?: boolean;
}) {
  const isPro = isProComponent(item);
  const showLock = isPro && !isProUser;
  const [isSuccess, setIsSuccess] = useState(false);
  const [downloadCountOverride, setDownloadCountOverride] = useState<number | null>(null);
  const downloadCount = downloadCountOverride ?? item.downloadCount ?? 0;

  async function handleCopy() {
    if (isCopying || isSuccess) return;
    const success = await onCopy();
    if (success) {
      setDownloadCountOverride(downloadCount + 1);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 2000);
      const serverDownloadCount = await onDownloadRecorded();
      if (typeof serverDownloadCount === "number") {
        setDownloadCountOverride(serverDownloadCount);
      }
    }
  }

  return (
    <article
      className="w-full aspect-[390/320] rounded-[20px] border border-[rgba(229,231,235,0.8)] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] transition-shadow group flex flex-col p-2.5 font-manrope"
      style={{
        background: "radial-gradient(100% 100% at 50% 50%, rgba(255,255,255,0.26), rgba(255,255,255,0.06))",
      }}
    >
      {/* Preview */}
      <div
        className="relative cursor-pointer group/preview overflow-hidden flex-1 min-h-0 w-full rounded-xl border-2 border-[#9FE870]/40 bg-[#F4F9ED]"
        onClick={onPreview}
        title="Click to preview"
      >
        {item.previewImageUrl ? (
          <Image
            src={item.previewImageUrl}
            alt={item.name}
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1920px) 25vw, 20vw"
            className="object-contain transition-transform duration-300 group-hover/preview:scale-[1.02]"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-gray-500 text-sm">
            No preview
          </div>
        )}
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onFavoriteToggle();
          }}
          disabled={isFavoritePending}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          className={`absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-black/50 text-white shadow-sm backdrop-blur transition-all hover:scale-105 hover:text-red-300 disabled:cursor-wait disabled:opacity-70 ${isFavorite ? "opacity-100 text-red-500" : "opacity-0 group-hover/preview:opacity-100"
            }`}
        >
          <Heart size={16} strokeWidth={2} fill={isFavorite ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Footer row */}
      <div className="px-2 pt-2 pb-1.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1 min-w-0">
          <span className="font-semibold text-white text-[12.5px] truncate">{item.name}</span>
          {isPro ? (
            <span className="flex items-center gap-1 text-[#9FE870] text-[0.6rem] font-bold px-1.5 py-0.5 rounded-md shrink-0 tracking-wide">
              <Crown size={18} color="#d66a04" strokeWidth={2} />
            </span>
          ) : (
            <span className="text-[9.5px] font-bold text-white px-1.5 py-0.5 rounded border border-[#19ff00] bg-[#00ae34] shrink-0 uppercase tracking-wide">
              FREE
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-white text-[11.5px]">
          <div className="flex items-center ml-1">
            <button type="button" className="hover:text-red-500 transition-colors">
              <ArrowDownToLine size={15} strokeWidth={1.5} />
            </button>
            <span className="font-medium ml-0.5">{formatCompactCount(downloadCount)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-1 pb-1 shrink-0">
        <button
          type="button"
          onClick={handleCopy}
          disabled={isCopying || isSuccess}
          className={`w-full flex items-center justify-center gap-1.5 text-[13px] font-semibold rounded-full py-1.5 mt-1 transition-all duration-300 cursor-pointer font-manrope border ${isSuccess
            ? "bg-green-50 text-green-600 border-green-200"
            : showLock
              ? "bg-white/10 text-white/50 border-white/30"
              : "text-white bg-white/10 hover:bg-white/20 border-[rgba(229,231,235,0.5)] hover:border-white/80"
            } disabled:opacity-100`}
        >
          {isSuccess ? (
            <span className="flex items-center gap-1.5 animate-in fade-in zoom-in duration-300">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-green-500">
                <path d="M3 8.5L6 11.5L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Copied
            </span>
          ) : showLock ? (
            <span className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              Unlock
            </span>
          ) : (
            <>
              <Copy size={16} color="currentColor" strokeWidth={1.25} />

              {isCopying ? "Copying…" : "Copy"}
            </>
          )}
        </button>
      </div>
    </article>
  );
}

// ── QUERY CONFIG (shared) ─────────────────────────────────────────────────────
const STALE_TIME = 5 * 60 * 1000;  // 5 minutes — cached data treated as fresh
const GC_TIME = 10 * 60 * 1000; // 10 minutes — data kept in memory after unmount

function getDesignType(viewMode: ViewMode): "Wireframe" | "UI Design" {
  return viewMode === "wireframe" ? "Wireframe" : "UI Design";
}

function getPricingType(priceMode: PriceMode): "Free" | "Pro" | undefined {
  if (priceMode === "free") return "Free";
  if (priceMode === "pro") return "Pro";
  return undefined;
}

function useDebouncedValue<T>(value: T, delay = 250) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timeout);
  }, [value, delay]);

  return debounced;
}

function buildQueryOptions(search: string, tag: string, viewMode: ViewMode, priceMode: PriceMode) {
  return {
    queryKey: ["components", "list", search, tag, viewMode, priceMode, PAGE_SIZE],
    queryFn: ({ pageParam }: { pageParam: { skip: number; limit: number } }) =>
      componentsApi.list(search, tag, 1, pageParam.limit, {
        designType: getDesignType(viewMode),
        pricingType: getPricingType(priceMode),
        skip: pageParam.skip,
      }),
    initialPageParam: { skip: 0, limit: PAGE_SIZE },
    getNextPageParam: (lastPage: PaginatedComponentResponse, allPages: PaginatedComponentResponse[]) => {
      const totalLoaded = allPages.reduce((acc, p) => acc + p.items.length, 0);
      return totalLoaded < lastPage.pagination.total ? { skip: totalLoaded, limit: 30 } : undefined;
    },
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  } as const;
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ComponentsClient({
  initialPage,
  initialTags = [],
}: {
  initialPage: PaginatedComponentResponse | null;
  initialTags?: string[];
}) {
  const { user, isInitialized, setLoginModalOpen, setPricingModalOpen } = useAuth();
  const queryClient = useQueryClient();

  const { data: tags = [] } = useQuery({
    queryKey: ["components", "tags"],
    queryFn: () => componentsApi.getTags(),
    initialData: initialTags,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });

  const categories = useMemo(() => ["All", ...tags], [tags]);

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [viewMode, setViewMode] = useState<ViewMode>(INITIAL_VIEW_MODE);
  const [priceMode, setPriceMode] = useState<PriceMode>(INITIAL_PRICE_MODE);
  const [platformMode, setPlatformMode] = useState<PlatformMode>(INITIAL_PLATFORM_MODE);
  const [activeId, setActiveId] = useState<string | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [previewItem, setPreviewItem] = useState<null | ComponentItem>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);


  const debouncedSearch = useDebouncedValue(search.trim());
  const activeTag = activeCategory === "All" ? "" : activeCategory;
  const isInitialQuery =
    debouncedSearch === "" &&
    activeTag === "" &&
    viewMode === INITIAL_VIEW_MODE &&
    priceMode === INITIAL_PRICE_MODE;

  const { data: subscriptionData, isLoading: isSubLoading } = useQuery({
    queryKey: ["subscription", "checkAccess"],
    queryFn: () => paymentsApi.checkAccess(),
    enabled: !!user,
    staleTime: 60000,
  });

  const isProUser = subscriptionData?.isProUser ?? user?.isProUser ?? false;

  const { data: currentSubscription, isLoading: isCurrentSubLoading } = useQuery({
    queryKey: ["subscription", "current"],
    queryFn: () => paymentsApi.getCurrentSubscription(),
    enabled: !!user && isProUser,
    staleTime: 60 * 1000,
  });

  const activeSubscription = currentSubscription ?? subscriptionData?.subscription ?? user?.subscription ?? null;

  const { data: favoriteIdData } = useQuery({
    queryKey: ["favorite-component-ids"],
    queryFn: () => componentsApi.listFavoriteIds(),
    enabled: !!user,
    staleTime: 60 * 1000,
  });

  const favoriteIds = useMemo(
    () => new Set(favoriteIdData ?? []),
    [favoriteIdData]
  );

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = window.setTimeout(() => setToastMessage(null), 3000);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        window.clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  // ── Data fetching ──────────────────────────────────────────────────────────
  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    ...buildQueryOptions(debouncedSearch, activeTag, viewMode, priceMode),
    initialData: isInitialQuery && initialPage
      ? {
        pages: [initialPage],
        pageParams: [{ skip: 0, limit: 15 }],
      }
      : undefined,
  });

  const items = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);
  const total = data?.pages[0]?.pagination?.total ?? (initialPage?.pagination?.total || 0);

  // ── Prefetch a category on hover ───────────────────────────────────────────
  const toggleFavoriteMutation = useMutation({
    mutationFn: (componentId: string) => componentsApi.toggleFavorite(componentId),
    onMutate: async (componentId) => {
      await queryClient.cancelQueries({ queryKey: ["favorite-components"] });
      await queryClient.cancelQueries({ queryKey: ["favorite-component-ids"] });
      const previous = queryClient.getQueryData<PaginatedComponentResponse>(["favorite-components"]);
      const previousIds = queryClient.getQueryData<string[]>(["favorite-component-ids"]);
      const fallbackItem = items.find((item) => item._id === componentId);
      const isFavoriteId = previousIds?.includes(componentId) ?? favoriteIds.has(componentId);

      queryClient.setQueryData<string[]>(
        ["favorite-component-ids"],
        isFavoriteId
          ? (previousIds ?? []).filter((id) => id !== componentId)
          : [componentId, ...(previousIds ?? [])]
      );

      if (previous || fallbackItem) {
        const current = previous ?? {
          items: [],
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0,
          },
        };
        const alreadyFavorite = current.items.some((item) => item._id === componentId);
        const nextItems = alreadyFavorite
          ? current.items.filter((item) => item._id !== componentId)
          : fallbackItem
            ? [{ ...fallbackItem, isFavorite: true }, ...current.items]
            : current.items;
        const totalFavorites = Math.max(0, current.pagination.total + (alreadyFavorite ? -1 : 1));

        queryClient.setQueryData<PaginatedComponentResponse>(["favorite-components"], {
          items: nextItems,
          pagination: {
            ...current.pagination,
            total: totalFavorites,
            totalPages: Math.ceil(totalFavorites / current.pagination.limit),
          },
        });
      }

      return { previous, previousIds };
    },
    onError: (_error, _componentId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["favorite-components"], context.previous);
      }
      if (context?.previousIds) {
        queryClient.setQueryData(["favorite-component-ids"], context.previousIds);
      }
      showToast("Could not update favorite. Please try again.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["favorite-components"] });
      queryClient.invalidateQueries({ queryKey: ["favorite-component-ids"] });
    },
  });

  const handleFavoriteToggle = useCallback(
    (item: ComponentItem) => {
      if (!user) {
        setLoginModalOpen(true);
        showToast("Sign in to save favorites.");
        return;
      }

      toggleFavoriteMutation.mutate(item._id);
    },
    [setLoginModalOpen, showToast, toggleFavoriteMutation, user]
  );

  const prefetchCategory = useCallback(
    (cat: string) => {
      const tag = cat === "All" ? "" : cat;
      queryClient.prefetchInfiniteQuery({
        ...buildQueryOptions(debouncedSearch, tag, viewMode, priceMode),
        // Only prefetch if data isn't already cached / fresh
      });
    },
    [debouncedSearch, priceMode, queryClient, viewMode]
  );

  const selectCategory = useCallback((cat: string) => {
    setActiveCategory((current) => (cat === "All" || current === cat ? "All" : cat));
  }, []);

  const togglePriceMode = useCallback((mode: Exclude<PriceMode, "all">) => {
    setPriceMode((current) => (current === mode ? "all" : mode));
  }, []);

  // ── Client-side filters ────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let out = items;
    if (activeCategory !== "All") {
      out = out.filter((i) =>
        i.tags.some((t) => t.toLowerCase().includes(activeCategory.toLowerCase()))
      );
    }
    if (priceMode === "pro") {
      out = out.filter((i) => i.pricingType === "Pro" || i.tags.some((t) => /pro/i.test(t)));
    } else if (priceMode === "free") {
      out = out.filter((i) => i.pricingType !== "Pro" && !i.tags.some((t) => /pro/i.test(t)));
    }
    if (viewMode === "wireframe") {
      out = out.filter((i) => i.designType === "Wireframe" || i.tags.some((t) => /wireframe/i.test(t)));
    } else if (viewMode === "ui-design") {
      out = out.filter((i) => i.designType === "UI Design" || !i.designType || i.tags.some((t) => /ui[\s-]*design/i.test(t)));
    }
    if (platformMode === "web") {
      out = out.filter((i) => i.tags.some((t) => t.toLowerCase() === "web"));
    } else if (platformMode === "app") {
      out = out.filter((i) => i.tags.some((t) => t.toLowerCase() === "app"));
    }
    return out;
  }, [items, activeCategory, priceMode, viewMode, platformMode]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { root: null, rootMargin: "600px 0px", threshold: 0 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // ── Copy handler ───────────────────────────────────────────────────────────
  async function onCopy(item: ComponentItem, closePreview?: () => void): Promise<boolean> {
    if (isProComponent(item) && !isProUser) {
      closePreview?.();
      setPricingModalOpen(true);
      showToast("Upgrade to Pro to copy this component.");
      return false;
    }

    setActiveId(item._id);
    try {
      const payload =
        item.figmaDataBase64 ||
        (
          await queryClient.fetchQuery({
            queryKey: ["components", "data", item._id],
            queryFn: () => componentsApi.getComponentData(item._id),
            staleTime: 10 * 60 * 1000,
          })
        ).figmaDataBase64;
      if (!payload) throw new Error("Component payload is missing.");
      await copyToFigma(payload, item.name);
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      return true;
    } catch (error) {
      console.error("Copy failed:", error);
      return false;
    } finally {
      setActiveId(null);
    }
  }

  async function recordDownload(item: ComponentItem): Promise<number | null> {
    try {
      const result = await componentsApi.recordDownload(item._id);
      queryClient.invalidateQueries({ queryKey: ["components", "list"] });
      return result.downloadCount;
    } catch (error) {
      console.error("Download count update failed:", error);
      return null;
    }
  }

  // How many skeleton cards to show
  const SKELETON_COUNT = PAGE_SIZE;
  const showSkeletons = isLoading || !isInitialized;
  // isFetching (but not initial load) = stale re-fetch in background — keep old data, no skeleton
  const showStaleIndicator = isFetching && !isLoading;

  return (
    <>
      <Navbar />
      <div className="relative flex h-[calc(100dvh-60px)] pt-[60px] overflow-hidden bg-[#080605] font-manrope text-white">
        <div className="pointer-events-none fixed -left-[0.05%] -right-[0.02%] top-[-48px] h-[1104px] z-0" data-node-id="218:67">
          <div className="absolute inset-[-31.7%_-18.22%_-31.7%_-18.15%]">
            <Image
              src="/components-page/figma-bg.svg"
              alt=""
              fill
              priority
              sizes="136vw"
              className="block max-w-none object-fill"
            />
          </div>
        </div>
        <style dangerouslySetInnerHTML={{
          __html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none !important;
        }
        .no-scrollbar {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
        .category-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: transparent transparent;
        }
        .category-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .category-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .category-scrollbar::-webkit-scrollbar-thumb {
          background: transparent;
          border: 2px solid transparent;
          border-radius: 999px;
          background-clip: content-box;
        }
        .category-scrollbar:hover,
        .category-scrollbar:focus-within {
          scrollbar-color: #cbd5e1 transparent;
        }
        .category-scrollbar:hover::-webkit-scrollbar-thumb,
        .category-scrollbar:focus-within::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          background-clip: content-box;
        }
        .category-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
          background-clip: content-box;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}} />
        {/* ── Left Sidebar ───────────────────────────────────────────────── */}
        <aside className="relative z-10 hidden lg:flex flex-col w-[260px] shrink-0 bg-transparent pt-4 font-manrope sticky top-[60px] h-[calc(100dvh-60px)] self-start">

          {/* Plan / Upsell Block — loading animation until auth resolves */}
          {(!isInitialized || (!!user && isSubLoading && subscriptionData === undefined) || (isProUser && isCurrentSubLoading && currentSubscription === undefined)) ? (
            <div className="mx-4 mb-6 shrink-0 rounded-2xl border border-white/30 bg-white/10 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
              <div className="flex flex-col items-center justify-center py-3 gap-3">
                <svg className="animate-spin h-6 w-6 text-[#22C55E]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M12 2a10 10 0 00-10 10h3a7 7 0 017-7V2z" />
                </svg>
                <span className="text-[0.72rem] font-semibold text-white/70">Loading plan...</span>
              </div>
            </div>
          ) : isProUser ? (
            <ProSubscriptionCard subscription={activeSubscription} />
          ) : (
            <div className="mx-4 mb-6 rounded-2xl p-4 border border-white bg-white/10 shadow-[0_10px_30px_rgba(15,23,42,0.07)] shrink-0">
              <div className="flex items-center gap-2 mb-4 justify-center">
                <IconUnlock className="text-orange-500 w-5 h-5" />
                <span className="text-white font-bold text-[0.95rem]">Unlock Premium+</span>
              </div>

              <div className="space-y-2 mb-4 ">
                <div className="flex items-start gap-2.5 bg-white/10 border border-white/20 rounded-lg p-2.5">
                  <div className="mt-0.5 shrink-0 bg-[#3B82F6] rounded-full w-4 h-4 flex items-center justify-center text-white">
                    <IconCheck />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[0.65rem] text-white font-bold leading-tight">Everything in Components</span>
                    <span className="text-[0.65rem] text-white/70 font-medium leading-tight">Unlimited Components</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 border border-white/20 rounded-lg p-2.5 bg-white/10">
                  <div className="mt-0.5 shrink-0 bg-gray-200 rounded-full w-4 h-4 flex items-center justify-center text-gray-400">
                    <IconCheck />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[0.65rem] text-white font-bold leading-tight">50+ Website UI Template</span>
                    <span className="text-[0.65rem] text-white/70 font-medium leading-tight">All future components</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPricingModalOpen(true)}
                className="w-full text-white border border-white/50 bg-white/10 hover:bg-white/20 transition-all duration-100 cursor-pointer font-bold text-[0.75rem] py-3 rounded-lg shadow-sm"
              >
                BUY NOW !
              </button>
            </div>
          )}

          {/* Components section (Fixed in Position) */}
          <div className="px-6 flex items-center gap-2 mb-3 shrink-0">
            <span className="text-[#d66a04]" ><Database size={20} strokeWidth={2.25} /></span>
            <span className="font-bold text-white text-[15px]">Components</span>
            <span className="ml-auto text-[0.65rem] font-bold bg-[#e5e7eb] text-[#4a5565] px-2 py-0.5 rounded">
              {total}
            </span>
          </div>

          {/* Scrollable Categories List Container (Hidden scrollbar) */}
          <div className="category-scrollbar flex-1 overflow-y-auto pb-8 select-none">
            <nav className="flex flex-col px-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => selectCategory(cat)}
                  onMouseEnter={() => prefetchCategory(cat)}
                  onFocus={() => prefetchCategory(cat)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-[0.85rem] font-medium transition-all cursor-pointer font-manrope border ${activeCategory === cat
                    ? "text-white font-bold bg-white/5 border-white/20 shadow-[0_1px_2px_rgba(35,139,69,0.05)]"
                    : "text-white hover:text-white hover:bg-white/5 border-transparent"
                    }`}
                >
                  {cat}
                  <span className={activeCategory === cat ? "text-white" : "text-white/55"}><IconChevron /></span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* ── Main Area ─────────────────────────────────────────────────────── */}
        <div className="relative z-10 flex-1 flex flex-col min-w-0 bg-transparent h-[calc(100dvh-60px)] overflow-hidden">
          {/* Page title section */}
          <div className="px-8 pt-3 pb-2 shrink-0">
            <h1 className="font-outfit font-bold text-[24px] text-white leading-[30px]">
              Browse Figma Components, Wireframe &amp; UI Design
            </h1>
            <p className="font-manrope font-normal text-[14px] text-[#cccccc] mt-1">
              {total > 0 ? `${total}+ Components` : "Components"}
            </p>
          </div>

          {/* Toolbar Section (sticky under navbar with transparent background) */}
          <div className="sticky top-0 z-30 px-8 py-2 bg-transparent font-manrope shrink-0 border-b border-white/15">
            <div className="flex flex-wrap lg:flex-nowrap items-center gap-3 xl:gap-5">
              {/* View mode segmented control */}
              <div className="flex items-center border border-[rgba(229,231,235,0.6)] rounded p-0.5 gap-1 shrink-0" style={{ background: "radial-gradient(160% 100% at 50% 50%, rgba(255,255,255,0.24), rgba(255,255,255,0.06))" }}>
                <button
                  type="button"
                  onClick={() => setViewMode("wireframe")}
                  className={`flex items-center gap-2 px-3 py-1 rounded-md text-[0.82rem] font-bold transition-all cursor-pointer ${viewMode === "wireframe"
                    ? "bg-[#6a7282] text-[#e5f5e0] shadow-sm"
                    : "text-white hover:bg-white/10"
                    }`}
                >
                  <IconWireframe />
                  Wireframe
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("ui-design")}
                  className={`flex items-center gap-2 px-3 py-1 rounded-md text-[0.82rem] font-bold transition-all cursor-pointer ${viewMode === "ui-design"
                    ? "bg-[#6a7282] text-[#e5f5e0] shadow-sm"
                    : "text-white hover:bg-white/10"
                    }`}
                >
                  <IconPalette />
                  UI Design
                </button>
              </div>

              {/* Platform segmented control */}
              <div className="flex items-center border border-[rgba(229,231,235,0.6)] rounded p-0.5 gap-1 shrink-0" style={{ background: "radial-gradient(160% 100% at 50% 50%, rgba(255,255,255,0.24), rgba(255,255,255,0.06))" }}>
                <button
                  type="button"
                  onClick={() => setPlatformMode("all")}
                  className={`px-4 py-1 rounded-md text-[0.82rem] font-bold transition-all cursor-pointer ${platformMode === "all"
                    ? "bg-[#6a7282] text-[#e5f5e0] shadow-sm"
                    : "text-white hover:bg-white/10"
                    }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setPlatformMode("web")}
                  className={`px-4 py-1 rounded-md text-[0.82rem] font-bold transition-all cursor-pointer ${platformMode === "web"
                    ? "bg-[#6a7282] text-[#e5f5e0] shadow-sm"
                    : "text-white hover:bg-white/10"
                    }`}
                >
                  Web
                </button>
                <button
                  type="button"
                  onClick={() => setPlatformMode("app")}
                  className={`px-4 py-1 rounded-md text-[0.82rem] font-bold transition-all cursor-pointer ${platformMode === "app"
                    ? "bg-[#6a7282] text-[#e5f5e0] shadow-sm"
                    : "text-white hover:bg-white/10"
                    }`}
                >
                  App
                </button>
              </div>

              {/* Pricing segmented control */}
              <div className="flex items-center border border-[rgba(229,231,235,0.6)] rounded p-0.5 gap-1 shrink-0" style={{ background: "radial-gradient(160% 100% at 50% 50%, rgba(255,255,255,0.24), rgba(255,255,255,0.06))" }}>
                <button
                  type="button"
                  onClick={() => togglePriceMode("free")}
                  className={`px-5 py-1 rounded-md text-[0.82rem] font-bold transition-all cursor-pointer ${priceMode === "free"
                    ? "bg-[#6a7282] text-[#e5f5e0] shadow-sm"
                    : "text-white hover:bg-white/10"
                    }`}
                >
                  Free
                </button>
                <button
                  type="button"
                  onClick={() => togglePriceMode("pro")}
                  className={`flex items-center gap-1 px-4 py-1 rounded-md text-[0.82rem] font-bold transition-all cursor-pointer ${priceMode === "pro"
                    ? "bg-[#6a7282] text-[#e5f5e0] shadow-sm"
                    : "text-white hover:bg-white/10"
                    }`}
                >
                  <Crown size={15} color={priceMode === "pro" ? "#e5f5e0" : "#d66a04"} strokeWidth={2} />
                  Pro
                </button>
              </div>

              <div className="hidden lg:block flex-1" />

              {/* Search and Refresh Group */}
              <div className="flex items-center gap-3 w-full lg:w-auto mt-2 lg:mt-0 shrink-0">
                {/* Search */}
                <div className="relative w-full lg:w-[260px] xl:w-[280px]">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-white/65"
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                  <input
                    className="w-full pl-8 pr-4 py-1 border border-[rgba(229,231,235,0.6)] rounded-lg bg-white/10 text-[0.82rem] text-white placeholder-white/75 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/70 transition h-[32px]"
                    placeholder="Search components..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                {/* Refresh button */}
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="flex items-center justify-center min-w-[80px] h-[32px] text-[0.82rem] font-bold text-white bg-[#6a7282] hover:bg-[#788194] border border-[#eaeaea] px-4 rounded-md transition-colors shrink-0 cursor-pointer"
                >
                  {showStaleIndicator ? (
                    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                      <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                  ) : (
                    "Refresh"
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Grid area */}
          <div className="category-scrollbar flex-1 overflow-y-auto overflow-x-hidden px-6 py-5">
            {isError && (
              <div className="flex items-center justify-center py-24 text-red-200 text-sm">
                Could not load components from API.
              </div>
            )}

            {!isLoading && !isError && filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-white/70 gap-2">
                <IconGrid />
                <p className="text-sm">No components match your filters.</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 min-[1700px]:grid-cols-5 min-[2300px]:grid-cols-6 min-[2700px]:grid-cols-7 min-[3200px]:grid-cols-8 gap-4 components-cards-grid">
              {/* Skeleton cards during initial load */}
              {showSkeletons &&
                Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                  <SkeletonCard key={`sk-${i}`} />
                ))}

              {/* Real cards — shown as soon as data arrives (or placeholderData) */}
              {!showSkeletons &&
                filtered.map((item, index) => (
                  <ComponentCard
                    key={item._id}
                    item={item}
                    priority={index < 15}
                    isCopying={activeId === item._id}
                    onCopy={() => onCopy(item)}
                    onDownloadRecorded={() => recordDownload(item)}
                    onPreview={() =>
                      setPreviewItem(item)
                    }
                    isFavorite={favoriteIds.has(item._id)}
                    onFavoriteToggle={() => handleFavoriteToggle(item)}
                    isFavoritePending={toggleFavoriteMutation.isPending && toggleFavoriteMutation.variables === item._id}
                    isProUser={isProUser}
                  />
                ))}

              {isFetchingNextPage &&
                Array.from({ length: 3 }).map((_, i) => (
                  <SkeletonCard key={`next-sk-${i}`} />
                ))}
            </div>

            {!isError && filtered.length > 0 && (
              <div ref={loadMoreRef} className="flex justify-center py-6">
                {hasNextPage ? (
                  <span className="text-xs font-semibold text-gray-400">
                    {isFetchingNextPage ? "Loading more..." : "Scroll for more"}
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-gray-300">
                    You have reached the end
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Preview Modal */}
        {previewItem && (
          <PreviewModal
            item={previewItem}
            onClose={() => setPreviewItem(null)}
            onCopy={onCopy}
            isCopying={activeId === previewItem._id}
            isFavorite={favoriteIds.has(previewItem._id)}
            onFavoriteToggle={handleFavoriteToggle}
            isFavoritePending={toggleFavoriteMutation.isPending && toggleFavoriteMutation.variables === previewItem._id}
            onDownloadRecorded={recordDownload}
          />
        )}

        {toastMessage && (
          <Toast
            message={toastMessage}
            onClose={() => setToastMessage(null)}
          />
        )}
      </div>
    </>
  );
}
