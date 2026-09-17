import React from "react";
import { CosmicPanel } from "./CosmicAtmosphere";
import WhitePill from "./WhitePill";

export interface FeatureItem {
  title: string;
  description: string;
}

interface FeatureRowProps {
  pillLabel: string;
  headline: string;
  items: FeatureItem[];
  reverse?: boolean;
  children: React.ReactNode;
  id?: string;
}

export default function FeatureRow({
  pillLabel,
  headline,
  items,
  reverse = false,
  children,
  id,
}: FeatureRowProps) {
  return (
    <CosmicPanel id={id} className="mb-16 min-h-[583px] sm:mb-20">
      <div
        className={`flex flex-col items-center gap-10 px-6 py-12 sm:px-11 lg:flex-row lg:items-end lg:gap-[74px] ${
          reverse ? "lg:flex-row-reverse" : ""
        }`}
      >
        <div className="w-full shrink-0 overflow-hidden rounded-2xl border-2 border-white lg:h-[366px] lg:w-[528px]">
          {children}
        </div>

        <div className="flex w-full max-w-[423px] flex-col items-start gap-6">
          <div className="flex w-full flex-col items-start gap-9">
            <WhitePill>{pillLabel}</WhitePill>
            <p className="w-full text-justify text-xl font-normal leading-[25px] text-[#FFF8F8]">
              {headline}
            </p>
          </div>

          <div className="relative flex w-full gap-5">
            <div className="relative h-[78px] w-[2.5px] shrink-0 bg-gradient-to-b from-[#4343D5] via-white/40 to-transparent" />
            <div className="flex flex-col gap-4 text-sm leading-[17px] text-[#B8B8B8]">
              {items.map((item) => (
                <div key={item.title}>
                  <p className="font-bold text-[#B8B8B8]">{item.title}</p>
                  <p className="font-medium">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </CosmicPanel>
  );
}
