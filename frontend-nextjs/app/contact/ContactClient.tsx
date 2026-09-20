"use client";

import React, { useState, useEffect, FormEvent } from "react";
import Navbar from "@/components/landing/Navbar";
import CtaAndFooterSection from "@/components/landing/CtaAndFooterSection";
import StarField from "@/components/landing/StarField";
import { contactApi, type ContactInput } from "@/api/contact";
import { useAuth } from "@/context/AuthContext";
import { Mail, MessageSquare, MapPin, Send, CheckCircle2, AlertCircle, Loader2, Sparkles } from "lucide-react";

export default function ContactClient() {
  const { user } = useAuth();
  const [form, setForm] = useState<ContactInput>({
    name: user?.name || "",
    email: user?.email || "",
    company: "",
    country: "United States",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || user.name || "",
        email: prev.email || user.email || "",
      }));
    }
  }, [user]);

  function handleChange(key: keyof ContactInput, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await contactApi.create(form);
      setSuccess(true);
      setForm({
        name: user?.name || "",
        email: user?.email || "",
        company: "",
        country: "United States",
        message: "",
      });
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#4343D5] selection:text-white">
      <Navbar />

      <main className="relative overflow-hidden pt-28 pb-20 md:pt-36">
        {/* Background glow effects */}
        <div
          className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] opacity-40 blur-3xl -z-10"
          style={{
            background: "radial-gradient(ellipse at 50% 30%, rgba(67,67,213,0.7) 0%, rgba(2,95,247,0.3) 50%, transparent 80%)",
          }}
        />
        <StarField showShootingStars={true} className="z-0" />

        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-md mb-6">
              <Sparkles size={14} className="text-[#6767DC]" />
              <span className="text-xs font-semibold tracking-wider uppercase text-[#DFD5F6]">Get in Touch</span>
            </div>
            <h1
              className="text-4xl sm:text-6xl font-bold tracking-tight text-[#F7F7FD] leading-[1.12]"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              We’d love to hear from you
            </h1>
            <p className="mt-5 text-base sm:text-lg text-[#A6A6C1] max-w-xl mx-auto leading-relaxed">
              Have questions about our components, licensing, or custom requirements? Send us a message and our team will get back to you quickly.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Contact Info Cards */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#4343D5]/20 border border-[#4343D5]/40 text-[#6767DC]">
                    <Mail size={22} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Email Us</h2>
                    <p className="text-sm text-[#A6A6C1]">Direct contact with support</p>
                  </div>
                </div>
                <a
                  href="mailto:support@uithings.dev"
                  className="text-base font-medium text-[#7C5CFF] hover:text-[#9797FF] transition-colors"
                >
                  support@uithings.dev
                </a>
              </div>

              <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#4343D5]/20 border border-[#4343D5]/40 text-[#6767DC]">
                    <MessageSquare size={22} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Fast Response</h2>
                    <p className="text-sm text-[#A6A6C1]">Average response time</p>
                  </div>
                </div>
                <p className="text-base text-[#D4D4D8]">We typically respond within 24 hours on business days.</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#4343D5]/20 border border-[#4343D5]/40 text-[#6767DC]">
                    <MapPin size={22} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Global Community</h2>
                    <p className="text-sm text-[#A6A6C1]">Empowering creators worldwide</p>
                  </div>
                </div>
                <p className="text-base text-[#D4D4D8]">Supporting developers & designers in over 80+ countries.</p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-white/15 bg-gradient-to-b from-[#0e0e1a]/90 to-[#070710]/95 p-6 sm:p-10 backdrop-blur-2xl shadow-2xl">
                <h2
                  className="text-2xl sm:text-3xl font-bold text-white mb-2"
                  style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                >
                  Send a Message
                </h2>
                <p className="text-sm text-[#A6A6C1] mb-8">
                  Fill out the form below and we will get in touch shortly.
                </p>

                {success && (
                  <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-300">
                    <CheckCircle2 size={20} className="shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-sm">Message Sent Successfully!</h4>
                      <p className="text-xs text-emerald-300/90 mt-1">
                        Thank you for reaching out. Our team has received your message and will reply soon.
                      </p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-300">
                    <AlertCircle size={20} className="shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-sm">Submission Error</h4>
                      <p className="text-xs text-rose-300/90 mt-1">{error}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#A6A6C1] mb-2">
                        Your Name <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        placeholder="Jane Doe"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-[#676780] focus:border-[#4343D5] focus:outline-none focus:ring-1 focus:ring-[#4343D5] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#A6A6C1] mb-2">
                        Email Address <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        placeholder="jane@company.com"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-[#676780] focus:border-[#4343D5] focus:outline-none focus:ring-1 focus:ring-[#4343D5] transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#A6A6C1] mb-2">
                        Company / Project <span className="text-[#676780] lowercase">(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={form.company}
                        onChange={(e) => handleChange("company", e.target.value)}
                        placeholder="Acme Inc."
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-[#676780] focus:border-[#4343D5] focus:outline-none focus:ring-1 focus:ring-[#4343D5] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#A6A6C1] mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        value={form.country}
                        onChange={(e) => handleChange("country", e.target.value)}
                        placeholder="United States"
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-[#676780] focus:border-[#4343D5] focus:outline-none focus:ring-1 focus:ring-[#4343D5] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#A6A6C1] mb-2">
                      Message <span className="text-rose-400">*</span>
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => handleChange("message", e.target.value)}
                      placeholder="How can we help you? Describe your question or requirement..."
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-[#676780] focus:border-[#4343D5] focus:outline-none focus:ring-1 focus:ring-[#4343D5] transition-all resize-y"
                    />
                  </div>

                  <div className="mt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-[#4343D5]/80 backdrop-blur-md px-8 py-3.5 text-base font-semibold text-[#F7F7FD] border border-white/20 shadow-[0_0_24px_rgba(67,67,213,0.5),inset_0_1px_1px_rgba(255,255,255,0.3)] animate-subtle-glow hover:bg-[#525BE0]/90 hover:border-white/35 active:scale-95 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      {loading ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          <span>Sending message...</span>
                        </>
                      ) : (
                        <>
                          <span>Send Message</span>
                          <Send size={16} className="group-hover:translate-x-0.5 transition-transform" />
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

      <CtaAndFooterSection />
    </div>
  );
}
