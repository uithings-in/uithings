import Link from "next/link";

export default function BrandLogo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`inline-flex items-center ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/logo.svg"
        alt="ui things"
        className="h-8 w-auto object-contain"
      />
    </Link>
  );
}

