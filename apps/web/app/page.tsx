"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Reveal, Badge } from "@/components/ui";
import { HorizontalPipelineMap } from "@/components/HorizontalPipelineMap";

const DEMO_LOGS = [
  { t: "14:10:02", id: "bot_scrape_014", msg: "LinkedIn bot found 'Lead AI Engineer' @ Anthropic Labs matching your target salary" },
  { t: "14:10:05", id: "bot_scrape_089", msg: "JobStreet bot found 'Senior Full Stack Lead' @ FinTech Corp matching your skills" },
  { t: "14:10:07", id: "bot_analyst_04", msg: "Checked job requirements: Python, React, FastAPI, Docker (94% match)" },
  { t: "14:10:09", id: "bot_match_11", msg: "Match score computed: 94% · Fits your experience and preferences" },
  { t: "14:10:12", id: "bot_tailor_042", msg: "Created custom APA resume highlighting your real project experience" },
  { t: "14:10:15", id: "bot_apply_108", msg: "Filled application questions and staged application for your 1-tap review" },
  { t: "14:10:18", id: "bot_notion_01", msg: "Saved to your Notion tracker: Anthropic Labs · Ready to Review · 94% Match" },
];

const PRINCIPLES = [
  {
    num: "01",
    title: "100% Honest & Accurate",
    desc: "The bots strictly use your real experience. They never make things up, exaggerate, or invent fake skills.",
  },
  {
    num: "02",
    title: "Clean APA-Style Resumes",
    desc: "Resumes are generated in standard APA format with clean headings and links to your real projects that recruiters love.",
  },
  {
    num: "03",
    title: "300 Bots Searching For You",
    desc: "While you go about your day, 300 bots scan LinkedIn, JobStreet, and Indeed looking only for jobs you actually want.",
  },
  {
    num: "04",
    title: "A Custom Resume for Every Role",
    desc: "No more sending one generic resume everywhere. Each opening gets tailored bullet points that match the job description.",
  },
  {
    num: "05",
    title: "400 Bots Applying for You",
    desc: "400 bots do the boring form filling so you never have to re-enter your work history. You give final approval before submitting.",
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
  const [demoTab, setDemoTab] = useState<"pipeline" | "apa" | "notion">("pipeline");

  useEffect(() => {
    if (!simRunning) return;
    const timer = setInterval(() => {
      setActiveLogIndex((prev) => (prev + 1) % DEMO_LOGS.length);
    }, 2400);
    return () => clearInterval(timer);
  }, [simRunning]);

  return (
    <div className="min-h-screen bg-bg text-ink selection:bg-black selection:text-white">
      {/* Top Navigation Header */}
      <header className="border-b border-line bg-bg/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-display font-bold text-xl tracking-tight text-ink">
              itsLARP / HowToLarped
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-dmuted">
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
            <Link href="/onboarding" className="btn btn-primary text-xs py-1.5 px-4 font-semibold">
              Start Auto-Applying →
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative border-b border-line pt-20 pb-20 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.02] max-w-5xl">
              No Need to Manually Apply to Jobs Ever Again.
            </h1>
          </Reveal>

          <Reveal i={2}>
            <p className="text-dmuted text-lg sm:text-xl md:text-2xl mt-6 max-w-3xl leading-relaxed">
              No need to manually apply. Upload your resume, LinkedIn, or GitHub once. Your personal team of 1,000 bots searches for jobs you love, customizes your resume for each role, and applies for you—automatically.
            </p>
          </Reveal>

          <Reveal i={3} className="mt-8 flex flex-wrap gap-3">
            <Link href="/onboarding" className="btn btn-primary text-base py-3 px-6 font-semibold">
              Start Auto-Applying Now →
            </Link>
            <a href="#workforce-demo" className="btn text-base py-3 px-6">
              Watch Bots in Action
            </a>
            <Link href="/resume" className="btn text-base py-3 px-6">
              View Sample APA Resume
            </Link>
          </Reveal>

          {/* Simple Highlights Bar */}
          <Reveal i={4} className="mt-14 pt-8 border-t border-line grid grid-cols-2 sm:grid-cols-4 gap-6 font-mono text-xs">
            <div>
              <div className="label-xs text-muted">300 JOB FINDERS</div>
              <div className="font-display text-2xl sm:text-3xl font-bold mt-1 text-ink">300 Bots</div>
              <div className="text-xs text-muted mt-0.5">Searches LinkedIn & JobStreet 24/7</div>
            </div>
            <div>
              <div className="label-xs text-muted">300 RESUME MAKERS</div>
              <div className="font-display text-2xl sm:text-3xl font-bold mt-1 text-ink">300 Bots</div>
              <div className="text-xs text-muted mt-0.5">Custom APA resumes for every role</div>
            </div>
            <div>
              <div className="label-xs text-muted">400 AUTO-APPLIERS</div>
              <div className="font-display text-2xl sm:text-3xl font-bold mt-1 text-ink">400 Bots</div>
              <div className="text-xs text-muted mt-0.5">Fills forms & gets apps ready for you</div>
            </div>
            <div>
              <div className="label-xs text-muted">1-CLICK NOTION TRACKER</div>
              <div className="font-display text-2xl sm:text-3xl font-bold mt-1 text-ink">1 Click</div>
              <div className="text-xs text-muted mt-0.5">Saves company, title & status in a list</div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Live Interactive Workforce Demo Section */}
      <section id="workforce-demo" className="py-20 border-b border-line bg-bg2/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <div className="label-xs">LIVE DEMO</div>
              <h2 className="text-3xl font-bold mt-1">Watch 1,000 Bots Work For You in Real Time</h2>
              <p className="text-muted text-sm mt-1 max-w-xl">
                See how your bots find jobs, write tailored resumes, and prepare your applications. Click any circle in the network below to see what it does.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-xs font-mono">
              <button
                className={`btn text-xs ${simRunning ? "bg-black text-white" : ""}`}
                onClick={() => setSimRunning(!simRunning)}
              >
                {simRunning ? "⏸ Pause Demo" : "▶ Resume Demo"}
              </button>
              <button
                className={`btn text-xs ${demoTab === "pipeline" ? "bg-black text-white" : ""}`}
                onClick={() => setDemoTab("pipeline")}
              >
                Interactive Bot Network
              </button>
              <button
                className={`btn text-xs ${demoTab === "apa" ? "bg-black text-white" : ""}`}
                onClick={() => setDemoTab("apa")}
              >
                Sample APA Resume
              </button>
              <button
                className={`btn text-xs ${demoTab === "notion" ? "bg-black text-white" : ""}`}
                onClick={() => setDemoTab("notion")}
              >
                Notion Application List
              </button>
            </div>
          </div>

          {demoTab === "pipeline" ? (
            /* Interactive Bot Network Map Component */
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
          ) : demoTab === "apa" ? (
            /* APA 7th Format Interactive Demo */
            <div id="apa-format" className="card p-8 bg-white text-black border border-line shadow-lg font-serif max-w-3xl mx-auto">
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
            </div>
          ) : (
            /* Notion Mirror Demo */
            <div className="card p-6 bg-bg border border-line font-mono text-xs">
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
                    <tr>
                      <td className="py-2.5 font-bold">Anthropic Labs</td>
                      <td>Staff AI Engineer</td>
                      <td><span className="text-ink font-semibold">LinkedIn</span></td>
                      <td><Badge tone="ok">APPLIED</Badge></td>
                      <td>94%</td>
                      <td>APA 7th Edition</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-bold">FinTech Systems</td>
                      <td>Senior Full Stack Lead</td>
                      <td><span className="text-ink font-semibold">JobStreet</span></td>
                      <td><Badge tone="n">READY TO REVIEW</Badge></td>
                      <td>88%</td>
                      <td>APA 7th Edition</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-bold">CloudScale AI</td>
                      <td>Backend Engineer</td>
                      <td><span className="text-ink font-semibold">Indeed</span></td>
                      <td><Badge tone="ok">INTERVIEW</Badge></td>
                      <td>91%</td>
                      <td>APA 7th Edition</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Live Log Stream Strip */}
          <div className="mt-6 card p-3 bg-bg border border-line font-mono text-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-ink font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-black inline-block animate-pulse" />
                LIVE BOT ACTIVITY:
              </span>
              <span className="text-muted">[{DEMO_LOGS[activeLogIndex].id}]</span>
              <span className="text-ink font-medium">{DEMO_LOGS[activeLogIndex].msg}</span>
            </div>
            <span className="text-muted text-[11px]">{DEMO_LOGS[activeLogIndex].t}</span>
          </div>
        </div>
      </section>

      {/* The 6 Core Guarantees Grid */}
      <section id="principles" className="py-20 border-b border-line">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mb-12">
            <div className="label-xs">HOW IT WORKS FOR YOU</div>
            <h2 className="text-3xl font-bold mt-1 tracking-tight">6 Simple Rules That Keep You in Control</h2>
            <p className="text-muted text-sm mt-2">
              No complicated setup. No fake skills. Here is how our bots save you hours every single day.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PRINCIPLES.map((p) => (
              <div key={p.num} className="card p-6 bg-bg flex flex-col justify-between">
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
            ))}
          </div>
        </div>
      </section>

      {/* Simple 4-Step Process Section (Replaces complex architecture) */}
      <section id="architecture" className="py-20 border-b border-line bg-bg2/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mb-12">
            <div className="label-xs mb-2">HOW IT WORKS STEP-BY-STEP</div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">From Upload to Applied in 4 Simple Steps</h2>
            <p className="text-muted text-sm mt-2">
              No complicated technical setup. Here is how your job search happens automatically from start to finish.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="card p-6 bg-bg flex flex-col justify-between border-2 border-line hover:border-black transition-all">
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

            {/* Step 2 */}
            <div className="card p-6 bg-bg flex flex-col justify-between border-2 border-line hover:border-black transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 bg-black text-white rounded">
                    STEP 02
                  </span>
                  <span className="text-[11px] font-mono text-muted">300 Bots</span>
                </div>
                <h3 className="font-bold text-lg mb-2">Bots Search For You</h3>
                <p className="text-muted text-xs leading-relaxed">
                  300 bots browse LinkedIn, JobStreet, and Indeed around the clock, matching jobs based on your title, location, and salary goals.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-line text-[11px] font-mono text-ink font-semibold">
                ✓ Searches 24/7 on autopilot
              </div>
            </div>

            {/* Step 3 */}
            <div className="card p-6 bg-bg flex flex-col justify-between border-2 border-line hover:border-black transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 bg-black text-white rounded">
                    STEP 03
                  </span>
                  <span className="text-[11px] font-mono text-muted">300 Bots</span>
                </div>
                <h3 className="font-bold text-lg mb-2">Custom Resumes Made</h3>
                <p className="text-muted text-xs leading-relaxed">
                  For every single job opening found, 300 bots build an individualized, clean APA-format resume highlighting your relevant real-world work.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-line text-[11px] font-mono text-ink font-semibold">
                ✓ Zero made-up or fake skills
              </div>
            </div>

            {/* Step 4 */}
            <div className="card p-6 bg-bg flex flex-col justify-between border-2 border-line hover:border-black transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 bg-black text-white rounded">
                    STEP 04
                  </span>
                  <span className="text-[11px] font-mono text-muted">400 Bots</span>
                </div>
                <h3 className="font-bold text-lg mb-2">Applied & Tracked</h3>
                <p className="text-muted text-xs leading-relaxed">
                  400 bots fill out the repetitive application forms. You review with one tap, and every company is organized in your Notion tracker.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-line text-[11px] font-mono text-ink font-semibold">
                ✓ 1-Click Notion database sync
              </div>
            </div>
          </div>

          {/* Simple Takeaway Strip */}
          <div className="mt-8 card p-6 bg-bg border border-line flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
            <div className="flex items-center gap-3">
              <span className="text-xl">✨</span>
              <div>
                <strong className="text-ink text-sm font-sans block">The Bottom Line:</strong>
                <span className="text-muted font-sans text-xs">
                  No more copying and pasting job descriptions. No more re-entering your job history on 50 different career sites. Just your dream job, delivered on autopilot.
                </span>
              </div>
            </div>
            <Link href="/onboarding" className="btn btn-primary text-xs py-2 px-4">
              Get Started Now →
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 bg-bg">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="label-xs mb-3">READY TO START?</div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
            Stop Applying to Jobs Manually.
          </h2>
          <p className="text-dmuted text-base sm:text-lg mt-4 max-w-xl mx-auto leading-relaxed">
            Upload your resume once and let 1,000 bots do the hard work—finding matching roles, customizing resumes, and applying for you.
          </p>

          <div className="mt-8 flex justify-center gap-3">
            <Link href="/onboarding" className="btn btn-primary text-base py-3 px-8 font-semibold">
              Upload Your Resume & Start →
            </Link>
            <Link href="/agents" className="btn text-base py-3 px-6">
              Open Bot Console
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-line py-12 bg-bg2/50 text-xs font-mono">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap justify-between items-center gap-6">
          <div>
            <div className="font-display font-bold text-sm tracking-tight text-ink">
              itsLARP / HowToLarped
            </div>
            <p className="text-muted text-[11px] mt-0.5">Your AI Job-Hunting Team · No Manual Applications Needed</p>
          </div>

          <div className="flex flex-wrap gap-6 text-muted">
            <Link href="/dashboard" className="hover:text-ink">Dashboard</Link>
            <Link href="/profile" className="hover:text-ink">Profile</Link>
            <Link href="/resume" className="hover:text-ink">APA Resume</Link>
            <Link href="/agents" className="hover:text-ink">1,000 Bots</Link>
            <Link href="/applications" className="hover:text-ink">Applications</Link>
            <Link href="/integrations" className="hover:text-ink">Notion</Link>
            <Link href="/settings" className="hover:text-ink">Settings</Link>
          </div>

          <div className="flex items-center gap-2 text-muted text-[11px]">
            <span className="w-2 h-2 rounded-full bg-black inline-block animate-pulse" />
            <span>Private & Local AI First</span>
            <span>·</span>
            <span>GitHub: darknecrocities/itsLARP</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
