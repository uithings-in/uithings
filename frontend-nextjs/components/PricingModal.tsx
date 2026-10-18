"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { plansApi, type Plan } from "../api/plans";
import { paymentsApi } from "../api/payments";
import { useQuery } from "@tanstack/react-query";
import { X, Zap, Layers, SquareMousePointer, CheckCircle2 } from "lucide-react";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

interface RazorpayPaymentResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayFailureResponse {
  error: {
    description: string;
  };
}

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_LANDING_PLANS = [
  {
    planKey: "pro_starter",
    name: "Basic Plan",
    pricePrefix: "₹",
    price: "99",
    period: "per user / 180 days",
    description: "Perfect for testing and light creative needs.",
    features: [
      "100 components",
      "Figma variables",
      "Dark mode variables",
      "Component properties",
      "Interactive components",
      "Auto Layout 5.0",
    ],
    featured: false,
  },
  {
    planKey: "pro_ultimate",
    name: "Advance Plan",
    pricePrefix: "₹",
    price: "199",
    period: "per user / 180 days",
    description: "Unlock more power with advanced models and bigger limits.",
    features: [
      "250 components",
      "Figma variables",
      "Dark mode variables",
      "Component properties",
      "Interactive components",
      "Auto Layout 5.0",
    ],
    featured: true,
  },
  {
    planKey: "pro_annual",
    name: "Premium+",
    pricePrefix: "₹",
    price: "499",
    period: "per user / 365 days",
    description: "Everything unlimited. For pros, teams, and power creators.",
    features: [
      "Unlimited components",
      "Figma variables",
      "Dark mode variables",
      "Component properties",
      "Interactive components",
      "Auto Layout 5.0",
    ],
    featured: false,
  },
];

export function PricingModal({ isOpen, onClose }: PricingModalProps) {
  const { user, setLoginModalOpen } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pendingPlanName, setPendingPlanName] = useState<string | null>(null);
  const [showLoginNotice, setShowLoginNotice] = useState(false);

  const { data: plans } = useQuery({
    queryKey: ["plans"],
    queryFn: plansApi.getAllPlans,
    enabled: isOpen,
  });

  const { refetch: refetchSubscription } = useQuery({
    queryKey: ["subscription", "checkAccess"],
    queryFn: () => paymentsApi.checkAccess(),
    enabled: isOpen && !!user,
  });

  useEffect(() => {
    if (isOpen && !window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      window.setTimeout(() => {
        setPendingPlanName(null);
        setShowLoginNotice(false);
        setError("");
      }, 0);
    }
  }, [isOpen]);

  const startPayment = useCallback(
    async (plan: Plan) => {
      setSelectedPlan(plan);
      setError("");
      setLoading(true);

      try {
        const orderData = await paymentsApi.createOrder(plan._id);

        if (!window.Razorpay) {
          throw new Error("Razorpay SDK not loaded");
        }

        const razorpayOptions = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "Ui Things Pro",
          description: `Subscribe to ${orderData.planName}`,
          order_id: orderData.orderId,
          handler: async (response: RazorpayPaymentResponse) => {
            try {
              const result = await paymentsApi.verifyPayment(
                response.razorpay_order_id,
                response.razorpay_payment_id,
                response.razorpay_signature,
                plan._id
              );
              await refetchSubscription();
              if (result.data?.isQueued) {
                alert(
                  "Plan purchased! It has been queued and will activate after your current plan expires."
                );
              } else {
                alert("Payment successful! You now have Pro access.");
              }
              onClose();
            } catch {
              setError("Payment verification failed. Please contact support.");
            }
          },
          prefill: {
            name: user?.name,
            email: user?.email,
          },
          theme: {
            color: "#4B3DF5",
          },
        };

        const razorpay = new window.Razorpay(razorpayOptions);
        razorpay.open();

        razorpay.on("payment.failed", (response: RazorpayFailureResponse) => {
          setError(`Payment failed: ${response.error.description}`);
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "";
        setError(
          message === "SUBSCRIPTION_EXISTS"
            ? "Subscription already exists."
            : message || "Failed to initiate payment. Please try again."
        );
      } finally {
        setLoading(false);
        setSelectedPlan(null);
      }
    },
    [onClose, refetchSubscription, user]
  );

  const handlePlanSelect = async (preferredKey: string) => {
    const targetPlan =
      plans?.find((p) => p.name === preferredKey) ||
      plans?.find((p) => {
        const pName = (p.displayName || p.name).toLowerCase();
        if (preferredKey === "pro_starter") {
          return pName.includes("basic") || pName.includes("starter");
        }
        if (preferredKey === "pro_ultimate") {
          return pName.includes("advance") || pName.includes("ultimate");
        }
        if (preferredKey === "pro_annual") {
          return pName.includes("premium") || pName.includes("annual");
        }
        return false;
      }) ||
      plans?.[0];

    if (!targetPlan) {
      alert("This plan is currently not available. Please try again later.");
      return;
    }

    if (!user) {
      setPendingPlanName(targetPlan.name);
      setShowLoginNotice(true);
      setLoginModalOpen(true);
      return;
    }

    await startPayment(targetPlan);
  };

  useEffect(() => {
    if (!user || !pendingPlanName || loading) return;
    const pendingPlan = plans?.find((p) => p.name === pendingPlanName);
    if (!pendingPlan) return;
    window.setTimeout(() => {
      setPendingPlanName(null);
      setShowLoginNotice(false);
      startPayment(pendingPlan);
    }, 0);
  }, [loading, pendingPlanName, plans, startPayment, user]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Map plans with live backend data and default fallback pricing page details
  const displayPlans = useMemo(() => {
    return DEFAULT_LANDING_PLANS.map((defaultPlan, index) => {
      const matched =
        plans?.find((p) => p.name === defaultPlan.planKey) ||
        plans?.find((p) => {
          const pName = (p.displayName || p.name).toLowerCase();
          if (defaultPlan.planKey === "pro_starter") {
            return pName.includes("basic") || pName.includes("starter");
          }
          if (defaultPlan.planKey === "pro_ultimate") {
            return pName.includes("advance") || pName.includes("ultimate");
          }
          if (defaultPlan.planKey === "pro_annual") {
            return pName.includes("premium") || pName.includes("annual");
          }
          return false;
        }) ||
        plans?.[index] ||
        null;

      const priceValue = matched
        ? Math.floor(matched.price / 100).toString()
        : defaultPlan.price;
      const periodValue = matched
        ? `per user / ${matched.durationDays} days`
        : defaultPlan.period;
      const descValue = matched?.description || defaultPlan.description;
      const featuresValue =
        matched?.features && matched.features.length > 0
          ? matched.features.slice(0, 6)
          : defaultPlan.features;

      return {
        ...defaultPlan,
        price: priceValue,
        period: periodValue,
        description: descValue,
        features: featuresValue,
        planObj: matched,
      };
    });
  }, [plans]);

  const [basicPlan, advancePlan, premiumPlan] = displayPlans;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-[890px] bg-[#0A071E] border border-white/10 rounded-[28px] shadow-[0_25px_70px_rgba(0,0,0,0.85)] p-6 sm:p-8 md:p-9 overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-[#F7F7FD]">
        {/* Subtle Cosmic Ambient Glow inside modal */}
        <div
          className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[350px] opacity-60"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% 20%, rgba(75, 61, 245, 0.4) 0%, rgba(124, 92, 255, 0.15) 50%, transparent 80%)",
          }}
        />

        {/* Header */}
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Choose the right plan for you
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#A6A6C1]">
              There&apos;s an affordable plan for everyone.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/10 bg-white/[0.04] p-1.5 text-[#A6A6C1] hover:text-white hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {error && (
          <div className="relative z-10 mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs sm:text-sm text-center">
            {error}
          </div>
        )}

        {showLoginNotice && !user && (
          <div className="relative z-10 mt-4 p-3 bg-[#4B3DF5]/15 border border-[#4B3DF5]/30 rounded-xl text-[#DFD5F6] text-xs sm:text-sm text-center">
            Please log in to continue with your selected plan.
          </div>
        )}

        {/* 3 Cards Grid */}
        <div className="relative z-10 mt-8 grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
          {/* Card 1: Basic Plan */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#0E0B24]/80 p-6 flex flex-col text-center shadow-[0_4px_24px_rgba(0,0,0,0.3)] transition-all duration-300 hover:border-white/20 hover:bg-[#130E2E]/90 backdrop-blur-md">
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-[#1A1538] text-[#7C5CFF] border border-[#7C5CFF]/30">
              <Zap size={18} className="fill-[#7C5CFF]" />
            </div>

            <h3 className="text-sm font-semibold text-white mt-4">{basicPlan.name}</h3>

            <div className="mt-2 flex items-baseline justify-center gap-1">
              <span className="text-xl font-bold text-[#7C5CFF]">{basicPlan.pricePrefix}</span>
              <span className="text-3xl font-extrabold text-[#7C5CFF]">{basicPlan.price}</span>
            </div>
            <span className="text-[11px] text-[#8F8A98] mt-0.5">{basicPlan.period}</span>

            <p className="text-[11.5px] text-[#A6A6C1] mt-3 mb-6 leading-relaxed">
              {basicPlan.description}
            </p>

            <ul className="space-y-3 mb-8 text-left text-xs text-[#C4C0D9]">
              {basicPlan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-[#7C5CFF] shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => handlePlanSelect("pro_starter")}
              disabled={loading}
              className="mt-auto w-full rounded-xl border border-white/15 bg-white/[0.05] py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-white/[0.1] hover:border-white/25 transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              {loading && selectedPlan?.name === "pro_starter"
                ? "Processing..."
                : "Buy Now"}
            </button>
          </div>

          {/* Card 2: Advance Plan (Featured Glowing Card) */}
          <div className="relative rounded-2xl border border-[#7C5CFF]/60 bg-gradient-to-b from-[#181140] to-[#0E0A28] p-6 flex flex-col text-center shadow-[0_0_35px_rgba(124,92,255,0.25)] overflow-hidden text-white backdrop-blur-md">
            {/* Blue & violet radial glow */}
            <div
              className="pointer-events-none absolute inset-0 opacity-80"
              style={{
                background:
                  "radial-gradient(ellipse 90% 70% at 75% 25%, rgba(124, 92, 255, 0.45) 0%, rgba(67, 67, 213, 0.25) 50%, transparent 85%)",
              }}
            />

            <div className="relative z-10 mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-[#4B3DF5] to-[#7C5CFF] text-white shadow-[0_0_12px_rgba(124,92,255,0.5)]">
              <Layers size={18} />
            </div>

            <h3 className="relative z-10 text-sm font-semibold text-white mt-4">
              {advancePlan.name}
            </h3>

            <div className="relative z-10 mt-2 flex items-baseline justify-center gap-1">
              <span className="text-xl font-bold text-white">{advancePlan.pricePrefix}</span>
              <span className="text-3xl font-extrabold text-white">{advancePlan.price}</span>
            </div>
            <span className="relative z-10 text-[11px] text-[#A6A6C1] mt-0.5">
              {advancePlan.period}
            </span>

            <p className="relative z-10 text-[11.5px] text-[#C4C0D9] mt-3 mb-6 leading-relaxed">
              {advancePlan.description}
            </p>

            <ul className="relative z-10 space-y-3 mb-8 text-left text-xs text-[#E0DCFE]">
              {advancePlan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-[#9FE870] shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => handlePlanSelect("pro_ultimate")}
              disabled={loading}
              className="relative z-10 mt-auto w-full rounded-xl bg-white py-2.5 text-xs sm:text-sm font-semibold text-[#070416] hover:bg-[#F3F4F6] transition-all shadow-lg hover:shadow-white/20 cursor-pointer disabled:opacity-50"
            >
              {loading && selectedPlan?.name === "pro_ultimate"
                ? "Processing..."
                : "Buy Now"}
            </button>
          </div>

          {/* Card 3: Premium+ Plan */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#0E0B24]/80 p-6 flex flex-col text-center shadow-[0_4px_24px_rgba(0,0,0,0.3)] transition-all duration-300 hover:border-white/20 hover:bg-[#120E2C]/90 backdrop-blur-md">
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-[#1A1538] text-[#60A5FA] border border-[#60A5FA]/30">
              <SquareMousePointer size={18} />
            </div>

            <h3 className="text-sm font-semibold text-white mt-4">{premiumPlan.name}</h3>

            <div className="mt-2 flex items-baseline justify-center gap-1">
              <span className="text-xl font-bold text-[#60A5FA]">{premiumPlan.pricePrefix}</span>
              <span className="text-3xl font-extrabold text-[#60A5FA]">{premiumPlan.price}</span>
            </div>
            <span className="text-[11px] text-[#8F8A98] mt-0.5">{premiumPlan.period}</span>

            <p className="text-[11.5px] text-[#A6A6C1] mt-3 mb-6 leading-relaxed">
              {premiumPlan.description}
            </p>

            <ul className="space-y-3 mb-8 text-left text-xs text-[#C4C0D9]">
              {premiumPlan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-[#60A5FA] shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => handlePlanSelect("pro_annual")}
              disabled={loading}
              className="mt-auto w-full rounded-xl border border-white/15 bg-white/[0.05] py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-white/[0.1] hover:border-white/25 transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              {loading && selectedPlan?.name === "pro_annual"
                ? "Processing..."
                : "Buy Now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
