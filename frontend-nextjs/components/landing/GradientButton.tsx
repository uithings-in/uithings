import React from "react";

interface GradientButtonProps {
  href?: string;
  children: React.ReactNode;
  className?: string;
  iconSrc?: string;
  onClick?: () => void;
  type?: "button" | "submit";
}

const gradient =
  "linear-gradient(180deg, #FFFFFF 0%, #6767DC 22%, #4343D5 90%)";

export default function GradientButton({
  href,
  children,
  className = "",
  iconSrc,
  onClick,
  type = "button",
}: GradientButtonProps) {
  const classes = `inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#F7F7FD] px-7 py-2.5 text-base font-medium text-[#F7F7FD] transition-all duration-200 hover:brightness-110 active:scale-[0.98] ${className}`;

  const content = (
    <>
      <span>{children}</span>
      {iconSrc && (
        <span className="relative size-6 overflow-hidden">
          <img src={iconSrc} alt="" className="absolute inset-0 size-full max-w-none" />
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <a href={href} className={classes} style={{ backgroundImage: gradient }}>
        {content}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes} style={{ backgroundImage: gradient }}>
      {content}
    </button>
  );
}
