"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, LockKeyhole } from "lucide-react";
import Navbar from "../../components/landing/Navbar";
import { useAuth } from "../../context/AuthContext";
import { AddComponentPanel } from "../../components/AddComponentPanel";

function AuthRequiredCard({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#FAFAFB] dark:bg-black px-4 py-12 flex items-center justify-center">
      <div className="w-full max-w-[460px] rounded-2xl border border-gray-200/90 dark:border-neutral-800 bg-white dark:bg-[#121316] p-8 text-center shadow-xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 dark:bg-orange-950/80 text-[#F97316]">
          <LockKeyhole size={26} strokeWidth={2} />
        </div>
        <h1 className="text-xl font-black tracking-tight text-gray-900 dark:text-white">Authentication Required</h1>
        <p className="mx-auto mt-2 max-w-sm text-xs font-medium leading-5 text-gray-500 dark:text-neutral-400">
          Sign in to submit components to the library.
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
  const { user, isInitialized, setLoginModalOpen } = useAuth();

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#FAFAFB] dark:bg-black">
        <Loader2 className="h-9 w-9 animate-spin text-[#F97316]" />
        <p className="text-xs font-semibold text-gray-500 dark:text-neutral-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFB] dark:bg-black text-slate-900 dark:text-white flex flex-col">
      <Navbar />

      {!user ? (
        <AuthRequiredCard onLogin={() => setLoginModalOpen(true)} />
      ) : (
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-4">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard?page=my-components"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white transition"
            >
              <ArrowLeft size={14} />
              <span>Back to My Components</span>
            </Link>
          </div>

          <AddComponentPanel
            onSuccess={() => router.push(user.role === "admin" ? "/components" : "/dashboard?page=my-components")}
            onCancel={() => router.push("/dashboard?page=my-components")}
          />
        </main>
      )}
    </div>
  );
}
