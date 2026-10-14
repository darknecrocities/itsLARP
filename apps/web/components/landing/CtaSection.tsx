"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { FadeIn } from "@/components/motion";
import { ArrowRight } from "lucide-react";

export function CtaSection() {
  return (
    <section className="py-24 bg-bg border-t border-line">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <FadeIn distance={20}>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
            Stop Applying to Jobs Manually.
          </h2>
          <p className="text-dmuted text-base sm:text-lg mt-4 max-w-xl mx-auto leading-relaxed">
            Upload your resume once and let your AI team find matching openings across LinkedIn, JobStreet, Indeed, and Carousell—tailoring your resumes and applying automatically.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
              <Link href="/onboarding" className="btn btn-primary text-base py-3 px-8 font-semibold shadow-sm inline-flex items-center gap-2">
                <span>Upload Your Resume & Start</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
              <a href="#app-demos" className="btn text-base py-3 px-6">
                Watch Demos
              </a>
            </motion.div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
