"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui";
import { HorizontalPipelineMap } from "@/components/HorizontalPipelineMap";
import { HeroBackground } from "@/components/HeroBackground";
import { HeroAgentMiniHUD } from "@/components/HeroAgentMiniHUD";
import {
  ScrollProgressBar,
  FadeIn,
  StaggerContainer,
  StaggerItem,
  CardMotion,
  AnimatedCounter,
  TextReveal,
  AnimatedLoopText,
  InfiniteLoopMarquee,
  RotatingBadgeLoop,
  KineticTextStagger,
  AnimatedSparkBar,
} from "@/components/motion";
import { motion, AnimatePresence } from "framer-motion";
import { BrandLogo } from "@/components/BrandLogo";
import { DemoVideoPlayer } from "@/components/DemoVideoPlayer";

const DEMO_LOGS = [
  { t: "14:10:02", id: "agent_scrape_014", msg: "LinkedIn Agent found 'Lead AI Engineer' @ Anthropic Labs matching your target salary" },
  { t: "14:10:05", id: "agent_scrape_089", msg: "JobStreet Agent found 'Senior Full Stack Lead' @ FinTech Corp matching your skills" },
  { t: "14:10:07", id: "agent_analyst_04", msg: "Checked job requirements: Python, React, FastAPI, Docker (94% match)" },
  { t: "14:10:09", id: "agent_match_11", msg: "Match score computed: 94% · Fits your experience and preferences" },
  { t: "14:10:12", id: "agent_tailor_042", msg: "Created custom APA resume highlighting your real project experience" },
  { t: "14:10:15", id: "agent_apply_108", msg: "Filled application questions and staged application for your 1-tap review" },
  { t: "14:10:18", id: "agent_notion_01", msg: "Saved to your Notion tracker: Anthropic Labs · Ready to Review · 94% Match" },
];

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

export default function LandingPage() {
  const [activeLogIndex, setActiveLogIndex] = useState(DEMO_LOGS.length - 1);
  const [simRunning, setSimRunning] = useState(true);
  const [demoTab, setDemoTab] = useState<"video" | "pipeline" | "apa" | "notion">("video");
  const [videoTab, setVideoTab] = useState<"swarm" | "resume" | "notion">("swarm");

  useEffect(() => {
    if (!simRunning) return;
    const timer = setInterval(() => {
      setActiveLogIndex((prev) => (prev + 1) % DEMO_LOGS.length);
    }, 2400);
    return () => clearInterval(timer);
  }, [simRunning]);

  return (
    <div className="min-h-screen bg-bg text-ink selection:bg-black selection:text-white relative">
      {/* Top Scroll Motion Progress Bar */}
      <ScrollProgressBar />

      {/* Top Navigation Header with Entrance Motion */}
      <motion.header
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="border-b border-line bg-bg/80 backdrop-blur sticky top-0 z-40"
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo size="md" />
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-dmuted">
            <a href="#app-demos" className="hover:text-ink transition-colors flex items-center gap-1.5 font-semibold text-ink">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              Live Demos
            </a>
            <a href="#workforce-demo" className="hover:text-ink transition-colors">How It Works</a>
            <a href="#apa-format" className="hover:text-ink transition-colors">APA Resume</a>
            <a href="#principles" className="hover:text-ink transition-colors">Guarantees</a>
            <a href="#architecture" className="hover:text-ink transition-colors">4 Simple Steps</a>
            <Link href="/jobs" className="hover:text-ink transition-colors">Live Jobs</Link>
          </nav>

          <div className="flex items-center gap-2.5">
            <Link href="/login" className="btn text-xs py-1.5 px-3">
              Sign In
            </Link>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Link href="/onboarding" className="btn btn-primary text-xs py-1.5 px-4 font-semibold">
                Start Auto-Applying →
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section with Scroll and Staggered Motion */}
      <section id="hero-section" className="relative border-b border-line pt-20 pb-20 overflow-hidden">
        {/* Interactive Ambient Dot Grid & Mouse Spotlight */}
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

              <FadeIn delay={0.3} distance={20} className="mt-8 flex flex-wrap gap-3">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Link href="/onboarding" className="btn btn-primary text-base py-3 px-6 font-semibold shadow-sm">
                    Start Auto-Applying Now →
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <a href="#app-demos" className="btn text-base py-3 px-6 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    Watch 3 Live Demos
                  </a>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <a href="#workforce-demo" className="btn text-base py-3 px-6">
                    Interactive Swarm
                  </a>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Link href="/resume" className="btn text-base py-3 px-6">
                    Sample APA Resume
                  </Link>
                </motion.div>
              </FadeIn>
            </div>

            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <HeroAgentMiniHUD />
            </div>
          </div>

          {/* Highlights Metrics Bar with Cascading Stagger, Animated Counters and Sparkbars */}
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

      {/* 3 Real Product Walkthroughs / Video Theater Section */}
      <section id="app-demos" className="py-20 border-b border-line bg-bg">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn distance={24} className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <div className="label-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                AUTHENTIC SYSTEM RECORDINGS
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mt-1 tracking-tight">
                See itsLARP in Action: 3 Real Application Demos
              </h2>
              <p className="text-muted text-sm mt-2 max-w-2xl leading-relaxed">
                Watch actual high-definition screen recordings of itsLARP in operation. See how 1,000 bots coordinate, how APA 7th resumes are verified with zero hallucinations, and how applications auto-mirror directly into Notion.
              </p>
            </div>

            {/* Video switcher tabs */}
            <div className="flex flex-wrap gap-2 text-xs font-mono">
              <motion.button
                whileTap={{ scale: 0.96 }}
                className={`btn text-xs ${videoTab === "swarm" ? "bg-black text-white" : ""}`}
                onClick={() => setVideoTab("swarm")}
              >
                1. 1,000-Bot Workforce Swarm
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.96 }}
                className={`btn text-xs ${videoTab === "resume" ? "bg-black text-white" : ""}`}
                onClick={() => setVideoTab("resume")}
              >
                2. APA 7th Resume Studio
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.96 }}
                className={`btn text-xs ${videoTab === "notion" ? "bg-black text-white" : ""}`}
                onClick={() => setVideoTab("notion")}
              >
                3. Applications & Notion Sync
              </motion.button>
            </div>
          </FadeIn>

          <AnimatePresence mode="wait">
            {videoTab === "swarm" ? (
              <motion.div
                key="swarm-vid"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <DemoVideoPlayer
                  title="1,000 Autonomous Agents Swarm in Action"
                  urlBar="itslarp.local/agents"
                  mp4Src="/demos/workforce-swarm-demo.mp4"
                  webmSrc="/demos/workforce-swarm-demo.webm"
                  posterSrc="/demos/workforce-swarm-demo-poster.jpg"
                  caption="Real capture: 300 Discovery Crawlers scanning LinkedIn/JobStreet, 300 Resume Tailors, and 400 Appliers with live 2FA OTP prompt handling."
                />
              </motion.div>
            ) : videoTab === "resume" ? (
              <motion.div
                key="resume-vid"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <DemoVideoPlayer
                  title="APA 7th Edition Resume Studio & Tailoring"
                  urlBar="itslarp.local/resume"
                  mp4Src="/demos/apa-resume-demo.mp4"
                  webmSrc="/demos/apa-resume-demo.webm"
                  posterSrc="/demos/apa-resume-demo-poster.jpg"
                  caption="Real capture: Generating academic running heads, formal software project citations, and tailoring skill diffs with 0% hallucinations."
                />
              </motion.div>
            ) : (
              <motion.div
                key="notion-vid"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <DemoVideoPlayer
                  title="Applications Pipeline & 1-Click Notion Auto-List"
                  urlBar="itslarp.local/applications"
                  mp4Src="/demos/notion-pipeline-demo.mp4"
                  webmSrc="/demos/notion-pipeline-demo.webm"
                  posterSrc="/demos/notion-pipeline-demo-poster.jpg"
                  caption="Real capture: Reviewing staged application answers, tracking live applications, and 1-click database synchronization to Notion."
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Live Interactive Workforce Demo Section */}
      <section id="workforce-demo" className="py-20 border-b border-line bg-bg2/30">
        <div className="max-w-6xl mx-auto px-6">
          <FadeIn direction="up" distance={24} className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <div className="label-xs">LIVE DEMO</div>
              <h2 className="text-3xl font-bold mt-1 tracking-tight">Watch 1,000 Agents Work For You in Real Time</h2>
              <p className="text-muted text-sm mt-1 max-w-xl">
                See how your Agents find jobs, write tailored resumes, and prepare your applications. Toggle between the live system recording, interactive network, APA resume, and Notion database.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-xs font-mono">
              <motion.button
                whileTap={{ scale: 0.96 }}
                className={`btn text-xs ${simRunning ? "bg-black text-white" : ""}`}
                onClick={() => setSimRunning(!simRunning)}
              >
                {simRunning ? "⏸ Pause Demo" : "▶ Resume Demo"}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.96 }}
                className={`btn text-xs ${demoTab === "video" ? "bg-black text-white" : ""}`}
                onClick={() => setDemoTab("video")}
              >
                🎬 Real Swarm Video
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.96 }}
                className={`btn text-xs ${demoTab === "pipeline" ? "bg-black text-white" : ""}`}
                onClick={() => setDemoTab("pipeline")}
              >
                Interactive Agent Network
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.96 }}
                className={`btn text-xs ${demoTab === "apa" ? "bg-black text-white" : ""}`}
                onClick={() => setDemoTab("apa")}
              >
                Sample APA Resume
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.96 }}
                className={`btn text-xs ${demoTab === "notion" ? "bg-black text-white" : ""}`}
                onClick={() => setDemoTab("notion")}
              >
                Notion Application List
              </motion.button>
            </div>
          </FadeIn>

          <AnimatePresence mode="wait">
            {demoTab === "video" ? (
              <motion.div
                key="workforce-video"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <DemoVideoPlayer
                  title="1,000-Agent Swarm Real Recording"
                  urlBar="itslarp.local/agents"
                  mp4Src="/demos/workforce-swarm-demo.mp4"
                  webmSrc="/demos/workforce-swarm-demo.webm"
                  posterSrc="/demos/workforce-swarm-demo-poster.jpg"
                  caption="Full real-time recording: 300 Crawlers on LinkedIn/JobStreet, 300 Tailors, and 400 Appliers executing parallel jobs."
                />
              </motion.div>
            ) : demoTab === "pipeline" ? (
              <motion.div
                key="pipeline"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                <HorizontalPipelineMap
                  running={simRunning}
                  activeCount={simRunning ? 347 : 0}
                  totalWorkers={1000}
                  pools={{
                    scrapers_count: 300,
                    tailors_count: 300,
                    appliers_count: 400,
                    scrapers_active: simRunning ? 142 : 0,
                    tailors_active: simRunning ? 89 : 0,
                    appliers_active: simRunning ? 116 : 0,
                  }}
                />
              </motion.div>
            ) : demoTab === "apa" ? (
              <motion.div
                key="apa"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                id="apa-format"
                className="card p-8 bg-white text-black border border-line shadow-lg font-serif max-w-3xl mx-auto"
              >
                <div className="flex justify-between items-center text-xs text-neutral-500 font-mono border-b border-neutral-300 pb-2 mb-6">
                  <span>RUNNING HEAD: SAMPLE / CURRICULUM VITAE</span>
                  <span>Page 1</span>
                </div>
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold">Jane Doe</h3>
                  <div className="text-sm italic text-neutral-700 mt-0.5">Senior Software Engineer</div>
                  <div className="text-xs text-neutral-500 font-mono mt-1">
                    jane@example.com | San Francisco, CA | github.com/janedoe
                  </div>
                </div>
                <div className="mb-4">
                  <h4 className="text-center font-bold text-xs uppercase border-b border-black pb-1 mb-2 tracking-wider">
                    Professional Summary
                  </h4>
                  <p className="text-xs text-neutral-800 leading-relaxed indent-6">
                    Experienced engineer with 4+ years building high-performance web applications, distributed systems, and real-time APIs. Specialized in Python, React, TypeScript, and Docker.
                  </p>
                </div>
                <div className="mb-4">
                  <h4 className="text-center font-bold text-xs uppercase border-b border-black pb-1 mb-2 tracking-wider">
                    Verified Project Work (APA 7th Format)
                  </h4>
                  <p className="text-xs leading-snug pl-4 -indent-4">
                    <strong>Doe, J.</strong> (2026). <em>Autonomous Task Engine</em> [Software project / Python, React, FastAPI].
                  </p>
                  <p className="text-[11px] text-neutral-600 pl-4 mt-0.5">
                    High-speed background runner processing thousands of tasks in parallel with 100% verified accuracy.
                  </p>
                </div>
                <div className="pt-4 border-t border-neutral-300 flex justify-between items-center text-xs font-mono">
                  <span className="text-neutral-500">Standard APA 7th Edition Output</span>
                  <Link href="/resume" className="btn text-xs py-1 px-3 bg-black text-white">
                    Open Resume Studio →
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="notion"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="card p-6 bg-bg border border-line font-mono text-xs"
              >
                <div className="flex justify-between items-center border-b border-line pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold font-sans">Your Auto-Created Notion Tracker</span>
                    <Badge tone="ok">Auto-Organized</Badge>
                  </div>
                  <Link href="/integrations" className="btn text-xs py-1 px-2.5">
                    Connect Your Notion →
                  </Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="label-xs border-b border-line">
                      <tr>
                        <th scope="col" className="py-2">Company Name</th>
                        <th scope="col">Position</th>
                        <th scope="col">Platform</th>
                        <th scope="col">Status</th>
                        <th scope="col">Match</th>
                        <th scope="col">Resume Format</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {[
                        { company: "Anthropic Labs", role: "Staff AI Engineer", platform: "LinkedIn", status: "APPLIED", match: "94%" },
                        { company: "FinTech Systems", role: "Senior Full Stack Lead", platform: "JobStreet", status: "READY TO REVIEW", match: "88%" },
                        { company: "CloudScale AI", role: "Backend Engineer", platform: "Indeed", status: "INTERVIEW", match: "91%" },
                      ].map((row, idx) => (
                        <motion.tr
                          key={row.company}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1, duration: 0.3 }}
                        >
                          <td className="py-2.5 font-bold">{row.company}</td>
                          <td>{row.role}</td>
                          <td><span className="text-ink font-semibold">{row.platform}</span></td>
                          <td><Badge tone={row.status === "READY TO REVIEW" ? "n" : "ok"}>{row.status}</Badge></td>
                          <td>{row.match}</td>
                          <td>APA 7th Edition</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Live Log Stream Strip with Smooth Animation */}
          <FadeIn delay={0.2} distance={16} className="mt-6 card p-3 bg-bg border border-line font-mono text-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-ink font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-black inline-block animate-pulse" />
                LIVE AGENT ACTIVITY:
              </span>
              <span className="text-muted">[{DEMO_LOGS[activeLogIndex].id}]</span>
              <motion.span
                key={activeLogIndex}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="text-ink font-medium"
              >
                {DEMO_LOGS[activeLogIndex].msg}
              </motion.span>
            </div>
            <span className="text-muted text-[11px]">{DEMO_LOGS[activeLogIndex].t}</span>
          </FadeIn>
        </div>
      </section>

      {/* The 6 Core Guarantees Grid with Staggered Scroll Motion */}
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

      {/* Simple 4-Step Process Section with Staggered Cascade Motion */}
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
            {/* Step 1 */}
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

            {/* Step 2 */}
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

            {/* Step 3 */}
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

            {/* Step 4 */}
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

          {/* Simple Takeaway Strip with Dynamic Looping Text */}
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

      {/* Call to Action with Entrance Motion */}
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
                <Link href="/onboarding" className="btn btn-primary text-base py-3 px-8 font-semibold shadow-sm">
                  Upload Your Resume & Start →
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

      {/* Footer with Subtle FadeIn Motion */}
      <footer className="border-t border-line py-12 bg-bg2/50 text-xs font-mono">
        <FadeIn distance={14}>
          <div className="max-w-6xl mx-auto px-6 flex flex-wrap justify-between items-center gap-6">
            <div>
              <BrandLogo size="sm" />
              <p className="text-muted text-[11px] mt-1">Your AI Job-Hunting Team · No Manual Applications Needed</p>
            </div>

            <div className="flex flex-wrap gap-6 text-muted">
              <Link href="/dashboard" className="hover:text-ink transition-colors">Dashboard</Link>
              <Link href="/profile" className="hover:text-ink transition-colors">Profile</Link>
              <Link href="/resume" className="hover:text-ink transition-colors">APA Resume</Link>
              <Link href="/agents" className="hover:text-ink transition-colors">1,000 Agents</Link>
              <Link href="/applications" className="hover:text-ink transition-colors">Applications</Link>
              <Link href="/integrations" className="hover:text-ink transition-colors">Notion</Link>
              <Link href="/settings" className="hover:text-ink transition-colors">Settings</Link>
            </div>

            <div className="flex items-center gap-2 text-muted text-[11px]">
              <span className="w-2 h-2 rounded-full bg-black inline-block animate-pulse" />
              <span>Private & Local AI First</span>
              <span>·</span>
              <span>GitHub: darknecrocities/itsLARP</span>
            </div>
          </div>
        </FadeIn>
      </footer>
    </div>
  );
}
