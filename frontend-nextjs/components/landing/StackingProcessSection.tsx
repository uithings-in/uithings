"use client";

import React from "react";
import TypographyMockup from "./TypographyMockup";
import WireframeMockup from "./WireframeMockup";
import FullUiMockup from "./FullUiMockup";
import ResponsiveMockup from "./ResponsiveMockup";

const steps = [
  {
    icon: "/landing/icon-browse.svg",
    title: "Brows",
    description: "Explore All Components",
  },
  {
    icon: "/landing/icon-copy.svg",
    title: "Copy",
    description: "Copy from 100+ designs",
  },
  {
    icon: "/landing/icon-paste.svg",
    title: "Paste",
    description: "Paste into your project",
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
    pillLabel: "Select Wire-frame",
    headline:
      "Pick from a curated library of section-based wire-frames to quickly map out the structure that fits your project best.",
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
      "Transform simple wireframes into polished UI designs by toggling diverse sections and exploring multiple themes.",
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
    <section id="process" className="relative pb-10 pt-16 md:pb-14 md:pt-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-[1000px] text-center">
          <span className="text-base font-medium tracking-wide text-[#8E8EA0]">
            Step Taken
          </span>
          <h2
            className="mx-auto mt-4 max-w-[950px] text-4xl font-normal leading-[1.15] tracking-[-2px] text-white sm:text-5xl md:text-[58px] md:leading-[1.12] md:tracking-[-3px] font-heading"
          >
            <span className="inline-block sm:whitespace-nowrap">Design your dream website in minutes</span>
            <br />
            <span>not weeks</span>
          </h2>
          <p className="mt-5 text-sm text-[#8E8EA0] sm:text-base">
            Brand it. Build it. Go live—fully responsive, zero hassle.
          </p>
        </div>

        {/* Stacking Cards Container */}
        <div className="relative flex flex-col gap-16 md:gap-24">
          {/* Card 1: Step Taken */}
          <div
            className="sticky top-[80px] z-10 transition-transform duration-200 gpu-accel"
            style={{
              top: "calc(72px + 0px)",
            }}
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {steps.map((step) => (
                <div
                  key={step.title}
                  className="group relative flex h-[260px] sm:h-[280px] flex-col justify-between overflow-hidden rounded-[20px] border border-white/[0.08] p-7 sm:p-8 shadow-2xl transition-all duration-300 hover:border-white/20"
                  style={{
                    background:
                      "radial-gradient(110% 100% at 8% 8%, rgba(20, 24, 75, 0.95) 0%, rgba(9, 11, 38, 0.98) 55%, #050614 100%)",
                  }}
                >
                  {/* Soft purple/indigo light leak */}
                  <div className="pointer-events-none absolute -bottom-12 -right-12 h-44 w-44 rounded-full bg-[#3b3dbf]/25 blur-3xl" />
                  <div className="pointer-events-none absolute -left-8 -top-8 h-40 w-40 rounded-full bg-[#2a2d78]/30 blur-2xl" />

                  {/* Top Row: Icon aligned on the top right */}
                  <div className="relative z-10 flex w-full justify-end">
                    <span className="relative flex size-10 items-center justify-center">
                      <img
                        src={step.icon}
                        alt=""
                        className="size-9 object-contain opacity-90 transition-opacity duration-200 group-hover:opacity-100"
                      />
                    </span>
                  </div>

                  {/* Bottom Content: Title and Description */}
                  <div className="relative z-10 flex flex-col items-start">
                    <h3
                      className="text-[38px] font-normal leading-[1.1] tracking-[-1.5px] text-white font-heading"
                    >
                      {step.title}
                    </h3>
                    <p className="mt-3 text-sm text-[#84879F]">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Text before Components Section */}
        <div id="components" className="mx-auto mb-12 mt-20 max-w-[900px] text-center md:mb-16 md:mt-28">
          <h2 className="text-4xl font-normal leading-[1.15] tracking-[-2px] text-white sm:text-5xl md:text-[56px] md:leading-[1.12] md:tracking-[-3px] font-heading">
            Components that helps to <br />
            design perfect
          </h2>
          <p className="mt-4 text-sm text-[#8E8EA0] sm:text-base">
            Brand it. Build it. Go live—fully responsive, zero hassle.
          </p>
        </div>

        {/* Stacking Cards Container */}
        <div className="relative flex flex-col gap-16 md:gap-24">
          {/* Cards: Feature Rows */}
          {featureCards.map((card, idx) => {
            const zIndex = 20 + idx * 10;
            const topOffset = 72 + idx * 14;

            if (card.id === "update-branding") {
              return (
                <div
                  key={card.id}
                  className="sticky transition-transform duration-200 gpu-accel"
                  style={{
                    top: `calc(${topOffset}px)`,
                    zIndex: zIndex,
                  }}
                >
                  <div
                    className="relative flex flex-col justify-center overflow-hidden rounded-[28px] border border-white/[0.08] shadow-[0_-15px_35px_rgba(0,0,0,0.7)] md:min-h-[520px]"
                    style={{
                      background:
                        "radial-gradient(120% 120% at 20% 20%, #15163d 0%, #0d0f2b 50%, #060714 100%)",
                    }}
                  >
                    <div className="relative z-10 flex w-full flex-col items-center justify-center gap-10 px-6 py-10 sm:px-12 md:min-h-[520px] lg:flex-row lg:items-center lg:justify-between lg:gap-12">
                      <div className="flex w-full flex-1 items-center justify-center max-w-[580px]">
                        {card.mockup}
                      </div>

                      <div className="flex w-full max-w-[420px] flex-col items-start text-left">
                        <div className="w-fit">
                          <h3 className="text-3xl font-normal tracking-tight text-white sm:text-4xl font-heading">
                            {card.pillLabel}
                          </h3>
                          <div className="mt-2.5 h-[1.5px] w-full bg-white/20" />
                        </div>
                        <p className="mt-6 text-base font-normal leading-relaxed text-[#B4B7C9] sm:text-lg">
                          {card.headline}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            if (card.id === "select-wireframe") {
              return (
                <div
                  key={card.id}
                  className="sticky transition-transform duration-200 gpu-accel"
                  style={{
                    top: `calc(${topOffset}px)`,
                    zIndex: zIndex,
                  }}
                >
                  <div
                    className="relative flex flex-col justify-center overflow-hidden rounded-[28px] border border-white/[0.08] shadow-[0_-15px_35px_rgba(0,0,0,0.7)] md:min-h-[520px]"
                    style={{
                      background:
                        "radial-gradient(120% 120% at 80% 20%, #15163d 0%, #0d0f2b 50%, #060714 100%)",
                    }}
                  >
                    <div className="relative z-10 flex w-full flex-col items-center justify-center gap-10 px-6 py-10 sm:px-12 md:min-h-[520px] lg:flex-row lg:items-center lg:justify-between lg:gap-12">
                      <div className="flex w-full max-w-[420px] flex-col items-start text-left">
                        <div className="w-fit">
                          <h3 className="text-3xl font-normal tracking-tight text-white sm:text-4xl font-heading">
                            {card.pillLabel}
                          </h3>
                          <div className="mt-2.5 h-[1.5px] w-full bg-white/20" />
                        </div>
                        <p className="mt-6 text-base font-normal leading-relaxed text-[#B4B7C9] sm:text-lg">
                          {card.headline}
                        </p>
                      </div>

                      <div className="flex w-full flex-1 items-center justify-center max-w-[580px]">
                        {card.mockup}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            if (card.id === "upgrade-ui") {
              return (
                <div
                  key={card.id}
                  className="sticky transition-transform duration-200 gpu-accel"
                  style={{
                    top: `calc(${topOffset}px)`,
                    zIndex: zIndex,
                  }}
                >
                  <div
                    className="relative flex flex-col justify-center overflow-hidden rounded-[28px] border border-white/[0.08] shadow-[0_-15px_35px_rgba(0,0,0,0.7)] md:min-h-[520px]"
                    style={{
                      background:
                        "radial-gradient(120% 120% at 20% 20%, #15163d 0%, #0d0f2b 50%, #060714 100%)",
                    }}
                  >
                    <div className="relative z-10 flex w-full flex-col items-center justify-center gap-10 px-6 py-10 sm:px-12 md:min-h-[520px] lg:flex-row lg:items-center lg:justify-between lg:gap-12">
                      <div className="flex w-full flex-1 items-center justify-center max-w-[580px]">
                        {card.mockup}
                      </div>

                      <div className="flex w-full max-w-[420px] flex-col items-start text-left">
                        <div className="w-fit">
                          <h3 className="text-3xl font-normal tracking-tight text-white sm:text-4xl font-heading">
                            {card.pillLabel}
                          </h3>
                          <div className="mt-2.5 h-[1.5px] w-full bg-white/20" />
                        </div>
                        <p className="mt-6 text-base font-normal leading-relaxed text-[#B4B7C9] sm:text-lg">
                          {card.headline}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={card.id}
                className="sticky transition-transform duration-200 gpu-accel"
                style={{
                  top: `calc(${topOffset}px)`,
                  zIndex: zIndex,
                }}
              >
                <div
                  className="relative flex flex-col justify-center overflow-hidden rounded-[28px] border border-white/[0.08] shadow-[0_-15px_35px_rgba(0,0,0,0.7)] md:min-h-[520px]"
                  style={{
                    background:
                      "radial-gradient(120% 120% at 80% 20%, #15163d 0%, #0d0f2b 50%, #060714 100%)",
                  }}
                >
                  <div className="relative z-10 flex w-full flex-col items-center justify-center gap-10 px-6 py-10 sm:px-12 md:min-h-[520px] lg:flex-row lg:items-center lg:justify-between lg:gap-12">
                    <div className="flex w-full max-w-[420px] flex-col items-start text-left">
                      <div className="w-fit">
                        <h3 className="text-3xl font-normal tracking-tight text-white sm:text-4xl font-heading">
                          {card.pillLabel}
                        </h3>
                        <div className="mt-2.5 h-[1.5px] w-full bg-white/20" />
                      </div>
                      <p className="mt-6 text-base font-normal leading-relaxed text-[#B4B7C9] sm:text-lg">
                        {card.headline}
                      </p>
                    </div>

                    <div className="flex w-full flex-1 items-center justify-center max-w-[580px]">
                      {card.mockup}
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
