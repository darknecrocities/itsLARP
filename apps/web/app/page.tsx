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
      <ScrollProgressBar />
      {/* Top Navigation Header */}
      <LandingHeader />

      {/* Hero Section */}
      <HeroSection />

      {/* Brand Logo Carousel */}
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

      {/* Workforce Interactive Demo / Pipeline Section */}
      <WorkforceDemoSection />

      {/* Guarantees & Operating Principles */}
      <PrinciplesSection />

      {/* Step-by-Step Architecture Pipeline */}
      <ProcessStepsSection />

      {/* Ready to Start CTA Banner */}
      <CtaSection />

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
