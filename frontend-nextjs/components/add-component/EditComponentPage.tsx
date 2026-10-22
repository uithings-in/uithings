"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Eye,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { componentsApi } from "../../api/components";
import { uploadApi } from "../../api/upload";
import { useAuth } from "../../context/AuthContext";
import { FigmaPayloadZone } from "./FigmaPayloadZone";
import { ScreenshotUploader } from "./ScreenshotUploader";
import { DetailsCard } from "./DetailsCard";
import { ClassificationCard } from "./ClassificationCard";
import { LivePreviewCard } from "./LivePreviewCard";
import { PublishChecklist } from "./PublishChecklist";
import { TipsCollapsible } from "./TipsCollapsible";
import { StickyActionBar } from "./StickyActionBar";
import type {
  ComponentFormValues,
  DesignType,
  PlatformTag,
  PricingType,
  ValidationErrors,
} from "./types";

interface EditComponentPageProps {
  componentId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function EditComponentView({
  componentId,
  onSuccess,
  onCancel,
}: EditComponentPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, refetchUser } = useAuth();
  const allowPro = user?.role === "admin" || !!user?.canUploadPro;

  // Refresh user permissions from backend on mount
  useEffect(() => {
    refetchUser?.();
  }, [refetchUser]);

  // Fetch component data
  const {
    data: component,
    isLoading: isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: ["components", "detail-edit", componentId],
    queryFn: async () => {
      if (!componentId) return null;
      const comp = await componentsApi.getById(componentId);
      if (!comp.figmaDataBase64) {
        try {
          const data = await componentsApi.getComponentData(componentId);
          comp.figmaDataBase64 = data.figmaDataBase64;
        } catch (err) {
          console.error("Failed to load figma data:", err);
        }
      }
      return comp;
    },
    enabled: !!componentId,
  });

  // Fetch available tags
  const { data: availableTags = [] } = useQuery({
    queryKey: ["components", "tags"],
    queryFn: componentsApi.getTags,
  });

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [figmaDataBase64, setFigmaPayload] = useState("");
  const [darkPreviewFile, setDarkPreviewFile] = useState<File | null>(null);
  const [darkPreviewUrl, setDarkPreviewUrl] = useState("");
  const [lightPreviewFile, setLightPreviewFile] = useState<File | null>(null);
  const [lightPreviewUrl, setLightPreviewUrl] = useState("");
  const [designType, setDesignType] = useState<DesignType>("UI Design");
  const [pricingType, setPricingType] = useState<PricingType>("Free");
  const [platformTag, setPlatformTag] = useState<PlatformTag>("web");

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize form when component data arrives
  useEffect(() => {
    if (!component || isInitialized) return;

    setName(component.name || "");
    setDescription(component.description || "");

    const existingTags = component.tags || [];
    const isApp = existingTags.some((t) => t.toLowerCase() === "app");
    setPlatformTag(isApp ? "app" : "web");
    setTags(
      existingTags.filter((t) => !["web", "app"].includes(t.toLowerCase())),
    );

    setFigmaPayload(component.figmaDataBase64 || "");

    const darkImg =
      component.darkPreviewImageUrl || component.previewImageUrl || "";
    const lightImg =
      component.lightPreviewImageUrl || component.previewImageUrl || "";
    setDarkPreviewUrl(darkImg);
    setLightPreviewUrl(lightImg);

    if (
      component.designType === "Wireframe" ||
      component.designType === "UI Design"
    ) {
      setDesignType(component.designType);
    }
    if (component.pricingType === "Pro" || component.pricingType === "Free") {
      setPricingType(component.pricingType);
    }

    setIsInitialized(true);
  }, [component, isInitialized]);

  // Object URL cleanup for dark mode preview
  useEffect(() => {
    if (darkPreviewFile) {
      const url = URL.createObjectURL(darkPreviewFile);
      setDarkPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [darkPreviewFile]);

  // Object URL cleanup for light mode preview
  useEffect(() => {
    if (lightPreviewFile) {
      const url = URL.createObjectURL(lightPreviewFile);
      setLightPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [lightPreviewFile]);

  const handleDarkFileSelect = (file: File | null) => {
    setDarkPreviewFile(file);
    if (!file) {
      setDarkPreviewUrl("");
    }
  };

  const handleLightFileSelect = (file: File | null) => {
    setLightPreviewFile(file);
    if (!file) {
      setLightPreviewUrl("");
    }
  };

  const markTouched = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Validation
  const errors: ValidationErrors = useMemo(() => {
    const errs: ValidationErrors = {};
    if (touched.name && !name.trim()) {
      errs.name = "Component name is required.";
    }
    if (touched.figmaPayload && !figmaDataBase64.trim()) {
      errs.figmaPayload = "Figma component payload is required.";
    }
    if (
      touched.previewFile &&
      !darkPreviewUrl &&
      !lightPreviewUrl &&
      !darkPreviewFile &&
      !lightPreviewFile
    ) {
      errs.previewFile = "At least one preview screenshot is required.";
    }
    return errs;
  }, [
    name,
    figmaDataBase64,
    darkPreviewUrl,
    lightPreviewUrl,
    darkPreviewFile,
    lightPreviewFile,
    touched,
  ]);

  const missingFields = useMemo(() => {
    const missing: string[] = [];
    if (!name.trim()) missing.push("Component name");
    if (!figmaDataBase64.trim()) missing.push("Figma payload");
    if (
      !darkPreviewUrl &&
      !lightPreviewUrl &&
      !darkPreviewFile &&
      !lightPreviewFile
    ) {
      missing.push("Preview screenshot");
    }
    return missing;
  }, [
    name,
    figmaDataBase64,
    darkPreviewUrl,
    lightPreviewUrl,
    darkPreviewFile,
    lightPreviewFile,
  ]);

  const canPublish = missingFields.length === 0;

  // Live card preview values object
  const values: ComponentFormValues = useMemo(
    () => ({
      name,
      description,
      tags,
      figmaDataBase64,
      previewFile: null,
      previewUrl: darkPreviewUrl || lightPreviewUrl,
      darkPreviewFile,
      darkPreviewUrl,
      lightPreviewFile,
      lightPreviewUrl,
      designType,
      pricingType,
      platformTag,
    }),
    [
      name,
      description,
      tags,
      figmaDataBase64,
      darkPreviewFile,
      darkPreviewUrl,
      lightPreviewFile,
      lightPreviewUrl,
      designType,
      pricingType,
      platformTag,
    ],
  );

  // Verification Checklist items
  const checklist = useMemo(
    () => [
      {
        id: "figma",
        label: "Figma component payload",
        completed: !!figmaDataBase64.trim(),
        required: true,
      },
      {
        id: "preview",
        label: "Preview screenshot",
        completed: !!(
          darkPreviewUrl ||
          lightPreviewUrl ||
          darkPreviewFile ||
          lightPreviewFile
        ),
        required: true,
      },
      {
        id: "name",
        label: "Component name",
        completed: !!name.trim(),
        required: true,
      },
      {
        id: "tags",
        label: "At least 1 category tag",
        completed: tags.length > 0,
        required: false,
      },
      {
        id: "desc",
        label: "Helpful description",
        completed: !!description.trim(),
        required: false,
      },
    ],
    [
      figmaDataBase64,
      darkPreviewUrl,
      lightPreviewUrl,
      darkPreviewFile,
      lightPreviewFile,
      name,
      tags,
      description,
    ],
  );

  const completedCount = checklist.filter((item) => item.completed).length;

  const updateMutation = useMutation({
    mutationFn: async () => {
      setSubmitError(null);

      if (!name.trim()) {
        markTouched("name");
        throw new Error("Please provide a component name.");
      }
      if (!figmaDataBase64.trim()) {
        markTouched("figmaPayload");
        throw new Error("Please paste your Figma component payload.");
      }
      if (
        !darkPreviewUrl &&
        !lightPreviewUrl &&
        !darkPreviewFile &&
        !lightPreviewFile
      ) {
        markTouched("previewFile");
        throw new Error("Please upload at least one preview screenshot.");
      }

      // 1. Upload preview images if new files were selected
      const uploadPromises: [
        Promise<string | undefined>,
        Promise<string | undefined>,
      ] = [
        darkPreviewFile
          ? uploadApi.uploadImage(darkPreviewFile)
          : Promise.resolve(undefined),
        lightPreviewFile
          ? uploadApi.uploadImage(lightPreviewFile)
          : Promise.resolve(undefined),
      ];

      const [uploadedDarkUrl, uploadedLightUrl] =
        await Promise.all(uploadPromises);

      const finalDarkUrl =
        uploadedDarkUrl ||
        (darkPreviewUrl.startsWith("blob:") ? "" : darkPreviewUrl);
      const finalLightUrl =
        uploadedLightUrl ||
        (lightPreviewUrl.startsWith("blob:") ? "" : lightPreviewUrl);
      const finalPreviewUrl = finalDarkUrl || finalLightUrl || "";

      // 2. Combine tags with platform tag for discoverability
      const cleanTags = Array.from(
        new Set(
          [...tags, platformTag]
            .filter(Boolean)
            .filter(
              (tag) =>
                !["web", "app"].includes(tag.toLowerCase()) ||
                tag === platformTag,
            ),
        ),
      );

      // 3. Update component API call
      return componentsApi.update(componentId, {
        name: name.trim(),
        description: description.trim(),
        tags: cleanTags,
        previewImageUrl: finalPreviewUrl,
        darkPreviewImageUrl: finalDarkUrl,
        lightPreviewImageUrl: finalLightUrl,
        figmaDataBase64,
        designType,
        pricingType,
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["components"] });
      queryClient.invalidateQueries({ queryKey: ["my-components"] });
      queryClient.invalidateQueries({
        queryKey: ["components", "detail-edit", componentId],
      });
      queryClient.invalidateQueries({
        queryKey: ["components", "detail", componentId],
      });

      setSuccessToast(`"${name}" updated successfully!`);

      if (onSuccess) {
        setTimeout(() => onSuccess(), 1000);
      } else {
        setTimeout(() => {
          router.push("/dashboard?page=my-components");
        }, 1200);
      }
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to update component.";
      setSubmitError(message);
    },
  });

  const handleSave = () => {
    markTouched("name");
    markTouched("figmaPayload");
    markTouched("previewFile");
    if (canPublish) {
      updateMutation.mutate();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.push("/dashboard?page=my-components");
    }
  };

  if (isFetching && !component) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#F97316]" />
        <p className="text-xs font-semibold text-gray-500 dark:text-neutral-400">
          Loading component details...
        </p>
      </div>
    );
  }

  if (isError || (!component && !isFetching)) {
    return (
      <div className="rounded-2xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#121316] p-8 text-center space-y-3">
        <AlertCircle size={28} className="mx-auto text-rose-500" />
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
          Could not load component
        </h3>
        <p className="text-xs text-gray-500 dark:text-neutral-400">
          {error instanceof Error
            ? error.message
            : "The component could not be found or you don't have access."}
        </p>
        <button
          type="button"
          onClick={handleCancel}
          className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-[#F97316] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#EA580C] transition cursor-pointer"
        >
          <ArrowLeft size={14} /> Back to My Components
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 pb-0">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-0.5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-gray-900 dark:text-[#F5F5F5]">
              Edit Component
            </h1>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-orange-500/10 text-[#EA580C] dark:text-[#FB923C] border border-orange-500/20">
              EDIT
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-[#A1A1AA] mt-0.5">
            Update component details, classification, or figma asset payload.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCancel}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white transition cursor-pointer self-start sm:self-center"
        >
          <ArrowLeft size={14} />
          <span>Back to My Components</span>
        </button>
      </div>

      {/* Success Toast Banner */}
      {successToast && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center justify-between rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 p-3.5 text-xs font-semibold text-emerald-900 dark:text-emerald-200 shadow-xs animate-in fade-in duration-150"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2
              size={15}
              className="text-emerald-600 dark:text-emerald-400"
            />
            <span>{successToast}</span>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1 text-xs font-semibold text-white transition cursor-pointer"
          >
            <span>Back to My Components</span>
            <ArrowRight size={12} />
          </button>
        </div>
      )}

      {/* Global Error Banner */}
      {submitError && (
        <div
          role="alert"
          aria-live="assertive"
          className="flex items-center gap-2 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/60 p-3.5 text-xs font-semibold text-rose-800 dark:text-rose-200 shadow-xs animate-in fade-in duration-150"
        >
          <AlertCircle
            size={15}
            className="text-rose-600 dark:text-rose-400 shrink-0"
          />
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

      {/* Two-Column Ergonomic Layout (7/5 col split, balanced 20px gap - identical to Add Component) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start pb-6">
        {/* LEFT COLUMN: Assets & Inputs First (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* 1. Figma Asset (Required) */}
          <section aria-label="Figma asset paste area">
            <FigmaPayloadZone
              payload={figmaDataBase64}
              onPayloadChange={setFigmaPayload}
              error={errors.figmaPayload}
              onBlur={() => markTouched("figmaPayload")}
            />
          </section>

          {/* 2. Preview Screenshot (Required) */}
          <section aria-label="Preview screenshot upload area">
            <ScreenshotUploader
              darkPreviewFile={darkPreviewFile}
              darkPreviewUrl={darkPreviewUrl}
              onDarkFileSelect={handleDarkFileSelect}
              lightPreviewFile={lightPreviewFile}
              lightPreviewUrl={lightPreviewUrl}
              onLightFileSelect={handleLightFileSelect}
              error={errors.previewFile}
              onBlur={() => markTouched("previewFile")}
            />
          </section>

          {/* 3. Details Card (Name, Description, Tags) */}
          <section aria-label="Component metadata details">
            <DetailsCard
              name={name}
              description={description}
              tags={tags}
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
              designType={designType}
              platformTag={platformTag}
              pricingType={pricingType}
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
                className={`transition-transform duration-150 ${
                  mobilePreviewOpen ? "rotate-180" : ""
                }`}
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

      {/* Sticky Bottom Action Bar with Save Changes */}
      <StickyActionBar
        canPublish={canPublish}
        missingFields={missingFields}
        isSubmitting={updateMutation.isPending}
        publishLabel="Save Changes"
        publishingLabel="Saving..."
        onPublish={handleSave}
        onCancel={handleCancel}
      />
    </div>
  );
}
