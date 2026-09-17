import React from "react";

const plans = [
  {
    name: "Basic Plan",
    pricePrefix: "₹",
    price: "99",
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
    featured: false,
    check: "/landing/check.svg",
  },
  {
    name: "Advance Plan",
    pricePrefix: "₹",
    price: "199",
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
    featured: true,
    check: "/landing/check.svg",
  },
  {
    name: "Premium+",
    pricePrefix: "₹",
    price: "499",
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
    featured: false,
    check: "/landing/check.svg",
  },
];

export default function PricingSection() {
  return (
    <section
      id="pricing"
      className="relative w-full overflow-hidden bg-[#080605] pt-[72px] pb-[108px] text-white"
    >
      {/* Exact Tube Light SVG Asset from Figma */}
      <div className="pointer-events-none absolute top-0 left-1/2 z-0 flex -translate-x-1/2 justify-center">
        <img
          src="/assets/tube-light.svg"
          alt=""
          width={1050}
          height={486}
          className="pointer-events-none h-[486px] w-[1050px] max-w-none select-none"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[1140px] px-4 sm:px-6">
        {/* Header content */}
        <div className="mb-[56px] flex flex-col items-center text-center">
          {/* Pricing badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(247,247,253,0.15)] bg-[rgba(248,246,253,0.1)] px-3.5 py-1.5 shadow-[0_0_20px_rgba(67,67,213,0.25)] backdrop-blur-[6px]">
            <span className="relative size-4 overflow-hidden">
              <img
                src="/landing/sparkle.svg"
                alt=""
                className="absolute inset-0 size-full max-w-none"
              />
            </span>
            <span
              className="text-sm font-medium leading-5 text-[#DFD5F6]"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Pricing
            </span>
          </div>

          <h2
            className="mt-6 text-[38px] font-medium leading-[1.08] tracking-[-2px] text-[#F7F7FD] sm:text-[54px] md:text-[60px]"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Plans that grow with you
          </h2>
          <p
            className="mt-3.5 max-w-[560px] text-sm sm:text-base font-normal leading-relaxed text-[#9389A8]"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Start free. Upgrade when you&apos;re ready. No hidden fees, no pressure.
          </p>
        </div>

        {/* 3 Pricing Cards */}
        <div className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-3 lg:gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex h-full min-h-[620px] flex-col justify-between overflow-hidden rounded-[20px] p-7 sm:p-8 transition-all duration-300 ${
                plan.featured
                  ? "border border-[#9797FF]/40 bg-[#070415] shadow-[0_0_35px_-5px_rgba(67,67,213,0.32),inset_0_0_20px_rgba(67,67,213,0.08)]"
                  : "border border-white/10 bg-[#070415]"
              }`}
            >
              {/* Glowing top accent line */}
              <div
                className={`absolute top-0 left-7 sm:left-8 h-[2px] w-14 rounded-full ${
                  plan.featured ? "bg-[#9797FF]" : "bg-[#FFFFFF]"
                }`}
                style={{
                  boxShadow: plan.featured
                    ? "0 0 16px 2px #9797FF, 0 0 32px 6px #4343D5"
                    : "0 0 14px 2px rgba(255,255,255,0.85), 0 0 28px 5px rgba(255,255,255,0.3)",
                }}
              />

              {/* Card top content */}
              <div>
                <p
                  className="text-[17px] font-normal leading-6 tracking-[-0.18px] text-[rgba(244,247,245,0.64)]"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {plan.name}
                </p>

                <div className="mt-5 flex items-baseline gap-2">
                  <div
                    className="flex items-baseline text-[#F4F7F5]"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    <span className="text-[34px] sm:text-[38px] font-semibold leading-none">
                      {plan.pricePrefix}
                    </span>
                    <span className="text-[46px] sm:text-[50px] font-bold leading-none tracking-[-0.5px]">
                      {plan.price}
                    </span>
                  </div>
                  <p
                    className="text-[13px] sm:text-sm font-normal tracking-[-0.14px] text-[rgba(244,247,245,0.64)]"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {plan.period}
                  </p>
                </div>

                <p
                  className="mt-3.5 min-h-[44px] text-[14px] sm:text-[15px] font-normal leading-[22px] tracking-[-0.16px] text-[#F4F7F5]"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {plan.description}
                </p>

                {/* Divider with endpoints */}
                <div className="relative my-6 flex items-center justify-between sm:my-7">
                  <span className="size-[2.5px] shrink-0 bg-[#F4F7F5]/70" />
                  <div className="mx-1 h-px w-full bg-white/10" />
                  <span className="size-[2.5px] shrink-0 bg-[#F4F7F5]/70" />
                </div>

                <p
                  className="mb-4 text-[14px] font-medium leading-5 tracking-[-0.16px] text-[rgba(244,247,245,0.64)]"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  What’s Included
                </p>

                <ul className="mb-7 flex flex-col gap-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <span className="relative size-5 shrink-0 overflow-hidden">
                        <img
                          src={plan.check}
                          alt=""
                          className="absolute inset-0 size-full max-w-none"
                        />
                      </span>
                      <span
                        className="text-[14px] sm:text-[15px] font-normal leading-tight tracking-[-0.1px] text-white"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Card bottom CTA */}
              <div className="mt-auto pt-2">
                {plan.featured ? (
                  <a
                    href="#checkout"
                    className="group relative flex h-[42px] w-full items-center justify-center overflow-hidden rounded-full text-sm font-medium tracking-[-0.14px] text-white shadow-[0_4px_22px_rgba(67,67,213,0.45)] transition-all duration-200 hover:shadow-[0_4px_28px_rgba(151,151,255,0.6)] hover:brightness-105 active:scale-[0.99]"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      backgroundImage:
                        "linear-gradient(180deg, #FFFFFF 0%, #6767DC 18%, #4343D5 85%, #3535B8 100%)",
                    }}
                  >
                    <span className="relative">Buy Now</span>
                  </a>
                ) : (
                  <a
                    href="#checkout"
                    className="flex h-[42px] w-full items-center justify-center rounded-full border border-[rgba(250,250,250,0.1)] bg-[rgba(248,246,253,0.08)] text-sm font-medium tracking-[-0.14px] text-[#F4F7F5] transition-all duration-200 hover:border-white/20 hover:bg-[rgba(248,246,253,0.14)] active:scale-[0.99]"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    Buy Now
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
