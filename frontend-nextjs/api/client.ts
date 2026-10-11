import axios from "axios";

function normalizeApiUrl(value?: string): string {
  const fallback = "http://localhost:5000/api";
  if (!value) {
    return fallback;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return fallback;
  }

  const hasProtocol = /^https?:\/\//i.test(trimmed);
  const withProtocol = hasProtocol ? trimmed : `https://${trimmed}`;
  return withProtocol.replace(/\/+$/, "");
}

const baseURL = normalizeApiUrl(process.env.NEXT_PUBLIC_API_URL);

export const apiClient = axios.create({
  baseURL,
});

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;

  // 1. Direct keys
  const directToken = localStorage.getItem("accessToken") || localStorage.getItem("token");
  if (directToken) return directToken;

  // 2. Auth user object in localStorage
  try {
    const rawAuth = localStorage.getItem("authUser") || localStorage.getItem("user");
    if (rawAuth) {
      const parsed = JSON.parse(rawAuth);
      const token = parsed?.token || parsed?.accessToken;
      if (token && typeof token === "string") {
        try {
          localStorage.setItem("accessToken", token);
        } catch {}
        return token;
      }
    }
  } catch {}

  // 3. Cookie fallback
  if (typeof document !== "undefined") {
    const match = document.cookie.match(/(^|;\s*)accessToken=([^;]*)/);
    if (match) return decodeURIComponent(match[2]);
  }

  return null;
}

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
