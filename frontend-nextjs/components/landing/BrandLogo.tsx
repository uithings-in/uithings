import Link from "next/link";

export default function BrandLogo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`inline-flex items-center gap-[6px] ${className}`}>
      <span className="flex size-[38px] items-center justify-center overflow-hidden rounded-[6px] border border-white">
        <span
          className="text-[32px] leading-none tracking-[-1.92px] text-white"
          style={{ fontFamily: "'Josefin Sans', sans-serif" }}
        >
          ui
        </span>
      </span>
      <span
        className="text-[36px] leading-none tracking-[-1.92px] text-white"
        style={{ fontFamily: "'Josefin Sans', sans-serif" }}
      >
        things
      </span>
    </Link>
  );
}
