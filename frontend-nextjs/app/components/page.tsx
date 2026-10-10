import { componentsApi } from "../../api/components";
import type { PaginatedComponentResponse } from "../../lib/types";
import ComponentsClient from "./client";

export const revalidate = 60;

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/+$/, "");

async function fetchInitialComponents(): Promise<PaginatedComponentResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/components?limit=25&designType=UI+Design`, {
      next: { revalidate: 60 },
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
      next: { revalidate: 60 },
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

export default async function ComponentsPage() {
  const [initialPage, initialTags] = await Promise.all([
    fetchInitialComponents(),
    fetchInitialTags(),
  ]);

  return <ComponentsClient initialPage={initialPage} initialTags={initialTags} />;
}
