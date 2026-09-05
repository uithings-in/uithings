import React from "react";
import PillBadge from "./PillBadge";
import StarField from "./StarField";
import { Star } from "lucide-react";

export default function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        "“ui things completely transformed our sprint velocity. The components look bespoke out of the box and seamlessly integrate into our Next.js frontend with zero styling conflicts.”",
      author: "Marcus Chen",
      role: "Head of Product Design at ScaleStack",
      rating: "5.0",
      avatarBg: "bg-gradient-to-tr from-indigo-500 to-purple-600",
      bgClass: "bg-[#0d0e1d]/90 border-[#1f213d]",
    },
    {
      quote:
        "“The typography hierarchy and color token consistency are second to none. We replaced three disparate component libraries with this single system.”",
      author: "Elena Rostova",
      role: "Senior Design Systems Architect",
      rating: "4.9",
      avatarBg: "bg-gradient-to-tr from-purple-500 to-pink-500",
      bgClass: "bg-gradient-to-b from-[#1c1440]/90 to-[#0e0d22]/90 border-[#3a2d75]/70 shadow-[0_0_30px_rgba(108,92,231,0.15)]",
    },
    {
      quote:
        "“Copying from Figma to code used to require hours of manual auto-layout tweaking. With ui things, it's instant. Our engineers and designers are finally speaking the exact same language.”",
      author: "David Kim",
      role: "VP of Engineering at Flowbase",
      rating: "5.0",
      avatarBg: "bg-gradient-to-tr from-blue-500 to-cyan-500",
      bgClass: "bg-[#0c0d1c]/90 border-[#1e203c]",
    },
    {
      quote:
        "“Every section variant feels crafted by a master designer. The dark-mode palette alone gave our landing pages an instant, ultra-premium polish.”",
      author: "Sarah Jenkins",
      role: "Founder & Creative Director",
      rating: "4.8",
      avatarBg: "bg-gradient-to-tr from-amber-500 to-red-500",
      bgClass: "bg-[#0c0d1b]/90 border-[#1d1f39]",
    },
    {
      quote:
        "“The fluid responsiveness across tablet and mobile viewports saved us weeks of regression testing. Best investment our design team made this quarter.”",
      author: "Alex Morgan",
      role: "Staff Frontend Lead",
      rating: "5.0",
      avatarBg: "bg-gradient-to-tr from-emerald-500 to-teal-500",
      bgClass: "bg-gradient-to-b from-[#18133b]/90 to-[#0b0c1e]/90 border-[#322769]/60",
    },
    {
      quote:
        "“Incredible attention to micro-interactions, clean token variables, and modern aesthetic. It feels like the future of web design tooling.”",
      author: "Liam Vance",
      role: "UI/UX Consultant",
      rating: "4.7",
      avatarBg: "bg-gradient-to-tr from-rose-500 to-indigo-500",
      bgClass: "bg-[#0c0d1a]/90 border-[#1d1f38]",
    },
  ];

  return (
    <section id="testimonials" className="relative py-24 md:py-32 overflow-hidden">
      {/* Deep indigo background glow fading to black */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[600px] pointer-events-none -z-10 opacity-35"
        style={{
          background:
            "radial-gradient(ellipse 65% 50% at 50% 50%, #3B2FE0 0%, #2A2470 35%, transparent 75%)",
        }}
      />

      {/* Cosmic Stars */}
      <StarField showShootingStars={false} />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <PillBadge variant="default" className="mb-4">
            Testimonial
          </PillBadge>
          <h2 className="font-heading text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
            Trusted by teams <br className="hidden sm:inline" />
            who move fast
          </h2>
          <p className="font-sans text-[#A6A6C1] text-base mt-4 font-normal">
            Discover how modern teams streamline development and elevate design standards.
          </p>
        </div>

        {/* Staggered Masonry-Style Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((item, index) => (
            <div
              key={index}
              className={`rounded-2xl p-7 sm:p-8 border backdrop-blur-xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:border-[#7C5CFF]/60 ${item.bgClass}`}
            >
              {/* Star Rating Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-1 text-amber-400">
                  <span className="font-sans font-bold text-xs text-white mr-1.5">{item.rating}</span>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={13} fill="currentColor" />
                  ))}
                </div>
              </div>

              {/* Quote */}
              <p className="font-sans text-xs sm:text-sm text-white/95 leading-relaxed mb-6 font-normal">
                {item.quote}
              </p>

              {/* Author Info */}
              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <div
                  className={`w-9 h-9 rounded-full ${item.avatarBg} flex items-center justify-center text-xs font-bold text-white shadow-sm flex-shrink-0`}
                >
                  {item.author.charAt(0)}
                </div>
                <div>
                  <h4 className="font-sans text-xs sm:text-sm font-semibold text-white">
                    {item.author}
                  </h4>
                  <p className="font-sans text-[11px] text-[#A6A6C1]">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
