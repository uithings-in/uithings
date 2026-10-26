"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import type { Plan } from "../../api/plans";
import { plansApi } from "../../api/plans";
import { paymentsApi } from "../../api/payments";

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

const plans = [
  {
    planKey: "pro_starter",
    name: "Basic Plan",
    pricePrefix: "₹",
    price: "299",
    period: "per user / 90 days",
    description: "Simple and Affordable Plans",
    features: [
      "100 components",
      "Figma variables",
      "Dark mode variables",
      "Component properties",
      "Interactive components",
      "Auto Layout 5.0",
    ],
    featured: false,
    check: "/landing/check.svg",
  },
  {
    planKey: "pro_ultimate",
    name: "Advance Plan",
    pricePrefix: "₹",
    price: "499",
    period: "per user / 180 days",
    description: "Unlock More Features and Possibilities",
    features: [
      "250 components",
      "Figma variables",
      "Dark mode variables",
      "Component properties",
      "Interactive components",
      "Auto Layout 5.0",
    ],
    featured: true,
    check: "/landing/check.svg",
  },
  {
    planKey: "pro_annual",
    name: "Premium Plan",
    pricePrefix: "₹",
    price: "599",
    period: "per user / 365 days",
    description: "Premium Benefits for Maximum Value",
    features: [
      "Unlimited components",
      "Figma variables",
      "Dark mode variables",
      "Component properties",
      "Interactive components",
      "Auto Layout 5.0",
    ],
    featured: false,
    check: "/landing/check.svg",
  },
];

export default function PricingSection() {
  const { user, setLoginModalOpen, refetchUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [processingPlanName, setProcessingPlanName] = useState<string | null>(null);
  const [pendingPlanKey, setPendingPlanKey] = useState<string | null>(null);

  const { data: plansData } = useQuery({
    queryKey: ["plans"],
    queryFn: plansApi.getAllPlans,
  });

  const { refetch: refetchSubscription } = useQuery({
    queryKey: ["subscription", "checkAccess"],
    queryFn: () => paymentsApi.checkAccess(),
    enabled: !!user,
  });

  // Inject Razorpay checkout.js script once on client
  useEffect(() => {
    if (typeof window !== "undefined" && !window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const startPayment = useCallback(
    async (plan: Plan) => {
      setLoading(true);
      setProcessingPlanName(plan.name);

      try {
        const orderData = await paymentsApi.createOrder(plan._id);

        if (!window.Razorpay) {
          throw new Error("Razorpay SDK not loaded. Please check your connection and try again.");
        }

        const razorpayKey =
          orderData.keyId ||
          process.env.NEXT_RAZORPAY_KEY_ID;

        const razorpayOptions = {
          key: razorpayKey,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "uithings",
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
              await Promise.all([refetchSubscription(), refetchUser?.()]);
              if (result.data?.isQueued) {
                alert(
                  "Plan purchased! It has been queued and will activate after your current plan expires. You can manage it from your Dashboard."
                );
              } else {
                alert("Payment successful! You now have Pro access.");
              }
            } catch {
              alert("Payment verification failed. Please contact support.");
            }
          },
          prefill: {
            name: user?.name,
            email: user?.email,
          },
          theme: {
            color: "#4343D5",
          },
        };

        const razorpay = new window.Razorpay(razorpayOptions);
        razorpay.open();

        razorpay.on("payment.failed", (response: RazorpayFailureResponse) => {
          alert(`Payment failed: ${response.error.description}`);
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "";
        alert(message || "Failed to initiate payment. Please try again.");
      } finally {
        setLoading(false);
        setProcessingPlanName(null);
      }
    },
    [refetchSubscription, refetchUser, user]
  );

  const findMatchingPlan = useCallback(
    (planKey: string, planName: string, allPlans?: Plan[]): Plan | undefined => {
      const list = allPlans || plansData;
      if (!list || list.length === 0) return undefined;

      return list.find(
        (p) =>
          p.name === planKey ||
          p.displayName?.toLowerCase() === planName.toLowerCase() ||
          (planKey === "pro_starter" && (p.name.includes("starter") || p.displayName?.toLowerCase().includes("basic"))) ||
          (planKey === "pro_ultimate" && (p.name.includes("ultimate") || p.displayName?.toLowerCase().includes("advance"))) ||
          (planKey === "pro_annual" && (p.name.includes("annual") || p.displayName?.toLowerCase().includes("premium")))
      );
    },
    [plansData]
  );

  const handleBuyNow = async (planItem: (typeof plans)[0]) => {
    let targetPlan = findMatchingPlan(planItem.planKey, planItem.name);

    if (!targetPlan) {
      try {
        const freshPlans = await plansApi.getAllPlans();
        targetPlan = findMatchingPlan(planItem.planKey, planItem.name, freshPlans);
      } catch (err) {
        console.error("Failed to fetch fresh plans:", err);
      }
    }

    if (!targetPlan) {
      alert("This plan is currently not available. Please try again later.");
      return;
    }

    if (!user) {
      setPendingPlanKey(planItem.planKey);
      setLoginModalOpen(true);
      return;
    }

    await startPayment(targetPlan);
  };

  // If user was prompted to login, resume checkout upon successful authentication
  useEffect(() => {
    if (!user || !pendingPlanKey || loading) return;
    const target = findMatchingPlan(pendingPlanKey, "");
    if (!target) return;
    const timer = window.setTimeout(() => {
      startPayment(target);
      setPendingPlanKey(null);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [user, pendingPlanKey, loading, findMatchingPlan, startPayment]);

  return (
    <section
      id="pricing"
      className="relative w-full overflow-hidden bg-[#080605] pt-[72px] pb-[108px] text-white"
    >
      {/* Ambient soft backlight glow for extra-smooth diffusion */}
      <div
        className="pointer-events-none absolute -top-8 left-1/2 z-0 -translate-x-1/2 h-[380px] w-[860px] rounded-full blur-[100px] opacity-40"
        style={{
          background:
            "radial-gradient(ellipse at 50% 10%, rgba(76, 85, 223, 0.5) 0%, rgba(50, 30, 168, 0.25) 45%, transparent 75%)",
        }}
      />

      {/* Exact Tube Light SVG Asset from Figma with ultra-smooth radial falloff mask and screen blend */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 z-0 flex -translate-x-1/2 justify-center"
        style={{
          maskImage:
            "radial-gradient(ellipse 80% 75% at 50% 0%, rgba(0,0,0,1) 15%, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0.2) 65%, rgba(0,0,0,0) 85%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 75% at 50% 0%, rgba(0,0,0,1) 15%, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0.2) 65%, rgba(0,0,0,0) 85%)",
        }}
      >
        <img
          src="/assets/tube-light.svg"
          alt=""
          width={1050}
          height={486}
          className="pointer-events-none h-[486px] w-[1050px] max-w-none select-none mix-blend-screen opacity-95"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[1140px] px-4 sm:px-6">
        {/* Header content */}
        <div className="mb-[56px] flex flex-col items-center text-center">
          {/* Pricing badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(247,247,253,0.15)] bg-[rgba(248,246,253,0.1)] px-3.5 py-1.5 shadow-[0_0_20px_rgba(67,67,213,0.25)] backdrop-blur-[6px]">
            <span className="relative size-4 overflow-hidden">
              <img
                src="/landing/sparkle.svg"
                alt=""
                className="absolute inset-0 size-full max-w-none"
              />
            </span>
            <span
              className="text-sm font-medium leading-5 text-[#DFD5F6]"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Pricing
            </span>
          </div>

          <h2
            className="mt-6 text-[38px] font-medium leading-[1.08] tracking-[-2px] text-[#F7F7FD] sm:text-[54px] md:text-[60px]"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Plans that grow with you
          </h2>
          <p
            className="mt-3.5 max-w-[560px] text-sm sm:text-base font-normal leading-relaxed text-[#9389A8]"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Start free. Upgrade when you&apos;re ready. No hidden fees, no pressure.
          </p>
        </div>

        {/* 3 Pricing Cards */}
        <div className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-3 lg:gap-6">
          {plans.map((plan) => {
            const isProcessing =
              loading &&
              (processingPlanName === plan.planKey ||
                processingPlanName?.includes(plan.planKey.replace("pro_", "")));

            return (
              <div
                key={plan.name}
                className={`relative flex h-full min-h-[620px] flex-col justify-between overflow-hidden rounded-[20px] p-7 sm:p-8 transition-all duration-300 ${
                  plan.featured
                    ? "border border-[#9797FF]/40 bg-[#070415] shadow-[0_0_35px_-5px_rgba(67,67,213,0.32),inset_0_0_20px_rgba(67,67,213,0.08)]"
                    : "border border-white/10 bg-[#070415]"
                }`}
              >
                {/* Glowing top accent line */}
                <div
                  className={`absolute top-0 left-7 sm:left-8 h-[2px] w-14 rounded-full ${
                    plan.featured ? "bg-[#9797FF]" : "bg-[#FFFFFF]"
                  }`}
                  style={{
                    boxShadow: plan.featured
                      ? "0 0 16px 2px #9797FF, 0 0 32px 6px #4343D5"
                      : "0 0 14px 2px rgba(255,255,255,0.85), 0 0 28px 5px rgba(255,255,255,0.3)",
                  }}
                />

                {/* Card top content */}
                <div>
                  <p
                    className="text-[17px] font-normal leading-6 tracking-[-0.18px] text-[rgba(244,247,253,0.64)]"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {plan.name}
                  </p>

                  <div className="mt-5 flex items-baseline gap-2">
                    <div
                      className="flex items-baseline text-[#F4F7F5]"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      <span className="text-[34px] sm:text-[38px] font-semibold leading-none">
                        {plan.pricePrefix}
                      </span>
                      <span className="text-[46px] sm:text-[50px] font-bold leading-none tracking-[-0.5px]">
                        {plan.price}
                      </span>
                    </div>
                    <p
                      className="text-[13px] sm:text-sm font-normal tracking-[-0.14px] text-[rgba(244,247,253,0.64)]"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      {plan.period}
                    </p>
                  </div>

                  <p
                    className="mt-3.5 min-h-[44px] flex items-center justify-center text-center text-[14px] sm:text-[15px] font-normal leading-[22px] tracking-[-0.16px] text-[#F4F7F5]"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {plan.description}
                  </p>

                  {/* Divider with endpoints */}
                  <div className="relative my-6 flex items-center justify-between sm:my-7">
                    <span className="size-[2.5px] shrink-0 bg-[#F4F7F5]/70" />
                    <div className="mx-1 h-px w-full bg-white/10" />
                    <span className="size-[2.5px] shrink-0 bg-[#F4F7F5]/70" />
                  </div>

                  <p
                    className="mb-4 text-[14px] font-medium leading-5 tracking-[-0.16px] text-[rgba(244,247,253,0.64)]"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    What’s Included
                  </p>

                  <ul className="mb-7 flex flex-col gap-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <span className="relative size-5 shrink-0 overflow-hidden">
                          <img
                            src={plan.check}
                            alt=""
                            className="absolute inset-0 size-full max-w-none"
                          />
                        </span>
                        <span
                          className="text-[14px] sm:text-[15px] font-normal leading-tight tracking-[-0.1px] text-white"
                          style={{ fontFamily: "Inter, sans-serif" }}
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card bottom CTA */}
                <div className="mt-auto pt-2">
                  {plan.featured ? (
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleBuyNow(plan)}
                      className="group relative flex h-[42px] w-full items-center justify-center gap-2 rounded-full bg-[#4343D5]/70 backdrop-blur-md text-sm font-semibold tracking-[-0.14px] text-[#F7F7FD] border border-white/20 shadow-[0_0_24px_rgba(67,67,213,0.5),inset_0_1px_1px_rgba(255,255,255,0.3)] animate-subtle-glow hover:bg-[#525BE0]/85 hover:border-white/35 active:scale-95 transition-all duration-300 cursor-pointer disabled:opacity-50"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <span>Buy Now</span>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleBuyNow(plan)}
                      className="flex h-[42px] w-full items-center justify-center gap-2 rounded-full border border-[rgba(250,250,250,0.1)] bg-[rgba(248,246,253,0.08)] text-sm font-medium tracking-[-0.14px] text-[#F4F7F5] transition-all duration-200 hover:border-white/20 hover:bg-[rgba(248,246,253,0.14)] active:scale-[0.99] cursor-pointer disabled:opacity-50"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <span>Buy Now</span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
