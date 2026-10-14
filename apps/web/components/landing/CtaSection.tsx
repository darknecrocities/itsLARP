"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { FadeIn } from "@/components/motion";
import { ArrowRight } from "lucide-react";

export function CtaSection() {
  return (
    <section className="py-24 bg-bg">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <FadeIn distance={20}>
          <div className="label-xs mb-3">READY TO START?</div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
            Stop Applying to Jobs Manually.
          </h2>
          <p className="text-dmuted text-base sm:text-lg mt-4 max-w-xl mx-auto leading-relaxed">
            Upload your resume once and let 1,000 Agents do the hard work—finding matching roles, customizing resumes, and applying for you.
          </p>

          <div className="mt-8 flex justify-center gap-3">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
              <Link href="/onboarding" className="btn btn-primary text-base py-3 px-8 font-semibold shadow-sm inline-flex items-center gap-2">
                <span>Upload Your Resume & Start</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
              <Link href="/agents" className="btn text-base py-3 px-6">
                Open Agent Console
              </Link>
            </motion.div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
