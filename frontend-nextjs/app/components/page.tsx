import { componentsApi } from "../../api/components";
import type { PaginatedComponentResponse } from "../../lib/types";
import ComponentsClient from "./client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/+$/, "");

async function fetchInitialComponents(): Promise<PaginatedComponentResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/components?limit=25&designType=UI+Design`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.data;
  } catch {
    // Fallback to componentsApi if direct fetch encounters issues
    try {
      return await componentsApi.list("", "", 1, 25, { designType: "UI Design" });
    } catch (e) {
      console.error("Failed to load initial components page list:", e);
      return null;
    }
  }
}

async function fetchInitialTags(): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/components/tags`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.data || [];
  } catch {
    try {
      return await componentsApi.getTags();
    } catch (e) {
      console.error("Failed to load initial tags list:", e);
      return [];
    }
  }
}

async function fetchInitialTotalCount(): Promise<number> {
  try {
    const res = await fetch(`${API_BASE_URL}/components/count`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.data.count;
  } catch {
    try {
      return await componentsApi.getTotalCount();
    } catch {
      return 0;
    }
  }
}

export default async function ComponentsPage() {
  const [initialPage, initialTags, initialTotalCount] = await Promise.all([
    fetchInitialComponents(),
    fetchInitialTags(),
    fetchInitialTotalCount(),
  ]);

  return (
    <ComponentsClient
      initialPage={initialPage}
      initialTags={initialTags}
      initialTotalCount={initialTotalCount}
    />
  );
}
