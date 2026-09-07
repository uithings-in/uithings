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
    <div className="relative min-h-screen overflow-x-hidden bg-black font-sans text-white selection:bg-[#4343D5] selection:text-white">
      <Navbar />

      <main className="relative z-10">
        <HeroSection />
        <StepsSection />

        <section
          id="components"
          className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8"
        >
          <FeatureRow
            pillLabel="Update Branding"
            headline="Instantly update your project's look with fresh color palettes and rapid, seamless branding customization options."
            reverse={false}
            items={[
              {
                title: "Global Color Variables",
                description:
                  "Apply new primary, secondary, and accent colors across your entire library in seconds using meticulously mapped Figma variables.",
              },
              {
                title: "Dynamic Typography Scales",
                description:
                  "Instantly adjust headings, body text, and line heights across hundreds of screens by tweaking a single master text style.",
              },
              {
                title: "Seamless Light & Dark Modes",
                description:
                  "Switch effortlessly between color themes with pre-configured color tokens that automatically invert and adapt your UI.",
              },
            ]}
          >
            <TypographyMockup />
          </FeatureRow>

          <FeatureRow
            pillLabel="Select Wireframe"
            headline="Pick from a curated library of section-based wireframes to quickly map out the structure that fits your project best."
            reverse={true}
            items={[
              {
                title: "Modular Section Blocks",
                description:
                  "Mix and match pre-built hero banners, feature grids, and footers to construct comprehensive page layouts in minutes.",
              },
              {
                title: "Diverse Layout Categories",
                description:
                  "Access specialized, industry-standard wireframe templates tailored for landing pages, SaaS dashboards, and e-commerce platforms.",
              },
              {
                title: "Auto-Layout Enabled Foundations",
                description:
                  "Ensure your structural frameworks are fully responsive from the start with built-in Figma Auto-Layout properties.",
              },
            ]}
          >
            <WireframeMockup />
          </FeatureRow>

          <FeatureRow
            pillLabel="Upgrade to Full UI"
            headline="Transform simple wireframes into polished UI designs by toggling diverse sections and exploring multiple themes."
            reverse={false}
            items={[
              {
                title: "One-Click Component Swapping",
                description:
                  "Instantly replace grayscale wireframe blocks with fully styled, high-fidelity UI components without rebuilding page layouts.",
              },
              {
                title: "Flexible Section Variants",
                description:
                  "Switch between alternate card layouts, hero variations, and navigation styles directly from the Figma properties panel.",
              },
              {
                title: "Preserved Auto-Layout Logic",
                description:
                  "Retain all structural alignment, responsive padding, and spacing rules automatically as you transition from low-fi to high-fi.",
              },
            ]}
          >
            <FullUiMockup />
          </FeatureRow>

          <FeatureRow
            pillLabel="Responsive by Default"
            headline="Transform simple wireframes into polished UI designs by toggling diverse sections and exploring multiple themes."
            reverse={true}
            items={[
              {
                title: "One-Click Component Swapping",
                description:
                  "Instantly replace grayscale wireframe blocks with fully styled, high-fidelity UI components without rebuilding page layouts.",
              },
              {
                title: "Flexible Section Variants",
                description:
                  "Switch between alternate card layouts, hero variations, and navigation styles directly from the Figma properties panel.",
              },
              {
                title: "Preserved Auto-Layout Logic",
                description:
                  "Retain all structural alignment, responsive padding, and spacing rules automatically as you transition from low-fi to high-fi.",
              },
            ]}
          >
            <ResponsiveMockup />
          </FeatureRow>
        </section>

        <TestimonialsSection />
        <FaqSection />
        <PricingSection />
        <CtaAndFooterSection />
      </main>
    </div>
  );
}
