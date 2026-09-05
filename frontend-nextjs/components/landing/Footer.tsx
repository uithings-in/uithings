"use client";

import React, { useState } from "react";
import { ArrowUp, Send } from "lucide-react";

export default function Footer() {
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
    <footer className="relative bg-transparent z-10 pt-12 pb-12 text-[#A6A6C1]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 pb-14 border-b border-white/10">
          {/* Left Column: Brand & Newsletter Form */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              {/* Brand Logo SVG */}
              <div className="flex items-center gap-2 mb-4">
                <img
                  src="/assets/logo.svg"
                  alt="ui things"
                  className="h-8 w-auto object-contain"
                />
              </div>

              {/* Tagline */}
              <p className="font-sans text-xs sm:text-sm text-[#A6A6C1]/80 mb-6 max-w-sm leading-relaxed">
                Built with clarity. Designed for flow.
              </p>

              {/* Newsletter Input Form */}
              <form onSubmit={handleSubscribe} className="relative max-w-sm">
                <div className="flex items-center rounded-full border border-white/15 bg-white/[0.05] p-1.5 backdrop-blur-md focus-within:border-[#5243F7] transition-all shadow-sm">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full bg-transparent px-3.5 py-1.5 text-xs text-white placeholder-[#8888a5] focus:outline-none font-sans"
                  />
                  <button
                    type="submit"
                    className="font-sans inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#4B3DF5] to-[#7C5CFF] px-4 py-1.5 text-xs font-semibold text-white shadow hover:brightness-110 active:scale-95 transition-all flex-shrink-0"
                  >
                    <span>Submit</span>
                    <Send size={11} />
                  </button>
                </div>
                {subscribed && (
                  <p className="absolute -bottom-6 left-2 text-[11px] font-sans text-emerald-400">
                    Thank you for subscribing!
                  </p>
                )}
              </form>
            </div>
          </div>

          {/* 3 Link Columns */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {/* Column 1: Product */}
            <div>
              <h4 className="font-sans text-xs font-bold text-white uppercase tracking-wider mb-4">
                PRODUCT
              </h4>
              <ul className="space-y-3 text-xs sm:text-sm">
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
              <h4 className="font-sans text-xs font-bold text-white uppercase tracking-wider mb-4">
                COMPANY
              </h4>
              <ul className="space-y-3 text-xs sm:text-sm">
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
              <h4 className="font-sans text-xs font-bold text-white uppercase tracking-wider mb-4">
                LEGAL
              </h4>
              <ul className="space-y-3 text-xs sm:text-sm">
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
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          {/* Copyright */}
          <div className="font-sans text-[#8e8ea8] order-2 sm:order-1">
            © 2025 ui things. All rights reserved.
          </div>

          {/* 4 Social Icons */}
          <div className="flex items-center gap-3 order-1 sm:order-2">
            {/* Facebook */}
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/15 flex items-center justify-center text-[#A6A6C1] hover:text-white hover:border-[#5243F7] backdrop-blur-md transition-all"
              aria-label="Facebook"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
              </svg>
            </a>
            {/* Instagram */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/15 flex items-center justify-center text-[#A6A6C1] hover:text-white hover:border-[#5243F7] backdrop-blur-md transition-all"
              aria-label="Instagram"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
            {/* X (formerly Twitter) */}
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/15 flex items-center justify-center text-[#A6A6C1] hover:text-white hover:border-[#5243F7] backdrop-blur-md transition-all"
              aria-label="X (formerly Twitter)"
            >
              <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            {/* LinkedIn */}
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/15 flex items-center justify-center text-[#A6A6C1] hover:text-white hover:border-[#5243F7] backdrop-blur-md transition-all"
              aria-label="LinkedIn"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
          </div>

          {/* Back to top */}
          <button
            onClick={scrollToTop}
            className="font-sans flex items-center gap-2 text-xs text-[#A6A6C1] hover:text-white transition-colors order-3 cursor-pointer group"
          >
            <span>Back to top</span>
            <div className="w-6 h-6 rounded-full bg-white/[0.08] border border-white/15 flex items-center justify-center group-hover:-translate-y-0.5 transition-transform backdrop-blur-md">
              <ArrowUp size={12} />
            </div>
          </button>
        </div>
      </div>
    </footer>
  );
}
