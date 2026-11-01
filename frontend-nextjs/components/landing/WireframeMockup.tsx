import React from "react";
import Image from "next/image";

export default function WireframeMockup() {
  return (
    <div className="relative flex size-full items-center justify-center overflow-hidden">
      <Image
        src="/landing/wire-frame.webp"
        alt="Select Wire-frame"
        width={1160}
        height={719}
        sizes="(max-width: 768px) 100vw, 580px"
        className="w-full max-w-[580px] h-auto object-contain drop-shadow-2xl"
      />
    </div>
  );
}
