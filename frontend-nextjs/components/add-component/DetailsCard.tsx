"use client";

import React from "react";
import { FileText, AlertCircle } from "lucide-react";
import { TagSelector } from "./TagSelector";

interface DetailsCardProps {
  name: string;
  description: string;
  tags: string[];
  availableTags: string[];
  nameError?: string;
  onNameChange: (val: string) => void;
  onDescriptionChange: (val: string) => void;
  onTagsChange: (tags: string[]) => void;
  onNameBlur?: () => void;
}

export function DetailsCard({
  name,
  description,
  tags,
  availableTags,
  nameError,
  onNameChange,
  onDescriptionChange,
  onTagsChange,
  onNameBlur,
}: DetailsCardProps) {
  return (
    <div className="rounded-xl border border-gray-200/80 dark:border-white/[0.08] bg-white dark:bg-[#111113] p-4 sm:p-5 shadow-xs space-y-4 transition-colors">
      {/* Header */}
      <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100 dark:border-white/[0.06]">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500/10 text-[#F97316]">
          <FileText size={14} />
        </div>
        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-[#F5F5F5]">
            Component Details
          </h3>
          <p className="text-[11px] text-gray-500 dark:text-[#A1A1AA] mt-0.5">
            Identify your component clearly with a concise title, usage notes, and search tags.
          </p>
        </div>
      </div>

      {/* Component Name */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label
            htmlFor="component-name-input"
            className="text-xs font-medium text-gray-700 dark:text-[#A1A1AA]"
          >
            Component Name <span className="text-[#EA580C] dark:text-[#FB923C]">*</span>
          </label>
          <span className="font-mono text-[11px] text-gray-400 dark:text-[#71717A]">
            {name.length}/60
          </span>
        </div>

        <input
          id="component-name-input"
          type="text"
          placeholder="e.g. Header Navigation, Analytics Stat Card..."
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          onBlur={onNameBlur}
          maxLength={60}
          className={`h-9 w-full rounded-lg border bg-white dark:bg-[#17171A] px-3 text-xs font-medium text-gray-900 dark:text-[#F5F5F5] placeholder-gray-400 dark:placeholder-[#71717A] outline-none transition-all ${nameError
              ? "border-rose-400 ring-2 ring-rose-500/20"
              : "border-gray-300 dark:border-white/[0.08] hover:border-gray-400 dark:hover:border-white/[0.15] focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/20 shadow-2xs"
            }`}
        />

        {nameError && (
          <p className="flex items-center gap-1.5 text-[11px] font-medium text-rose-500 pt-0.5">
            <AlertCircle size={12} />
            <span>{nameError}</span>
          </p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label
            htmlFor="component-description-input"
            className="text-xs font-medium text-gray-700 dark:text-[#A1A1AA]"
          >
            Description <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <span className="font-mono text-[11px] text-gray-400 dark:text-[#71717A]">
            {description.length}/240
          </span>
        </div>

        <textarea
          id="component-description-input"
          placeholder="Provide a quick overview of layout variants, responsive states, or color tokens..."
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          maxLength={240}
          rows={2}
          className="w-full rounded-lg border border-gray-300 dark:border-white/[0.08] bg-white dark:bg-[#17171A] p-2.5 text-xs font-normal text-gray-900 dark:text-[#F5F5F5] placeholder-gray-400 dark:placeholder-[#71717A] outline-none transition-all hover:border-gray-400 dark:hover:border-white/[0.15] focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/20 shadow-2xs resize-none"
        />
      </div>

      {/* Tags Selector */}
      <TagSelector
        selectedTags={tags}
        availableTags={availableTags}
        onChange={onTagsChange}
        maxTags={3}
      />
    </div>
  );
}
