"use client";

import React, { useState, useEffect, FormEvent } from "react";
import Navbar from "@/components/landing/Navbar";
import CtaAndFooterSection from "@/components/landing/CtaAndFooterSection";
import StarField from "@/components/landing/StarField";
import { contactApi } from "@/api/contact";
import { useAuth } from "@/context/AuthContext";
import {
  Mail,
  MapPin,
  Phone,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronDown,
  Check,
} from "lucide-react";

// Social Icons as SVGs for pixel-perfect match
function FacebookIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function TwitterIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function YouTubeIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.254.418-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 12 5 12 5s6.255 0 7.812.418ZM15.194 12 10 15V9l5.194 3Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function DribbbleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm6.605 4.61a8.502 8.502 0 0 1 1.93 5.314c-.281-.059-2.73-.559-5.32-.23-.07-.156-.14-.316-.217-.478-.636-1.34-1.378-2.616-2.195-3.774 2.898-1.002 5.25-.87 5.802-.832zM12 3.518c2.09 0 4.004.764 5.485 2.036-.503.024-2.585.127-5.26 1.057a39.88 39.88 0 0 0-3.32-4.003c.96-.364 2-.59 3.095-.59zm-4.707 1.7c.94 1.135 1.986 2.378 3.12 3.69-2.13.682-4.66 1.01-7.25 1.077A8.47 8.47 0 0 1 7.293 5.218zM3.52 12c0-.12.006-.24.015-.36 2.77-.07 5.5-.423 7.785-1.155.08.167.155.334.227.502.576 1.34 1.05 2.68 1.417 3.993-3.69.96-6.85 3.04-8.384 5.28A8.46 8.46 0 0 1 3.52 12zm8.48 8.48c-1.89 0-3.64-.627-5.048-1.688 1.4-2.07 4.29-4.005 7.74-4.912.44 1.25.75 2.45.92 3.58a8.528 8.528 0 0 1-3.612 3.02zm5.18-4.2c-.17-1.04-.46-2.14-.87-3.29 2.4-.35 4.7.13 4.97.19a8.47 8.47 0 0 1-4.1 3.1z"
        clipRule="evenodd"
      />
    </svg>
  );
}

// Left column and Right column services in exact order shown in the design
const SERVICES_COLUMN_1 = ["Website design", "UX design", "User research"];
const SERVICES_COLUMN_2 = ["Content creation", "Strategy & consulting", "Other"];

const COUNTRY_CODES = [
  { code: "US", dial: "+1", country: "United States" },
  { code: "UK", dial: "+44", country: "United Kingdom" },
  { code: "IN", dial: "+91", country: "India" },
  { code: "CA", dial: "+1", country: "Canada" },
  { code: "AU", dial: "+61", country: "Australia" },
  { code: "DE", dial: "+49", country: "Germany" },
  { code: "FR", dial: "+33", country: "France" },
  { code: "SG", dial: "+65", country: "Singapore" },
];

export default function ContactClient() {
  const { user, setLoginModalOpen } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [services, setServices] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      if (!name) setName(user.name || "");
      if (!email) setEmail(user.email || "");
    }
  }, [user]);

  function handleToggleService(service: string) {
    setServices((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!user) {
      setError("Please sign in to send your message so we can track and reply to your account.");
      setLoginModalOpen(true);
      return;
    }

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError(null);

    // Structure services and phone into the contact message body cleanly
    const servicesPart =
      services.length > 0 ? `[Selected Services: ${services.join(", ")}]\n` : "";
    const phonePart = phoneNumber.trim()
      ? `[Phone: ${selectedCountry.dial} ${phoneNumber.trim()}]\n`
      : "";
    const finalMessage = `${servicesPart}${phonePart}\n${message}`.trim();

    try {
      await contactApi.create({
        name: name.trim(),
        email: email.trim(),
        country: selectedCountry.country,
        message: finalMessage,
      });

      setSuccess(true);
      setMessage("");
      setPhoneNumber("");
      setServices([]);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong while sending your message. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen [overflow-x:clip] bg-black font-sans text-white selection:bg-[#7F56D9] selection:text-white">
      <Navbar />

      <main className="relative overflow-hidden pt-28 pb-20 sm:pt-32 sm:pb-28">
        {/* Landing Page SVG Backdrop with smooth bottom gradient fade */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/landing/hero-bg.svg"
          alt=""
          className="pointer-events-none absolute -top-[90px] left-1/2 h-[1200px] w-[2140px] max-w-none -translate-x-1/2 object-cover opacity-90 select-none"
          style={{
            maskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 95%)",
            WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 95%)",
          }}
        />

        {/* Primary Cosmic Glow */}
        <div
          className="pointer-events-none absolute -top-[80px] left-1/2 z-0 h-[850px] w-full max-w-[2000px] -translate-x-1/2"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% 8%, rgba(2,95,247,0.7) 0%, rgba(67,67,213,0.4) 45%, rgba(10,14,40,0.15) 70%, transparent 90%)",
          }}
        />

        {/* Soft Ambient Diffuse Glow */}
        <div
          className="pointer-events-none absolute top-[150px] left-1/2 z-0 h-[600px] w-full max-w-[1600px] -translate-x-1/2 blur-3xl"
          style={{
            background:
              "radial-gradient(ellipse at 50% 40%, rgba(102,124,255,0.4) 0%, rgba(67,67,213,0.2) 50%, transparent 75%)",
          }}
        />

        {/* Star Field with Twinkles & Shooting Stars */}
        <StarField showShootingStars={true} className="z-0" />

        {/* Subtle Noise Texture Overlay */}
        <div className="pointer-events-none absolute inset-0 z-0 h-full w-full bg-noise-overlay opacity-20" />

        {/* Decorative Fixed Shooting Stars from landing CTA/Hero */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/landing/star-line-l.svg"
          alt=""
          className="pointer-events-none absolute left-[6%] sm:left-[10%] md:left-[12%] top-[190px] hidden h-[155px] w-[89px] opacity-75 lg:block"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/landing/star-line-r.svg"
          alt=""
          className="pointer-events-none absolute right-[6%] sm:right-[10%] md:right-[12%] top-[150px] hidden h-[181px] w-[99px] -scale-x-100 opacity-75 lg:block"
        />

        {/* Contact Window Container Card matching the exact provided design */}
        <div className="relative z-10 mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[24px] md:rounded-[32px] border border-white/15 bg-white shadow-[0_30px_90px_rgba(0,0,0,0.8),0_0_50px_rgba(94,52,168,0.35)]">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Left Sidebar: Royal Purple Brand Panel (50% card width) */}
              <div className="relative flex flex-col justify-between bg-[#5B33A8] p-8 text-white sm:p-10 md:p-12 lg:col-span-1">
                <div>
                  {/* macOS traffic light window dots */}
                  <div className="mb-8 flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-[#FF5F56]" />
                    <span className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
                    <span className="h-3 w-3 rounded-full bg-[#27C93F]" />
                  </div>

                  {/* Header */}
                  <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    Get in touch
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-[#E9D7FE] sm:text-base">
                    We’ love to hear from you. Our friendly team is always here to chat.
                  </p>

                  {/* Contact Information Blocks */}
                  <div className="mt-10 space-y-8 sm:mt-12 sm:space-y-9">
                    {/* Chat to us */}
                    <div className="flex items-start gap-4">
                      <div className="mt-0.5 flex shrink-0 items-center justify-center text-white">
                        <Mail className="h-6 w-6 stroke-[1.75]" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-white">Chat to us</h3>
                        <p className="mt-0.5 text-sm text-[#E9D7FE]">
                          Our friendly team is here to help.
                        </p>
                        <a
                          href="mailto:team.uithings@outlook.com"
                          className="mt-2 inline-block text-sm font-semibold text-white transition-opacity hover:opacity-90 hover:underline"
                        >
                          team.uithings@outlook.com
                        </a>
                      </div>
                    </div>

                    {/* Office */}
                    <div className="flex items-start gap-4">
                      <div className="mt-0.5 flex shrink-0 items-center justify-center text-white">
                        <MapPin className="h-6 w-6 stroke-[1.75]" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-white">Office</h3>
                        <p className="mt-0.5 text-sm text-[#E9D7FE]">
                          Come say hello at our office HQ.
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-[#F4EBFF]">
                          100 Smith Street
                          <br />
                          Collingwood VIC 3066 AU
                        </p>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="flex items-start gap-4">
                      <div className="mt-0.5 flex shrink-0 items-center justify-center text-white">
                        <Phone className="h-6 w-6 stroke-[1.75]" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-white">Phone</h3>
                        <p className="mt-0.5 text-sm text-[#E9D7FE]">
                          Mon-Fri from 8am to 5pm.
                        </p>
                        <a
                          href="tel:+15550000000"
                          className="mt-2 inline-block text-sm font-semibold text-white transition-opacity hover:opacity-90 hover:underline"
                        >
                          +1 (555) 000-0000
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Social Links */}
                <div className="mt-12 flex items-center gap-5 pt-6 text-[#E9D7FE] lg:mt-auto">
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="transition-colors hover:text-white"
                  >
                    <FacebookIcon className="h-5 w-5" />
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Twitter / X"
                    className="transition-colors hover:text-white"
                  >
                    <TwitterIcon className="h-5 w-5" />
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    className="transition-colors hover:text-white"
                  >
                    <LinkedInIcon className="h-5 w-5" />
                  </a>
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="YouTube"
                    className="transition-colors hover:text-white"
                  >
                    <YouTubeIcon className="h-5 w-5" />
                  </a>
                  <a
                    href="https://dribbble.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Dribbble"
                    className="transition-colors hover:text-white"
                  >
                    <DribbbleIcon className="h-5 w-5" />
                  </a>
                </div>
              </div>

              {/* Right Form: Clean White Panel (50% card width) */}
              <div className="flex flex-col justify-center bg-white p-8 text-[#101828] sm:p-10 md:p-12 lg:col-span-1">
                <div className="mx-auto w-full max-w-[460px]">
                  {/* Heading */}
                  <h1 className="text-3xl font-bold tracking-tight text-[#101828] sm:text-4xl">
                    Level up your brand
                  </h1>
                  <p className="mt-3 text-base text-[#475467]">
                    You can reach us anytime via{" "}
                    <a
                      href="mailto:team.uithings@outlook.com"
                      className="font-medium text-[#6941C6] hover:underline"
                    >
                      mail
                    </a>
                  </p>

                  {/* Success Banner */}
                  {success && (
                    <div className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                      <div className="text-sm">
                        <p className="font-semibold">Thank you for getting in touch!</p>
                        <p className="mt-1 text-emerald-700">
                          Our team has received your inquiry and will reply shortly.
                        </p>
                        <button
                          type="button"
                          onClick={() => setSuccess(false)}
                          className="mt-2 font-medium text-emerald-800 underline hover:text-emerald-900 cursor-pointer"
                        >
                          Send another message
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Error Banner */}
                  {error && (
                    <div className="mt-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
                      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                      <div className="text-sm">
                        <p className="font-semibold">Notice</p>
                        <p className="mt-0.5 text-rose-700">{error}</p>
                      </div>
                    </div>
                  )}

                  {/* Contact Form */}
                  <form onSubmit={handleSubmit} className="mt-7 space-y-5">
                    {/* Name Field */}
                    <div>
                      <label
                        htmlFor="contact-name"
                        className="block text-sm font-medium text-[#344054]"
                      >
                        Name
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="mt-1.5 w-full rounded-lg border border-[#D0D5DD] bg-white px-3.5 py-2.5 text-sm text-[#101828] placeholder:text-[#667085] shadow-xs transition focus:border-[#7F56D9] focus:outline-none focus:ring-4 focus:ring-[#7F56D9]/15"
                      />
                    </div>

                    {/* Email Field */}
                    <div>
                      <label
                        htmlFor="contact-email"
                        className="block text-sm font-medium text-[#344054]"
                      >
                        Email
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        className="mt-1.5 w-full rounded-lg border border-[#D0D5DD] bg-white px-3.5 py-2.5 text-sm text-[#101828] placeholder:text-[#667085] shadow-xs transition focus:border-[#7F56D9] focus:outline-none focus:ring-4 focus:ring-[#7F56D9]/15"
                      />
                    </div>

                    {/* Phone number Field */}
                    <div>
                      <label
                        htmlFor="contact-phone"
                        className="block text-sm font-medium text-[#344054]"
                      >
                        Phone number
                      </label>
                      <div className="relative mt-1.5 flex rounded-lg border border-[#D0D5DD] bg-white shadow-xs focus-within:border-[#7F56D9] focus-within:ring-4 focus-within:ring-[#7F56D9]/15">
                        <div className="relative inline-flex items-center">
                          <select
                            aria-label="Country Dial Code"
                            value={selectedCountry.code}
                            onChange={(e) => {
                              const found = COUNTRY_CODES.find((c) => c.code === e.target.value);
                              if (found) setSelectedCountry(found);
                            }}
                            className="h-full cursor-pointer appearance-none rounded-l-lg border-0 bg-transparent py-2.5 pl-3.5 pr-7 text-sm font-medium text-[#344054] focus:outline-none"
                          >
                            {COUNTRY_CODES.map((c) => (
                              <option key={c.code} value={c.code}>
                                {c.code}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-2 h-4 w-4 text-[#667085]" />
                        </div>
                        <div className="h-5 w-[1px] self-center bg-[#D0D5DD]" />
                        <input
                          id="contact-phone"
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="+1 (555) 000-0000"
                          className="w-full rounded-r-lg border-0 bg-transparent py-2.5 pl-3 pr-3.5 text-sm text-[#101828] placeholder:text-[#667085] focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* How can we help? (Textarea) */}
                    <div>
                      <label
                        htmlFor="contact-message"
                        className="block text-sm font-medium text-[#344054]"
                      >
                        How can we help?
                      </label>
                      <textarea
                        id="contact-message"
                        required
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Tell us a little about the project..."
                        className="mt-1.5 w-full resize-none rounded-lg border border-[#D0D5DD] bg-white px-3.5 py-2.5 text-sm text-[#101828] placeholder:text-[#667085] shadow-xs transition focus:border-[#7F56D9] focus:outline-none focus:ring-4 focus:ring-[#7F56D9]/15"
                      />
                    </div>

                    {/* Services Checkboxes */}
                    <div>
                      <span className="block text-sm font-medium text-[#344054]">
                        Services
                      </span>
                      <div className="mt-2.5 grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
                        {/* Left Column */}
                        <div className="space-y-2.5">
                          {SERVICES_COLUMN_1.map((service) => {
                            const isChecked = services.includes(service);
                            return (
                              <label
                                key={service}
                                className="group flex cursor-pointer select-none items-center gap-3 text-sm text-[#344054]"
                              >
                                <div
                                  onClick={() => handleToggleService(service)}
                                  className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border transition-colors ${isChecked
                                      ? "border-[#7F56D9] bg-[#7F56D9] text-white"
                                      : "border-[#D0D5DD] bg-white group-hover:border-[#98A2B3]"
                                    }`}
                                >
                                  {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                                </div>
                                <span onClick={() => handleToggleService(service)}>
                                  {service}
                                </span>
                              </label>
                            );
                          })}
                        </div>

                        {/* Right Column */}
                        <div className="space-y-2.5">
                          {SERVICES_COLUMN_2.map((service) => {
                            const isChecked = services.includes(service);
                            return (
                              <label
                                key={service}
                                className="group flex cursor-pointer select-none items-center gap-3 text-sm text-[#344054]"
                              >
                                <div
                                  onClick={() => handleToggleService(service)}
                                  className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border transition-colors ${isChecked
                                      ? "border-[#7F56D9] bg-[#7F56D9] text-white"
                                      : "border-[#D0D5DD] bg-white group-hover:border-[#98A2B3]"
                                    }`}
                                >
                                  {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                                </div>
                                <span onClick={() => handleToggleService(service)}>
                                  {service}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-[#7F56D9] px-4 py-3 text-center text-sm font-semibold text-white shadow-xs transition-all duration-200 hover:bg-[#6941C6] active:bg-[#53389E] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                      >
                        {loading ? (
                          <span className="inline-flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Sending message...</span>
                          </span>
                        ) : (
                          "Get started"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <CtaAndFooterSection />
    </div>
  );
}
