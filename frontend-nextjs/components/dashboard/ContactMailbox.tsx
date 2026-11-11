"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  ChevronDown,
  ChevronUp,
  CornerUpLeft,
  Inbox,
  Loader2,
  Mail,
  Plus,
  RefreshCw,
  Search,
  Send,
  SquarePen,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  contactApi,
  type ContactMessage,
  type ContactReply,
} from "@/api/contact";

const SUPPORT_LABEL = "uithings Support";

const COUNTRIES = [
  "Indonesia",
  "India",
  "United States",
  "United Kingdom",
  "Australia",
  "Canada",
  "Germany",
  "Singapore",
];

type FilterType = "all" | "sent";

function formatUpdatedTime(dateString?: string) {
  if (!dateString) return "Updated recently";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Updated recently";
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const timeStr = date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  if (isToday) {
    return `Updated ${timeStr}`;
  }
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `Updated ${monthNames[date.getMonth()]} ${date.getDate()}, ${timeStr}`;
}

function formatFullTime(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function parseCategoryAndTitle(rawSubject?: string, message?: string) {
  if (!rawSubject || !rawSubject.trim()) {
    return { category: "General", title: "General Inquiry" };
  }
  const trimmed = rawSubject.trim();
  const bracketMatch = trimmed.match(/^\[(.*?)\]\s*(.*)$/);
  if (bracketMatch) {
    return {
      category: bracketMatch[1] || "Meeting",
      title: bracketMatch[2] || trimmed,
    };
  }
  const text = `${trimmed} ${message || ""}`.toLowerCase();
  if (
    text.includes("meeting") ||
    text.includes("proposal") ||
    text.includes("call") ||
    text.includes("schedule")
  ) {
    return { category: "Meeting", title: trimmed };
  }
  if (
    text.includes("billing") ||
    text.includes("plan") ||
    text.includes("price") ||
    text.includes("subscription") ||
    text.includes("payment")
  ) {
    return { category: "Billing", title: trimmed };
  }
  if (
    text.includes("bug") ||
    text.includes("issue") ||
    text.includes("error") ||
    text.includes("problem")
  ) {
    return { category: "Support", title: trimmed };
  }
  if (text.includes("feedback") || text.includes("feature")) {
    return { category: "Feedback", title: trimmed };
  }
  return { category: "Meeting", title: trimmed };
}

function getReplies(thread?: ContactMessage | null): ContactReply[] {
  return thread?.replies ?? [];
}

function getLastReply(thread?: ContactMessage | null): ContactReply | null {
  const replies = getReplies(thread);
  return replies.length ? replies[replies.length - 1] : null;
}

function isUnread(thread?: ContactMessage | null) {
  return getReplies(thread).some(
    (reply) => reply.author === "admin" && !reply.readByUser,
  );
}

export function ContactMailbox() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isComposing, setIsComposing] = useState(false);

  // Compose State
  const [composeSubject, setComposeSubject] = useState("");
  const [composeMessage, setComposeMessage] = useState("");
  const [composeCompany, setComposeCompany] = useState("");
  const [composeCountry, setComposeCountry] = useState("United States");
  const [showExtraDetails, setShowExtraDetails] = useState(false);
  const [composeError, setComposeError] = useState("");

  // Reply State
  const [replyText, setReplyText] = useState("");
  const [notice, setNotice] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const { data: threads, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["contact-history"],
    queryFn: () => contactApi.listMine(),
    staleTime: 20 * 1000,
    refetchOnWindowFocus: true,
  });

  const items = useMemo(() => threads ?? [], [threads]);

  const filteredThreads = useMemo(() => {
    let result = items;
    if (filter === "sent") {
      result = items.filter((t) => t.status !== "replied");
    }
    const query = search.trim().toLowerCase();
    if (!query) return result;
    return result.filter((thread) => {
      const { category, title } = parseCategoryAndTitle(
        thread.subject,
        thread.message,
      );
      return [title, category, thread.message, thread.company, thread.country]
        .filter(Boolean)
        .some((val) => String(val).toLowerCase().includes(query));
    });
  }, [items, filter, search]);

  const activeId = useMemo(() => {
    if (selectedId && items.some((t) => t._id === selectedId)) {
      return selectedId;
    }
    return items[0]?._id ?? null;
  }, [selectedId, items]);

  const selectedThread = useMemo(
    () => items.find((thread) => thread._id === activeId) ?? null,
    [items, activeId],
  );

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  const markReadMutation = useMutation({
    mutationFn: (id: string) => contactApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-history"] });
    },
  });

  useEffect(() => {
    if (!selectedThread) return;
    if (!isUnread(selectedThread)) return;
    markReadMutation.mutate(selectedThread._id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedThread?._id]);

  const replyMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) =>
      contactApi.reply(id, body),
    onSuccess: () => {
      setReplyText("");
      setNotice({ type: "success", message: "Reply sent to support." });
      queryClient.invalidateQueries({ queryKey: ["contact-history"] });
    },
    onError: (error) => {
      setNotice({
        type: "error",
        message:
          error instanceof Error ? error.message : "Could not send your reply.",
      });
    },
  });

  const createMutation = useMutation({
    mutationFn: contactApi.create,
    onSuccess: (data) => {
      setIsComposing(false);
      setComposeSubject("");
      setComposeMessage("");
      setComposeError("");
      setNotice({
        type: "success",
        message: "Your request has been sent successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["contact-history"] });
      if (data?.id) {
        setSelectedId(data.id);
      }
    },
    onError: (error) => {
      setComposeError(
        error instanceof Error ? error.message : "Could not send your message.",
      );
      setNotice({
        type: "error",
        message:
          error instanceof Error ? error.message : "Could not send your message.",
      });
    },
  });

  const handleStartCompose = () => {
    setIsComposing(true);
    setComposeError("");
  };

  const handleCancelCompose = () => {
    setIsComposing(false);
    setComposeError("");
  };

  const handleSendCompose = () => {
    const trimmedMessage = composeMessage.trim();
    if (!trimmedMessage) {
      setComposeError("Please enter your message before sending.");
      return;
    }
    const finalSubject = composeSubject.trim()
      ? composeSubject.trim()
      : `Inquiry from ${user?.name || "User"}`;

    setComposeError("");
    createMutation.mutate({
      name: user?.name || "Pixelist",
      email: user?.email || "user@uithings.com",
      company: composeCompany.trim(),
      country: composeCountry,
      subject: finalSubject,
      message: trimmedMessage,
    });
  };

  return (
    <div className="w-full">
      {/* MAIN CONTAINER (DARK CARD MATCHING REFERENCE IMAGE) */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0c0c0e] p-5 md:p-6 lg:p-7 shadow-2xl min-h-[640px] flex flex-col">
        {/* TOP BAR / CONTROLS */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6">
          {/* Left: Filter Pills */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-neutral-400">Filter:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={`rounded-lg px-3.5 py-1 text-xs font-semibold transition cursor-pointer ${
                  filter === "all"
                    ? "border border-[#F97316] bg-[#1a1412] text-white"
                    : "border border-neutral-800 bg-transparent text-neutral-400 hover:text-white hover:border-neutral-700"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFilter("sent")}
                className={`rounded-lg px-3.5 py-1 text-xs font-semibold transition cursor-pointer ${
                  filter === "sent"
                    ? "border border-[#F97316] bg-[#1a1412] text-white"
                    : "border border-neutral-800 bg-transparent text-neutral-400 hover:text-white hover:border-neutral-700"
                }`}
              >
                Sent
              </button>
            </div>

            {/* Subtle Search Filter */}
            <div className="relative ml-2 hidden sm:block">
              <Search
                size={13}
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="h-7 w-32 md:w-44 rounded-lg border border-neutral-800 bg-[#141417] pl-8 pr-2.5 text-xs text-neutral-200 placeholder:text-neutral-500 outline-none transition focus:border-[#F97316] focus:w-52"
              />
            </div>
          </div>

          {/* Right: Compose or Send Button */}
          <div className="flex items-center gap-2.5 ml-auto">
            {isComposing ? (
              <>
                <button
                  type="button"
                  onClick={handleCancelCompose}
                  className="rounded-lg border border-neutral-800 bg-transparent px-3.5 py-1.5 text-xs font-medium text-neutral-400 hover:bg-neutral-800 hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendCompose}
                  disabled={createMutation.isPending}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#F97316] px-4 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#EA580C] active:scale-95 disabled:opacity-60 cursor-pointer"
                >
                  {createMutation.isPending ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Send size={13} />
                  )}
                  <span>Send</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => refetch()}
                  title="Refresh messages"
                  className="flex size-8 items-center justify-center rounded-lg border border-neutral-800 text-neutral-400 hover:bg-neutral-800 hover:text-white transition cursor-pointer"
                >
                  <RefreshCw
                    size={13}
                    className={isFetching ? "animate-spin text-[#F97316]" : ""}
                  />
                </button>
                <button
                  type="button"
                  onClick={handleStartCompose}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#F97316] px-4 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#EA580C] active:scale-95 cursor-pointer"
                >
                  <SquarePen size={13} />
                  <span>Compose</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* 2-COLUMN MAIN CONTENT (LEFT: LIST, RIGHT: DETAILS / COMPOSE) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0">
          {/* LEFT COLUMN: MESSAGE LIST */}
          <div
            className={`lg:col-span-5 xl:col-span-4 flex flex-col space-y-3 overflow-y-auto max-h-[600px] pr-1.5 ${
              isComposing && "hidden lg:flex"
            }`}
          >
            {isLoading ? (
              <div className="flex h-64 flex-col items-center justify-center gap-2 text-xs text-neutral-500">
                <Loader2 size={18} className="animate-spin text-[#F97316]" />
                <span>Loading messages...</span>
              </div>
            ) : filteredThreads.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-neutral-800 p-6 text-center">
                <div className="flex size-10 items-center justify-center rounded-full bg-neutral-900 text-neutral-500">
                  <Inbox size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-neutral-300">
                    {items.length === 0
                      ? "No messages yet"
                      : "No messages match your filter"}
                  </p>
                  <p className="mt-1 text-[11px] text-neutral-500">
                    {items.length === 0
                      ? "Start a discussion by clicking Compose above."
                      : "Try switching to 'All' or clearing search."}
                  </p>
                </div>
                {items.length === 0 && (
                  <button
                    type="button"
                    onClick={handleStartCompose}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#F97316] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#EA580C] transition cursor-pointer"
                  >
                    <Plus size={12} />
                    <span>Create message</span>
                  </button>
                )}
              </div>
            ) : (
              filteredThreads.map((thread) => {
                const isSelected = thread._id === activeId && !isComposing;
                const unread = isUnread(thread);
                const lastReply = getLastReply(thread);
                const snippet =
                  lastReply?.body || thread.message || "No content";
                const { category, title } = parseCategoryAndTitle(
                  thread.subject,
                  thread.message,
                );
                const updatedTime = formatUpdatedTime(
                  lastReply?.createdAt || thread.updatedAt || thread.createdAt,
                );

                return (
                  <div
                    key={thread._id}
                    onClick={() => {
                      setSelectedId(thread._id);
                      setIsComposing(false);
                    }}
                    className={`group relative rounded-xl p-4 transition text-left cursor-pointer ${
                      isSelected
                        ? "border-l-4 border-[#F97316] bg-[#1a1715]/95 shadow-md pl-3.5"
                        : "border-l-4 border-transparent hover:bg-neutral-900/60 pl-3.5"
                    }`}
                  >
                    {/* Header Row: Title & Tag Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {unread && (
                          <span className="size-2 rounded-full bg-[#F97316] shrink-0" />
                        )}
                        <h4
                          className={`truncate text-sm font-semibold transition ${
                            isSelected
                              ? "text-white"
                              : "text-neutral-200 group-hover:text-white"
                          }`}
                        >
                          {title}
                        </h4>
                      </div>
                      <span className="shrink-0 rounded-full bg-[#232330] px-2.5 py-0.5 text-[10.5px] font-medium text-[#9da5bd]">
                        {category}
                      </span>
                    </div>

                    {/* Preview Snippet */}
                    <p className="mt-2 line-clamp-1 truncate text-xs text-neutral-400 leading-relaxed">
                      {snippet}
                    </p>

                    {/* Timestamp */}
                    <div className="mt-3.5 flex items-center justify-between text-[11px] text-neutral-500 font-medium">
                      <span>{updatedTime}</span>
                      {getReplies(thread).length > 0 && (
                        <span className="text-[10px] text-neutral-400">
                          {getReplies(thread).length}{" "}
                          {getReplies(thread).length === 1
                            ? "reply"
                            : "replies"}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* RIGHT COLUMN: DETAIL VIEW OR COMPOSE WORKSPACE */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col min-h-[480px]">
            {isComposing ? (
              /* COMPOSE WORKSPACE (MATCHING IMAGE 1) */
              <div className="flex-1 rounded-2xl border border-white/[0.04] bg-[#121214] p-6 lg:p-8 flex flex-col justify-between">
                <div className="flex-1 flex flex-col">
                  {/* Subject Input */}
                  <div className="mt-0">
                    <input
                      value={composeSubject}
                      onChange={(e) => setComposeSubject(e.target.value)}
                      placeholder="Proposal Follow-up for Client A (or Subject)..."
                      className="w-full border-b border-neutral-800 bg-transparent pb-3 text-base font-semibold text-white placeholder:text-neutral-600 outline-none transition focus:border-[#F97316]"
                    />
                  </div>

                  {/* Message Body Textarea (Matching "Start typing your quaeres......") */}
                  <div className="flex-1 flex flex-col mt-4 min-h-[260px]">
                    <textarea
                      value={composeMessage}
                      onChange={(e) => {
                        setComposeMessage(e.target.value);
                        if (composeError) setComposeError("");
                      }}
                      placeholder="Start typing your quaeres......"
                      className="flex-1 w-full resize-none bg-transparent text-sm leading-relaxed text-neutral-200 placeholder:text-neutral-600 outline-none"
                    />
                  </div>

                  {/* Optional Metadata (Company, Country) */}
                  <div className="pt-3 border-t border-neutral-800/60">
                    <button
                      type="button"
                      onClick={() => setShowExtraDetails((prev) => !prev)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-400 hover:text-neutral-200 transition cursor-pointer"
                    >
                      <span>
                        {showExtraDetails
                          ? "Hide extra details"
                          : "+ Add company & country info"}
                      </span>
                      {showExtraDetails ? (
                        <ChevronUp size={12} />
                      ) : (
                        <ChevronDown size={12} />
                      )}
                    </button>

                    {showExtraDetails && (
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-medium text-neutral-400">
                            Company
                          </label>
                          <input
                            value={composeCompany}
                            onChange={(e) => setComposeCompany(e.target.value)}
                            placeholder="Your company name"
                            className="mt-1 h-8 w-full rounded-lg border border-neutral-800 bg-[#161619] px-2.5 text-xs text-neutral-200 outline-none focus:border-[#F97316]"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-medium text-neutral-400">
                            Country
                          </label>
                          <select
                            value={composeCountry}
                            onChange={(e) => setComposeCountry(e.target.value)}
                            className="mt-1 h-8 w-full rounded-lg border border-neutral-800 bg-[#161619] px-2.5 text-xs text-neutral-200 outline-none focus:border-[#F97316]"
                          >
                            {COUNTRIES.map((c) => (
                              <option key={c} value={c} className="bg-[#1a1a1e]">
                                {c}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Footer inside Compose */}
                {composeError && (
                  <p className="mt-3 text-xs font-medium text-rose-500">
                    {composeError}
                  </p>
                )}
                <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-500">
                  <span>Messages are emailed directly to our team.</span>
                  <button
                    type="button"
                    onClick={handleSendCompose}
                    disabled={createMutation.isPending}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#F97316] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#EA580C] active:scale-95 disabled:opacity-60 cursor-pointer"
                  >
                    {createMutation.isPending ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Send size={13} />
                    )}
                    <span>Send Message</span>
                  </button>
                </div>
              </div>
            ) : selectedThread ? (
              /* VIEWING SELECTED MESSAGE (MATCHING IMAGE 0) */
              <div className="flex-1 rounded-2xl border border-white/[0.04] bg-[#121214] p-6 lg:p-8 flex flex-col justify-between overflow-y-auto">
                <div className="space-y-6">
                  {/* Top: Title & Timestamp */}
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h2 className="text-lg lg:text-xl font-bold tracking-tight text-white">
                        {
                          parseCategoryAndTitle(
                            selectedThread.subject,
                            selectedThread.message,
                          ).title
                        }
                      </h2>
                      <span className="rounded-full bg-[#232330] px-3 py-1 text-xs font-medium text-[#9da5bd]">
                        {
                          parseCategoryAndTitle(
                            selectedThread.subject,
                            selectedThread.message,
                          ).category
                        }
                      </span>
                    </div>
                    <p className="mt-1 text-xs font-medium text-neutral-400">
                      {formatUpdatedTime(
                        selectedThread.updatedAt || selectedThread.createdAt,
                      )}
                    </p>
                  </div>

                  {/* Body Content */}
                  <div className="text-neutral-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedThread.message}
                  </div>

                  {/* Conversation Replies History (If any) */}
                  {getReplies(selectedThread).length > 0 && (
                    <div className="pt-6 border-t border-neutral-800/80 space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                        Activity & Replies
                      </h4>
                      {getReplies(selectedThread).map((reply, idx) => {
                        const fromAdmin = reply.author === "admin";
                        return (
                          <div
                            key={reply._id || idx}
                            className={`rounded-xl p-4 border ${
                              fromAdmin
                                ? "bg-[#181614] border-[#F97316]/30 text-neutral-200"
                                : "bg-[#161619] border-neutral-800 text-neutral-300"
                            }`}
                          >
                            <div className="flex items-center justify-between text-xs font-semibold">
                              <span
                                className={
                                  fromAdmin ? "text-[#F97316]" : "text-neutral-300"
                                }
                              >
                                {fromAdmin ? SUPPORT_LABEL : "You"}
                              </span>
                              <span className="text-[11px] text-neutral-500 font-normal">
                                {formatFullTime(reply.createdAt)}
                              </span>
                            </div>
                            <p className="mt-2 text-xs leading-relaxed whitespace-pre-wrap text-neutral-300">
                              {reply.body}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Inline Quick Reply Section */}
                <div className="mt-8 pt-6 border-t border-neutral-800/80">
                  <div className="rounded-xl border border-neutral-800 bg-[#161619] p-3 focus-within:border-[#F97316] transition">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={3}
                      placeholder={`Reply to ${SUPPORT_LABEL}...`}
                      className="w-full resize-none bg-transparent text-xs text-neutral-200 placeholder:text-neutral-500 outline-none leading-relaxed"
                    />
                    <div className="mt-2 flex items-center justify-between pt-2 border-t border-neutral-800/60">
                      <span className="text-[11px] text-neutral-500">
                        Replies will be sent to support team.
                      </span>
                      <button
                        type="button"
                        disabled={!replyText.trim() || replyMutation.isPending}
                        onClick={() =>
                          replyMutation.mutate({
                            id: selectedThread._id,
                            body: replyText.trim(),
                          })
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#F97316] px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-[#EA580C] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {replyMutation.isPending ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <CornerUpLeft size={12} />
                        )}
                        <span>Send reply</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* EMPTY SELECTION STATE */
              <div className="flex-1 rounded-2xl border border-white/[0.04] bg-[#121214] p-8 flex flex-col items-center justify-center text-center gap-3">
                <div className="size-12 rounded-full bg-neutral-900 flex items-center justify-center text-neutral-500">
                  <Mail size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-neutral-300">
                    No conversation selected
                  </h3>
                  <p className="mt-1 text-xs text-neutral-500 max-w-sm">
                    Select a message from the list on the left to read its full
                    details and reply, or start a new request.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleStartCompose}
                  className="mt-2 inline-flex items-center gap-2 rounded-lg bg-[#F97316] px-4 py-2 text-xs font-bold text-white hover:bg-[#EA580C] transition cursor-pointer"
                >
                  <SquarePen size={13} />
                  <span>Compose Message</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FLOATING TOAST NOTIFICATION */}
      {notice && (
        <div
          className={`fixed bottom-6 right-6 z-[140] flex items-center gap-2 rounded-xl border px-4 py-3 text-xs font-semibold shadow-2xl backdrop-blur-md transition-all ${
            notice.type === "success"
              ? "border-emerald-500/30 bg-[#0f1f17] text-emerald-300"
              : "border-rose-500/30 bg-[#251014] text-rose-300"
          }`}
        >
          {notice.type === "success" ? (
            <Check size={15} className="text-emerald-400" />
          ) : (
            <X size={15} className="text-rose-400" />
          )}
          <span>{notice.message}</span>
        </div>
      )}
    </div>
  );
}
