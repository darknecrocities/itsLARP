"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Reveal, Badge } from "@/components/ui";
import { HorizontalPipelineMap } from "@/components/HorizontalPipelineMap";

const DEMO_LOGS = [
  { t: "14:10:02", id: "bot_scrape_014", msg: "LinkedIn crawler matched 'Staff AI Engineer' @ Anthropic Labs (Remote)" },
  { t: "14:10:05", id: "bot_scrape_089", msg: "JobStreet crawler ingested 'Senior Full Stack Lead' @ FinTech Corp" },
  { t: "14:10:07", id: "bot_analyst_04", msg: "Local LLM extracted requirements: Python, PyTorch, RAG, FastAPI, Docker" },
  { t: "14:10:09", id: "bot_match_11", msg: "Compatibility score computed: 94% · Technical overlap verified" },
  { t: "14:10:12", id: "bot_tailor_042", msg: "Tailoring resume in APA 7th Edition format with verifiable project citations" },
  { t: "14:10:15", id: "bot_apply_108", msg: "Independent apply worker auto-filled questions & staged application for human gate" },
  { t: "14:10:18", id: "bot_notion_01", msg: "Notion list auto-created & row mirrored: Anthropic Labs · APPLIED · 94% Match" },
];

const PRINCIPLES = [
  {
    num: "01",
    title: "One Source of Truth",
    desc: "Your actual experience lives strictly inside your Career DNA profile. The AI workforce cannot randomly invent, exaggerate, or assume unverified skills.",
  },
  {
    num: "02",
    title: "APA 7th Edition Resumes",
    desc: "Download clean, standardized APA formatted resumes with running heads, formal title blocks, academic credentials, and software artifact citations.",
  },
  {
    num: "03",
    title: "300 Parallel Crawlers",
    desc: "300 lightweight bots crawl LinkedIn, JobStreet, Indeed, and major job boards according to your preferences with session login and 2FA prompt support.",
  },
  {
    num: "04",
    title: "300 Local LLM Tailors",
    desc: "300 tailoring bots use local Ollama models (Qwen, Llama, Gemma) to customize resumes and cover letters with strict anti-hallucination verification.",
  },
  {
    num: "05",
    title: "400 Independent Appliers",
    desc: "400 application bots independently fill form questions, stage submission packages, and halt at the human approval safety boundary.",
  },
  {
    num: "06",
    title: "1-Click Notion Auto-List",
    desc: "A single click connects Notion and self-creates a structured database containing Company Name, Position, Platform, Status, Match Score, and dates.",
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
            <span className="hidden sm:inline-block text-[11px] font-mono px-2 py-0.5 bg-bg2 border border-line rounded text-muted">
              Workforce v2.0
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-dmuted">
            <a href="#workforce-demo" className="hover:text-ink transition-colors">Bot Workforce Demo</a>
            <a href="#apa-format" className="hover:text-ink transition-colors">APA Resume</a>
            <a href="#principles" className="hover:text-ink transition-colors">Principles</a>
            <a href="#architecture" className="hover:text-ink transition-colors">Pipeline</a>
            <Link href="/jobs" className="hover:text-ink transition-colors">Live Jobs</Link>
          </nav>

          <div className="flex items-center gap-2.5">
            <Link href="/login" className="btn text-xs py-1.5 px-3">
              Sign In
            </Link>
            <Link href="/onboarding" className="btn btn-primary text-xs py-1.5 px-4 font-semibold">
              Upload Resume & DNA →
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative border-b border-line pt-20 pb-20 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-bg2 border border-line rounded text-xs font-mono mb-6 text-dmuted">
              <span className="w-2 h-2 rounded-full bg-ok inline-block animate-pulse" />
              <span>1,000 PARALLEL BOTS ACTIVE</span>
              <span className="text-muted">·</span>
              <span>LOCAL LLM (OLLAMA) FIRST</span>
              <span className="text-muted">·</span>
              <span>APA 7TH FORMAT ENGINE</span>
            </div>
          </Reveal>

          <Reveal i={1}>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.02] max-w-5xl">
              Your AI Job-Hunting Workforce.
            </h1>
          </Reveal>

          <Reveal i={2}>
            <p className="text-dmuted text-lg sm:text-xl md:text-2xl mt-6 max-w-3xl leading-relaxed">
              Upload your resume, GitHub, and LinkedIn once. Our Local LLM creates your candidate profile, downloads it in APA format, and deploys <strong>300 crawler bots</strong> across LinkedIn and JobStreet, <strong>300 resume tailoring bots</strong>, and <strong>400 independent application bots</strong> in parallel.
            </p>
          </Reveal>

          <Reveal i={3} className="mt-8 flex flex-wrap gap-3">
            <Link href="/onboarding" className="btn btn-primary text-base py-3 px-6 font-semibold">
              Upload Career & Synthesize DNA →
            </Link>
            <Link href="/agents" className="btn text-base py-3 px-6">
              Launch 1,000 Bots Swarm
            </Link>
            <Link href="/resume" className="btn text-base py-3 px-6">
              View APA Resume Studio
            </Link>
          </Reveal>

          {/* Telemetry Metrics Bar */}
          <Reveal i={4} className="mt-14 pt-8 border-t border-line grid grid-cols-2 sm:grid-cols-4 gap-6 font-mono text-xs">
            <div>
              <div className="label-xs text-muted">PARALLEL CRAWLERS</div>
              <div className="font-display text-2xl sm:text-3xl font-bold mt-1 text-ink">300 Bots</div>
              <div className="text-xs text-muted mt-0.5">LinkedIn, JobStreet, Indeed</div>
            </div>
            <div>
              <div className="label-xs text-muted">LOCAL LLM TAILORS</div>
              <div className="font-display text-2xl sm:text-3xl font-bold mt-1 text-ink">300 Bots</div>
              <div className="text-xs text-muted mt-0.5">APA format · 0% Hallucinations</div>
            </div>
            <div>
              <div className="label-xs text-muted">INDEPENDENT APPLIERS</div>
              <div className="font-display text-2xl sm:text-3xl font-bold mt-1 text-ink">400 Bots</div>
              <div className="text-xs text-muted mt-0.5">Form auto-fill & staged review</div>
            </div>
            <div>
              <div className="label-xs text-muted">NOTION AUTO-SYNC</div>
              <div className="font-display text-2xl sm:text-3xl font-bold mt-1 text-ink">1 Click</div>
              <div className="text-xs text-muted mt-0.5">Self-creates database & rows</div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Live Interactive Workforce Demo Section */}
      <section id="workforce-demo" className="py-20 border-b border-line bg-bg2/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <div className="label-xs">INTERACTIVE LIVE DEMO</div>
              <h2 className="text-3xl font-bold mt-1">Real Demo of Bots Visualizing Their Work</h2>
              <p className="text-muted text-sm mt-1 max-w-xl">
                Watch 1,000 lightweight bots operating concurrently. Click on any node or bot card to inspect its telemetry, CPU/memory usage, and streaming logs.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-xs font-mono">
              <button
                className={`btn text-xs ${simRunning ? "bg-black text-white" : ""}`}
                onClick={() => setSimRunning(!simRunning)}
              >
                {simRunning ? "⏸ Pause Simulation" : "▶ Resume Simulation"}
              </button>
              <button
                className={`btn text-xs ${demoTab === "pipeline" ? "bg-black text-white" : ""}`}
                onClick={() => setDemoTab("pipeline")}
              >
                Horizontal Pipeline
              </button>
              <button
                className={`btn text-xs ${demoTab === "apa" ? "bg-black text-white" : ""}`}
                onClick={() => setDemoTab("apa")}
              >
                APA Resume Output
              </button>
              <button
                className={`btn text-xs ${demoTab === "notion" ? "bg-black text-white" : ""}`}
                onClick={() => setDemoTab("notion")}
              >
                Notion Mirror
              </button>
            </div>
          </div>

          {demoTab === "pipeline" ? (
            /* Real Horizontal Pipeline Map Component with Inspector */
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
            <div className="card p-8 bg-white text-black border border-line shadow-lg font-serif max-w-3xl mx-auto">
              <div className="flex justify-between items-center text-xs text-neutral-500 font-mono border-b border-neutral-300 pb-2 mb-6">
                <span>RUNNING HEAD: DOE / CURRICULUM VITAE</span>
                <span>Page 1</span>
              </div>
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold">Jane Doe</h3>
                <div className="text-sm italic text-neutral-700 mt-0.5">Senior AI Systems Engineer</div>
                <div className="text-xs text-neutral-500 font-mono mt-1">
                  jane@example.com | San Francisco, CA | github.com/janedoe
                </div>
              </div>
              <div className="mb-4">
                <h4 className="text-center font-bold text-xs uppercase border-b border-black pb-1 mb-2 tracking-wider">
                  Professional Abstract
                </h4>
                <p className="text-xs text-neutral-800 leading-relaxed indent-6">
                  Empirical practitioner with 4+ years architecting autonomous multi-agent swarms, distributed task queues, and retrieval-augmented intelligence. Specialized in Python, PyTorch, FastAPI, and Local LLM inference.
                </p>
              </div>
              <div className="mb-4">
                <h4 className="text-center font-bold text-xs uppercase border-b border-black pb-1 mb-2 tracking-wider">
                  Software Artifacts (APA 7th Format)
                </h4>
                <p className="text-xs leading-snug pl-4 -indent-4">
                  <strong>Doe, J.</strong> (2026). <em>Autonomous Multi-Agent Workforce</em> [Computer software / Python, Redis, FastAPI].
                </p>
                <p className="text-[11px] text-neutral-600 pl-4 mt-0.5">
                  High-throughput distributed task runner coordinating 1,000 parallel workers with 0% hallucination guarantees.
                </p>
              </div>
              <div className="pt-4 border-t border-neutral-300 flex justify-between items-center text-xs font-mono">
                <span className="text-neutral-500">APA 7th Edition Output</span>
                <Link href="/resume" className="btn text-xs py-1 px-3 bg-black text-white">
                  Open APA Resume Studio →
                </Link>
              </div>
            </div>
          ) : (
            /* Notion Mirror Demo */
            <div className="card p-6 bg-bg border border-line font-mono text-xs">
              <div className="flex justify-between items-center border-b border-line pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold font-sans">Notion Database Mirror</span>
                  <Badge tone="ok">Auto-Created List</Badge>
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
                      <td><span className="text-blue-600 font-semibold">LinkedIn</span></td>
                      <td><Badge tone="ok">APPLIED</Badge></td>
                      <td>94%</td>
                      <td>APA 7th Edition</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-bold">FinTech Systems</td>
                      <td>Senior Full Stack Lead</td>
                      <td><span className="text-purple-600 font-semibold">JobStreet</span></td>
                      <td><Badge tone="n">SCREENING</Badge></td>
                      <td>88%</td>
                      <td>APA 7th Edition</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 font-bold">CloudScale AI</td>
                      <td>Backend Platform Engineer</td>
                      <td><span className="text-green-600 font-semibold">Indeed</span></td>
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
              <span className="text-ok font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-ok inline-block animate-pulse" />
                LIVE WORKFORCE FEED:
              </span>
              <span className="text-muted">[{DEMO_LOGS[activeLogIndex].id}]</span>
              <span className="text-ink font-medium">{DEMO_LOGS[activeLogIndex].msg}</span>
            </div>
            <span className="text-muted text-[11px]">{DEMO_LOGS[activeLogIndex].t}</span>
          </div>
        </div>
      </section>

      {/* The 6 Core Principles Grid */}
      <section id="principles" className="py-20 border-b border-line">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mb-12">
            <div className="label-xs">FOUNDATION PRINCIPLES</div>
            <h2 className="text-3xl font-bold mt-1 tracking-tight">How the Workforce Works</h2>
            <p className="text-muted text-sm mt-2">
              Rigid architectural safety rules powering 1,000 parallel agents across the entire job search lifecycle.
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
                  <span>Safety Rule</span>
                  <span className="text-ink font-semibold">Enforced</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* System Pipeline Architecture Diagram */}
      <section id="architecture" className="py-20 border-b border-line bg-bg2/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="label-xs mb-2">END-TO-END PIPELINE</div>
          <h2 className="text-3xl font-bold tracking-tight mb-8">Full System Architecture</h2>

          <div className="card p-6 bg-bg border border-line font-mono text-xs leading-relaxed overflow-x-auto">
            <pre className="text-ink">
{`                YOUR CAREER (Resume Upload, GitHub, LinkedIn)
                     │
                     ▼
          LOCAL LLM EXTRACTION & APA FORMAT COMPILER
                     │
                     ▼
             CAREER DNA PROFILE (Verifiable Source of Truth)
                     │
                     ▼
             PARALLEL BOT SWARM (1,000 Concurrent Task Workers)
                     │
        ┌────────────┼──────────────────────────┐
        ▼            ▼                          ▼
   300 CRAWLERS   300 LLM TAILORS          400 APPLIERS
   (LinkedIn,     (APA Resume diffs,       (Form autofill,
    JobStreet)     Anti-hallucination)      Staged review)
        │            │                          │
        └────────────┼──────────────────────────┘
                     ▼
             HUMAN APPROVAL GATE (Candidate Reviews & Approves)
                     │
                     ▼
         1-CLICK NOTION MIRROR & POSTGRESQL APPLICATION TRACKER`}
            </pre>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 bg-bg">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="label-xs mb-3">DEPLOY YOUR WORKFORCE</div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
            Stop Copying Job Descriptions Manually.
          </h2>
          <p className="text-dmuted text-base sm:text-lg mt-4 max-w-xl mx-auto leading-relaxed">
            Upload your career once. Deploy 1,000 specialized agent workers to search LinkedIn & JobStreet, tailor APA resumes via Local LLM, and mirror to Notion.
          </p>

          <div className="mt-8 flex justify-center gap-3">
            <Link href="/onboarding" className="btn btn-primary text-base py-3 px-8 font-semibold">
              Build Your Career DNA →
            </Link>
            <Link href="/agents" className="btn text-base py-3 px-6">
              Open Agent Console
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
            <p className="text-muted text-[11px] mt-0.5">Your AI Job-Hunting Workforce & Career Operating System</p>
          </div>

          <div className="flex flex-wrap gap-6 text-muted">
            <Link href="/dashboard" className="hover:text-ink">Dashboard</Link>
            <Link href="/profile" className="hover:text-ink">Career DNA</Link>
            <Link href="/resume" className="hover:text-ink">APA Resume</Link>
            <Link href="/agents" className="hover:text-ink">1,000 Bots</Link>
            <Link href="/applications" className="hover:text-ink">Applications</Link>
            <Link href="/integrations" className="hover:text-ink">Notion</Link>
            <Link href="/settings" className="hover:text-ink">Settings</Link>
          </div>

          <div className="flex items-center gap-2 text-muted text-[11px]">
            <span className="w-2 h-2 rounded-full bg-ok inline-block animate-pulse" />
            <span>Local AI First (Ollama)</span>
            <span>·</span>
            <span>GitHub Remote: darknecrocities/itsLARP</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
