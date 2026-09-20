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
    <div className="min-h-[calc(100vh-80px)] bg-[linear-gradient(135deg,#f8fbf6,#eef6f1)] px-4 py-12">
      <div className="mx-auto flex min-h-[calc(100vh-160px)] max-w-[520px] items-center justify-center">
        <div className="w-full rounded-[28px] border border-white/70 bg-white p-8 text-center shadow-[0_30px_80px_rgba(15,23,42,0.14)]">
          <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-[#238B45]/10 text-[#238B45]">
            <LockKeyhole size={30} strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-950">Authentication Required</h1>
          <p className="mx-auto mt-3 max-w-sm text-sm font-medium leading-6 text-slate-500">
            Sign in to submit components to the FigComponents library.
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
      <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center gap-3 bg-[linear-gradient(135deg,#f8fbf6,#eef6f1)]">
        <Loader2 className="h-10 w-10 animate-spin text-[#238B45]" />
        <p className="text-sm font-bold text-slate-500">Loading...</p>
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
