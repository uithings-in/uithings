import React from "react";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import CtaAndFooterSection from "@/components/landing/CtaAndFooterSection";
import { blogArticles } from "@/lib/blogArticles";

export default function BlogPage() {
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
              {blogArticles.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.id}`}
                  className="group flex flex-col cursor-pointer"
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
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Existing Footer & CTA Section */}
      <CtaAndFooterSection />
    </div>
  );
}
