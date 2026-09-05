"use client";

import React, { useState } from "react";
import PillBadge from "./PillBadge";
import { Plus, Minus } from "lucide-react";

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First item expanded by default

  const faqs = [
    {
      question: "Can I use ui things components in commercial projects?",
      answer:
        "Yes, absolutely. All component licenses include unlimited commercial use for client work, SaaS applications, marketing websites, and digital products without requiring attribution.",
    },
    {
      question: "How does the Figma auto-layout synchronization work?",
      answer:
        "Each component is mirrored between Figma and React/Tailwind. The auto-layout constraints, flex gap values, and typography scales are mapped 1-to-1 with Tailwind CSS utility classes for zero refactoring.",
    },
    {
      question: "What frameworks and styling tools are supported?",
      answer:
        "Out of the box, components are built with modern React, Next.js (App Router), and Tailwind CSS. Clean vanilla HTML/CSS snippets are also provided for other web stacks.",
    },
    {
      question: "Do I receive lifetime updates with my purchase?",
      answer:
        "Yes. Active plans include ongoing access to new component releases, section variant updates, design system patches, and Figma library additions as our ecosystem grows.",
    },
    {
      question: "Can I customize the color tokens and typography globally?",
      answer:
        "Yes. The entire library is powered by CSS custom properties and a unified Tailwind theme file, allowing you to rebrand your entire website by modifying just a handful of color tokens.",
    },
  ];

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="relative py-20 md:py-28 overflow-hidden">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <PillBadge variant="default" className="mb-4">
            FAQ
          </PillBadge>
          <h2 className="font-heading text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
            Everything you need to know
          </h2>
          <p className="font-sans text-[#A6A6C1] text-base mt-4 font-normal">
            Clear answers to common questions about our design systems, licenses, and workflow.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? "border-[#4B3DF5]/60 bg-[#0E0F21] shadow-[0_4px_25px_rgba(75,61,245,0.15)]"
                    : "border-[#1e2038] bg-[#0c0d1a] hover:border-[#2f3256]"
                }`}
              >
                <button
                  onClick={() => toggleAccordion(index)}
                  className="w-full px-6 py-5 sm:px-7 sm:py-6 flex items-center justify-between text-left gap-4 focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="font-heading font-semibold text-base sm:text-lg text-white leading-snug">
                    {faq.question}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                      isOpen
                        ? "bg-[#4B3DF5] text-white"
                        : "bg-[#18192e] text-[#A6A6C1] border border-[#272948]"
                    }`}
                  >
                    {isOpen ? <Minus size={15} /> : <Plus size={15} />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 sm:px-7 sm:pb-6 pt-1 text-xs sm:text-sm font-sans text-[#A6A6C1] leading-relaxed border-t border-white/5 animate-in fade-in duration-200">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
