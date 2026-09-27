"use client";

import { use, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, LockKeyhole } from "lucide-react";
import { componentsApi } from "../../../api/components";
import { uploadApi } from "../../../api/upload";
import { useAuth } from "../../../context/AuthContext";
import {
  ComponentEditorModal,
  type ComponentEditorValues,
} from "../../../components/ComponentEditorModal";

function AuthRequiredCard({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#FAFAFB] px-4 py-12 flex items-center justify-center">
      <div className="w-full max-w-[460px] rounded-2xl border border-gray-200/90 bg-white p-8 text-center shadow-xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-[#F97316]">
          <LockKeyhole size={26} strokeWidth={2} />
        </div>
        <h1 className="text-xl font-black tracking-tight text-gray-900">Authentication Required</h1>
        <p className="mx-auto mt-2 max-w-sm text-xs font-medium leading-5 text-gray-500">
          Sign in to edit your submitted components.
        </p>
        <button
          type="button"
          onClick={onLogin}
          className="mt-6 h-10 w-full rounded-xl bg-[#F97316] text-xs font-bold text-white shadow-sm transition hover:bg-[#EA580C] cursor-pointer"
        >
          Sign In
        </button>
      </div>
    </div>
  );
}

export default function EditComponentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isInitialized, setLoginModalOpen } = useAuth();
  const [status, setStatus] = useState("");

  const { data: componentData, isLoading } = useQuery({
    queryKey: ["components", id],
    queryFn: () => componentsApi.getById(id),
    enabled: !!id,
  });

  const initialValues = useMemo<Partial<ComponentEditorValues> | undefined>(() => {
    if (!componentData) return undefined;

    const existingTags = componentData.tags || [];
    const platformTag = existingTags.some((tag) => tag.toLowerCase() === "app") ? "app" : "web";

    return {
      name: componentData.name || "",
      description: componentData.description || "",
      tags: existingTags.filter((tag) => !["web", "app"].includes(tag.toLowerCase())),
      figmaDataBase64: componentData.figmaDataBase64 || "",
      designType: componentData.designType || "UI Design",
      pricingType: componentData.pricingType || "Free",
      platformTag,
    };
  }, [componentData]);

  const updateComponentMutation = useMutation({
    mutationFn: async (input: ComponentEditorValues) => {
      let previewImageUrl: string | undefined;
      if (input.previewFile) {
        previewImageUrl = await uploadApi.uploadImage(input.previewFile);
      }

      return componentsApi.update(id, {
        name: input.name,
        description: input.description,
        tags: input.tags,
        ...(previewImageUrl ? { previewImageUrl } : {}),
        figmaDataBase64: input.figmaDataBase64,
        designType: input.designType,
        pricingType: input.pricingType,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["components"] });
      queryClient.invalidateQueries({ queryKey: ["my-components"] });
    },
  });

  async function handleSubmit(values: ComponentEditorValues) {
    if (!values.figmaDataBase64.trim()) {
      setStatus("Paste a Figma component in the payload area first.");
      return;
    }

    setStatus(values.previewFile ? "Uploading new preview image..." : "Updating component...");

    try {
      await updateComponentMutation.mutateAsync(values);
      setStatus("Component updated successfully.");
      router.push("/dashboard?tab=my-components");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not update component.");
    }
  }

  if (!isInitialized) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center gap-3 bg-[#FAFAFB]">
        <Loader2 className="h-9 w-9 animate-spin text-[#F97316]" />
        <p className="text-xs font-semibold text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthRequiredCard onLogin={() => setLoginModalOpen(true)} />;
  }

  if (isLoading || !componentData || !initialValues) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center gap-3 bg-[#FAFAFB]">
        <Loader2 className="h-9 w-9 animate-spin text-[#F97316]" />
        <p className="text-xs font-semibold text-gray-500">Loading component details...</p>
      </div>
    );
  }

  return (
    <ComponentEditorModal
      key={componentData._id}
      mode="edit"
      initialValues={initialValues}
      currentPreviewImageUrl={componentData.previewImageUrl}
      status={status}
      isSubmitting={updateComponentMutation.isPending}
      allowPro
      onClose={() => router.back()}
      onSubmit={handleSubmit}
    />
  );
}
