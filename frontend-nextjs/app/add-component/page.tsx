"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, LockKeyhole } from "lucide-react";
import { componentsApi } from "../../api/components";
import { uploadApi } from "../../api/upload";
import { useAuth } from "../../context/AuthContext";
import {
  ComponentEditorModal,
  type ComponentEditorValues,
} from "../../components/ComponentEditorModal";

function AuthRequiredCard({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#FAFAFB] px-4 py-12 flex items-center justify-center">
      <div className="w-full max-w-[460px] rounded-2xl border border-gray-200/90 bg-white p-8 text-center shadow-xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-[#F97316]">
          <LockKeyhole size={26} strokeWidth={2} />
        </div>
        <h1 className="text-xl font-black tracking-tight text-gray-900">Authentication Required</h1>
        <p className="mx-auto mt-2 max-w-sm text-xs font-medium leading-5 text-gray-500">
          Sign in to submit components to the FigComponents library.
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

export default function AddComponentPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isInitialized, setLoginModalOpen } = useAuth();
  const [status, setStatus] = useState("");

  const addComponentMutation = useMutation({
    mutationFn: async (input: ComponentEditorValues) => {
      if (!input.previewFile) {
        throw new Error("Please select a preview image file.");
      }

      const previewImageUrl = await uploadApi.uploadImage(input.previewFile);
      return componentsApi.create({
        name: input.name,
        description: input.description,
        tags: input.tags,
        previewImageUrl,
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

    setStatus("Uploading preview image...");

    try {
      await addComponentMutation.mutateAsync(values);

      if (user?.role === "admin") {
        setStatus("Component added successfully.");
        router.push("/components");
        return;
      }

      setStatus("Component submitted. It will be public after admin review.");
      window.setTimeout(() => router.push("/dashboard?tab=my-components"), 1600);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not add component.");
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

  return (
    <ComponentEditorModal
      mode="create"
      status={status}
      isSubmitting={addComponentMutation.isPending}
      allowPro={user.role === "admin"}
      onClose={() => router.back()}
      onSubmit={handleSubmit}
    />
  );
}
