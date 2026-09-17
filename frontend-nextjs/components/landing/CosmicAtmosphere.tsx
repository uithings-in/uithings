import React from "react";

interface CosmicAtmosphereProps {
  className?: string;
  showBeams?: boolean;
}

export default function CosmicAtmosphere({
  className = "",
  showBeams = true,
}: CosmicAtmosphereProps) {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      <div className="absolute left-1/2 top-[55%] h-[385px] w-[710px] -translate-x-1/2 scale-y-[-1] opacity-90">
        <div className="absolute inset-[-100%_-56%]">
          <img
            src="/landing/light-flare.svg"
            alt=""
            className="block size-full max-w-none"
          />
        </div>
      </div>

      <img
        src="/landing/stars-3.svg"
        alt=""
        className="absolute left-[2%] top-[62%] h-[188px] w-[183px] opacity-70"
      />
      <img
        src="/landing/stars-1.svg"
        alt=""
        className="absolute left-[28%] top-[58%] h-[157px] w-[174px] opacity-70"
      />
      <img
        src="/landing/stars-4.svg"
        alt=""
        className="absolute left-[46%] top-[64%] h-[162px] w-[180px] opacity-70"
      />
      <img
        src="/landing/stars-2.svg"
        alt=""
        className="absolute left-[62%] top-[58%] h-[157px] w-[174px] opacity-70"
      />
      <img
        src="/landing/stars-5.svg"
        alt=""
        className="absolute left-[74%] top-[68%] h-[152px] w-[202px] opacity-70"
      />
      <img
        src="/landing/stars-5.svg"
        alt=""
        className="absolute right-[-4%] top-[32%] h-[152px] w-[202px] opacity-70"
      />

      <img
        src="/landing/noise.png"
        alt=""
        className="absolute inset-0 size-full object-cover opacity-20 mix-blend-multiply"
      />

      {showBeams && (
        <>
          <div className="absolute left-[18%] top-[-38%] h-[539px] w-[272px] rotate-[-43.55deg] mix-blend-overlay">
            <img src="/landing/light-beam.svg" alt="" className="block size-full max-w-none" />
          </div>
          <div className="absolute left-[42%] top-[-52%] h-[539px] w-[272px] rotate-[-36.37deg] mix-blend-overlay">
            <img
              src="/landing/light-beam-glow.svg"
              alt=""
              className="block size-full max-w-none"
            />
          </div>
        </>
      )}
    </div>
  );
}

export function CosmicPanel({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <div
      id={id}
      className={`relative overflow-hidden rounded-[20px] border-2 border-[rgba(250,250,250,0.1)] bg-[#07071d] backdrop-blur-[6px] ${className}`}
    >
      <CosmicAtmosphere />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
