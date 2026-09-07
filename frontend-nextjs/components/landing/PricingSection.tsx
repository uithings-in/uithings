import SectionCaption from "./SectionCaption";

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
    check: "/landing/check-blue.svg",
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
    check: "/landing/check-blue.svg",
  },
];

export default function PricingSection() {
  return (
    <section
      id="pricing"
      className="relative w-full overflow-hidden bg-black pt-[65px] pb-[90px] text-white"
    >
      <div className="pointer-events-none absolute top-0 left-1/2 z-0 h-[486px] w-[1087px] -translate-x-1/2 overflow-hidden">
        <div
          className="absolute top-0 left-1/2 h-[3px] w-[280px] -translate-x-1/2 rounded-full bg-white sm:w-[440px]"
          style={{
            boxShadow:
              "0 0 12px 2px #FFFFFF, 0 0 30px 6px #6366F1, 0 0 60px 16px #4F46E5",
          }}
        />
        <div
          className="absolute left-1/2 top-0 h-[540px] w-[880px] -translate-x-1/2"
          style={{
            background:
              "conic-gradient(from 90deg at 50% 0%, rgba(76,85,223,0.95), rgba(50,30,168,0.55), rgba(8,6,5,0) 50%)",
            filter: "blur(40px)",
            opacity: 0.9,
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
            backgroundSize: "12px 12px",
            maskImage:
              "linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 85%)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[1103px] px-4 sm:px-6">
        <div className="mb-[70px] flex flex-col items-center gap-10 pt-[30px] text-center">
          <SectionCaption>Pricing</SectionCaption>
          <div className="flex flex-col items-center gap-9">
            <h2
              className="text-[40px] font-medium leading-[42px] tracking-[-2.4px] text-[#F7F7FD] sm:text-[60px]"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Plans that grow with you
            </h2>
            <p className="max-w-[577px] text-base font-medium leading-5 text-[#9389A8]">
              Start free. Upgrade when you&apos;re ready. No hidden fees, no pressure.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-3 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex h-full min-h-[609px] flex-col overflow-hidden rounded-2xl border bg-[#070415] p-8 ${
                plan.featured ? "border-[#BECBFF]" : "border-white/10"
              }`}
            >
              <div
                className={`absolute top-0 left-8 h-[2px] w-6 ${
                  plan.featured ? "bg-[#9797FF]" : "bg-[#F4F7F5]"
                }`}
                style={{
                  boxShadow: plan.featured
                    ? "0 0 40px 30px rgba(35,101,255,0.2), 0 0 6px rgba(35,101,255,0.6)"
                    : "0 0 40px 30px rgba(255,255,255,0.1), 0 0 6px rgba(255,255,255,0.5)",
                }}
              />

              <p
                className="text-lg leading-7 tracking-[-0.18px] text-[rgba(244,247,245,0.64)]"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {plan.name}
              </p>

              <div className="mt-6 flex items-end gap-2">
                <p
                  className="text-[44px] leading-[48px] tracking-[-0.22px] text-[#F4F7F5]"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {plan.pricePrefix}
                  <span className="font-bold">{plan.price}</span>
                </p>
                <p
                  className="pb-1 text-sm leading-7 tracking-[-0.14px] text-[rgba(244,247,245,0.64)]"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {plan.period}
                </p>
              </div>

              <p
                className="mt-3 min-h-12 text-base leading-6 tracking-[-0.16px] text-[#F4F7F5]"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {plan.description}
              </p>

              <div className="relative my-8 h-px w-full bg-white/10">
                <span className="absolute bottom-0 left-0 size-0.5 bg-[#F4F7F5]" />
                <span className="absolute right-0 bottom-0 size-0.5 bg-[#F4F7F5]" />
              </div>

              <p
                className="mb-6 text-base leading-6 tracking-[-0.16px] text-[rgba(244,247,245,0.64)]"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                What’s Included
              </p>

              <ul className="mb-8 flex flex-col gap-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <span className="relative size-5 overflow-hidden">
                      <img
                        src={plan.check}
                        alt=""
                        className="absolute inset-0 size-full max-w-none"
                      />
                    </span>
                    <span className="text-base leading-[1.4] text-white">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto">
                {plan.featured ? (
                  <a
                    href="#checkout"
                    className="relative flex h-9 w-full items-center justify-center overflow-hidden rounded-full border border-white/10 text-sm tracking-[-0.14px] text-[#F4F7F5]"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    <span
                      className="absolute inset-0 rounded-full"
                      style={{
                        backgroundImage:
                          "linear-gradient(180deg, #FFFFFF 0%, #6767DC 22%, #4343D5 90%)",
                      }}
                    />
                    <span className="relative">Buy Now</span>
                  </a>
                ) : (
                  <a
                    href="#checkout"
                    className="flex h-9 w-full items-center justify-center rounded-[40px] border border-[rgba(250,250,250,0.1)] bg-[rgba(248,246,253,0.1)] text-sm tracking-[-0.14px] text-[#F4F7F5]"
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
