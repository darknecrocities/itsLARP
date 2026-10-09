"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Reveal, Badge } from "@/components/ui";

const LIVE_LOGS = [
  { t: "15:02:31", id: "agent_0192", msg: "Discovered AI Engineer @ DeepMind Innovations (Greenhouse)" },
  { t: "15:02:34", id: "agent_0291", msg: "Match compatibility score: 94% · Technical overlap: Python, PyTorch, RAG" },
  { t: "15:02:37", id: "agent_0291", msg: "Retrieved candidate evidence from GitHub: Autonomous Multi-Agent System" },
  { t: "15:02:40", id: "agent_0412", msg: "Resume tailored · 3 proposed changes backed by verified source evidence" },
  { t: "15:02:43", id: "agent_0518", msg: "Application questions auto-filled · Cover letter generated" },
  { t: "15:02:45", id: "agent_0884", msg: "Evidence claim verification: 100% PASSED · Zero hallucinated metrics" },
  { t: "15:02:48", id: "agent_0991", msg: "Application package staged · Awaiting user approval to submit" },
];

const PRINCIPLES = [
  {
    num: "01",
    title: "One Source of Truth",
    desc: "Your actual experience lives strictly inside your Career DNA profile. The AI workforce cannot randomly invent, exaggerate, or assume experience.",
  },
  {
    num: "02",
    title: "Every Application is Unique",
    desc: "There is one Master Resume, but potentially hundreds of tailored, immutable versions generated specifically for individual company requirements.",
  },
  {
    num: "03",
    title: "Evidence Before Generation",
    desc: "Every single claim must trace directly to an underlying source: GitHub repo, project document, or verified resume. Claim → Evidence → AI generation.",
  },
  {
    num: "04",
    title: "Agents are Workers",
    desc: "We do not create 1,000 independent personalities. HowToLarped architects a high-throughput, task-based workforce executing specialized jobs in parallel.",
  },
  {
    num: "05",
    title: "Human Approval Gate",
    desc: "AI prepares the entire package (resume, letter, form answers), but the candidate retains final approval authority before any submission.",
  },
  {
    num: "06",
    title: "Local AI First",
    desc: "Ollama is a first-class provider. Run state-of-the-art models like Qwen 2.5, Gemma, and Llama locally with zero third-party API costs and complete data privacy.",
  },
];

export default function LandingPage() {
  const [activeLogIndex, setActiveLogIndex] = useState(LIVE_LOGS.length - 1);
  const [activeResumeTab, setActiveResumeTab] = useState<"comparison" | "verification">("comparison");

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveLogIndex((prev) => (prev + 1) % LIVE_LOGS.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-bg text-ink selection:bg-black selection:text-white">
      {/* Top Navigation */}
      <header className="border-b border-line bg-bg/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-display font-bold text-xl tracking-tight text-ink">
              HowToLarped
            </Link>
            <span className="hidden sm:inline-block text-[11px] font-mono px-2 py-0.5 bg-bg2 border border-line rounded text-muted">
              OS v1.0
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-dmuted">
            <a href="#philosophy" className="hover:text-ink transition-colors">Philosophy</a>
            <a href="#principles" className="hover:text-ink transition-colors">Principles</a>
            <a href="#architecture" className="hover:text-ink transition-colors">Architecture</a>
            <a href="#workforce" className="hover:text-ink transition-colors">Workforce</a>
            <Link href="/jobs" className="hover:text-ink transition-colors">Live Jobs</Link>
          </nav>

          <div className="flex items-center gap-2.5">
            <Link href="/login" className="btn text-xs py-1.5 px-3">
              Sign In
            </Link>
            <Link href="/onboarding" className="btn btn-primary text-xs py-1.5 px-4 font-semibold">
              Build Career DNA →
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative border-b border-line pt-20 pb-24 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-bg2 border border-line rounded text-xs font-mono mb-6 text-dmuted">
              <span className="w-2 h-2 rounded-full bg-ok inline-block animate-pulse" />
              <span>CAREER OPERATING SYSTEM</span>
              <span className="text-muted">·</span>
              <span>LOCAL AI FIRST (OLLAMA READY)</span>
            </div>
          </Reveal>

          <Reveal i={1}>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.02] max-w-5xl">
              Your AI Job-Hunting Workforce.
            </h1>
          </Reveal>

          <Reveal i={2}>
            <p className="text-dmuted text-lg sm:text-xl md:text-2xl mt-6 max-w-3xl leading-relaxed">
              Upload your career once. Deploy specialized AI workers to discover opportunities, understand job requirements, score compatibility, tailor evidence-backed applications, and track your entire search.
            </p>
          </Reveal>

          <Reveal i={3} className="mt-8 flex flex-wrap gap-3">
            <Link href="/onboarding" className="btn btn-primary text-base py-3 px-6 font-semibold">
              Build Your Career DNA →
            </Link>
            <Link href="/agents" className="btn text-base py-3 px-6">
              Deploy 1,000 Workers
            </Link>
            <Link href="/jobs" className="btn text-base py-3 px-6">
              Explore Discovered Jobs
            </Link>
          </Reveal>

          {/* Telemetry metrics bar */}
          <Reveal i={4} className="mt-14 pt-8 border-t border-line grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div>
              <div className="label-xs text-muted">Specialized Workers</div>
              <div className="font-display text-2xl sm:text-3xl font-bold mt-1 text-ink">1,024</div>
              <div className="text-xs text-muted mt-0.5">Task-oriented pool</div>
            </div>
            <div>
              <div className="label-xs text-muted">Hallucination Tolerance</div>
              <div className="font-display text-2xl sm:text-3xl font-bold mt-1 text-ink">0.0%</div>
              <div className="text-xs text-muted mt-0.5">Blocked without evidence</div>
            </div>
            <div>
              <div className="label-xs text-muted">Source of Truth</div>
              <div className="font-display text-2xl sm:text-3xl font-bold mt-1 text-ink">1 Profile</div>
              <div className="text-xs text-muted mt-0.5">Yields N tailored versions</div>
            </div>
            <div>
              <div className="label-xs text-muted">Local Model Provider</div>
              <div className="font-display text-2xl sm:text-3xl font-bold mt-1 text-ink">Ollama</div>
              <div className="text-xs text-muted mt-0.5">First-class citizen</div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Interactive Workforce Terminal Simulation */}
      <section id="workforce" className="py-20 border-b border-line bg-bg2/40">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <div className="label-xs">MODULE 06 — SIGNATURE WORKFORCE</div>
              <h2 className="text-3xl font-bold mt-1">Live Agent Workforce Console</h2>
              <p className="text-muted text-sm mt-1 max-w-xl">
                1,000 concurrent agent workers executing specialized discovery, analysis, matching, tailoring, and verification tasks in parallel.
              </p>
            </div>
            <Link href="/agents" className="btn btn-primary text-xs">
              Open Full Agent Console →
            </Link>
          </div>

          <div className="card border border-line bg-bg shadow-sm overflow-hidden font-mono">
            {/* Terminal Top bar */}
            <div className="flex flex-wrap items-center justify-between border-b border-line px-5 py-3 bg-bg2 text-xs">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 font-semibold text-ink">
                  <span className="w-2 h-2 rounded-full bg-ok inline-block animate-pulse" />
                  WORKFORCE ACTIVE · 1,024 WORKERS
                </span>
                <span className="text-muted">|</span>
                <span className="text-dmuted">STAGE: MULTI-QUEUE ORCHESTRATION</span>
              </div>
              <div className="flex items-center gap-4 text-muted text-[11px]">
                <span>ACTIVE: <strong className="text-ink">317</strong></span>
                <span>QUEUED: <strong className="text-ink">492</strong></span>
                <span>COMPLETED: <strong className="text-ink">18,293</strong></span>
                <span>BLOCKED: <strong className="text-ink">0</strong></span>
              </div>
            </div>

            {/* Stages distribution row */}
            <div className="grid grid-cols-2 sm:grid-cols-5 border-b border-line text-xs divide-x divide-line bg-bg">
              <div className="p-3">
                <div className="label-xs text-muted">DISCOVERY</div>
                <div className="font-semibold text-base mt-1">182 Workers</div>
                <div className="text-[10px] text-muted">Public feeds & APIs</div>
              </div>
              <div className="p-3">
                <div className="label-xs text-muted">ANALYSIS</div>
                <div className="font-semibold text-base mt-1">74 Workers</div>
                <div className="text-[10px] text-muted">Skill & year extraction</div>
              </div>
              <div className="p-3">
                <div className="label-xs text-muted">MATCHING</div>
                <div className="font-semibold text-base mt-1">31 Workers</div>
                <div className="text-[10px] text-muted">6-factor deterministic</div>
              </div>
              <div className="p-3">
                <div className="label-xs text-muted">RESUMES</div>
                <div className="font-semibold text-base mt-1">18 Workers</div>
                <div className="text-[10px] text-muted">Evidence synthesis</div>
              </div>
              <div className="p-3">
                <div className="label-xs text-muted">APPLICATIONS</div>
                <div className="font-semibold text-base mt-1">12 Workers</div>
                <div className="text-[10px] text-muted">Form answers & cover</div>
              </div>
            </div>

            {/* Live stream logs */}
            <div className="p-4 space-y-2 bg-bg text-xs max-h-72 overflow-y-auto">
              {LIVE_LOGS.map((log, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 py-1 px-2 rounded transition-colors ${
                    i === activeLogIndex ? "bg-bg2 border border-line" : "text-muted"
                  }`}
                >
                  <span className="text-muted shrink-0">{log.t}</span>
                  <span className="text-fg font-semibold shrink-0">[{log.id}]</span>
                  <span className={i === activeLogIndex ? "text-ink font-medium" : "text-dmuted"}>
                    {log.msg}
                  </span>
                </div>
              ))}
            </div>

            {/* Terminal bottom notice */}
            <div className="px-5 py-2.5 border-t border-line bg-bg2 text-[11px] text-muted flex justify-between items-center">
              <span>Safety Rule: Tasks stop at "Ready for Review". Submission requires your approval.</span>
              <span className="font-semibold text-ink">Zero Hallucinations Verified</span>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy & Architecture Section */}
      <section id="philosophy" className="py-20 border-b border-line">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-3xl mb-14">
            <div className="label-xs">PRODUCT PHILOSOPHY</div>
            <h2 className="text-3xl sm:text-4xl font-bold mt-2 tracking-tight">
              An Operating System for Your Job Search.
            </h2>
            <p className="text-dmuted text-lg mt-4 leading-relaxed">
              HowToLarped is not "ChatGPT but for resumes." You maintain your career information once inside the Career DNA Profile. Everything else—tailored resumes, cover letters, application answers, match scores, and status events—is generated from that verified source of truth.
            </p>
          </div>

          {/* Typographic Core Diagram */}
          <div id="architecture" className="card p-8 bg-bg2/40 border border-line mb-14 font-mono">
            <div className="label-xs mb-4">SYSTEM ARCHITECTURE PIPELINE</div>
            <div className="p-6 bg-bg border border-line rounded text-xs leading-relaxed overflow-x-auto">
              <pre className="text-ink">
{`                YOUR CAREER (Resume, GitHub, Portfolio, LinkedIn)
                     │
                     ▼
             CAREER DNA PROFILE (Verifiable Source of Truth)
                     │
                     ▼
             AI AGENT WORKFORCE (1,000 Concurrent Task Workers)
                     │
       ┌─────────────┼─────────────┐
       ▼             ▼             ▼
   DISCOVERY     TAILORING      TRACKING
    AGENTS        AGENTS         AGENTS
       │             │             │
       └─────────────┼─────────────┘
                     ▼
             EVIDENCE VERIFICATION (Anti-Hallucination Gate)
                     │
                     ▼
             HUMAN APPROVAL GATE (You Review & Submit)
                     │
                     ▼
             APPLICATION TRACKER & NOTION MIRROR`}
              </pre>
            </div>
          </div>

          {/* Before vs After comparison */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card p-6 border-line bg-bg">
              <div className="label-xs text-err mb-2 font-semibold">THE OLD, EXHAUSTING WAY</div>
              <h3 className="text-lg font-semibold mb-3">Manual Context Switching</h3>
              <p className="text-xs text-muted leading-relaxed mb-4">
                What job seekers do every day when applying across multiple portals:
              </p>
              <div className="space-y-2 text-xs font-mono text-dmuted">
                <div className="p-2 bg-bg2 rounded border border-line">1. LinkedIn → JobStreet → Indeed → Company Sites</div>
                <div className="p-2 bg-bg2 rounded border border-line">2. Copy & paste job description</div>
                <div className="p-2 bg-bg2 rounded border border-line">3. Open ChatGPT and prompt rewrite</div>
                <div className="p-2 bg-bg2 rounded border border-line">4. Manually check for invented claims & lies</div>
                <div className="p-2 bg-bg2 rounded border border-line">5. Write cover letter from scratch</div>
                <div className="p-2 bg-bg2 rounded border border-line">6. Manually copy rows into Google Sheets</div>
              </div>
            </div>

            <div className="card p-6 border-2 border-black bg-bg">
              <div className="label-xs text-ok mb-2 font-semibold">THE HOWTOLARPED WAY</div>
              <h3 className="text-lg font-semibold mb-3">Unified Career Operating System</h3>
              <p className="text-xs text-muted leading-relaxed mb-4">
                HowToLarped turns the entire pipeline into one automated, evidence-backed loop:
              </p>
              <div className="space-y-2 text-xs font-mono">
                <div className="p-2 bg-black text-white rounded">✓ Upload Career Once → Generates structured Career DNA</div>
                <div className="p-2 bg-bg2 rounded border border-line">✓ 1,000 AI Workers discover & score jobs against your skills</div>
                <div className="p-2 bg-bg2 rounded border border-line">✓ Deterministic formula ranks opportunities (Skills 35%, Exp 25%)</div>
                <div className="p-2 bg-bg2 rounded border border-line">✓ Evidence engine ensures zero hallucinated experience</div>
                <div className="p-2 bg-bg2 rounded border border-line">✓ You review and press Approve</div>
                <div className="p-2 bg-bg2 rounded border border-line">✓ Status syncs automatically to PostgreSQL & Notion</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6 Core Principles Grid */}
      <section id="principles" className="py-20 border-b border-line bg-bg2/40">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mb-12">
            <div className="label-xs">CORE FOUNDATION</div>
            <h2 className="text-3xl font-bold mt-1 tracking-tight">The 6 Core Principles</h2>
            <p className="text-muted text-sm mt-2">
              Non-negotiable architectural rules governing every agent worker in the platform.
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
                  <span>Principle Rule</span>
                  <span className="text-ink font-semibold">Strict</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Resume Studio Interactive Diff Showcase */}
      <section id="studio" className="py-20 border-b border-line">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <div className="label-xs">MODULE 03 — RESUME STUDIO</div>
              <h2 className="text-3xl font-bold mt-1">Evidence-Backed Resume Tailoring</h2>
              <p className="text-muted text-sm mt-1 max-w-xl">
                Every change includes the original text, proposed revision, technical rationale, underlying evidence citation, and an accept/reject boundary.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                className={`btn text-xs ${activeResumeTab === "comparison" ? "bg-black text-white" : ""}`}
                onClick={() => setActiveResumeTab("comparison")}
              >
                Change Comparison
              </button>
              <button
                className={`btn text-xs ${activeResumeTab === "verification" ? "bg-black text-white" : ""}`}
                onClick={() => setActiveResumeTab("verification")}
              >
                Anti-Hallucination Audit
              </button>
            </div>
          </div>

          {activeResumeTab === "comparison" ? (
            <div className="space-y-4">
              <div className="card p-5 bg-bg">
                <div className="flex justify-between items-center mb-2">
                  <span className="label-xs">SECTION: PROFESSIONAL SUMMARY</span>
                  <Badge tone="ok">PROPOSED CHANGE</Badge>
                </div>
                <div className="grid md:grid-cols-2 gap-4 mt-2">
                  <div className="p-3 bg-bg2 rounded border border-line">
                    <div className="label-xs text-muted mb-1">Master Resume (Original)</div>
                    <p className="text-dmuted text-xs">Software Developer with experience in web applications.</p>
                  </div>
                  <div className="p-3 bg-ok/5 rounded border border-ok/30">
                    <div className="label-xs text-ok mb-1">Tailored for AI Engineer Role</div>
                    <p className="text-ink text-xs font-medium">
                      AI Systems Engineer with 4 years of experience specializing in Python, FastAPI, PyTorch, and RAG architectures.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap justify-between items-center text-xs text-muted mt-3 pt-2 border-t border-line">
                  <span>Rationale: Emphasizes required skills for role · <strong className="text-ink font-semibold">Evidence:</strong> Career DNA verified identity & skills</span>
                  <div className="flex gap-2">
                    <button className="btn text-xs py-0.5 px-2 bg-black text-white">Accept</button>
                    <button className="btn text-xs py-0.5 px-2">Reject</button>
                  </div>
                </div>
              </div>

              <div className="card p-5 bg-bg">
                <div className="flex justify-between items-center mb-2">
                  <span className="label-xs">SECTION: FEATURED PROJECTS</span>
                  <Badge tone="ok">PROPOSED CHANGE</Badge>
                </div>
                <div className="grid md:grid-cols-2 gap-4 mt-2">
                  <div className="p-3 bg-bg2 rounded border border-line">
                    <div className="label-xs text-muted mb-1">Master Resume (Original)</div>
                    <p className="text-dmuted text-xs">Autonomous Agent System: Built background workers.</p>
                  </div>
                  <div className="p-3 bg-ok/5 rounded border border-ok/30">
                    <div className="label-xs text-ok mb-1">Tailored for AI Engineer Role</div>
                    <p className="text-ink text-xs font-medium">
                      Autonomous Multi-Agent System [Python, PyTorch, FastAPI, Redis]: Engineered high-throughput distributed task queue supporting 1,000 workers.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap justify-between items-center text-xs text-muted mt-3 pt-2 border-t border-line">
                  <span>Rationale: Highlights exact stack from job requirements · <strong className="text-ink font-semibold">Evidence:</strong> GitHub Repo: arronkianparejas/itsLarper</span>
                  <div className="flex gap-2">
                    <button className="btn text-xs py-0.5 px-2 bg-black text-white">Accept</button>
                    <button className="btn text-xs py-0.5 px-2">Reject</button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card p-6 bg-bg">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-semibold text-base">Claim Verification Checklist</h3>
                  <p className="text-xs text-muted">Every sentence is checked against your evidence corpus before application approval.</p>
                </div>
                <Badge tone="ok">VERIFICATION PASSED · ZERO INVENTIONS</Badge>
              </div>

              <table className="w-full text-left text-xs font-mono">
                <thead className="label-xs border-b border-line">
                  <tr>
                    <th scope="col" className="py-2">Generated Statement / Metric</th>
                    <th scope="col">Underlying Evidence Source</th>
                    <th scope="col">Confidence</th>
                    <th scope="col">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  <tr>
                    <td className="py-2.5">"4 years experience in Python and FastAPI"</td>
                    <td className="text-muted">Master Resume (2022-2026 roles)</td>
                    <td>100%</td>
                    <td><Badge tone="ok">VERIFIED</Badge></td>
                  </tr>
                  <tr>
                    <td className="py-2.5">"Engineered Autonomous Multi-Agent task queue"</td>
                    <td className="text-muted">GitHub repository README</td>
                    <td>94%</td>
                    <td><Badge tone="ok">VERIFIED</Badge></td>
                  </tr>
                  <tr>
                    <td className="py-2.5">"Implemented RAG embedding pipeline"</td>
                    <td className="text-muted">Portfolio project documentation</td>
                    <td>91%</td>
                    <td><Badge tone="ok">VERIFIED</Badge></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Target Personas */}
      <section className="py-20 border-b border-line bg-bg2/40">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mb-12">
            <div className="label-xs">TARGET CANDIDATES</div>
            <h2 className="text-3xl font-bold mt-1 tracking-tight">Built for People Applying at Scale</h2>
            <p className="text-muted text-sm mt-2">
              If your current workflow involves copying job descriptions into ChatGPT and managing spreadsheets, HowToLarped is for you.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card p-5 bg-bg">
              <h3 className="font-semibold text-sm">Graduates & Students</h3>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Applying to dozens of entry-level positions where standard resumes get filtered out.
              </p>
            </div>
            <div className="card p-5 bg-bg">
              <h3 className="font-semibold text-sm">AI & ML Engineers</h3>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Highlighting specialized frameworks (PyTorch, RAG, CUDA, Ollama) mapped to requirements.
              </p>
            </div>
            <div className="card p-5 bg-bg">
              <h3 className="font-semibold text-sm">Software Developers</h3>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Translating full-stack GitHub repositories into evidence-backed tailored versions.
              </p>
            </div>
            <div className="card p-5 bg-bg">
              <h3 className="font-semibold text-sm">Career Switchers</h3>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Demonstrating transferable technical skills with verifiable project proof.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-24 bg-bg">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="label-xs mb-3">GET STARTED TODAY</div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
            Stop Copying Job Descriptions.
          </h2>
          <p className="text-dmuted text-base sm:text-lg mt-4 max-w-xl mx-auto leading-relaxed">
            Upload your career once. Deploy 1,000 specialized agent workers to find matches, tailor evidence-backed applications, and track your search.
          </p>

          <div className="mt-8 flex justify-center gap-3">
            <Link href="/onboarding" className="btn btn-primary text-base py-3 px-8 font-semibold">
              Build Your Career DNA →
            </Link>
            <Link href="/jobs" className="btn text-base py-3 px-6">
              Browse Jobs
            </Link>
          </div>
        </div>
      </section>

      {/* Minimalist Footer */}
      <footer className="border-t border-line py-12 bg-bg2/50 text-xs font-mono">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap justify-between items-center gap-6">
          <div>
            <div className="font-display font-bold text-sm tracking-tight text-ink">
              HowToLarped
            </div>
            <p className="text-muted text-[11px] mt-0.5">Your AI Job-Hunting Workforce & Career Operating System</p>
          </div>

          <div className="flex flex-wrap gap-6 text-muted">
            <Link href="/dashboard" className="hover:text-ink">Dashboard</Link>
            <Link href="/profile" className="hover:text-ink">Career DNA</Link>
            <Link href="/jobs" className="hover:text-ink">Jobs</Link>
            <Link href="/resume" className="hover:text-ink">Resume Studio</Link>
            <Link href="/agents" className="hover:text-ink">Agents</Link>
            <Link href="/applications" className="hover:text-ink">Applications</Link>
            <Link href="/settings" className="hover:text-ink">Settings</Link>
          </div>

          <div className="flex items-center gap-2 text-muted text-[11px]">
            <span className="w-2 h-2 rounded-full bg-ok inline-block animate-pulse" />
            <span>Local AI Ready</span>
            <span>·</span>
            <span>PostgreSQL Source of Truth</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
