"use client";

import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import BrandLogo from "./BrandLogo";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Components", href: "#components" },
    { name: "Pricing", href: "#pricing" },
    { name: "FAQs", href: "#faq" },
    { name: "Blog", href: "/blog" },
    { name: "Contact Us", href: "#cta" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-[#000000]/80 backdrop-blur-xl border-b border-white/10 py-3 shadow-xl shadow-black/50"
          : "bg-transparent py-4"
      }`}
    >
      <div className="mx-auto flex h-[60px] max-w-[1440px] items-center justify-between px-6 lg:px-[120px]">
        <BrandLogo />

        <nav className="hidden items-center justify-center gap-8 text-lg font-medium leading-[22px] text-[#F7F7FD] md:flex">
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
          className="hidden h-9 w-[116px] items-center justify-center rounded-[40px] border border-[rgba(250,250,250,0.1)] bg-[rgba(248,246,253,0.1)] px-5 text-base font-medium text-[#F7F7FD] transition-all hover:bg-white/20 md:inline-flex"
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
        <div className="mx-4 mt-2 flex flex-col gap-4 rounded-2xl border border-white/15 bg-[#0A0A14]/95 p-6 shadow-2xl backdrop-blur-2xl md:hidden">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-[#D4D4D8] hover:text-white"
            >
              {link.name}
            </a>
          ))}
          <a
            href="#login"
            onClick={() => setMobileMenuOpen(false)}
            className="block w-full rounded-full border border-white/20 bg-white/10 py-2.5 text-center text-sm font-semibold text-white"
          >
            Log in
          </a>
        </div>
      )}
    </header>
  );
}
