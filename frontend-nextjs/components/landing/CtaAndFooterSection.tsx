"use client";

import React, { useState } from "react";
import StarField from "./StarField";
import { Sparkles } from "lucide-react";

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
      id="cta-footer"
      className="relative pt-16 sm:pt-24 pb-12 overflow-hidden bg-[#05050A]"
    >
      {/* Background Starfield and Shooting Streaks */}
      <StarField showShootingStars={true} />

      {/* Ambient center radial glow behind CTA */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] pointer-events-none -z-10 opacity-55"
        style={{
          background:
            "radial-gradient(circle, rgba(75, 61, 245, 0.55) 0%, rgba(108, 92, 231, 0.25) 50%, transparent 80%)",
        }}
      />

      {/* CTA Content Container */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center relative z-10 mb-6 sm:mb-8">
        {/* Eyebrow Pill */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-white/15 bg-white/[0.08] text-xs font-semibold text-white/90 backdrop-blur-md mb-6 shadow-sm">
          <Sparkles size={13} className="text-[#a594ff]" />
          <span className="font-sans">Start</span>
        </div>

        {/* Headline */}
        <h2 className="font-heading text-6xl sm:text-6xl md:text-[68px] font-medium text-white tracking-[-0.02em] leading-[1.08] max-w-3xl mx-auto">
          Powerful tools for <br className="hidden sm:inline" />
          creators
        </h2>

        {/* Muted Subtext */}
        <p className="font-sans text-[#A6A6C1] text-sm sm:text-base max-w-xl mx-auto mt-4 leading-relaxed font-normal">
          From pricing to features — here are the answers to common questions about Ryzo
        </p>

        {/* Centered Gradient Pill CTA */}
        <div className="mt-8 flex justify-center">
          <a
            href="#download"
            className="font-sans inline-flex items-center justify-center rounded-full bg-[#4B3DF5] hover:bg-[#3e2fe4] px-8 py-3 text-sm font-semibold text-white shadow-[0_0_30px_rgba(75,61,245,0.7)] hover:shadow-[0_0_40px_rgba(124,92,255,0.85)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <span>Download Now</span>
          </a>
        </div>
      </div>

      {/* Glowing Planet Horizon Arc */}
      <div className="relative w-full">
        {/* Planet Sphere & Atmosphere Layer */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-[2400px] sm:w-[3200px] h-[1000px] pointer-events-none overflow-hidden flex justify-center z-0">
          {/* Main sphere body */}
          <div
            className="w-[2600px] sm:w-[3400px] h-[2600px] sm:h-[3400px] rounded-full absolute -top-[20px] left-1/2 -translate-x-1/2"
            style={{
              background:
                "radial-gradient(circle at 50% 0%, #0d143c 0%, #060718 35%, #05050A 75%)",
              boxShadow:
                "0 -8px 75px 22px rgba(0, 229, 255, 0.85), 0 -2px 35px 8px rgba(75, 61, 245, 0.95), inset 0 8px 50px rgba(165, 148, 255, 0.5)",
              borderTop: "3px solid #00E5FF",
            }}
          />
          {/* Glowing cyan atmosphere highlight */}
          <div
            className="w-[1800px] sm:w-[2400px] h-[220px] absolute top-[-25px] rounded-full blur-2xl opacity-95 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 50% 0%, rgba(0, 229, 255, 0.95) 0%, rgba(75, 61, 245, 0.7) 45%, transparent 80%)",
            }}
          />
        </div>

        {/* Footer Content sitting seamlessly over the dark planet sphere body */}
        <div className="relative z-10 pt-36 sm:pt-44 pb-8">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            {/* Main Footer Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 pb-16">
              {/* Left Column: Brand & Newsletter Form */}
              <div className="lg:col-span-5 flex flex-col justify-between">
                <div>
                  {/* Brand Logo SVG */}
                  <div className="flex items-center gap-2 mb-6">
                    <img
                      src="/assets/logo.svg"
                      alt="ui things"
                      className="h-8 w-auto object-contain"
                    />
                  </div>

                  {/* Tagline */}
                  <p className="font-sans text-sm text-[#A6A6C1] mb-8 leading-relaxed">
                    Built with clarity. Designed for flow.
                  </p>

                  {/* Newsletter Input Form */}
                  <form onSubmit={handleSubscribe} className="relative max-w-sm">
                    <div className="flex items-center rounded-full border border-[#2b2d4f] bg-[#0d0e21]/90 p-1.5 shadow-lg focus-within:border-[#5243F7] transition-all">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        required
                        className="w-full bg-transparent px-4 py-1.5 text-xs text-white placeholder-[#727295] focus:outline-none font-sans"
                      />
                      <button
                        type="submit"
                        className="font-sans inline-flex items-center justify-center rounded-full bg-[#4B3DF5] hover:bg-[#3e2fe4] px-5 py-2 text-xs font-medium text-white shadow transition-all flex-shrink-0"
                      >
                        Submit
                      </button>
                    </div>
                    {subscribed && (
                      <p className="absolute -bottom-6 left-3 text-[11px] font-sans text-emerald-400">
                        Thank you for subscribing!
                      </p>
                    )}
                  </form>
                </div>
              </div>

              {/* Right Columns: Product, Company, Legal */}
              <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8 pt-2">
                {/* Column 1: Product */}
                <div>
                  <h4 className="font-sans text-sm font-semibold text-white mb-4">
                    Product
                  </h4>
                  <ul className="space-y-3 text-xs text-[#8c8ca8]">
                    <li>
                      <a href="#hero" className="hover:text-white transition-colors">
                        Home
                      </a>
                    </li>
                    <li>
                      <a href="#process" className="hover:text-white transition-colors">
                        Components
                      </a>
                    </li>
                    <li>
                      <a href="#process" className="hover:text-white transition-colors">
                        Templates
                      </a>
                    </li>
                    <li>
                      <a href="#pricing" className="hover:text-white transition-colors">
                        Pricing
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Column 2: Company */}
                <div>
                  <h4 className="font-sans text-sm font-semibold text-white mb-4">
                    Company
                  </h4>
                  <ul className="space-y-3 text-xs text-[#8c8ca8]">
                    <li>
                      <a href="#about" className="hover:text-white transition-colors">
                        About
                      </a>
                    </li>
                    <li>
                      <a href="#blog" className="hover:text-white transition-colors">
                        Blog
                      </a>
                    </li>
                    <li>
                      <a href="#careers" className="hover:text-white transition-colors">
                        Careers
                      </a>
                    </li>
                    <li>
                      <a href="#press" className="hover:text-white transition-colors">
                        Press
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Column 3: Legal */}
                <div>
                  <h4 className="font-sans text-sm font-semibold text-white mb-4">
                    Legal
                  </h4>
                  <ul className="space-y-3 text-xs text-[#8c8ca8]">
                    <li>
                      <a href="/terms-conditions" className="hover:text-white transition-colors">
                        Terms of Service
                      </a>
                    </li>
                    <li>
                      <a href="/privacy-policy" className="hover:text-white transition-colors">
                        Privacy Policy
                      </a>
                    </li>
                    <li>
                      <a href="#cookies" className="hover:text-white transition-colors">
                        Cookies
                      </a>
                    </li>
                    <li>
                      <a href="#security" className="hover:text-white transition-colors">
                        Security
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#717191]">
              {/* Copyright */}
              <div className="font-sans order-2 sm:order-1">
                © 2025 ui things. All rights reserved.
              </div>

              {/* 4 Social Icons */}
              <div className="flex items-center gap-2.5 order-1 sm:order-2">
                {/* Facebook Badge */}
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-full bg-[#4B3DF5] text-white flex items-center justify-center font-sans font-bold text-xs shadow-sm hover:brightness-110 transition-all"
                  aria-label="Facebook"
                >
                  f
                </a>
                {/* Instagram */}
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-full bg-[#181932] border border-[#2b2d4f] text-[#A6A6C1] hover:text-white flex items-center justify-center transition-all"
                  aria-label="Instagram"
                >
                  <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                {/* X */}
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-full bg-[#181932] border border-[#2b2d4f] text-[#A6A6C1] hover:text-white flex items-center justify-center transition-all"
                  aria-label="X (formerly Twitter)"
                >
                  <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                {/* LinkedIn */}
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 rounded-full bg-[#181932] border border-[#2b2d4f] text-[#A6A6C1] hover:text-white flex items-center justify-center transition-all"
                  aria-label="LinkedIn"
                >
                  <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>

              {/* Back to top */}
              <button
                onClick={scrollToTop}
                className="font-sans flex items-center gap-1 text-xs text-[#717191] hover:text-white transition-colors order-3 cursor-pointer group"
              >
                <span>Back to top</span>
                <span className="text-sm font-semibold group-hover:-translate-y-0.5 transition-transform">
                  ⌃
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
