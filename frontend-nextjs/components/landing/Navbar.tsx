"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Components", href: "#components" },
    { name: "Pricing", href: "#pricing" },
    { name: "FAQs", href: "#faq" },
    { name: "Blog", href: "#blog" },
    { name: "Contact Us", href: "#contact" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-[#05050A]/80 backdrop-blur-xl border-b border-white/10 py-4 shadow-xl shadow-black/50"
          : "bg-transparent py-6"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Left: Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group transition-transform active:scale-95">
            <div className="relative h-8 w-auto flex items-center">
              <img
                src="/assets/logo.svg"
                alt="ui things"
                className="h-8 w-auto object-contain transition-opacity group-hover:opacity-90"
              />
            </div>
          </Link>

          {/* Center: Desktop Navigation Links */}
          <nav
            className="hidden md:flex items-center gap-9 text-sm font-medium text-[#E4E4E7]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="transition-colors duration-200 hover:text-white relative py-1"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Right: Actions */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href="#login"
              className="inline-flex items-center justify-center px-6 py-2 text-sm font-medium text-[#F7F7FD] transition-all duration-200 hover:bg-white/20 hover:border-white/40 active:scale-95 rounded-full border border-white/20 bg-white/[0.08] backdrop-blur-md shadow-sm"
              style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Log in
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-full text-[#A6A6C1] hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mx-4 mt-3 p-6 rounded-2xl border border-white/15 bg-[#0A0A14]/95 backdrop-blur-2xl shadow-2xl flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-200">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="font-sans text-base font-medium text-[#D4D4D8] hover:text-white py-1.5 transition-colors"
            >
              {link.name}
            </a>
          ))}
          <div className="pt-3 border-t border-white/10">
            <a
              href="#login"
              onClick={() => setMobileMenuOpen(false)}
              className="font-sans block w-full text-center rounded-full border border-white/20 bg-white/10 py-2.5 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
            >
              Log in
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

