import React from "react";

interface TestimonialItem {
  quote: string;
  author: string;
  role: string;
  rating: string;
}

const row1Testimonials: TestimonialItem[] = [
  {
    quote:
      "“I’m not a ‘tools person’, but Ryzo made it easy. I was up and running in 5 minutes. No tutorials. Just straight to doing.”",
    author: "Laura T",
    role: "Project Manager",
    rating: "5.0",
  },
  {
    quote:
      "“Using Zyro feels like working inside a sketchbook. Clean, calm, responsive. It's a workspace that breathes with you.”",
    author: "Kevin D",
    role: "Developer",
    rating: "4.1",
  },
  {
    quote:
      "“What I like most about Ryzo is that it doesn't try to be everything. Honestly, we’ve never shipped this consistently before.”",
    author: "Chloe R",
    role: "Developer",
    rating: "4.1",
  },
];

const row2Testimonials: TestimonialItem[] = [
  {
    quote:
      "“The real-time visibility into task states is game-changing. Everyone knows what’s happening without meetings.”",
    author: "Alex M",
    role: "Content Lead",
    rating: "4.1",
  },
  {
    quote:
      "“I’m not a ‘tools person’, but Ryzo made it easy. I was up and running in 5 minutes. No tutorials. Just straight to doing.”",
    author: "Chloe R",
    role: "Head of Ops",
    rating: "4.5",
  },
  {
    quote:
      "“Ryzo makes our team feel like we’re working in the same room — even when we’re not. It’s simple, visual.”",
    author: "Ethan C",
    role: "Product Designer",
    rating: "4.1",
  },
];

// Duplicate items for infinite seamless scroll
const row1Repeated = [
  ...row1Testimonials,
  ...row1Testimonials,
  ...row1Testimonials,
  ...row1Testimonials,
];
const row2Repeated = [
  ...row2Testimonials,
  ...row2Testimonials,
  ...row2Testimonials,
  ...row2Testimonials,
];

function TestimonialCard({ quote, author, role, rating }: TestimonialItem) {
  return (
    <div className="relative flex min-h-[215px] sm:min-h-[225px] w-[350px] sm:w-[380px] shrink-0 flex-col justify-between rounded-[16px] border border-[rgba(247,247,253,0.1)] bg-[rgba(248,246,253,0.03)] p-5 sm:p-6 backdrop-blur-[10px] transition-all duration-300 hover:border-[rgba(209,216,255,0.25)] hover:bg-[rgba(248,246,253,0.05)]">
      <p
        className="text-[14px] font-normal leading-[22px] text-[#F7F7FD] sm:text-[15px] sm:leading-[23px]"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        {quote}
      </p>

      <div className="flex items-center justify-between pt-3 sm:pt-4">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-[#C4C4C4] shrink-0" />
          <div className="flex flex-col">
            <span
              className="text-[14px] font-medium leading-tight text-[#F7F7FD]"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {author}
            </span>
            <span
              className="mt-0.5 text-[12px] leading-tight text-[#9389A8]"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {role}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className="text-[13px] font-medium text-[#9389A8]"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            {rating}
          </span>
          <span className="flex size-3.5 items-center justify-center">
            <img
              src="/landing/star-solid.svg"
              alt=""
              className="size-3.5 shrink-0"
            />
          </span>
        </div>
      </div>
    </div>
  );
}

export default function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      className="relative w-full overflow-hidden bg-[#080605] py-[100px] sm:py-[130px]"
    >
      <style>{`
        @keyframes scrollRight {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0%);
          }
        }
        @keyframes scrollLeft {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll-right {
          animation: scrollRight 28s linear infinite;
        }
        .animate-scroll-left {
          animation: scrollLeft 28s linear infinite;
        }
        .animate-scroll-right:hover,
        .animate-scroll-left:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Background Atmosphere & Radial Glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Main Blue/Purple Radial Atmosphere behind and below the cards */}
        <div
          className="absolute -bottom-[22%] left-1/2 h-[800px] w-[1200px] -translate-x-1/2 rounded-[100%] opacity-90 blur-[70px]"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(67,67,213,0.52) 0%, rgba(67,67,213,0.2) 42%, rgba(209,216,255,0.06) 58%, rgba(8,6,5,0) 75%)",
          }}
        />

        <div
          className="absolute -bottom-[12%] left-1/2 h-[550px] w-[850px] -translate-x-1/2 rounded-[100%] opacity-85 blur-[45px]"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(209,216,255,0.18) 0%, rgba(67,67,213,0.32) 35%, rgba(8,6,5,0) 70%)",
          }}
        />

        <div
          className="absolute bottom-0 left-1/2 h-[380px] w-[1450px] -translate-x-1/2 rounded-t-[100%] opacity-45 blur-[55px]"
          style={{
            background:
              "radial-gradient(ellipse at 50% 100%, rgba(67,67,213,0.45) 0%, rgba(8,6,5,0) 70%)",
          }}
        />

        {/* Scattered Subtle Stars / Sparkles in the lower glow region */}
        <img
          src="/landing/stars-3.svg"
          alt=""
          className="absolute bottom-[8%] left-[6%] h-[140px] w-[140px] opacity-60"
        />
        <img
          src="/landing/stars-1.svg"
          alt=""
          className="absolute bottom-[16%] left-[22%] h-[130px] w-[140px] opacity-75"
        />
        <img
          src="/landing/stars-4.svg"
          alt=""
          className="absolute bottom-[10%] left-[45%] h-[140px] w-[150px] opacity-80"
        />
        <img
          src="/landing/stars-2.svg"
          alt=""
          className="absolute bottom-[18%] right-[24%] h-[130px] w-[140px] opacity-75"
        />
        <img
          src="/landing/stars-5.svg"
          alt=""
          className="absolute bottom-[6%] right-[8%] h-[140px] w-[160px] opacity-65"
        />
      </div>

      {/* Main Container */}
      <div className="relative z-10 mx-auto flex max-w-[1240px] flex-col items-center px-6 sm:px-8">
        {/* Header Section */}
        <div className="flex flex-col items-center px-4 text-center">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(247,247,253,0.1)] bg-[rgba(255,255,255,0.06)] px-3.5 py-1.5 backdrop-blur-[6px]">
            <span className="relative size-4 overflow-hidden">
              <img
                src="/landing/sparkle.svg"
                alt=""
                className="absolute inset-0 size-full max-w-none"
              />
            </span>
            <span
              className="text-[13px] font-medium leading-none text-[#DFD5F6]"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Testimonial
            </span>
          </div>

          {/* Heading */}
          <h2
            className="mt-8 text-center text-4xl font-medium tracking-[-1.5px] text-[#F7F7FD] sm:text-5xl sm:leading-[1.15] md:text-[64px] md:tracking-[-2.56px]"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Trusted by teams
            <br />
            who move fast
          </h2>

          {/* Subtitle */}
          <p
            className="mt-6 max-w-[560px] text-center text-[15px] leading-[25px] text-[#9389A8] sm:text-base sm:leading-[26px]"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            From solo designers to growing product teams people
            <br className="hidden sm:inline" /> use to stay clear, focused, and
            in sync.
          </p>
        </div>

        {/* Scrolling Rows Container with soft gradient edge mask */}
        <div
          className="relative mt-16 flex w-full flex-col gap-6 overflow-hidden sm:mt-20"
          style={{
            maskImage:
              "linear-gradient(to right, transparent 0%, rgba(0, 0, 0, 1) 12%, rgba(0, 0, 0, 1) 88%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, rgba(0, 0, 0, 1) 12%, rgba(0, 0, 0, 1) 88%, transparent 100%)",
          }}
        >
          {/* Row 1 (Top / Red): Scrolls to the RIGHT */}
          <div className="flex w-full overflow-hidden">
            <div className="flex w-max gap-6 animate-scroll-right">
              {row1Repeated.map((item, idx) => (
                <TestimonialCard key={`r1-${idx}`} {...item} />
              ))}
            </div>
          </div>

          {/* Row 2 (Bottom / Green): Scrolls to the LEFT */}
          <div className="flex w-full overflow-hidden">
            <div className="flex w-max gap-6 animate-scroll-left">
              {row2Repeated.map((item, idx) => (
                <TestimonialCard key={`r2-${idx}`} {...item} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

