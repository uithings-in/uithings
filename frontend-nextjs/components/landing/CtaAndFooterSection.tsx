"use client";

import React, { useState } from "react";
import BrandLogo from "./BrandLogo";
import SectionCaption from "./SectionCaption";
import StarField from "./StarField";

export default function CtaAndFooterSection() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section id="cta" className="relative overflow-hidden bg-black pt-16 pb-12">
      <StarField showShootingStars={false} />
      <img
        src="/landing/cta-flare.svg"
        alt=""
        className="pointer-events-none absolute left-1/2 top-10 w-[1408px] max-w-none -translate-x-1/2"
      />
      <img
        src="/landing/star-line-l.svg"
        alt=""
        className="pointer-events-none absolute left-[12%] top-[18%] hidden h-[155px] w-[89px] sm:block"
      />
      <img
        src="/landing/star-line-r.svg"
        alt=""
        className="pointer-events-none absolute right-[10%] top-[12%] hidden h-[181px] w-[99px] sm:block"
      />

      <div className="relative z-10 mx-auto mb-10 flex max-w-[696px] flex-col items-center gap-12 px-4 text-center">
        <div className="flex w-full flex-col items-center gap-10">
          <SectionCaption>Start</SectionCaption>
          <div className="flex flex-col items-center gap-9">
            <h2
              className="text-5xl font-medium leading-[64px] tracking-[-3px] text-[#F7F7FD] sm:text-[75px]"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Powerful tools for creators
            </h2>
            <p
              className="text-base leading-6 text-[#9389A8]"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              From pricing to features — here are the answers to common questions
              about Ryzo
            </p>
          </div>
        </div>
        <a
          href="#download"
          className="inline-flex items-center justify-center rounded-full border border-[#F7F7FD] bg-[#4343D5] px-7 py-6 text-base font-semibold leading-6 text-[#F7F7FD]"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          Download Now
        </a>
      </div>

      <div className="relative mx-auto mt-8 w-full max-w-[1296px] px-4">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-[420px] w-[min(1453px,160%)] -translate-x-1/2">
          <img
            src="/landing/earth-glow-3.svg"
            alt=""
            className="absolute inset-0 size-full max-w-none"
          />
          <img
            src="/landing/earth-ball.svg"
            alt=""
            className="absolute top-8 left-1/2 h-[420px] w-[90%] max-w-none -translate-x-1/2"
          />
        </div>

        <div className="relative z-10 overflow-hidden rounded-xl px-6 pt-10 backdrop-blur-[12px] sm:px-10">
          <div className="flex flex-col justify-between gap-10 lg:flex-row">
            <div className="flex max-w-[456px] flex-col gap-12">
              <BrandLogo />
              <div className="flex flex-col gap-7">
                <p className="max-w-[362px] text-xl leading-[25px] text-[#F7F7FD]">
                  Built with clarity. Designed for flow.
                </p>
                <form
                  onSubmit={handleSubscribe}
                  className="flex w-full items-center gap-3 rounded-full border border-[#F7F7FD] bg-[rgba(247,247,253,0.1)] py-2 pr-2 pl-6"
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    className="w-full bg-transparent text-base text-[#F7F7FD] placeholder:text-[#9389A8] focus:outline-none"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  />
                  <button
                    type="submit"
                    className="inline-flex h-11 shrink-0 items-center justify-center rounded-full border border-[#F7F7FD] bg-[#4343D5] px-7 text-base font-medium text-[#F7F7FD]"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    Submit
                  </button>
                </form>
                {subscribed && (
                  <p className="text-xs text-emerald-400">Thank you for subscribing!</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-1 sm:grid-cols-3 sm:w-[596px]">
              {[
                {
                  title: "Product",
                  links: [
                    { label: "Home", href: "#hero" },
                    { label: "Components", href: "#components" },
                    { label: "Templates", href: "#process" },
                    { label: "Pricing", href: "#pricing" },
                  ],
                },
                {
                  title: "Company",
                  links: [
                    { label: "About", href: "#about" },
                    { label: "Blog", href: "/blog" },
                    { label: "Careers", href: "#careers" },
                    { label: "Press", href: "#press" },
                  ],
                },
                {
                  title: "Legal",
                  links: [
                    { label: "Terms of Service", href: "/terms-conditions" },
                    { label: "Privacy Policy", href: "/privacy-policy" },
                    { label: "Cookies", href: "#cookies" },
                    { label: "Security", href: "#security" },
                  ],
                },
              ].map((col) => (
                <div key={col.title} className="flex flex-col gap-8">
                  <p
                    className="text-lg font-medium leading-6 tracking-[-0.18px] text-[#F7F7FD]"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {col.title}
                  </p>
                  <ul className="flex flex-col gap-[22px] text-sm leading-5 text-[#9389A8]">
                    {col.links.map((link) => (
                      <li key={link.label}>
                        <a href={link.href} className="hover:text-white">
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mt-16 flex flex-col items-center justify-between gap-6 pb-8 sm:flex-row">
            <p className="text-sm font-medium leading-[17px] text-[#9389A8]">
              © 2025 ui things. All rights reserved.
            </p>
            <div className="flex items-center gap-2">
              <a
                href="https://facebook.com"
                className="flex size-7 items-center justify-center rounded-full bg-[#4343D5]"
                aria-label="Facebook"
              >
                <img src="/landing/icon-fb.svg" alt="" className="size-[12px]" />
              </a>
              {[
                { href: "https://instagram.com", src: "/landing/icon-ig.svg", label: "Instagram" },
                { href: "https://twitter.com", src: "/landing/icon-x.svg", label: "X" },
                { href: "https://linkedin.com", src: "/landing/icon-in.svg", label: "LinkedIn" },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="flex size-7 items-center justify-center rounded-full border border-[rgba(247,247,253,0.1)] bg-[rgba(248,246,253,0.1)] backdrop-blur-[6px]"
                >
                  <img src={social.src} alt="" className="size-[12px]" />
                </a>
              ))}
            </div>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-2 text-sm leading-5 tracking-[-0.14px] text-[#9389A8] hover:text-white"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Back to top
              <img src="/landing/angle-up.svg" alt="" className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
