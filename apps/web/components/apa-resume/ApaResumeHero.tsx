"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, CheckCircle2, ShieldCheck, Cpu } from "lucide-react";

interface ApaResumeHeroProps {
  onSelectStyle?: (styleKey: string) => void;
}

export function ApaResumeHero({ onSelectStyle }: ApaResumeHeroProps) {
  return (
    <section className="relative pt-12 sm:pt-16 pb-12 sm:pb-16 border-b border-line bg-bg overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Subtle Breadcrumb / Pill */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-500 font-semibold">
            itsLARP Architecture
          </span>
          <span className="text-neutral-300">/</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-200 text-neutral-800 font-medium">
            5 Verified Resume Styles
          </span>
        </div>

        {/* Massive Grotesque Headline */}
        <div className="max-w-3xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] text-neutral-950">
            5 Autonomous Resume Formats. <br className="hidden sm:inline" />
            <span className="underline decoration-neutral-300 underline-offset-8">
              0% Hallucinations.
            </span>
          </h1>

          <p className="text-neutral-600 text-sm sm:text-base md:text-lg mt-5 leading-relaxed font-normal">
            Every job application is unique. itsLARP equips your AI workforce with 5 specialized
            resume design architectures. For every job opening your bots discover, an autonomous
            tailoring agent extracts required skills, mirrors keywords, reformulates impact metrics,
            and selects the exact format that maximizes recruiter and ATS match rates.
          </p>
        </div>

        {/* 3 Core Invariants Badges */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl pt-6 border-t border-neutral-200">
          <div className="flex items-start gap-2.5 p-3 rounded border border-neutral-200 bg-white">
            <ShieldCheck className="w-4 h-4 text-neutral-900 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-neutral-900 font-mono">100% Grounded DNA</div>
              <div className="text-[11px] text-neutral-500 mt-0.5">
                Zero hallucinated credentials or invented company experiences.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded border border-neutral-200 bg-white">
            <Cpu className="w-4 h-4 text-neutral-900 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-neutral-900 font-mono">Per-Job Dynamic Tailoring</div>
              <div className="text-[11px] text-neutral-500 mt-0.5">
                Skills & bullet points re-ordered in real time to match each opening.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded border border-neutral-200 bg-white">
            <CheckCircle2 className="w-4 h-4 text-neutral-900 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-neutral-900 font-mono">APA 7th Software Citations</div>
              <div className="text-[11px] text-neutral-500 mt-0.5">
                Formal academic reference trails linking claims to verified commits.
              </div>
            </div>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href="#styles-matrix"
            className="px-5 py-2.5 bg-black text-white text-xs sm:text-sm font-semibold rounded hover:bg-neutral-800 transition-all inline-flex items-center gap-2"
          >
            <span>Compare 5 Resume Styles</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
          <a
            href="#live-preview"
            className="px-5 py-2.5 bg-white border border-neutral-300 text-neutral-900 text-xs sm:text-sm font-semibold rounded hover:border-black transition-all inline-flex items-center gap-2"
          >
            <span>Live Document Preview</span>
          </a>
          <a
            href="#agent-tailoring"
            className="px-5 py-2.5 bg-neutral-100 text-neutral-800 text-xs sm:text-sm font-semibold rounded hover:bg-neutral-200 transition-all inline-flex items-center gap-2 font-mono"
          >
            <Sparkles className="w-3.5 h-3.5 text-neutral-700" />
            <span>How Agents Tailor Resumes</span>
          </a>
        </div>
      </div>
    </section>
  );
}
