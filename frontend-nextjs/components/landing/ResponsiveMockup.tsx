import React from "react";
import Image from "next/image";

export default function ResponsiveMockup() {
  return (
    <div className="relative flex size-full items-center justify-center overflow-hidden">
      <Image
        src="/landing/responsive.svg"
        alt="Responsive by Default"
        width={482}
        height={273}
        className="w-full max-w-[580px] h-auto object-contain drop-shadow-2xl"
        priority
      />
    </div>
  );
}

