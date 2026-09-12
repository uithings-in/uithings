"use client";

import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import BrandLogo from "./BrandLogo";

const SCROLLED_CSS =
  "header.landing-nav{background:rgba(0,0,0,.8);-webkit-backdrop-filter:blur(24px);backdrop-filter:blur(24px);border-bottom:1px solid rgba(255,255,255,.1);box-shadow:0 20px 25px -5px rgba(0,0,0,.5)}";

function setNavScrolled(isScrolled: boolean) {
  if (typeof document === "undefined") return;
  let styleEl = document.getElementById("nav-scrolled-css") as HTMLStyleElement | null;
  if (isScrolled) {
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = "nav-scrolled-css";
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = SCROLLED_CSS;
  } else if (styleEl) {
    styleEl.remove();
  }
}

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setNavScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Components", href: "/components" },
    { name: "Pricing", href: "/#pricing" },
    { name: "FAQs", href: "/#faq" },
    { name: "Blog", href: "/blog" },
    { name: "Contact Us", href: "/#cta" },
  ];

  return (
    <header className="landing-nav fixed top-0 left-0 right-0 z-50 h-[60px] w-full bg-transparent">
      <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-6 lg:px-[120px]">
        <BrandLogo />

        <nav
          className="hidden items-center justify-center gap-8 text-[18px] font-medium leading-[22px] text-[#F7F7FD] md:flex"
          style={{ fontFamily: "var(--font-plus-jakarta), 'Plus Jakarta Sans', sans-serif" }}
        >
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="transition-colors duration-200 hover:text-white"
            >
              {link.name}
            </a>
          ))}
        </nav>

        <a
          href="#login"
          className="hidden h-9 w-[116px] items-center justify-center rounded-[40px] border border-[rgba(250,250,250,0.1)] bg-[rgba(248,246,253,0.1)] px-5 text-[18px] font-medium text-[#F7F7FD] transition-all hover:bg-white/20 md:inline-flex"
          style={{ fontFamily: "var(--font-plus-jakarta), 'Plus Jakarta Sans', sans-serif" }}
        >
          Log in
        </a>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-full p-2 text-[#A6A6C1] hover:bg-white/10 hover:text-white md:hidden"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div
          className="mx-4 mt-2 flex flex-col gap-4 rounded-2xl border border-white/15 bg-[#0A0A14]/95 p-6 shadow-2xl backdrop-blur-2xl md:hidden"
          style={{ fontFamily: "var(--font-plus-jakarta), 'Plus Jakarta Sans', sans-serif" }}
        >
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-[18px] font-medium text-[#D4D4D8] hover:text-white"
            >
              {link.name}
            </a>
          ))}
          <a
            href="#login"
            onClick={() => setMobileMenuOpen(false)}
            className="block w-full rounded-full border border-white/20 bg-white/10 py-2.5 text-center text-[18px] font-medium text-white"
          >
            Log in
          </a>
        </div>
      )}
    </header>
  );
}
