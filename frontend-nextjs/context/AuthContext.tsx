"use client";
import { createContext, useContext, useMemo, useState, useCallback, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { authApi } from "../api/auth";
import type { User } from "../lib/types";
import { LoginModal } from "../components/LoginModal";
import { RegisterModal } from "../components/RegisterModal";
import { PricingModal } from "../components/PricingModal";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isInitialized: boolean;
  login: (input: { email: string; password: string }) => Promise<void>;
  register: (input: { name: string; email: string; password: string }) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => void;
  registerModalOpen: boolean;
  setRegisterModalOpen: (open: boolean) => void;
  loginModalOpen: boolean;
  setLoginModalOpen: (open: boolean) => void;
  pricingModalOpen: boolean;
  setPricingModalOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function normalizeUser(user: User): User {
  return {
    id: user.id || (user as any)._id,
    name: user.name,
    email: user.email,
    profilePicture: user.profilePicture,
    role: user.role,
    isProUser: user.isProUser,
    subscription: user.subscription,
  };
}

function setAuthCookies(token: string, user: User) {
  if (typeof document === "undefined") return;
  const maxAge = 60 * 60 * 24 * 30; // 30 days
  document.cookie = `accessToken=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Lax`;
  document.cookie = `authUser=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function clearAuthCookies() {
  if (typeof document === "undefined") return;
  document.cookie = "accessToken=; path=/; max-age=0; SameSite=Lax";
  document.cookie = "authUser=; path=/; max-age=0; SameSite=Lax";
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^|;\\s*)(${name})=([^;]*)`));
  return match ? decodeURIComponent(match[3]) : null;
}

function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("authUser") || localStorage.getItem("user") || getCookie("authUser");
    return raw ? normalizeUser(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({
  children,
  initialUser = null,
}: {
  children: React.ReactNode;
  initialUser?: User | null;
}) {
  const queryClient = useQueryClient();
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [pricingModalOpen, setPricingModalOpen] = useState(false);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const stored = getStoredUser();
    const token = localStorage.getItem("accessToken") || getCookie("accessToken");
    if (stored && token) {
      queryClient.setQueryData(["auth", "me"], stored);
      setAuthCookies(token, stored);
    }
  }, [queryClient]);

  const hasToken = isMounted
    ? Boolean(localStorage.getItem("accessToken") || getCookie("accessToken"))
    : Boolean(initialUser);

  const authQuery = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      try {
        const freshUser = normalizeUser(await authApi.me());
        if (typeof window !== "undefined") {
          localStorage.setItem("authUser", JSON.stringify(freshUser));
          const token = localStorage.getItem("accessToken") || getCookie("accessToken");
          if (token) setAuthCookies(token, freshUser);
        }
        return freshUser;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          if (typeof window !== "undefined") {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("authUser");
            clearAuthCookies();
          }
          queryClient.setQueryData(["auth", "me"], null);
        }
        throw error;
      }
    },
    enabled: hasToken,
    initialData: initialUser ? normalizeUser(initialUser) : undefined,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const user = authQuery.data ?? (isMounted ? getStoredUser() : initialUser);
  const loading = isMounted && hasToken ? authQuery.isLoading && !user : false;
  const isInitialized = isMounted || !!initialUser;

  const login = useCallback(async (input: { email: string; password: string }) => {
    const payload = await authApi.login(input);
    const normalized = normalizeUser(payload.user);
    localStorage.setItem("accessToken", payload.token);
    localStorage.setItem("authUser", JSON.stringify(normalized));
    setAuthCookies(payload.token, normalized);
    queryClient.setQueryData(["auth", "me"], normalized);
  }, [queryClient]);

  const register = useCallback(async (input: { name: string; email: string; password: string }) => {
    const payload = await authApi.register(input);
    const normalized = normalizeUser(payload.user);
    localStorage.setItem("accessToken", payload.token);
    localStorage.setItem("authUser", JSON.stringify(normalized));
    setAuthCookies(payload.token, normalized);
    queryClient.setQueryData(["auth", "me"], normalized);
  }, [queryClient]);

  const loginWithGoogle = useCallback(async (idToken: string) => {
    const payload = await authApi.googleLogin(idToken);
    const normalized = normalizeUser(payload.user);
    localStorage.setItem("accessToken", payload.token);
    localStorage.setItem("authUser", JSON.stringify(normalized));
    setAuthCookies(payload.token, normalized);
    queryClient.setQueryData(["auth", "me"], normalized);
  }, [queryClient]);

  const logout = useCallback(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("authUser");
    localStorage.removeItem("user");
    clearAuthCookies();
    queryClient.setQueryData(["auth", "me"], null);
    queryClient.removeQueries({ queryKey: ["components"] });
  }, [queryClient]);

  const value = useMemo(
    () => ({
      user,
      loading,
      isInitialized,
      login,
      register,
      loginWithGoogle,
      logout,
      registerModalOpen,
      setRegisterModalOpen,
      loginModalOpen,
      setLoginModalOpen,
      pricingModalOpen,
      setPricingModalOpen,
    }),
    [
      user,
      loading,
      isInitialized,
      login,
      register,
      loginWithGoogle,
      logout,
      registerModalOpen,
      setRegisterModalOpen,
      loginModalOpen,
      setLoginModalOpen,
      pricingModalOpen,
      setPricingModalOpen,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      {loginModalOpen && <LoginModal />}
      {registerModalOpen && <RegisterModal />}
      {pricingModalOpen && <PricingModal isOpen={pricingModalOpen} onClose={() => setPricingModalOpen(false)} />}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}



