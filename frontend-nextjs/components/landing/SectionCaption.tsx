export default function SectionCaption({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(247,247,253,0.1)] bg-white/10 px-3 py-2.5 backdrop-blur-[6px]">
      <span className="relative size-4 overflow-hidden">
        <img src="/landing/sparkle.svg" alt="" className="absolute inset-0 size-full max-w-none" />
      </span>
      <span className="text-sm leading-5 text-[#DFD5F6]" style={{ fontFamily: "Inter, sans-serif" }}>
        {children}
      </span>
    </div>
  );
}
