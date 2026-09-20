import React from "react";
import Link from "next/link";
import StarField from "./StarField";
import CosmicAtmosphere from "./CosmicAtmosphere";

export default function HeroSection() {
  const quickLinks = [
    { label: "Hero Section", href: "#hero" },
    { label: "Pricing", href: "#pricing" },
    { label: "CTA", href: "#cta" },
    { label: "Contact Form", href: "#contact" },
    { label: "Process", href: "#process" },
    { label: "Testimonials", href: "#testimonials" },
  ];

  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-black pt-24 pb-16 text-white sm:pt-28 md:pt-32"
    >
      <img
        src="/landing/hero-bg.svg"
        alt=""
        className="pointer-events-none absolute -top-[90px] left-1/2 h-[1150px] w-[2140px] max-w-none -translate-x-1/2 object-cover opacity-100"
      />

      <div
        className="pointer-events-none absolute -top-[80px] left-1/2 z-0 h-[850px] w-full max-w-[2000px] -translate-x-1/2"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 8%, rgba(2,95,247,0.95) 0%, rgba(67,67,213,0.55) 45%, rgba(10,14,40,0.3) 70%, transparent 90%)",
        }}
      />
      <div
        className="pointer-events-none absolute top-[150px] left-1/2 z-0 h-[600px] w-full max-w-[1600px] -translate-x-1/2 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(102,124,255,0.65) 0%, rgba(67,67,213,0.35) 50%, transparent 80%)",
        }}
      />

      <StarField showShootingStars={true} className="z-0" />
      <img
        src="/landing/noise.png"
        alt=""
        className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover opacity-25 mix-blend-overlay"
      />

      <div className="relative z-10 mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
        <h1
          className="mx-auto max-w-4xl text-4xl font-bold leading-[1.12] tracking-[-0.06em] text-[#F7F7FD] sm:text-6xl md:text-[75px] md:leading-[94px]"
          style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
        >
          Streamline Design with <br className="hidden sm:block" />
          Components
        </h1>

        <p className="mx-auto mt-9 max-w-[611px] text-lg font-medium leading-[22px] text-[#B4B3B4]">
          Accelerate your workflow with highly adaptable, accessible and consistent
          components build for modern design system
        </p>

        <div className="mt-10 flex justify-center">
          <Link
            href="/components"
            className="group relative inline-flex items-center justify-center rounded-full bg-[#4343D5]/70 backdrop-blur-md px-8 py-3.5 text-base font-semibold text-[#F7F7FD] border border-white/20 shadow-[0_0_24px_rgba(67,67,213,0.5),inset_0_1px_1px_rgba(255,255,255,0.3)] animate-subtle-glow hover:bg-[#525BE0]/85 hover:border-white/35 active:scale-95 transition-all duration-300 cursor-pointer"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Download Now
          </Link>
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-lg font-semibold text-white sm:text-2xl">
          {quickLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="transition-colors duration-200 hover:text-[#F7F7FD]"
              style={{ fontFamily: "'Maven Pro', sans-serif" }}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="relative mx-auto mt-16 max-w-[1104px] overflow-hidden rounded-xl border-[6px] border-[rgba(250,250,250,0.1)] bg-gradient-to-b from-black to-[#080605] p-6 text-left backdrop-blur-[6px] sm:mt-20 sm:p-10 lg:min-h-[600px] lg:p-12">
          <CosmicAtmosphere />

          <div className="relative z-10 grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
            <div className="flex flex-col justify-center lg:col-span-5">
              <div className="mb-6 border-b border-white/10 pb-3">
                <span
                  className="text-sm font-normal text-[#7B738C]"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Individuals
                </span>
              </div>

              <h2
                className="mb-8 text-3xl font-medium leading-[42px] tracking-[-1.44px] text-[#F7F7FD] sm:text-4xl"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
              >
                Elevate Your Creative Workflow
              </h2>

              <ul className="mb-10 space-y-5">
                <li className="flex items-center gap-2">
                  <span className="relative size-3 shrink-0 overflow-hidden">
                    <img
                      src="/landing/diamond-star.svg"
                      alt=""
                      className="absolute inset-0 size-full max-w-none"
                    />
                  </span>
                  <p
                    className="text-base leading-6 text-[#9389A8]"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    Endless customization option
                  </p>
                </li>
                <li className="flex items-start gap-2">
                  <span className="relative mt-1 size-3 shrink-0 overflow-hidden">
                    <img
                      src="/landing/diamond-star.svg"
                      alt=""
                      className="absolute inset-0 size-full max-w-none"
                    />
                  </span>
                  <p
                    className="max-w-[327px] text-base leading-6 text-[#9389A8]"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    Stop starting from scratch and drag-and-drop complex, nested
                    components directly into your workspace.
                  </p>
                </li>
              </ul>
            </div>

            <div className="relative min-h-[380px] pt-12 sm:pt-6 lg:col-span-7">
              <div className="relative mx-auto max-w-lg lg:max-w-none">
                <div
                  className="absolute -top-12 right-16 z-30 hidden items-center rounded-xl border border-neutral-50/10 bg-[rgba(10,10,41,0.6)] px-4 py-4 text-xs font-medium text-[#F7F7FD] backdrop-blur-md sm:flex"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Auto smart sorting, no effort
                </div>

                <div
                  className="relative z-10 w-[85%] rounded-xl border border-neutral-50/20 bg-[rgba(10,14,60,0.6)] p-6 shadow-2xl backdrop-blur-md sm:w-[80%]"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-4">
                      <span className="text-base font-semibold text-[#F7F7FD]">My task</span>
                      <div className="flex items-center gap-5 border-t border-slate-50/10 pt-4 text-xs font-medium">
                        <span className="text-[#ABABBA]">Today</span>
                        <span className="text-[#7B738C]">Later</span>
                        <span className="text-[#7B738C]">Done</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-6 rounded-md bg-[rgba(248,246,253,0.1)] p-2.5 backdrop-blur-[6px]">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-[#F7F7FD]">Finance app</span>
                          <span className="relative size-4 overflow-hidden">
                            <img
                              src="/landing/ellipsis.svg"
                              alt=""
                              className="absolute inset-0 size-full max-w-none"
                            />
                          </span>
                        </div>
                        <p className="text-[10px] leading-6 text-[#7B738C]">
                          Make a landing and mobile app
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <img
                          src="/landing/avatar.png"
                          alt=""
                          className="size-6 rounded-full object-cover"
                        />
                        <div className="flex flex-col gap-1.5">
                          <span className="text-xs font-medium text-[#DFD5F6]">Samantha</span>
                          <span className="text-[10px] text-[#9389A8]">Project maneger</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="absolute top-16 right-0 z-20 w-[85%] rounded-xl border border-neutral-50/10 bg-[#080A2F] p-5 shadow-2xl backdrop-blur-[9px] sm:w-[80%]"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  <div className="mb-4 flex items-center justify-between pb-1">
                    <span className="text-sm font-medium text-[#F7F7FD]">Filter</span>
                    <span className="relative size-3 overflow-hidden">
                      <img
                        src="/landing/filter.svg"
                        alt=""
                        className="absolute inset-0 size-full max-w-none"
                      />
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    {[
                      {
                        time: "14:00",
                        title: "Design onboarding screen",
                        status: "On progress",
                        active: false,
                      },
                      {
                        time: "15:00",
                        title: "Plan sprint backlog",
                        status: "On progress",
                        active: true,
                      },
                      {
                        time: "17:00",
                        title: "Update pricing page copy",
                        status: "1 hour later",
                        active: false,
                      },
                      {
                        time: "18:00",
                        title: "Prepare launch checklist",
                        status: "3 hours later",
                        active: false,
                      },
                    ].map((item) => (
                      <div
                        key={item.title}
                        className={`flex items-end justify-between rounded-lg px-4 py-2.5 ${
                          item.active
                            ? "border border-neutral-50/10 bg-[rgba(248,246,253,0.1)]"
                            : "bg-[rgba(248,246,253,0.05)] opacity-30"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-[30px] w-0.5 ${item.active ? "bg-[#4343D5]" : "bg-[#ABABBA]"}`}
                          />
                          <div className="flex flex-col gap-3">
                            <span className="text-xs text-[#7B738C]">{item.time}</span>
                            <span className="text-xs font-medium text-[#F7F7FD]">
                              {item.title}
                            </span>
                          </div>
                        </div>
                        <span className="text-right text-[9px] leading-[10px] text-[#CCC] opacity-50">
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
