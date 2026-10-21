"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { HeroBackground } from "@/components/HeroBackground";
import { HeroPeekingMascot } from "@/components/mascot";
import {
  FadeIn,
  AnimatedCounter,
  AnimatedLoopText,
} from "@/components/motion";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section id="hero-section" className="relative border-b border-line pt-16 sm:pt-20 pb-16 sm:pb-20 overflow-hidden bg-bg">
      {/* Interactive Ambient Dot Grid, Vertical Columns & Mouse Spotlight */}
      <HeroBackground />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Bold Grotesque Headline, Subtitle, Dual CTAs & Minimalist Stats */}
          <div className="lg:col-span-7">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.03] text-neutral-950">
              No need to <br className="hidden sm:inline" />
              manually apply to <br className="hidden sm:inline" />
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

            <FadeIn delay={0.15} distance={15}>
              <p className="text-neutral-600 text-base sm:text-lg md:text-xl mt-6 max-w-xl leading-relaxed font-normal">
                Upload your resume or LinkedIn once. Your personal team of AI assistants searches for jobs you love across LinkedIn, JobStreet, Indeed, and Carousell, customizes your resume for each opening, and applies for you—automatically.
              </p>
            </FadeIn>

            {/* Dual Action CTAs (Solid Primary + Clean Outline Secondary) */}
            <FadeIn delay={0.25} distance={15} className="mt-8 flex flex-wrap items-center gap-4">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/onboarding"
                  className="px-7 py-3.5 bg-black text-white text-base font-semibold rounded hover:bg-neutral-800 transition-all shadow-xs inline-flex items-center gap-2.5"
                >
                  <span>Start Auto-Applying Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <a
                  href="#app-demos"
                  className="px-6 py-3.5 bg-transparent border border-neutral-900 text-neutral-900 text-base font-semibold rounded hover:bg-black/5 transition-all inline-flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Watch 3 Live Demos</span>
                </a>
              </motion.div>
            </FadeIn>

            {/* Minimalist Metrics Strip (Mascota Studio Clean Architecture) */}
            <FadeIn delay={0.35} distance={15} className="mt-12 sm:mt-16 pt-8 border-t border-neutral-300/80">
              <div className="grid grid-cols-3 max-w-lg divide-x divide-neutral-200">
                <div className="pr-4 sm:pr-6">
                  <div className="text-2xl sm:text-3xl font-black text-neutral-950 font-display">
                    <AnimatedCounter to={1000} />
                  </div>
                  <div className="text-[10px] sm:text-[11px] font-bold text-neutral-500 tracking-wider uppercase mt-1">
                    AI Assistants Active
                  </div>
                </div>
                <div className="px-4 sm:px-6">
                  <div className="text-2xl sm:text-3xl font-black text-neutral-950 font-display">
                    300+
                  </div>
                  <div className="text-[10px] sm:text-[11px] font-bold text-neutral-500 tracking-wider uppercase mt-1">
                    Platforms Monitored
                  </div>
                </div>
                <div className="pl-4 sm:pl-6">
                  <div className="text-2xl sm:text-3xl font-black text-neutral-950 font-display">
                    0%
                  </div>
                  <div className="text-[10px] sm:text-[11px] font-bold text-neutral-500 tracking-wider uppercase mt-1">
                    Hallucinations
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Right Column: Premium 2D Cursor-Interactive Peeking Crab Mascot */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end relative pt-6 lg:pt-0">
            <HeroPeekingMascot />
          </div>
        </div>
      </div>
    </section>
  );
}
