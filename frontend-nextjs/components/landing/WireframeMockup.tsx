import React from "react";
import Image from "next/image";

export default function WireframeMockup() {
  return (
    <div className="relative flex size-full items-center justify-center overflow-hidden">
      <Image
        src="/landing/wire-frame.svg"
        alt="Select Wire-frame"
        width={518}
        height={321}
        className="w-full max-w-[580px] h-auto object-contain drop-shadow-2xl"
        priority
      />
    </div>
  );
}
