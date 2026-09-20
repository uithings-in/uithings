"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Check, ArrowRight, Shield, Lock, FileText, ChevronRight, Zap, Crown, User, RefreshCw, Scale } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { plansApi } from "../../api/plans";
import { paymentsApi } from "../../api/payments";
import Navbar from "@/components/landing/Navbar";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

interface TocItem {
  id: string;
  label: string;
}

const tocItems: TocItem[] = [
  { id: "welcome", label: "Introduction" },
  { id: "use-of-services", label: "1. Use of Services" },
  { id: "premium-subscription", label: "2. Premium Subscription" },
  { id: "user-accounts", label: "3. User Accounts" },
  { id: "user-content", label: "4. User Content" },
  { id: "intellectual-property", label: "5. Intellectual Property" },
  { id: "limitation-of-liability", label: "6. Limitation of Liability" },
  { id: "changes-to-terms", label: "7. Changes to Terms" },
  { id: "governing-law", label: "8. Governing Law" },
];

interface PlanCardProps {
  dark?: boolean;
  title: string;
  price: string;
  period: string;
  icon: any;
  isSelected: boolean;
  onClick: () => void;
  features: string[];
  description: string;
  actionText?: string;
  onActionClick: (e: React.MouseEvent) => void;
  actionLoading?: boolean;
}

function PlanCard({
  dark = false,
  title,
  price,
  period,
  icon: Icon,
  isSelected,
  onClick,
  features,
  description,
  actionText,
  onActionClick,
  actionLoading,
}: PlanCardProps) {
  return (
    <div 
      onClick={onClick}
      className={`relative cursor-pointer transition-all duration-500 overflow-hidden ${
        dark ? "bg-black text-white" : "bg-[#f5f6f8] text-[#111111]"
      } rounded-[20px] p-10 min-h-[380px] ${
        isSelected ? "ring-2 ring-[#9FE870] ring-offset-2" : "hover:scale-[1.02]"
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className={dark ? "text-[#f39c12]" : "text-[#5dade2]"} size={22} fill="currentColor" />
        <h3 className="text-[22px] font-bold">{title}</h3>
      </div>
      <div className="mt-6 flex items-baseline gap-1">
        <p className={`text-[clamp(2.5rem,4vw,3.8rem)] font-bold leading-none ${
          dark ? "text-[#9FE870]" : "text-[#111111]"
        }`}>
          {price}
        </p>
        <span className={`text-[18px] font-medium ${dark ? "text-[#a0a0a0]" : "text-[#666666]"}`}>/{period}</span>
      </div>
      <p className={`mt-10 max-w-[240px] text-[16px] leading-[1.6] font-medium ${
        dark ? "text-[#a0a0a0]" : "text-[#666666]"
      }`}>
        {description}
      </p>
      <div className="mt-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onActionClick(e);
          }}
          disabled={actionLoading}
          className={`group inline-flex h-[56px] items-center gap-5 rounded-full py-2 pl-8 pr-2 text-[15px] font-bold transition-all disabled:opacity-50 cursor-pointer ${
            dark 
              ? "bg-[#9FE870] text-black hover:bg-[#8edb5f] shadow-[0_4px_14px_rgba(159,232,112,0.3)]" 
              : "bg-[#111111] text-white hover:bg-black shadow-[0_4px_14px_rgba(0,0,0,0.1)]"
          }`}
        >
          {actionLoading ? "Processing..." : "Buy Now"}
          <span className={`grid h-10 w-10 place-items-center rounded-full transition-transform group-hover:translate-x-0.5 ${
            dark ? "bg-white text-black" : "bg-[#9FE870] text-black"
          }`}>
            <ArrowRight size={20} strokeWidth={2.5} />
          </span>
        </button>
      </div>

      {isSelected && (
        <div className={`mt-10 pt-10 border-t lg:absolute lg:right-12 lg:top-1/2 lg:mt-0 lg:w-[48%] lg:-translate-y-1/2 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0 animate-in fade-in slide-in-from-right-4 duration-500 ${
          dark ? "border-white/10" : "border-black/10"
        }`}>
          <ul className={`space-y-6 text-[15px] font-medium ${dark ? "text-white/90" : "text-black/80"}`}>
            {features.slice(0, 6).map((item) => (
              <li key={item} className="flex items-center gap-4">
                <Check className={dark ? "text-[#9FE870]" : "text-black"} size={18} strokeWidth={3} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function TermsConditionsPage() {
  const { user, setLoginModalOpen } = useAuth();
  const [selectedPlanName, setSelectedPlanName] = useState<"basic" | "advanced">("advanced");
  const [activeSection, setActiveSection] = useState("welcome");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState("");
  const [pendingPlanName, setPendingPlanName] = useState<string | null>(null);

  // Fetch plans from DB
  const { data: plans } = useQuery({
    queryKey: ["plans"],
    queryFn: plansApi.getAllPlans,
  });

  const proStarter = plans?.find((p) => p.name === "pro_starter");
  const proUltimate = plans?.find((p) => p.name === "pro_ultimate");

  const { refetch: refetchSubscription } = useQuery({
    queryKey: ["subscription", "checkAccess"],
    queryFn: () => paymentsApi.checkAccess(),
    enabled: !!user,
  });

  // Load Razorpay SDK
  useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Scroll spy for table of contents
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 160;
      let currentSection = "welcome";

      for (const item of tocItems) {
        const el = document.getElementById(item.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          const top = rect.top + window.scrollY;
          if (scrollPosition >= top) {
            currentSection = item.id;
          }
        }
      }
      setActiveSection(currentSection);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const startPayment = useCallback(async (plan: any) => {
    setError("");
    setCheckoutLoading(true);

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
        handler: async (response: any) => {
          try {
            await paymentsApi.verifyPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature,
              plan._id
            );
            await refetchSubscription();
            alert("Payment successful! You now have Pro access.");
          } catch (err) {
            setError("Payment verification failed. Please contact support.");
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

      razorpay.on("payment.failed", (response: any) => {
        const errMsg = `Payment failed: ${response.error.description}`;
        setError(errMsg);
        alert(errMsg);
      });
    } catch (err: any) {
      let errMsg = "";
      errMsg = err.message === "SUBSCRIPTION_EXISTS"
        ? "Failed to create payment. Please try again."
        : err.message || "Failed to create payment. Please try again.";
      setError(errMsg);
      alert(errMsg);
    } finally {
      setCheckoutLoading(false);
    }
  }, [refetchSubscription, user]);

  const handlePlanSelect = async (planName: string) => {
    const plan = plans?.find((p) => p.name === planName);

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
    if (!user || !pendingPlanName || checkoutLoading) return;
    const pendingPlan = plans?.find((p) => p.name === pendingPlanName);
    if (!pendingPlan) return;
    setPendingPlanName(null);
    startPayment(pendingPlan);
  }, [checkoutLoading, pendingPlanName, plans, startPayment, user]);

  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const rect = el.getBoundingClientRect();
      const top = rect.top + window.scrollY - 120;
      window.scrollTo({
        top: top,
        behavior: "smooth"
      });
    }
  };

  const basicFeatures = [
    "100 Components",
    "Figma variables",
    "Dark mode variables",
    "Component properties",
    "Interactive components",
    "Auto Layout 5.0",
  ];

  const advancedFeatures = [
    "250 Components",
    "Figma variables",
    "Dark mode variables",
    "Component properties",
    "Interactive components",
    "Auto Layout 5.0",
  ];

  return (
    <main className="w-full bg-[#fcfdfa] text-[#111111] font-sans pt-[60px]">
      <Navbar />
      {/* Main Content Layout Container */}
      <div className="w-full max-w-[1344px] mx-auto bg-white border-x border-[#e5e7eb] grid lg:grid-cols-[280px_1fr] items-start relative">
        {/* Sticky Table of Contents Sidebar */}
        <aside className="hidden lg:block sticky top-[60px] h-[calc(100vh-60px)] bg-white border-r border-[#e5e7eb] py-8 px-6 overflow-y-auto self-start">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Table of Contents</p>
          <nav className="flex flex-col gap-2">
            {tocItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleScrollTo(item.id)}
                className={`text-left text-[14px] font-medium py-2 px-3 rounded-lg transition-all flex items-center justify-between ${
                  activeSection === item.id
                    ? "bg-[#9FE870]/20 text-[#2c5114] font-semibold"
                    : "text-gray-600 hover:text-black hover:bg-gray-50"
                }`}
              >
                <span>{item.label}</span>
                {activeSection === item.id && <ChevronRight size={14} className="text-[#2c5114]" />}
              </button>
            ))}
          </nav>
        </aside>

        {/* Terms Content */}
        <div className="p-6 md:p-12 lg:p-16 space-y-12 max-w-[900px] w-full">
          {/* Header/Title Block inside the Right Column */}
          <div className="space-y-4 pb-4">
            <span className="text-[12px] font-bold text-[#54992e] uppercase tracking-wider bg-[#54992e]/10 px-3.5 py-1.5 rounded-full inline-block">
              Last Revised: September May, 2026
            </span>
            <h1 className="font-outfit text-[38px] md:text-[50px] font-bold tracking-tight text-[#111111] leading-none mt-2">
              Terms & Condition
            </h1>
          </div>

          <hr className="border-gray-100" />
          {/* Welcome Section */}
          <section id="welcome" className="scroll-mt-32 space-y-4">
            <p className="text-[16px] leading-[1.7] text-[#4d4d4d]">
              Welcome to <span className="font-semibold text-black">Figma Components</span>! These Terms & Conditions govern your use of our website and services. By accessing or using our website, you agree to these terms. If you do not agree, please do not use our services.
            </p>
          </section>

          <hr className="border-gray-100" />

          {/* Section 1 */}
          <section id="use-of-services" className="scroll-mt-32 space-y-6">
            <h2 className="font-outfit text-[24px] font-semibold text-black flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#9FE870]/20 text-[#2c5114] text-[15px] font-bold">1</span>
              Use of Services
            </h2>
            <div className="space-y-4">
              <p className="text-[16px] leading-[1.7] text-[#4d4d4d]">
                Figma Components provides UI components, templates, and design resources for personal and commercial use. You may customize and use our resources in your own projects, but you may not resell, redistribute, or share them as standalone products.
              </p>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Section 2 */}
          <section id="premium-subscription" className="scroll-mt-32 space-y-6">
            <h2 className="font-outfit text-[24px] font-semibold text-black flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#9FE870]/20 text-[#2c5114] text-[15px] font-bold">2</span>
              Premium Subscription
            </h2>
            <div className="space-y-4">
              <p className="text-[16px] leading-[1.7] text-[#4d4d4d]">
                By purchasing a premium plan, you agree that:
              </p>
              
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 space-y-4">
                <ul className="space-y-3">
                  {[
                    "Subscriptions may renew automatically based on the selected billing cycle.",
                    "You can cancel your subscription anytime before the next billing date.",
                    "Access to premium features will remain active until the current billing period ends.",
                    "Lifetime access refers to the active lifetime of the product and services provided by Figma Components.",
                  ].map((item, idx) => (
                    <li key={idx} className="flex gap-3 items-start">
                      <span className="h-5 w-5 shrink-0 rounded-full bg-[#9FE870] flex items-center justify-center mt-1 text-black font-bold text-[10px]">✓</span>
                      <span className="text-[15px] text-[#4d4d4d] leading-normal">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Section 3 */}
          <section id="user-accounts" className="scroll-mt-32 space-y-6">
            <h2 className="font-outfit text-[24px] font-semibold text-black flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#9FE870]/20 text-[#2c5114] text-[15px] font-bold">3</span>
              User Accounts
            </h2>
            <div className="space-y-4">
              <p className="text-[16px] leading-[1.7] text-[#4d4d4d]">
                You may need to create an account to access certain features. You are responsible for maintaining the security of your account and all activities under it.
              </p>
              <div className="bg-yellow-50/50 border border-yellow-100 rounded-2xl p-5 space-y-3">
                <h3 className="font-semibold text-yellow-800 text-[15px] flex items-center gap-2">
                  <User size={16} /> Account Security Note:
                </h3>
                <p className="text-[14px] leading-relaxed text-yellow-900/80">
                  We reserve the right to suspend or terminate accounts that violate these Terms.
                </p>
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Section 4 */}
          <section id="user-content" className="scroll-mt-32 space-y-6">
            <h2 className="font-outfit text-[24px] font-semibold text-black flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#9FE870]/20 text-[#2c5114] text-[15px] font-bold">4</span>
              User Content
            </h2>
            <p className="text-[16px] leading-[1.7] text-[#4d4d4d]">
              You are responsible for any content you upload, post, or share on the website.
            </p>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="border border-gray-100 rounded-2xl p-5 bg-green-50/20">
                <h4 className="font-bold text-[15px] text-green-800 mb-3 uppercase tracking-wider">You May:</h4>
                <ul className="space-y-2">
                  {[
                    "Showcase projects made using our components",
                    "Share feedback and reviews",
                  ].map((item, idx) => (
                    <li key={idx} className="flex gap-2.5 items-center text-[14px] text-[#4d4d4d]">
                      <span className="h-1.5 w-1.5 bg-[#54992e] rounded-full shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="border border-gray-100 rounded-2xl p-5 bg-red-50/10">
                <h4 className="font-bold text-[15px] text-red-800 mb-3 uppercase tracking-wider">You May Not:</h4>
                <ul className="space-y-2">
                  {[
                    "Upload illegal, harmful, or offensive content",
                    "Infringe on copyrights or trademarks",
                    "Misrepresent your affiliation with Figma Components",
                  ].map((item, idx) => (
                    <li key={idx} className="flex gap-2.5 items-center text-[14px] text-[#4d4d4d]">
                      <span className="h-1.5 w-1.5 bg-red-500 rounded-full shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Section 5 */}
          <section id="intellectual-property" className="scroll-mt-32 space-y-6">
            <h2 className="font-outfit text-[24px] font-semibold text-black flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#9FE870]/20 text-[#2c5114] text-[15px] font-bold">5</span>
              Intellectual Property
            </h2>
            <div className="flex gap-4 items-start">
              <span className="p-2 bg-[#9FE870]/10 text-[#2c5114] rounded-lg mt-1 shrink-0"><Lock size={18} /></span>
              <div>
                <p className="text-[16px] leading-[1.7] text-[#4d4d4d]">
                  All website content, branding, designs, and resources remain the property of Figma Components. Unauthorized copying, resale, or redistribution is prohibited.
                </p>
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Section 6 */}
          <section id="limitation-of-liability" className="scroll-mt-32 space-y-6">
            <h2 className="font-outfit text-[24px] font-semibold text-black flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#9FE870]/20 text-[#2c5114] text-[15px] font-bold">6</span>
              Limitation of Liability
            </h2>
            <div className="flex gap-4 items-start">
              <span className="p-2 bg-[#9FE870]/10 text-[#2c5114] rounded-lg mt-1 shrink-0"><Shield size={18} /></span>
              <div>
                <p className="text-[16px] leading-[1.7] text-[#4d4d4d]">
                  Our services are provided "as is" without warranties of any kind. Figma Components will not be responsible for any direct or indirect damages resulting from the use of our website or resources.
                </p>
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Section 7 */}
          <section id="changes-to-terms" className="scroll-mt-32 space-y-6">
            <h2 className="font-outfit text-[24px] font-semibold text-black flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#9FE870]/20 text-[#2c5114] text-[15px] font-bold">7</span>
              Changes to Terms
            </h2>
            <div className="flex gap-4 items-start">
              <span className="p-2 bg-[#9FE870]/10 text-[#2c5114] rounded-lg mt-1 shrink-0"><RefreshCw size={18} /></span>
              <div>
                <p className="text-[16px] leading-[1.7] text-[#4d4d4d]">
                  We may update these Terms & Conditions at any time. Continued use of the website after changes means you accept the revised terms.
                </p>
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Section 8 */}
          <section id="governing-law" className="scroll-mt-32 space-y-6">
            <h2 className="font-outfit text-[24px] font-semibold text-black flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#9FE870]/20 text-[#2c5114] text-[15px] font-bold">8</span>
              Governing Law
            </h2>
            <div className="flex gap-4 items-start">
              <span className="p-2 bg-[#9FE870]/10 text-[#2c5114] rounded-lg mt-1 shrink-0"><Scale size={18} /></span>
              <div>
                <p className="text-[16px] leading-[1.7] text-[#4d4d4d]">
                  These Terms & Conditions are governed by the applicable laws of your local jurisdiction.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Pricing Cards Section */}
      <section id="pricing" className="w-full bg-[#f8f9fa] border-t border-[#e5e7eb]">
        <div className="mx-auto w-full max-w-[1344px] border-x border-[#e5e7eb] bg-[#f8f9fa] px-6 py-24 md:px-12 lg:px-16">
          <div className="mx-auto max-w-[780px] text-center">
            <span className="mx-auto inline-flex rounded-full border border-[#d7d7d7] bg-white px-6 py-2 text-sm font-semibold uppercase tracking-wider text-black">
              Pricing & plans
            </span>
            <h2 className="mt-8 font-outfit text-[clamp(2.3rem,3.6vw,4.2rem)] font-medium leading-[1.1] text-[#111111]">
              Developing strong ideas into relatable and concrete
            </h2>
            

          </div>

          {/* Cards Wrapper */}
          <div className={`mt-16 grid gap-8 transition-all duration-500 lg:items-start ${
            selectedPlanName === "basic" ? "lg:grid-cols-[2.1fr_0.9fr]" : "lg:grid-cols-[0.9fr_2.1fr]"
          }`}>
            <PlanCard
              title="Basic plan"
              price={proStarter ? `₹ ${Math.floor(proStarter.price / 100)}` : "₹ 99"}
              period={proStarter ? `${proStarter.durationDays} Days` : "180 Days"}
              icon={Zap}
              isSelected={selectedPlanName === "basic"}
              onClick={() => setSelectedPlanName("basic")}
              features={proStarter?.features || basicFeatures}
              description={proStarter?.description || "Simple structures, leading to a focus on user experience."}
              actionText="Get Started"
              onActionClick={() => handlePlanSelect("pro_starter")}
              actionLoading={checkoutLoading && pendingPlanName === "pro_starter"}
            />
            
            <PlanCard
              dark
              title="Advanced plan"
              price={proUltimate ? `₹ ${Math.floor(proUltimate.price / 100)}` : "₹ 199"}
              period={proUltimate ? `${proUltimate.durationDays} Days` : "180 Days"}
              icon={Crown}
              isSelected={selectedPlanName === "advanced"}
              onClick={() => setSelectedPlanName("advanced")}
              features={proUltimate?.features || advancedFeatures}
              description={proUltimate?.description || "Highly customized layout to help you stand out."}
              actionText="Try Now"
              onActionClick={() => handlePlanSelect("pro_ultimate")}
              actionLoading={checkoutLoading && pendingPlanName === "pro_ultimate"}
            />
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
        </div>
      </section>
    </main>
  );
}
