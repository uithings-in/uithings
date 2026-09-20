"use client";

import { Suspense, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { paymentsApi, type PurchasedSubscriptionRecord } from "../../api/payments";
import { componentsApi } from "../../api/components";
import { uploadApi } from "../../api/upload";
import { contactApi, type ContactInput } from "../../api/contact";
import { copyToFigma } from "../../lib/clipboard";
import type { PaginatedComponentResponse } from "../../lib/types";
import {
  ComponentEditorModal,
  type ComponentEditorValues,
} from "../../components/ComponentEditorModal";
import { 
  ArrowUpRight, 
  Copy, 
  ShieldCheck, 
  Loader2, 
  LayoutDashboard, 
  Heart, 
  CreditCard, 
  Mail, 
  ChevronDown,
  Package,
  Search,
  Plus,
  Pencil,
  Trash2,
  ArrowLeft,
  LogOut
} from "lucide-react";

function DeleteConfirmModal({
  name,
  onConfirm,
  onCancel,
  isDeleting,
}: {
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-1 text-[1rem] font-bold text-gray-900">Delete component?</h3>
        <p className="mb-5 text-[0.84rem] leading-relaxed text-gray-500">
          <span className="font-semibold text-gray-700">&quot;{name}&quot;</span> will be permanently removed.
          This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl bg-gray-100 px-4 py-2 text-[0.83rem] font-semibold text-gray-600 transition-colors hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded-xl bg-red-500 px-4 py-2 text-[0.83rem] font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-60"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function MyComponentsPanel() {
  const MY_COMPONENTS_PAGE_SIZE = 9;
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [search, setSearch] = useState("");
  const [copyingId, setCopyingId] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState("");
  const [editorStatus, setEditorStatus] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const editorMode = searchParams.get("modal") === "add" ? "create" : searchParams.get("edit") ? "edit" : null;
  const editId = searchParams.get("edit");

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["my-components", search, MY_COMPONENTS_PAGE_SIZE],
    queryFn: ({ pageParam }: { pageParam: { skip: number; limit: number } }) =>
      componentsApi.listMine(search, 1, pageParam.limit, pageParam.skip),
    initialPageParam: { skip: 0, limit: MY_COMPONENTS_PAGE_SIZE },
    getNextPageParam: (lastPage: PaginatedComponentResponse, allPages: PaginatedComponentResponse[]) => {
      const totalLoaded = allPages.reduce((acc, page) => acc + page.items.length, 0);
      return totalLoaded < lastPage.pagination.total
        ? { skip: totalLoaded, limit: MY_COMPONENTS_PAGE_SIZE }
        : undefined;
    },
    staleTime: 60 * 1000,
  });

  const items = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);
  const total = data?.pages[0]?.pagination?.total ?? items.length;

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { root: null, rootMargin: "500px 0px", threshold: 0 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const { data: editingComponent, isLoading: isEditorLoading } = useQuery({
    queryKey: ["components", "editor", editId],
    queryFn: async () => {
      if (!editId) return null;
      const component = await componentsApi.getById(editId);
      if (!component.figmaDataBase64) {
        try {
          const data = await componentsApi.getComponentData(editId);
          component.figmaDataBase64 = data.figmaDataBase64;
        } catch (err) {
          console.error("Failed to fetch figma component data:", err);
        }
      }
      return component;
    },
    enabled: !!editId,
  });

  const editingInitialValues = useMemo<Partial<ComponentEditorValues> | undefined>(() => {
    if (!editingComponent) return undefined;
    const existingTags = editingComponent.tags || [];
    const platformTag = existingTags.some((tag) => tag.toLowerCase() === "app") ? "app" : "web";

    return {
      name: editingComponent.name || "",
      description: editingComponent.description || "",
      tags: existingTags.filter((tag) => !["web", "app"].includes(tag.toLowerCase())),
      figmaDataBase64: editingComponent.figmaDataBase64 || "",
      designType: editingComponent.designType || "UI Design",
      pricingType: editingComponent.pricingType || "Free",
      platformTag,
    };
  }, [editingComponent]);

  function updatePanelQuery(next: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "my-components");
    params.delete("tab");

    Object.entries(next).forEach(([key, value]) => {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    router.replace(`/dashboard?${params.toString()}`, { scroll: false });
  }

  function openAddEditor() {
    setEditorStatus("");
    updatePanelQuery({ modal: "add", edit: null });
  }

  function openEditEditor(id: string) {
    setEditorStatus("");
    updatePanelQuery({ modal: null, edit: id });
  }

  function closeEditor() {
    setEditorStatus("");
    updatePanelQuery({ modal: null, edit: null });
  }

  const deleteMutation = useMutation({
    mutationFn: (id: string) => componentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-components"] });
      setDeleteTarget(null);
    },
  });

  const createMutation = useMutation({
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

  const updateMutation = useMutation({
    mutationFn: async (input: ComponentEditorValues & { id: string }) => {
      let previewImageUrl: string | undefined;
      if (input.previewFile) {
        previewImageUrl = await uploadApi.uploadImage(input.previewFile);
      }

      return componentsApi.update(input.id, {
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
      queryClient.invalidateQueries({ queryKey: ["components", "editor", editId] });
    },
  });

  async function handleEditorSubmit(values: ComponentEditorValues) {
    if (!values.figmaDataBase64.trim()) {
      setEditorStatus("Paste a Figma component in the payload area first.");
      return;
    }

    try {
      if (editorMode === "create") {
        setEditorStatus("Uploading preview image...");
        await createMutation.mutateAsync(values);
        closeEditor();
        return;
      }

      if (editorMode === "edit" && editId) {
        setEditorStatus(values.previewFile ? "Uploading new preview image..." : "Updating component...");
        await updateMutation.mutateAsync({ ...values, id: editId });
        closeEditor();
      }
    } catch (error) {
      setEditorStatus(error instanceof Error ? error.message : "Could not save component.");
    }
  }

  async function handleCopy(id: string, name: string, figmaDataBase64?: string) {
    setCopyStatus("");
    setCopyingId(id);
    try {
      const payload =
        figmaDataBase64 ||
        (
          await queryClient.fetchQuery({
            queryKey: ["components", "detail", id],
            queryFn: () => componentsApi.getById(id),
            staleTime: 10 * 60 * 1000,
          })
        ).figmaDataBase64;

      if (!payload) throw new Error("No Figma payload found.");
      await copyToFigma(payload, name);
      setCopyStatus(`Copied "${name}"`);
    } catch (err) {
      setCopyStatus(err instanceof Error ? err.message : "Copy failed.");
    } finally {
      setCopyingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#1E293B]">My Components</h1>
          <p className="mt-1 text-sm font-medium text-gray-500">
            {total > 0 ? `${total} component${total !== 1 ? "s" : ""}` : "No components yet"}
          </p>
        </div>

        <button
          type="button"
          onClick={openAddEditor}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#238B45] px-4 text-sm font-bold text-white shadow-md shadow-[#238B45]/10 transition hover:bg-[#2a9d50]"
        >
          <Plus size={16} strokeWidth={2.5} />
          Add Component
        </button>
      </div>

      <div className="rounded-3xl border border-gray-200/80 bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="h-11 w-full rounded-xl border border-gray-200 bg-slate-50 pl-10 pr-4 text-sm font-medium text-gray-800 outline-none transition focus:border-[#238B45] focus:bg-white focus:ring-2 focus:ring-[#238B45]/10"
              placeholder="Search your components..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {copyStatus && (
            <span className="rounded-xl border border-gray-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-gray-600">
              {copyStatus}
            </span>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center rounded-3xl border border-gray-200/80 bg-white py-24 text-sm font-semibold text-gray-400">
          Loading your components...
        </div>
      )}

      {isError && (
        <div className="flex items-center justify-center rounded-3xl border border-red-100 bg-red-50 py-24 text-sm font-semibold text-red-500">
          Could not load your components.
        </div>
      )}

      {!isLoading && !isError && items.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-gray-200/80 bg-white py-24 text-center shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#238B45]/10 text-[#238B45]">
            <Package size={30} strokeWidth={1.8} />
          </div>
          <p className="font-semibold text-gray-700">You haven&apos;t uploaded any components yet.</p>
          <button
            type="button"
            onClick={openAddEditor}
            className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-[#238B45] px-5 text-sm font-bold text-white transition hover:bg-[#2a9d50]"
          >
            <Plus size={16} strokeWidth={2.5} />
            Upload your first component
          </button>
        </div>
      )}

      {!isLoading && !isError && items.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <article
                key={item._id}
                className="overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition hover:shadow-[0_10px_30px_rgba(0,0,0,0.05)]"
              >
                <div
                  className="relative h-[180px] bg-[#F3F6F4] bg-contain bg-center bg-no-repeat"
                  style={item.previewImageUrl ? { backgroundImage: `url(${item.previewImageUrl})` } : {}}
                  aria-label={item.name}
                >
                  {!item.previewImageUrl && (
                    <div className="flex h-full items-center justify-center text-xs font-semibold text-gray-400">
                      No preview
                    </div>
                  )}
                  {item.status && (
                    <span
                      className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[0.65rem] font-extrabold uppercase tracking-wider text-white shadow-sm ${
                        item.status === "approved"
                          ? "bg-green-500"
                          : item.status === "rejected"
                          ? "bg-red-500"
                          : "bg-yellow-500"
                      }`}
                    >
                      {item.status}
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <p className="truncate text-sm font-bold text-gray-900">{item.name}</p>
                  {item.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {item.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-slate-100 px-2 py-1 text-[0.68rem] font-semibold text-gray-500"
                        >
                          {tag}
                        </span>
                      ))}
                      {item.tags.length > 3 && (
                        <span className="px-1 py-1 text-[0.68rem] font-semibold text-gray-400">
                          +{item.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopy(item._id, item.name, item.figmaDataBase64)}
                      disabled={copyingId === item._id}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-slate-50 py-2 text-xs font-bold text-gray-700 transition hover:bg-slate-100 disabled:opacity-60"
                    >
                      <Copy size={14} />
                      {copyingId === item._id ? "Copying..." : "Copy"}
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditEditor(item._id)}
                      className="flex items-center justify-center rounded-xl border border-blue-100 bg-blue-50 px-3 text-blue-500 transition hover:bg-blue-100"
                      aria-label="Edit component"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget({ id: item._id, name: item.name })}
                      className="flex items-center justify-center rounded-xl border border-red-100 bg-red-50 px-3 text-red-500 transition hover:bg-red-100"
                      aria-label="Delete component"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div ref={loadMoreRef} className="flex min-h-12 items-center justify-center py-2">
            {isFetchingNextPage ? (
              <span className="inline-flex items-center gap-2 text-xs font-bold text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin text-[#238B45]" />
                Loading more components...
              </span>
            ) : hasNextPage ? (
              <span className="sr-only">Load more components</span>
            ) : (
              <span className="text-xs font-bold text-gray-300">All components loaded</span>
            )}
          </div>
        </>
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          name={deleteTarget.name}
          onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
          isDeleting={deleteMutation.isPending}
        />
      )}

      {editorMode === "create" && (
        <ComponentEditorModal
          mode="create"
          status={editorStatus}
          isSubmitting={createMutation.isPending}
          allowPro={user?.role === "admin"}
          onClose={closeEditor}
          onSubmit={handleEditorSubmit}
        />
      )}

      {editorMode === "edit" && editId && (
        <ComponentEditorModal
          key={editId}
          mode="edit"
          isLoading={isEditorLoading || !editingComponent || !editingInitialValues}
          initialValues={editingInitialValues}
          currentPreviewImageUrl={editingComponent?.previewImageUrl}
          status={editorStatus}
          isSubmitting={updateMutation.isPending}
          allowPro={user?.role === "admin"}
          onClose={closeEditor}
          onSubmit={handleEditorSubmit}
        />
      )}
    </div>
  );
}

function ContactPanel() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [statusMessage, setStatusMessage] = useState("");
  const [form, setForm] = useState<ContactInput>({
    name: user?.name || "",
    email: user?.email || "",
    company: "",
    country: "Indonesia",
    message: "",
  });

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      name: prev.name || user?.name || "",
      email: prev.email || user?.email || "",
    }));
  }, [user]);

  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ["contact-history"],
    queryFn: () => contactApi.listMine(),
  });

  const createMutation = useMutation({
    mutationFn: (payload: ContactInput) => contactApi.create(payload),
    onSuccess: () => {
      setStatusMessage("Thanks! Your message has been sent.");
      setForm((prev) => ({
        ...prev,
        company: "",
        message: "",
      }));
      queryClient.invalidateQueries({ queryKey: ["contact-history"] });
    },
    onError: (error) => {
      setStatusMessage(error instanceof Error ? error.message : "Could not send your message.");
    },
  });

  function handleChange<K extends keyof ContactInput>(key: K, value: ContactInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusMessage("");

    if (!form.name || !form.email || !form.country || !form.message) {
      setStatusMessage("Please complete the required fields.");
      return;
    }

    createMutation.mutate({
      name: form.name.trim(),
      email: form.email.trim(),
      company: form.company?.trim() || "",
      country: form.country.trim(),
      message: form.message.trim(),
    });
  }

  const countries = [
    "Indonesia",
    "India",
    "United States",
    "United Kingdom",
    "Australia",
    "Canada",
    "Germany",
    "Singapore",
  ];

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-gray-200/80 bg-white p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-2xl font-extrabold text-gray-900">Contact Us</h1>
          <p className="mt-3 text-sm text-gray-500">
            If you need our help, have questions about how to use the platform or are experiencing technical
            difficulties, please do not hesitate to contact us.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-10 grid gap-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <label className="space-y-2 text-sm font-semibold text-gray-700">
              Your name<span className="text-red-500">*</span>
              <input
                className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-800 outline-none transition focus:border-[#238B45] focus:ring-2 focus:ring-[#238B45]/10"
                placeholder="Julia William"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </label>
            <label className="space-y-2 text-sm font-semibold text-gray-700">
              Contact email<span className="text-red-500">*</span>
              <input
                type="email"
                className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-800 outline-none transition focus:border-[#238B45] focus:ring-2 focus:ring-[#238B45]/10"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </label>
            <label className="space-y-2 text-sm font-semibold text-gray-700">
              Company name
              <input
                className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-800 outline-none transition focus:border-[#238B45] focus:ring-2 focus:ring-[#238B45]/10"
                placeholder="Company name"
                value={form.company || ""}
                onChange={(e) => handleChange("company", e.target.value)}
              />
            </label>
            <label className="space-y-2 text-sm font-semibold text-gray-700">
              Country<span className="text-red-500">*</span>
              <select
                className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-800 outline-none transition focus:border-[#238B45] focus:ring-2 focus:ring-[#238B45]/10"
                value={form.country}
                onChange={(e) => handleChange("country", e.target.value)}
              >
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="space-y-2 text-sm font-semibold text-gray-700">
            Your message<span className="text-red-500">*</span>
            <textarea
              className="min-h-[160px] w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-800 outline-none transition focus:border-[#238B45] focus:ring-2 focus:ring-[#238B45]/10"
              placeholder="Type your message..."
              value={form.message}
              onChange={(e) => handleChange("message", e.target.value)}
            />
          </label>

          <p className="text-xs text-gray-400">
            By submitting this form you agree to our terms and conditions and our Privacy Policy which explains how we
            may collect, use and disclose your personal information including to third parties.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="h-11 w-full rounded-xl bg-[#0b2f1b] px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0e3a21] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
            >
              {createMutation.isPending ? "Sending..." : "Submit"}
            </button>
            {statusMessage && (
              <span className="text-xs font-semibold text-gray-500">{statusMessage}</span>
            )}
          </div>
        </form>
      </div>

      <div className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Previous contact history</h2>
            <p className="text-sm text-gray-500">All messages you have sent from the dashboard.</p>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-100">
          {historyLoading ? (
            <div className="flex items-center justify-center py-12 text-sm font-semibold text-gray-400">
              Loading contact history...
            </div>
          ) : !history || history.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-sm font-semibold text-gray-400">
              No contact messages yet.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {history.map((item) => (
                <div key={item._id} className="grid gap-2 px-5 py-4 sm:grid-cols-[1.4fr_1fr_0.6fr] sm:items-center">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{item.message}</p>
                    <p className="mt-1 text-xs text-gray-400">
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500">
                    <p className="font-semibold text-gray-600">{item.country}</p>
                    <p className="mt-1">{item.company || "Personal"}</p>
                  </div>
                  <div>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                        item.status === "emailed"
                          ? "bg-emerald-50 text-emerald-600"
                          : item.status === "failed"
                          ? "bg-red-50 text-red-500"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FavoriteComponentsPanel() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [copyingId, setCopyingId] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["favorite-components", search],
    queryFn: () => componentsApi.listFavorites(search),
    staleTime: 60 * 1000,
  });

  const items = useMemo(() => data?.items ?? [], [data]);
  const total = data?.pagination?.total ?? items.length;

  const toggleFavoriteMutation = useMutation({
    mutationFn: (id: string) => componentsApi.toggleFavorite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorite-components"] });
      queryClient.invalidateQueries({ queryKey: ["favorite-component-ids"] });
    },
  });

  async function handleCopy(id: string, name: string) {
    setCopyStatus("");
    setCopyingId(id);
    try {
      const payload = (
        await queryClient.fetchQuery({
          queryKey: ["components", "data", id],
          queryFn: () => componentsApi.getComponentData(id),
          staleTime: 10 * 60 * 1000,
        })
      ).figmaDataBase64;

      if (!payload) throw new Error("No Figma payload found.");
      await copyToFigma(payload, name);
      setCopyStatus(`Copied "${name}"`);
    } catch (err) {
      setCopyStatus(err instanceof Error ? err.message : "Copy failed.");
    } finally {
      setCopyingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#1E293B]">Favorites</h1>
          <p className="mt-1 text-sm font-medium text-gray-500">
            {total > 0 ? `${total} saved component${total !== 1 ? "s" : ""}` : "No saved components yet"}
          </p>
        </div>

        <Link
          href="/components"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#238B45] px-4 text-sm font-bold text-white shadow-md shadow-[#238B45]/10 transition hover:bg-[#2a9d50]"
        >
          Browse Components
          <ArrowUpRight size={16} strokeWidth={2.5} />
        </Link>
      </div>

      <div className="rounded-3xl border border-gray-200/80 bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="h-11 w-full rounded-xl border border-gray-200 bg-slate-50 pl-10 pr-4 text-sm font-medium text-gray-800 outline-none transition focus:border-[#238B45] focus:bg-white focus:ring-2 focus:ring-[#238B45]/10"
              placeholder="Search favorites..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {copyStatus && (
            <span className="rounded-xl border border-gray-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-gray-600">
              {copyStatus}
            </span>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center rounded-3xl border border-gray-200/80 bg-white py-24 text-sm font-semibold text-gray-400">
          Loading your favorites...
        </div>
      )}

      {isError && (
        <div className="flex items-center justify-center rounded-3xl border border-red-100 bg-red-50 py-24 text-sm font-semibold text-red-500">
          Could not load your favorites.
        </div>
      )}

      {!isLoading && !isError && items.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-gray-200/80 bg-white py-24 text-center shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <Heart size={30} strokeWidth={1.8} />
          </div>
          <p className="font-semibold text-gray-700">You haven&apos;t favorited any components yet.</p>
          <Link
            href="/components"
            className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-[#238B45] px-5 text-sm font-bold text-white transition hover:bg-[#2a9d50]"
          >
            Browse components
            <ArrowUpRight size={16} strokeWidth={2.5} />
          </Link>
        </div>
      )}

      {!isLoading && !isError && items.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <article
              key={item._id}
              className="overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition hover:shadow-[0_10px_30px_rgba(0,0,0,0.05)]"
            >
              <div
                className="relative h-[180px] bg-[#F3F6F4] bg-contain bg-center bg-no-repeat"
                style={item.previewImageUrl ? { backgroundImage: `url(${item.previewImageUrl})` } : {}}
                aria-label={item.name}
              >
                {!item.previewImageUrl && (
                  <div className="flex h-full items-center justify-center text-xs font-semibold text-gray-400">
                    No preview
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => toggleFavoriteMutation.mutate(item._id)}
                  disabled={toggleFavoriteMutation.isPending && toggleFavoriteMutation.variables === item._id}
                  className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-white/95 text-red-500 shadow-sm backdrop-blur transition hover:scale-105 disabled:cursor-wait disabled:opacity-70"
                  aria-label="Remove from favorites"
                  title="Remove from favorites"
                >
                  <Heart size={18} strokeWidth={2} fill="currentColor" />
                </button>
              </div>

              <div className="p-4">
                <p className="truncate text-sm font-bold text-gray-900">{item.name}</p>
                {item.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {item.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-slate-100 px-2 py-1 text-[0.68rem] font-semibold text-gray-500"
                      >
                        {tag}
                      </span>
                    ))}
                    {item.tags.length > 3 && (
                      <span className="px-1 py-1 text-[0.68rem] font-semibold text-gray-400">
                        +{item.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(item._id, item.name)}
                    disabled={copyingId === item._id}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-slate-50 py-2 text-xs font-bold text-gray-700 transition hover:bg-slate-100 disabled:opacity-60"
                  >
                    <Copy size={14} />
                    {copyingId === item._id ? "Copying..." : "Copy"}
                  </button>
                  <Link
                    href={`/components`}
                    className="flex items-center justify-center rounded-xl border border-green-100 bg-green-50 px-3 text-[#238B45] transition hover:bg-green-100"
                    aria-label="Open component library"
                  >
                    <ArrowUpRight size={14} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function formatDate(value?: string) {
  if (!value) return "Not available";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatCurrency(amount?: number, currency = "INR") {
  if (typeof amount !== "number") return "Not available";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

function getDaysLeft(endDate?: string) {
  if (!endDate) return 0;
  const diffTime = new Date(endDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
}

function BillingPanel() {
  const queryClient = useQueryClient();
  const [activationStatus, setActivationStatus] = useState("");

  const { data: purchases = [], isLoading, isError } = useQuery({
    queryKey: ["subscription", "history"],
    queryFn: () => paymentsApi.getSubscriptionHistory(),
  });

  const { data: currentSub } = useQuery({
    queryKey: ["subscription", "current"],
    queryFn: () => paymentsApi.getCurrentSubscription(),
  });

  const isPremiumPlusActive = !!(
    currentSub?.plan?.displayName?.toLowerCase().replace(/\s+/g, "") === "premium+" ||
    currentSub?.plan?.name === "pro_annual" ||
    (currentSub?.maxComponents ?? 0) >= 999999
  );

  const activePlan = purchases.find((p) => p.status === "active");
  const queuedPlans = purchases.filter((p) => p.status === "queued");
  const pastPlans = purchases.filter(
    (p) => p.status !== "active" && p.status !== "queued"
  );

  const activateMutation = useMutation({
    mutationFn: (subscriptionId: string) =>
      paymentsApi.activateSubscription(subscriptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      setActivationStatus("Plan activated successfully!");
    },
    onError: (error) => {
      setActivationStatus(
        error instanceof Error ? error.message : "Activation failed"
      );
    },
  });

  useEffect(() => {
    if (activationStatus) {
      const t = setTimeout(() => setActivationStatus(""), 4000);
      return () => clearTimeout(t);
    }
  }, [activationStatus]);

  const getPlanName = (purchase: PurchasedSubscriptionRecord) =>
    purchase.planId?.displayName || purchase.planId?.name || "Purchased Plan";

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#1E293B]">Plans & Billing</h1>
          <p className="mt-1 text-sm font-medium text-gray-500">
            Your purchased plans, validity, credits, and payment records.
          </p>
        </div>

        <Link
          href="/pricing"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#238B45] px-4 text-sm font-bold text-white shadow-md shadow-[#238B45]/10 transition hover:bg-[#2a9d50]"
        >
          Buy New Plan
          <ArrowUpRight size={16} strokeWidth={2.5} />
        </Link>
      </div>

      {activationStatus && (
        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
          {activationStatus}
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center rounded-3xl border border-gray-200/80 bg-white py-24 text-sm font-semibold text-gray-400">
          Loading purchased plans...
        </div>
      )}

      {isError && (
        <div className="flex items-center justify-center rounded-3xl border border-red-100 bg-red-50 py-24 text-sm font-semibold text-red-500">
          Could not load billing information.
        </div>
      )}

      {!isLoading && !isError && purchases.length === 0 && (
        <div className="rounded-3xl border border-gray-200/80 bg-white p-8 text-center shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#238B45]/10 text-[#238B45]">
            <CreditCard size={26} strokeWidth={1.8} />
          </div>
          <h2 className="text-lg font-bold text-gray-900">No purchased plans yet</h2>
          <p className="mt-2 text-sm font-medium text-gray-500">
            Purchased plan details will appear here after checkout.
          </p>
        </div>
      )}

      {!isLoading && !isError && purchases.length > 0 && (
        <div className="space-y-8">
          {/* Queued Plans Section */}
          {queuedPlans.length > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-extrabold text-[#1E293B] flex items-center gap-2">
                <Package size={20} />
                Queued Plans
              </h2>
              <p className="mb-4 text-sm font-medium text-gray-500">
                These plans will activate automatically after your current plan expires.
                {isPremiumPlusActive && (
                  <span className="block mt-1 text-amber-600">
                    Premium+ is your active plan, so queued plans cannot be activated until it expires.
                  </span>
                )}
              </p>
              <div className="space-y-4">
                {queuedPlans.map((purchase) => {
                  const transaction = purchase.transactions?.[0];
                  return (
                    <article
                      key={purchase._id}
                      className="rounded-3xl border border-blue-100 bg-blue-50/40 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)]"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                            Queued Plan
                          </span>
                          <h2 className="mt-1 text-xl font-extrabold text-[#1E293B]">
                            {getPlanName(purchase)}
                          </h2>
                        </div>
                        <button
                          type="button"
                          onClick={() => activateMutation.mutate(purchase._id)}
                          disabled={
                            activateMutation.isPending ||
                            isPremiumPlusActive
                          }
                          className={`inline-flex h-10 items-center gap-2 rounded-xl px-5 text-sm font-bold shadow-sm transition ${
                            isPremiumPlusActive
                              ? "cursor-not-allowed bg-gray-200 text-gray-400"
                              : "cursor-pointer bg-[#238B45] text-white hover:bg-[#2a9d50] disabled:opacity-60"
                          }`}
                          title={
                            isPremiumPlusActive
                              ? "Cannot activate while Premium+ is active"
                              : "Activate this plan now"
                          }
                        >
                          <ArrowUpRight size={16} strokeWidth={2.5} />
                          {activateMutation.isPending &&
                          activateMutation.variables === purchase._id
                            ? "Activating..."
                            : "Activate Now"}
                        </button>
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                            Purchased On
                          </span>
                          <p className="mt-1 text-sm font-bold text-slate-700">
                            {formatDate(purchase.createdAt)}
                          </p>
                        </div>
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                            Plan Details
                          </span>
                          <p className="mt-1 text-sm font-bold text-slate-700">
                            {purchase.planId?.durationDays ?? 0} days &middot;{" "}
                            {purchase.maxComponents >= 999999
                              ? "Unlimited"
                              : `${purchase.maxComponents} components`}
                          </p>
                        </div>
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                            Price
                          </span>
                          <p className="mt-1 text-sm font-bold text-slate-700">
                            {formatCurrency(transaction?.amount, transaction?.currency)}
                          </p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active Plan Section */}
          {activePlan && (
            <div>
              <h2 className="mb-4 text-lg font-extrabold text-[#1E293B] flex items-center gap-2">
                <ShieldCheck size={20} />
                Active Plan
              </h2>
              <PlanCard purchase={activePlan} getPlanName={getPlanName} />
            </div>
          )}

          {/* Past Plans Section */}
          {pastPlans.length > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-extrabold text-[#1E293B] text-gray-500 flex items-center gap-2">
                <CreditCard size={20} />
                Purchase History
              </h2>
              <div className="space-y-4">
                {pastPlans.map((purchase) => (
                  <PlanCard
                    key={purchase._id}
                    purchase={purchase}
                    getPlanName={getPlanName}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PlanCard({
  purchase,
  getPlanName,
}: {
  purchase: PurchasedSubscriptionRecord;
  getPlanName: (p: PurchasedSubscriptionRecord) => string;
}) {
  const transaction = purchase.transactions?.[0];
  const remaining = Math.max(
    (purchase.maxComponents ?? 0) - (purchase.componentCountUsed ?? 0),
    0
  );

  return (
    <article className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Purchased Plan
          </span>
          <h2 className="mt-1 text-xl font-extrabold text-[#1E293B]">
            {getPlanName(purchase)}
          </h2>
        </div>
        <span
          className={`w-fit rounded-full px-3 py-1 text-xs font-extrabold uppercase ${
            purchase.status === "active"
              ? "bg-[#238B45]/10 text-[#238B45]"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {purchase.status}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Purchase Date
          </span>
          <p className="mt-1 text-sm font-bold text-slate-700">
            {formatDate(purchase.startDate || purchase.createdAt)}
          </p>
        </div>
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Valid Until
          </span>
          <p className="mt-1 text-sm font-bold text-slate-700">
            {formatDate(purchase.endDate)}
          </p>
        </div>
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Components
          </span>
          <p className="mt-1 text-sm font-bold text-slate-700">
            {purchase.componentCountUsed} used / {purchase.maxComponents} total
          </p>
          <p className="mt-0.5 text-xs font-semibold text-gray-400">
            {remaining} remaining
          </p>
        </div>
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Plan Price
          </span>
          <p className="mt-1 text-sm font-bold text-slate-700">
            {formatCurrency(purchase.planId?.price)}
          </p>
          <p className="mt-0.5 text-xs font-semibold text-gray-400">
            {purchase.planId?.durationDays ?? 0} days validity
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl bg-slate-50 p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Paid Amount
            </span>
            <p className="mt-1 text-sm font-bold text-slate-700">
              {formatCurrency(transaction?.amount, transaction?.currency)}
            </p>
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Payment Method
            </span>
            <p className="mt-1 text-sm font-bold capitalize text-slate-700">
              {transaction?.paymentMethod || "Not available"}
            </p>
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Payment ID
            </span>
            <p className="mt-1 truncate text-sm font-bold text-slate-700">
              {transaction?.razorpayPaymentId || "Not available"}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

function DashboardContent() {
  const { user, loading: authLoading, isInitialized, setLoginModalOpen, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Sidebar state (active tab)
  const [activeTab, setActiveTab] = useState("Overview");

  useEffect(() => {
    const page = searchParams.get("page");
    if (page === "my-components" || searchParams.get("tab") === "my-components") {
      window.setTimeout(() => setActiveTab("My Components"), 0);
    } else if (page === "favorites") {
      window.setTimeout(() => setActiveTab("Favorites"), 0);
    } else if (page === "plans-billing") {
      window.setTimeout(() => setActiveTab("Plans & Billing"), 0);
    } else if (page === "contact") {
      window.setTimeout(() => setActiveTab("Contact Us"), 0);
    }
  }, [searchParams]);

  function handleSidebarSelect(label: string) {
    setActiveTab(label);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("tab");
    params.delete("modal");
    params.delete("edit");

    if (label === "My Components") {
      params.set("page", "my-components");
    } else if (label === "Favorites") {
      params.set("page", "favorites");
    } else if (label === "Plans & Billing") {
      params.set("page", "plans-billing");
    } else if (label === "Contact Us") {
      params.set("page", "contact");
    } else {
      params.delete("page");
    }

    const query = params.toString();
    router.replace(query ? `/dashboard?${query}` : "/dashboard", { scroll: false });
  }

  // Fetch current subscription details
  const { data: subscriptionResponse, isLoading: subLoading } = useQuery({
    queryKey: ["subscription", "current"],
    queryFn: () => paymentsApi.getCurrentSubscription(),
    enabled: !!user,
  });

  // Fetch queued plans count
  const { data: historyData } = useQuery({
    queryKey: ["subscription", "history"],
    queryFn: () => paymentsApi.getSubscriptionHistory(),
    enabled: !!user,
    staleTime: 60 * 1000,
  });
  const queuedCount = (historyData ?? []).filter(
    (s) => s.status === "queued"
  ).length;

  // Get active subscription info
  const subscription = subscriptionResponse || null;
  const isPro = !!subscription && subscription.status === "active";

  // Calculations for Components Copied
  const componentCountUsed = subscription?.componentCountUsed ?? 0;
  const maxComponents = subscription?.maxComponents ?? 0;

  // Check if Premium+ / unlimited plan
  const isPremiumPlus = isPro && (
    subscription?.plan?.name === "premium_plus" ||
    subscription?.plan?.displayName?.toLowerCase().replace(/\s+/g, '').includes("premium+") ||
    maxComponents >= 999999
  );

  // Calculations for Days Left
  let daysLeft = 0;
  let durationDays = 0;

  if (subscription && subscription.endDate) {
    daysLeft = getDaysLeft(subscription.endDate);
    durationDays = subscription.plan?.durationDays ?? 30;
  }

  // Loading States
  if (!isInitialized || authLoading || (user && subLoading)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-[#238B45]" />
        <p className="text-gray-500 font-medium text-sm">Loading your dashboard...</p>
      </div>
    );
  }

  // Not logged in state
  if (!user) {
    return (
      <div className="max-w-[1300px] mx-auto px-6 py-20 flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
        <div className="w-16 h-16 bg-[#238B45]/10 rounded-full flex items-center justify-center text-[#238B45]">
          <ShieldCheck size={32} />
        </div>
        <div className="max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Dashboard</h1>
          <p className="text-gray-500 text-sm">
            Please log in to view your dashboard, manage subscription limits, copy counts, and plan details.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setLoginModalOpen(true)}
          className="bg-[#238B45] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-[#2a9d50] transition-all shadow-md shadow-[#238B45]/10 hover:shadow-[#238B45]/20 active:scale-95 cursor-pointer"
        >
          Sign In to Your Account
        </button>
      </div>
    );
  }

  // Sidebar Menu Config
  const sidebarLinks = [
    { label: "Overview", icon: LayoutDashboard },
    { label: "My Components", icon: Package },
    { label: "Favorites", icon: Heart },
    { label: "Plans & Billing", icon: CreditCard },
    { label: "Contact Us", icon: Mail }
  ];

  return (
    <main className="min-h-screen bg-[#F8FAF9] text-[#1E293B]">
      <div className="max-w-[1344px] mx-auto flex flex-col lg:flex-row px-5">
        
        {/* SIDEBAR */}
        <aside className="w-full lg:w-[310px] py-4 lg:py-6 px-4 lg:pl-0 lg:pr-6 shrink-0 lg:sticky lg:top-[60px] lg:h-[calc(100vh-60px)] flex flex-col">
          <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.03)] p-5 h-full flex flex-col overflow-hidden">
            
            {/* User Profile Info */}
            <div className="flex items-center gap-3.5 mb-6">
              <div className="w-10 h-10 rounded-full bg-[#238B45] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                {user.profilePicture ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.profilePicture}
                    alt={user.name}
                    className="h-full w-full rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  user.name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("")
                )}
              </div>
              <div className="truncate">
                <h4 className="text-sm font-bold text-[#1E293B] truncate leading-tight">{user.name}</h4>
                <p className="text-xs text-gray-400 truncate mt-0.5">{user.email}</p>
              </div>
            </div>

            {/* Team Dropdown */}
            <div className="relative mb-8">
              <div className="flex items-center justify-between w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#1E293B] hover:bg-slate-100/80 transition cursor-pointer select-none">
                <span>{user.name.split(" ")[0]}&apos;s Team</span>
                <ChevronDown size={14} className="text-gray-400" />
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 no-scrollbar">
              {sidebarLinks.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.label;
                
                const content = (
                  <span className="flex items-center gap-3">
                    <Icon size={16} className={isActive ? "text-[#238B45]" : "text-gray-400"} />
                    <span className="whitespace-nowrap">{item.label}</span>
                  </span>
                );

                const className = `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-tight transition duration-200 cursor-pointer ${
                  isActive 
                    ? "bg-[#238B45]/10 text-[#238B45]" 
                    : "text-[#64748B] hover:bg-slate-50 hover:text-[#1E293B]"
                }`;

                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleSidebarSelect(item.label)}
                    className={className}
                  >
                    {content}
                  </button>
                );
              })}
            </nav>

            {/* Bottom Actions: Back to Home & Logout */}
            <div className="mt-auto pt-6 border-t border-slate-100 flex flex-col gap-1">
              <Link
                href="/"
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#64748B] hover:bg-slate-50 hover:text-[#1E293B] transition duration-200"
              >
                <ArrowLeft size={16} className="text-gray-400" />
                <span>Back to Home</span>
              </Link>
              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-50 transition duration-200 text-left cursor-pointer"
              >
                <LogOut size={16} className="text-red-400" />
                <span>Log Out</span>
              </button>
            </div>

          </div>
        </aside>

        {/* MAIN DASHBOARD CONTENT AREA */}
        <section className="flex-1 py-6 md:py-8 lg:py-10 px-4 md:px-8 lg:pl-10 lg:pr-0 max-w-full">
          {activeTab === "My Components" ? (
            <MyComponentsPanel />
          ) : activeTab === "Favorites" ? (
            <FavoriteComponentsPanel />
          ) : activeTab === "Plans & Billing" ? (
            <BillingPanel />
          ) : activeTab === "Contact Us" ? (
            <ContactPanel />
          ) : (
          <>
          
          {/* Queued plans notification */}
          {queuedCount > 0 && (
            <div className="mb-6 rounded-3xl border border-blue-100 bg-blue-50 p-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-semibold text-blue-800">
                  You have {queuedCount} queued plan{queuedCount > 1 ? "s" : ""} waiting to be activated.
                  {isPremiumPlus ? " Premium+ is your active plan, so queued plans will activate after it expires." : ""}
                </p>
                <Link
                  href="/dashboard?page=plans-billing"
                  className="shrink-0 text-xs font-bold text-blue-600 hover:text-blue-800 underline"
                >
                  View in Plans & Billing
                </Link>
              </div>
            </div>
          )}
          
          {/* Top row cards (Figma Design Layout) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            
            {/* Plan Info Card */}
            <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[160px]">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Active Plan</h3>
                  <h2 className="text-xl font-extrabold text-[#1E293B] mt-1.5">
                    {isPro ? (subscription.plan?.displayName || "Pro Plan") : "Free Plan"}
                  </h2>
                </div>
                
                {/* Upgrade Button */}
                {!isPremiumPlus && (
                  <Link 
                    href="/pricing"
                    className="flex items-center gap-1 text-xs font-bold text-[#238B45] hover:text-[#2a9d50] hover:underline transition duration-200"
                  >
                    Upgrade Plan
                    <ArrowUpRight size={14} />
                  </Link>
                )}
              </div>

              <div className="text-xs font-semibold text-gray-400 mt-6 pt-4 border-t border-slate-50">
                {isPro ? (
                  <span className="flex items-center gap-1.5 text-[#238B45]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#238B45] animate-pulse" />
                    Active subscription expires {new Date(subscription.endDate).toLocaleDateString()}
                  </span>
                ) : (
                  <span>No active subscription</span>
                )}
              </div>
            </div>

            {/* Team Details Card */}
            <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[160px]">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">{user.name.split(" ")[0]}&apos;s Team</h3>
                </div>
                <span className="text-[10px] font-extrabold uppercase bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md border border-slate-200">
                  {isPro ? "Pro" : "Free"}
                </span>
              </div>

              {/* Grid metrics details */}
              <div className="grid grid-cols-3 gap-4 mt-4 pt-2">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Seats</span>
                  <span className="text-xs font-bold text-slate-700 mt-1 block">1 out of 1</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Components</span>
                  <span className="text-xs font-bold text-slate-700 mt-1 block">{isPro ? `${maxComponents}/mo` : "0/mo"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Templates</span>
                  <span className="text-xs font-bold text-slate-700 mt-1 block">0/mo</span>
                </div>
              </div>
            </div>

          </div>

          {/* Tab Selection Area & Reset indicator */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 mt-8">
            <div className="flex gap-2 p-1 bg-white border border-slate-200 rounded-xl w-fit">
              <button className="px-3 py-1.5 text-xs font-bold text-[#238B45] bg-[#238B45]/10 rounded-lg">
                Current Period
              </button>
              <button className="px-3 py-1.5 text-xs font-bold text-gray-400 hover:text-slate-700 rounded-lg transition duration-200">
                Lifetime Total
              </button>
            </div>
            
            {isPro && subscription.endDate && (
              <span className="text-xs text-gray-400 font-semibold italic">
                * Limits reset on {new Date(subscription.endDate).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}
          </div>

          {/* Usage Metrics block (4 Grid boxes) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            
            {/* Box 1: Components Copied */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.01)] flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-gray-400 block uppercase tracking-wider">Components Copied</span>
                <span className="text-3xl font-extrabold text-[#1E293B] mt-2 block">
                  {String(componentCountUsed).padStart(2, "0")}
                </span>
              </div>
              <span className="text-xs font-semibold text-gray-400 mt-4 block">
                out of {isPro ? maxComponents : "0"}
              </span>
            </div>

            {/* Box 2: Templates Unlocked */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.01)] flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-gray-400 block uppercase tracking-wider">Templates Unlocked</span>
                <span className="text-3xl font-extrabold text-[#1E293B] mt-2 block">00</span>
              </div>
              <span className="text-xs font-semibold text-gray-400 mt-4 block">
                out of 0
              </span>
            </div>

            {/* Box 3: Templates Downloaded */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.01)] flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-gray-400 block uppercase tracking-wider">Days Remaining</span>
                <span className="text-3xl font-extrabold text-[#1E293B] mt-2 block">
                  {String(daysLeft).padStart(2, "0")}
                </span>
              </div>
              <span className="text-xs font-semibold text-gray-400 mt-4 block">
                out of {isPro ? durationDays : "0"} total days
              </span>
            </div>

            {/* Box 4: Library Access */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.01)] flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-gray-400 block uppercase tracking-wider">Library Access</span>
                <span className="text-3xl font-extrabold text-[#1E293B] mt-2 block">
                  {isPro ? "01" : "00"}
                </span>
              </div>
              <span className="text-xs font-semibold text-gray-400 mt-4 block">
                active libraries
              </span>
            </div>

          </div>

          {/* Chart Mock Box */}
          <div className="bg-white rounded-3xl border border-gray-200/80 p-6 mb-16 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between mb-8">
              <div className="flex gap-1.5 p-1 bg-slate-50 border border-slate-200 rounded-xl w-fit">
                {["7 d", "30 d", "90 d", "Month"].map((d) => (
                  <button 
                    key={d}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition duration-200 ${
                      d === "30 d" ? "bg-[#238B45]/10 text-[#238B45]" : "text-gray-400 hover:text-slate-700"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <span className="text-xs font-bold text-gray-400">Last 30 days</span>
            </div>

            {/* SVG line chart mimic */}
            <div className="h-48 w-full relative flex flex-col justify-between">
              
              {/* grid lines */}
              <div className="w-full border-b border-slate-100 flex justify-between text-[10px] text-gray-300 font-bold pb-1"><span>4</span></div>
              <div className="w-full border-b border-slate-100 flex justify-between text-[10px] text-gray-300 font-bold pb-1"><span>3</span></div>
              <div className="w-full border-b border-slate-100 flex justify-between text-[10px] text-gray-300 font-bold pb-1"><span>2</span></div>
              <div className="w-full border-b border-slate-100 flex justify-between text-[10px] text-gray-300 font-bold pb-1"><span>1</span></div>
              
              {/* Green dot line at baseline (zeros) */}
              <div className="absolute inset-x-0 bottom-6 h-0.5 bg-[#238B45]">
                <div className="absolute left-[5%] bottom-[-3px] w-2.5 h-2.5 rounded-full bg-[#238B45] border-2 border-white" />
                <div className="absolute left-[20%] bottom-[-3px] w-2.5 h-2.5 rounded-full bg-[#238B45] border-2 border-white" />
                <div className="absolute left-[35%] bottom-[-3px] w-2.5 h-2.5 rounded-full bg-[#238B45] border-2 border-white" />
                <div className="absolute left-[50%] bottom-[-3px] w-2.5 h-2.5 rounded-full bg-[#238B45] border-2 border-white" />
                <div className="absolute left-[65%] bottom-[-3px] w-2.5 h-2.5 rounded-full bg-[#238B45] border-2 border-white" />
                <div className="absolute left-[80%] bottom-[-3px] w-2.5 h-2.5 rounded-full bg-[#238B45] border-2 border-white" />
                <div className="absolute left-[95%] bottom-[-3px] w-2.5 h-2.5 rounded-full bg-[#238B45] border-2 border-white" />
              </div>

              {/* dates label row */}
              <div className="flex justify-between text-[10px] text-gray-400 font-bold mt-2 pt-1 border-t border-slate-150">
                <span>0</span>
                <span>Apr 24</span>
                <span>Apr 27</span>
                <span>Apr 30</span>
                <span>May 3</span>
                <span>May 6</span>
                <span>May 9</span>
                <span>May 12</span>
                <span>May 15</span>
                <span>May 18</span>
                <span>May 21</span>
              </div>

            </div>
          </div>

          </>
          )}
        </section>

      </div>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-[#238B45]" />
          <p className="text-sm font-medium text-gray-500">Loading your dashboard...</p>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
