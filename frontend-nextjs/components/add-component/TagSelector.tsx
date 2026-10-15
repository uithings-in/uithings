"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, X, Tag as TagIcon } from "lucide-react";

interface TagSelectorProps {
  selectedTags: string[];
  availableTags: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
}

export function TagSelector({
  selectedTags,
  availableTags,
  onChange,
  maxTags = 3,
}: TagSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter((t) => t !== tag));
    } else {
      if (selectedTags.length >= maxTags) return;
      onChange([...selectedTags, tag]);
    }
  };

  const removeTag = (tagToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedTags.filter((t) => t !== tagToRemove));
  };

  const filteredTags = useMemo(() => {
    if (!search.trim()) return availableTags;
    return availableTags.filter((t) =>
      t.toLowerCase().includes(search.trim().toLowerCase())
    );
  }, [availableTags, search]);

  // Suggest popular quick-add tags not already selected
  const quickSuggestions = useMemo(() => {
    return availableTags
      .filter((t) => !selectedTags.includes(t))
      .slice(0, 6);
  }, [availableTags, selectedTags]);

  return (
    <div className="space-y-1.5" ref={containerRef}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-gray-700 dark:text-[#A1A1AA]">
          Tags & Categories
        </label>
        <span className="font-mono text-[11px] text-gray-400 dark:text-[#71717A]">
          {selectedTags.length}/{maxTags} selected
        </span>
      </div>

      {/* Selector Trigger Input */}
      <div className="relative">
        <div
          onClick={() => setIsOpen((prev) => !prev)}
          className={`flex min-h-[38px] w-full items-center justify-between rounded-lg border bg-white dark:bg-[#17171A] px-3 py-1.5 text-xs transition-all cursor-pointer ${isOpen
              ? "border-[#F97316] ring-1 ring-[#F97316]/20 shadow-2xs"
              : "border-gray-300 dark:border-white/[0.08] hover:border-gray-400 dark:hover:border-white/[0.15]"
            }`}
        >
          <div className="flex flex-wrap gap-1 items-center min-w-0 pr-2">
            {selectedTags.length === 0 ? (
              <span className="text-xs text-gray-400 dark:text-[#71717A] font-normal">
                Select tags for discoverability...
              </span>
            ) : (
              selectedTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-md bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 text-[11px] font-medium text-[#EA580C] dark:text-[#FB923C]"
                >
                  <span>{tag}</span>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => removeTag(tag, e)}
                    className="hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                    aria-label={`Remove tag ${tag}`}
                  >
                    <X size={10} />
                  </span>
                </span>
              ))
            )}
          </div>

          <ChevronDown
            size={14}
            className={`text-gray-400 dark:text-[#71717A] shrink-0 transition-transform duration-150 ${isOpen ? "rotate-180" : ""
              }`}
          />
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-56 w-full overflow-hidden rounded-xl border border-gray-200 dark:border-white/[0.1] bg-white dark:bg-[#17171A] p-2.5 shadow-xl animate-in fade-in duration-100 flex flex-col">
            <input
              type="text"
              placeholder="Search tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-full rounded-lg border border-gray-200 dark:border-white/[0.1] bg-gray-50 dark:bg-[#111113] px-2.5 text-xs font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#71717A] outline-none focus:border-[#F97316] mb-2"
              autoFocus
            />

            <div className="overflow-y-auto max-h-40 flex flex-wrap gap-1 p-0.5">
              {filteredTags.length === 0 ? (
                <div className="p-2.5 text-center text-xs text-gray-400 dark:text-[#71717A] w-full">
                  No matching tags found
                </div>
              ) : (
                filteredTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  const isMaxReached = selectedTags.length >= maxTags && !isSelected;

                  return (
                    <button
                      key={tag}
                      type="button"
                      disabled={isMaxReached}
                      onClick={() => toggleTag(tag)}
                      className={`rounded-md px-2 py-1 text-[11px] font-medium transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${isSelected
                          ? "bg-orange-500/20 text-[#EA580C] dark:text-[#FB923C] ring-1 ring-[#EA580C] font-semibold"
                          : "bg-gray-100 dark:bg-white/[0.06] text-gray-700 dark:text-[#A1A1AA] hover:bg-gray-200 dark:hover:bg-white/[0.1] hover:text-gray-900 dark:hover:text-white"
                        }`}
                    >
                      {tag}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick Suggestions Chips */}
      {selectedTags.length < maxTags && quickSuggestions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1 pt-0.5">
          <span className="text-[10px] text-gray-400 dark:text-[#71717A] mr-0.5 flex items-center gap-1">
            <TagIcon size={10} />
            Suggestions:
          </span>
          {quickSuggestions.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className="rounded border border-gray-200 dark:border-white/[0.08] bg-gray-50/70 dark:bg-white/[0.03] hover:border-orange-400 dark:hover:border-orange-500/40 px-1.5 py-0.5 text-[10px] font-medium text-gray-600 dark:text-[#A1A1AA] hover:text-[#EA580C] dark:hover:text-[#FB923C] transition cursor-pointer"
            >
              +{tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
