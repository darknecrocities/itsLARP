"use client";
import React, { useState } from "react";
import {
  Cpu,
  Search,
  Filter,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Layers,
  FileText,
} from "lucide-react";

interface TargetRoleSimulation {
  id: string;
  title: string;
  company: string;
  badge: string;
  recommendedFormat: string;
  targetKeywords: string[];
  promotedSkills: string[];
  tailoredSummary: string;
  projectSpotlight: string;
  matchScore: number;
}

const SIMULATED_ROLES: TargetRoleSimulation[] = [
  {
    id: "anthropic",
    title: "Lead AI Systems Engineer",
    company: "Anthropic",
    badge: "AI Research Lab",
    recommendedFormat: "APA 7th Edition (Academic & Research CV)",
    targetKeywords: ["PyTorch", "vLLM", "Distributed Training", "CUDA", "LLM Serving"],
    promotedSkills: ["PyTorch", "vLLM", "Distributed Systems", "Python", "FastAPI"],
    tailoredSummary:
      "Lead AI Systems Engineer targeting the Lead AI Systems Engineer role at Anthropic. Brings 6+ years of verifiable execution across PyTorch, vLLM, and distributed model serving, architecting production-grade inference clusters directly aligned with Anthropic's scalable safety objectives.",
    projectSpotlight:
      "Quantized Inference Engine (QInfer) & Autonomous Multi-Agent Orchestrator (10M+ daily inference queries, 42% p99 latency reduction).",
    matchScore: 97,
  },
  {
    id: "stripe",
    title: "Staff Distributed Systems Architect",
    company: "Stripe",
    badge: "Financial Infrastructure",
    recommendedFormat: "Harvard Executive / IEEE Engineering",
    targetKeywords: ["Distributed Systems", "Kubernetes", "PostgreSQL", "Kafka", "High Availability"],
    promotedSkills: ["Distributed Systems", "Kubernetes", "PostgreSQL", "Docker", "Python"],
    tailoredSummary:
      "Staff Systems Architect specializing in fault-tolerant distributed infrastructure for Stripe. Proven track record maintaining 99.99% availability across high-throughput transactional event streaming systems processing 50k+ events/sec with strict zero-downtime SLAs.",
    projectSpotlight:
      "Autonomous Agent Fleet Orchestrator & Enterprise Kafka Pipelines (Sub-50ms latency under 10M daily events).",
    matchScore: 94,
  },
  {
    id: "yc",
    title: "Founding Full-Stack AI Engineer",
    company: "YC Series A Startup",
    badge: "High-Growth Startup",
    recommendedFormat: "Silicon Valley Modern (Tech & Impact)",
    targetKeywords: ["Next.js", "TypeScript", "FastAPI", "Python", "Rapid Iteration"],
    promotedSkills: ["TypeScript", "Next.js", "FastAPI", "Python", "Docker"],
    tailoredSummary:
      "Full-Stack Systems Engineer with 6+ years of agile execution delivering verified end-to-end AI applications. Expert in modern React 19 / Next.js interfaces paired with high-performance FastAPI backends, ready to lead product velocity from day zero.",
    projectSpotlight:
      "Full-Stack Career Automation Platform & Open-Source Agent Scheduler (Shipped from zero to production in 14 days).",
    matchScore: 98,
  },
];

const AGENT_PIPELINE_STEPS = [
  {
    step: "01",
    title: "JD Ingestion & Semantic Extraction",
    desc: "The discovery bot crawls the target job posting, identifies required hard skills, domain frameworks, and extracts organizational tone.",
    icon: Search,
  },
  {
    step: "02",
    title: "Career DNA Relevance Matching",
    desc: "Evaluates your verified repository of projects and commits. Scores overlap without hallucinating or inventing unearned credentials.",
    icon: Filter,
  },
  {
    step: "03",
    title: "Optimal Format Selection",
    desc: "Automatically selects between APA 7th, Harvard Executive, Silicon Valley Modern, IEEE, or ATS Strict based on company archetype.",
    icon: Layers,
  },
  {
    step: "04",
    title: "Bullet & Summary Synthesis",
    desc: "Promotes matched skills to the front of the resume, aligns project bullets with JD tech stacks, and highlights quantifiable ROI metrics.",
    icon: Sparkles,
  },
  {
    step: "05",
    title: "Guardrail Audit & APA Citation",
    desc: "Validates every statement against verified URLs and git hashes, formatting software artifacts into tamper-proof academic citations.",
    icon: ShieldCheck,
  },
];

export function AgentTailoringWorkflow() {
  const [selectedRole, setSelectedRole] = useState<TargetRoleSimulation>(SIMULATED_ROLES[0]);

  return (
    <section id="agent-tailoring" className="py-12 sm:py-16 border-b border-line bg-bg2/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="max-w-2xl">
          <div className="text-[11px] font-mono uppercase tracking-widest text-neutral-500 font-semibold">
            Autonomous Per-Job Intelligence
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-neutral-950 mt-1">
            How Autonomous Bots Tailor Your Resume
          </h2>
          <p className="text-neutral-600 text-xs sm:text-sm mt-2 leading-relaxed">
            Sending a single static resume to 50 companies fails because each role values different
            architectures. itsLARP bots perform a 5-stage synthesis cycle for every single job opening.
          </p>
        </div>

        {/* 5-Step Pipeline Flow Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-8">
          {AGENT_PIPELINE_STEPS.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="p-4 bg-white border border-neutral-300 rounded-lg flex flex-col justify-between shadow-xs relative"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-mono font-bold text-neutral-400">
                      STEP {s.step}
                    </span>
                    <Icon className="w-4 h-4 text-neutral-900" />
                  </div>
                  <h4 className="text-xs font-bold text-neutral-950 leading-snug">{s.title}</h4>
                  <p className="text-[11px] text-neutral-600 mt-2 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive Role Tailoring Simulator */}
        <div className="mt-10 p-6 sm:p-8 bg-white border border-neutral-300 rounded-xl shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-neutral-200">
            <div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 font-semibold border border-neutral-200">
                Interactive Bot Simulation
              </span>
              <h3 className="text-base sm:text-lg font-black text-neutral-950 mt-1">
                Real-Time Adaptation by Target Company
              </h3>
            </div>

            {/* Target Selectors */}
            <div className="flex flex-wrap gap-2">
              {SIMULATED_ROLES.map((r) => {
                const active = selectedRole.id === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedRole(r)}
                    className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition-all ${
                      active
                        ? "bg-black text-white shadow-xs"
                        : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                    }`}
                  >
                    {r.company}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Simulation Output Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
            {/* Left: Bot Decisions & Architecture */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200">
                <div className="text-[10px] font-mono text-neutral-500 uppercase font-semibold">
                  Target Opening
                </div>
                <div className="text-sm font-bold text-neutral-950 mt-0.5">
                  {selectedRole.title} &mdash;{" "}
                  <span className="text-neutral-600 font-normal">{selectedRole.company}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                    {selectedRole.matchScore}% Match
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-200 text-neutral-800">
                    {selectedRole.badge}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-white border border-neutral-200">
                <div className="text-[10px] font-mono text-neutral-500 uppercase font-semibold">
                  Autonomous Format Decision
                </div>
                <div className="text-xs font-bold font-mono text-neutral-900 mt-1">
                  {selectedRole.recommendedFormat}
                </div>
                <p className="text-[11px] text-neutral-500 mt-1 leading-snug">
                  Selected because {selectedRole.company} prioritizes this document structure for hiring evaluations.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-white border border-neutral-200">
                <div className="text-[10px] font-mono text-neutral-500 uppercase font-semibold mb-2">
                  Keywords Extracted & Matched
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedRole.targetKeywords.map((kw, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold"
                    >
                      ✓ {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Dynamic Output Content Adjusted by Bots */}
            <div className="lg:col-span-7 space-y-4">
              {/* Dynamically Tailored Summary */}
              <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase text-neutral-500 font-semibold">
                    Dynamic Summary Synthesized for {selectedRole.company}
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-neutral-200 text-neutral-700">
                    0% Hallucination Guard Active
                  </span>
                </div>
                <p className="text-xs text-neutral-800 leading-relaxed font-sans font-medium">
                  "{selectedRole.tailoredSummary}"
                </p>
              </div>

              {/* Reordered Skills List */}
              <div className="p-4 rounded-lg bg-white border border-neutral-200">
                <div className="text-[10px] font-mono uppercase text-neutral-500 font-semibold mb-2">
                  Skills Order (Re-ordered to Elevate Target Requisites)
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedRole.promotedSkills.map((sk, i) => (
                    <span
                      key={i}
                      className={`text-xs font-mono px-2.5 py-1 rounded border ${
                        i < 3
                          ? "bg-black text-white border-black font-semibold"
                          : "bg-neutral-100 text-neutral-800 border-neutral-200"
                      }`}
                    >
                      {i + 1}. {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Elevated Project Spotlight */}
              <div className="p-4 rounded-lg bg-white border border-neutral-200">
                <div className="text-[10px] font-mono uppercase text-neutral-500 font-semibold mb-1">
                  Elevated Software Artifact & Metric Spotlight
                </div>
                <div className="text-xs text-neutral-800 font-mono leading-relaxed">
                  {selectedRole.projectSpotlight}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
