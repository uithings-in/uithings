"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Eye,
  ChevronDown,
} from "lucide-react";
import { componentsApi } from "../../api/components";
import { uploadApi } from "../../api/upload";
import { useAuth } from "../../context/AuthContext";
import { useAddComponentForm } from "./useAddComponentForm";
import { FigmaPayloadZone } from "./FigmaPayloadZone";
import { ScreenshotUploader } from "./ScreenshotUploader";
import { DetailsCard } from "./DetailsCard";
import { ClassificationCard } from "./ClassificationCard";
import { LivePreviewCard } from "./LivePreviewCard";
import { PublishChecklist } from "./PublishChecklist";
import { TipsCollapsible } from "./TipsCollapsible";
import { StickyActionBar } from "./StickyActionBar";

interface AddComponentPageProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AddComponentView({ onSuccess, onCancel }: AddComponentPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const allowPro = user?.role === "admin";

  const {
    values,
    setName,
    setDescription,
    setTags,
    setFigmaPayload,
    setPreviewFile,
    setDarkPreviewFile,
    setLightPreviewFile,
    setDesignType,
    setPricingType,
    setPlatformTag,
    markTouched,
    errors,
    missingFields,
    canPublish,
    checklist,
    completedCount,
    isDirty,
    lastSavedTime,
    clearDraft,
  } = useAddComponentForm(allowPro);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);

  // Fetch available tags from API
  const { data: availableTags = [] } = useQuery({
    queryKey: ["components", "tags"],
    queryFn: componentsApi.getTags,
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      setSubmitError(null);

      if (!values.name.trim()) {
        markTouched("name");
        throw new Error("Please provide a component name.");
      }
      if (!values.figmaDataBase64.trim()) {
        markTouched("figmaPayload");
        throw new Error("Please paste your Figma component payload.");
      }
      if (!values.darkPreviewFile && !values.lightPreviewFile && !values.previewFile) {
        markTouched("previewFile");
        throw new Error("Please upload at least one preview screenshot (Dark or Light).");
      }

      // 1. Upload preview images (dark & light)
      const uploadPromises: [Promise<string | undefined>, Promise<string | undefined>] = [
        values.darkPreviewFile
          ? uploadApi.uploadImage(values.darkPreviewFile)
          : Promise.resolve(undefined),
        values.lightPreviewFile
          ? uploadApi.uploadImage(values.lightPreviewFile)
          : Promise.resolve(undefined),
      ];

      const [uploadedDarkUrl, uploadedLightUrl] = await Promise.all(uploadPromises);

      const resolvedPreviewUrl =
        uploadedDarkUrl ||
        uploadedLightUrl ||
        (values.previewFile ? await uploadApi.uploadImage(values.previewFile) : "");

      // 2. Combine tags with platform tag for discoverability
      const cleanTags = Array.from(
        new Set(
          [...values.tags, values.platformTag]
            .filter(Boolean)
            .filter(
              (tag) => !["web", "app"].includes(tag.toLowerCase()) || tag === values.platformTag
            )
        )
      );

      // 3. Create component API call
      return componentsApi.create({
        name: values.name.trim(),
        description: values.description.trim(),
        tags: cleanTags,
        previewImageUrl: resolvedPreviewUrl,
        darkPreviewImageUrl: uploadedDarkUrl || resolvedPreviewUrl,
        lightPreviewImageUrl: uploadedLightUrl || resolvedPreviewUrl,
        figmaDataBase64: values.figmaDataBase64,
        designType: values.designType,
        pricingType: values.pricingType,
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["components"] });
      queryClient.invalidateQueries({ queryKey: ["my-components"] });

      clearDraft();
      setSuccessToast(`"${values.name}" published successfully!`);

      if (onSuccess) {
        setTimeout(() => onSuccess(), 1000);
      } else {
        setTimeout(() => {
          if (user?.role === "admin") {
            router.push("/components");
          } else {
            router.push("/dashboard?page=my-components");
          }
        }, 1200);
      }
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to publish component.";
      setSubmitError(message);
    },
  });

  const handlePublish = () => {
    markTouched("name");
    markTouched("figmaPayload");
    markTouched("previewFile");
    if (canPublish) {
      publishMutation.mutate();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.push("/dashboard?page=my-components");
    }
  };

  return (
    <div className="w-full space-y-4 pb-0">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 pt-0.5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-gray-900 dark:text-[#F5F5F5]">
              Create New Component
            </h1>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-orange-500/10 text-[#EA580C] dark:text-[#FB923C] border border-orange-500/20">
              NEW
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-[#A1A1AA] mt-0.5">
            Publish reusable Figma components to your workspace library and copy back anytime with vector accuracy.
          </p>
        </div>
      </div>

      {/* Success Toast Banner */}
      {successToast && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center justify-between rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 p-3.5 text-xs font-semibold text-emerald-900 dark:text-emerald-200 shadow-xs animate-in fade-in duration-150"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400" />
            <span>{successToast}</span>
          </div>
          <Link
            href="/dashboard?page=my-components"
            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1 text-xs font-semibold text-white transition"
          >
            <span>View in My Components</span>
            <ArrowRight size={12} />
          </Link>
        </div>
      )}

      {/* Global Error Banner */}
      {submitError && (
        <div
          role="alert"
          aria-live="assertive"
          className="flex items-center gap-2 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/60 p-3.5 text-xs font-semibold text-rose-800 dark:text-rose-200 shadow-xs animate-in fade-in duration-150"
        >
          <AlertCircle size={15} className="text-rose-600 dark:text-rose-400 shrink-0" />
          <span className="flex-1">{submitError}</span>
          <button
            type="button"
            onClick={() => setSubmitError(null)}
            className="text-xs font-semibold text-rose-600 dark:text-rose-300 hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Two-Column Ergonomic Layout (7/5 col split, balanced 20px gap) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start pb-6">
        {/* LEFT COLUMN: Assets & Inputs First (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* 1. Figma Asset (Required) */}
          <section aria-label="Figma asset paste area">
            <FigmaPayloadZone
              payload={values.figmaDataBase64}
              onPayloadChange={setFigmaPayload}
              error={errors.figmaPayload}
              onBlur={() => markTouched("figmaPayload")}
            />
          </section>

          {/* 2. Preview Screenshot (Required) */}
          <section aria-label="Preview screenshot upload area">
            <ScreenshotUploader
              darkPreviewFile={values.darkPreviewFile}
              darkPreviewUrl={values.darkPreviewUrl}
              onDarkFileSelect={setDarkPreviewFile}
              lightPreviewFile={values.lightPreviewFile}
              lightPreviewUrl={values.lightPreviewUrl}
              onLightFileSelect={setLightPreviewFile}
              error={errors.previewFile}
              onBlur={() => markTouched("previewFile")}
            />
          </section>

          {/* 3. Details Card (Name, Description, Tags) */}
          <section aria-label="Component metadata details">
            <DetailsCard
              name={values.name}
              description={values.description}
              tags={values.tags}
              availableTags={availableTags}
              nameError={errors.name}
              onNameChange={setName}
              onDescriptionChange={setDescription}
              onTagsChange={setTags}
              onNameBlur={() => markTouched("name")}
            />
          </section>

          {/* 4. Classification & Access */}
          <section aria-label="Component classification and permissions">
            <ClassificationCard
              designType={values.designType}
              platformTag={values.platformTag}
              pricingType={values.pricingType}
              allowPro={allowPro}
              onDesignTypeChange={setDesignType}
              onPlatformTagChange={setPlatformTag}
              onPricingTypeChange={setPricingType}
            />
          </section>
        </div>

        {/* RIGHT COLUMN: Sticky Sidebar for Live Preview, Checklist, Tips (5 cols) */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-4">
          {/* Tablet Accordion toggle for Live Preview if screen width is medium */}
          <div className="lg:hidden rounded-xl border border-gray-200/80 dark:border-white/[0.08] bg-white dark:bg-[#111113] p-3.5 shadow-xs">
            <button
              type="button"
              onClick={() => setMobilePreviewOpen((prev) => !prev)}
              className="flex w-full items-center justify-between text-xs font-semibold text-gray-900 dark:text-[#F5F5F5] cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Eye size={14} className="text-[#F97316]" />
                <span>Live Card Preview</span>
              </div>
              <ChevronDown
                size={14}
                className={`transition-transform duration-150 ${mobilePreviewOpen ? "rotate-180" : ""}`}
              />
            </button>
            {mobilePreviewOpen && (
              <div className="pt-2.5 mt-2.5 border-t border-gray-100 dark:border-white/[0.06]">
                <LivePreviewCard values={values} />
              </div>
            )}
          </div>

          {/* Desktop Real-time Live Preview */}
          <div className="hidden lg:block">
            <LivePreviewCard values={values} />
          </div>

          {/* Publish Checklist Card */}
          <PublishChecklist
            checklist={checklist}
            completedCount={completedCount}
          />

          {/* Tips for a great listing (Collapsible) */}
          <TipsCollapsible />
        </div>
      </div>

      {/* Sticky Bottom Action Bar (Single primary action, no duplicate buttons!) */}
      <StickyActionBar
        canPublish={canPublish}
        missingFields={missingFields}
        isSubmitting={publishMutation.isPending}
        lastSavedTime={lastSavedTime}
        onPublish={handlePublish}
        onCancel={handleCancel}
        onClearDraft={clearDraft}
        isDirty={isDirty}
      />
    </div>
  );
}
