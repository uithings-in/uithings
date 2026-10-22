import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import CtaAndFooterSection from "@/components/landing/CtaAndFooterSection";
import StarField from "@/components/landing/StarField";
import {
  blogArticles,
  getArticleById,
  getSimilarArticles,
} from "@/lib/blogArticles";

interface PageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return blogArticles.map((article) => ({
    id: article.id,
  }));
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { id } = await params;
  const article = getArticleById(id);

  if (!article) {
    notFound();
  }

  const similarArticles = getSimilarArticles(article.id, 3);

  return (
    <div className="relative min-h-screen [overflow-x:clip] bg-[#070416] text-[#F7F7FD] font-sans antialiased selection:bg-[#4343D5] selection:text-white">
      {/* Background Radial Glow & Atmosphere matching Footer and Hero */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 w-[1600px] h-[900px] opacity-75"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 10%, rgba(67, 67, 213, 0.45) 0%, rgba(50, 30, 168, 0.22) 45%, rgba(7, 4, 22, 0) 75%)",
        }}
      />
      <img
        src="/landing/cta-flare.svg"
        alt=""
        className="pointer-events-none absolute left-1/2 -top-12 w-[1600px] max-w-none -translate-x-1/2 opacity-50 mix-blend-screen select-none"
      />

      {/* Static Star Dots Field */}
      <StarField showShootingStars={false} className="opacity-80" />

      {/* Navigation */}
      <Navbar />

      <main className="relative z-10 w-full pt-[110px] sm:pt-[130px] pb-20">
        <article className="mx-auto max-w-[840px] px-5 sm:px-8">
          {/* Back link */}
          <div className="mb-8">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs sm:text-sm font-medium text-[#A6A6C1] hover:text-white hover:border-white/20 hover:bg-white/[0.08] backdrop-blur-md transition-all shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to all articles</span>
            </Link>
          </div>

          {/* Article Header */}
          <header className="mb-10">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1 backdrop-blur-md mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-[#7C5CFF] shadow-[0_0_8px_#7C5CFF]" />
              <span className="text-[11px] sm:text-[12px] font-medium tracking-wide text-[#DFD5F6]">
                Design &amp; Engineering
              </span>
            </div>

            <h1 className="text-[28px] sm:text-[38px] md:text-[46px] font-bold tracking-[-0.035em] leading-[1.16] text-white">
              {article.title}
            </h1>

            <p className="mt-4 text-[14px] sm:text-[16px] md:text-[17px] leading-relaxed text-[#A6A6C1]">
              {article.subtitle || article.excerpt}
            </p>

            <div className="mt-6 flex items-center gap-5 text-xs sm:text-sm font-medium text-[#8F8A98]">
              <span className="flex items-center gap-1.5 text-[#DFD5F6]">
                <Calendar className="w-3.5 h-3.5 text-[#7C5CFF]" />
                <span>{article.date}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#A6A6C1]" />
                <span>{article.readTime}</span>
              </span>
            </div>
          </header>

          {/* Hero Featured Image */}
          <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0C0822] shadow-[0_12px_45px_rgba(0,0,0,0.55)] aspect-[16/10] sm:aspect-[16/9] mb-12">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.heroImage || article.image}
              alt={article.title}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Article Sections */}
          <div className="article-body space-y-10">
            {article.sections && article.sections.length > 0 ? (
              article.sections.map((section, idx) => (
                <section key={idx} className="space-y-4">
                  {section.heading && (
                    <h2 className="text-[20px] sm:text-[24px] font-bold tracking-[-0.02em] text-white pt-2">
                      {section.heading}
                    </h2>
                  )}

                  {section.paragraphs.map((paragraph, pIdx) => (
                    <p
                      key={pIdx}
                      className="text-[14.5px] sm:text-[16px] leading-[1.85] text-[#C4C0D9]"
                    >
                      {paragraph}
                    </p>
                  ))}

                  {/* Inline Image */}
                  {section.image && (
                    <div className="my-8 overflow-hidden rounded-2xl border border-white/10 bg-[#0C0822] shadow-[0_8px_32px_rgba(0,0,0,0.45)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={section.image.src}
                        alt={section.image.alt}
                        className="h-auto w-full object-cover max-h-[520px]"
                      />
                      {section.image.caption && (
                        <p className="p-3 text-center text-xs text-[#8F8A98] italic">
                          {section.image.caption}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Quote / Callout */}
                  {section.quote && (
                    <blockquote className="my-8 rounded-2xl border border-[#7C5CFF]/35 bg-gradient-to-b from-[#150F38]/90 to-[#0E0B26]/90 p-6 sm:p-8 backdrop-blur-md shadow-[0_0_30px_rgba(124,92,255,0.15)]">
                      <p className="text-[14px] sm:text-[15.5px] font-normal italic leading-[1.8] text-[#E0DCFE]">
                        &ldquo;{section.quote}&rdquo;
                      </p>
                    </blockquote>
                  )}
                </section>
              ))
            ) : (
              <div className="space-y-5">
                {article.content.map((paragraph, pIdx) => (
                  <p
                    key={pIdx}
                    className="text-[14.5px] sm:text-[16px] leading-[1.85] text-[#C4C0D9]"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            )}
          </div>
        </article>

        {/* Similar Blogs Section */}
        <section className="mt-24 sm:mt-32 border-t border-white/10 pt-16 sm:pt-20">
          <div className="mx-auto max-w-[1140px] px-5 sm:px-8">
            <div className="text-center mb-12 sm:mb-14">
              <h2 className="text-[32px] sm:text-[40px] font-bold tracking-[-0.035em] text-white">
                Similar Blogs
              </h2>
              <p className="mt-2.5 text-xs sm:text-sm text-[#A6A6C1] max-w-md mx-auto leading-relaxed">
                From the captivating realm of creativity to complex realm of AI,
                our collection encompasses a vibrant spectrum of insights.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7">
              {similarArticles.map((similar) => (
                <Link
                  key={similar.id}
                  href={`/blog/${similar.id}`}
                  className="group flex flex-col cursor-pointer rounded-2xl border border-white/[0.08] bg-[#0E0B22]/70 p-4 transition-all duration-300 hover:border-white/20 hover:bg-[#130E2E]/85 shadow-[0_4px_24px_rgba(0,0,0,0.3)] backdrop-blur-md"
                >
                  <div className="relative aspect-[1.38/1] w-full overflow-hidden rounded-xl border border-white/10 bg-[#0C0822]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={similar.image}
                      alt={similar.title}
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  </div>

                  <div className="mt-3.5 flex items-center gap-2 text-[11px] font-medium text-[#9389A8]">
                    <span>{similar.date}</span>
                    <span className="text-white/20">|</span>
                    <span>{similar.readTime}</span>
                  </div>

                  <h3 className="mt-2 text-[15px] sm:text-[16px] font-bold leading-[1.32] tracking-[-0.015em] text-white transition-colors group-hover:text-[#A594FD] line-clamp-2">
                    {similar.title}
                  </h3>

                  <p className="mt-2 line-clamp-2 text-[12.5px] leading-relaxed text-[#8F8A98]">
                    {similar.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Existing Footer & CTA */}
      <CtaAndFooterSection />
    </div>
  );
}
