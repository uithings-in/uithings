import React from "react";
import Image from "next/image";

export default function TypographyMockup() {
  return (
    <div className="relative flex size-full items-center justify-center overflow-hidden">
      <Image
        src="/landing/update-branding.webp"
        alt="Update Branding"
        width={1160}
        height={743}
        sizes="(max-width: 768px) 100vw, 560px"
        className="w-full max-w-[560px] h-auto object-contain drop-shadow-2xl"
      />
    </div>
  );
}
