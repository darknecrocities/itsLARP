"use client";
import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, SlidersHorizontal, CheckCircle2, ShieldCheck, Download } from "lucide-react";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";
import {
  ApaResumeHero,
  ResumeStylesMatrix,
  InteractiveResumePreview,
} from "@/components/apa-resume";
import { type ResumeFormatKey } from "@/lib/store";

export default function ApaResumeShowcasePage() {
  const [selectedFormat, setSelectedFormat] = useState<ResumeFormatKey>("apa_7th");

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col font-sans selection:bg-black selection:text-white">
      {/* Public Landing Navigation Header */}
      <LandingHeader />

      <main className="flex-1">
        {/* 1. Hero Section */}
        <ApaResumeHero onSelectStyle={(fmt) => setSelectedFormat(fmt as ResumeFormatKey)} />

        {/* 2. Which Style Is The Fit Matrix */}
        <ResumeStylesMatrix
          selectedFormat={selectedFormat}
          onSelectFormat={(fmt) => setSelectedFormat(fmt)}
        />

        {/* 3. Live Interactive Document Preview */}
        <InteractiveResumePreview initialFormat={selectedFormat} />

        {/* 4. Bottom Dual CTA Section */}
        <section className="py-16 sm:py-20 border-b border-line bg-white text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-500 font-semibold">
              Ready to Automate Your Applications?
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-neutral-950 mt-2">
              Let 1,000 Bots Tailor & Apply For You.
            </h2>
            <p className="text-neutral-600 text-sm sm:text-base mt-4 max-w-xl mx-auto leading-relaxed">
              Upload your resume or LinkedIn once. Your autonomous AI workforce continuously monitors
              300+ platforms, generates the perfect resume format, and submits applications on your behalf.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/onboarding"
                className="px-7 py-3.5 bg-black text-white text-sm font-semibold rounded hover:bg-neutral-800 transition-all shadow-sm inline-flex items-center gap-2"
              >
                <span>Start Auto-Applying Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/resume"
                className="px-6 py-3.5 bg-neutral-100 text-neutral-900 border border-neutral-300 text-sm font-semibold rounded hover:bg-neutral-200 hover:border-black transition-all inline-flex items-center gap-2 font-mono"
              >
                <SlidersHorizontal className="w-4 h-4 text-neutral-700" />
                <span>Open 20-Config App Studio</span>
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-neutral-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-neutral-900" />
                0% Hallucinations
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-neutral-900" />
                APA 7th Verified Citations
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-neutral-900" />
                20 Autonomous Apply Controls
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* Public Landing Navigation Footer */}
      <LandingFooter />
    </div>
  );
}
