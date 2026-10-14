"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

export function LandingHeader() {
  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="border-b border-line bg-bg/80 backdrop-blur sticky top-0 z-40"
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="group flex items-center">
            <BrandLogo size="md" variant="full" />
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-dmuted">
          <a href="#app-demos" className="text-ink font-semibold flex items-center gap-1.5 hover:text-emerald-600 transition-colors">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Watch Demos
          </a>
          <a href="#workforce-demo" className="hover:text-ink transition-colors">How It Works</a>
          <a href="#principles" className="hover:text-ink transition-colors">Why itsLARP</a>
          <a href="#architecture" className="hover:text-ink transition-colors">4 Easy Steps</a>
          <Link href="/jobs" className="hover:text-ink transition-colors">Live Jobs</Link>
        </nav>

        <div className="flex items-center gap-2.5">
          <Link href="/login" className="btn text-xs py-1.5 px-3">
            Sign In
          </Link>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
            <Link href="/onboarding" className="btn btn-primary text-xs py-1.5 px-4 font-semibold inline-flex items-center gap-1.5">
              <span>Start Auto-Applying</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}
