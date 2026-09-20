"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, User, LayoutDashboard, CreditCard, LogOut } from "lucide-react";
import BrandLogo from "./BrandLogo";
import { useAuth } from "../../context/AuthContext";
import type { User as UserType } from "../../lib/types";

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

function ProfileDropdown({ user, logout }: { user: UserType; logout: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  function handleMouseEnter() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  }

  function handleMouseLeave() {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div
      ref={dropdownRef}
      className="relative hidden md:inline-flex items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 ring-white/20 hover:ring-white/60 transition-all shadow-md inline-flex bg-gradient-to-tr from-[#8A2BE2] to-[#4343D5] text-sm font-bold text-white cursor-pointer relative"
        title={user.name || "Account"}
        aria-label="User Profile"
        aria-expanded={isOpen}
      >
        {user.profilePicture ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.profilePicture}
            alt={user.name || "Profile"}
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : user.name ? (
          user.name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("")
        ) : (
          <User size={18} />
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-[calc(100%+10px)] z-[100] w-64 rounded-2xl border border-white/15 bg-[#0B0B14]/95 p-2 shadow-2xl backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150 text-left"
          style={{ fontFamily: "var(--font-plus-jakarta), 'Plus Jakarta Sans', sans-serif" }}
        >
          {/* User Info Header */}
          <div className="flex items-center gap-3 p-3 border-b border-white/10 mb-1">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-tr from-[#8A2BE2] to-[#4343D5] text-sm font-bold text-white shadow-sm ring-1 ring-white/30">
              {user.profilePicture ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.profilePicture}
                  alt={user.name || "Profile"}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : user.name ? (
                user.name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("")
              ) : (
                <User size={18} />
              )}
            </div>
            <div className="truncate flex-1">
              <div className="flex items-center justify-between gap-1">
                <p className="text-sm font-bold text-white truncate leading-tight">{user.name || "User"}</p>
                {user.isProUser && (
                  <span className="shrink-0 text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30">
                    PRO
                  </span>
                )}
              </div>
              <p className="text-xs text-white/50 truncate mt-0.5">{user.email}</p>
            </div>
          </div>

          {/* Menu Items */}
          <div className="space-y-1">
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-[#D4D4D8] hover:text-white hover:bg-white/10 transition duration-150"
            >
              <LayoutDashboard size={16} className="text-purple-400" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/#pricing"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-[#D4D4D8] hover:text-white hover:bg-white/10 transition duration-150"
            >
              <CreditCard size={16} className="text-emerald-400" />
              <span>Pricing</span>
            </Link>
          </div>

          {/* Divider */}
          <div className="my-1.5 border-t border-white/10" />

          {/* Logout Button */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              logout();
            }}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition duration-150 text-left cursor-pointer"
          >
            <LogOut size={16} className="text-rose-400" />
            <span>Log Out</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isComponentsPage = pathname === "/components" || pathname?.startsWith("/components");
  const { user, isInitialized, setLoginModalOpen, logout } = useAuth();

  useEffect(() => {
    if (isComponentsPage) {
      setNavScrolled(false);
      return;
    }
    const handleScroll = () => setNavScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isComponentsPage]);

  const navLinks = [
    { name: "Components", href: "/components" },
    { name: "Pricing", href: "/#pricing" },
    { name: "FAQs", href: "/#faq" },
    { name: "Blog", href: "/blog" },
    { name: "Contact Us", href: "/#cta" },
  ];

  return (
    <header className="landing-nav fixed top-0 left-0 right-0 z-50 h-[60px] w-full bg-transparent">
      {isComponentsPage ? (
        /* Full-width, edge-to-edge transparent layout on /components */
        <div className="flex h-full w-full items-center justify-between px-4 lg:px-6">
          <div className="flex items-center justify-start shrink-0">
            <BrandLogo />
          </div>

          <nav
            className="hidden items-center justify-center gap-8 text-[18px] font-medium leading-[22px] text-[#F7F7FD] md:flex"
            style={{ fontFamily: "var(--font-plus-jakarta), 'Plus Jakarta Sans', sans-serif" }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="transition-colors duration-200 hover:text-white"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center justify-end shrink-0 min-w-[116px]">
            {user ? (
              <ProfileDropdown user={user} logout={logout} />
            ) : (
              <button
                type="button"
                onClick={() => setLoginModalOpen(true)}
                className="hidden h-9 w-[116px] items-center justify-center rounded-[40px] border border-[rgba(250,250,250,0.1)] bg-[rgba(248,246,253,0.1)] px-5 text-[18px] font-medium text-[#F7F7FD] transition-all hover:bg-white/20 md:inline-flex cursor-pointer"
                style={{ fontFamily: "var(--font-plus-jakarta), 'Plus Jakarta Sans', sans-serif" }}
              >
                Log in
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-full p-2 text-[#A6A6C1] hover:bg-white/10 hover:text-white md:hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      ) : (
        /* Standard centered container layout on all other pages */
        <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-6 lg:px-[120px]">
          <BrandLogo />

          <nav
            className="hidden items-center justify-center gap-8 text-[18px] font-medium leading-[22px] text-[#F7F7FD] md:flex"
            style={{ fontFamily: "var(--font-plus-jakarta), 'Plus Jakarta Sans', sans-serif" }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="transition-colors duration-200 hover:text-white"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {user ? (
            <ProfileDropdown user={user} logout={logout} />
          ) : (
            <button
              type="button"
              onClick={() => setLoginModalOpen(true)}
              className="hidden h-9 w-[116px] items-center justify-center rounded-[40px] border border-[rgba(250,250,250,0.1)] bg-[rgba(248,246,253,0.1)] px-5 text-[18px] font-medium text-[#F7F7FD] transition-all hover:bg-white/20 md:inline-flex cursor-pointer"
              style={{ fontFamily: "var(--font-plus-jakarta), 'Plus Jakarta Sans', sans-serif" }}
            >
              Log in
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-full p-2 text-[#A6A6C1] hover:bg-white/10 hover:text-white md:hidden"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      )}

      {mobileMenuOpen && (
        <div
          className="mx-4 mt-2 flex flex-col gap-4 rounded-2xl border border-white/15 bg-[#0A0A14]/95 p-6 shadow-2xl backdrop-blur-2xl md:hidden"
          style={{ fontFamily: "var(--font-plus-jakarta), 'Plus Jakarta Sans', sans-serif" }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-[18px] font-medium text-[#D4D4D8] hover:text-white"
            >
              {link.name}
            </Link>
          ))}
          {user ? (
            <div className="flex flex-col gap-2 rounded-2xl border border-white/15 bg-white/5 p-3">
              <div className="flex items-center gap-3 pb-2 border-b border-white/10">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-tr from-[#8A2BE2] to-[#4343D5] text-sm font-bold text-white shadow-sm ring-1 ring-white/30">
                  {user.profilePicture ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.profilePicture}
                      alt={user.name || "Profile"}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : user.name ? (
                    user.name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("")
                  ) : (
                    <User size={18} />
                  )}
                </div>
                <div className="truncate text-left flex-1">
                  <p className="text-sm font-semibold leading-none truncate text-white">{user.name || "Account"}</p>
                  <p className="text-xs text-white/60 truncate mt-1">{user.email || "User"}</p>
                </div>
              </div>

              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-[#D4D4D8] hover:text-white hover:bg-white/10 transition"
              >
                <LayoutDashboard size={16} className="text-purple-400" />
                <span>Dashboard</span>
              </Link>

              <Link
                href="/#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-[#D4D4D8] hover:text-white hover:bg-white/10 transition"
              >
                <CreditCard size={16} className="text-emerald-400" />
                <span>Pricing</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition text-left cursor-pointer"
              >
                <LogOut size={16} className="text-rose-400" />
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setLoginModalOpen(true);
              }}
              className="block w-full rounded-full border border-white/20 bg-white/10 py-2.5 text-center text-[18px] font-medium text-white cursor-pointer"
            >
              Log in
            </button>
          )}
        </div>
      )}
    </header>
  );
}


