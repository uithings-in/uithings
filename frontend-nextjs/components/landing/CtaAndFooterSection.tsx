"use client";

import React, { useState } from "react";
import BrandLogo from "./BrandLogo";
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
    <section
      id="cta"
      className="relative overflow-hidden bg-[#070416] pt-20 pb-12 sm:pt-28 text-[#F7F7FD]"
    >
      {/* Background Radial Glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 w-[1600px] h-[900px] opacity-75"
        style={{
          background:
            "radial-gradient(ellipse 65% 45% at 50% 32%, rgba(67, 67, 213, 0.45) 0%, rgba(50, 30, 168, 0.22) 45%, rgba(7, 4, 22, 0) 75%)",
        }}
      />
      <img
        src="/landing/cta-flare.svg"
        alt=""
        className="pointer-events-none absolute left-1/2 top-4 w-[1600px] max-w-none -translate-x-1/2 opacity-60 mix-blend-screen"
      />

      {/* Static Star Dots */}
      <StarField showShootingStars={false} className="opacity-90" />

      {/* Left Shooting Star with Glowing Head */}
      <img
        src="/landing/star-line-l.svg"
        alt=""
        className="pointer-events-none absolute left-[12%] sm:left-[16%] md:left-[18%] top-[240px] sm:top-[280px] hidden h-[155px] w-[89px] opacity-90 sm:block"
      />

      {/* Right Shooting Star with Glowing Head (pointing down-left) */}
      <img
        src="/landing/star-line-r.svg"
        alt=""
        className="pointer-events-none absolute right-[12%] sm:right-[16%] md:right-[18%] top-[190px] sm:top-[230px] hidden h-[181px] w-[99px] -scale-x-100 opacity-90 sm:block"
      />

      {/* CTA Centered Content */}
      <div className="relative z-10 mx-auto flex max-w-[760px] flex-col items-center gap-7 px-4 text-center">
        {/* Start Pill Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(247,247,253,0.12)] bg-[rgba(255,255,255,0.06)] px-3.5 py-1.5 backdrop-blur-[6px]">
          <span className="relative size-3.5 overflow-hidden">
            <img src="/landing/sparkle.svg" alt="" className="size-full" />
          </span>
          <span
            className="text-xs font-medium leading-none text-[#DFD5F6]"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Start
          </span>
        </div>

        {/* Heading */}
        <h2
          className="text-4xl font-medium leading-[1.08] tracking-[-1.5px] text-[#F7F7FD] sm:text-6xl md:text-[72px] sm:tracking-[-2.5px]"
          style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
        >
          Powerful tools for<br />creators
        </h2>

        {/* Subtitle */}
        <p
          className="max-w-[560px] text-sm leading-relaxed text-[#AEB2EA] sm:text-base"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          From pricing to features — here are the answers to common questions about Ryzo
        </p>

        {/* Download Button */}
        <div className="pt-2">
          <a
            href="#download"
            className="inline-flex items-center justify-center rounded-full bg-[#4343D5] px-8 py-3.5 text-base font-semibold text-[#F7F7FD] shadow-[0_0_24px_rgba(67,67,213,0.55)] border border-[rgba(255,255,255,0.15)] hover:bg-[#525BE0] hover:shadow-[0_0_32px_rgba(82,91,224,0.7)] active:scale-95 transition-all"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Download Now
          </a>
        </div>
      </div>

      {/* Earth Ball / Glowing Horizon Arc */}
      <div className="relative mx-auto mt-10 w-full max-w-[1400px]">
        {/* Horizon Arc SVGs - Positioned to stretch full-width across the section */}
        <div className="pointer-events-none absolute -top-16 left-1/2 h-[750px] w-[1800px] max-w-none -translate-x-1/2 overflow-visible">
          {/* Cyan/Blue Atmospheric Outer Glow */}
          <img
            src="/landing/earth-glow-3.svg"
            alt=""
            className="absolute top-0 left-1/2 h-[540px] w-[1600px] -translate-x-1/2 opacity-70"
          />
          {/* Multi-layered Glowing Planet Horizon Ball */}
          <img
            src="/landing/earth-ball.svg"
            alt=""
            className="absolute top-8 left-1/2 h-[750px] w-[1720px] -translate-x-1/2"
          />
        </div>

        {/* Footer Container sitting seamlessly over the horizon background */}
        <div className="relative z-10 mx-auto max-w-[1240px] px-6 pt-32 sm:px-8 sm:pt-40">
          {/* Main Footer Row */}
          <div className="flex flex-col justify-between gap-12 lg:flex-row lg:gap-16">
            {/* Left Column: Brand, Tagline, Newsletter */}
            <div className="flex max-w-[420px] flex-col gap-6">
              <BrandLogo />
              <p
                className="text-lg font-normal leading-[26px] text-[#F7F7FD] sm:text-xl"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Built with clarity. Designed for flow.
              </p>
              <form
                onSubmit={handleSubscribe}
                className="relative flex w-full max-w-[390px] items-center rounded-full border border-[rgba(247,247,253,0.12)] bg-[rgba(247,247,253,0.06)] p-1.5 pl-6 backdrop-blur-md focus-within:border-[rgba(247,247,253,0.3)] transition-all"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="w-full bg-transparent text-sm sm:text-base text-[#F7F7FD] placeholder:text-[#9389A8] focus:outline-none"
                  style={{ fontFamily: "Inter, sans-serif" }}
                />
                <button
                  type="submit"
                  className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-[#4343D5] px-6 text-sm font-medium text-white hover:bg-[#525BE0] active:scale-95 transition-all"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Submit
                </button>
              </form>
              {subscribed && (
                <p className="text-xs text-emerald-400">Thank you for subscribing!</p>
              )}
            </div>

            {/* Right Link Columns: Product, Company, Legal */}
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 sm:w-[560px] lg:gap-12">
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
                <div key={col.title} className="flex flex-col gap-5">
                  <p
                    className="text-base font-medium leading-6 text-[#F7F7FD] sm:text-lg"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {col.title}
                  </p>
                  <ul className="flex flex-col gap-3.5 text-sm leading-5 text-[#9389A8]">
                    {col.links.map((link) => (
                      <li key={link.label}>
                        <a
                          href={link.href}
                          className="hover:text-white transition-colors"
                          style={{ fontFamily: "Inter, sans-serif" }}
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Bar Row */}
          <div className="relative mt-20 flex flex-col items-center justify-between gap-6 pt-6 pb-6 sm:flex-row sm:mt-24">
            <p
              className="text-xs font-normal text-[#9389A8] sm:text-sm"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              © 2025 ui things. All rights reserved.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-2.5">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-7 sm:size-8 items-center justify-center rounded-full bg-[#4343D5] hover:bg-[#525BE0] text-white transition-all shadow-sm"
                aria-label="Facebook"
              >
                <img src="/landing/icon-fb.svg" alt="" className="size-3.5" />
              </a>
              {[
                { href: "https://instagram.com", src: "/landing/icon-ig.svg", label: "Instagram" },
                { href: "https://twitter.com", src: "/landing/icon-x.svg", label: "X" },
                { href: "https://linkedin.com", src: "/landing/icon-in.svg", label: "LinkedIn" },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex size-7 sm:size-8 items-center justify-center rounded-full border border-[rgba(247,247,253,0.12)] bg-[rgba(248,246,253,0.08)] backdrop-blur-[6px] text-white/80 hover:bg-[rgba(248,246,253,0.18)] hover:border-[rgba(247,247,253,0.25)] hover:text-white transition-all"
                >
                  <img src={social.src} alt="" className="size-3.5" />
                </a>
              ))}
            </div>

            {/* Back to Top */}
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-normal text-[#9389A8] hover:text-white transition-colors cursor-pointer group"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              <span>Back to top</span>
              <img
                src="/landing/angle-up.svg"
                alt=""
                className="size-3.5 group-hover:-translate-y-0.5 transition-transform"
              />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

