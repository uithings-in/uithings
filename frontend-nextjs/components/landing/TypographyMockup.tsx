import React from "react";
import Image from "next/image";

export default function TypographyMockup() {
  return (
    <div className="relative flex size-full items-center justify-center overflow-hidden">
      <Image
        src="/landing/update-branding.svg"
        alt="Update Branding"
        width={467}
        height={299}
        className="w-full max-w-[560px] h-auto object-contain drop-shadow-2xl"
        priority
      />
    </div>
  );
}
