"use client";

import React, { useState, useEffect, FormEvent } from "react";
import Navbar from "@/components/landing/Navbar";
import CtaAndFooterSection from "@/components/landing/CtaAndFooterSection";
import StarField from "@/components/landing/StarField";
import { contactApi } from "@/api/contact";
import { useAuth } from "@/context/AuthContext";
import {
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function ContactClient() {
  const { user, setLoginModalOpen } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      if (!email && user.email) setEmail(user.email);
      if (!firstName && user.name) {
        const parts = user.name.trim().split(" ");
        setFirstName(parts[0] || "");
        setLastName(parts.slice(1).join(" ") || "");
      }
    }
  }, [user]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!user) {
      setError(
        "Please sign in to send your message so we can associate and respond to your account.",
      );
      setLoginModalOpen(true);
      return;
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    if (!fullName || !email.trim() || !message.trim()) {
      setError("Please fill in your name, email address, and message.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await contactApi.create({
        name: fullName,
        email: email.trim(),
        country: "Global",
        message: message.trim(),
      });

      setSuccess(true);
      setMessage("");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Could not send your message. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen [overflow-x:clip] bg-[#070416] font-sans text-[#F7F7FD] selection:bg-[#4343D5] selection:text-white antialiased">
      {/* Continuous Cosmic Radial Glow running seamlessly through the page */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 w-[1800px] h-[1400px] opacity-80"
        style={{
          background:
            "radial-gradient(ellipse 75% 65% at 50% 25%, rgba(67, 67, 213, 0.45) 0%, rgba(50, 30, 168, 0.28) 40%, rgba(20, 15, 60, 0.15) 70%, transparent 95%)",
        }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/landing/cta-flare.svg"
        alt=""
        className="pointer-events-none absolute left-1/2 -top-12 w-[1600px] max-w-none -translate-x-1/2 opacity-50 mix-blend-screen select-none"
      />

      {/* Seamless Bridge Glow between Contact Section and Footer */}
      <div
        className="pointer-events-none absolute left-1/2 top-[500px] -translate-x-1/2 w-[1700px] h-[800px] opacity-75"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 45%, rgba(67, 67, 213, 0.4) 0%, rgba(50, 30, 168, 0.22) 50%, transparent 85%)",
        }}
      />

      {/* Ambient Star Field */}
      <StarField showShootingStars={false} className="opacity-80" />

      {/* Navigation */}
      <Navbar />

      {/* Main Section */}
      <main className="relative z-10 w-full px-5 pt-[120px] pb-4 sm:px-8 sm:pt-[150px] sm:pb-6">
        <div className="mx-auto w-full max-w-[1140px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left Column: Direct Heading & Contact Details */}
            <div className="lg:col-span-5 flex flex-col justify-start">
              {/* Heading */}
              <h1 className="text-[44px] sm:text-[56px] lg:text-[62px] font-bold tracking-tight text-white leading-[1.08]">
                Get in —
                <br />
                touch with us
              </h1>

              {/* Subtitle / Description */}
              <p className="mt-6 text-sm sm:text-base text-[#A6A6C1] leading-relaxed max-w-md">
                We’re here to help! Whether you have a question about our
                services, need assistance with your account, or want to provide
                feedback, our team is ready to assist you.
              </p>

              {/* Email Block */}
              <div className="mt-8">
                <span className="text-xs font-normal text-[#8888A5] block">
                  Email:
                </span>
                <a
                  href="mailto:team.uithings@outlook.com"
                  className="mt-1 text-base sm:text-lg font-semibold text-white hover:text-[#C4B5FD] transition-colors inline-block"
                >
                  team.uithings@outlook.com
                </a>
              </div>

              {/* Phone Block */}
              {/* <div className="mt-6">
                <span className="text-xs font-normal text-[#8888A5] block">
                  Phone:
                </span>
                <p className="mt-1 text-base sm:text-lg font-semibold text-white tracking-wide">
                  +1 (555) 019-2834
                </p>
                <p className="mt-1 text-xs text-[#8888A5]">
                  Available Monday to Friday, 9 AM - 6 PM GMT
                </p>
              </div> */}

              {/* Live Chat Pill Button */}
              <div className="mt-8">
                <a
                  href="mailto:team.uithings@outlook.com?subject=Live%20Support%20Request"
                  className="group inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20 hover:border-white/30"
                >
                  <span>Live Chat</span>
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-black transition-transform group-hover:translate-x-0.5">
                    <ArrowRight className="h-3 w-3 stroke-[2.5]" />
                  </div>
                </a>
              </div>
            </div>

            {/* Right Column: Blended Glass Form Card */}
            <div className="lg:col-span-7">
              <div className="rounded-[32px] border border-white/10 bg-[#0B0822]/60 p-7 sm:p-10 md:p-12 text-white backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
                {/* Success Banner */}
                {success && (
                  <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-200">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                    <div className="text-sm">
                      <p className="font-semibold text-white">
                        Thank you for reaching out!
                      </p>
                      <p className="mt-0.5 text-xs text-emerald-200/90">
                        Our team has received your message and will reply shortly.
                      </p>
                      <button
                        type="button"
                        onClick={() => setSuccess(false)}
                        className="mt-2 text-xs font-semibold text-emerald-300 underline hover:text-emerald-200 cursor-pointer"
                      >
                        Send another message
                      </button>
                    </div>
                  </div>
                )}

                {/* Error Banner */}
                {error && (
                  <div className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-200">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
                    <div className="text-sm">
                      <p className="font-semibold text-white">Notice</p>
                      <p className="mt-0.5 text-xs text-rose-200/90">{error}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* First Name & Last Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="first-name"
                        className="block text-xs font-medium text-[#AEB2EA] mb-2"
                      >
                        First Name
                      </label>
                      <input
                        id="first-name"
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Enter your first name..."
                        className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/25 backdrop-blur-md transition-all focus:border-[#7C5CFF] focus:bg-white/[0.07] focus:outline-none focus:ring-1 focus:ring-[#7C5CFF]"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="last-name"
                        className="block text-xs font-medium text-[#AEB2EA] mb-2"
                      >
                        Last Name
                      </label>
                      <input
                        id="last-name"
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Enter your last name..."
                        className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/25 backdrop-blur-md transition-all focus:border-[#7C5CFF] focus:bg-white/[0.07] focus:outline-none focus:ring-1 focus:ring-[#7C5CFF]"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-xs font-medium text-[#AEB2EA] mb-2"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address..."
                      className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/25 backdrop-blur-md transition-all focus:border-[#7C5CFF] focus:bg-white/[0.07] focus:outline-none focus:ring-1 focus:ring-[#7C5CFF]"
                    />
                  </div>

                  {/* How can we help you? (Message) */}
                  <div>
                    <label
                      htmlFor="message"
                      className="block text-xs font-medium text-[#AEB2EA] mb-2"
                    >
                      How can we help you?
                    </label>
                    <textarea
                      id="message"
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Enter your message..."
                      className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/25 backdrop-blur-md transition-all focus:border-[#7C5CFF] focus:bg-white/[0.07] focus:outline-none focus:ring-1 focus:ring-[#7C5CFF] leading-relaxed"
                    />
                  </div>

                  {/* Send Message Pill Button (Right aligned) */}
                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="group inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20 hover:border-white/30 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer shadow-md"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-white" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <span>Send Message</span>
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-black transition-transform group-hover:translate-x-0.5">
                            <ArrowRight className="h-3 w-3 stroke-[2.5]" />
                          </div>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      <CtaAndFooterSection blendTop />
    </div>
  );
}
