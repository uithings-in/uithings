"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Plus } from "lucide-react";
import type { Plan } from "../../api/plans";
import Navbar from "@/components/landing/Navbar";

interface FaqItem {
  question: string;
  answer: string[];
}

const faqs: FaqItem[] = [
  // General
  {
    question: "What is Figmacomponents?",
    answer: [
      "Don't want to waste thousands of hours starting over with every job and putting the same parts back together again and again? Figma Components has everything you need to make websites and apps that look modern and great.",
      "Join over 1000+ artists from the best companies in the world. Get any project off the ground, save a lot of time, and become a better creator."
    ]
  },
  {
    question: "In what way do I require a UI kit or component library?",
    answer: [
      "That is a good question! This was something we always asked. When you first use a good UI kit or component library, you don't know how useful it is. When you buy a good UI kit, you don't have to spend as much time and money making the same parts over and over again. It can speed up your work 10–100 times."
    ]
  },
  {
    question: "Does Figmacomponents include the new Figma features?",
    answer: [
      "Yes! We’ve totally refactored Figmacomponents to support Figma’s latest new features, including those released at Framework 2024, Config 2024, and Config 2025. This includes color variables (dark mode), spacing, radius, font, and effects variables, Auto Layout 5.0, min/max widths, Auto Layout wrapping, and much more.",
      "We’re always working to make Figmacomponents better than ever by adding new Figma features as quickly as possible. All Figmacomponents goods come with free updates for life. After each update, we’ll send you an email with what’s new and post it in our notes.",
      "Please note we have made the choice not to implement Figma's new Grid feature into Figmacomponents just yet. It is still in beta and missing key features."
    ]
  },
  {
    question: "What is the difference between the three versions?",
    answer: [
      "The Figmacomponents Figma version has been divided into three distinct versions:",
      "Basic version: 100 Components, Figma variables, Dark mode variables, Component properties, Interactive components, Auto Layout 5.0, Single user license, Design System",
      "Advance Version: 250 Components, Figma variables, Dark mode variables, Component properties, Interactive components, Auto Layout 5.0, Single user license, Design System",
      "Premium+ Version: Unlimited Components, Figma variables, Dark mode variables, Component properties, Interactive components, Auto Layout 5.0, Single user license, Design System"
    ]
  },
  {
    question: "Is the kit available in dark mode?",
    answer: [
      "Use robust and user-friendly color variables to transition to dark mode. Color variables and dark mode, two of Figma's most recent features that were unveiled at Config 2024 and Config 2025, are supported by all version. With only one click, you can change any element, layout, or site to dark mode using variables!",
      "By visiting the example marketing website and application example pages in Figmacomponents, you can see how this operates."
    ]
  },
  // Free version
  {
    question: "Is there a free version available?",
    answer: [
      "Indeed, Figmacomponents Figma is available for free!",
      "Although it lacks some of the most recent component property capabilities, variables, and Auto Layout 5.0 features revealed at Config 2023, Framework 2024, Config 2024, and Config 2025, it is a very potent and helpful Figma UI kit on its own.",
      "This free UI kit can be duplicated and used in any number of applications, including commercial ones."
    ]
  },
  {
    question: "What does the free version include?",
    answer: [
      "The free edition of Figmacomponents is essentially a slimmed-down version of the full UI kit. It includes global styles, basic components, and a few page samples. Try out the free version!"
    ]
  },
  // Account access
  {
    question: "How do I login in to my account?",
    answer: [
      "The email address you used to buy Figmacomponents can be used to log in."
    ]
  },
  {
    question: "Why can't I sign in using my email?",
    answer: [
      "Please make sure you are using the same email address as you used to purchase Figmacomponents and verify your address for typos.",
      "We can assist you at support@uithings.site if you become extremely stuck. Despite our limited staff size, we will respond to you as quickly as we can."
    ]
  },
  // Using Figma
  {
    question: "Do I need to know how to use Figma?",
    answer: [
      "The more sophisticated features of Figma, such as nested components, variants, Auto Layout 5.0, interactive components, the new component properties announced at Config 2022, and the new variables and Auto Layout 5.0 features announced at Config 2023, Framework 2024, Config 2024, and Config 2025, are fully utilized by Figmacomponents.",
      "Check out our free version of Figma to see if it's a good fit if you're new to it or eager to discover best practices. When you're ready, the complete version will always be available. For the finest tutorials on these capabilities, we also suggest visiting Figma's Help Center."
    ]
  },
  {
    question: "Do I need to use variables?",
    answer: [
      "If you don't need or want to utilize variables, you don't have to! We go into greater detail about this subject on the Figmacomponent’s variables documentation page.",
      "You have complete control over whether or not to use variables. Two versions of Figmacomponents have been released: one that uses radius, color, and spacing variables, and another that uses styles. You may try both and choose which works best for your workflow because they are both included!"
    ]
  },
  // Support
  {
    question: "How does support work?",
    answer: [
      "Please email us at support@uithings.site if you have any queries regarding your license or are experiencing difficulties using Figmacomponents. Use the same email address you used to buy Figmacomponents to get in touch with us. Despite our small team size, we will try our best to respond to you as soon as we can.",
      "Please be aware that we do not provide general Figma help or assistance with utilizing Figma features; we are not Figma support. We advise you to start by visiting our Figma Help Center if you have any questions about Figma. Their paperwork, support materials, and instructional materials are very thorough and beneficial.",
      "For important features like components, variations, Auto Layout 5.0, interactive components, and component characteristics, Figma also offers excellent tutorials."
    ]
  },
  {
    question: "Do you provide video tutorials?",
    answer: [
      "We're working on it, but not yet! We've worked hard to make Figmacomponents products as user-friendly as possible in the interim, and we're adding even more notes and component documentation."
    ]
  },
  // Education discounts
  {
    question: "Do you provide an education discount?",
    answer: [
      "We currently do not offer an education discount. Please keep an eye on our promotions page for future offers and discounts."
    ]
  },
  // Affiliates
  {
    question: "Do you have an affiliate program?",
    answer: [
      "We currently do not offer an affiliate program. While we appreciate the interest from individuals and organizations looking to partner with us, there are no affiliate opportunities available at this time. Please check back in the future for any updates regarding partnership or referral programs."
    ]
  },
  // Licensing
  {
    question: "Can I use Figmacomponents for commercial projects?",
    answer: [
      "Indeed! Figmacomponents available for usage in a personal and business projects.",
      "You can use Figmacomponents as long as you don't resell, redistribute, repackage, or repurpose it to make competing or comparable products—even for different frameworks! Before making a purchase, please see our license agreement.",
      "Please contact hello@untitledui.com if you have any questions about our license agreement so we can answer them."
    ]
  },
  {
    question: "Can I use Figmacomponents for multiple projects?",
    answer: [
      "Of course! With lifetime free updates, you can use Figmacomponents for as many projects as you like. Before making a purchase, please see our license agreement."
    ]
  },
  {
    question: "Do I need a team license?",
    answer: [
      "We currently do not offer team licenses. Our services are available through individual subscriptions only. If team or organization licensing options become available in the future, we will share updates on our website and through our official communication channels."
    ]
  },
  // Payments & billing
  {
    question: "Is it a one-time purchase?",
    answer: [
      "Every Figmacomponents product requires a single purchase and payment. Purchase once and use it time frame.",
      "Basic: 90 days (may be change as provide offers!)",
      "Advance: 90 days (may be change as provide offers!)",
      "Premium+: 180 days (may be change as provide offers!)",
      "Any Figmacomponents product that you purchase will grant you free access to all future updates. We'll notify you of any updates and enhancements."
    ]
  },
  {
    question: "Do I need to pay for Figma?",
    answer: [
      "For individuals, Figma's Starter plan is completely free. A Professional plan is required if you need to utilize more sophisticated features like team libraries, dev mode, or multiple variable modes. Find out more about the cost of Figma.",
      "Figma has kindly declared that all of its paid benefits are completely free for instructors and students! Figma Education has more information."
    ]
  },
  {
    question: "Are payments secure?",
    answer: [
      "To process payments, we use Razorpay Payment Gateway. You're rather safe because they employ secure 128-bit SSL encrypted payments!"
    ]
  },
  {
    question: "Can I purchase via PayPal or Alipay or WeChat Pay?",
    answer: [
      "We currently do not support PayPal, Alipay, or WeChat Pay as payment methods. We are continually evaluating additional payment options to better serve our customers, but these payment services are not available at this time. Please refer to our checkout page for the list of supported payment methods."
    ]
  },
  {
    question: "Can I get an invoice?",
    answer: [
      "Receive instant invoice confirmation directly in your email after every purchase. Keep track of your orders, payments, and transaction details with ease and confidence."
    ]
  },
  {
    question: "What is your refund policy?",
    answer: [
      "We no longer provide refunds because our products are digital. We offer 100% free versions of all our goods so you may test them out before making a purchase since we fully support Figmacomponents and know you'll enjoy it too.",
      "Before making a purchase, please check out the full versions of Figmacomponernts.",
      "Sadly, there were numerous instances of customers continuing to utilize our items in commercial projects after receiving a refund due to the frequent abuse of our old refund policy. The complete policy is available in our License Agreement."
    ]
  }
];

const fallbackPlans: Plan[] = [
  {
    _id: "fallback-basic",
    name: "pro_starter",
    displayName: "Basic",
    description: "Simple structures, leading to a focus on user experience.",
    price: 9900,
    durationDays: 180,
    componentLimit: 100,
    isActive: true,
    sortOrder: 1,
    features: [
      "100 Components",
      "Figma variables",
      "Dark mode variables",
      "Component properties",
      "Interactive components",
      "Auto Layout 5.0",
    ],
  },
  {
    _id: "fallback-advanced",
    name: "pro_ultimate",
    displayName: "Advanced",
    description: "Highly customized layout to help you stand out.",
    price: 19900,
    durationDays: 180,
    componentLimit: 250,
    isActive: true,
    sortOrder: 2,
    features: [
      "250 Components",
      "Figma variables",
      "Dark mode variables",
      "Component properties",
      "Interactive components",
      "Auto Layout 5.0",
    ],
  },
];

function formatPrice(price: number) {
  return Math.floor(price / 100).toFixed(2);
}

function FaqIcon({ open }: { open: boolean }) {
  if (open) {
    return <span className="h-[18px] w-[18px] rounded-full bg-[#23d234]" />;
  }

  return (
    <span className="grid h-[18px] w-[18px] place-items-center rounded-full bg-black text-white">
      <Plus size={12} strokeWidth={3} />
    </span>
  );
}

function PricingCard({
  plan,
  selected,
  dark = false,
  onSelect,
}: {
  plan: Plan;
  selected: boolean;
  dark?: boolean;
  onSelect: () => void;
}) {
  const features = (plan.features || []).slice(0, 6);
  const title = `${plan.displayName || plan.name} plan`;

  return (
    <article
      onClick={onSelect}
      className={`relative min-h-[214px] cursor-pointer overflow-hidden rounded-[7px] p-7 transition-all duration-300 ${
        dark ? "bg-black text-white" : "bg-[#f7f8fa] text-black"
      } ${selected ? "lg:min-h-[252px]" : ""}`}
    >
      <div className={selected ? "lg:max-w-[44%]" : ""}>
        <h3 className="text-[14px] font-semibold leading-none">
          {title}
        </h3>
        <div className="mt-4 flex items-baseline gap-1">
          <span className={`text-[38px] font-bold leading-none ${dark ? "text-[#9FE870]" : "text-black"}`}>
            &#8377; {formatPrice(plan.price)}
          </span>
        </div>
        <p className={`mt-8 max-w-[240px] text-[12px] font-medium leading-[1.7] ${dark ? "text-white/55" : "text-black/45"}`}>
          {plan.description}
        </p>
        <Link
          href="/pricing"
          onClick={(event) => event.stopPropagation()}
          className={`mt-5 inline-flex h-[35px] items-center gap-4 rounded-full py-1 pl-5 pr-1 text-[12px] font-semibold ${
            dark ? "bg-[#9FE870] text-black" : "bg-white text-black"
          }`}
        >
          Buy Now
          <span className={`grid h-7 w-7 place-items-center rounded-full ${dark ? "bg-white text-black" : "bg-[#9FE870] text-black"}`}>
            <ArrowRight size={14} strokeWidth={2.5} />
          </span>
        </Link>
      </div>

      {selected && (
        <ul className="mt-8 grid gap-4 text-[12px] font-medium lg:absolute lg:right-10 lg:top-1/2 lg:mt-0 lg:w-[38%] lg:-translate-y-1/2">
          {features.map((feature) => (
            <li key={feature} className="flex items-center gap-3">
              <Check size={14} strokeWidth={2.5} className={dark ? "text-white" : "text-black"} />
              <span className={dark ? "text-white/80" : "text-black/75"}>
                {feature}
              </span>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

function PricingSection({ plans }: { plans: Plan[] }) {
  const [selectedPlanName, setSelectedPlanName] = useState("pro_ultimate");
  const availablePlans = plans.length > 0 ? plans : fallbackPlans;
  const basicPlan = availablePlans.find((plan) => plan.name === "pro_starter") || fallbackPlans[0];
  const advancedPlan = availablePlans.find((plan) => plan.name === "pro_ultimate") || fallbackPlans[1];

  return (
    <section className="w-full bg-white px-5 pb-16 pt-7 sm:px-8 lg:pb-20">
      <div className="mx-auto w-full max-w-[860px]">
        <div className="mx-auto max-w-[520px] text-center">
          <p className="text-[12px] font-medium text-[#5b5b5b]">Pricing &amp; Plans</p>
          <h2 className="mt-3 text-[30px] font-semibold leading-[1.16] text-black md:text-[36px]">
            Developing strong ideas into
            <br />
            relatable and concrete
          </h2>
        </div>

        <div className={`mt-12 grid gap-5 transition-all duration-300 lg:items-stretch ${
          selectedPlanName === "pro_starter" ? "lg:grid-cols-[2.1fr_0.9fr]" : "lg:grid-cols-[0.9fr_2.1fr]"
        }`}>
          <PricingCard
            plan={basicPlan}
            selected={selectedPlanName === "pro_starter"}
            onSelect={() => setSelectedPlanName("pro_starter")}
          />
          <PricingCard
            plan={advancedPlan}
            selected={selectedPlanName === "pro_ultimate"}
            dark
            onSelect={() => setSelectedPlanName("pro_ultimate")}
          />
        </div>
      </div>
    </section>
  );
}

export default function FaqClient({ initialPlans }: { initialPlans: Plan[] }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <main className="w-full bg-white text-black">
      <Navbar />
      <section className="w-full px-5 pb-12 pt-[100px] sm:px-8 lg:pb-16">
        <div className="mx-auto w-full max-w-[860px]">
          <div className="text-center">
            <h1 className="text-[42px] font-bold leading-[1.16] text-[#07150c] md:text-[52px]">
              Frequently Asked
              <br />
              Questions
            </h1>
            <p className="mt-4 text-[12px] font-medium text-black">
              Get answers to commonly asked questions.
            </p>
          </div>

          <div className="mt-[70px] flex flex-col gap-4">
            {faqs.map((faq, index) => {
              const open = openIndex === index;
              return (
                <div
                  key={faq.question}
                  onClick={() => setOpenIndex(open ? -1 : index)}
                  className={`rounded-[11px] transition-all duration-200 cursor-pointer select-none ${
                    open
                      ? "border border-[#6e2ccf] bg-white px-5 py-5 shadow-[0_1px_0_rgba(0,0,0,0.03)]"
                      : "bg-[#f1f1f1] px-5 py-[21px]"
                  }`}
                >
                  <div className="flex w-full items-center justify-between gap-5 text-left">
                    <span className="text-[14px] font-semibold leading-[1.35] text-black">
                      {faq.question}
                    </span>
                    <FaqIcon open={open} />
                  </div>

                  {open && (
                    <div 
                      className="mt-5 max-w-[760px] space-y-3 pr-9 text-[12px] font-medium leading-[1.75] text-black cursor-auto select-text"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {faq.answer.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <PricingSection plans={initialPlans} />
    </main>
  );
}
