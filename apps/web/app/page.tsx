"use client";
import { ScrollProgressBar, InfiniteLoopMarquee } from "@/components/motion";
import {
  LandingHeader,
  HeroSection,
  BrandLogoCarousel,
  AppDemosSection,
  WorkforceDemoSection,
  PrinciplesSection,
  ProcessStepsSection,
  CtaSection,
  LandingFooter,
} from "@/components/landing";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg text-ink selection:bg-black selection:text-white relative">
      {/* Top Scroll Motion Progress Bar */}
      <ScrollProgressBar />

      {/* Top Navigation Header */}
      <LandingHeader />

      {/* Hero Section */}
      <HeroSection />

      {/* Brand Logo Carousel (Carousell, LinkedIn, JobStreet, Indeed, Notion, etc.) */}
      <BrandLogoCarousel />

      {/* Real Demo Screen Recordings Showcase */}
      <AppDemosSection />

      {/* Infinite Looping Text Marquee Strip */}
      <InfiniteLoopMarquee
        items={[
          "1,000 AI Assistants Active",
          "300 Job Finders",
          "300 Resume Tailors",
          "400 Application Fillers",
          "100% Honest Experience",
          "Custom Resumes for Every Job",
          "1-Click Notion Sync",
          "Carousell, LinkedIn, JobStreet & Indeed",
          "Zero Spam",
          "No More Manual Forms",
        ]}
        speed={28}
      />

      {/* Live Interactive Workforce Demo Section */}
      <WorkforceDemoSection />

      {/* The 6 Core Guarantees Grid */}
      <PrinciplesSection />

      {/* Simple 4-Step Process Section */}
      <ProcessStepsSection />

      {/* Second Infinite Looping Text Marquee Strip */}
      <InfiniteLoopMarquee
        items={[
          "Carousell Jobs Search",
          "LinkedIn Auto-Search",
          "JobStreet Integration",
          "Indeed Job Matching",
          "Tailored Resume Creation",
          "1-Click Notion Tracking",
          "Zero Fake Skills",
          "1-Tap Review & Approval",
        ]}
        speed={24}
      />

      {/* Call to Action */}
      <CtaSection />

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
