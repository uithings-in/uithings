import { cookies } from "next/headers";
import type { PaginatedComponentResponse } from "../../lib/types";
import ComponentsClient from "./client";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

// Anonymous visitors all share the same public list, so it is safe to cache
// briefly. Authenticated requests are per-user and must stay uncached.
const PUBLIC_REVALIDATE_SECONDS = 30;

type FetchOptions = Parameters<typeof fetch>[1];

interface Fetched<T> {
  data: T | null;
  fetchedAt: number;
}

async function fetchData<T>(
  path: string,
  init?: FetchOptions,
): Promise<Fetched<T>> {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, init);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return {
      data: (json?.data ?? null) as T | null,
      fetchedAt: Date.now(),
    };
  } catch (error) {
    console.error(`Failed to load ${path}:`, error);
    return { data: null, fetchedAt: Date.now() };
  }
}

async function fetchTotalCount(): Promise<Fetched<number>> {
  const result = await fetchData<{ count: number }>("/components/count", {
    next: { revalidate: PUBLIC_REVALIDATE_SECONDS },
  });
  return { data: result.data?.count ?? 0, fetchedAt: result.fetchedAt };
}

function getInitialIsProUser(authUserCookie?: string): boolean {
  if (!authUserCookie) return false;
  try {
    const parsed = JSON.parse(decodeURIComponent(authUserCookie));
    return Boolean(parsed?.isProUser || parsed?.role === "admin");
  } catch {
    return false;
  }
}

export default async function ComponentsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  const authUserCookie = cookieStore.get("authUser")?.value;
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : undefined;

  // Authenticated users get their own (and therefore uncached) response so Pro
  // components are included on the very first paint.
  const listOptions: FetchOptions = token
    ? { cache: "no-store", headers: authHeaders }
    : {
        next: { revalidate: PUBLIC_REVALIDATE_SECONDS },
        headers: authHeaders,
      };

  const [initialPageResult, initialTagsResult, initialTotalCountResult] =
    await Promise.all([
      fetchData<PaginatedComponentResponse>(
        "/components?limit=25&designType=UI+Design",
        listOptions,
      ),
      fetchData<string[]>("/components/tags", {
        next: { revalidate: PUBLIC_REVALIDATE_SECONDS },
      }),
      fetchTotalCount(),
    ]);

  return (
    <ComponentsClient
      initialPage={initialPageResult.data}
      initialTags={initialTagsResult.data ?? []}
      initialTotalCount={initialTotalCountResult.data ?? 0}
      initialFetchedAt={initialPageResult.fetchedAt}
      initialIsProUser={getInitialIsProUser(authUserCookie)}
    />
  );
}
