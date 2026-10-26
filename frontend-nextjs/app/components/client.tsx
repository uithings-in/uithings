"use client";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { subscribeToComponentChanges } from "../../lib/events";
import { componentsApi } from "../../api/components";
import {
  paymentsApi,
  type CurrentSubscriptionData,
  type SubscriptionData,
} from "../../api/payments";
import { copyToFigma } from "../../lib/clipboard";
import cloudinaryLoader from "../../lib/cloudinaryLoader";
import type {
  PaginatedComponentResponse,
  ComponentItem,
} from "../../lib/types";
import Navbar from "../../components/landing/Navbar";
import { useAuth } from "../../context/AuthContext";
import {
  SubscriptionCard,
  SubscriptionCardSkeleton,
} from "../../components/sidebar/SubscriptionCard";
import {
  Scaling,
  Frame,
  Copy,
  ArrowDownToLine,
  Crown,
  Heart,
  Search,
  SquarePen,
  Moon,
  Sun,
  PenTool,
  ChevronRight,
  Sparkles,
  Clock,
} from "lucide-react";

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
      <path
        d="M5 4l3 3-3 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function IconWireframe() {
  return <Frame size={14} strokeWidth={1.8} />;
}
function IconPalette() {
  return <Scaling size={18} />;
}
function IconX() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path
        d="M2 2l8 8M10 2l-8 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
// ── constants ─────────────────────────────────────────────────────────────────

// CATEGORIES are now loaded dynamically from the backend

type ViewMode = "wireframe" | "ui-design";
type PriceMode = "free" | "pro" | "all";
type PlatformMode = "all" | "web" | "app";

const PAGE_SIZE = 25;
const INITIAL_VIEW_MODE: ViewMode = "ui-design";
const INITIAL_PRICE_MODE: PriceMode = "all";
const INITIAL_PLATFORM_MODE: PlatformMode = "all";

function isProComponent(item: Pick<ComponentItem, "pricingType" | "tags">) {
  return item.pricingType === "Pro" || item.tags.some((t) => /pro/i.test(t));
}

function formatCompactCount(value: number) {
  if (value >= 1_000_000)
    return `${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1)}m`;
  if (value >= 1_000)
    return `${(value / 1_000).toFixed(value >= 10_000 ? 0 : 1)}k`;
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

// ── SkeletonCard ──────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <article className="w-full rounded-[12px] border border-[rgba(229,231,235,0.8)] overflow-hidden shadow-sm flex flex-col p-2.5 animate-pulse bg-white/10">
      {/* Preview placeholder */}
      <div className="w-full aspect-[16/9] bg-white/20 rounded-[8px] shrink-0" />

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

function ContributorAvatar({
  name,
  profilePicture,
}: {
  name?: string;
  profilePicture?: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(profilePicture) && !imageFailed;

  return (
    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-[#9FE870] to-[#54992e] flex items-center justify-center text-black font-extrabold text-xs shadow-sm shrink-0 overflow-hidden ring-1 ring-black/5">
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={profilePicture}
          alt={name || "Contributor"}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
          onError={() => setImageFailed(true)}
        />
      ) : (
        getInitials(name || "System")
      )}
    </div>
  );
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
  isProUser = false,
}: {
  item: ComponentItem;
  onClose: () => void;
  onCopy: (item: ComponentItem, closePreview: () => void) => Promise<boolean>;
  isCopying: boolean;
  isFavorite: boolean;
  onFavoriteToggle: (item: ComponentItem) => void;
  isFavoritePending: boolean;
  onDownloadRecorded: (item: ComponentItem) => Promise<number | null>;
  isProUser?: boolean;
}) {
  const isPro = isProComponent(item);
  const showLock = isPro && !isProUser;
  const [isSuccess, setIsSuccess] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Compute carousel slides from lightPreviewImageUrl, darkPreviewImageUrl, wireframePreviewImageUrl, previewImageUrl
  const slides = useMemo(() => {
    const list: {
      url: string;
      mode: "dark" | "light" | "wireframe" | "default";
      label: string;
    }[] = [];

    // 1. Light Mode
    if (item.lightPreviewImageUrl) {
      list.push({
        url: item.lightPreviewImageUrl,
        mode: "light",
        label: "Light",
      });
    }

    // 2. Dark Mode (only if explicitly set and not an accidental duplicate of light)
    if (
      item.darkPreviewImageUrl &&
      item.darkPreviewImageUrl !== item.lightPreviewImageUrl &&
      !list.some((s) => s.url === item.darkPreviewImageUrl)
    ) {
      list.push({
        url: item.darkPreviewImageUrl,
        mode: "dark",
        label: "Dark",
      });
    }

    // 3. Wireframe Mode (only if explicitly set and not an accidental duplicate)
    if (
      item.wireframePreviewImageUrl &&
      item.wireframePreviewImageUrl !== item.lightPreviewImageUrl &&
      item.wireframePreviewImageUrl !== item.darkPreviewImageUrl &&
      !list.some((s) => s.url === item.wireframePreviewImageUrl)
    ) {
      list.push({
        url: item.wireframePreviewImageUrl,
        mode: "wireframe",
        label: "Wireframe",
      });
    }

    // 4. Fallbacks if none of the above are set (legacy items)
    if (list.length === 0 && item.previewImageUrl) {
      if (item.designType === "Wireframe") {
        list.push({
          url: item.previewImageUrl,
          mode: "wireframe",
          label: "Wireframe",
        });
      } else {
        list.push({
          url: item.previewImageUrl,
          mode: "light",
          label: "Light",
        });
      }
    }

    return list;
  }, [
    item.lightPreviewImageUrl,
    item.darkPreviewImageUrl,
    item.wireframePreviewImageUrl,
    item.previewImageUrl,
    item.designType,
  ]);

  // Reset to first slide when item changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [item._id]);

  const hasMultiple = slides.length > 1;
  const currentSlide = slides[currentIndex] || slides[0];

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [slides.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!hasMultiple) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasMultiple, handlePrev, handleNext]);

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
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-2.5 sm:p-4 md:p-6 lg:p-8"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[20px] sm:rounded-[24px] shadow-2xl w-full max-w-[780px] max-h-[94vh] flex flex-col overflow-hidden font-manrope animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-3.5 shrink-0 border-b border-gray-100/80 w-full">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 pr-2">
            <span className="font-bold text-[0.88rem] sm:text-[0.95rem] text-gray-900 tracking-tight truncate">
              {item.name}
            </span>
            {isProComponent(item) && (
              <span className="flex items-center gap-1 shrink-0 ml-1.5 sm:ml-2 bg-[#9FE870]/20 text-[#2c5114] text-[0.62rem] sm:text-[0.65rem] font-bold px-1.5 sm:px-2 py-0.5 rounded-md tracking-wider">
                <Crown size={13} color="#d66a04" strokeWidth={2.5} />
                PRO
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-900 text-gray-900 hover:bg-gray-100 transition-colors shrink-0 cursor-pointer"
            aria-label="Close preview modal"
          >
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <path
                d="M2 2l8 8M10 2l-8 8"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Content - Image Preview Carousel */}
        <div className="px-3 sm:px-5 py-2 sm:py-3 relative overflow-hidden flex flex-col items-center flex-1 min-h-0 w-full">
          <div
            className={`relative group/preview rounded-xl sm:rounded-2xl border border-gray-100 overflow-hidden flex items-center justify-center select-none aspect-[16/9] max-h-[380px] w-full transition-colors ${
              currentSlide?.mode === "dark" ? "bg-[#0D0D11]" : "bg-[#F8F9FA]"
            }`}
          >
            {/* Image Slide */}
            {currentSlide?.url ? (
              <div
                key={currentSlide.url}
                className="relative w-full h-full animate-in fade-in duration-200"
              >
                <Image
                  loader={cloudinaryLoader}
                  src={currentSlide.url}
                  alt={`${item.name} ${currentSlide.label || "preview"}`}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 800px"
                  className="object-contain w-full h-full"
                />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                No preview available
              </div>
            )}

            {/* Favorite Button (Top Right) */}
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onFavoriteToggle(item);
              }}
              disabled={isFavoritePending}
              aria-pressed={isFavorite}
              aria-label={
                isFavorite ? "Remove from favorites" : "Add to favorites"
              }
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
              className={`absolute right-2.5 sm:right-3 top-2.5 sm:top-3 z-20 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-white/70 bg-white/95 text-gray-700 shadow-sm backdrop-blur transition-all hover:scale-105 hover:text-red-500 disabled:cursor-wait disabled:opacity-70 ${
                isFavorite
                  ? "opacity-100 text-red-500"
                  : "opacity-0 group-hover/preview:opacity-100"
              }`}
            >
              <Heart
                size={16}
                strokeWidth={2}
                fill={isFavorite ? "currentColor" : "none"}
                className="sm:size-[18px]"
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 px-4 sm:px-6 pb-3.5 sm:pb-5 pt-2 shrink-0 border-t border-gray-50 sm:border-t-0">
          {/* User Info */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <ContributorAvatar
              name={item.createdBy?.name}
              profilePicture={item.createdBy?.profilePicture}
            />
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-[0.82rem] sm:text-[0.88rem] text-gray-900 tracking-tight leading-tight truncate max-w-[180px] sm:max-w-none">
                {item.createdBy?.name || "System Uploader"}
              </span>
              <span className="text-[0.68rem] sm:text-[0.72rem] text-gray-400 font-medium">
                Contributor
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-2.5 w-full sm:w-auto">
            {/* Mode Switcher (shows Light, Dark, Wireframe, or all if uploaded) */}
            {slides.length > 0 && (
              <div className="flex items-center h-8 sm:h-9 rounded-xl bg-gray-100 p-0.5 sm:p-1 border border-gray-200/80 shrink-0">
                {slides.map((slide, idx) => {
                  const isActive = currentIndex === idx;
                  const isDark = slide.mode === "dark";
                  const isWireframe = slide.mode === "wireframe";
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentIndex(idx);
                      }}
                      className={`flex items-center gap-1 sm:gap-1.5 h-full px-2 sm:px-3 rounded-lg text-[0.72rem] sm:text-xs font-bold transition-all cursor-pointer border ${
                        isActive
                          ? isDark
                            ? "bg-[#18181B] text-white shadow-xs border-[#18181B]"
                            : isWireframe
                              ? "bg-white text-[#EA580C] shadow-xs border-orange-500/20"
                              : "bg-white text-gray-900 shadow-xs border-gray-200/60"
                          : "text-gray-500 hover:text-gray-900 border-transparent"
                      }`}
                    >
                      {isDark ? (
                        <Moon
                          size={11}
                          className={
                            isActive ? "text-indigo-400" : "text-gray-400"
                          }
                        />
                      ) : isWireframe ? (
                        <PenTool
                          size={11}
                          className={
                            isActive ? "text-[#EA580C]" : "text-gray-400"
                          }
                        />
                      ) : (
                        <Sun
                          size={11}
                          className={
                            isActive ? "text-amber-500" : "text-gray-400"
                          }
                        />
                      )}
                      <span>{slide.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            <button
              type="button"
              onClick={handleCopy}
              disabled={isCopying || isSuccess}
              className={`flex-1 sm:flex-initial sm:w-[120px] h-8 sm:h-9 shrink-0 rounded-xl border text-xs sm:text-sm font-bold transition-all duration-300 flex items-center justify-center gap-1.5 ${
                isSuccess
                  ? "bg-green-500 text-white border-green-500 shadow-md shadow-green-500/20 scale-[0.98]"
                  : showLock
                    ? "bg-[#18181B] text-white border-[#18181B] hover:bg-black active:scale-95 cursor-pointer shadow-sm"
                    : "bg-white text-black border-black hover:bg-black hover:text-white active:scale-95 cursor-pointer"
              }`}
            >
              {isSuccess ? (
                <span className="flex items-center gap-1.5 animate-in fade-in zoom-in duration-300">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-white"
                  >
                    <polyline points="13.33 4 5.33 12 2.67 9.33" />
                  </svg>
                  Copied!
                </span>
              ) : isCopying ? (
                <span className="flex items-center gap-1.5">
                  <svg
                    className="animate-spin h-3.5 w-3.5 text-current"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M12 2a10 10 0 00-10 10h2a8 8 0 018-8V2z"
                    />
                  </svg>
                  Copying...
                </span>
              ) : showLock ? (
                <span className="flex items-center gap-1.5 text-amber-400">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  Unlock
                </span>
              ) : (
                <>
                  <Copy
                    size={16}
                    color="currentColor"
                    strokeWidth={2}
                    className="mr-0.5 sm:size-[18px]"
                  />
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
import { memo } from "react";

const ComponentCard = memo(function ComponentCard({
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
  const [downloadCountOverride, setDownloadCountOverride] = useState<
    number | null
  >(null);
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
      className="w-full rounded-[12px] border border-[rgba(229,231,235,0.8)] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] transition-shadow group flex flex-col p-2.5 font-manrope"
      style={{
        background:
          "radial-gradient(100% 100% at 50% 50%, rgba(255,255,255,0.26), rgba(255,255,255,0.06))",
      }}
    >
      {/* Preview */}
      <div
        className="relative cursor-pointer group/preview overflow-hidden w-full aspect-[16/9] rounded-[8px] border-1 border-[#54636C] bg-[#92A7B3] p-[4px] shrink-0"
        onClick={onPreview}
        title="Click to preview"
      >
        <div className="relative w-full h-full overflow-hidden rounded-[4px] bg-[#92A7B3]">
          {item.previewImageUrl ? (
            <Image
              loader={cloudinaryLoader}
              src={item.previewImageUrl}
              alt={item.name}
              fill
              priority={priority}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1536px) 33vw, 25vw"
              className="object-cover object-top w-full h-full"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-gray-500 text-sm">
              No preview
            </div>
          )}
        </div>
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
          className={`absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-black/50 text-white shadow-sm backdrop-blur transition-all hover:scale-105 hover:text-red-300 disabled:cursor-wait disabled:opacity-70 ${
            isFavorite
              ? "opacity-100 text-red-500"
              : "opacity-0 group-hover/preview:opacity-100"
          }`}
        >
          <Heart
            size={16}
            strokeWidth={2}
            fill={isFavorite ? "currentColor" : "none"}
          />
        </button>
      </div>

      {/* Footer row */}
      <div className="px-2 pt-2 pb-1.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1 min-w-0">
          <span className="font-semibold text-white text-[12.5px] truncate">
            {item.name}
          </span>
          {isPro ? (
            <span
              className="flex items-center gap-1 text-[0.6rem] font-bold px-1.5 py-0.5 rounded-md shrink-0 tracking-wide text-[#9FE870]"
              title="Pro component (Subscription required)"
            >
              <Crown size={18} color="#f19239ff" strokeWidth={2} />
              <span className="text-[9.5px] font-bold text-[#f19239ff] uppercase tracking-wide">
                PRO
              </span>
            </span>
          ) : (
            <span className="text-[9.5px] font-bold text-[#F0F8FF] px-1.5 py-0.5 rounded border border-[#737373] bg-[#8F8F8F] shrink-0 uppercase tracking-wide">
              FREE
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-white text-[11.5px]">
          <div className="flex items-center ml-1">
            <button
              type="button"
              className="hover:text-red-500 transition-colors"
            >
              <ArrowDownToLine size={15} strokeWidth={1.5} />
            </button>
            <span className="font-medium ml-0.5">
              {formatCompactCount(downloadCount)}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-1 pb-1 shrink-0">
        <button
          type="button"
          onClick={handleCopy}
          disabled={isCopying || isSuccess}
          className={`w-full flex items-center justify-center gap-1.5 text-[13px] font-semibold rounded-full py-1.5 mt-1 transition-all duration-300 cursor-pointer font-manrope border ${
            isSuccess
              ? "bg-green-50 text-green-600 border-green-200"
              : showLock
                ? "bg-white/10 text-white/50 border-white/30"
                : "text-white bg-white/10 hover:bg-white/20 border-[rgba(229,231,235,0.5)] hover:border-white/80"
          } disabled:opacity-100`}
        >
          {isSuccess ? (
            <span className="flex items-center gap-1.5 animate-in fade-in zoom-in duration-300">
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                className="text-green-500"
              >
                <path
                  d="M3 8.5L6 11.5L13 4.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Copied
            </span>
          ) : showLock ? (
            <span className="flex items-center gap-1.5">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
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
});

// ── QUERY CONFIG (shared) ─────────────────────────────────────────────────────
const STALE_TIME = 0; // Real-time sync: queries immediately re-check for freshness
const GC_TIME = 5 * 60 * 1000; // 5 minutes — data kept in memory after unmount

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

function buildQueryOptions(
  search: string,
  tag: string,
  viewMode: ViewMode,
  priceMode: PriceMode,
  isProUser: boolean = false,
) {
  return {
    queryKey: [
      "components",
      "list",
      search,
      tag,
      viewMode,
      priceMode,
      isProUser ? "pro" : "free",
      PAGE_SIZE,
    ],
    queryFn: ({ pageParam }: { pageParam: { skip: number; limit: number } }) =>
      componentsApi.list(search, tag, 1, pageParam.limit, {
        designType: getDesignType(viewMode),
        pricingType: getPricingType(priceMode),
        skip: pageParam.skip,
      }),
    initialPageParam: { skip: 0, limit: PAGE_SIZE },
    getNextPageParam: (
      lastPage: PaginatedComponentResponse,
      allPages: PaginatedComponentResponse[],
    ) => {
      const totalLoaded = allPages.reduce((acc, p) => acc + p.items.length, 0);
      return totalLoaded < lastPage.pagination.total
        ? { skip: totalLoaded, limit: PAGE_SIZE }
        : undefined;
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 4 * 1000,
    placeholderData: keepPreviousData,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  } as const;
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ComponentsClient({
  initialPage,
  initialTags = [],
  initialTotalCount = 0,
}: {
  initialPage: PaginatedComponentResponse | null;
  initialTags?: string[];
  initialTotalCount?: number;
}) {
  const { user, isInitialized, setLoginModalOpen, setPricingModalOpen } =
    useAuth();
  const queryClient = useQueryClient();

  const { data: entireTotalCount = initialTotalCount } = useQuery({
    queryKey: ["components", "total-count"],
    queryFn: () => componentsApi.getTotalCount(),
    initialData: initialTotalCount > 0 ? initialTotalCount : undefined,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
  });

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
  const [platformMode, setPlatformMode] = useState<PlatformMode>(
    INITIAL_PLATFORM_MODE,
  );
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

  const { data: currentSubscription, isLoading: isCurrentSubLoading } =
    useQuery({
      queryKey: ["subscription", "current"],
      queryFn: () => paymentsApi.getCurrentSubscription(),
      enabled: !!user && isProUser,
      staleTime: 60 * 1000,
    });

  const activeSubscription =
    currentSubscription ??
    subscriptionData?.subscription ??
    user?.subscription ??
    null;

  const { data: favoriteIdData } = useQuery({
    queryKey: ["favorite-component-ids"],
    queryFn: () => componentsApi.listFavoriteIds(),
    enabled: !!user,
    staleTime: 60 * 1000,
  });

  const favoriteIds = useMemo(
    () => new Set(favoriteIdData ?? []),
    [favoriteIdData],
  );

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = window.setTimeout(
      () => setToastMessage(null),
      3000,
    );
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
    ...buildQueryOptions(
      debouncedSearch,
      activeTag,
      viewMode,
      priceMode,
      isProUser,
    ),
    initialData:
      isInitialQuery && initialPage && !isProUser
        ? {
            pages: [initialPage],
            pageParams: [{ skip: 0, limit: PAGE_SIZE }],
          }
        : undefined,
    initialDataUpdatedAt: 0,
  });

  useEffect(() => {
    const unsubscribe = subscribeToComponentChanges(() => {
      queryClient.invalidateQueries({ queryKey: ["components"] });
      refetch();
      queryClient.invalidateQueries({ queryKey: ["components", "tags"] });
    });
    return unsubscribe;
  }, [queryClient, refetch]);

  const items = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );
  const total =
    data?.pages[0]?.pagination?.total ?? (initialPage?.pagination?.total || 0);

  // ── Prefetch a category on hover ───────────────────────────────────────────
  const toggleFavoriteMutation = useMutation({
    mutationFn: (componentId: string) =>
      componentsApi.toggleFavorite(componentId),
    onMutate: async (componentId) => {
      await queryClient.cancelQueries({ queryKey: ["favorite-components"] });
      await queryClient.cancelQueries({ queryKey: ["favorite-component-ids"] });
      const previous = queryClient.getQueryData<PaginatedComponentResponse>([
        "favorite-components",
      ]);
      const previousIds = queryClient.getQueryData<string[]>([
        "favorite-component-ids",
      ]);
      const fallbackItem = items.find((item) => item._id === componentId);
      const isFavoriteId =
        previousIds?.includes(componentId) ?? favoriteIds.has(componentId);

      queryClient.setQueryData<string[]>(
        ["favorite-component-ids"],
        isFavoriteId
          ? (previousIds ?? []).filter((id) => id !== componentId)
          : [componentId, ...(previousIds ?? [])],
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
        const alreadyFavorite = current.items.some(
          (item) => item._id === componentId,
        );
        const nextItems = alreadyFavorite
          ? current.items.filter((item) => item._id !== componentId)
          : fallbackItem
            ? [{ ...fallbackItem, isFavorite: true }, ...current.items]
            : current.items;
        const totalFavorites = Math.max(
          0,
          current.pagination.total + (alreadyFavorite ? -1 : 1),
        );

        queryClient.setQueryData<PaginatedComponentResponse>(
          ["favorite-components"],
          {
            items: nextItems,
            pagination: {
              ...current.pagination,
              total: totalFavorites,
              totalPages: Math.ceil(totalFavorites / current.pagination.limit),
            },
          },
        );
      }

      return { previous, previousIds };
    },
    onError: (_error, _componentId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["favorite-components"], context.previous);
      }
      if (context?.previousIds) {
        queryClient.setQueryData(
          ["favorite-component-ids"],
          context.previousIds,
        );
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
    [setLoginModalOpen, showToast, toggleFavoriteMutation, user],
  );

  const prefetchCategory = useCallback(
    (cat: string) => {
      const tag = cat === "All" ? "" : cat;
      queryClient.prefetchInfiniteQuery({
        ...buildQueryOptions(
          debouncedSearch,
          tag,
          viewMode,
          priceMode,
          isProUser,
        ),
        // Only prefetch if data isn't already cached / fresh
      });
    },
    [debouncedSearch, priceMode, queryClient, viewMode],
  );

  const selectCategory = useCallback((cat: string) => {
    setActiveCategory((current) =>
      cat === "All" || current === cat ? "All" : cat,
    );
  }, []);

  const togglePriceMode = useCallback((mode: Exclude<PriceMode, "all">) => {
    setPriceMode((current) => (current === mode ? "all" : mode));
  }, []);

  // ── Client-side filters ────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let out = items;
    // Non-pro users can only see free components or pro components unlocked by admin
    if (!isProUser) {
      out = out.filter(
        (i) => i.pricingType !== "Pro" || i.isVisibleWithoutSubscription,
      );
    }
    if (activeCategory !== "All") {
      out = out.filter((i) =>
        i.tags.some((t) =>
          t.toLowerCase().includes(activeCategory.toLowerCase()),
        ),
      );
    }
    if (priceMode === "pro") {
      out = out.filter(
        (i) => i.pricingType === "Pro" || i.tags.some((t) => /pro/i.test(t)),
      );
    } else if (priceMode === "free") {
      out = out.filter(
        (i) => i.pricingType !== "Pro" && !i.tags.some((t) => /pro/i.test(t)),
      );
    }
    if (viewMode === "wireframe") {
      out = out.filter(
        (i) =>
          i.designType === "Wireframe" ||
          i.designType === "Both" ||
          i.tags.some((t) => /wireframe/i.test(t)),
      );
    } else if (viewMode === "ui-design") {
      out = out.filter(
        (i) =>
          i.designType === "UI Design" ||
          i.designType === "Both" ||
          !i.designType ||
          i.tags.some((t) => /ui[\s-]*design/i.test(t)),
      );
    }
    if (platformMode === "web") {
      out = out.filter((i) => i.tags.some((t) => t.toLowerCase() === "web"));
    } else if (platformMode === "app") {
      out = out.filter((i) => i.tags.some((t) => t.toLowerCase() === "app"));
    }
    return out;
  }, [items, activeCategory, priceMode, viewMode, platformMode, isProUser]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { root: null, rootMargin: "600px 0px", threshold: 0 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // ── Copy handler ───────────────────────────────────────────────────────────
  async function onCopy(
    item: ComponentItem,
    closePreview?: () => void,
  ): Promise<boolean> {
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
    } catch (error: any) {
      if (
        error?.response?.status === 403 ||
        error?.response?.data?.code === "PRO_SUBSCRIPTION_REQUIRED"
      ) {
        closePreview?.();
        setPricingModalOpen(true);
        showToast("Upgrade to Pro to copy this component.");
        return false;
      }
      console.error("Copy failed:", error);
      showToast("Failed to copy component data.");
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
  const showSkeletons = isLoading && items.length === 0;
  // isFetching (but not initial load) = stale re-fetch in background — keep old data, no skeleton
  const showStaleIndicator = isFetching && !isLoading;

  const mainScrollRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const headerWrapperRef = useRef<HTMLDivElement>(null);
  const titleHeightRef = useRef<number>(68);

  useEffect(() => {
    if (!titleRef.current) return;
    const updateTitleHeight = () => {
      if (titleRef.current) {
        titleHeightRef.current = titleRef.current.offsetHeight || 68;
      }
    };
    updateTitleHeight();
    const ro = new ResizeObserver(updateTitleHeight);
    ro.observe(titleRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const scrollEl = mainScrollRef.current;
    if (!scrollEl) return;

    let rafId: number | null = null;

    const onScroll = () => {
      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          rafId = null;
          const scrollTop = scrollEl.scrollTop;
          const titleHeight = titleHeightRef.current || 68;
          const titleOffset = Math.min(scrollTop, titleHeight);
          if (titleRef.current) {
            titleRef.current.style.marginTop = `-${titleOffset}px`;
          }
        });
      }
    };

    onScroll();
    scrollEl.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      scrollEl.removeEventListener("scroll", onScroll);
    };
  }, [filtered.length, showSkeletons]);

  return (
    <>
      <Navbar />
      <div className="relative flex h-dvh pt-[60px] overflow-hidden bg-[#0d1830] font-manrope text-white">
        <div
          className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
          style={{
            transform: "translate3d(0, 0, 0)",
            backfaceVisibility: "hidden",
            contain: "strict",
          }}
          data-node-id="218:67"
        >
          <Image
            src="/components-page/figma-bg.svg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="block object-cover w-full h-full"
          />
        </div>
        <style
          dangerouslySetInnerHTML={{
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
      `,
          }}
        />
        {/* ── Left Sidebar ───────────────────────────────────────────────── */}
        <aside className="relative z-10 hidden lg:flex flex-col w-[260px] shrink-0 bg-transparent pt-4 font-sans h-full self-start">
          {/* Plan / Subscription Summary Card */}
          <div className="min-h-[267px] shrink-0">
            {!isInitialized ||
            (!!user && isSubLoading && subscriptionData === undefined) ||
            (isProUser &&
              isCurrentSubLoading &&
              currentSubscription === undefined) ? (
              <SubscriptionCardSkeleton />
            ) : (
              <SubscriptionCard
                subscription={isProUser ? activeSubscription : null}
                onManage={() => setPricingModalOpen(true)}
                totalComponents={entireTotalCount}
              />
            )}
          </div>

          {/* Components section (Fixed in Position) */}
          <div className="px-6 flex items-center gap-2 mb-3 shrink-0">
            <span className="font-bold text-white text-[15px]">Components</span>
            <span className="ml-auto text-[0.65rem] font-bold bg-[#e5e7eb] text-[#4a5565] px-2 py-0.5 rounded">
              {total > 0 ? `${total}+` : total}
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
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-[0.85rem] font-medium transition-all cursor-pointer font-manrope border ${
                    activeCategory === cat
                      ? "text-white font-bold bg-white/5 border-white/20 shadow-[0_1px_2px_rgba(35,139,69,0.05)]"
                      : "text-white hover:text-white hover:bg-white/5 border-transparent"
                  }`}
                >
                  {cat}
                  <span
                    className={
                      activeCategory === cat ? "text-white" : "text-white/55"
                    }
                  >
                    <IconChevron />
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* ── Main Area (Title collapses under navbar, cards scroll natively below the white line) ──────────────── */}
        <div className="relative z-10 flex-1 flex flex-col min-w-0 bg-transparent h-full overflow-hidden pl-8 pr-0">
          {/* Header area (Title + Filter toolbar) */}
          <div
            ref={headerWrapperRef}
            className="shrink-0 bg-transparent"
            onWheel={(e) => {
              if (mainScrollRef.current) {
                mainScrollRef.current.scrollTop += e.deltaY;
              }
            }}
          >
            {/* Page title section (scrolls up and goes under navbar) */}
            <div ref={titleRef} className="pt-4 pb-2 bg-transparent pr-8">
              <h1 className="font-outfit font-bold text-[24px] text-white leading-[30px]">
                Browse Figma Components, Wireframe &amp; UI Design
              </h1>
              <p className="font-manrope font-normal text-[14px] text-[#cccccc] mt-1">
                {total > 0 ? `${total}+ Components` : "Components"}
              </p>
            </div>

            {/* Toolbar Section (Sticky under navbar with transparent background) */}
            <div
              ref={filterRef}
              className="py-2.5 bg-transparent border-b border-transparent -ml-8 pl-8 pr-8"
            >
              <div className="flex flex-wrap items-center gap-3">
                {/* 1. Search Box */}
                <div className="relative flex items-center w-full sm:w-[260px] md:w-[280px] lg:w-[310px] h-[38px] rounded-lg border border-white/20 bg-transparent px-3 text-white transition-all focus-within:border-white/40 focus-within:ring-1 focus-within:ring-white/10">
                  <Search size={15} className="text-white/50 shrink-0 mr-2.5" />
                  <input
                    type="text"
                    placeholder="Search components..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-transparent text-[13px] text-white placeholder-white/40 focus:outline-none"
                  />
                </div>

                {/* 2. View Mode Toggle (Wireframe / UI Design) */}
                <div className="relative flex items-center h-[38px] rounded-lg border border-white/20 bg-transparent p-1 gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setViewMode("wireframe")}
                    className="relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-[13px] font-medium transition-colors cursor-pointer select-none"
                  >
                    {viewMode === "wireframe" && (
                      <motion.div
                        layoutId="browse-view-mode-pill"
                        className="absolute inset-0 rounded-md bg-[#5c6679] border border-white/20 shadow-sm"
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 35,
                        }}
                      />
                    )}
                    <span
                      className={`relative z-10 flex items-center gap-1.5 transition-colors duration-150 ${
                        viewMode === "wireframe"
                          ? "text-white font-semibold"
                          : "text-white/70 hover:text-white"
                      }`}
                    >
                      <IconWireframe />
                      <span>Wireframe</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("ui-design")}
                    className="relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-[13px] font-medium transition-colors cursor-pointer select-none"
                  >
                    {viewMode === "ui-design" && (
                      <motion.div
                        layoutId="browse-view-mode-pill"
                        className="absolute inset-0 rounded-md bg-[#5c6679] border border-white/20 shadow-sm"
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 35,
                        }}
                      />
                    )}
                    <span
                      className={`relative z-10 flex items-center gap-1.5 transition-colors duration-150 ${
                        viewMode === "ui-design"
                          ? "text-white font-semibold"
                          : "text-white/70 hover:text-white"
                      }`}
                    >
                      <SquarePen size={14} strokeWidth={1.8} />
                      <span>UI Design</span>
                    </span>
                  </button>
                </div>

                {/* 3. Platform Mode Toggle (All / Web / App) */}
                <div className="relative flex items-center h-[38px] rounded-lg border border-white/20 bg-transparent p-1 gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setPlatformMode("all")}
                    className="relative flex items-center justify-center px-3.5 py-1.5 rounded-md text-[13px] font-medium transition-colors cursor-pointer select-none"
                  >
                    {platformMode === "all" && (
                      <motion.div
                        layoutId="browse-platform-mode-pill"
                        className="absolute inset-0 rounded-md bg-[#5c6679] border border-white/20 shadow-sm"
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 35,
                        }}
                      />
                    )}
                    <span
                      className={`relative z-10 transition-colors duration-150 ${
                        platformMode === "all"
                          ? "text-white font-semibold"
                          : "text-white/70 hover:text-white"
                      }`}
                    >
                      All
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlatformMode("web")}
                    className="relative flex items-center justify-center px-3.5 py-1.5 rounded-md text-[13px] font-medium transition-colors cursor-pointer select-none"
                  >
                    {platformMode === "web" && (
                      <motion.div
                        layoutId="browse-platform-mode-pill"
                        className="absolute inset-0 rounded-md bg-[#5c6679] border border-white/20 shadow-sm"
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 35,
                        }}
                      />
                    )}
                    <span
                      className={`relative z-10 transition-colors duration-150 ${
                        platformMode === "web"
                          ? "text-white font-semibold"
                          : "text-white/70 hover:text-white"
                      }`}
                    >
                      Web
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlatformMode("app")}
                    className="relative flex items-center justify-center px-3.5 py-1.5 rounded-md text-[13px] font-medium transition-colors cursor-pointer select-none"
                  >
                    {platformMode === "app" && (
                      <motion.div
                        layoutId="browse-platform-mode-pill"
                        className="absolute inset-0 rounded-md bg-[#5c6679] border border-white/20 shadow-sm"
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 35,
                        }}
                      />
                    )}
                    <span
                      className={`relative z-10 transition-colors duration-150 ${
                        platformMode === "app"
                          ? "text-white font-semibold"
                          : "text-white/70 hover:text-white"
                      }`}
                    >
                      App
                    </span>
                  </button>
                </div>

                {/* 4. Pricing Mode Toggle (Free / Pro) */}
                <div className="relative flex items-center h-[38px] rounded-lg border border-white/20 bg-transparent p-1 gap-1 shrink-0">
                  <AnimatePresence initial={false}>
                    {priceMode === "free" && (
                      <motion.div
                        key="pill-free"
                        layoutId="browse-price-mode-pill"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute left-1 top-1 bottom-1 w-[calc(50%-4px)] rounded-md bg-[#5c6679] border border-white/20 shadow-sm pointer-events-none"
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 35,
                        }}
                      />
                    )}
                    {priceMode === "pro" && (
                      <motion.div
                        key="pill-pro"
                        layoutId="browse-price-mode-pill"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute right-1 top-1 bottom-1 w-[calc(50%-4px)] rounded-md bg-[#5c6679] border border-white/20 shadow-sm pointer-events-none"
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 35,
                        }}
                      />
                    )}
                  </AnimatePresence>
                  <button
                    type="button"
                    onClick={() => togglePriceMode("free")}
                    className="relative z-10 flex-1 flex items-center justify-center px-3.5 py-1.5 rounded-md text-[13px] font-medium transition-colors cursor-pointer select-none"
                  >
                    <span
                      className={`transition-colors duration-150 ${
                        priceMode === "free"
                          ? "text-white font-semibold"
                          : "text-white/70 hover:text-white"
                      }`}
                    >
                      Free
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => togglePriceMode("pro")}
                    className="relative z-10 flex-1 flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-md text-[13px] font-medium transition-colors cursor-pointer select-none"
                  >
                    <Crown
                      size={14}
                      color={priceMode === "pro" ? "#FFFFFF" : "#FF7A1B"}
                      strokeWidth={2}
                      className="transition-transform active:scale-95"
                    />
                    <span
                      className={`transition-colors duration-150 ${
                        priceMode === "pro"
                          ? "text-white font-semibold"
                          : "text-white/70 hover:text-white"
                      }`}
                    >
                      Pro
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Grid area (Pure native scroll container starting directly at the white line) */}
          <div
            ref={mainScrollRef}
            className="category-scrollbar flex-1 overflow-y-auto overflow-x-hidden pt-2 pb-8 pr-8"
          >
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
                    priority={index < 4}
                    isCopying={activeId === item._id}
                    onCopy={() => onCopy(item)}
                    onDownloadRecorded={() => recordDownload(item)}
                    onPreview={() => setPreviewItem(item)}
                    isFavorite={favoriteIds.has(item._id)}
                    onFavoriteToggle={() => handleFavoriteToggle(item)}
                    isFavoritePending={
                      toggleFavoriteMutation.isPending &&
                      toggleFavoriteMutation.variables === item._id
                    }
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
            isFavoritePending={
              toggleFavoriteMutation.isPending &&
              toggleFavoriteMutation.variables === previewItem._id
            }
            onDownloadRecorded={recordDownload}
            isProUser={isProUser}
          />
        )}

        {toastMessage && (
          <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
        )}
      </div>
    </>
  );
}
