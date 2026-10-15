"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Download } from "lucide-react";
import { HeroBackground } from "../HeroBackground";
import { HeroAgentMiniHUD } from "../HeroAgentMiniHUD";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
  CardMotion,
  AnimatedCounter,
  AnimatedLoopText,
  KineticTextStagger,
  AnimatedSparkBar,
} from "../motion";

export function LandingHero() {
  return (
    <section id="hero-section" className="relative border-b border-line pt-20 pb-20 overflow-hidden">
      <HeroBackground />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <div className="lg:col-span-7">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.04]">
              <KineticTextStagger text="No Need to Manually Apply to" />{" "}
              <AnimatedLoopText
                words={[
                  "Jobs Ever Again.",
                  "Tech Startups.",
                  "Remote AI Roles.",
                  "LinkedIn Openings.",
                  "Top Companies.",
                ]}
                className="underline decoration-neutral-300 underline-offset-8 inline-block"
              />
            </h1>

            <FadeIn delay={0.2} distance={20}>
              <p className="text-dmuted text-base sm:text-lg md:text-xl mt-6 leading-relaxed">
                No need to manually apply. Upload your resume, LinkedIn, or GitHub once. Your personal team of 1,000 Agents searches for jobs you love, customizes your resume for each role, and applies for you—automatically.
              </p>
            </FadeIn>

            <FadeIn delay={0.3} distance={20} className="mt-8 flex flex-wrap gap-3 items-center">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Link href="/download" className="btn btn-primary text-base py-3 px-6 font-semibold shadow-sm flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  <span>Download Desktop (Mac & Windows)</span>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Link href="/dashboard" className="btn text-base py-3 px-6 font-medium">
                  Open Web Dashboard →
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <a href="#workforce-demo" className="btn text-base py-3 px-6 text-dmuted hover:text-ink">
                  Watch Demo
                </a>
              </motion.div>
            </FadeIn>
          </div>

          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <HeroAgentMiniHUD />
          </div>
        </div>

        <StaggerContainer
          delay={0.4}
          stagger={0.09}
          className="mt-14 pt-8 border-t border-line grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs"
        >
          <StaggerItem>
            <CardMotion hoverLift={-3} className="p-3.5 bg-bg2/50 border border-neutral-200 rounded">
              <div className="label-xs text-muted">300 JOB FINDERS</div>
              <div className="font-display text-2xl sm:text-3xl font-bold mt-1 text-ink">
                <AnimatedCounter to={300} suffix=" Agents" />
              </div>
              <div className="text-xs text-muted mt-0.5">Searches LinkedIn & JobStreet 24/7</div>
              <AnimatedSparkBar percentage={75} delay={0.45} />
            </CardMotion>
          </StaggerItem>

          <StaggerItem>
            <CardMotion hoverLift={-3} className="p-3.5 bg-bg2/50 border border-neutral-200 rounded">
              <div className="label-xs text-muted">300 RESUME MAKERS</div>
              <div className="font-display text-2xl sm:text-3xl font-bold mt-1 text-ink">
                <AnimatedCounter to={300} suffix=" Agents" />
              </div>
              <div className="text-xs text-muted mt-0.5">Custom APA resumes for every role</div>
              <AnimatedSparkBar percentage={85} delay={0.55} />
            </CardMotion>
          </StaggerItem>

          <StaggerItem>
            <CardMotion hoverLift={-3} className="p-3.5 bg-bg2/50 border border-neutral-200 rounded">
              <div className="label-xs text-muted">400 AUTO-APPLIERS</div>
              <div className="font-display text-2xl sm:text-3xl font-bold mt-1 text-ink">
                <AnimatedCounter to={400} suffix=" Agents" />
              </div>
              <div className="text-xs text-muted mt-0.5">Fills forms & gets apps ready for you</div>
              <AnimatedSparkBar percentage={95} delay={0.65} />
            </CardMotion>
          </StaggerItem>

          <StaggerItem>
            <CardMotion hoverLift={-3} className="p-3.5 bg-bg2/50 border border-neutral-200 rounded">
              <div className="label-xs text-muted">1-CLICK NOTION TRACKER</div>
              <div className="font-display text-2xl sm:text-3xl font-bold mt-1 text-ink">1 Click</div>
              <div className="text-xs text-muted mt-0.5">Saves company, title & status in a list</div>
              <AnimatedSparkBar percentage={100} delay={0.75} />
            </CardMotion>
          </StaggerItem>
        </StaggerContainer>
      </div>
    </section>
  );
}
