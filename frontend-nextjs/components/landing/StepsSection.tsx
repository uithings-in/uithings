import React from "react";

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

export default function StepsSection() {
  return (
    <section id="process" className="relative overflow-hidden bg-black py-16 md:py-24">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
        {/* Header */}
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

        {/* 3 Steps Cards */}
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
    </section>
  );
}
