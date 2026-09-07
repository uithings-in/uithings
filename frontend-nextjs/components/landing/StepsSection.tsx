import React from "react";
import { CosmicPanel } from "./CosmicAtmosphere";

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

export default function StepsSection() {
  return (
    <section id="process" className="relative overflow-hidden py-16 md:py-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-[747px] text-center">
          <h2
            className="text-[40px] font-normal leading-[70px] tracking-[-3.36px] text-[#F7F7FD] sm:text-[56px]"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Design your dream website in minutes, not weeks.
          </h2>
          <p className="mt-3 text-xl leading-[25px] text-[#FFF8F8]">
            Brand it. Build it. Go live—fully responsive, zero hassle.
          </p>
        </div>

        <CosmicPanel className="min-h-[583px] px-6 py-8 sm:px-16 sm:py-10">
          <div className="mb-10 flex flex-col items-center gap-5 text-center">
            <div className="inline-flex items-center justify-center rounded-[99px] border-[3px] border-white bg-white px-3.5 py-1.5">
              <span className="text-xl leading-[25px] text-black">Step Taken</span>
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
                className={`relative flex size-[300px] flex-col items-center overflow-hidden rounded-[10px] ${
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
        </CosmicPanel>
      </div>
    </section>
  );
}
