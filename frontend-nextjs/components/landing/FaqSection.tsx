"use client";

import React, { useState } from "react";

const faqs = [
  {
    question: "What is Ui Things",
    answer:
      "Ui Things is a comprehensive UI design system and component library crafted to help designers and developers build polished, modern interfaces with speed and precision.",
  },
  {
    question: "How does Ui Things improve my workflow?",
    answer:
      "Ui Things saves time and reduces complexity by offering ready-to-use components, wireframe, multiple themes, responsive version & pre-built template. It is also easy to customize, streamlining your website creation.",
  },
  {
    question: "Is Ui Things customizable?",
    answer:
      "Yes, Ui Things is fully customizable. You can effortlessly adjust colors, typography, styles, and component variants to align with your project's visual identity.",
  },
  {
    question: "Can I use Ui Things components with Tailwind or custom CSS?",
    answer:
      "Yes. The components are built with clean, standards-compliant structure and styles that seamlessly integrate with Tailwind CSS or custom CSS workflows.",
  },
  {
    question: "Can I use Ui Things for client projects?",
    answer:
      "Yes. Commercial usage is fully supported, allowing you to use Ui Things across client deliverables, SaaS applications, and commercial websites.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(1);

  return (
    <section id="faq" className="relative w-full bg-[#080605] py-24 sm:py-28 md:py-32 text-white">
      <div className="mx-auto flex w-full max-w-[840px] flex-col items-center px-4 sm:px-6">
        {/* Header content */}
        <div className="flex flex-col items-center text-center">
          {/* FAQ Pill Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 backdrop-blur-[6px]">
            <svg
              width="14"
              height="14"
              viewBox="0 0 14.3148 14.3148"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="shrink-0 text-[#DFD5F6]"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M3.49075 0L4.65432 2.32714L6.98147 3.49071L4.65432 4.65428L3.49075 6.98145L2.32718 4.65428L4.06901e-05 3.49071L2.32718 2.32714L3.49075 0ZM9.82407 2.33333L11.321 5.32714L14.3148 6.82405L11.321 8.32092L9.82407 11.3148L8.3272 8.32092L5.33337 6.82405L8.3272 5.32714L9.82407 2.33333ZM4.65432 9.66045L3.49075 7.33332L2.32718 9.66045L4.06901e-05 10.8241L2.32718 11.9876L3.49075 14.3148L4.65432 11.9876L6.98147 10.8241L4.65432 9.66045Z"
                fill="currentColor"
              />
            </svg>
            <span className="text-[13px] font-medium tracking-wide text-[#DFD5F6]">
              FAQ
            </span>
          </div>

          {/* Heading */}
          <h2
            className="mt-6 text-center text-4xl font-semibold tracking-[-0.04em] text-[#FFFFFF] sm:text-5xl md:text-[64px] md:leading-[1.08]"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Everything you<br />need to know
          </h2>

          {/* Subtitle */}
          <p className="mt-5 max-w-[750px] text-center text-sm font-normal leading-normal text-[#8F8A98] sm:text-base">
            From pricing to features — here are the answers to common questions about Lanzo.
          </p>
        </div>

        {/* Accordion Container */}
        <div className="mt-14 sm:mt-16 flex w-full flex-col gap-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.question}
                className="w-full rounded-[14px] border border-white/[0.06] bg-[#0E0C0B] transition-colors duration-200 hover:border-white/[0.1]"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-start justify-between gap-6 px-6 py-5 text-left sm:px-8 sm:py-6 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20 rounded-[14px]"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                  id={`faq-question-${index}`}
                >
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="text-base sm:text-[18px] font-normal leading-snug text-[#F5F3F0]">
                      {faq.question}
                    </span>
                    <div
                      id={`faq-answer-${index}`}
                      role="region"
                      aria-labelledby={`faq-question-${index}`}
                      className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                        isOpen
                          ? "grid-rows-[1fr] opacity-100 mt-3"
                          : "grid-rows-[0fr] opacity-0 mt-0 pointer-events-none"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="max-w-[590px] text-[13.5px] sm:text-sm font-normal leading-[1.6] text-[#847E7A]">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex size-5 shrink-0 items-center justify-center text-[#6B6560] transition-colors duration-200 mt-1">
                    {isOpen ? (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          d="M3.5 8H12.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    ) : (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          d="M8 3.5V12.5M3.5 8H12.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    )}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}


