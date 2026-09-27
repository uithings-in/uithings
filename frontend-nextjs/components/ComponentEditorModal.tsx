"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import type { FormEvent } from "react";
import Image from "next/image";
import {
  CheckCircle2,
  Clipboard,
  Crown,
  Loader2,
  MonitorSmartphone,
  UploadCloud,
  X,
  ChevronDown,
  AlertCircle,
  FileCheck,
  Trash2,
  SlidersHorizontal,
  Image as ImageIcon,
} from "lucide-react";
import { extractFigmaBase64FromPaste } from "../lib/clipboard";
import { useQuery } from "@tanstack/react-query";
import { componentsApi } from "../api/components";

type DesignType = "UI Design" | "Wireframe";
type PricingType = "Free" | "Pro";
type PlatformTag = "web" | "app";

export interface ComponentEditorValues {
  name: string;
  description: string;
  tags: string[];
  figmaDataBase64: string;
  previewFile: File | null;
  designType: DesignType;
  pricingType: PricingType;
  platformTag: PlatformTag;
}

interface ComponentEditorModalProps {
  mode: "create" | "edit";
  initialValues?: Partial<ComponentEditorValues>;
  currentPreviewImageUrl?: string;
  isSubmitting: boolean;
  status: string;
  allowPro: boolean;
  onClose: () => void;
  onSubmit: (values: ComponentEditorValues) => Promise<void>;
  isLoading?: boolean;
}

const defaultValues: ComponentEditorValues = {
  name: "",
  description: "",
  tags: [],
  figmaDataBase64: "",
  previewFile: null,
  designType: "UI Design",
  pricingType: "Free",
  platformTag: "web",
};

const samplePayload = `<!-- figma-component -->
[NODE_READY: 0x7A21]
[PAYLOAD_STATUS: verified]
[STREAM: base64-encoded]
010110101100101001110010...`;

function mergeInitialValues(initialValues?: Partial<ComponentEditorValues>) {
  return {
    ...defaultValues,
    ...initialValues,
    tags: initialValues?.tags ?? [],
    previewFile: null,
  };
}

function getStatusTone(status: string) {
  if (!status) return "";
  if (/success|captured|submitted|added|updated/i.test(status)) {
    return "border-emerald-300 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-700 dark:text-emerald-300";
  }
  if (/uploading|updating|saving|loading/i.test(status)) {
    return "border-orange-300 bg-orange-50 text-orange-800 dark:bg-orange-950/60 dark:border-orange-700 dark:text-orange-300";
  }
  if (/paste|select|required/i.test(status)) {
    return "border-amber-300 bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:border-amber-700 dark:text-amber-300";
  }
  return "border-rose-300 bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:border-rose-700 dark:text-rose-300";
}

export function ComponentEditorModal({
  mode,
  initialValues,
  currentPreviewImageUrl,
  isSubmitting,
  status,
  allowPro,
  onClose,
  onSubmit,
  isLoading = false,
}: ComponentEditorModalProps) {
  const seed = useMemo(() => mergeInitialValues(initialValues), [initialValues]);
  const [name, setName] = useState(seed.name);
  const [description, setDescription] = useState(seed.description);
  const [tags, setTags] = useState<string[]>(seed.tags);
  const [figmaDataBase64, setFigmaDataBase64] = useState(seed.figmaDataBase64);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [designType, setDesignType] = useState<DesignType>(seed.designType);
  const [pricingType, setPricingType] = useState<PricingType>(seed.pricingType);
  const [platformTag, setPlatformTag] = useState<PlatformTag>(seed.platformTag);
  const [localStatus, setLocalStatus] = useState("");
  const [hasInitialized, setHasInitialized] = useState(false);
  const [tagsDropdownOpen, setTagsDropdownOpen] = useState(false);
  const [tagSearch, setTagSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const { data: availableTags = [] } = useQuery({
    queryKey: ["components", "tags"],
    queryFn: componentsApi.getTags,
  });

  // Sync state values when initialValues / seed resolves
  useEffect(() => {
    if (!isLoading && !hasInitialized && (seed.name || seed.figmaDataBase64)) {
      setName(seed.name);
      setDescription(seed.description);
      setTags(seed.tags);
      setFigmaDataBase64(seed.figmaDataBase64);
      setDesignType(seed.designType);
      setPricingType(seed.pricingType);
      setPlatformTag(seed.platformTag);
      setHasInitialized(true);
    }
  }, [seed, isLoading, hasInitialized]);

  // Click outside to close tag dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setTagsDropdownOpen(false);
      }
    }
    if (tagsDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [tagsDropdownOpen]);

  const previewUrl = useMemo(() => {
    if (previewFile) return URL.createObjectURL(previewFile);
    return currentPreviewImageUrl || "";
  }, [currentPreviewImageUrl, previewFile]);

  useEffect(() => {
    return () => {
      if (previewUrl && previewFile) URL.revokeObjectURL(previewUrl);
    };
  }, [previewFile, previewUrl]);

  useEffect(() => {
    const handleGlobalPaste = async (event: ClipboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        (target.tagName === "INPUT" &&
          !["file", "checkbox", "radio"].includes((target as HTMLInputElement).type)) ||
        target.tagName === "TEXTAREA"
      ) {
        if (target.id !== "figmaPaste") return;
      }

      try {
        const value = await extractFigmaBase64FromPaste(event);
        if (value) {
          setFigmaDataBase64(value);
          setLocalStatus("Figma payload captured successfully.");
        }
      } catch (error) {
        if (target.id === "figmaPaste") {
          setLocalStatus(error instanceof Error ? error.message : "Could not extract payload.");
        }
      }
    };

    window.addEventListener("paste", handleGlobalPaste);
    return () => window.removeEventListener("paste", handleGlobalPaste);
  }, []);

  const visibleStatus = status || localStatus;
  const title = mode === "create" ? "Add Component" : "Edit Component";
  const subtitle =
    mode === "create"
      ? "Create and publish a component to your workspace library."
      : "Update component details, classification, or figma asset payload.";

  function toggleTag(tagToToggle: string) {
    setTags((current) => {
      if (current.includes(tagToToggle)) {
        return current.filter((t) => t !== tagToToggle);
      }
      if (current.length >= 3) {
        alert("You can select up to 3 tags maximum.");
        return current;
      }
      return [...current, tagToToggle];
    });
  }

  function removeTag(tagToRemove: string) {
    setTags((current) => current.filter((t) => t !== tagToRemove));
  }

  const filteredTags = useMemo(() => {
    if (!tagSearch.trim()) return availableTags;
    return availableTags.filter((t) =>
      t.toLowerCase().includes(tagSearch.trim().toLowerCase())
    );
  }, [availableTags, tagSearch]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanTags = Array.from(
      new Set(
        [...tags, platformTag]
          .filter(Boolean)
          .filter((tag) => !["web", "app"].includes(tag.toLowerCase()) || tag === platformTag)
      )
    );

    await onSubmit({
      name,
      description,
      tags: cleanTags,
      figmaDataBase64,
      previewFile,
      designType,
      pricingType,
      platformTag,
    });
  }

  return (
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) onClose();
      }}
    >
      <section
        className="relative flex flex-col w-full max-w-[840px] max-h-[92vh] overflow-hidden rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-[#121316] text-gray-900 dark:text-neutral-100 shadow-[0_20px_60px_rgba(0,0,0,0.3)] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Conceptzilla Header */}
        <div className="shrink-0 border-b border-gray-100 dark:border-neutral-800/80 bg-white dark:bg-[#121316] px-5 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
                {title}
              </h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded-[5px] text-[9.5px] font-extrabold uppercase tracking-wider bg-[#FFF4ED] dark:bg-orange-950/80 text-[#EA580C] dark:text-[#FB923C] border border-[#FED7AA]/60 dark:border-orange-900/60">
                {mode === "create" ? "NEW" : "EDIT"}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">{subtitle}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-500 dark:text-neutral-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-700 transition cursor-pointer shadow-xs"
            aria-label="Close modal"
          >
            <X size={14} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
              
              {/* LEFT COLUMN: Metadata & Classification */}
              <div className="space-y-4">
                
                {/* Component Name */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700 dark:text-neutral-300">
                    Component Name <span className="text-[#EA580C] dark:text-[#FB923C]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Header Navigation, Analytics Card..."
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                    className="h-8 w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 text-xs font-semibold text-gray-900 dark:text-neutral-100 placeholder-gray-400 dark:placeholder-neutral-500 outline-none transition focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 shadow-xs"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700 dark:text-neutral-300">
                    Description
                  </label>
                  <textarea
                    placeholder="Short summary of layout variants, styling, or usage..."
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-2.5 text-xs font-medium text-gray-900 dark:text-neutral-100 placeholder-gray-400 dark:placeholder-neutral-500 outline-none transition focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 shadow-xs resize-none"
                  />
                </div>

                {/* Tags Selector */}
                <div className="space-y-1.5" ref={dropdownRef}>
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700 dark:text-neutral-300">
                      Tags
                    </label>
                    <span className="text-[10px] text-gray-500 dark:text-neutral-400 font-mono font-semibold">
                      {tags.length}/3 tags
                    </span>
                  </div>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setTagsDropdownOpen(!tagsDropdownOpen)}
                      className="flex min-h-[36px] w-full items-center justify-between rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-gray-800 dark:text-neutral-200 transition hover:border-gray-400 dark:hover:border-neutral-600 focus:border-[#F97316] focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 shadow-xs cursor-pointer"
                    >
                      <div className="flex flex-wrap gap-1 items-center min-w-0 pr-2">
                        {tags.length === 0 ? (
                          <span className="text-gray-400 dark:text-neutral-500 font-normal">Select up to 3 tags...</span>
                        ) : (
                          tags.map((t) => (
                            <span
                              key={t}
                              className="inline-flex items-center gap-1 rounded-[5px] bg-[#FFF4ED] dark:bg-orange-950/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#EA580C] dark:text-[#FB923C] border border-[#FED7AA]/60 dark:border-orange-900/60"
                            >
                              {t}
                              <span
                                role="button"
                                tabIndex={0}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeTag(t);
                                }}
                                className="hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                              >
                                <X size={9} />
                              </span>
                            </span>
                          ))
                        )}
                      </div>
                      <ChevronDown
                        size={13}
                        className={`text-gray-400 dark:text-neutral-400 shrink-0 transition-transform ${
                          tagsDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {tagsDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-52 w-full overflow-hidden rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-2 shadow-xl animate-in fade-in zoom-in-95 duration-100 flex flex-col">
                        <input
                          type="text"
                          placeholder="Search available tags..."
                          value={tagSearch}
                          onChange={(e) => setTagSearch(e.target.value)}
                          className="h-7 w-full rounded-lg border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 px-2.5 text-xs font-semibold text-gray-900 dark:text-neutral-100 placeholder-gray-400 dark:placeholder-neutral-500 outline-none focus:border-[#F97316] mb-2"
                        />

                        <div className="overflow-y-auto max-h-36 flex flex-wrap gap-1 p-0.5">
                          {filteredTags.length === 0 ? (
                            <div className="p-2 text-center text-xs font-medium text-gray-400 dark:text-neutral-400 w-full">
                              No matching tags found
                            </div>
                          ) : (
                            filteredTags.map((tag) => {
                              const isSelected = tags.includes(tag);
                              return (
                                <button
                                  key={tag}
                                  type="button"
                                  onClick={() => toggleTag(tag)}
                                  className={`rounded-[5px] px-2 py-1 text-[11px] font-semibold transition cursor-pointer ${
                                    isSelected
                                      ? "bg-[#FFF4ED] dark:bg-orange-950/80 text-[#EA580C] dark:text-[#FB923C] ring-1 ring-[#EA580C] font-bold"
                                      : "bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300 hover:bg-gray-200/80 dark:hover:bg-neutral-700"
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
                </div>

                {/* Classification / Properties Group */}
                <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-[#F8F9FA] dark:bg-neutral-900/60 p-3 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 dark:text-neutral-200">
                    <SlidersHorizontal size={13} className="text-[#F97316]" />
                    <span>Classification</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {/* Design Type */}
                    <div className="space-y-1">
                      <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-neutral-400 block">
                        Design
                      </span>
                      <div className="grid grid-cols-2 rounded-lg bg-gray-200/70 dark:bg-neutral-800 p-0.5">
                        {(["UI Design", "Wireframe"] as DesignType[]).map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setDesignType(option)}
                            className={`rounded-md py-1 text-[11px] font-bold transition cursor-pointer ${
                              designType === option
                                ? "bg-white dark:bg-neutral-700 text-gray-900 dark:text-white shadow-xs"
                                : "text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-200"
                            }`}
                          >
                            {option === "UI Design" ? "UI" : "Wire"}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Access / Pricing */}
                    <div className="space-y-1">
                      <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-neutral-400 block">
                        Access
                      </span>
                      <div className="grid grid-cols-2 rounded-lg bg-gray-200/70 dark:bg-neutral-800 p-0.5">
                        {(["Free", "Pro"] as PricingType[]).map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => (allowPro || option === "Free" ? setPricingType(option) : undefined)}
                            disabled={!allowPro && option === "Pro"}
                            title={!allowPro && option === "Pro" ? "Only admins can mark as Pro" : undefined}
                            className={`rounded-md py-1 text-[11px] font-bold flex items-center justify-center gap-1 transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 ${
                              pricingType === option
                                ? "bg-white dark:bg-neutral-700 text-gray-900 dark:text-white shadow-xs"
                                : "text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-200"
                            }`}
                          >
                            {option === "Pro" && <Crown size={10} className="text-[#F97316]" />}
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Platform */}
                    <div className="space-y-1">
                      <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-neutral-400 block">
                        Platform
                      </span>
                      <div className="grid grid-cols-2 rounded-lg bg-gray-200/70 dark:bg-neutral-800 p-0.5">
                        {(["web", "app"] as PlatformTag[]).map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setPlatformTag(option)}
                            className={`rounded-md py-1 text-[11px] font-bold capitalize transition cursor-pointer ${
                              platformTag === option
                                ? "bg-white dark:bg-neutral-700 text-gray-900 dark:text-white shadow-xs"
                                : "text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-200"
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: Figma Payload & Preview Image */}
              <div className="space-y-4">
                
                {/* 1. Figma Payload Dark Card (Conceptzilla Slate Theme) */}
                <div className="rounded-xl border border-gray-800 dark:border-neutral-800 bg-[#0B0F19] dark:bg-[#090C14] p-3.5 text-white shadow-sm flex flex-col">
                  <div className="mb-2.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-orange-500/20 text-[#F97316]">
                        <Clipboard size={13} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold leading-none text-white">Figma Payload</h4>
                        <p className="text-[10px] text-neutral-300 mt-0.5">Paste copied component data</p>
                      </div>
                    </div>

                    {figmaDataBase64 ? (
                      <span className="inline-flex items-center gap-1 rounded-[5px] bg-[#ECFDF5] px-2 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wider text-[#059669]">
                        <CheckCircle2 size={10} />
                        READY
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-[5px] text-[9.5px] font-extrabold uppercase tracking-wider bg-[#FFF4ED] text-[#EA580C]">
                        REQUIRED
                      </span>
                    )}
                  </div>

                  {/* Paste Box Area */}
                  <div className="relative min-h-[135px] flex-1 overflow-hidden rounded-xl border border-white/10 bg-black/50 flex flex-col justify-center items-center">
                    {isLoading ? (
                      <div className="flex flex-col items-center justify-center min-h-[135px] gap-2 text-center text-white/80">
                        <Loader2 className="h-5 w-5 animate-spin text-[#F97316]" />
                        <span className="text-xs font-semibold">Loading payload...</span>
                      </div>
                    ) : figmaDataBase64 ? (
                      <div className="h-full w-full p-3 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between pb-1.5 border-b border-white/10 text-[10px] font-mono text-neutral-300">
                            <span className="text-emerald-400 font-bold">✓ Payload Captured</span>
                            <span>{Math.round(figmaDataBase64.length / 1024)} KB</span>
                          </div>
                          <pre className="mt-1.5 max-h-[50px] overflow-hidden whitespace-pre-wrap break-all font-mono text-[9.5px] leading-relaxed text-emerald-400">
                            {samplePayload}
                          </pre>
                        </div>
                        
                        <div className="pt-2 mt-1 border-t border-white/10 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setFigmaDataBase64("")}
                            className="flex-1 h-6 rounded-md bg-white/15 text-[10.5px] font-bold text-white transition hover:bg-white/25 cursor-pointer flex items-center justify-center gap-1"
                          >
                            <Trash2 size={11} />
                            <span>Replace Payload</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex min-h-[135px] flex-col items-center justify-center p-3 text-center">
                        <MonitorSmartphone className="mb-1.5 text-neutral-300" size={22} />
                        <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                          <span>Click here & press</span>
                          <kbd className="rounded bg-white/20 px-1.5 py-0.5 font-mono text-[10px] text-orange-300 font-bold border border-white/10">
                            Ctrl + V
                          </kbd>
                        </div>
                        <p className="mt-1 max-w-[220px] text-[10.5px] text-neutral-300 leading-relaxed font-medium">
                          Copy any layer or component from Figma and paste here.
                        </p>
                        <textarea
                          id="figmaPaste"
                          value=""
                          onChange={() => {}}
                          className="absolute inset-0 h-full w-full cursor-pointer resize-none opacity-0"
                          aria-label="Paste Figma component payload"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Preview Image Dropzone Card */}
                <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-[#F8F9FA] dark:bg-neutral-900/60 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-orange-50 text-[#F97316]">
                        <ImageIcon size={13} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold leading-none text-gray-800 dark:text-neutral-100">
                          Preview Screenshot <span className="text-[#EA580C] dark:text-[#FB923C]">{mode === "create" ? "*" : ""}</span>
                        </h4>
                        <p className="text-[10px] text-gray-500 dark:text-neutral-400 mt-0.5 font-medium">PNG, JPG, or WebP</p>
                      </div>
                    </div>
                  </div>

                  <label className="group relative flex min-h-[96px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-2.5 text-center transition hover:border-[#F97316] hover:bg-orange-50/20 dark:hover:bg-orange-950/20">
                    {previewUrl ? (
                      <div className="flex items-center gap-3 w-full">
                        <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-md border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800">
                          <Image
                            src={previewUrl}
                            alt="Component preview"
                            fill
                            unoptimized
                            className="object-contain"
                          />
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <div className="flex items-center gap-1 text-[#059669] dark:text-emerald-400 text-[10.5px] font-bold">
                            <FileCheck size={12} />
                            <span>Preview Attached</span>
                          </div>
                          <p className="text-[10px] text-gray-500 dark:text-neutral-400 truncate mt-0.5 font-medium">
                            {previewFile ? previewFile.name : "Current image active"}
                          </p>
                          <span className="text-[9.5px] text-[#EA580C] dark:text-[#FB923C] font-bold hover:underline mt-0.5 inline-block">
                            Click to replace image
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-1">
                        <div className="mb-1 flex h-6 w-6 items-center justify-center rounded-lg bg-orange-50 dark:bg-orange-950/80 text-[#F97316] transition group-hover:scale-110">
                          <UploadCloud size={14} />
                        </div>
                        <span className="text-xs font-bold text-gray-800 dark:text-neutral-200 group-hover:text-[#F97316]">
                          Choose or drop image
                        </span>
                        <span className="text-[10px] text-gray-500 dark:text-neutral-400 mt-0.5 font-medium">
                          Drag file here or click to browse
                        </span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => setPreviewFile(event.target.files?.[0] || null)}
                      className="sr-only"
                    />
                  </label>
                </div>

              </div>

            </div>
          </div>

          {/* Modal Footer Actions & Status Bar (Conceptzilla bottom bar style) */}
          <div className="shrink-0 border-t border-gray-100 dark:border-neutral-800/80 bg-white dark:bg-[#121316] px-5 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="w-full sm:w-auto">
              {visibleStatus ? (
                <div
                  className={`inline-flex items-center gap-1.5 rounded-[5px] border px-2 py-0.5 text-[11px] font-semibold ${getStatusTone(
                    visibleStatus
                  )}`}
                >
                  <AlertCircle size={12} className="shrink-0" />
                  <span>{visibleStatus}</span>
                </div>
              ) : (
                <span className="text-[10.5px] text-gray-500 dark:text-neutral-400 font-medium hidden sm:inline">
                  * Components are verified automatically before publication.
                </span>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="h-8 rounded-lg border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3.5 text-xs font-semibold text-gray-700 dark:text-neutral-200 shadow-xs transition hover:bg-gray-100 dark:hover:bg-neutral-700 hover:text-gray-900 dark:hover:text-white cursor-pointer disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-[#F97316] px-4 text-xs font-semibold text-white shadow-xs transition hover:bg-[#EA580C] cursor-pointer disabled:cursor-wait disabled:opacity-70"
              >
                {isSubmitting && <Loader2 size={12} className="animate-spin" />}
                <span>
                  {isSubmitting
                    ? "Saving..."
                    : mode === "create"
                    ? "Save Component"
                    : "Save Changes"}
                </span>
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}
