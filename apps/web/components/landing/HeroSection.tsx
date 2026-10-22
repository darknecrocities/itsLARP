"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { HeroBackground } from "@/components/HeroBackground";
import { HeroMascotStage } from "@/components/mascot";
import {
  FadeIn,
  AnimatedCounter,
  AnimatedLoopText,
} from "@/components/motion";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section id="hero-section" className="relative border-b border-line pt-14 sm:pt-20 pb-14 sm:pb-20 overflow-hidden bg-bg min-h-[560px] lg:min-h-[660px]">
      {/* Interactive Ambient Dot Grid, Vertical Columns & Mouse Spotlight */}
      <HeroBackground />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Bold Grotesque Headline, Subtitle, Dual CTAs & Minimalist Stats */}
          <div className="lg:col-span-7 xl:col-span-7">
            <h1 className="text-[28px] sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] text-neutral-950 break-words max-w-xl">
              No need to <br className="hidden sm:inline" />
              manually apply <br className="hidden sm:inline" />
              to{" "}
              <span className="underline decoration-neutral-300 underline-offset-8 inline-block">
                <AnimatedLoopText
                  words={[
                    "jobs ever again.",
                    "tech startups.",
                    "remote AI roles.",
                    "LinkedIn openings.",
                    "top companies.",
                  ]}
                />
              </span>
            </h1>

            <p className="text-neutral-600 text-sm sm:text-lg md:text-xl mt-5 sm:mt-6 max-w-xl leading-relaxed font-normal">
              Upload your resume or LinkedIn once. Your personal team of AI assistants searches for jobs you love across LinkedIn, JobStreet, Indeed, and Carousell, customizes your resume for each opening, and applies for you—automatically.
            </p>

            {/* Dual Action CTAs (Solid Primary + Clean Outline Secondary) */}
            <div className="mt-8 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3.5 sm:gap-4">
              <motion.div className="w-full sm:w-auto" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/onboarding"
                  className="w-full sm:w-auto px-6 sm:px-7 py-3.5 bg-black text-white text-sm sm:text-base font-semibold rounded hover:bg-neutral-800 transition-all shadow-xs inline-flex items-center justify-center gap-2.5"
                >
                  <span>Start Auto-Applying Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
              <motion.div className="w-full sm:w-auto" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <a
                  href="#app-demos"
                  className="w-full sm:w-auto px-5 sm:px-6 py-3.5 bg-transparent border border-neutral-900 text-neutral-900 text-sm sm:text-base font-semibold rounded hover:bg-black/5 transition-all inline-flex items-center justify-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Watch 3 Live Demos</span>
                </a>
              </motion.div>
            </div>

            {/* Minimalist Metrics Strip (Mascota Studio Clean Architecture) */}
            <div className="mt-8 sm:mt-16 pt-6 sm:pt-8 border-t border-neutral-300/80">
              <div className="grid grid-cols-3 max-w-lg divide-x divide-neutral-200">
                <div className="pr-1.5 sm:pr-6">
                  <div className="text-xl sm:text-3xl font-black text-neutral-950 font-display">
                    <AnimatedCounter to={1000} />
                  </div>
                  <div className="text-[8.5px] xs:text-[9.5px] sm:text-[11px] font-bold text-neutral-500 tracking-wider uppercase mt-1 leading-tight">
                    AI Assistants Active
                  </div>
                </div>
                <div className="px-1.5 sm:px-6">
                  <div className="text-xl sm:text-3xl font-black text-neutral-950 font-display">
                    300+
                  </div>
                  <div className="text-[8.5px] xs:text-[9.5px] sm:text-[11px] font-bold text-neutral-500 tracking-wider uppercase mt-1 leading-tight">
                    Platforms Monitored
                  </div>
                </div>
                <div className="pl-1.5 sm:pl-6">
                  <div className="text-xl sm:text-3xl font-black text-neutral-950 font-display">
                    0%
                  </div>
                  <div className="text-[8.5px] xs:text-[9.5px] sm:text-[11px] font-bold text-neutral-500 tracking-wider uppercase mt-1 leading-tight">
                    Hallucinations
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile / Tablet Mascot Stage positioned below metrics strip */}
            <div className="lg:hidden w-full mt-6 sm:mt-10 overflow-visible">
              <HeroMascotStage isMobile={true} />
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Mascot: Anchored Directly Flush to Right Viewport Edge & Vertically Centered */}
      <div className="hidden lg:flex items-center justify-end absolute right-0 top-0 bottom-0 z-20 pointer-events-auto">
        <HeroMascotStage />
      </div>
    </section>
  );
}
