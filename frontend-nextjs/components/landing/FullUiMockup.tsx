import React from "react";
import Image from "next/image";

export default function FullUiMockup() {
  return (
    <div className="relative flex size-full items-center justify-center overflow-hidden">
      <Image
        src="/landing/full-ui.svg"
        alt="Upgrade to Full UI"
        width={505}
        height={274}
        className="w-full max-w-[580px] h-auto object-contain drop-shadow-2xl"
        priority
      />
    </div>
  );
}
