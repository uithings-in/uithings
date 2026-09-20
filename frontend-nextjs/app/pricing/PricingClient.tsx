"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, Check, Info } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import type { Plan } from "../../api/plans";
import { paymentsApi } from "../../api/payments";
import { PlanTermsModal } from "../../components/PlanTermsModal";
import Navbar from "@/components/landing/Navbar";

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

interface RazorpayInstance {
  open: () => void;
  on: (
    event: "payment.failed",
    callback: (response: RazorpayFailureResponse) => void
  ) => void;
}

type RazorpayConstructor = new (options: {
  key: string | undefined;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayPaymentResponse) => Promise<void>;
  prefill: {
    name: string | undefined;
    email: string | undefined;
  };
  theme: {
    color: string;
  };
}) => RazorpayInstance;

interface PricingCardProps {
  plan: Plan;
  highlighted: boolean;
  onGetStarted: () => void;
  onShowTerms: () => void;
}

function PricingCard({ plan, highlighted, onGetStarted, onShowTerms }: PricingCardProps) {
  const price = Math.floor(plan.price / 100);
  const duration = `${plan.durationDays} Days`;
  const displayName = plan.displayName || plan.name;
  const items = (plan.features || []).slice(0, 6);

  return (
    <article
      className={
        highlighted
          ? "relative flex min-h-[600px] flex-col rounded-[24px] bg-[#054316] p-8 text-white shadow-[0_20px_40px_rgba(5,67,22,0.3)] md:-mt-8 border border-[#06501a] transition-transform hover:scale-[1.02] duration-300"
          : "relative flex min-h-[560px] flex-col rounded-[24px] bg-white p-8 text-[#0B1527] border border-gray-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-transform hover:scale-[1.02] duration-300"
      }
    >
      <button
        type="button"
        onClick={onShowTerms}
        className={
          highlighted
            ? "absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            : "absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full border border-gray-200 bg-white text-[#0B1527] transition hover:border-[#054316] hover:text-[#054316]"
        }
        aria-label={`View ${displayName} purchase terms`}
        title="Plan purchase terms"
      >
        <Info size={17} />
      </button>

      <h2 className="text-[24px] font-bold tracking-tight">{displayName}</h2>
      <p
        className={
          highlighted
            ? "mt-3 text-[14px] leading-[1.5] text-white/80"
            : "mt-3 text-[14px] leading-[1.5] text-[#64748B]"
        }
      >
        {plan.description}
      </p>

      <div className="mt-6 flex items-baseline gap-2">
        <span className="text-[52px] font-extrabold tracking-tight leading-none">
          &#8377;{price}
        </span>
        <span
          className={
            highlighted
              ? "text-[14px] font-medium text-white/60"
              : "text-[14px] font-medium text-[#94A3B8]"
          }
        >
          / {duration}
        </span>
      </div>

      <button
        type="button"
        onClick={onGetStarted}
        className={
          highlighted
            ? "mt-8 w-full rounded-[12px] bg-[#9FE870] py-3.5 text-[14px] font-bold text-[#054316] shadow-md hover:bg-[#8edb5f] transition-all cursor-pointer text-center"
            : "mt-8 w-full rounded-[12px] bg-[#054316] py-3.5 text-[14px] font-bold text-white shadow-md hover:bg-[#043311] transition-all cursor-pointer text-center"
        }
      >
        Buy Now
      </button>

      <ul className="mt-8 flex flex-col gap-4">
        {items.map((item, idx) => (
          <li key={`${item}-${idx}`} className="flex items-center gap-3 text-[14px] font-medium">
            <span
              className={
                highlighted
                  ? "grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white text-[#054316]"
                  : "grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#E5EDFF] text-[#2563EB]"
              }
            >
              <Check size={14} strokeWidth={3} />
            </span>
            <span className={highlighted ? "text-white" : "text-[#334155]"}>
              {item}
            </span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function SpatialitySection() {
  return (
    <section className="mx-auto mb-20 mt-[150px] w-full max-w-[1320px] px-5 lg:mb-24">
      <h2 className="text-center text-[34px] font-extrabold tracking-[-0.035em] text-black md:text-[42px]">
        What&apos;s our spatiality!
      </h2>

      <div
        className="mt-12 overflow-hidden rounded-[7px] border border-[#e2e2e2] px-5 py-[70px] text-center shadow-[0_1px_2px_rgba(0,0,0,0.02)] md:py-[78px]"
        style={{
          backgroundColor: "#ffffff",
          backgroundImage: [
            "radial-gradient(ellipse 46% 67% at 100% 0%, rgba(159,232,112,0.98) 0%, rgba(171,239,127,0.9) 20%, rgba(213,255,188,0.54) 43%, rgba(255,255,255,0) 71%)",
            "radial-gradient(ellipse 50% 72% at 0% 100%, rgba(159,232,112,0.98) 0%, rgba(176,242,134,0.84) 24%, rgba(220,255,199,0.5) 46%, rgba(255,255,255,0) 74%)",
            "radial-gradient(ellipse 30% 45% at 18% 53%, rgba(226,255,210,0.34) 0%, rgba(255,255,255,0) 72%)",
            "radial-gradient(ellipse 38% 50% at 80% 42%, rgba(232,255,218,0.28) 0%, rgba(255,255,255,0) 68%)",
          ].join(", "),
        }}
      >
        <span className="inline-flex rounded-full border border-[#e5e5e5] bg-white px-4 py-2 text-[12px] font-bold uppercase text-[#242424] shadow-sm">
          Upload &amp; Reuse
        </span>
        <h3 className="mx-auto mt-6 max-w-[760px] text-[34px] font-extrabold leading-[1.13] tracking-[-0.04em] text-black md:text-[52px]">
          Ready to show your genius?
        </h3>
        <p className="mx-auto mt-7 max-w-[585px] text-[22px] font-extrabold leading-[1.35] tracking-[-0.03em] text-black">
          Upload your FIGMA design &amp; join the creative community
        </p>
        <p className="mx-auto mt-[68px] max-w-[820px] text-[15px] font-medium leading-[1.55] text-[#666666]">
          Showcase your Figma designs, get inspired by others, and connect with fellow designers in the ultimate creative community.
        </p>
        <button className="mx-auto mt-10 flex h-[44px] items-center gap-4 rounded-full bg-black py-1.5 pl-6 pr-1.5 text-[12px] font-bold text-white">
          View Demo
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[#9FE870] text-black">
            <ArrowRight size={16} strokeWidth={2.5} />
          </span>
        </button>
      </div>
    </section>
  );
}

export default function PricingClient({ initialPlans }: { initialPlans: Plan[] }) {
  const { user, setLoginModalOpen } = useAuth();
  const [loading, setLoading] = useState(false);
  const [pendingPlanName, setPendingPlanName] = useState<string | null>(null);
  const [termsOpen, setTermsOpen] = useState(false);

  const { refetch: refetchSubscription } = useQuery({
    queryKey: ["subscription", "checkAccess"],
    queryFn: () => paymentsApi.checkAccess(),
    enabled: !!user,
  });

  useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const startPayment = useCallback(async (plan: Plan) => {
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
        name: "Figcomponents Pro",
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
              alert("Plan purchased! It has been queued and will activate after your current plan expires. You can also manually activate it from your Dashboard.");
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
          color: "#2563EB",
        },
      };

      const razorpay = new window.Razorpay(razorpayOptions);
      razorpay.open();

      razorpay.on("payment.failed", (response: RazorpayFailureResponse) => {
        const errMsg = `Payment failed: ${response.error.description}`;
        alert(errMsg);
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      let errMsg = "";
      errMsg = message === "SUBSCRIPTION_EXISTS"
        ? "Failed to create payment. Please try again."
        : message || "Failed to create payment. Please try again.";
      alert(errMsg);
    } finally {
      setLoading(false);
    }
  }, [refetchSubscription, user]);

  const handlePlanSelect = async (planName: string) => {
    const plan = initialPlans?.find((p) => p.name === planName);

    if (!plan) {
      alert("This plan is not available yet.");
      return;
    }

    if (!user) {
      setPendingPlanName(plan.name);
      setLoginModalOpen(true);
      return;
    }

    await startPayment(plan);
  };

  useEffect(() => {
    if (!user || !pendingPlanName || loading) return;
    const pendingPlan = initialPlans?.find((p) => p.name === pendingPlanName);
    if (!pendingPlan) return;
    window.setTimeout(() => {
      setPendingPlanName(null);
      startPayment(pendingPlan);
    }, 0);
  }, [loading, pendingPlanName, initialPlans, startPayment, user]);

  return (
    <main className="min-h-screen bg-white text-[#111111]">
      <Navbar />
      <section className="relative mx-auto w-full max-w-[1180px] px-5 pb-10 pt-[100px]">
        <div className="text-center">
          <h1 className="text-[42px] font-medium leading-[1.18] tracking-[-0.045em] text-[#161616] md:text-[54px]">
            Powerful features for
            <br />
            <span className="bg-[linear-gradient(90deg,#275ff1_8%,#64b9d7_52%,#7ac983_96%)] bg-clip-text text-transparent">
              Powerful Creators
            </span>
          </h1>
          <p className="mt-5 text-[16px] font-medium tracking-[-0.02em] text-[#222222]">
            Choose a plan that&apos;s right for you
          </p>
        </div>

        <div className="mx-auto mt-[72px] grid max-w-[960px] grid-cols-1 gap-10 md:grid-cols-3 md:items-start md:gap-[48px]">
          {initialPlans && initialPlans.length > 0 ? (
            initialPlans.map((plan, index) => (
              <PricingCard
                key={plan._id}
                plan={plan}
                highlighted={index === 1}
                onGetStarted={() => handlePlanSelect(plan.name)}
                onShowTerms={() => setTermsOpen(true)}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-20 text-[#86909c]">
              Plans are currently unavailable. Please check back later.
            </div>
          )}
        </div>

        {/* Centered Try for free Button */}
        <div className="mt-16 flex justify-center">
          <Link
            href="/components"
            className="group inline-flex h-[56px] items-center gap-5 rounded-full border border-gray-300 bg-white pl-8 pr-2 text-[15px] font-bold text-black shadow-sm transition-all hover:bg-gray-50 hover:border-black cursor-pointer"
          >
            Try for free
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[#9FE870] text-black transition-transform group-hover:translate-x-0.5">
              <ArrowRight size={20} strokeWidth={2.5} />
            </span>
          </Link>
        </div>
      </section>

      <SpatialitySection />
      <PlanTermsModal isOpen={termsOpen} onClose={() => setTermsOpen(false)} />
    </main>
  );
}
