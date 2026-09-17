"use client";

import React from "react";
import CosmicAtmosphere from "./CosmicAtmosphere";
import WhitePill from "./WhitePill";
import TypographyMockup from "./TypographyMockup";
import WireframeMockup from "./WireframeMockup";
import FullUiMockup from "./FullUiMockup";
import ResponsiveMockup from "./ResponsiveMockup";

const steps = [
  {
    badge: "Step - 01",
    icon: "/landing/icon-browse.svg",
    title: "Brows",
    description: (
      <>
        Explore All Components,
        <br />
        or All Inspiration
      </>
    ),
    highlighted: false,
  },
  {
    badge: "STEP -02",
    icon: "/landing/icon-copy.svg",
    title: "Copy",
    description: (
      <>
        Copy from 100+ designs
        <br />
        (50 more coming soon)
      </>
    ),
    highlighted: true,
  },
  {
    badge: "Step  - 03",
    icon: "/landing/icon-paste.svg",
    title: "Paste",
    description: (
      <>
        Paste into your project.{" "}
        <br />
        Works best on app virions
      </>
    ),
    highlighted: false,
  },
];

interface FeatureCardData {
  id: string;
  pillLabel: string;
  headline: string;
  items: { title: string; description: string }[];
  reverse?: boolean;
  mockup: React.ReactNode;
}

const featureCards: FeatureCardData[] = [
  {
    id: "update-branding",
    pillLabel: "Update Branding",
    headline:
      "Instantly update your project's look with fresh color palettes and rapid, seamless branding customization options.",
    reverse: false,
    mockup: <TypographyMockup />,
    items: [
      {
        title: "Global Color Variables",
        description:
          "Apply new primary, secondary, and accent colors across your entire library in seconds using meticulously mapped Figma variables.",
      },
      {
        title: "Dynamic Typography Scales",
        description:
          "Instantly adjust headings, body text, and line heights across hundreds of screens by tweaking a single master text style.",
      },
      {
        title: "Seamless Light & Dark Modes",
        description:
          "Switch effortlessly between color themes with pre-configured color tokens that automatically invert and adapt your UI.",
      },
    ],
  },
  {
    id: "select-wireframe",
    pillLabel: "Select Wireframe",
    headline:
      "Pick from a curated library of section-based wireframes to quickly map out the structure that fits your project best.",
    reverse: true,
    mockup: <WireframeMockup />,
    items: [
      {
        title: "Modular Section Blocks",
        description:
          "Mix and match pre-built hero banners, feature grids, and footers to construct comprehensive page layouts in minutes.",
      },
      {
        title: "Diverse Layout Categories",
        description:
          "Access specialized, industry-standard wireframe templates tailored for landing pages, SaaS dashboards, and e-commerce platforms.",
      },
      {
        title: "Auto-Layout Enabled Foundations",
        description:
          "Ensure your structural frameworks are fully responsive from the start with built-in Figma Auto-Layout properties.",
      },
    ],
  },
  {
    id: "upgrade-ui",
    pillLabel: "Upgrade to Full UI",
    headline:
      "Transform simple wireframes into polished UI designs by toggling diverse sections and exploring multiple themes.",
    reverse: false,
    mockup: <FullUiMockup />,
    items: [
      {
        title: "One-Click Component Swapping",
        description:
          "Instantly replace grayscale wireframe blocks with fully styled, high-fidelity UI components without rebuilding page layouts.",
      },
      {
        title: "Flexible Section Variants",
        description:
          "Switch between alternate card layouts, hero variations, and navigation styles directly from the Figma properties panel.",
      },
      {
        title: "Preserved Auto-Layout Logic",
        description:
          "Retain all structural alignment, responsive padding, and spacing rules automatically as you transition from low-fi to high-fi.",
      },
    ],
  },
  {
    id: "responsive-default",
    pillLabel: "Responsive by Default",
    headline:
      "Every component and screen auto-adjusts seamlessly across mobile, tablet, desktop, and ultra-wide displays.",
    reverse: true,
    mockup: <ResponsiveMockup />,
    items: [
      {
        title: "Fluid Grid Alignment",
        description:
          "Pre-configured auto-layout constraints ensure components stretch, wrap, and compress gracefully without layout breaks.",
      },
      {
        title: "Multi-Device Breakpoint Fidelity",
        description:
          "Preview live interactions across portrait and landscape viewports with zero manual refactoring required.",
      },
      {
        title: "Production-Ready Clean Code",
        description:
          "Export fully responsive React and Tailwind code with semantic markup, ready to drop straight into your app.",
      },
    ],
  },
];

export default function StackingProcessSection() {
  return (
    <section id="process" className="relative pb-24 pt-16 md:pb-36 md:pt-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-[747px] text-center md:mb-20">
          <h2
            className="text-[40px] font-normal leading-[1.15] tracking-[-2.5px] text-[#F7F7FD] sm:text-[56px] sm:leading-[70px] sm:tracking-[-3.36px]"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Design your dream website in minutes, not weeks.
          </h2>
          <p className="mt-3 text-lg leading-relaxed text-[#FFF8F8] sm:text-xl sm:leading-[25px]">
            Brand it. Build it. Go live—fully responsive, zero hassle.
          </p>
        </div>

        {/* Stacking Cards Container */}
        <div className="relative flex flex-col gap-16 md:gap-24">
          {/* Card 1: Step Taken */}
          <div
            className="sticky top-[80px] z-10 transition-all duration-300"
            style={{
              top: "calc(72px + 0px)",
            }}
          >
            <div className="relative overflow-hidden rounded-[20px] border-2 border-[rgba(250,250,250,0.12)] bg-[#07071d] px-6 py-8 shadow-[0_-15px_40px_rgba(0,0,0,0.7)] backdrop-blur-md sm:px-16 sm:py-10 md:min-h-[583px]">
              <CosmicAtmosphere />
              <div className="relative z-10">
                <div className="mb-10 flex flex-col items-center gap-5 text-center">
                  <div className="inline-flex items-center justify-center rounded-[99px] border-[3px] border-white bg-white px-3.5 py-1.5">
                    <span className="text-xl font-semibold leading-[25px] text-black">
                      Step Taken
                    </span>
                  </div>
                  <p className="max-w-2xl text-xl leading-[25px] text-[#F6E9E9]">
                    Instantly update your project&apos;s look with fresh color palettes and
                    rapid, seamless branding customization options.
                  </p>
                </div>

                <div className="grid grid-cols-1 justify-items-center gap-6 md:grid-cols-3">
                  {steps.map((step) => (
                    <div
                      key={step.title}
                      className={`relative flex size-[280px] flex-col items-center overflow-hidden rounded-[10px] sm:size-[300px] ${
                        step.highlighted
                          ? "bg-[#1E1C5D]"
                          : "border border-white bg-transparent"
                      }`}
                    >
                      <div className="mt-6 inline-flex items-center justify-center rounded-[30px] bg-white px-2.5 py-1.5">
                        <span className="text-sm font-medium leading-[17px] text-black">
                          {step.badge}
                        </span>
                      </div>
                      <span className="relative mt-4 size-[60px] overflow-hidden">
                        <img
                          src={step.icon}
                          alt=""
                          className="absolute inset-0 size-full max-w-none"
                        />
                      </span>
                      <h3
                        className="mt-2 text-[64px] font-normal leading-[80px] tracking-[-3.84px] text-white"
                        style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                      >
                        {step.title}
                      </h3>
                      <p className="mt-1 text-center text-xl leading-[25px] text-white">
                        {step.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Cards 2-5: Feature Rows */}
          {featureCards.map((card, idx) => {
            const zIndex = 20 + idx * 10;
            const topOffset = 72 + (idx + 1) * 14;

            return (
              <div
                key={card.id}
                id={idx === 0 ? "components" : undefined}
                className="sticky transition-all duration-300"
                style={{
                  top: `calc(${topOffset}px)`,
                  zIndex: zIndex,
                }}
              >
                <div className="relative overflow-hidden rounded-[20px] border-2 border-[rgba(250,250,250,0.12)] bg-[#07071d] shadow-[0_-20px_50px_rgba(0,0,0,0.85)] backdrop-blur-md md:min-h-[583px]">
                  <CosmicAtmosphere />
                  <div className="relative z-10">
                    <div
                      className={`flex flex-col items-center gap-10 px-6 py-10 sm:px-11 lg:flex-row lg:items-end lg:gap-[74px] ${
                        card.reverse ? "lg:flex-row-reverse" : ""
                      }`}
                    >
                      <div className="w-full shrink-0 overflow-hidden rounded-2xl border-2 border-white lg:h-[366px] lg:w-[528px]">
                        {card.mockup}
                      </div>

                      <div className="flex w-full max-w-[423px] flex-col items-start gap-6">
                        <div className="flex w-full flex-col items-start gap-9">
                          <WhitePill>{card.pillLabel}</WhitePill>
                          <p className="w-full text-justify text-xl font-normal leading-[25px] text-[#FFF8F8]">
                            {card.headline}
                          </p>
                        </div>

                        <div className="relative flex w-full gap-5">
                          <div className="relative h-[78px] w-[2.5px] shrink-0 bg-gradient-to-b from-[#4343D5] via-white/40 to-transparent" />
                          <div className="flex flex-col gap-4 text-sm leading-[17px] text-[#B8B8B8]">
                            {card.items.map((item) => (
                              <div key={item.title}>
                                <p className="font-bold text-[#B8B8B8]">{item.title}</p>
                                <p className="font-medium">{item.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
