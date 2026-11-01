import React from "react";
import Image from "next/image";

export default function ResponsiveMockup() {
  return (
    <div className="relative flex size-full items-center justify-center overflow-hidden">
      <Image
        src="/landing/responsive.webp"
        alt="Responsive by Default"
        width={1160}
        height={657}
        sizes="(max-width: 768px) 100vw, 580px"
        className="w-full max-w-[580px] h-auto object-contain drop-shadow-2xl"
      />
    </div>
  );
}

