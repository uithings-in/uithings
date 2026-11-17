"use client";

import React, { useRef, useState } from "react";
import { X, Tag as TagIcon } from "lucide-react";

interface SubtagInputProps {
  subtags: string[];
  onChange: (subtags: string[]) => void;
  maxSubtags?: number;
}

const MAX_SUBTAG_LENGTH = 24;

export function SubtagInput({
  subtags,
  onChange,
  maxSubtags = 5,
}: SubtagInputProps) {
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const isFull = subtags.length >= maxSubtags;

  const addSubtags = (raw: string) => {
    const candidates = raw
      .split(",")
      .map((part) => part.trim().replace(/\s+/g, " "))
      .filter(Boolean);

    if (candidates.length === 0) return;

    const next = [...subtags];
    for (const candidate of candidates) {
      if (next.length >= maxSubtags) break;
      const value = candidate.slice(0, MAX_SUBTAG_LENGTH);
      if (!value) continue;
      if (next.some((tag) => tag.toLowerCase() === value.toLowerCase())) {
        continue;
      }
      next.push(value);
    }

    if (next.length !== subtags.length) onChange(next);
  };

  const commitDraft = () => {
    const value = draft.trim();
    if (!value) {
      setDraft("");
      return;
    }
    addSubtags(value);
    setDraft("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (!value.includes(",")) {
      setDraft(value.slice(0, MAX_SUBTAG_LENGTH));
      return;
    }

    const endsWithComma = value.endsWith(",");
    const parts = value.split(",");
    const pending = endsWithComma ? "" : (parts.pop() ?? "");
    addSubtags(parts.join(","));
    setDraft(pending.slice(0, MAX_SUBTAG_LENGTH));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "," || e.key === "Enter") {
      e.preventDefault();
      commitDraft();
      return;
    }

    if (e.key === "Backspace" && draft.length === 0 && subtags.length > 0) {
      e.preventDefault();
      onChange(subtags.slice(0, -1));
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text");
    if (!text.includes(",")) return;

    e.preventDefault();
    const merged = draft.trim() ? `${draft},${text}` : text;
    addSubtags(merged);
    setDraft("");
  };

  const removeSubtag = (tagToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(subtags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label
          htmlFor="component-subtags-input"
          className="text-xs font-medium text-gray-700 dark:text-[#A1A1AA]"
        >
          Subtags{" "}
          <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <span className="font-mono text-[11px] text-gray-400 dark:text-[#71717A]">
          {subtags.length}/{maxSubtags} subtags
        </span>
      </div>

      <div
        onClick={() => inputRef.current?.focus()}
        className={`flex min-h-[38px] w-full flex-wrap items-center gap-1 rounded-lg border px-2.5 py-1.5 cursor-text transition-all ${
          isFull
            ? "border-gray-300 dark:border-white/[0.08]"
            : "border-gray-300 dark:border-white/[0.08] hover:border-gray-400 dark:hover:border-white/[0.15] focus-within:border-[#F97316] focus-within:ring-1 focus-within:ring-[#F97316]/20"
        }`}
      >
        {subtags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-md bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 text-[11px] font-medium text-[#EA580C] dark:text-[#FB923C]"
          >
            <span>{tag}</span>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => removeSubtag(tag, e)}
              className="hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
              aria-label={`Remove subtag ${tag}`}
            >
              <X size={10} />
            </button>
          </span>
        ))}

        <input
          id="component-subtags-input"
          ref={inputRef}
          type="text"
          value={draft}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onBlur={commitDraft}
          disabled={isFull}
          maxLength={MAX_SUBTAG_LENGTH}
          placeholder={
            isFull
              ? "Maximum 5 subtags reached"
              : subtags.length === 0
                ? "e.g. hero, navbar, cta (comma separated)"
                : "Add another subtag..."
          }
          className="min-w-[120px] flex-1 bg-transparent text-xs font-normal text-gray-900 dark:text-[#F5F5F5] placeholder-gray-400 dark:placeholder-[#71717A] outline-none disabled:cursor-not-allowed"
        />
      </div>

      <p className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-[#71717A]">
        <TagIcon size={10} />
        Type a subtag and press comma or Enter to add. Up to {maxSubtags}{" "}
        subtags.
      </p>
    </div>
  );
}
