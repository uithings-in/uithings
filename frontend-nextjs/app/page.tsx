import React from "react";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import StepsSection from "@/components/landing/StepsSection";
import FeatureRow from "@/components/landing/FeatureRow";
import TypographyMockup from "@/components/landing/TypographyMockup";
import WireframeMockup from "@/components/landing/WireframeMockup";
import FullUiMockup from "@/components/landing/FullUiMockup";
import ResponsiveMockup from "@/components/landing/ResponsiveMockup";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import FaqSection from "@/components/landing/FaqSection";
import PricingSection from "@/components/landing/PricingSection";
import CtaAndFooterSection from "@/components/landing/CtaAndFooterSection";


export default function Home() {
  return (
    <div className="min-h-screen bg-[#05050A] text-white font-sans selection:bg-[#5243f7] selection:text-white relative overflow-x-hidden">
      {/* Global Page Background Gradient Beams */}
      <div className="absolute inset-0 pointer-events-none -z-20 overflow-hidden">
        {/* Hero Top Spotlight */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1600px] h-[900px] opacity-70"
          style={{
            background:
              "radial-gradient(ellipse 75% 50% at 50% 0%, rgba(75, 61, 245, 0.45) 0%, rgba(108, 92, 231, 0.2) 40%, transparent 75%)",
          }}
        />

        {/* Diagonal Ray 1: Steps & Typography Section */}
        <div
          className="absolute top-[1200px] right-0 w-[900px] h-[1000px] opacity-35 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(59, 47, 224, 0.5) 0%, rgba(42, 36, 112, 0.2) 50%, transparent 80%)",
          }}
        />

        {/* Diagonal Ray 2: Wireframe & Full UI Section */}
        <div
          className="absolute top-[2600px] left-0 w-[950px] h-[1100px] opacity-35 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(124, 92, 255, 0.45) 0%, rgba(59, 47, 224, 0.15) 55%, transparent 80%)",
          }}
        />

        {/* Testimonials Spotlight */}
        <div
          className="absolute top-[4200px] left-1/2 -translate-x-1/2 w-[1200px] h-[800px] opacity-40 blur-3xl"
          style={{
            background:
              "radial-gradient(ellipse at 50% 50%, rgba(75, 61, 245, 0.45) 0%, rgba(42, 36, 112, 0.2) 60%, transparent 85%)",
          }}
        />

        {/* Pricing Bright Spotlight Cone */}
        <div
          className="absolute top-[5800px] left-1/2 -translate-x-1/2 w-[1400px] h-[900px] opacity-60 blur-3xl"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 50% 30%, rgba(99, 88, 255, 0.55) 0%, rgba(59, 47, 224, 0.35) 45%, transparent 80%)",
          }}
        />
      </div>

      {/* 1. Navbar */}
      <Navbar />

      <main className="relative z-10">
        {/* 2. Hero Section */}
        <HeroSection />

        {/* 3. Steps Section */}
        <StepsSection />

        {/* Feature Rows Container */}
        <section id="components" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 md:py-16">
          {/* 4. Feature Row 1: Update Branding */}
          <FeatureRow
            pillLabel="Update Branding"
            headline="Tailor every design token to mirror your brand's unique identity."
            description="Effortlessly switch between brand aesthetics with comprehensive token controls and dynamic scales."
            reverse={false}
            glowPosition="top-left"
            items={[
              {
                title: "Global Color Variables",
                description:
                  "Synchronize semantic colors, surface shades, and brand gradients across every component automatically.",
              },
              {
                title: "Dynamic Typography Scales",
                description:
                  "Mathematically balanced type hierarchies engineered for crisp legibility and high visual contrast.",
              },
              {
                title: "Seamless Light & Dark Modes",
                description:
                  "Built-in theme adapters ensuring perfect luminance and WCAG AA accessibility in every lighting environment.",
              },
            ]}
          >
            <TypographyMockup />
          </FeatureRow>

          {/* 5. Feature Row 2: Select Wireframe */}
          <FeatureRow
            pillLabel="Select Wireframe"
            headline="Accelerate structural prototyping with section-based wireframes."
            description="Choose from dozens of high-contrast wireframe layouts ready to be assembled into comprehensive product flows."
            reverse={true}
            glowPosition="top-right"
            items={[
              {
                title: "Modular Section Blocks",
                description:
                  "Pre-composed hero, pricing, feature, and dashboard wireframe blocks built to snap together effortlessly.",
              },
              {
                title: "Diverse Layout Categories",
                description:
                  "Curated architecture patterns designed for SaaS platforms, mobile web apps, and e-commerce storefronts.",
              },
              {
                title: "Auto-Layout Enabled Foundations",
                description:
                  "Every wireframe contains precise padding rules, content hug logic, and responsive constraint definitions.",
              },
            ]}
          >
            <WireframeMockup />
          </FeatureRow>

          {/* 6. Feature Row 3: Upgrade to Full UI */}
          <FeatureRow
            pillLabel="Upgrade to Full UI"
            headline="Transform low-fidelity wireframes into radiant, production-grade UI."
            description="Replace placeholder skeletons with polished, high-fidelity components in a single click."
            reverse={false}
            glowPosition="bottom-left"
            items={[
              {
                title: "One-Click Component Swapping",
                description:
                  "Seamlessly upgrade wireframe placeholders into rich interactive components with preserved layout data.",
              },
              {
                title: "Flexible Section Variants",
                description:
                  "Switch between multiple visual styles, glass effects, borders, and colorways with zero design breakage.",
              },
              {
                title: "Preserved Auto-Layout Logic",
                description:
                  "Maintain exact nesting constraints, spacing relationships, and responsive behavior without manual re-wiring.",
              },
            ]}
          >
            <FullUiMockup />
          </FeatureRow>

          {/* 7. Feature Row 4: Responsive by Default */}
          <FeatureRow
            pillLabel="Responsive by Default"
            headline="Flawless viewport adaptation engineered directly into the core code."
            description="Every component is rigorously tested across desktop, tablet, and mobile screens for uncompromised fidelity."
            reverse={true}
            glowPosition="bottom-right"
            items={[
              {
                title: "Fluid Multi-Breakpoint Scaling",
                description:
                  "Adaptive grid frameworks and fluid font sizing that automatically adjust across any screen dimension.",
              },
              {
                title: "Touch & Pointer Optimization",
                description:
                  "Fine-tuned touch target sizes, gesture interactions, and cursor hover micro-animations for hybrid devices.",
              },
              {
                title: "Zero-Refactor Production Readiness",
                description:
                  "Clean Tailwind utility classes guaranteed to drop into modern frameworks without requiring bespoke CSS overrides.",
              },
            ]}
          >
            <ResponsiveMockup />
          </FeatureRow>
        </section>

        {/* 8. Testimonials Section */}
        <TestimonialsSection />

        {/* 9. FAQ Section */}
        <FaqSection />

        {/* 10. Pricing Section */}
        <PricingSection />

        {/* 11 & 12. Combined CTA & Footer Section with Glowing Planet Horizon Arc */}
        <CtaAndFooterSection />
      </main>
    </div>
  );
}
