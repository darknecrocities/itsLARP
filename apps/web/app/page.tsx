"use client";
import { ScrollProgressBar, InfiniteLoopMarquee } from "@/components/motion";
import {
  LandingHeader,
  HeroSection,
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

      {/* Infinite Looping Text Marquee Strip */}
      <InfiniteLoopMarquee
        items={[
          "1,000 Agents in Parallel",
          "300 Job Finders",
          "300 Resume Makers",
          "400 Auto-Appliers",
          "100% Honest Experience",
          "Clean APA-Format Resumes",
          "1-Click Notion Sync",
          "LinkedIn, JobStreet & Indeed",
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
          "LinkedIn Auto-Search",
          "JobStreet Integration",
          "Indeed Crawler",
          "APA 7th Edition Formatting",
          "1-Click Notion Tracking",
          "Zero Made-Up Skills",
          "Safe Login Verification",
          "1-Tap Human Approval",
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
