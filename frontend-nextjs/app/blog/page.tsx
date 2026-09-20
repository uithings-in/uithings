"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ArrowRight, Calendar, Clock, Sparkles } from "lucide-react";
import Navbar from "@/components/landing/Navbar";

interface BlogPost {
  id: string;
  title: string;
  date: string;
  author: string;
  category: string;
  image: string;
  excerpt: string;
  content: string[];
}

const blogPosts: BlogPost[] = [
  {
    id: "component-driven",
    title: "The Future of Component-Driven Development",
    date: "December 22, 2024",
    author: "Alex Rivera",
    category: "Development",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=1400",
    excerpt: "Discover how reusable components are changing the landscape of modern web development and saving teams countless hours.",
    content: [
      "Component-driven development is no longer just a buzzword. It is the foundational methodology for modern web development. By breaking down complex interfaces into reusable building blocks, teams can scale applications with speed and consistency.",
      "The primary advantage is reusability. Instead of rewriting the same button or navigation pattern across multiple pages, teams create a single reliable component. Design updates and bug fixes only need to happen in one place.",
      "As tools like Next.js, React, and Figma continue to evolve, the connection between design files and code components is becoming smoother. The future belongs to teams that reduce friction between design intent and production code.",
    ],
  },
  {
    id: "auto-layout",
    title: "Mastering Auto Layout in Figma",
    date: "December 18, 2024",
    author: "Sarah Chen",
    category: "Design",
    image: "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&q=80&w=1400",
    excerpt: "A practical guide to creating responsive, fluid designs using Figma's most important layout tools.",
    content: [
      "Auto Layout is one of Figma's most powerful features for UI designers. It lets frames grow, shrink, and reflow as content changes, closely mirroring how flexible layouts behave in production.",
      "To master Auto Layout, understand the relationship between fixed, hugging, and filling containers. A parent set to hug wraps around its children, while a child set to fill expands into available space.",
      "Nested Auto Layout frames unlock complex components like menus, tables, and cards that behave predictably across screen sizes. This makes developer handoff cleaner and less fragile.",
    ],
  },
  {
    id: "design-systems",
    title: "Design Systems: Why Your Team Needs One",
    date: "December 15, 2024",
    author: "Marcus Johnson",
    category: "Strategy",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=1400",
    excerpt: "Scaling consistency across products is difficult without a central system. Here is how to start with clarity.",
    content: [
      "A design system is more than a UI kit. It is a shared set of standards for managing design at scale through reusable components, patterns, tokens, and documented decisions.",
      "Without a system, inconsistencies creep in as products and teams grow. You end up with duplicate buttons, conflicting color values, and slower development cycles.",
      "Start small. Audit the current UI, define a core color palette and typography scale, then build the components that appear most often. Momentum matters more than perfection at the beginning.",
    ],
  },
  {
    id: "dark-mode",
    title: "Dark Mode Best Practices for Web Apps",
    date: "December 10, 2024",
    author: "Elena Rodriguez",
    category: "UX/UI",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1400",
    excerpt: "Creating accessible and beautiful dark themes takes more care than simply inverting your colors.",
    content: [
      "Dark mode is now an expected feature in many products, but great dark themes need more than black backgrounds and white text. They require a carefully considered palette.",
      "Avoid pure black for large surfaces. Deep grays are easier on the eyes and allow elevation, borders, and shadows to remain visible.",
      "Brand colors often need adjustment in dark mode. Highly saturated accents can vibrate against dark backgrounds, so softer tones usually work better for long sessions.",
    ],
  },
  {
    id: "design-code-gap",
    title: "Bridging the Gap Between Design and Code",
    date: "December 05, 2024",
    author: "David Kim",
    category: "Collaboration",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=1400",
    excerpt: "Modern tooling and shared systems are bringing designers and developers closer than ever.",
    content: [
      "Design handoff has historically been a friction point. Static screens get passed to developers, specs are interpreted manually, and feedback loops become expensive.",
      "Design tokens help bridge that gap by turning visual decisions into reusable data. Colors, spacing, typography, and radius values can travel from design systems into code with less ambiguity.",
      "The best teams build a shared vocabulary. When designers and developers discuss constraints, behavior, states, and reusable patterns together, product quality rises quickly.",
    ],
  },
];

const categories = ["All", ...Array.from(new Set(blogPosts.map((post) => post.category)))];

function getReadingTime(post: BlogPost) {
  const words = [post.title, post.excerpt, ...post.content].join(" ").split(/\s+/).length;
  return `${Math.max(2, Math.ceil(words / 180))} min read`;
}

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedPostId, setSelectedPostId] = useState(blogPosts[0].id);
  const readerRef = useRef<HTMLElement | null>(null);

  const filteredPosts = useMemo(() => {
    if (activeCategory === "All") return blogPosts;
    return blogPosts.filter((post) => post.category === activeCategory);
  }, [activeCategory]);

  const featuredPost = blogPosts[0];
  const selectedPost = blogPosts.find((post) => post.id === selectedPostId) || featuredPost;

  const openPost = (postId: string) => {
    setSelectedPostId(postId);
    window.requestAnimationFrame(() => {
      readerRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  return (
    <main className="w-full bg-[#fbfcfb] text-[#0b1510]">
      <Navbar />
      <section className="border-b border-black/5 bg-[linear-gradient(180deg,#ffffff_0%,#f6faf5_100%)] px-5 pb-16 pt-24 sm:px-8 lg:pb-20 lg:pt-28">
        <div className="mx-auto w-full max-w-[1320px]">
          <div className="grid items-end gap-10 lg:grid-cols-[0.95fr_0.65fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#dfe8db] bg-white px-4 py-2 text-[12px] font-bold uppercase tracking-[0.08em] text-[#238B45] shadow-sm">
                <Sparkles size={14} />
                Insights & News
              </span>
              <h1 className="mt-8 max-w-[820px] text-[48px] font-semibold leading-[1.04] tracking-normal text-[#08150d] md:text-[70px]">
                Practical ideas for better interfaces.
              </h1>
              <p className="mt-6 max-w-[650px] text-[17px] font-medium leading-[1.75] text-[#526052]">
                Guides, notes, and product thinking for designers and developers building with components, systems, and modern frontend workflows.
              </p>
            </div>

            <div className="rounded-[8px] border border-[#e4ebe1] bg-white p-5 shadow-[0_18px_50px_rgba(23,42,28,0.06)]">
              <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#238B45]">
                Editor&apos;s note
              </p>
              <p className="mt-4 text-[20px] font-semibold leading-[1.35] text-black">
                Start with reusable decisions, not one-off screens.
              </p>
              <p className="mt-4 text-[14px] font-medium leading-[1.7] text-[#647064]">
                A premium component library should feel calm, organized, and immediately useful. This blog now follows that same idea.
              </p>
            </div>
          </div>

          <article className="mt-14 grid overflow-hidden rounded-[8px] border border-[#dde8d8] bg-white shadow-[0_24px_80px_rgba(16,42,24,0.08)] lg:grid-cols-[1.08fr_0.92fr]">
            <div className="relative min-h-[320px] lg:min-h-[460px]">
              <Image
                src={featuredPost.image}
                alt={featuredPost.title}
                fill
                priority
                className="object-cover"
              />
            </div>
            <div className="flex flex-col justify-between p-7 md:p-10">
              <div>
                <div className="flex flex-wrap items-center gap-3 text-[12px] font-bold uppercase tracking-[0.08em] text-[#238B45]">
                  <span>{featuredPost.category}</span>
                  <span className="h-1 w-1 rounded-full bg-[#238B45]" />
                  <span>{getReadingTime(featuredPost)}</span>
                </div>
                <h2 className="mt-5 text-[32px] font-semibold leading-[1.12] text-black md:text-[42px]">
                  {featuredPost.title}
                </h2>
                <p className="mt-5 text-[16px] font-medium leading-[1.75] text-[#596459]">
                  {featuredPost.excerpt}
                </p>
              </div>

              <button
                type="button"
                onClick={() => openPost(featuredPost.id)}
                className="mt-10 inline-flex h-[46px] w-fit items-center gap-4 rounded-full bg-black py-1.5 pl-6 pr-1.5 text-[13px] font-bold text-white"
              >
                Read featured
                <span className="grid h-9 w-9 place-items-center rounded-full bg-[#9FE870] text-black">
                  <ArrowRight size={17} strokeWidth={2.5} />
                </span>
              </button>
            </div>
          </article>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 lg:py-20">
        <div className="mx-auto w-full max-w-[1320px]">
          <div className="flex flex-col justify-between gap-6 border-b border-black/10 pb-8 lg:flex-row lg:items-end">
            <div>
              <p className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#238B45]">
                Latest writing
              </p>
              <h2 className="mt-3 text-[34px] font-semibold leading-tight text-black md:text-[44px]">
                Read by topic
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const active = category === activeCategory;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    className={`h-10 rounded-full px-5 text-[13px] font-bold transition-colors ${
                      active
                        ? "bg-black text-white"
                        : "border border-[#dfe5dc] bg-white text-[#4f5d50] hover:border-black hover:text-black"
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                className="group overflow-hidden rounded-[8px] border border-[#e3e8e0] bg-white shadow-[0_10px_34px_rgba(16,42,24,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(16,42,24,0.1)]"
              >
                <button
                  type="button"
                  onClick={() => openPost(post.id)}
                  className="block w-full text-left"
                >
                  <div className="relative h-[220px] overflow-hidden bg-[#edf3eb]">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.07em] text-black backdrop-blur">
                      {post.category}
                    </span>
                  </div>

                  <div className="p-6">
                    <div className="flex flex-wrap items-center gap-3 text-[12px] font-semibold text-[#697568]">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar size={14} />
                        {post.date}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock size={14} />
                        {getReadingTime(post)}
                      </span>
                    </div>
                    <h3 className="mt-4 min-h-[64px] text-[22px] font-semibold leading-[1.25] text-black">
                      {post.title}
                    </h3>
                    <p className="mt-4 line-clamp-3 text-[14px] font-medium leading-[1.7] text-[#647064]">
                      {post.excerpt}
                    </p>
                    <span className="mt-6 inline-flex items-center gap-2 text-[13px] font-bold text-[#238B45]">
                      Read article
                      <ArrowRight size={15} strokeWidth={2.5} />
                    </span>
                  </div>
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section ref={readerRef} className="scroll-mt-24 px-5 pb-20 sm:px-8 lg:pb-24">
        <div className="mx-auto grid w-full max-w-[1320px] gap-8 lg:grid-cols-[320px_1fr]">
          <aside className="lg:sticky lg:top-[84px] lg:h-fit">
            <div className="rounded-[8px] border border-[#e2e8df] bg-white p-5 shadow-[0_14px_40px_rgba(16,42,24,0.05)]">
              <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#238B45]">
                Reading queue
              </p>
              <div className="mt-5 flex flex-col gap-2">
                {blogPosts.map((post) => {
                  const active = post.id === selectedPost.id;
                  return (
                    <button
                      key={post.id}
                      type="button"
                      onClick={() => openPost(post.id)}
                      className={`rounded-[7px] px-4 py-3 text-left transition-colors ${
                        active ? "bg-[#eaffdf] text-black" : "text-[#657064] hover:bg-[#f5f7f4] hover:text-black"
                      }`}
                    >
                      <span className="block text-[13px] font-semibold leading-[1.45]">
                        {post.title}
                      </span>
                      <span className="mt-1 block text-[11px] font-medium opacity-70">
                        {post.category} - {getReadingTime(post)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          <article className="rounded-[8px] border border-[#e2e8df] bg-white p-6 shadow-[0_18px_60px_rgba(16,42,24,0.05)] md:p-10 lg:p-12">
            <div className="relative mb-9 h-[280px] overflow-hidden rounded-[7px] bg-[#edf3eb] md:h-[430px]">
              <Image
                src={selectedPost.image}
                alt={selectedPost.title}
                fill
                className="object-cover"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 text-[12px] font-bold uppercase tracking-[0.08em] text-[#238B45]">
              <span>{selectedPost.category}</span>
              <span className="h-1 w-1 rounded-full bg-[#238B45]" />
              <span>{selectedPost.author}</span>
              <span className="h-1 w-1 rounded-full bg-[#238B45]" />
              <span>{selectedPost.date}</span>
            </div>

            <h2 className="mt-5 max-w-[840px] text-[34px] font-semibold leading-[1.12] text-black md:text-[48px]">
              {selectedPost.title}
            </h2>
            <p className="mt-6 border-l-4 border-[#9FE870] pl-5 text-[19px] font-medium leading-[1.75] text-[#263126]">
              {selectedPost.excerpt}
            </p>

            <div className="mt-9 max-w-[840px] space-y-6">
              {selectedPost.content.map((paragraph) => (
                <p key={paragraph} className="text-[17px] font-medium leading-[1.9] text-[#4f5b4f]">
                  {paragraph}
                </p>
              ))}
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
