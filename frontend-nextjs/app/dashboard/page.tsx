"use client";

import { Suspense, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { paymentsApi, type CurrentSubscriptionData, type PurchasedSubscriptionRecord } from "../../api/payments";
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
  LayoutDashboard,
  Package,
  Heart,
  CreditCard,
  Mail,
  Search,
  Plus,
  Pencil,
  Trash2,
  ArrowLeft,
  LogOut,
  ChevronDown,
  ArrowUpRight,
  Copy,
  ShieldCheck,
  Loader2,
  Info,
  Bell,
  Settings,
  Sun,
  Moon,
  HelpCircle,
  Filter,
  ArrowUpDown,
  SlidersHorizontal,
  List,
  LayoutGrid,
  Check,
  X,
  TrendingUp,
  Sparkles,
  XCircle,
  AlertTriangle,
} from "lucide-react";

// ==========================================
// TYPES & MOCK LEADS DATA FOR OVERVIEW
// ==========================================
interface LeadRecord {
  id: string;
  customer: string;
  avatar?: string;
  company: string;
  email: string;
  status: "HOT" | "OPEN" | "NEW" | "QUALIFIED" | "IN PROGRESS" | "PENDING";
  manager: string;
  managerAvatar?: string;
  source: "Website" | "LinkedIn" | "X" | "Facebook" | "Instagram";
  score: number; // 1-10
  createdAt: string;
}

const INITIAL_LEADS: LeadRecord[] = [
  {
    id: "lead-1",
    customer: "Emma Johansson",
    company: "Nordic Soft AB",
    email: "emma@nordicsoft.io",
    status: "HOT",
    manager: "Jacob Müller",
    source: "Website",
    score: 9,
    createdAt: "Dec 08, 2025",
  },
  {
    id: "lead-2",
    customer: "Ethan Wilson",
    company: "Travel Ventures",
    email: "ethan@travelventures.com",
    status: "OPEN",
    manager: "Olivia Davis",
    source: "LinkedIn",
    score: 6,
    createdAt: "Dec 07, 2025",
  },
  {
    id: "lead-3",
    customer: "Isabella Hernandez",
    company: "Design Studios",
    email: "isabella@designstudios.net",
    status: "NEW",
    manager: "Liam Johnson",
    source: "X",
    score: 4,
    createdAt: "Dec 06, 2025",
  },
  {
    id: "lead-4",
    customer: "William Lee",
    company: "AI Dynamics",
    email: "w.lee@aidynamics.com",
    status: "HOT",
    manager: "James Smith",
    source: "Facebook",
    score: 7,
    createdAt: "Dec 05, 2025",
  },
  {
    id: "lead-5",
    customer: "Sophia Martinez",
    company: "EcoTech Solutions",
    email: "sophia@ecotech.io",
    status: "QUALIFIED",
    manager: "Olivia Davis",
    source: "Instagram",
    score: 6,
    createdAt: "Dec 04, 2025",
  },
  {
    id: "lead-6",
    customer: "Ava Clark",
    company: "Smart Homes Inc.",
    email: "ava@smarthomes.com",
    status: "IN PROGRESS",
    manager: "Noah Garcia",
    source: "Website",
    score: 3,
    createdAt: "Dec 03, 2025",
  },
  {
    id: "lead-7",
    customer: "Lily Walker",
    company: "Foodie Connect",
    email: "walker@foodieconnect.com",
    status: "NEW",
    manager: "Zoe Lewis",
    source: "Instagram",
    score: 6,
    createdAt: "Dec 02, 2025",
  },
  {
    id: "lead-8",
    customer: "James Young",
    company: "Fashion Trendz",
    email: "j.young@fashiontrendz.com",
    status: "PENDING",
    manager: "Oliver Hall",
    source: "LinkedIn",
    score: 5,
    createdAt: "Dec 02, 2025",
  },
  {
    id: "lead-9",
    customer: "Mason Allen",
    company: "Virtual Reality Co.",
    email: "mason@vrco.io",
    status: "QUALIFIED",
    manager: "Emily King",
    source: "Facebook",
    score: 9,
    createdAt: "Dec 01, 2025",
  },
  {
    id: "lead-10",
    customer: "Jack Robinson",
    company: "Gaming Hub",
    email: "jack@gaminghub.gg",
    status: "OPEN",
    manager: "Mia Brown",
    source: "X",
    score: 7,
    createdAt: "Dec 01, 2025",
  },
  {
    id: "lead-11",
    customer: "David Ramirez",
    company: "IronGate Logistics",
    email: "david@irongate.io",
    status: "IN PROGRESS",
    manager: "Liam Johnson",
    source: "Referral",
    score: 4,
    createdAt: "Dec 01, 2025",
  } as unknown as LeadRecord,
];

// Mini SVG Sparkline Component
function Sparkline({ points, color = "#F97316" }: { points: number[]; color?: string }) {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const width = 80;
  const height = 24;

  const pathPoints = points.map((p, i) => {
    const x = (i / (points.length - 1)) * width;
    const y = height - ((p - min) / range) * (height - 6) - 3;
    return `${x},${y}`;
  });

  const pathD = `M ${pathPoints.join(" L ")}`;

  return (
    <svg width={width} height={height} className="overflow-visible shrink-0">
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Score Bar Visualizer (e.g. 9/10 with vertical ticks)
function ScoreMeter({ score, max = 10 }: { score: number; max?: number }) {
  const bars = Array.from({ length: 6 }, (_, i) => {
    const threshold = ((i + 1) / 6) * max;
    const active = score >= threshold - 0.5;
    let colorClass = "bg-gray-200";
    if (active) {
      if (score >= 8) colorClass = "bg-[#10B981]";
      else if (score >= 5) colorClass = "bg-[#FBBF24]";
      else colorClass = "bg-[#F87171]";
    }
    return <span key={i} className={`h-3 w-[2.5px] rounded-full transition-colors ${colorClass}`} />;
  });

  return (
    <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-gray-600">
      <div className="flex items-center gap-[2px]">{bars}</div>
      <span className="text-[10px] text-gray-400 font-sans">{score}/{max}</span>
    </div>
  );
}

// Status Badge Component
function StatusPill({ status }: { status: LeadRecord["status"] }) {
  const configs: Record<string, { bg: string; text: string; border?: string }> = {
    HOT: { bg: "bg-[#FFF4ED]", text: "text-[#EA580C]" },
    OPEN: { bg: "bg-[#F1F5F9]", text: "text-[#475569]" },
    NEW: { bg: "bg-[#EFF6FF]", text: "text-[#2563EB]" },
    QUALIFIED: { bg: "bg-[#ECFDF5]", text: "text-[#059669]" },
    "IN PROGRESS": { bg: "bg-[#F8FAFC]", text: "text-[#64748B]", border: "border border-gray-200" },
    PENDING: { bg: "bg-[#FFFBEB]", text: "text-[#D97706]" },
  };

  const current = configs[status] || { bg: "bg-gray-100", text: "text-gray-600" };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-[5px] text-[9.5px] font-extrabold uppercase tracking-wider ${current.bg} ${current.text} ${current.border || ""}`}
    >
      {status}
    </span>
  );
}

// Delete Confirmation Modal
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
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-1 text-base font-bold text-gray-900">Delete component?</h3>
        <p className="mb-5 text-xs leading-relaxed text-gray-500">
          <span className="font-semibold text-gray-700">&quot;{name}&quot;</span> will be permanently removed.
          This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-200 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded-xl bg-red-500 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-60 cursor-pointer"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Toast Notification Popup (Bottom Right)
function ToastPopup({
  title,
  message,
  onClose,
  type = "info",
  actionLabel,
  onAction,
  duration = 6000,
}: {
  title?: string;
  message: string;
  onClose: () => void;
  type?: "info" | "warning" | "success" | "error";
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
}) {
  useEffect(() => {
    if (!message || duration <= 0) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, onClose, duration]);

  if (!message) return null;

  const isError =
    type === "error" ||
    message.toLowerCase().includes("rejected") ||
    message.toLowerCase().includes("fail") ||
    message.toLowerCase().includes("error") ||
    message.toLowerCase().includes("no figma");

  const isWarning = type === "warning" || message.toLowerCase().includes("warning");

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm flex items-start gap-3 rounded-2xl bg-white p-3.5 shadow-[0_15px_40px_rgba(0,0,0,0.16)] border border-gray-200 text-xs animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl mt-0.5 ${
          isError
            ? "bg-rose-50 text-rose-600 border border-rose-100"
            : isWarning
            ? "bg-amber-50 text-amber-600 border border-amber-100"
            : "bg-emerald-50 text-emerald-600 border border-emerald-100"
        }`}
      >
        {isError ? (
          <XCircle size={16} />
        ) : isWarning ? (
          <AlertTriangle size={16} />
        ) : (
          <Check size={16} />
        )}
      </div>
      <div className="flex-1 min-w-0 pr-1">
        {title && (
          <h5 className="font-bold text-gray-900 text-xs leading-snug mb-0.5 truncate">
            {title}
          </h5>
        )}
        <p className="text-[11.5px] text-gray-600 leading-snug">
          {message}
        </p>
        {actionLabel && onAction && (
          <button
            type="button"
            onClick={() => {
              onAction();
              onClose();
            }}
            className="mt-2 text-[11px] font-bold text-[#F97316] hover:text-[#EA580C] hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>{actionLabel}</span>
            <span aria-hidden="true">→</span>
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="rounded-lg p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer shrink-0"
        aria-label="Close notification"
      >
        <X size={14} />
      </button>
    </div>
  );
}

// ==========================================
// MY COMPONENTS PANEL (CONCEPTZILLA STYLE)
// ==========================================
function MyComponentsPanel() {
  const MY_COMPONENTS_PAGE_SIZE = 12;
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
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
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
    staleTime: 0,
    refetchInterval: 3000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
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
      setSelectedIds((prev) => prev.filter((i) => i !== deleteTarget?.id));
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
      setCopyStatus(`Copied "${name}" to Figma`);
    } catch (err) {
      setCopyStatus(err instanceof Error ? err.message : "Copy failed.");
    } finally {
      setCopyingId(null);
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((i) => i._id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Action Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 pb-2">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search components..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-60 rounded-lg bg-white border border-gray-200 pl-8 pr-3 text-xs text-gray-700 placeholder-gray-400 focus:border-[#F97316] focus:outline-none shadow-sm"
            />
          </div>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 cursor-pointer shadow-sm">
            <Filter size={13} />
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 cursor-pointer shadow-sm">
            <ArrowUpDown size={13} />
          </button>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 cursor-pointer shadow-sm">
            <SlidersHorizontal size={13} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Grid / Table Toggle */}
          <div className="flex items-center rounded-lg border border-gray-200 bg-white p-0.5 shadow-sm">
            <button
              onClick={() => setViewMode("table")}
              className={`flex h-7 w-7 items-center justify-center rounded-md text-xs transition cursor-pointer ${
                viewMode === "table" ? "bg-gray-100 text-gray-900 font-bold" : "text-gray-400 hover:text-gray-700"
              }`}
            >
              <List size={13} />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`flex h-7 w-7 items-center justify-center rounded-md text-xs transition cursor-pointer ${
                viewMode === "grid" ? "bg-gray-100 text-gray-900 font-bold" : "text-gray-400 hover:text-gray-700"
              }`}
            >
              <LayoutGrid size={13} />
            </button>
          </div>

          <button
            type="button"
            onClick={openAddEditor}
            className="flex h-8 items-center gap-1.5 rounded-lg bg-[#F97316] px-3 text-xs font-semibold text-white shadow-sm hover:bg-[#EA580C] transition cursor-pointer"
          >
            <Plus size={14} strokeWidth={2.5} />
            <span>Add Component</span>
          </button>
        </div>
      </div>

      {/* Floating Bottom-Right Toast Popup */}
      <ToastPopup message={copyStatus} onClose={() => setCopyStatus("")} />

      {isLoading && (
        <div className="flex items-center justify-center rounded-2xl border border-gray-200/80 bg-white py-20 text-xs font-medium text-gray-400">
          <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#F97316]" />
          Loading your components...
        </div>
      )}

      {isError && (
        <div className="flex items-center justify-center rounded-2xl border border-red-100 bg-red-50 py-16 text-xs font-medium text-red-500">
          Could not load your components.
        </div>
      )}

      {!isLoading && !isError && items.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white py-16 text-center shadow-sm">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-[#F97316]">
            <Package size={24} strokeWidth={1.8} />
          </div>
          <p className="text-sm font-bold text-gray-800">You haven&apos;t uploaded any components yet.</p>
          <p className="text-xs text-gray-400 mt-1 max-w-sm">
            Publish custom components to your library and copy them directly to Figma anytime.
          </p>
          <button
            type="button"
            onClick={openAddEditor}
            className="mt-4 inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#F97316] px-3.5 text-xs font-semibold text-white transition hover:bg-[#EA580C] cursor-pointer"
          >
            <Plus size={14} strokeWidth={2.5} />
            Upload first component
          </button>
        </div>
      )}

      {!isLoading && !isError && items.length > 0 && viewMode === "grid" && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <article
                key={item._id}
                className="group relative overflow-hidden rounded-xl border border-gray-200/90 bg-white shadow-sm transition hover:shadow-md hover:border-gray-300 flex flex-col"
              >
                <div
                  className="relative h-[150px] bg-[#F8F9FA] bg-contain bg-center bg-no-repeat border-b border-gray-100"
                  style={item.previewImageUrl ? { backgroundImage: `url(${item.previewImageUrl})` } : {}}
                  aria-label={item.name}
                >
                  {!item.previewImageUrl && (
                    <div className="flex h-full items-center justify-center text-xs font-semibold text-gray-300">
                      No preview
                    </div>
                  )}
                  {item.status && (
                    <span
                      className={`absolute right-2.5 top-2.5 rounded px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white shadow-sm ${
                        item.status === "approved"
                          ? "bg-emerald-500"
                          : item.status === "rejected"
                          ? "bg-rose-500"
                          : "bg-amber-500"
                      }`}
                    >
                      {item.status}
                    </span>
                  )}
                </div>

                <div className="p-3.5 flex flex-col flex-1 justify-between">
                  <div>
                    <h4 className="truncate text-xs font-bold text-gray-900 leading-snug">{item.name}</h4>
                    {item.tags.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {item.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="rounded bg-gray-100 px-1.5 py-0.5 text-[9.5px] font-medium text-gray-500"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-3.5 flex items-center gap-1.5 pt-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => handleCopy(item._id, item.name, item.figmaDataBase64)}
                      disabled={copyingId === item._id}
                      className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-gray-200 bg-white py-1.5 text-[11px] font-semibold text-gray-700 transition hover:bg-gray-50 hover:text-gray-900 disabled:opacity-60 cursor-pointer"
                    >
                      <Copy size={12} />
                      {copyingId === item._id ? "Copying..." : "Copy"}
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditEditor(item._id)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-50 hover:text-gray-800 cursor-pointer"
                      aria-label="Edit component"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget({ id: item._id, name: item.name })}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:bg-red-50 hover:text-red-500 hover:border-red-200 cursor-pointer"
                      aria-label="Delete component"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div ref={loadMoreRef} className="flex min-h-8 items-center justify-center py-2">
            {isFetchingNextPage ? (
              <span className="inline-flex items-center gap-2 text-xs font-bold text-gray-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#F97316]" />
                Loading more...
              </span>
            ) : hasNextPage ? (
              <span className="sr-only">Load more</span>
            ) : (
              <span className="text-[11px] font-medium text-gray-300">All components loaded</span>
            )}
          </div>
        </>
      )}

      {!isLoading && !isError && items.length > 0 && viewMode === "table" && (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-[#F8F9FA] text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-200">
              <tr>
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === items.length && items.length > 0}
                    onChange={toggleSelectAll}
                    className="h-3.5 w-3.5 rounded border-gray-300 accent-[#F97316] cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3">Component</th>
                <th className="px-4 py-3">Category / Tags</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Pricing</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => {
                const isSelected = selectedIds.includes(item._id);
                return (
                  <tr
                    key={item._id}
                    className={`transition hover:bg-gray-50/80 ${isSelected ? "bg-orange-50/30" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(item._id)}
                        className="h-3.5 w-3.5 rounded border-gray-300 accent-[#F97316] cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
                          {item.previewImageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.previewImageUrl} alt={item.name} className="h-full w-full object-cover" />
                          ) : (
                            <Package size={14} className="text-gray-400" />
                          )}
                        </div>
                        <span className="truncate max-w-[180px] font-bold">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {item.tags.slice(0, 2).map((t) => (
                          <span key={t} className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 font-medium">{item.designType || "UI Design"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[9.5px] font-extrabold uppercase ${
                          item.status === "approved"
                            ? "bg-emerald-50 text-emerald-700"
                            : item.status === "rejected"
                            ? "bg-rose-50 text-rose-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {item.status || "Approved"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 font-medium">{item.pricingType || "Free"}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCopy(item._id, item.name, item.figmaDataBase64)}
                          className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                        >
                          Copy
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditEditor(item._id)}
                          className="rounded-lg p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget({ id: item._id, name: item.name })}
                          className="rounded-lg p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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

// ==========================================
// FAVORITE COMPONENTS PANEL
// ==========================================
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
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 pb-2">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search favorites..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 w-60 rounded-lg bg-white border border-gray-200 pl-8 pr-3 text-xs text-gray-700 placeholder-gray-400 focus:border-[#F97316] focus:outline-none shadow-sm"
          />
        </div>

        <Link
          href="/components"
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#F97316] px-3.5 text-xs font-semibold text-white shadow-sm hover:bg-[#EA580C] transition"
        >
          <span>Explore Library</span>
          <ArrowUpRight size={13} strokeWidth={2.5} />
        </Link>
      </div>

      {/* Floating Bottom-Right Toast Popup */}
      <ToastPopup message={copyStatus} onClose={() => setCopyStatus("")} />

      {isLoading && (
        <div className="flex items-center justify-center rounded-2xl border border-gray-200 bg-white py-20 text-xs font-medium text-gray-400">
          <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#F97316]" />
          Loading favorites...
        </div>
      )}

      {isError && (
        <div className="flex items-center justify-center rounded-2xl border border-red-100 bg-red-50 py-16 text-xs font-medium text-red-500">
          Could not load your favorites.
        </div>
      )}

      {!isLoading && !isError && items.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white py-16 text-center shadow-sm">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-rose-500">
            <Heart size={24} strokeWidth={1.8} />
          </div>
          <p className="text-sm font-bold text-gray-800">No favorite components saved yet.</p>
          <p className="text-xs text-gray-400 mt-1 max-w-sm">
            Save components from the UI library to access and copy them instantly here.
          </p>
          <Link
            href="/components"
            className="mt-4 inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#F97316] px-3.5 text-xs font-semibold text-white transition hover:bg-[#EA580C]"
          >
            Browse library
            <ArrowUpRight size={13} strokeWidth={2.5} />
          </Link>
        </div>
      )}

      {!isLoading && !isError && items.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <article
              key={item._id}
              className="overflow-hidden rounded-xl border border-gray-200/90 bg-white shadow-sm transition hover:shadow-md hover:border-gray-300 flex flex-col"
            >
              <div
                className="relative h-[150px] bg-[#F8F9FA] bg-contain bg-center bg-no-repeat border-b border-gray-100"
                style={item.previewImageUrl ? { backgroundImage: `url(${item.previewImageUrl})` } : {}}
                aria-label={item.name}
              >
                {!item.previewImageUrl && (
                  <div className="flex h-full items-center justify-center text-xs font-semibold text-gray-300">
                    No preview
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => toggleFavoriteMutation.mutate(item._id)}
                  disabled={toggleFavoriteMutation.isPending && toggleFavoriteMutation.variables === item._id}
                  className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-rose-500 shadow-sm backdrop-blur transition hover:scale-105 cursor-pointer"
                  title="Remove from favorites"
                >
                  <Heart size={14} fill="currentColor" />
                </button>
              </div>

              <div className="p-3.5 flex flex-col flex-1 justify-between">
                <div>
                  <h4 className="truncate text-xs font-bold text-gray-900 leading-snug">{item.name}</h4>
                  {item.tags.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {item.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded bg-gray-100 px-1.5 py-0.5 text-[9.5px] font-medium text-gray-500"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-3.5 flex items-center gap-1.5 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => handleCopy(item._id, item.name)}
                    disabled={copyingId === item._id}
                    className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-gray-200 bg-white py-1.5 text-[11px] font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60 cursor-pointer"
                  >
                    <Copy size={12} />
                    {copyingId === item._id ? "Copying..." : "Copy"}
                  </button>
                  <Link
                    href={`/components`}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-50 hover:text-gray-800"
                    aria-label="Open component"
                  >
                    <ArrowUpRight size={13} />
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

// Helpers for billing
function formatDate(value?: string) {
  if (!value) return "Not available";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDDMMYYYY(value?: string | Date) {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatCurrency(amount?: number, currency = "INR") {
  if (typeof amount !== "number") return "Free";
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

// ==========================================
// PLANS & BILLING PANEL
// ==========================================
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
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 pb-2">
        <div>
          <h2 className="text-base font-extrabold text-gray-900">Subscription & Credits</h2>
          <p className="text-xs text-gray-500">Manage plan tiers, validity, limits, and billing history.</p>
        </div>

        <Link
          href="/pricing"
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#F97316] px-3.5 text-xs font-semibold text-white shadow-sm hover:bg-[#EA580C] transition"
        >
          <span>Upgrade Tier</span>
          <ArrowUpRight size={13} strokeWidth={2.5} />
        </Link>
      </div>

      {/* Floating Bottom-Right Toast Popup */}
      <ToastPopup message={activationStatus} onClose={() => setActivationStatus("")} />

      {isLoading && (
        <div className="flex items-center justify-center rounded-2xl border border-gray-200 bg-white py-20 text-xs font-medium text-gray-400">
          <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#F97316]" />
          Loading billing records...
        </div>
      )}

      {isError && (
        <div className="flex items-center justify-center rounded-2xl border border-red-100 bg-red-50 py-16 text-xs font-medium text-red-500">
          Could not load billing information.
        </div>
      )}

      {!isLoading && !isError && (
        <div className="space-y-5">
          {/* Active Plan Card */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Current Plan</span>
                <h3 className="text-lg font-extrabold text-gray-900 mt-0.5">
                  {currentSub?.status === "active" ? (currentSub.plan?.displayName || "Pro Plan") : "Free Tier"}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                    currentSub?.status === "active" ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {currentSub?.status === "active" ? "Active" : "Free Plan"}
                </span>
                <Link
                  href="/pricing"
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  Change Plan
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
              <div>
                <span className="text-gray-400 font-medium block">Components Used</span>
                <span className="font-bold text-gray-800 text-sm mt-0.5 block">
                  {currentSub?.componentCountUsed ?? 0} / {currentSub?.maxComponents ?? 0}
                </span>
              </div>
              <div>
                <span className="text-gray-400 font-medium block">Days Remaining</span>
                <span className="font-bold text-gray-800 text-sm mt-0.5 block">
                  {currentSub?.endDate ? `${getDaysLeft(currentSub.endDate)} days` : "Lifetime"}
                </span>
              </div>
              <div>
                <span className="text-gray-400 font-medium block">Expires On</span>
                <span className="font-bold text-gray-800 text-sm mt-0.5 block">
                  {currentSub?.endDate ? formatDate(currentSub.endDate) : "Never"}
                </span>
              </div>
              <div>
                <span className="text-gray-400 font-medium block">Workspace Seats</span>
                <span className="font-bold text-gray-800 text-sm mt-0.5 block">1 Seat</span>
              </div>
            </div>
          </div>

          {/* Queued Plans */}
          {queuedPlans.length > 0 && (
            <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-800 flex items-center gap-1.5">
                <Package size={14} />
                Queued Subscriptions ({queuedPlans.length})
              </h3>
              <div className="space-y-2">
                {queuedPlans.map((qp) => (
                  <div key={qp._id} className="flex items-center justify-between bg-white rounded-lg p-3 border border-blue-100 text-xs">
                    <div>
                      <span className="font-bold text-gray-900">{getPlanName(qp)}</span>
                      <span className="text-gray-400 ml-2">Purchased {formatDate(qp.createdAt)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => activateMutation.mutate(qp._id)}
                      disabled={activateMutation.isPending || isPremiumPlusActive}
                      className="rounded-lg bg-[#F97316] px-3 py-1 text-xs font-semibold text-white hover:bg-[#EA580C] disabled:opacity-50 cursor-pointer"
                    >
                      Activate Now
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Past Transactions Table */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 bg-[#F8F9FA] flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Order & Billing History</h3>
              <span className="text-[11px] text-gray-400 font-medium">{purchases.length} records</span>
            </div>
            {purchases.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-400 font-medium">
                No past transactions found.
              </div>
            ) : (
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-[#F8F9FA] text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100">
                  <tr>
                    <th className="px-5 py-2.5">Plan</th>
                    <th className="px-5 py-2.5">Date</th>
                    <th className="px-5 py-2.5">Amount</th>
                    <th className="px-5 py-2.5">Status</th>
                    <th className="px-5 py-2.5 text-right">Payment ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {purchases.map((purchase) => {
                    const tx = purchase.transactions?.[0];
                    return (
                      <tr key={purchase._id} className="hover:bg-gray-50/70">
                        <td className="px-5 py-3 font-semibold text-gray-900">{getPlanName(purchase)}</td>
                        <td className="px-5 py-3 text-gray-500">{formatDate(purchase.createdAt)}</td>
                        <td className="px-5 py-3 font-semibold text-gray-800">
                          {formatCurrency(tx?.amount, tx?.currency)}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[9.5px] font-extrabold uppercase ${
                              purchase.status === "active"
                                ? "bg-emerald-50 text-emerald-600"
                                : purchase.status === "queued"
                                ? "bg-blue-50 text-blue-600"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {purchase.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right font-mono text-[11px] text-gray-400">
                          {tx?.razorpayPaymentId || "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// CONTACT US PANEL
// ==========================================
function ContactPanel() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [statusMessage, setStatusMessage] = useState("");
  const [form, setForm] = useState<ContactInput>(() => ({
    name: user?.name || "",
    email: user?.email || "",
    company: "",
    country: "Indonesia",
    message: "",
  }));

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
      setStatusMessage("Please complete all required fields.");
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
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="max-w-xl">
          <h2 className="text-lg font-extrabold text-gray-900">Get in touch with support</h2>
          <p className="mt-1 text-xs text-gray-500">
            Have questions about custom component licenses, enterprise team access, or bugs? We respond within 24h.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 max-w-2xl">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="text-xs font-semibold text-gray-700">
              Full Name <span className="text-rose-500">*</span>
              <input
                className="mt-1 h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-800 outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]"
                placeholder="Julia William"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </label>
            <label className="text-xs font-semibold text-gray-700">
              Work Email <span className="text-rose-500">*</span>
              <input
                type="email"
                className="mt-1 h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-800 outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </label>
            <label className="text-xs font-semibold text-gray-700">
              Company
              <input
                className="mt-1 h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-800 outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]"
                placeholder="Company Ltd."
                value={form.company || ""}
                onChange={(e) => handleChange("company", e.target.value)}
              />
            </label>
            <label className="text-xs font-semibold text-gray-700">
              Country <span className="text-rose-500">*</span>
              <select
                className="mt-1 h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-800 outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]"
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

          <label className="text-xs font-semibold text-gray-700">
            Message <span className="text-rose-500">*</span>
            <textarea
              className="mt-1 min-h-[120px] w-full resize-none rounded-lg border border-gray-200 bg-white p-3 text-xs text-gray-800 outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]"
              placeholder="Describe what you need..."
              value={form.message}
              onChange={(e) => handleChange("message", e.target.value)}
            />
          </label>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="h-9 rounded-lg bg-[#F97316] px-5 text-xs font-semibold text-white shadow-sm hover:bg-[#EA580C] disabled:opacity-60 cursor-pointer"
            >
              {createMutation.isPending ? "Sending..." : "Send Message"}
            </button>
          </div>
        </form>
      </div>

      {/* Floating Bottom-Right Toast Popup */}
      <ToastPopup message={statusMessage} onClose={() => setStatusMessage("")} />

      {/* Ticket History */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 bg-[#F8F9FA]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Submitted Inquiries</h3>
        </div>
        {historyLoading ? (
          <div className="py-10 text-center text-xs text-gray-400">Loading history...</div>
        ) : !history || history.length === 0 ? (
          <div className="py-10 text-center text-xs text-gray-400">No previous messages found.</div>
        ) : (
          <div className="divide-y divide-gray-100 text-xs">
            {history.map((h) => (
              <div key={h._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-gray-800">{h.message}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{new Date(h.createdAt).toLocaleString()}</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-gray-100 text-gray-600 w-fit">
                  {h.status || "Received"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// OVERVIEW CRM DASHBOARD (CONCEPTZILLA EXACT)
// ==========================================
// OVERVIEW PANEL (ACTIVE PLAN, STATS, CHART, CRM)
// ==========================================
function OverviewPanel({
  user,
  subscription,
  isPro,
  isPremiumPlus,
  componentCountUsed,
  maxComponents,
  daysLeft,
  durationDays,
  queuedCount,
}: {
  user: { name: string; email: string };
  subscription: CurrentSubscriptionData | null;
  isPro: boolean;
  isPremiumPlus: boolean;
  componentCountUsed: number;
  maxComponents: number;
  daysLeft: number;
  durationDays: number;
  queuedCount: number;
}) {
  const [selectedPeriod, setSelectedPeriod] = useState<"current" | "lifetime">("current");
  const [chartRange, setChartRange] = useState<"7 d" | "30 d" | "90 d" | "Month">("30 d");

  return (
    <div className="space-y-4">
      
      {/* Queued plans notification banner */}
      {queuedCount > 0 && (
        <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <p className="text-xs font-semibold text-blue-800">
              You have {queuedCount} queued plan{queuedCount > 1 ? "s" : ""} waiting to be activated.
              {isPremiumPlus ? " Premium+ is active, so queued plans will activate after it expires." : ""}
            </p>
            <Link
              href="/dashboard?page=plans-billing"
              className="shrink-0 text-xs font-bold text-blue-600 hover:text-blue-800 underline"
            >
              View in Plans & Billing →
            </Link>
          </div>
        </div>
      )}

      {/* TOP ROW: ACTIVE PLAN & TEAM DETAILS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        
        {/* Active Plan Card */}
        <div className="rounded-xl border border-gray-200/90 bg-white p-4 shadow-sm flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active Plan</span>
              <h2 className="text-lg font-black text-gray-900 mt-1">
                {isPro ? (subscription?.plan?.displayName || "Pro Plan") : "Free Plan"}
              </h2>
            </div>
            
            {!isPremiumPlus && (
              <Link 
                href="/pricing"
                className="flex items-center gap-1 text-xs font-bold text-[#F97316] hover:text-[#EA580C] transition"
              >
                Upgrade Plan
                <ArrowUpRight size={13} />
              </Link>
            )}
          </div>

          <div className="text-xs font-semibold text-gray-400 pt-3 border-t border-gray-100">
            {isPro && subscription?.endDate ? (
              <span className="flex items-center gap-1.5 text-emerald-600 text-[11px] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active subscription expires {formatDDMMYYYY(subscription.endDate)}
              </span>
            ) : (
              <span className="text-[11px]">No active subscription</span>
            )}
          </div>
        </div>

        {/* Team Details Card */}
        <div className="rounded-xl border border-gray-200/90 bg-white p-4 shadow-sm flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                {user.name.split(" ")[0]}&apos;s Team
              </span>
            </div>
            <span className="text-[9.5px] font-extrabold uppercase bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">
              {isPro ? "Pro" : "Free"}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
            <div>
              <span className="text-[9.5px] text-gray-400 font-bold block uppercase tracking-wider">Seats</span>
              <span className="text-xs font-bold text-gray-800 mt-0.5 block">1 out of 1</span>
            </div>
            <div>
              <span className="text-[9.5px] text-gray-400 font-bold block uppercase tracking-wider">Components</span>
              <span className="text-xs font-bold text-gray-800 mt-0.5 block">
                {isPro ? `${maxComponents}/mo` : "0/mo"}
              </span>
            </div>
            <div>
              <span className="text-[9.5px] text-gray-400 font-bold block uppercase tracking-wider">Templates</span>
              <span className="text-xs font-bold text-gray-800 mt-0.5 block">0/mo</span>
            </div>
          </div>
        </div>

      </div>

      {/* PERIOD SELECTION BAR & RESET INDICATOR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 pb-0.5">
        <div className="flex gap-1 p-0.5 bg-white border border-gray-200 rounded-lg w-fit shadow-sm">
          <button
            onClick={() => setSelectedPeriod("current")}
            className={`px-3 py-1 text-xs font-bold rounded-md transition cursor-pointer ${
              selectedPeriod === "current"
                ? "bg-[#F97316]/10 text-[#F97316]"
                : "text-gray-400 hover:text-gray-700"
            }`}
          >
            Current Period
          </button>
          <button
            onClick={() => setSelectedPeriod("lifetime")}
            className={`px-3 py-1 text-xs font-bold rounded-md transition cursor-pointer ${
              selectedPeriod === "lifetime"
                ? "bg-[#F97316]/10 text-[#F97316]"
                : "text-gray-400 hover:text-gray-700"
            }`}
          >
            Lifetime Total
          </button>
        </div>
        
        {isPro && subscription?.endDate && (
          <span className="text-[11px] text-gray-400 font-medium italic">
            * Limits reset on {new Date(subscription.endDate).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        )}
      </div>

      {/* 4 USAGE METRIC CARDS WITH SPARKLINE CHARTS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        
        {/* Metric 1: Components Copied */}
        <div className="rounded-xl border border-gray-200/90 bg-white p-3.5 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Components Copied</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-black tracking-tight text-gray-900">
                  {String(componentCountUsed).padStart(2, "0")}
                </span>
                <span className="inline-flex items-center text-[10px] font-bold text-[#10B981]">
                  <TrendingUp size={11} className="mr-0.5" /> 12%
                </span>
              </div>
            </div>
            <Sparkline points={[2, 4, 3, 6, 8, 7, componentCountUsed || 5]} color="#F97316" />
          </div>
          <span className="text-[10px] font-medium text-gray-400 mt-2 block">
            out of {isPro ? maxComponents : "0"}
          </span>
        </div>

        {/* Metric 2: Templates Unlocked */}
        <div className="rounded-xl border border-gray-200/90 bg-white p-3.5 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Templates Unlocked</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-black tracking-tight text-gray-900">00</span>
                <span className="inline-flex items-center text-[10px] font-bold text-gray-400">
                  0%
                </span>
              </div>
            </div>
            <Sparkline points={[0, 0, 0, 0, 0, 0, 0]} color="#94A3B8" />
          </div>
          <span className="text-[10px] font-medium text-gray-400 mt-2 block">
            out of 0
          </span>
        </div>

        {/* Metric 3: Days Remaining */}
        <div className="rounded-xl border border-gray-200/90 bg-white p-3.5 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Days Remaining</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-black tracking-tight text-gray-900">
                  {String(daysLeft).padStart(2, "0")}
                </span>
                <span className="inline-flex items-center text-[10px] font-bold text-[#10B981]">
                  <TrendingUp size={11} className="mr-0.5" /> 15%
                </span>
              </div>
            </div>
            <Sparkline points={[30, 26, 22, 18, 14, 10, daysLeft || 8]} color="#F97316" />
          </div>
          <span className="text-[10px] font-medium text-gray-400 mt-2 block">
            out of {isPro ? durationDays : "0"} total days
          </span>
        </div>

        {/* Metric 4: Library Access */}
        <div className="rounded-xl border border-gray-200/90 bg-white p-3.5 shadow-sm flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Library Access</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-black tracking-tight text-gray-900">
                  {isPro ? "01" : "00"}
                </span>
                <span className="inline-flex items-center text-[10px] font-bold text-emerald-600">
                  Active
                </span>
              </div>
            </div>
            <Sparkline points={[1, 1, 1, 1, 1, 1, 1]} color="#F97316" />
          </div>
          <span className="text-[10px] font-medium text-gray-400 mt-2 block">
            active libraries
          </span>
        </div>

      </div>

      {/* ACTIVITY & COMPONENT USAGE GRAPH */}
      <div className="rounded-xl border border-gray-200/90 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-1 p-0.5 bg-gray-50 border border-gray-200 rounded-lg w-fit">
            {(["7 d", "30 d", "90 d", "Month"] as const).map((d) => (
              <button 
                key={d}
                onClick={() => setChartRange(d)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition cursor-pointer ${
                  chartRange === d
                    ? "bg-[#F97316]/10 text-[#F97316]"
                    : "text-gray-400 hover:text-gray-700"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          <span className="text-xs font-semibold text-gray-400">Activity Overview &middot; Last 30 days</span>
        </div>

        {/* SVG line chart mimic with orange theme */}
        <div className="h-44 w-full relative flex flex-col justify-between pt-2">
          
          {/* grid lines */}
          <div className="w-full border-b border-gray-100 flex justify-between text-[10px] text-gray-300 font-bold pb-1">
            <span>4</span>
          </div>
          <div className="w-full border-b border-gray-100 flex justify-between text-[10px] text-gray-300 font-bold pb-1">
            <span>3</span>
          </div>
          <div className="w-full border-b border-gray-100 flex justify-between text-[10px] text-gray-300 font-bold pb-1">
            <span>2</span>
          </div>
          <div className="w-full border-b border-gray-100 flex justify-between text-[10px] text-gray-300 font-bold pb-1">
            <span>1</span>
          </div>
          
          {/* Orange graph line with data dots */}
          <div className="absolute inset-x-0 bottom-6 h-0.5 bg-[#F97316]">
            <div className="absolute left-[5%] bottom-[-3px] w-2 h-2 rounded-full bg-[#F97316] border-2 border-white shadow-sm" />
            <div className="absolute left-[20%] bottom-[-3px] w-2 h-2 rounded-full bg-[#F97316] border-2 border-white shadow-sm" />
            <div className="absolute left-[35%] bottom-[-3px] w-2 h-2 rounded-full bg-[#F97316] border-2 border-white shadow-sm" />
            <div className="absolute left-[50%] bottom-[-3px] w-2 h-2 rounded-full bg-[#F97316] border-2 border-white shadow-sm" />
            <div className="absolute left-[65%] bottom-[-3px] w-2 h-2 rounded-full bg-[#F97316] border-2 border-white shadow-sm" />
            <div className="absolute left-[80%] bottom-[-3px] w-2 h-2 rounded-full bg-[#F97316] border-2 border-white shadow-sm" />
            <div className="absolute left-[95%] bottom-[-3px] w-2 h-2 rounded-full bg-[#F97316] border-2 border-white shadow-sm" />
          </div>

          {/* dates label row */}
          <div className="flex justify-between text-[10px] text-gray-400 font-medium mt-2 pt-1 border-t border-gray-100">
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

    </div>
  );
}

// ==========================================
// MAIN DASHBOARD LAYOUT
// ==========================================
function DashboardContent() {
  const { user, loading: authLoading, isInitialized, setLoginModalOpen, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Sidebar tab state: Overview, My Components, Favorites, Plans & Billing, Contact Us
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
    } else {
      window.setTimeout(() => setActiveTab("Overview"), 0);
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

  const subscription = subscriptionResponse || null;
  const isPro = !!subscription && subscription.status === "active";
  const componentCountUsed = subscription?.componentCountUsed ?? 0;
  const maxComponents = subscription?.maxComponents ?? 0;

  // Check if Premium+ / unlimited plan
  const isPremiumPlus = isPro && (
    subscription?.plan?.name === "premium_plus" ||
    subscription?.plan?.displayName?.toLowerCase().replace(/\s+/g, '').includes("premium+") ||
    maxComponents >= 999999
  );

  let daysLeft = 0;
  let durationDays = 0;
  if (subscription && subscription.endDate) {
    daysLeft = getDaysLeft(subscription.endDate);
    durationDays = subscription.plan?.durationDays ?? 30;
  }

  // Sidebar links requested:
  // Overview, My Components, Favorites, Plans & Billing, Contact Us
  const mainNavItems = [
    { label: "Overview", icon: LayoutDashboard },
    { label: "My Components", icon: Package },
    { label: "Favorites", icon: Heart },
  ];

  const secondaryNavItems = [
    { label: "Plans & Billing", icon: CreditCard },
    { label: "Contact Us", icon: Mail, badge: "1" },
  ];

  // Page Header Title + Count
  const getHeaderTitle = () => {
    if (activeTab === "Overview") return { title: "Overview", count: isPro ? "Pro Member" : "Free Plan" };
    if (activeTab === "My Components") return { title: "My Components", count: "Library" };
    if (activeTab === "Favorites") return { title: "Favorites", count: "Saved" };
    if (activeTab === "Plans & Billing") return { title: "Plans & Billing", count: isPro ? "Pro" : "Free" };
    if (activeTab === "Contact Us") return { title: "Contact Us", count: "Support" };
    return { title: "Dashboard", count: "" };
  };

  const headerInfo = getHeaderTitle();

  // Helper to format human-readable relative time
  function formatRelativeTime(dateString?: string) {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (isNaN(diffMs) || diffMs < 0) return "Just now";
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSec < 60) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  // Fetch user uploaded components for status updates & verification notifications with live polling
  const { data: userComponentsData } = useQuery({
    queryKey: ["my-components", "status-notifications"],
    queryFn: () => componentsApi.listMine("", 1, 50),
    enabled: !!user,
    staleTime: 0,
    refetchInterval: 3000, // Poll every 3 seconds for instant real-time verification updates
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  });

  const [liveToast, setLiveToast] = useState<{
    title?: string;
    message: string;
    type: "error" | "warning" | "info";
    actionLabel?: string;
    actionLink?: string;
  } | null>(null);
  const previouslyKnownRejectionsRef = useRef<Set<string>>(new Set());
  const isFirstLoadRef = useRef(true);

  // Notifications State & Logic
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState<"all" | "unread">("all");
  const notificationRef = useRef<HTMLDivElement | null>(null);

  // Profile Navbar Menu State
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  // Dark / Light Theme Toggle State
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const isDark =
      savedTheme === "dark" ||
      (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
      return next;
    });
  };

  const [notifications, setNotifications] = useState<
    Array<{
      id: string;
      title: string;
      message: string;
      time: string;
      read: boolean;
      type: "plan" | "credits" | "component" | "system" | "rejection";
      link?: string;
    }>
  >([
    ...(queuedCount > 0
      ? [
          {
            id: "queued-plan",
            title: "Queued Plan Ready",
            message: `You have ${queuedCount} plan(s) waiting to be activated.`,
            time: "Just now",
            read: false,
            type: "plan" as const,
            link: "/dashboard?page=plans-billing",
          },
        ]
      : []),
    {
      id: "active-plan-status",
      title: isPro ? `${subscription?.plan?.displayName || "Pro Plan"} Active` : "Free Plan Active",
      message: isPro
        ? `Your plan expires in ${daysLeft} days. ${componentCountUsed}/${maxComponents} component copies used.`
        : "Upgrade to Pro to unlock unlimited premium components.",
      time: "10m ago",
      read: false,
      type: "credits" as const,
      link: isPro ? "/dashboard?page=plans-billing" : "/pricing",
    },
    {
      id: "lib-update-notif",
      title: "New UI Components Added",
      message: "10+ new hero sections, navbars, and cards added to the library.",
      time: "2h ago",
      read: false,
      type: "component" as const,
      link: "/components",
    },
    {
      id: "figma-connected",
      title: "Figma Clipboard Engine Active",
      message: "Single-click copy to Figma is enabled and ready to paste.",
      time: "1d ago",
      read: true,
      type: "system" as const,
    },
  ]);

  // Synchronize rejected components into notifications box instantly without reload
  useEffect(() => {
    if (!userComponentsData?.items) return;

    const currentItems = userComponentsData.items;
    const rejectedItems = currentItems.filter((comp) => comp.status === "rejected");
    const nonRejectedIds = new Set(
      currentItems.filter((comp) => comp.status !== "rejected").map((c) => c._id)
    );

    // Show warning in the bottom right corner when a component is rejected
    if (!isFirstLoadRef.current) {
      for (const item of rejectedItems) {
        if (!previouslyKnownRejectionsRef.current.has(item._id)) {
          setLiveToast({
            title: "Verification Rejected",
            message: item.rejectionReason
              ? `"${item.name}" was rejected: ${item.rejectionReason}`
              : `"${item.name}" was not approved during review. Click to edit and resubmit.`,
            type: "error",
            actionLabel: "Edit Component",
            actionLink: `/dashboard?page=my-components&edit=${item._id}`,
          });
          break;
        }
      }
    } else if (rejectedItems.length > 0) {
      // If rejected components exist on page load, show bottom-right warning notice
      const firstRejected = rejectedItems[0];
      setLiveToast({
        title: "Component Verification Notice",
        message: firstRejected.rejectionReason
          ? `"${firstRejected.name}" was rejected: ${firstRejected.rejectionReason}`
          : `${rejectedItems.length} of your uploaded component${
              rejectedItems.length > 1 ? "s were" : " was"
            } rejected during verification.`,
        type: "warning",
        actionLabel: "Review in Library",
        actionLink: `/dashboard?page=my-components&edit=${firstRejected._id}`,
      });
    }

    previouslyKnownRejectionsRef.current = new Set(rejectedItems.map((c) => c._id));
    isFirstLoadRef.current = false;

    setNotifications((prev) => {
      // Clean up notifications for components that are no longer rejected
      const filtered = prev.filter((n) => {
        if (!n.id.startsWith("rejected-comp-")) return true;
        const compId = n.id.replace("rejected-comp-", "");
        return !nonRejectedIds.has(compId);
      });

      const existingIds = new Set(filtered.map((n) => n.id));
      const newNotifs = rejectedItems
        .filter((c) => !existingIds.has(`rejected-comp-${c._id}`))
        .map((c) => ({
          id: `rejected-comp-${c._id}`,
          title: `Verification Rejected: ${c.name}`,
          message: c.rejectionReason
            ? `Reason: ${c.rejectionReason}`
            : `Your component "${c.name}" was rejected during verification. Click to edit and resubmit.`,
          time: formatRelativeTime(c.updatedAt || c.createdAt),
          read: false,
          type: "rejection" as const,
          link: `/dashboard?page=my-components&edit=${c._id}`,
        }));

      if (newNotifs.length === 0 && filtered.length === prev.length) return prev;
      return [...newNotifs, ...filtered];
    });
  }, [userComponentsData]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    if (notificationsOpen || userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notificationsOpen, userMenuOpen]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markOneAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const removeNotification = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const displayedNotifications = useMemo(() => {
    if (notificationFilter === "unread") {
      return notifications.filter((n) => !n.read);
    }
    return notifications;
  }, [notifications, notificationFilter]);

  // Loading States
  if (!isInitialized || authLoading || (user && subLoading)) {
    return (
      <div
        className="fixed inset-0 z-[999] h-screen w-screen flex min-h-screen flex-col items-center justify-center gap-3 transition-colors duration-150 bg-[#FAFAFB] dark:bg-[#000000] text-[#1E293B] dark:text-[#EDEDED]"
      >
        <Loader2 className="h-9 w-9 animate-spin text-[#F97316]" />
        <p className="font-medium text-xs text-gray-500 dark:text-neutral-400">
          Loading dashboard...
        </p>
      </div>
    );
  }

  // Not logged in state
  if (!user) {
    return (
      <div
        className="min-h-screen h-screen w-screen fixed inset-0 z-[999] flex items-center justify-center p-6 bg-[#FAFAFB] dark:bg-[#000000] text-[#1E293B] dark:text-[#EDEDED]"
      >
        <div className="max-w-md w-full rounded-2xl bg-white dark:bg-[#121316] p-8 shadow-xl border border-gray-200 dark:border-neutral-800 text-center">
          <div className="w-14 h-14 bg-orange-50 dark:bg-orange-950/80 rounded-2xl flex items-center justify-center text-[#F97316] mx-auto mb-4">
            <ShieldCheck size={28} />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Sign in to Access Dashboard</h1>
          <p className="text-gray-500 dark:text-neutral-400 text-xs mb-6 leading-relaxed">
            Please log in to manage your components, access saved favorites, manage billing tiers, and copy assets.
          </p>
          <button
            type="button"
            onClick={() => setLoginModalOpen(true)}
            className="w-full bg-[#F97316] text-white py-2.5 rounded-xl text-xs font-bold hover:bg-[#EA580C] transition shadow-md shadow-orange-500/20 active:scale-95 cursor-pointer"
          >
            Sign In with Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`dashboard-container h-screen max-h-screen w-full flex flex-col md:flex-row font-sans antialiased overflow-hidden transition-colors duration-200 ${
        isDarkMode
          ? "dark bg-[#000000] text-[#EDEDED]"
          : "bg-[#FAFAFB] text-[#1E293B]"
      }`}
    >
      
      {/* ==========================================
          LEFT SIDEBAR (CONCEPTZILLA STYLE)
          ========================================== */}
      <aside className="w-full md:w-[250px] lg:w-[260px] bg-[#FDFDFE] border-r border-gray-200/90 p-4 flex flex-col justify-between shrink-0 select-none md:h-full overflow-y-auto">
        <div>
          {/* Brand Logo & Name */}
          <div className="flex items-center justify-between gap-2.5 pb-4 mb-3 border-b border-gray-100">
            <Link href="/" className="flex items-center gap-2 hover:opacity-85 transition">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/logo.svg"
                alt="UI Things"
                className={`h-7 w-auto object-contain transition ${isDarkMode ? "invert-0" : "invert"}`}
              />
            </Link>
            <ChevronDown size={14} className="text-gray-400 cursor-pointer hover:text-gray-600" />
          </div>


          {/* SALES OPERATIONS / MAIN NAV */}
          <div className="mb-4">
            <span className="px-2 text-[9.5px] font-bold tracking-wider text-gray-400 uppercase">
              Sales Operations
            </span>
            <nav className="mt-1 space-y-0.5">
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.label;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleSidebarSelect(item.label)}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                      isActive
                        ? "bg-[#F3F4F6] text-gray-900 font-bold"
                        : "text-gray-600 hover:bg-gray-100/70 hover:text-gray-900"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        size={15}
                        className={isActive ? "text-gray-900" : "text-gray-400"}
                      />
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* INSIGHTS & MANAGEMENT NAV */}
          <div className="mb-4">
            <span className="px-2 text-[9.5px] font-bold tracking-wider text-gray-400 uppercase">
              Insights & Management
            </span>
            <nav className="mt-1 space-y-0.5">
              {secondaryNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.label;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleSidebarSelect(item.label)}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                      isActive
                        ? "bg-[#F3F4F6] text-gray-900 font-bold"
                        : "text-gray-600 hover:bg-gray-100/70 hover:text-gray-900"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        size={15}
                        className={isActive ? "text-gray-900" : "text-gray-400"}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="rounded bg-gray-200 px-1.5 py-0.2 text-[9.5px] font-bold text-gray-600">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* SUPPORT & PREFERENCES */}
          <div>
            <span className="px-2 text-[9.5px] font-bold tracking-wider text-gray-400 uppercase">
              Support
            </span>
            <nav className="mt-1 space-y-0.5">

              <Link
                href="/faq"
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100/70 hover:text-gray-900"
              >
                <HelpCircle size={14} className="text-gray-400" />
                <span>Help Center</span>
              </Link>

              <Link
                href="/"
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100/70 hover:text-gray-900"
              >
                <ArrowLeft size={14} className="text-gray-400" />
                <span>Back to Home</span>
              </Link>
            </nav>
          </div>
        </div>

        {/* BOTTOM PROFILE CARD (EXACT USER AVATAR + ONLINE BADGE) */}
        <div className="pt-4 border-t border-gray-100 mt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="h-8 w-8 rounded-full bg-[#1E293B] text-white flex items-center justify-center font-bold text-xs overflow-hidden">
                  {user.profilePicture ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.profilePicture}
                      alt={user.name}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    user.name.slice(0, 2).toUpperCase()
                  )}
                </div>
                {/* Green online indicator */}
                <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
              </div>
              <div className="truncate max-w-[130px]">
                <p className="text-xs font-bold text-gray-900 truncate leading-tight">{user.name}</p>
                <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
              </div>
            </div>

            <button
              onClick={logout}
              title="Log Out"
              className="p-1 text-gray-400 hover:text-rose-500 rounded transition cursor-pointer"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* ==========================================
          MAIN CONTENT AREA (WITH FIXED NAVBAR)
          ========================================== */}
      <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden bg-[#FAFAFB]">
        
        {/* FIXED TOPBAR HEADER */}
        <header className="sticky top-0 z-30 shrink-0 bg-white/95 backdrop-blur-md border-b border-gray-200/80 px-4 lg:px-6 py-3.5 flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          {/* Title & Count */}
          <div className="flex items-baseline gap-2">
            <h1 className="text-lg font-black text-gray-900 tracking-tight">{headerInfo.title}</h1>
            {headerInfo.count && (
              <span className="text-xs font-semibold text-gray-400">{headerInfo.count}</span>
            )}
          </div>

          {/* Right Tools & Stacked Avatars & Share CTA */}
          <div className="flex items-center gap-3">
            {/* Quick utility icons */}
            <div className="hidden sm:flex items-center gap-1 text-gray-400">
              <button
                type="button"
                onClick={() => router.push("/faq")}
                className="p-1.5 rounded-lg hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
                title="Help & Info"
              >
                <Info size={15} />
              </button>

              {/* Notification Bell Button & Popover */}
              <div ref={notificationRef} className="relative">
                <button
                  type="button"
                  onClick={() => setNotificationsOpen((prev) => !prev)}
                  className={`relative p-1.5 rounded-lg transition cursor-pointer ${
                    notificationsOpen
                      ? "bg-orange-50 text-[#F97316]"
                      : "hover:text-gray-700 hover:bg-gray-100 text-gray-400"
                  }`}
                  title="Notifications"
                  aria-label="Toggle notifications"
                >
                  <Bell size={15} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F97316] opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F97316]" />
                    </span>
                  )}
                </button>

                {/* Dropdown Popover */}
                {notificationsOpen && (
                  <div className="absolute right-0 top-10 z-50 w-80 sm:w-96 rounded-2xl bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-200/90 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 text-left">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-[#FAFAFB]">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                          <span className="rounded-full bg-orange-100 text-[#EA580C] px-2 py-0.2 text-[10px] font-extrabold">
                            {unreadCount} new
                          </span>
                        )}
                      </div>

                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={markAllAsRead}
                          className="text-[11px] font-semibold text-[#F97316] hover:text-[#EA580C] transition cursor-pointer"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-2 px-4 pt-2.5 pb-1.5 border-b border-gray-100 bg-white">
                      <button
                        onClick={() => setNotificationFilter("all")}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition cursor-pointer ${
                          notificationFilter === "all"
                            ? "bg-gray-100 text-gray-900"
                            : "text-gray-400 hover:text-gray-600"
                        }`}
                      >
                        All ({notifications.length})
                      </button>
                      <button
                        onClick={() => setNotificationFilter("unread")}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition cursor-pointer ${
                          notificationFilter === "unread"
                            ? "bg-gray-100 text-gray-900"
                            : "text-gray-400 hover:text-gray-600"
                        }`}
                      >
                        Unread ({unreadCount})
                      </button>
                    </div>

                    {/* Notification Items List */}
                    <div className="max-h-[320px] overflow-y-auto divide-y divide-gray-100">
                      {displayedNotifications.length === 0 ? (
                        <div className="py-10 text-center text-xs text-gray-400 flex flex-col items-center justify-center gap-2">
                          <Bell size={24} className="text-gray-300" />
                          <span>No notifications at this time</span>
                        </div>
                      ) : (
                        displayedNotifications.map((n) => {
                          const isRejection = n.type === "rejection";
                          const getIcon = () => {
                            if (isRejection) return <XCircle size={14} className="text-rose-600" />;
                            if (n.type === "plan") return <ShieldCheck size={14} className="text-blue-600" />;
                            if (n.type === "credits") return <CreditCard size={14} className="text-amber-600" />;
                            if (n.type === "component") return <Package size={14} className="text-[#F97316]" />;
                            return <Sparkles size={14} className="text-emerald-600" />;
                          };

                          return (
                            <div
                              key={n.id}
                              onClick={() => {
                                markOneAsRead(n.id);
                                if (n.link) {
                                  router.push(n.link);
                                  setNotificationsOpen(false);
                                }
                              }}
                              className={`p-3.5 flex items-start gap-3 transition cursor-pointer ${
                                isRejection && !n.read
                                  ? "bg-rose-50/50 hover:bg-rose-50/80 border-l-2 border-rose-500"
                                  : isRejection
                                  ? "bg-rose-50/20 hover:bg-rose-50/50"
                                  : !n.read
                                  ? "bg-orange-50/20 hover:bg-orange-50/40"
                                  : "hover:bg-gray-50/80"
                              }`}
                            >
                              <div
                                className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                                  isRejection ? "bg-rose-100/70" : "bg-gray-100"
                                }`}
                              >
                                {getIcon()}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <h4
                                      className={`text-xs truncate ${
                                        isRejection
                                          ? "font-bold text-rose-950"
                                          : !n.read
                                          ? "font-bold text-gray-900"
                                          : "font-semibold text-gray-700"
                                      }`}
                                    >
                                      {n.title}
                                    </h4>
                                    {isRejection && (
                                      <span className="shrink-0 rounded bg-rose-100 px-1.5 py-0.2 text-[9px] font-extrabold text-rose-700">
                                        Rejected
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-gray-400 shrink-0">{n.time}</span>
                                </div>
                                <p
                                  className={`text-[11px] mt-0.5 leading-snug line-clamp-2 ${
                                    isRejection ? "text-rose-800/80" : "text-gray-500"
                                  }`}
                                >
                                  {n.message}
                                </p>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0 self-center">
                                {!n.read && (
                                  <span
                                    className={`h-2 w-2 rounded-full ${
                                      isRejection ? "bg-rose-500" : "bg-[#F97316]"
                                    }`}
                                  />
                                )}
                                <button
                                  type="button"
                                  onClick={(e) => removeNotification(n.id, e)}
                                  className="p-1 text-gray-300 hover:text-gray-600 rounded transition cursor-pointer"
                                  title="Dismiss"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                      <div className="px-4 py-2.5 bg-[#FAFAFB] border-t border-gray-100 flex items-center justify-between text-[11px]">
                        <button
                          type="button"
                          onClick={clearAllNotifications}
                          className="text-gray-400 hover:text-red-500 transition cursor-pointer font-medium"
                        >
                          Clear all
                        </button>
                        <Link
                          href="/dashboard?page=plans-billing"
                          onClick={() => setNotificationsOpen(false)}
                          className="text-[#F97316] font-semibold hover:underline"
                        >
                          Manage subscription →
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Dark / Light Mode Toggle Button */}
              <button
                type="button"
                onClick={toggleTheme}
                className="p-1.5 rounded-lg hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer text-gray-400"
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDarkMode ? (
                  <Sun size={15} className="text-amber-500" />
                ) : (
                  <Moon size={15} />
                )}
              </button>
            </div>

            {/* Vertical separator */}
            <div className="h-4 w-px bg-gray-200 hidden sm:block" />

            {/* User Profile Pill in Navbar */}
            <div ref={userMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className={`flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl transition cursor-pointer border ${
                  userMenuOpen
                    ? "bg-gray-100/90 border-gray-300 shadow-sm"
                    : "hover:bg-gray-50/90 border-gray-200/90 bg-white shadow-xs"
                }`}
                aria-label="User Profile Menu"
              >
                <div className="relative shrink-0">
                  <div className="h-7 w-7 rounded-full bg-[#1E293B] text-white flex items-center justify-center font-bold text-[11px] overflow-hidden shadow-inner">
                    {user.profilePicture ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.profilePicture}
                        alt={user.name}
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      user.name.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-1.5 ring-white" />
                </div>

                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold text-gray-900 leading-none truncate max-w-[120px]">
                    {user.name}
                  </p>
                  <span className="text-[9.5px] font-semibold text-gray-400 leading-none mt-0.5 block">
                    {isPro ? "Pro Member" : "Free Plan"}
                  </span>
                </div>

                <ChevronDown
                  size={12}
                  className={`text-gray-400 transition-transform duration-200 ${
                    userMenuOpen ? "rotate-180 text-gray-700" : ""
                  }`}
                />
              </button>

              {/* Profile Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 top-11 z-50 w-56 rounded-2xl bg-white shadow-[0_15px_40px_rgba(0,0,0,0.12)] border border-gray-200/90 py-2 animate-in fade-in slide-in-from-top-2 duration-150 text-left">
                  <div className="px-3.5 py-2 border-b border-gray-100">
                    <p className="text-xs font-bold text-gray-900 truncate">{user.name}</p>
                    <p className="text-[11px] text-gray-400 truncate mt-0.5">{user.email}</p>
                    <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-[#EA580C]">
                      <Sparkles size={11} />
                      <span>{isPro ? (subscription?.plan?.displayName || "Pro Plan") : "Free Tier"}</span>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        handleSidebarSelect("Overview");
                        setUserMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer"
                    >
                      <LayoutDashboard size={14} className="text-gray-400" />
                      <span>Overview</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleSidebarSelect("My Components");
                        setUserMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer"
                    >
                      <Package size={14} className="text-gray-400" />
                      <span>My Components</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleSidebarSelect("Plans & Billing");
                        setUserMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer"
                    >
                      <CreditCard size={14} className="text-gray-400" />
                      <span>Billing & Plans</span>
                    </button>
                  </div>

                  <div className="border-t border-gray-100 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="flex w-full items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    >
                      <LogOut size={14} className="text-rose-500" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* SCROLLABLE MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 min-h-0">
          {activeTab === "My Components" ? (
            <MyComponentsPanel />
          ) : activeTab === "Favorites" ? (
            <FavoriteComponentsPanel />
          ) : activeTab === "Plans & Billing" ? (
            <BillingPanel />
          ) : activeTab === "Contact Us" ? (
            <ContactPanel />
          ) : (
            <OverviewPanel
              user={user}
              subscription={subscription}
              isPro={isPro}
              isPremiumPlus={isPremiumPlus}
              componentCountUsed={componentCountUsed}
              maxComponents={maxComponents}
              daysLeft={daysLeft}
              durationDays={durationDays}
              queuedCount={queuedCount}
            />
          )}
        </main>

      </div>

      {/* Real-time Toast Popup Alert (Bottom Right Warning / Notice) */}
      <ToastPopup
        title={liveToast?.title}
        message={liveToast?.message || ""}
        onClose={() => setLiveToast(null)}
        type={liveToast?.type || "error"}
        actionLabel={liveToast?.actionLabel}
        onAction={
          liveToast?.actionLink
            ? () => router.push(liveToast.actionLink!)
            : undefined
        }
      />

    </div>
  );
}

function DashboardFallback() {
  return (
    <div
      className="fixed inset-0 z-[999] h-screen w-screen flex min-h-screen flex-col items-center justify-center gap-3 transition-colors bg-[#FAFAFB] dark:bg-[#000000] text-[#1E293B] dark:text-[#EDEDED]"
    >
      <Loader2 className="h-9 w-9 animate-spin text-[#F97316]" />
      <p className="text-xs font-medium text-gray-500 dark:text-neutral-400">
        Loading your dashboard...
      </p>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardFallback />}>
      <DashboardContent />
    </Suspense>
  );
}
