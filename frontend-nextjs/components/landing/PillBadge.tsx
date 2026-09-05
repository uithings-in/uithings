import React from "react";

interface PillBadgeProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  variant?: "default" | "highlight" | "dark";
  className?: string;
}

export default function PillBadge({
  children,
  icon,
  variant = "default",
  className = "",
}: PillBadgeProps) {
  const variantStyles = {
    default: "bg-white/[0.07] border-white/15 text-white/90 hover:border-white/30 shadow-[0_2px_10px_rgba(0,0,0,0.3)]",
    highlight: "bg-[#4B3DF5]/20 border-[#7C5CFF]/40 text-[#c2baff] shadow-[0_0_15px_rgba(124,92,255,0.3)]",
    dark: "bg-[#0c0d1b] border-[#22243d] text-[#A6A6C1]",
  };

  return (
    <div
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold tracking-wide backdrop-blur-md transition-all ${variantStyles[variant]} ${className}`}
    >
      {icon && <span className="text-sm opacity-80">{icon}</span>}
      <span className="font-sans">{children}</span>
    </div>
  );
}
