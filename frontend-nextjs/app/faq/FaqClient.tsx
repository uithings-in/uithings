"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Search, MessageSquare, ArrowRight } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import CtaAndFooterSection from "@/components/landing/CtaAndFooterSection";
import StarField from "@/components/landing/StarField";

interface FaqItem {
  category: "General" | "Licensing" | "Billing & Plans" | "Figma & Features" | "Support & Account";
  question: string;
  answer: string[];
}

const categories = [
  "All",
  "General",
  "Licensing",
  "Billing & Plans",
  "Figma & Features",
  "Support & Account",
] as const;

type CategoryType = (typeof categories)[number];

const faqs: FaqItem[] = [
  // General
  {
    category: "General",
    question: "What is Figmacomponents?",
    answer: [
      "Don't want to waste thousands of hours starting over with every job and putting the same parts back together again and again? Figma Components has everything you need to make websites and apps that look modern and great.",
      "Join over 1000+ artists from the best companies in the world. Get any project off the ground, save a lot of time, and become a better creator.",
    ],
  },
  {
    category: "General",
    question: "In what way do I require a UI kit or component library?",
    answer: [
      "That is a good question! This was something we always asked. When you first use a good UI kit or component library, you don't know how useful it is. When you buy a good UI kit, you don't have to spend as much time and money making the same parts over and over again. It can speed up your work 10–100 times.",
    ],
  },
  {
    category: "Figma & Features",
    question: "Does Figmacomponents include the new Figma features?",
    answer: [
      "Yes! We’ve totally refactored Figmacomponents to support Figma’s latest new features, including those released at Framework 2024, Config 2024, and Config 2025. This includes color variables (dark mode), spacing, radius, font, and effects variables, Auto Layout 5.0, min/max widths, Auto Layout wrapping, and much more.",
      "We’re always working to make Figmacomponents better than ever by adding new Figma features as quickly as possible. All Figmacomponents goods come with free updates for life. After each update, we’ll send you an email with what’s new and post it in our notes.",
      "Please note we have made the choice not to implement Figma's new Grid feature into Figmacomponents just yet. It is still in beta and missing key features.",
    ],
  },
  {
    category: "General",
    question: "What is the difference between the three versions?",
    answer: [
      "The Figmacomponents Figma version has been divided into three distinct versions:",
      "Basic version: 100 Components, Figma variables, Dark mode variables, Component properties, Interactive components, Auto Layout 5.0, Single user license, Design System",
      "Advance Version: 250 Components, Figma variables, Dark mode variables, Component properties, Interactive components, Auto Layout 5.0, Single user license, Design System",
      "Premium+ Version: Unlimited Components, Figma variables, Dark mode variables, Component properties, Interactive components, Auto Layout 5.0, Single user license, Design System",
    ],
  },
  {
    category: "Figma & Features",
    question: "Is the kit available in dark mode?",
    answer: [
      "Use robust and user-friendly color variables to transition to dark mode. Color variables and dark mode, two of Figma's most recent features that were unveiled at Config 2024 and Config 2025, are supported by all version. With only one click, you can change any element, layout, or site to dark mode using variables!",
      "By visiting the example marketing website and application example pages in Figmacomponents, you can see how this operates.",
    ],
  },
  // Free version
  {
    category: "General",
    question: "Is there a free version available?",
    answer: [
      "Indeed, Figmacomponents Figma is available for free!",
      "Although it lacks some of the most recent component property capabilities, variables, and Auto Layout 5.0 features revealed at Config 2023, Framework 2024, Config 2024, and Config 2025, it is a very potent and helpful Figma UI kit on its own.",
      "This free UI kit can be duplicated and used in any number of applications, including commercial ones.",
    ],
  },
  {
    category: "General",
    question: "What does the free version include?",
    answer: [
      "The free edition of Figmacomponents is essentially a slimmed-down version of the full UI kit. It includes global styles, basic components, and a few page samples. Try out the free version!",
    ],
  },
  // Account access
  {
    category: "Support & Account",
    question: "How do I login in to my account?",
    answer: [
      "The email address you used to buy Figmacomponents can be used to log in.",
    ],
  },
  {
    category: "Support & Account",
    question: "Why can't I sign in using my email?",
    answer: [
      "Please make sure you are using the same email address as you used to purchase Figmacomponents and verify your address for typos.",
      "We can assist you at support@uithings.site if you become extremely stuck. Despite our limited staff size, we will respond to you as quickly as we can.",
    ],
  },
  // Using Figma
  {
    category: "Figma & Features",
    question: "Do I need to know how to use Figma?",
    answer: [
      "The more sophisticated features of Figma, such as nested components, variants, Auto Layout 5.0, interactive components, the new component properties announced at Config 2022, and the new variables and Auto Layout 5.0 features announced at Config 2023, Framework 2024, Config 2024, and Config 2025, are fully utilized by Figmacomponents.",
      "Check out our free version of Figma to see if it's a good fit if you're new to it or eager to discover best practices. When you're ready, the complete version will always be available. For the finest tutorials on these capabilities, we also suggest visiting Figma's Help Center.",
    ],
  },
  {
    category: "Figma & Features",
    question: "Do I need to use variables?",
    answer: [
      "If you don't need or want to utilize variables, you don't have to! We go into greater detail about this subject on the Figmacomponent’s variables documentation page.",
      "You have complete control over whether or not to use variables. Two versions of Figmacomponents have been released: one that uses radius, color, and spacing variables, and another that uses styles. You may try both and choose which works best for your workflow because they are both included!",
    ],
  },
  // Support
  {
    category: "Support & Account",
    question: "How does support work?",
    answer: [
      "Please email us at support@uithings.site if you have any queries regarding your license or are experiencing difficulties using Figmacomponents. Use the same email address you used to buy Figmacomponents to get in touch with us. Despite our small team size, we will try our best to respond to you as soon as we can.",
      "Please be aware that we do not provide general Figma help or assistance with utilizing Figma features; we are not Figma support. We advise you to start by visiting our Figma Help Center if you have any questions about Figma. Their paperwork, support materials, and instructional materials are very thorough and beneficial.",
      "For important features like components, variations, Auto Layout 5.0, interactive components, and component characteristics, Figma also offers excellent tutorials.",
    ],
  },
  {
    category: "Support & Account",
    question: "Do you provide video tutorials?",
    answer: [
      "We're working on it, but not yet! We've worked hard to make Figmacomponents products as user-friendly as possible in the interim, and we're adding even more notes and component documentation.",
    ],
  },
  // Education discounts
  {
    category: "Billing & Plans",
    question: "Do you provide an education discount?",
    answer: [
      "We currently do not offer an education discount. Please keep an eye on our promotions page for future offers and discounts.",
    ],
  },
  // Affiliates
  {
    category: "Support & Account",
    question: "Do you have an affiliate program?",
    answer: [
      "We currently do not offer an affiliate program. While we appreciate the interest from individuals and organizations looking to partner with us, there are no affiliate opportunities available at this time. Please check back in the future for any updates regarding partnership or referral programs.",
    ],
  },
  // Licensing
  {
    category: "Licensing",
    question: "Can I use Figmacomponents for commercial projects?",
    answer: [
      "Indeed! Figmacomponents available for usage in a personal and business projects.",
      "You can use Figmacomponents as long as you don't resell, redistribute, repackage, or repurpose it to make competing or comparable products—even for different frameworks! Before making a purchase, please see our license agreement.",
      "Please contact hello@untitledui.com if you have any questions about our license agreement so we can answer them.",
    ],
  },
  {
    category: "Licensing",
    question: "Can I use Figmacomponents for multiple projects?",
    answer: [
      "Of course! With lifetime free updates, you can use Figmacomponents for as many projects as you like. Before making a purchase, please see our license agreement.",
    ],
  },
  {
    category: "Licensing",
    question: "Do I need a team license?",
    answer: [
      "We currently do not offer team licenses. Our services are available through individual subscriptions only. If team or organization licensing options become available in the future, we will share updates on our website and through our official communication channels.",
    ],
  },
  // Payments & billing
  {
    category: "Billing & Plans",
    question: "Is it a one-time purchase?",
    answer: [
      "Every Figmacomponents product requires a single purchase and payment. Purchase once and use it time frame.",
      "Basic: 90 days (may be change as provide offers!)",
      "Advance: 90 days (may be change as provide offers!)",
      "Premium+: 180 days (may be change as provide offers!)",
      "Any Figmacomponents product that you purchase will grant you free access to all future updates. We'll notify you of any updates and enhancements.",
    ],
  },
  {
    category: "Figma & Features",
    question: "Do I need to pay for Figma?",
    answer: [
      "For individuals, Figma's Starter plan is completely free. A Professional plan is required if you need to utilize more sophisticated features like team libraries, dev mode, or multiple variable modes. Find out more about the cost of Figma.",
      "Figma has kindly declared that all of its paid benefits are completely free for instructors and students! Figma Education has more information.",
    ],
  },
  {
    category: "Billing & Plans",
    question: "Are payments secure?",
    answer: [
      "To process payments, we use Razorpay Payment Gateway. You're rather safe because they employ secure 128-bit SSL encrypted payments!",
    ],
  },
  {
    category: "Billing & Plans",
    question: "Can I purchase via PayPal or Alipay or WeChat Pay?",
    answer: [
      "We currently do not support PayPal, Alipay, or WeChat Pay as payment methods. We are continually evaluating additional payment options to better serve our customers, but these payment services are not available at this time. Please refer to our checkout page for the list of supported payment methods.",
    ],
  },
  {
    category: "Billing & Plans",
    question: "Can I get an invoice?",
    answer: [
      "Receive instant invoice confirmation directly in your email after every purchase. Keep track of your orders, payments, and transaction details with ease and confidence.",
    ],
  },
  {
    category: "Billing & Plans",
    question: "What is your refund policy?",
    answer: [
      "We no longer provide refunds because our products are digital. We offer 100% free versions of all our goods so you may test them out before making a purchase since we fully support Figmacomponents and know you'll enjoy it too.",
      "Before making a purchase, please check out the full versions of Figmacomponernts.",
      "Sadly, there were numerous instances of customers continuing to utilize our items in commercial projects after receiving a refund due to the frequent abuse of our old refund policy. The complete policy is available in our License Agreement.",
    ],
  },
];

export default function FaqClient() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesCategory =
        selectedCategory === "All" || faq.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesQuery =
        faq.question.toLowerCase().includes(q) ||
        faq.answer.some((p) => p.toLowerCase().includes(q));

      return matchesCategory && matchesQuery;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="relative min-h-screen [overflow-x:clip] bg-[#070416] font-sans text-[#F7F7FD] selection:bg-[#4343D5] selection:text-white antialiased">
      {/* Background Radial Glow & Atmosphere matching Footer and Hero */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 w-[1600px] h-[900px] opacity-75"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 12%, rgba(67, 67, 213, 0.45) 0%, rgba(50, 30, 168, 0.22) 45%, rgba(7, 4, 22, 0) 75%)",
        }}
      />
      <img
        src="/landing/cta-flare.svg"
        alt=""
        className="pointer-events-none absolute left-1/2 -top-12 w-[1600px] max-w-none -translate-x-1/2 opacity-50 mix-blend-screen select-none"
      />

      {/* Static Star Dots Field */}
      <StarField showShootingStars={false} className="opacity-80" />

      {/* Navigation */}
      <Navbar />

      {/* FAQ Main Content */}
      <main className="relative z-10 w-full px-5 pb-20 pt-[120px] sm:px-8 sm:pt-[140px] lg:pb-28">
        <div className="mx-auto w-full max-w-[880px]">
          {/* Header */}
          <div className="flex flex-col items-center text-center">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-1.5 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-[#7C5CFF] shadow-[0_0_8px_#7C5CFF]" />
              <span className="text-[12px] font-medium tracking-wide text-[#DFD5F6]">
                Help Center &amp; FAQs
              </span>
            </div>

            {/* Heading */}
            <h1 className="mt-5 text-[40px] font-bold tracking-[-0.035em] leading-[1.1] text-white sm:text-[54px] md:text-[62px]">
              Frequently Asked
              <br />
              <span className="bg-gradient-to-r from-white via-[#E0DCFE] to-[#A594FD] bg-clip-text text-transparent">
                Questions
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-4 max-w-[620px] text-sm sm:text-base font-normal leading-relaxed text-[#A6A6C1]">
              Find clear answers about our Figma components, lifetime updates, licenses, and features.
            </p>

            {/* Search Bar */}
            <div className="relative mt-8 w-full max-w-md">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8888A5]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions or keywords..."
                className="w-full rounded-full border border-white/15 bg-white/[0.05] py-3 pl-11 pr-4 text-xs sm:text-sm text-white placeholder-[#8888A5] backdrop-blur-md transition-all focus:border-[#7C5CFF] focus:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-[#7C5CFF]/25 shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#A6A6C1] hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
              {categories.map((category) => {
                const isActive = selectedCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(category);
                      setOpenIndex(null);
                    }}
                    className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200 border cursor-pointer ${
                      isActive
                        ? "bg-gradient-to-r from-[#4B3DF5] to-[#7C5CFF] text-white border-transparent shadow-[0_0_15px_rgba(124,92,255,0.4)]"
                        : "bg-white/[0.04] text-[#A6A6C1] border-white/10 hover:border-white/25 hover:text-white hover:bg-white/[0.08]"
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Accordion Questions List */}
          <div className="mt-12 sm:mt-14 flex flex-col gap-3.5">
            {filteredFaqs.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center backdrop-blur-md">
                <p className="text-sm text-[#A6A6C1]">
                  No questions found matching &ldquo;{searchQuery}&rdquo;.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                  }}
                  className="mt-4 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-white hover:bg-white/15 transition-colors"
                >
                  Reset Search &amp; Filters
                </button>
              </div>
            ) : (
              filteredFaqs.map((faq, index) => {
                const isOpen = openIndex === index;
                return (
                  <div
                    key={faq.question}
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className={`group rounded-[14px] transition-all duration-300 cursor-pointer select-none backdrop-blur-md ${
                      isOpen
                        ? "border border-[#7C5CFF]/60 bg-gradient-to-b from-[#150F38]/95 to-[#0E0B26]/95 px-6 py-5 sm:px-7 sm:py-6 shadow-[0_0_30px_rgba(124,92,255,0.18)]"
                        : "border border-white/[0.08] bg-[#0E0B22]/70 px-6 py-4 sm:px-7 sm:py-5 hover:border-white/20 hover:bg-[#120E2C]/85 shadow-[0_4px_20px_rgba(0,0,0,0.25)]"
                    }`}
                  >
                    <div className="flex w-full items-center justify-between gap-5 text-left">
                      <div className="flex items-center gap-3">
                        <span className="text-[14px] sm:text-[15px] font-semibold leading-snug text-white transition-colors group-hover:text-white">
                          {faq.question}
                        </span>
                      </div>

                      {/* Icon */}
                      <span
                        className={`grid h-[26px] w-[26px] place-items-center rounded-full transition-all duration-300 shrink-0 ${
                          isOpen
                            ? "bg-gradient-to-r from-[#4B3DF5] to-[#7C5CFF] text-white shadow-[0_0_12px_rgba(124,92,255,0.5)]"
                            : "border border-white/15 bg-white/[0.06] text-[#A6A6C1] group-hover:border-white/30 group-hover:bg-white/[0.12] group-hover:text-white"
                        }`}
                      >
                        <Plus
                          size={13}
                          strokeWidth={2.5}
                          className={`transition-transform duration-300 ${
                            isOpen ? "rotate-45" : ""
                          }`}
                        />
                      </span>
                    </div>

                    {isOpen && (
                      <div
                        className="mt-4 pt-4 border-t border-white/[0.08] max-w-[780px] space-y-3 pr-4 text-[13px] sm:text-[14px] font-normal leading-[1.8] text-[#C4C0D9] cursor-auto select-text animate-in fade-in-50 duration-200"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {faq.answer.map((paragraph, pIdx) => (
                          <p key={pIdx}>{paragraph}</p>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Still Have Questions Support Bridge Card */}
          <div className="mt-16 sm:mt-20 rounded-2xl border border-white/10 bg-gradient-to-r from-white/[0.04] to-white/[0.02] p-8 sm:p-10 backdrop-blur-md text-center max-w-[880px] mx-auto shadow-xl">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#7C5CFF]/15 border border-[#7C5CFF]/30 text-[#DFD5F6] mb-4">
              <MessageSquare className="h-5 w-5 text-[#9FE870]" />
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-white">
              Still have questions?
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-[#A6A6C1] max-w-md mx-auto leading-relaxed">
              Can’t find what you’re looking for? Reach out to our friendly support team and we’ll get back to you promptly.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#4B3DF5] to-[#7C5CFF] px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-[#4B3DF5]/30 hover:brightness-110 active:scale-95 transition-all"
              >
                <span>Contact Us</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Existing Footer & CTA Section (Seamlessly blended background) */}
      <CtaAndFooterSection />
    </div>
  );
}
