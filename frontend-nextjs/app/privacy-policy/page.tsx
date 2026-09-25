"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Check, ArrowRight, Shield, Eye, Lock, FileText, ChevronRight, Zap, Crown } from "lucide-react";
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
  { id: "info-collect", label: "1. Information We Collect" },
  { id: "info-use", label: "2. How We Use Your Info" },
  { id: "info-share", label: "3. Sharing Your Info" },
  { id: "data-retention", label: "4. Data Retention" },
  { id: "choices", label: "5. Your Choices" },
  { id: "security", label: "6. Security" },
  { id: "rights", label: "7. Your Rights" },
  { id: "third-party", label: "8. Third-Party Links" },
  { id: "children", label: "9. Children's Privacy" },
  { id: "updates", label: "10. Policy Updates" },
  { id: "contact", label: "11. Contact Us" },
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

export default function PrivacyPolicyPage() {
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

        {/* Policy Content */}
        <div className="p-6 md:p-12 lg:p-16 space-y-12 max-w-[900px] w-full">
          {/* Header/Title Block inside the Right Column */}
          <div className="space-y-4 pb-4">
            <span className="text-[12px] font-bold text-[#54992e] uppercase tracking-wider bg-[#54992e]/10 px-3.5 py-1.5 rounded-full inline-block">
              Last Revised: December 20, 2024
            </span>
            <h1 className="font-outfit text-[38px] md:text-[50px] font-bold tracking-tight text-[#111111] leading-none mt-2">
              Privacy Policy
            </h1>
            <p className="text-[16px] md:text-[18px] leading-[1.6] text-[#565656] mt-4">
              Welcome to FigComponents. We value your privacy and are committed to protecting your personal data in accordance with modern security standards.
            </p>
          </div>

          <hr className="border-gray-100" />
          {/* Welcome Section */}
          <section id="welcome" className="scroll-mt-32 space-y-4">
            <p className="text-[16px] leading-[1.7] text-[#4d4d4d]">
              Welcome to <span className="font-semibold text-black">figma components</span>. We value your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
            </p>
            <p className="text-[16px] leading-[1.7] text-[#4d4d4d]">
              By accessing our website or using our services, you agree to the terms of this privacy policy.
            </p>
          </section>

          <hr className="border-gray-100" />

          {/* Section 1 */}
          <section id="info-collect" className="scroll-mt-32 space-y-6">
            <h2 className="font-outfit text-[24px] font-semibold text-black flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#9FE870]/20 text-[#2c5114] text-[15px] font-bold">1</span>
              Information We Collect
            </h2>
            <div className="space-y-4">
              <p className="text-[16px] leading-[1.7] text-[#4d4d4d]">
                We collect information that you directly provide to us when using our services.
              </p>
              
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 space-y-4">
                <h3 className="font-semibold text-black text-[15px] uppercase tracking-wider">Information You Provide to Us:</h3>
                <p className="text-[15px] text-[#565656]">We may collect personal information that you provide when you create an account, purchase a subscription, sign up for our newsletter, or contact customer support. This includes:</p>
                <ul className="grid sm:grid-cols-2 gap-3">
                  {[
                    { label: "Personal Details", desc: "First name, last name, username" },
                    { label: "Contact Details", desc: "Email address, phone number" },
                    { label: "Billing Details", desc: "Billing address" },
                    { label: "Transaction Details", desc: "History of purchases and downloads" },
                    { label: "Marketing Preferences", desc: "Communication preferences" },
                  ].map((item, idx) => (
                    <li key={idx} className="flex gap-3 items-start">
                      <span className="h-5 w-5 shrink-0 rounded-full bg-[#9FE870] flex items-center justify-center mt-1 text-black font-bold text-[10px]">✓</span>
                      <div className="text-[14px]">
                        <span className="font-semibold text-black">{item.label}:</span>{" "}
                        <span className="text-[#565656]">{item.desc}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-yellow-50/50 border border-yellow-100 rounded-2xl p-5 space-y-3">
                <h3 className="font-semibold text-yellow-800 text-[15px] flex items-center gap-2">
                  <Lock size={16} /> Payment Information Note:
                </h3>
                <p className="text-[14px] leading-relaxed text-yellow-900/80">
                  We use trusted third-party processors to handle all payment details (such as your credit card information). We do not store or process your credit card numbers directly on our servers.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <h3 className="font-semibold text-black text-[16px]">Information We Collect Automatically:</h3>
                <p className="text-[15px] leading-relaxed text-[#565656]">
                  When you interact with our website, we may automatically collect usage and device data including your IP address, browser type, operating system, device details, page interaction data, and referrer URLs.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <h3 className="font-semibold text-black text-[16px]">Cookies and Tracking Technologies:</h3>
                <p className="text-[15px] leading-relaxed text-[#565656]">
                  We use cookies and similar tracking technologies to track activity on our service and hold certain information. You can instruct your browser to refuse all cookies. However, if you do not accept cookies, some features of our service may not function correctly.
                </p>
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Section 2 */}
          <section id="info-use" className="scroll-mt-32 space-y-6">
            <h2 className="font-outfit text-[24px] font-semibold text-black flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#9FE870]/20 text-[#2c5114] text-[15px] font-bold">2</span>
              How We Use Your Information
            </h2>
            <p className="text-[16px] leading-[1.7] text-[#4d4d4d]">
              We use your personal data to provide, maintain, optimize and improve our services. Specifically, we use it for:
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                "Providing and managing your account",
                "Processing transactions and secure payments",
                "Personalizing your design experience on our website",
                "Contacting you regarding updates or support requests",
                "Sending weekly newsletters & promotional materials",
                "Monitoring and analyzing usage trends and security",
                "Complying with statutory and legal obligations",
              ].map((item, idx) => (
                <div key={idx} className="flex gap-3 items-center bg-gray-50 border border-gray-100/50 rounded-xl p-3.5">
                  <span className="h-2 w-2 rounded-full bg-[#9FE870] shrink-0" />
                  <span className="text-[14px] font-medium text-[#4d4d4d]">{item}</span>
                </div>
              ))}
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Section 3 */}
          <section id="info-share" className="scroll-mt-32 space-y-6">
            <h2 className="font-outfit text-[24px] font-semibold text-black flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#9FE870]/20 text-[#2c5114] text-[15px] font-bold">3</span>
              Sharing Your Information
            </h2>
            <p className="text-[16px] leading-[1.7] text-[#4d4d4d]">
              We do not sell, trade, or otherwise transfer your personal information to outside third parties. We only share details in specific circumstances:
            </p>
            <ul className="space-y-4">
              <li className="flex gap-4 items-start">
                <span className="p-2 bg-[#9FE870]/10 text-[#2c5114] rounded-lg mt-1 shrink-0"><Shield size={18} /></span>
                <div>
                  <h4 className="font-semibold text-black text-[15px]">Service Providers</h4>
                  <p className="text-[14px] text-[#565656] leading-relaxed">We share data with trusted service providers who help us run our platform, process transactions, host servers, and offer customer support.</p>
                </div>
              </li>
              <li className="flex gap-4 items-start">
                <span className="p-2 bg-[#9FE870]/10 text-[#2c5114] rounded-lg mt-1 shrink-0"><Lock size={18} /></span>
                <div>
                  <h4 className="font-semibold text-black text-[15px]">Legal Requirements</h4>
                  <p className="text-[14px] text-[#565656] leading-relaxed">We may disclose your information if required to do so by law or in response to valid requests by public authorities (such as a court order or government agency).</p>
                </div>
              </li>
              <li className="flex gap-4 items-start">
                <span className="p-2 bg-[#9FE870]/10 text-[#2c5114] rounded-lg mt-1 shrink-0"><FileText size={18} /></span>
                <div>
                  <h4 className="font-semibold text-black text-[15px]">Business Transfers</h4>
                  <p className="text-[14px] text-[#565656] leading-relaxed">In the event of a merger, acquisition, or asset sale, your personal data may be transferred, subject to maintaining the same levels of privacy protection.</p>
                </div>
              </li>
            </ul>
          </section>

          <hr className="border-gray-100" />

          {/* Section 4 */}
          <section id="data-retention" className="scroll-mt-32 space-y-6">
            <h2 className="font-outfit text-[24px] font-semibold text-black flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#9FE870]/20 text-[#2c5114] text-[15px] font-bold">4</span>
              Data Retention
            </h2>
            <p className="text-[16px] leading-[1.7] text-[#4d4d4d]">
              We will retain your personal information only for as long as is necessary to fulfill the purposes outlined in this policy, including:
            </p>
            <div className="grid sm:grid-cols-2 gap-3 pl-4">
              {[
                "Personal details and contact information",
                "Transactional logs and billing documentation",
                "Marketing preferences and communication logs",
                "System security and integrity records",
              ].map((item, idx) => (
                <div key={idx} className="flex gap-3 items-center text-[14px] text-[#565656]">
                  <span className="h-1.5 w-1.5 bg-[#54992e] rounded-full shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Section 5 */}
          <section id="choices" className="scroll-mt-32 space-y-6">
            <h2 className="font-outfit text-[24px] font-semibold text-black flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#9FE870]/20 text-[#2c5114] text-[15px] font-bold">5</span>
              Your Choices
            </h2>
            <p className="text-[16px] leading-[1.7] text-[#4d4d4d]">
              You have complete control over your personal information:
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50/50">
                <h4 className="font-bold text-[14px] text-black mb-1">Account Info</h4>
                <p className="text-xs text-[#565656] leading-relaxed">Update, correct, or request deletion of your account credentials at any time.</p>
              </div>
              <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50/50">
                <h4 className="font-bold text-[14px] text-black mb-1">Email Opt-Out</h4>
                <p className="text-xs text-[#565656] leading-relaxed">Opt-out of newsletters or marketing updates by clicking the unsubscribe link.</p>
              </div>
              <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50/50">
                <h4 className="font-bold text-[14px] text-black mb-1">Manage Cookies</h4>
                <p className="text-xs text-[#565656] leading-relaxed">Adjust your local browser settings to disable, reject, or delete cookies.</p>
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Section 6 */}
          <section id="security" className="scroll-mt-32 space-y-6">
            <h2 className="font-outfit text-[24px] font-semibold text-black flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#9FE870]/20 text-[#2c5114] text-[15px] font-bold">6</span>
              Security
            </h2>
            <p className="text-[16px] leading-[1.7] text-[#4d4d4d]">
              The security of your personal data is our top priority. We employ industry-standard organizational and technical security measures (including secure HTTPS encryption, access keys, and secure server environments) to safeguard your information against unauthorized access, theft, or modifications.
            </p>
          </section>

          <hr className="border-gray-100" />

          {/* Section 7 */}
          <section id="rights" className="scroll-mt-32 space-y-6">
            <h2 className="font-outfit text-[24px] font-semibold text-black flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#9FE870]/20 text-[#2c5114] text-[15px] font-bold">7</span>
              Your Rights
            </h2>
            <p className="text-[16px] leading-[1.7] text-[#4d4d4d]">
              Depending on your jurisdiction, you may have specific data rights, including:
            </p>
            <div className="grid gap-3.5">
              {[
                "The right to request access to and receive copies of your personal data",
                "The right to request corrections or updates to inaccurate information",
                "The right to request complete deletion of your data (subject to compliance exceptions)",
                "The right to object to or restrict processing of your information",
                "The right to data portability (transferring your data to another service)",
              ].map((item, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <span className="text-[#54992e] font-bold mt-0.5">•</span>
                  <span className="text-[14px] text-[#4d4d4d]">{item}</span>
                </div>
              ))}
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Section 8 */}
          <section id="third-party" className="scroll-mt-32 space-y-4">
            <h2 className="font-outfit text-[24px] font-semibold text-black flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#9FE870]/20 text-[#2c5114] text-[15px] font-bold">8</span>
              Third-Party Links
            </h2>
            <p className="text-[16px] leading-[1.7] text-[#4d4d4d]">
              Our website may contain links to outside websites or services. We are not responsible for the privacy practices, tracking methods, cookies, or content of those third-party websites. We suggest you review their privacy policies carefully when visiting them.
            </p>
          </section>

          <hr className="border-gray-100" />

          {/* Section 9 */}
          <section id="children" className="scroll-mt-32 space-y-4">
            <h2 className="font-outfit text-[24px] font-semibold text-black flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#9FE870]/20 text-[#2c5114] text-[15px] font-bold">9</span>
              Children's Privacy
            </h2>
            <p className="text-[16px] leading-[1.7] text-[#4d4d4d]">
              Our services are not intended for or directed to children under the age of 13. We do not knowingly collect, store, or process personal information from children under 13. If we discover a child under 13 has provided us with personal information, we will delete it immediately.
            </p>
          </section>

          <hr className="border-gray-100" />

          {/* Section 10 */}
          <section id="updates" className="scroll-mt-32 space-y-4">
            <h2 className="font-outfit text-[24px] font-semibold text-black flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#9FE870]/20 text-[#2c5114] text-[15px] font-bold">10</span>
              Updates to This Policy
            </h2>
            <p className="text-[16px] leading-[1.7] text-[#4d4d4d]">
              We may update our privacy policy from time to time. If we make any revisions, we will update the "Last Revised" date at the top of this page. We encourage you to review this policy periodically to stay informed about how we protect your information.
            </p>
          </section>

          <hr className="border-gray-100" />

          {/* Section 11 */}
          <section id="contact" className="scroll-mt-32 space-y-6">
            <h2 className="font-outfit text-[24px] font-semibold text-black flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#9FE870]/20 text-[#2c5114] text-[15px] font-bold">11</span>
              Contact Us
            </h2>
            <p className="text-[16px] leading-[1.7] text-[#4d4d4d]">
              If you have any questions, comments, or concerns regarding this Privacy Policy or our practices, please get in touch with us:
            </p>
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 grid sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Email Support</p>
                <a href="mailto:support@uithings.site" className="text-[15px] font-semibold text-[#2c5114] hover:underline flex items-center gap-1.5">
                  support@uithings.site
                </a>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Contact Page</p>
                <Link href="#" className="text-[15px] font-semibold text-[#2c5114] hover:underline flex items-center gap-1.5">
                  figma-components.site/contact
                </Link>
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
