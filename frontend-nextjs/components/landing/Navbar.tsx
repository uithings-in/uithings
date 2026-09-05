"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Components", href: "#components" },
    { name: "Pricing", href: "#pricing" },
    { name: "FAQs", href: "#faq" },
    { name: "Blog", href: "#blog" },
    { name: "Contact Us", href: "#contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
        <div className="flex h-14 items-center justify-between rounded-full border border-white/10 bg-[#070712]/70 px-5 sm:px-6 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
          {/* Left: Brand Logo */}
          <Link href="/" className="flex items-center gap-2 group transition-transform active:scale-95">
            <div className="relative h-8 w-auto flex items-center">
              <img
                src="/assets/logo.svg"
                alt="ui things"
                className="h-7 w-auto object-contain transition-opacity group-hover:opacity-90"
              />
            </div>
          </Link>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium text-[#A6A6C1]">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="font-sans transition-colors duration-200 hover:text-white"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Right: Actions */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href="#login"
              className="font-sans inline-flex items-center justify-center rounded-full border border-white/15 bg-white/[0.08] px-5 py-1.5 text-xs font-semibold text-white backdrop-blur-md transition-all duration-200 hover:bg-white/[0.15] hover:border-white/30 active:scale-95 shadow-sm"
            >
              Log in
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-full text-[#A6A6C1] hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mx-4 mt-2 p-5 rounded-2xl border border-white/10 bg-[#0A0A14]/95 backdrop-blur-2xl shadow-2xl flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-200">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="font-sans text-sm font-medium text-[#A6A6C1] hover:text-white py-1 transition-colors"
            >
              {link.name}
            </a>
          ))}
          <div className="pt-2 border-t border-white/10">
            <a
              href="#login"
              onClick={() => setMobileMenuOpen(false)}
              className="font-sans block w-full text-center rounded-full border border-white/15 bg-white/10 py-2 text-xs font-semibold text-white"
            >
              Log in
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
