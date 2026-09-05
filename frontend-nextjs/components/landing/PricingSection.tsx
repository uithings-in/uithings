import { Sparkles, Link2 } from "lucide-react";

const plans = [
  {
    name: "Basic Plan",
    price: "₹99",
    period: "per user / 180 days",
    description: "Perfect for testing and light creative needs.",
    features: [
      "100 components",
      "Figma variables",
      "Dark mode variables",
      "Component properties",
      "Interactive components",
      "Auto Layout 5.0",
    ],
    isAdvance: false,
    accentStyle: "bg-white/20",
    buttonStyle: "bg-[#1A1A22] border border-white/10 text-white hover:bg-[#22222C]",
  },
  {
    name: "Advance Plan",
    price: "₹199",
    period: "per user / 180 days",
    description: "Unlock more power with advanced models and bigger limits.",
    features: [
      "250 components",
      "Figma variables",
      "Dark mode variables",
      "Component properties",
      "Interactive components",
      "Auto Layout 5.0",
    ],
    isAdvance: true,
    accentStyle: "bg-gradient-to-r from-[#6366F1] to-transparent",
    buttonStyle:
      "bg-gradient-to-r from-[#6366F1] to-[#4F46E5] text-white shadow-[0_4px_20px_rgba(99,102,241,0.4)] border-none",
  },
  {
    name: "Premium+",
    price: "₹499",
    period: "per user / 365 days",
    description: "Everything unlimited. For pros, teams, and power creators.",
    features: [
      "Unlimited components",
      "Figma variables",
      "Dark mode variables",
      "Component properties",
      "Interactive components",
      "Auto Layout 5.0",
    ],
    isAdvance: false,
    accentStyle: "bg-white/20",
    buttonStyle: "bg-[#1A1A22] border border-white/10 text-white hover:bg-[#22222C]",
  },
];

export default function PricingSection() {
  return (
    <section
      id="pricing"
      className="relative w-full bg-[#050505] pt-[65px] pb-[90px] overflow-hidden text-white font-sans"
    >
      {/* 1. Top Tubelight Glowing Bar Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center">
        <div
          className="w-[280px] sm:w-[440px] h-[3px] rounded-full bg-[#FFFFFF]"
          style={{
            boxShadow:
              "0 0 12px 2px #FFFFFF, 0 0 30px 6px #6366F1, 0 0 60px 16px #4F46E5",
          }}
        />
      </div>

      {/* 2. Spotlight Cone & Dotted Atmosphere */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[880px] max-w-full h-[540px] pointer-events-none z-0 overflow-hidden flex flex-col items-center">
        <svg
          viewBox="0 0 800 700"
          className="w-full h-full opacity-90 filter blur-[8px]"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="lightRayGrad" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.95" />
              <stop offset="35%" stopColor="#4338CA" stopOpacity="0.75" />
              <stop offset="70%" stopColor="#312E81" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#050505" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points="270,0 530,0 790,450 10,450" fill="url(#lightRayGrad)" />
        </svg>

        <div
          className="absolute inset-0 opacity-[0.08] pointer-events-none z-10"
          style={{
            backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
            backgroundSize: "12px 12px",
            maskImage:
              "linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 50%, rgba(0,0,0,0) 90%)",
            WebkitMaskImage:
              "linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 50%, rgba(0,0,0,0) 90%)",
          }}
        />

        <div className="absolute top-0 w-[440px] h-[320px] bg-[#6366F1]/30 rounded-full blur-[85px] pointer-events-none" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1040px] px-4 sm:px-6">
        {/* 3. Hero Header Content */}
        <div className="flex flex-col items-center text-center mb-[70px] pt-[30px]">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(120,110,255,0.20)] border border-[rgba(160,155,255,0.25)] px-3.5 py-1 text-[13.5px] text-[#D6D4E8] backdrop-blur-md shadow-sm mb-[32px]">
            <Sparkles size={13} className="text-[#D6D4E8]" />
            <span className="font-sans font-medium tracking-wide">Pricing</span>
          </div>

          <h2 className="font-heading font-semibold text-[36px] sm:text-[50px] text-[#F5F5F7] tracking-tight leading-tight">
            Plans that grow with you
          </h2>

          <p className="font-sans text-[15px] sm:text-[16px] font-normal text-[#9693A5] mt-[18px] max-w-xl leading-relaxed">
            Start free. Upgrade when you&apos;re ready. No hidden fees, no pressure.
          </p>
        </div>

        {/* 4. Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`relative rounded-[16px] bg-[#0A0A10] border border-white/[0.10] p-8 flex flex-col justify-between h-full shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:border-white/25 ${plan.isAdvance
                  ? "shadow-[0_0_35px_rgba(98,85,232,0.15)] border-white/20"
                  : ""
                }`}
            >
              {/* Card Top Accent Line */}
              <div
                className={`absolute top-0 left-6 w-[24px] h-[2px] rounded-full pointer-events-none ${plan.accentStyle}`}
              />

              {/* Card Main Body */}
              <div className="flex flex-col flex-grow">
                {/* Plan Title */}
                <h3 className="font-sans text-[16px] font-medium text-[#A6A3B1]">
                  {plan.name}
                </h3>

                {/* Price & Billing */}
                <div className="mt-[16px] flex items-baseline gap-2">
                  <span className="font-sans font-bold text-[44px] text-[#F1F1F5] tracking-tight leading-none">
                    {plan.price}
                  </span>
                  <span className="font-sans text-[12.5px] text-[#9A98A7] font-normal">
                    {plan.period}
                  </span>
                </div>

                {/* Description */}
                <p className="font-sans text-[14px] text-[#E1DFE8] mt-[14px] leading-[1.5] max-w-[260px] min-h-[42px] whitespace-pre-line">
                  {plan.description}
                </p>

                {/* Dashed Divider */}
                <div className="my-[22px] w-full border-t border-dashed border-white/[0.15]" />

                {/* Features Heading */}
                <span className="font-sans text-[14px] font-medium text-[#9693A2] mb-[16px] block">
                  What&apos;s Included
                </span>

                {/* Feature List */}
                <ul className="space-y-[13px] mb-[24px]">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-[10px]">
                      <Link2
                        size={15}
                        strokeWidth={2}
                        className="text-[#9CA3AF] flex-shrink-0 rotate-45"
                      />
                      <span className="font-sans text-[14px] text-[#E5E3EB]">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="flex-grow min-h-[16px]" />
              </div>

              {/* CTA Button */}
              <div className="pt-2">
                <a
                  href="#checkout"
                  className={`font-sans w-full h-[48px] rounded-[10px] text-[15px] font-semibold flex items-center justify-center transition-all duration-180 active:scale-95 ${plan.buttonStyle}`}
                >
                  Buy Now
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}