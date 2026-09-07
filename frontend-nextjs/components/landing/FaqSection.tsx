"use client";

import React, { useState } from "react";
import SectionCaption from "./SectionCaption";

const faqs = [
  {
    question: "What is Ui Things",
    answer:
      "Ui Things is a library of ready-to-use components, wireframes, themes, and templates so you can assemble polished websites without starting from scratch.",
  },
  {
    question: "How does Ui Things improve my workflow?",
    answer:
      "Ui Things saves time and reduces complexity by offering ready-to-use components, wireframe, multiple themes, responsive version & pre-built template. It is also easy to customize, streamlining your website creation.",
  },
  {
    question: "Is Ui Things customizable?",
    answer:
      "Yes. Swap colors, typography, and section variants through mapped variables so every screen stays on-brand without rebuilding layouts.",
  },
  {
    question: "Can I use Ui Things components with Tailwind or custom CSS?",
    answer:
      "Yes. Components ship as clean, production-ready markup that drops into Tailwind or custom CSS without fighting the design system.",
  },
  {
    question: "Can I use Ui Things for client projects?",
    answer:
      "Yes. Licenses include commercial use for client work, SaaS products, and marketing sites.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(1);

  return (
    <section id="faq" className="relative overflow-hidden py-[120px]">
      <div className="mx-auto flex w-full max-w-[856px] flex-col items-center gap-[100px] px-4">
        <div className="flex flex-col items-center gap-10 text-center">
          <SectionCaption>FAQ</SectionCaption>
          <div className="flex flex-col items-center gap-9">
            <h2
              className="max-w-[521px] text-5xl font-medium leading-[60px] tracking-[-2.56px] text-[#F7F7FD] sm:text-[64px]"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Everything you need to know
            </h2>
            <p className="max-w-[643px] text-base font-medium leading-5 text-[#9389A8]">
              From pricing to features — here are the answers to common questions
              about Lanzo.
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col gap-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <button
                key={faq.question}
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex w-full items-start justify-between gap-8 rounded-lg border border-[rgba(247,247,253,0.1)] bg-[rgba(248,246,253,0.03)] p-8 text-left backdrop-blur-[6px]"
                aria-expanded={isOpen}
              >
                <div className="flex min-w-0 flex-1 flex-col gap-3">
                  <span className="text-xl leading-[25px] text-white">{faq.question}</span>
                  {isOpen && (
                    <span className="text-sm font-medium leading-[17px] text-white/50">
                      {faq.answer}
                    </span>
                  )}
                </div>
                <span className="relative size-6 shrink-0 overflow-hidden">
                  <img
                    src={isOpen ? "/landing/minus.svg" : "/landing/plus.svg"}
                    alt=""
                    className="absolute inset-0 size-full max-w-none"
                  />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
