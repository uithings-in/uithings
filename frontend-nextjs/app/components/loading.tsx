import Image from "next/image";
import Navbar from "../../components/landing/Navbar";
import { Layers, Search, Scaling, Frame, Crown } from "lucide-react";

function SkeletonCard() {
  return (
    <article className="w-full rounded-[12px] border border-[rgba(229,231,235,0.8)] overflow-hidden shadow-sm flex flex-col p-2.5 animate-pulse bg-white/10">
      <div className="w-full aspect-[16/9] bg-white/20 rounded-[8px] shrink-0" />
      <div className="px-2 pt-2 pb-1.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-3.5 w-24 bg-white/25 rounded-full" />
          <div className="h-3 w-8 bg-white/15 rounded-md" />
        </div>
        <div className="flex gap-2">
          <div className="h-4 w-4 bg-white/20 rounded-full" />
          <div className="h-4 w-4 bg-white/20 rounded-full" />
          <div className="h-4 w-6 bg-white/20 rounded-full" />
        </div>
      </div>
      <div className="px-1 pb-1 shrink-0">
        <div className="w-full h-8 bg-white/15 rounded-full" />
      </div>
    </article>
  );
}

export default function ComponentsLoading() {
  return (
    <>
      <Navbar />
      <div className="relative flex h-dvh pt-[60px] overflow-hidden bg-[#0d1830] font-manrope text-white">
        <div
          className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
          style={{
            transform: "translate3d(0, 0, 0)",
            backfaceVisibility: "hidden",
            contain: "strict",
          }}
        >
          <Image
            src="/components-page/figma-bg.svg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="block object-cover w-full h-full"
          />
        </div>

        {/* Left Sidebar Skeleton */}
        <aside className="relative z-10 hidden lg:flex flex-col w-[260px] shrink-0 bg-transparent pt-4 font-manrope h-full self-start">
          <div className="mx-4 mb-6 shrink-0 rounded-2xl border border-white/30 bg-white/10 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
            <div className="flex flex-col items-center justify-center py-3 gap-3 animate-pulse">
              <div className="h-6 w-6 rounded-full bg-white/20" />
              <div className="h-3 w-20 rounded bg-white/20" />
            </div>
          </div>

          <div className="px-6 flex items-center gap-2 mb-3 shrink-0">
            <span className="text-[#d66a04]">
              <Layers size={20} strokeWidth={2.25} />
            </span>
            <span className="font-bold text-white text-[15px]">Components</span>
          </div>

          <div className="flex-1 overflow-hidden px-3 space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-9 w-full rounded-lg bg-white/5 animate-pulse" />
            ))}
          </div>
        </aside>

        {/* Main Area */}
        <div className="relative z-10 flex-1 flex flex-col min-w-0 bg-transparent h-full overflow-hidden pl-8 pr-0">
          <div className="shrink-0 bg-transparent">
            {/* Title */}
            <div className="pt-4 pb-2 bg-transparent pr-8">
              <h1 className="font-outfit font-bold text-[24px] text-white leading-[30px]">
                Browse Figma Components, Wireframe &amp; UI Design
              </h1>
              <p className="font-manrope font-normal text-[14px] text-[#cccccc] mt-1">
                Components
              </p>
            </div>

            {/* Filter Toolbar */}
            <div className="py-2.5 bg-transparent border-b border-transparent -ml-8 pl-8 pr-8">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex items-center w-full sm:w-[260px] md:w-[280px] lg:w-[310px] h-[38px] rounded-lg border border-white/20 bg-transparent px-3 text-white">
                  <Search size={15} className="text-white/50 shrink-0 mr-2.5" />
                  <span className="text-[13px] text-white/40">Search components...</span>
                </div>

                <div className="flex items-center h-[38px] rounded-lg border border-white/20 bg-transparent p-1 gap-1 shrink-0">
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium text-white/70">
                    <Frame size={14} /> Wireframe
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-semibold bg-[#5c6679] text-white">
                    <Scaling size={14} /> UI Design
                  </span>
                </div>

                <div className="flex items-center h-[38px] rounded-lg border border-white/20 bg-transparent p-1 gap-1 shrink-0">
                  <span className="px-3.5 py-1.5 rounded-md text-[13px] font-semibold bg-[#5c6679] text-white">
                    All
                  </span>
                  <span className="px-3.5 py-1.5 rounded-md text-[13px] font-medium text-white/70">
                    Web
                  </span>
                  <span className="px-3.5 py-1.5 rounded-md text-[13px] font-medium text-white/70">
                    App
                  </span>
                </div>

                <div className="flex items-center h-[38px] rounded-lg border border-white/20 bg-transparent p-1 gap-1 shrink-0">
                  <span className="px-3.5 py-1.5 rounded-md text-[13px] font-medium text-white/70">
                    Free
                  </span>
                  <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-[13px] font-medium text-white/70">
                    <Crown size={14} color="#FF7A1B" strokeWidth={2} />
                    Pro
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 25 Skeletons Grid */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden pt-2 pb-8 pr-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 min-[1700px]:grid-cols-5 min-[2300px]:grid-cols-6 min-[2700px]:grid-cols-7 min-[3200px]:grid-cols-8 gap-4">
              {Array.from({ length: 25 }).map((_, i) => (
                <SkeletonCard key={`load-sk-${i}`} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
