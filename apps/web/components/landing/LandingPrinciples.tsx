"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
  CardMotion,
  AnimatedLoopText,
} from "../motion";

const PRINCIPLES = [
  {
    num: "01",
    title: "100% Honest & Accurate",
    desc: "The Agents strictly use your real experience. They never make things up, exaggerate, or invent fake skills.",
  },
  {
    num: "02",
    title: "Clean APA-Style Resumes",
    desc: "Resumes are generated in standard APA format with clean headings and links to your real projects that recruiters love.",
  },
  {
    num: "03",
    title: "300 Agents Searching For You",
    desc: "While you go about your day, 300 Agents scan LinkedIn, JobStreet, and Indeed looking only for jobs you actually want.",
  },
  {
    num: "04",
    title: "A Custom Resume for Every Role",
    desc: "No more sending one generic resume everywhere. Each opening gets tailored bullet points that match the job description.",
  },
  {
    num: "05",
    title: "400 Agents Applying for You",
    desc: "400 Agents do the boring form filling so you never have to re-enter your work history. You give final approval before submitting.",
  },
  {
    num: "06",
    title: "Auto-Organized in Notion",
    desc: "One click connects your Notion. Every job applied to is automatically added to a clean tracking board with status and match score.",
  },
];

export function LandingPrinciples() {
  return (
    <>
      <section id="principles" className="py-20 border-b border-line">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn distance={24} className="max-w-2xl mb-12">
            <div className="label-xs">HOW IT WORKS FOR YOU</div>
            <h2 className="text-3xl font-bold mt-1 tracking-tight">6 Simple Rules That Keep You in Control</h2>
            <p className="text-muted text-sm mt-2">
              No complicated setup. No fake skills. Here is how our Agents save you hours every single day.
            </p>
          </FadeIn>

          <StaggerContainer delay={0.1} stagger={0.07} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PRINCIPLES.map((p) => (
              <StaggerItem key={p.num}>
                <CardMotion hoverLift={-4} className="h-full">
                  <div className="card p-6 bg-bg flex flex-col justify-between h-full border border-line hover:border-black transition-colors">
                    <div>
                      <div className="font-mono text-xs text-muted mb-2 font-semibold">{p.num}</div>
                      <h3 className="text-lg font-semibold mb-2">{p.title}</h3>
                      <p className="text-muted text-xs leading-relaxed">{p.desc}</p>
                    </div>
                    <div className="mt-6 pt-3 border-t border-line flex items-center justify-between text-[11px] font-mono text-muted">
                      <span>Our Promise</span>
                      <span className="text-ink font-semibold">Guaranteed</span>
                    </div>
                  </div>
                </CardMotion>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <section id="architecture" className="py-20 border-b border-line bg-bg2/30">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn distance={24} className="max-w-2xl mb-12">
            <div className="label-xs mb-2">HOW IT WORKS STEP-BY-STEP</div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">From Upload to Applied in 4 Simple Steps</h2>
            <p className="text-muted text-sm mt-2">
              No complicated technical setup. Here is how your job search happens automatically from start to finish.
            </p>
          </FadeIn>

          <StaggerContainer delay={0.1} stagger={0.09} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StaggerItem>
              <CardMotion hoverLift={-4} className="h-full">
                <div className="card p-6 bg-bg flex flex-col justify-between h-full border-2 border-line hover:border-black transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 bg-black text-white rounded">
                        STEP 01
                      </span>
                      <span className="text-[11px] font-mono text-muted">Done Once</span>
                    </div>
                    <h3 className="font-bold text-lg mb-2">Upload Your Profile</h3>
                    <p className="text-muted text-xs leading-relaxed">
                      Drop your resume or connect your LinkedIn and GitHub. Our system creates your verified profile in seconds—no tedious typing required.
                    </p>
                  </div>
                  <div className="mt-6 pt-3 border-t border-line text-[11px] font-mono text-ink font-semibold">
                    ✓ Takes under 1 minute
                  </div>
                </div>
              </CardMotion>
            </StaggerItem>

            <StaggerItem>
              <CardMotion hoverLift={-4} className="h-full">
                <div className="card p-6 bg-bg flex flex-col justify-between h-full border-2 border-line hover:border-black transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 bg-black text-white rounded">
                        STEP 02
                      </span>
                      <span className="text-[11px] font-mono text-muted">300 Agents</span>
                    </div>
                    <h3 className="font-bold text-lg mb-2">Agents Search For You</h3>
                    <p className="text-muted text-xs leading-relaxed">
                      300 Agents browse LinkedIn, JobStreet, and Indeed around the clock, matching jobs based on your title, location, and salary goals.
                    </p>
                  </div>
                  <div className="mt-6 pt-3 border-t border-line text-[11px] font-mono text-ink font-semibold">
                    ✓ Searches 24/7 on autopilot
                  </div>
                </div>
              </CardMotion>
            </StaggerItem>

            <StaggerItem>
              <CardMotion hoverLift={-4} className="h-full">
                <div className="card p-6 bg-bg flex flex-col justify-between h-full border-2 border-line hover:border-black transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 bg-black text-white rounded">
                        STEP 03
                      </span>
                      <span className="text-[11px] font-mono text-muted">300 Agents</span>
                    </div>
                    <h3 className="font-bold text-lg mb-2">Custom Resumes Made</h3>
                    <p className="text-muted text-xs leading-relaxed">
                      For every single job opening found, 300 Agents build an individualized, clean APA-format resume highlighting your relevant real-world work.
                    </p>
                  </div>
                  <div className="mt-6 pt-3 border-t border-line text-[11px] font-mono text-ink font-semibold">
                    ✓ Zero made-up or fake skills
                  </div>
                </div>
              </CardMotion>
            </StaggerItem>

            <StaggerItem>
              <CardMotion hoverLift={-4} className="h-full">
                <div className="card p-6 bg-bg flex flex-col justify-between h-full border-2 border-line hover:border-black transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 bg-black text-white rounded">
                        STEP 04
                      </span>
                      <span className="text-[11px] font-mono text-muted">400 Agents</span>
                    </div>
                    <h3 className="font-bold text-lg mb-2">Applied & Tracked</h3>
                    <p className="text-muted text-xs leading-relaxed">
                      400 Agents fill out the repetitive application forms. You review with one tap, and every company is organized in your Notion tracker.
                    </p>
                  </div>
                  <div className="mt-6 pt-3 border-t border-line text-[11px] font-mono text-ink font-semibold">
                    ✓ 1-Click Notion database sync
                  </div>
                </div>
              </CardMotion>
            </StaggerItem>
          </StaggerContainer>

          <FadeIn delay={0.25} distance={18}>
            <div className="mt-8 card p-6 bg-bg border border-line flex flex-wrap items-center justify-between gap-4 font-mono text-xs hover:border-black transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-xl">✨</span>
                <div>
                  <strong className="text-ink text-sm font-sans block mb-0.5">The Bottom Line:</strong>
                  <div className="text-muted font-sans text-xs">
                    <AnimatedLoopText
                      words={[
                        "No more copying and pasting job descriptions into applications.",
                        "No more re-entering your job history on 50 different career sites.",
                        "No more tracking job applications across messy spreadsheets.",
                        "Just your dream job delivered on autopilot with 1,000 Agents.",
                      ]}
                      interval={3200}
                      className="font-medium text-black"
                    />
                  </div>
                </div>
              </div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Link href="/onboarding" className="btn btn-primary text-xs py-2 px-4 shadow-sm">
                  Get Started Now →
                </Link>
              </motion.div>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
