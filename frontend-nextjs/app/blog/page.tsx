"use client";

import React, { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import CtaAndFooterSection from "@/components/landing/CtaAndFooterSection";

interface Article {
  id: string;
  image: string;
  date: string;
  readTime: string;
  title: string;
  excerpt: string;
  content: string[];
}

const articles: Article[] = [
  {
    id: "where-creative-design-meets-smart-development",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1200&q=80",
    date: "October 3, 2025",
    readTime: "9 min read",
    title: "Where Creative Design Meets Smart Development Solutions",
    excerpt: "This blog bridges the gap between creativity and technology. Learn how design thinking",
    content: [
      "In modern digital product design, the divide between visual aesthetics and technical architecture is collapsing. Where designers once handed off static canvases to engineering teams, today's leaders build with a unified design system mindset.",
      "By approaching UI components as reusable, testable systems, cross-functional teams move 4x faster while maintaining pristine visual quality across every breakpoint.",
      "Learn how to integrate tokens, accessible color palettes, and motion curves directly into your production frontend.",
    ],
  },
  {
    id: "exploring-innovation-through-design-and-web-development",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1200&q=80",
    date: "January 8, 2025",
    readTime: "10 min read",
    title: "Exploring Innovation Through Design and Web Development",
    excerpt: "Dive into the latest trends, tools, and techniques shaping the future of design and development.",
    content: [
      "Innovation in frontend development is no longer just about faster compilers. It is about fluid visual storytelling, micro-interactions, and 3D web experiences that engage users on a visceral level.",
      "From WebGL and Three.js canvas shaders to frictionless layout primitives in CSS and React, the digital landscape offers unprecedented creative power.",
      "Explore the key tools, frameworks, and patterns defining this next generation of web design.",
    ],
  },
  {
    id: "design-ideas-development-tips-card-3",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
    date: "March 24, 2025",
    readTime: "14 min read",
    title: "Design Ideas, Development Tips, and Creative Solutions",
    excerpt: "Your go-to space for actionable insights on design trends, development practices, and creative",
    content: [
      "Creating seamless interfaces requires both aesthetic discipline and rigorous technical execution. We examine how top agencies balance negative space, typography hierarchy, and snappy performance.",
      "Practical advice on building dark mode themes that feel natural, optimizing vector assets, and structuring component states cleanly.",
    ],
  },
  {
    id: "design-ideas-development-tips-card-4",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
    date: "March 24, 2025",
    readTime: "14 min read",
    title: "Design Ideas, Development Tips, and Creative Solutions",
    excerpt: "Your go-to space for actionable insights on design trends, development practices, and creative",
    content: [
      "Environmental branding and digital typography share deep roots. Analyzing spatial design principles unlocks bold architectural approaches to web layout.",
      "Understand grid structures, bold brutalist framing, and high-contrast typography in contemporary web apps.",
    ],
  },
  {
    id: "design-ideas-development-tips-card-5",
    image: "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?auto=format&fit=crop&w=1200&q=80",
    date: "March 24, 2025",
    readTime: "14 min read",
    title: "Design Ideas, Development Tips, and Creative Solutions",
    excerpt: "Your go-to space for actionable insights on design trends, development practices, and creative",
    content: [
      "Tactile brand identity in an increasingly digital world. How physical textures, vivid color choices, and tangible mockups influence brand perception across omni-channel experiences.",
    ],
  },
  {
    id: "design-ideas-development-tips-card-6",
    image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=1200&q=80",
    date: "March 24, 2025",
    readTime: "14 min read",
    title: "Design Ideas, Development Tips, and Creative Solutions",
    excerpt: "Your go-to space for actionable insights on design trends, development practices, and creative",
    content: [
      "Out-of-home advertising and responsive banners: translating multi-format marketing campaigns into responsive web banners and social assets with total brand consistency.",
    ],
  },
  {
    id: "design-ideas-development-tips-card-7",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80",
    date: "March 24, 2026",
    readTime: "14 min read",
    title: "Design Ideas, Development Tips, and Creative Solutions",
    excerpt: "Your go-to space for actionable insights on design trends, development practices, and creative",
    content: [
      "High-voltage neon accents and brutalist shadow geometry. Why high-contrast styling is taking over modern digital products and how to apply it thoughtfully without overwhelming user attention.",
    ],
  },
  {
    id: "design-ideas-development-tips-card-8",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    date: "March 24, 2026",
    readTime: "14 min read",
    title: "Design Ideas, Development Tips, and Creative Solutions",
    excerpt: "Your go-to space for actionable insights on design trends, development practices, and creative",
    content: [
      "Levitating 3D presentations and futuristic product marketing. Elevate your portfolio and client presentations using modern 3D lighting, glass shaders, and dynamic mockups.",
    ],
  },
  {
    id: "design-ideas-development-tips-card-9",
    image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1200&q=80",
    date: "March 24, 2026",
    readTime: "14 min read",
    title: "Design Ideas, Development Tips, and Creative Solutions",
    excerpt: "Your go-to space for actionable insights on design trends, development practices, and creative",
    content: [
      "The new minimalism: editorial layouts, stone textures, and classical proportions reimagined for modern touch devices and high-DPI displays.",
    ],
  },
];


export default function BlogPage() {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  return (
    <div className="min-h-screen bg-[#070416] text-[#F7F7FD] selection:bg-[#4343D5] selection:text-white antialiased font-sans">
      {/* Existing Navbar */}
      <Navbar />

      {/* 2. Hero Section: Giant "Articles" Heading */}
      <main className="w-full pt-16 sm:pt-24">
        <section className="pt-16 pb-12 sm:pt-24 sm:pb-16 text-center">
          <div className="mx-auto max-w-[1360px] px-6 sm:px-10 lg:px-14">
            <h1 className="text-[84px] sm:text-[130px] md:text-[170px] lg:text-[210px] font-bold tracking-[-0.045em] leading-[0.88] text-white select-none">
              Articles
            </h1>
          </div>
        </section>

        {/* 3. Timeline / Year Separator Line */}
        <section className="w-full">
          <div className="mx-auto max-w-[1360px] px-6 sm:px-10 lg:px-14">
            <div className="flex items-baseline justify-between text-[11px] sm:text-[12px] font-medium text-[#9389A8] pb-2.5">
              <span>2025</span>
              <span>2026</span>
            </div>
            <div className="h-[1px] w-full bg-white/15" />
          </div>
        </section>

        {/* 4. Articles Grid */}
        <section className="pt-12 sm:pt-16 pb-24 sm:pb-32">
          <div className="mx-auto max-w-[1360px] px-6 sm:px-10 lg:px-14">
            <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((post) => (
                <article
                  key={post.id}
                  onClick={() => setSelectedArticle(post)}
                  className="group flex cursor-pointer flex-col"
                >
                  {/* Article Card Image */}
                  <div className="relative aspect-[1.38/1] w-full overflow-hidden rounded-[4px] border border-white/10 bg-[#0c0822]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.image}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  </div>

                  {/* Date & Read Time */}
                  <div className="mt-4 flex items-center gap-2 text-[11px] sm:text-[11.5px] font-medium text-[#9389A8]">
                    <span>{post.date}</span>
                    <span className="text-white/20">|</span>
                    <span>{post.readTime}</span>
                  </div>

                  {/* Article Title */}
                  <h2 className="mt-2 text-[17px] sm:text-[18px] font-bold leading-[1.3] tracking-[-0.015em] text-[#F7F7FD] transition-colors group-hover:text-white">
                    {post.title}
                  </h2>

                  {/* Article Excerpt */}
                  <p className="mt-2 line-clamp-2 text-[12.5px] leading-relaxed text-[#9389A8]">
                    {post.excerpt}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Existing Footer & CTA Section */}
      <CtaAndFooterSection />

      {/* Article Detail Modal (Interactive reading experience) */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md transition-all">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/15 bg-[#0c0822] p-6 shadow-2xl sm:p-10 text-[#F7F7FD]">
            <button
              onClick={() => setSelectedArticle(null)}
              className="absolute right-5 top-5 rounded-full p-2 text-[#9389A8] hover:bg-white/10 hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-white/10 bg-black/40 mb-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedArticle.image}
                alt={selectedArticle.title}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex items-center gap-2 text-[12px] font-medium text-[#9389A8] mb-3">
              <span>{selectedArticle.date}</span>
              <span className="text-white/20">|</span>
              <span>{selectedArticle.readTime}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-4">
              {selectedArticle.title}
            </h2>

            <p className="text-base font-medium text-[#D4D2E6] leading-relaxed mb-6 border-l-2 border-[#4343D5] pl-4">
              {selectedArticle.excerpt}
            </p>

            <div className="space-y-4 text-sm leading-relaxed text-[#A6A6C1]">
              {selectedArticle.content.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setSelectedArticle(null)}
                className="rounded-full bg-[#4343D5] px-5 py-2 text-xs font-medium text-white hover:bg-[#525BE0] transition"
              >
                Close Article
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
