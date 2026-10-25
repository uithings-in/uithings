import React from "react";

interface TestimonialItem {
  quote: string;
  author: string;
  role: string;
  rating: string;
  image?: string;
}

const testimonials: TestimonialItem[] = [
  {
    quote:
      "“I’m not a fan of building everything from scratch, and uiThings makes the process so much easier. I can find components, customize them, and get straight to designing.”",
    author: "Alex Morgan",
    role: "UI/UX Designer",
    rating: "5.0",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&h=160&fit=crop&crop=faces",
  },
  {
    quote:
      "“The components are clean, modern, and easy to adapt. uiThings has become a useful resource whenever I start a new Figma project.”",
    author: "Sophia Bennett",
    role: "Product Designer",
    rating: "5.0",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&h=160&fit=crop&crop=faces",
  },
  {
    quote:
      "“As a freelancer, saving time matters. Having ready-made UI components helps me spend less time on repetitive work and more time on creative decisions.”",
    author: "Daniel Brooks",
    role: "Freelance Designer",
    rating: "5.0",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=160&h=160&fit=crop&crop=faces",
  },
  {
    quote:
      "“I love how easy it is to find inspiration for website layouts. The components give me a solid foundation that I can make my own in Figma.”",
    author: "Emily Carter",
    role: "Web Designer",
    rating: "5.0",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&h=160&fit=crop&crop=faces",
  },
  {
    quote:
      "“uiThings makes my workflow feel much more efficient. Instead of recreating common UI patterns, I can start with a component and customize it for my project.”",
    author: "Ryan Mitchell",
    role: "Digital Product Designer",
    rating: "5.0",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&h=160&fit=crop&crop=faces",
  },
  {
    quote:
      "“Finding the right starting point for a new design is easier with uiThings. I can explore different components and choose what works best for my interface.”",
    author: "Olivia Parker",
    role: "Visual Designer",
    rating: "5.0",
    image:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=160&h=160&fit=crop&crop=faces",
  },
  {
    quote:
      "“I don't want every new project to feel like starting from zero. uiThings gives me reusable building blocks that help me move from idea to prototype faster.”",
    author: "Ethan Wilson",
    role: "UX/UI Designer",
    rating: "5.0",
    image:
      "https://images.unsplash.com/photo-1504593811423-6dd665756598?w=160&h=160&fit=crop&crop=faces",
  },
  {
    quote:
      "“The flexibility is what I appreciate most. I can use a component as it is or adjust its colors, spacing, and layout to match my design system.”",
    author: "Isabella Reed",
    role: "Interface Designer",
    rating: "5.0",
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=160&h=160&fit=crop&crop=faces",
  },
  {
    quote:
      "“As a design student, I find ready-made components useful for understanding how professional interfaces are structured. uiThings is a handy learning resource.”",
    author: "Noah Foster",
    role: "Design Student",
    rating: "5.0",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&h=160&fit=crop&crop=faces",
  },
  {
    quote:
      "“I like having a collection of UI resources to explore when working on a new concept. It makes experimenting with different design directions much easier.”",
    author: "Mia Thompson",
    role: "Product Designer",
    rating: "5.0",
    image:
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=160&h=160&fit=crop&crop=faces",
  },
  {
    quote:
      "“Whenever I need a starting point for a landing page, uiThings helps me get moving. I can focus on the content and experience instead of repetitive setup.”",
    author: "Lucas Bennett",
    role: "Freelance UI Designer",
    rating: "5.0",
    image:
      "https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=160&h=160&fit=crop&crop=faces",
  },
  {
    quote:
      "“Good components should be easy to adapt to different projects. uiThings gives me the flexibility to create interfaces that feel consistent without looking generic.”",
    author: "Ava Collins",
    role: "Interaction Designer",
    rating: "5.0",
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=160&h=160&fit=crop&crop=faces",
  },
  {
    quote:
      "“Building high-fidelity prototypes is much smoother when I have reusable elements ready to customize. uiThings gives me a helpful head start.”",
    author: "James Cooper",
    role: "UX Designer",
    rating: "5.0",
    image:
      "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=160&h=160&fit=crop&crop=faces",
  },
  {
    quote:
      "“From website sections to smaller interface elements, uiThings gives me ideas and building blocks I can incorporate into my Figma workflow.”",
    author: "Grace Phillips",
    role: "Web UI Designer",
    rating: "5.0",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&h=160&fit=crop&crop=faces",
  },
  {
    quote:
      "“I appreciate having more time to focus on the details that make a design unique. Starting with reusable components makes the whole process feel more organized.”",
    author: "Oliver Hayes",
    role: "Design Consultant",
    rating: "5.0",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=160&h=160&fit=crop&crop=faces",
  },
  {
    quote:
      "“uiThings is a practical addition to my design toolkit. I can discover useful components, bring them into my Figma projects, and adapt them to my needs.”",
    author: "Chloe Adams",
    role: "UI/UX Designer",
    rating: "5.0",
    image:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=160&h=160&fit=crop&crop=faces",
  },
];

const row1Testimonials = testimonials.slice(0, 8);
const row2Testimonials = testimonials.slice(8, 16);

// Duplicate items for infinite seamless scroll
const row1Repeated = [
  ...row1Testimonials,
  ...row1Testimonials,
];
const row2Repeated = [
  ...row2Testimonials,
  ...row2Testimonials,
];

function TestimonialCard({ quote, author, role, rating, image }: TestimonialItem) {
  return (
    <div className="relative flex min-h-[215px] sm:min-h-[225px] w-[350px] sm:w-[380px] shrink-0 flex-col justify-between rounded-[16px] border border-white/10 bg-[#0e0c18] p-5 sm:p-6 transition-all duration-200 hover:border-white/20 hover:bg-[#141224] gpu-accel">
      <p
        className="text-[14px] font-normal leading-[22px] text-[#F7F7FD] sm:text-[15px] sm:leading-[23px] font-inter"
      >
        {quote}
      </p>

      <div className="flex items-center justify-between pt-3 sm:pt-4">
        <div className="flex items-center gap-3">
          {image ? (
            <img
              src={image}
              alt={author}
              loading="lazy"
              decoding="async"
              className="size-10 rounded-full object-cover shrink-0 border border-white/10"
            />
          ) : (
            <div className="size-10 rounded-full bg-gradient-to-br from-[#4343D5] to-[#7C5CFF] shrink-0 flex items-center justify-center font-bold text-xs text-white">
              {author
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
          )}
          <div className="flex flex-col">
            <span
              className="text-[14px] font-medium leading-tight text-[#F7F7FD] font-inter"
            >
              {author}
            </span>
            <span
              className="mt-0.5 text-[12px] leading-tight text-[#9389A8] font-inter"
            >
              {role}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className="text-[13px] font-medium text-[#9389A8] font-inter"
          >
            {rating}
          </span>
          <span className="flex size-3.5 items-center justify-center">
            <img
              src="/landing/star-solid.svg"
              alt=""
              loading="lazy"
              decoding="async"
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
      className="relative w-full overflow-hidden bg-[#080605] pt-10 pb-20 sm:pt-14 sm:pb-28"
    >
      <style>{`
        @keyframes scrollRight {
          0% {
            transform: translate3d(-50%, 0, 0);
          }
          100% {
            transform: translate3d(0%, 0, 0);
          }
        }
        @keyframes scrollLeft {
          0% {
            transform: translate3d(0%, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }
        .animate-scroll-right {
          animation: scrollRight 35s linear infinite;
          will-change: transform;
          transform: translate3d(0, 0, 0);
        }
        .animate-scroll-left {
          animation: scrollLeft 35s linear infinite;
          will-change: transform;
          transform: translate3d(0, 0, 0);
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

