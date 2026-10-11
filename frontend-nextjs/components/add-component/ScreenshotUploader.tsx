"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import {
  UploadCloud,
  FileCheck,
  Trash2,
  RefreshCw,
  Image as ImageIcon,
  AlertCircle,
  Moon,
  Sun,
} from "lucide-react";

interface ScreenshotUploaderProps {
  darkPreviewFile?: File | null;
  darkPreviewUrl?: string;
  onDarkFileSelect?: (file: File | null) => void;
  lightPreviewFile?: File | null;
  lightPreviewUrl?: string;
  onLightFileSelect?: (file: File | null) => void;
  // Legacy / generic fallbacks
  previewFile?: File | null;
  previewUrl?: string;
  onFileSelect?: (file: File | null) => void;
  error?: string;
  onBlur?: () => void;
}

const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];

interface SingleDropzoneProps {
  mode: "dark" | "light";
  label: string;
  file: File | null;
  url: string;
  onFileSelect: (file: File | null) => void;
  onBlur?: () => void;
}

function ThemeDropzone({
  mode,
  label,
  file,
  url,
  onFileSelect,
  onBlur,
}: SingleDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isDarkMode = mode === "dark";

  const validateAndSet = (selected: File) => {
    setError(null);
    if (!ALLOWED_TYPES.includes(selected.type)) {
      setError("PNG, JPG, or WebP only.");
      return;
    }
    if (selected.size > MAX_SIZE_BYTES) {
      setError(`Max ${MAX_SIZE_MB}MB.`);
      return;
    }
    onFileSelect(selected);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSet(e.dataTransfer.files[0]);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${Math.round(bytes / 1024)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex flex-col h-full rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50/50 dark:bg-[#161619] p-3 sm:p-3.5 transition-colors">
      {/* Box Header */}
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-gray-200/60 dark:border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-md ${
              isDarkMode
                ? "bg-indigo-500/10 text-indigo-500 dark:text-indigo-400"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
            }`}
          >
            {isDarkMode ? <Moon size={13} /> : <Sun size={13} />}
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-900 dark:text-[#F5F5F5] block leading-tight">
              {label}
            </span>
            <span className="text-[10px] text-gray-500 dark:text-[#A1A1AA] block">
              {isDarkMode ? "Dark background preview" : "Light background preview"}
            </span>
          </div>
        </div>

        {file ? (
          <span className="inline-flex items-center gap-1 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
            <FileCheck size={10} />
            Ready
          </span>
        ) : (
          <span className="text-[10px] text-gray-400 dark:text-[#71717A]">
            16:9 ratio
          </span>
        )}
      </div>

      {/* Main Body */}
      {url ? (
        /* Uploaded State */
        <div className="flex-1 flex flex-col justify-between">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-gray-200 dark:border-white/[0.1] bg-black/5 dark:bg-black/60 shadow-2xs">
            <Image
              src={url}
              alt={`${label} preview`}
              fill
              unoptimized
              className="object-contain"
            />
          </div>

          <div className="mt-2.5 flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium text-gray-900 dark:text-[#F5F5F5] truncate">
                {file?.name || `${label} file`}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-[#A1A1AA]">
                {file ? formatFileSize(file.size) : "Uploaded"}
              </p>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1 rounded-md border border-gray-300 dark:border-white/[0.12] bg-white dark:bg-[#1E1E22] hover:bg-gray-100 dark:hover:bg-white/[0.08] px-2 py-1 text-[10.5px] font-medium text-gray-800 dark:text-white transition cursor-pointer"
                title="Change image"
              >
                <RefreshCw size={10} />
                <span>Change</span>
              </button>
              <button
                type="button"
                onClick={() => onFileSelect(null)}
                className="inline-flex items-center gap-1 rounded-md bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-300 px-2 py-1 text-[10.5px] font-medium transition cursor-pointer"
                title="Remove image"
              >
                <Trash2 size={10} />
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty Dropzone State */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex-1 group relative flex min-h-[130px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-3.5 text-center transition-all duration-150 ${
            isDragOver
              ? "border-[#F97316] bg-orange-500/[0.06] shadow-2xs"
              : error
              ? "border-rose-400 bg-rose-500/[0.03]"
              : "border-gray-300 dark:border-white/[0.12] bg-white dark:bg-[#111113] hover:border-[#F97316] hover:bg-orange-500/[0.02]"
          }`}
        >
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-transform duration-150 ${
              isDragOver
                ? "scale-105 bg-orange-500/20 text-[#F97316]"
                : isDarkMode
                ? "bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 group-hover:scale-105"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:scale-105"
            }`}
          >
            <UploadCloud size={16} />
          </div>

          <span className="mt-2 text-[11.5px] font-semibold text-gray-800 dark:text-[#F5F5F5] group-hover:text-[#F97316] transition-colors leading-tight">
            Drop {mode === "dark" ? "Dark Mode" : "Light Mode"} image
          </span>

          <p className="mt-0.5 text-[10px] text-gray-500 dark:text-[#A1A1AA]">
            PNG, JPG, WebP up to {MAX_SIZE_MB}MB
          </p>

          <span className="mt-2 inline-flex items-center gap-1 rounded bg-gray-200/70 dark:bg-white/[0.08] px-2 py-0.5 text-[9.5px] font-medium text-gray-700 dark:text-neutral-300 group-hover:bg-orange-500/10 group-hover:text-[#EA580C] dark:group-hover:text-[#FB923C] transition-colors">
            Browse file
          </span>
        </div>
      )}

      {error && (
        <p className="mt-1.5 text-[10px] text-rose-600 dark:text-rose-400 font-medium">
          {error}
        </p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            validateAndSet(e.target.files[0]);
          }
        }}
        onBlur={onBlur}
        className="sr-only"
        aria-label={`Upload ${label}`}
      />
    </div>
  );
}

export function ScreenshotUploader({
  darkPreviewFile,
  darkPreviewUrl = "",
  onDarkFileSelect,
  lightPreviewFile,
  lightPreviewUrl = "",
  onLightFileSelect,
  previewFile,
  previewUrl = "",
  onFileSelect,
  error,
  onBlur,
}: ScreenshotUploaderProps) {
  // Fallbacks for backwards compatibility if caller only provided single preview
  const resolvedDarkFile = darkPreviewFile ?? previewFile ?? null;
  const resolvedDarkUrl = darkPreviewUrl || previewUrl || "";
  const handleDarkSelect = onDarkFileSelect ?? onFileSelect ?? (() => {});

  const resolvedLightFile = lightPreviewFile ?? null;
  const resolvedLightUrl = lightPreviewUrl || "";
  const handleLightSelect = onLightFileSelect ?? (() => {});

  const totalUploaded = (resolvedDarkFile ? 1 : 0) + (resolvedLightFile ? 1 : 0);

  return (
    <div className="rounded-xl border border-gray-200/80 dark:border-white/[0.08] bg-white dark:bg-[#111113] p-4 sm:p-5 shadow-xs transition-colors">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500/10 text-[#F97316]">
            <ImageIcon size={14} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-[#F5F5F5]">
                Preview Screenshots
              </h3>
              <span className="text-[#EA580C] dark:text-[#FB923C] text-xs font-bold" aria-hidden="true">
                *
              </span>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-[#A1A1AA] mt-0.5">
              Upload distinct screenshots for Dark mode and Light mode appearances (16:9 ratio).
            </p>
          </div>
        </div>

        {totalUploaded > 0 ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
            <FileCheck size={11} />
            {totalUploaded === 2 ? "2/2 ATTACHED" : "ATTACHED"}
          </span>
        ) : (
          <span className="inline-flex items-center rounded-md bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 text-[10px] font-semibold text-[#EA580C] dark:text-[#FB923C]">
            REQUIRED
          </span>
        )}
      </div>

      {/* Two Split Boxes: Dark Mode & Light Mode */}
      <div className="mt-3.5 grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
        {/* Dark Mode Box */}
        <ThemeDropzone
          mode="dark"
          label="Dark Mode Component"
          file={resolvedDarkFile}
          url={resolvedDarkUrl}
          onFileSelect={handleDarkSelect}
          onBlur={onBlur}
        />

        {/* Light Mode Box */}
        <ThemeDropzone
          mode="light"
          label="Light Mode Component"
          file={resolvedLightFile}
          url={resolvedLightUrl}
          onFileSelect={handleLightSelect}
          onBlur={onBlur}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 px-3 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300">
          <AlertCircle size={13} className="shrink-0" />
          <span className="flex-1 text-[11px]">{error}</span>
        </div>
      )}
    </div>
  );
}
