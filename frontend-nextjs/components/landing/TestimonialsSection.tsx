import React from "react";
import CosmicAtmosphere from "./CosmicAtmosphere";
import SectionCaption from "./SectionCaption";

const testimonials = [
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
      "“What I like most about Ryzo is that it doesn't try to be everything. It just works — fast setup, intuitive UI, and the right balance between structure and freedom. Honestly, we’ve never shipped this consistently before.”",
    author: "Chloe R",
    role: "Developer",
    rating: "4.1",
  },
];

function Card({
  quote,
  author,
  role,
  rating,
}: (typeof testimonials)[number]) {
  return (
    <div className="relative h-[299px] w-[526px] max-w-full shrink-0 overflow-hidden rounded-lg border border-[rgba(247,247,253,0.1)] bg-[rgba(248,246,253,0.03)] p-8 backdrop-blur-[6px]">
      <p
        className="text-xl leading-8 text-[#F7F7FD]"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        {quote}
      </p>
      <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-full bg-[#C4C4C4]" />
          <div className="flex flex-col gap-3">
            <p
              className="text-base font-medium leading-6 text-[#F7F7FD]"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {author}
            </p>
            <p
              className="text-sm leading-5 text-[#9389A8]"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {role}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-sm leading-6 text-[#7B738C]"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            {rating}
          </span>
          <span className="relative size-4 overflow-hidden">
            <img
              src="/landing/star-solid.svg"
              alt=""
              className="absolute inset-0 size-full max-w-none"
            />
          </span>
        </div>
      </div>
    </div>
  );
}

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="relative overflow-hidden py-[120px]">
      <CosmicAtmosphere showBeams={false} />

      <div className="relative z-10 mx-auto flex max-w-[1440px] flex-col items-center gap-[100px]">
        <div className="flex flex-col items-center gap-10 px-4 text-center">
          <SectionCaption>Testimonial</SectionCaption>
          <div className="flex max-w-[643px] flex-col items-center gap-9">
            <h2
              className="max-w-[581px] text-5xl font-medium leading-[59px] tracking-[-2.56px] text-[#F7F7FD] sm:text-[64px]"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Trusted by teams who move fast
            </h2>
            <p
              className="text-base leading-6 text-[#9389A8]"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              From solo designers to growing product teams people use to stay
              clear, focused, and in sync.
            </p>
          </div>
        </div>

        <div className="relative w-full overflow-hidden">
          <div className="mb-6 flex justify-center gap-6 px-4">
            {testimonials.slice(3).map((item) => (
              <Card key={`${item.author}-${item.role}`} {...item} />
            ))}
          </div>
          <div className="flex justify-center gap-6 px-4">
            {testimonials.slice(0, 3).map((item) => (
              <Card key={`${item.author}-${item.quote.slice(0, 24)}`} {...item} />
            ))}
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-[28%] bg-gradient-to-r from-[#070416] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-[28%] bg-gradient-to-l from-[#070416] to-transparent" />
        </div>
      </div>
    </section>
  );
}
