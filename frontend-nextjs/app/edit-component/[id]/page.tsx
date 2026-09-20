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
    <div className="min-h-[calc(100vh-80px)] bg-[linear-gradient(135deg,#f8fbf6,#eef6f1)] px-4 py-12">
      <div className="mx-auto flex min-h-[calc(100vh-160px)] max-w-[520px] items-center justify-center">
        <div className="w-full rounded-[28px] border border-white/70 bg-white p-8 text-center shadow-[0_30px_80px_rgba(15,23,42,0.14)]">
          <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-[#238B45]/10 text-[#238B45]">
            <LockKeyhole size={30} strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-950">Authentication Required</h1>
          <p className="mx-auto mt-3 max-w-sm text-sm font-medium leading-6 text-slate-500">
            Sign in to edit your submitted components.
          </p>
          <button
            type="button"
            onClick={onLogin}
            className="mt-6 h-12 w-full rounded-2xl bg-[#238B45] text-sm font-extrabold text-white shadow-lg shadow-[#238B45]/20 transition hover:bg-[#2a9d50]"
          >
            Sign In
          </button>
        </div>
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
      <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center gap-3 bg-[linear-gradient(135deg,#f8fbf6,#eef6f1)]">
        <Loader2 className="h-10 w-10 animate-spin text-[#238B45]" />
        <p className="text-sm font-bold text-slate-500">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthRequiredCard onLogin={() => setLoginModalOpen(true)} />;
  }

  if (isLoading || !componentData || !initialValues) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center gap-3 bg-[linear-gradient(135deg,#f8fbf6,#eef6f1)]">
        <Loader2 className="h-10 w-10 animate-spin text-[#238B45]" />
        <p className="text-sm font-bold text-slate-500">Loading component details...</p>
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
