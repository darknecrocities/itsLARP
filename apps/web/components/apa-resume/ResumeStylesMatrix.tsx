"use client";
import React, { useState } from "react";
import {
  GraduationCap,
  Briefcase,
  Rocket,
  Cpu,
  FileCheck,
  Check,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { type ResumeFormatKey } from "@/lib/store";

export interface ResumeStyleInfo {
  key: ResumeFormatKey;
  name: string;
  badge: string;
  targetFit: string;
  idealRoles: string[];
  targetCompanies: string[];
  architectureFeatures: string[];
  atsScore: string;
  icon: React.ComponentType<{ className?: string }>;
  citationRule: string;
}

export const RESUME_STYLES_CATALOG: ResumeStyleInfo[] = [
  {
    key: "apa_7th",
    name: "APA 7th Edition (Academic & Research CV)",
    badge: "Academic Standard",
    targetFit: "Best for AI/ML Researchers, Research Scientists, Ph.D. candidates, and R&D Lab Specialists.",
    idealRoles: ["AI/ML Research Scientist", "Staff Research Engineer", "Postdoctoral Fellow", "Algorithms Scientist"],
    targetCompanies: ["OpenAI", "Google DeepMind", "Anthropic", "Universities & National Labs"],
    architectureFeatures: [
      "Running head header with author surname and page number (Page 1)",
      "Formal Professional Abstract summarizing systems contributions",
      "Academic credentials & foundational research background",
      "Software Artifacts formatted under formal APA 7th Edition citations",
      "Direct DOI & repository evidence links",
    ],
    atsScore: "94% (High)",
    icon: GraduationCap,
    citationRule: "Author, A. (Year). Software Title [Computer software]. Repository URL.",
  },
  {
    key: "harvard_executive",
    name: "Harvard Executive (Reverse-Chronological)",
    badge: "Executive Leadership",
    targetFit: "Best for Engineering Managers, Directors, VP of Engineering, and Senior Technical Leaders.",
    idealRoles: ["VP of Engineering", "Director of Engineering", "Engineering Manager", "Technical Product Director"],
    targetCompanies: ["Stripe", "Airbnb", "Snowflake", "Enterprise Fortune 500"],
    architectureFeatures: [
      "Centered serif header with dignified executive presence",
      "Impact-first Executive Summary with team-scale and budget scoping",
      "Core Competencies matrix organized by organizational leadership and tech",
      "Reverse-chronological career progression with verified revenue and uptime metrics",
      "Board advisory and organizational achievements",
    ],
    atsScore: "98% (Executive)",
    icon: Briefcase,
    citationRule: "Role | Company (Years) · Verified Impact: Quantified ROI / Scale metric.",
  },
  {
    key: "silicon_valley_modern",
    name: "Silicon Valley Modern (Tech & Engineering Impact)",
    badge: "Startup & Product",
    targetFit: "Best for Tech Startups, Y Combinator founders, Full-Stack, Frontend, and Product Engineers.",
    idealRoles: ["Lead Full-Stack Engineer", "Senior Frontend Architect", "Founding Engineer", "Product Systems Engineer"],
    targetCompanies: ["YC Startups", "Vercel", "Linear", "Supabase", "Scale AI"],
    architectureFeatures: [
      "Clean grotesque layout with clickable GitHub, live demos, and portfolio links",
      "Prominent technology stack badges at the top of the document",
      "Impact-first bullets: 'Accomplished [X], measured by [Y], by doing [Z]'",
      "Featured open-source software artifacts and pull requests",
      "High information density optimized for rapid 6-second recruiter scans",
    ],
    atsScore: "96% (Optimized)",
    icon: Rocket,
    citationRule: "Project Name (Tech Stack) — Shipped feature with measurable latency/user growth.",
  },
  {
    key: "ieee_engineering",
    name: "IEEE Engineering Standard (Numbered Specification)",
    badge: "Systems & Hardware",
    targetFit: "Best for Systems Engineers, Embedded/Firmware Developers, Hardware/Robotics, and High-Frequency Trading.",
    idealRoles: ["Staff Distributed Systems Engineer", "Embedded Firmware Lead", "Robotics Controls Engineer", "Low-Latency Kernel Dev"],
    targetCompanies: ["NVIDIA", "Jane Street", "SpaceX", "Lockheed Martin", "Tesla Autopilot"],
    architectureFeatures: [
      "Numbered Roman sections (SECTION I: ABSTRACT through SECTION V: CREDENTIALS)",
      "Strict engineering specifications, hardware constraints, and kernel toolchains",
      "Microsecond-level latency benchmarks and memory footprint citations",
      "Peer-reviewed engineering papers and technical patent filings",
      "Rigorous monospace tabular layouts conforming to IEEE journal standards",
    ],
    atsScore: "93% (Technical)",
    icon: Cpu,
    citationRule: "Section III: Production Systems — [1] System Architecture, Memory Limits & SLA.",
  },
  {
    key: "ats_strict",
    name: "ATS Strict Parser-Safe (Workday & Greenhouse)",
    badge: "100% Parse-Proof",
    targetFit: "Best for Enterprise portals, Fortune 500 ATS systems (Workday, Taleo, Greenhouse, Lever).",
    idealRoles: ["Enterprise Software Engineer", "Cloud Infrastructure Engineer", "Security / Compliance Engineer", "Corporate Tech Roles"],
    targetCompanies: ["Amazon (iCIMS)", "Apple (Workday)", "Meta (Internal ATS)", "JPMorgan Chase"],
    architectureFeatures: [
      "Single-column standard ASCII hierarchy guaranteed against parser fragmentation",
      "Standard system typography readable by all optical and PDF character recognition engines",
      "100% table-free, column-free, and icon-free layout to avoid parsing traps",
      "Standardized section headings (WORK EXPERIENCE, EDUCATION, SKILLS)",
      "Direct keyword mirroring corresponding 1:1 with target job requirements",
    ],
    atsScore: "100% (Maximum)",
    icon: FileCheck,
    citationRule: "Plain text bullet hierarchy with verified company, title, dates, and keywords.",
  },
];

interface ResumeStylesMatrixProps {
  onSelectFormat?: (formatKey: ResumeFormatKey) => void;
  selectedFormat?: ResumeFormatKey;
}

export function ResumeStylesMatrix({
  onSelectFormat,
  selectedFormat = "apa_7th",
}: ResumeStylesMatrixProps) {
  const [activeTab, setActiveTab] = useState<ResumeFormatKey>(selectedFormat);

  const handleSelect = (key: ResumeFormatKey) => {
    setActiveTab(key);
    if (onSelectFormat) onSelectFormat(key);
  };

  const currentStyle = RESUME_STYLES_CATALOG.find((s) => s.key === activeTab) || RESUME_STYLES_CATALOG[0];
  const IconComponent = currentStyle.icon;

  return (
    <section id="styles-matrix" className="py-12 sm:py-16 border-b border-line bg-bg2/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="max-w-2xl">
          <div className="text-[11px] font-mono uppercase tracking-widest text-neutral-500 font-semibold">
            Role & Industry Fit Guide
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-neutral-950 mt-1">
            Which Resume Style Is the Right Fit?
          </h2>
          <p className="text-neutral-600 text-xs sm:text-sm mt-2 leading-relaxed">
            Different hiring channels evaluate candidates through distinct lenses. itsLARP provides
            5 purpose-built architectures so your autonomous agents never submit a generic resume format.
          </p>
        </div>

        {/* 5 Tab Selectors */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mt-8">
          {RESUME_STYLES_CATALOG.map((style) => {
            const isSelected = activeTab === style.key;
            const TabIcon = style.icon;
            return (
              <button
                key={style.key}
                type="button"
                onClick={() => handleSelect(style.key)}
                className={`p-3.5 rounded-lg border text-left transition-all ${
                  isSelected
                    ? "bg-black text-white border-black shadow-sm"
                    : "bg-white text-neutral-900 border-neutral-300 hover:border-black"
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-2">
                  <TabIcon className={`w-4 h-4 ${isSelected ? "text-white" : "text-neutral-700"}`} />
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                      isSelected ? "bg-neutral-800 text-neutral-200" : "bg-neutral-100 text-neutral-600"
                    }`}
                  >
                    {style.badge}
                  </span>
                </div>
                <div className="text-xs font-bold leading-snug line-clamp-2">{style.name.split("(")[0]}</div>
                <div
                  className={`text-[10px] font-mono mt-1 ${
                    isSelected ? "text-neutral-400" : "text-neutral-500"
                  }`}
                >
                  ATS: {style.atsScore}
                </div>
              </button>
            );
          })}
        </div>

        {/* Deep Dive Card for Selected Style */}
        <div className="mt-6 p-6 sm:p-8 bg-white border border-neutral-300 rounded-xl shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-neutral-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-neutral-100 border border-neutral-300 flex items-center justify-center text-black">
                <IconComponent className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 border border-neutral-200 uppercase font-semibold">
                  {currentStyle.badge}
                </span>
                <h3 className="text-lg sm:text-xl font-black text-neutral-950 mt-1">
                  {currentStyle.name}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[10px] font-mono text-neutral-500 uppercase">Automated ATS Score</div>
                <div className="text-sm font-bold font-mono text-neutral-900">{currentStyle.atsScore}</div>
              </div>
              <a
                href="#live-preview"
                className="btn btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5"
              >
                <span>Preview Document</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Target Fit Headline */}
          <div className="mt-5 p-3.5 bg-neutral-50 border border-neutral-200 rounded-lg text-xs sm:text-sm font-medium text-neutral-800 leading-relaxed">
            {currentStyle.targetFit}
          </div>

          {/* 3-Column Specifications Grid */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {/* Column 1: Architectural Features */}
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 font-semibold mb-3">
                Architectural Hallmarks
              </div>
              <ul className="space-y-2 text-xs text-neutral-700">
                {currentStyle.architectureFeatures.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-neutral-900 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2: Ideal Roles */}
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 font-semibold mb-3">
                Ideal Target Roles
              </div>
              <div className="flex flex-wrap gap-1.5">
                {currentStyle.idealRoles.map((role, i) => (
                  <span
                    key={i}
                    className="text-[11px] font-mono px-2.5 py-1 bg-neutral-100 border border-neutral-200 text-neutral-800 rounded"
                  >
                    {role}
                  </span>
                ))}
              </div>

              <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 font-semibold mt-5 mb-2">
                Typical Employer Archetypes
              </div>
              <div className="flex flex-wrap gap-1.5">
                {currentStyle.targetCompanies.map((comp, i) => (
                  <span
                    key={i}
                    className="text-[11px] font-medium px-2 py-0.5 bg-neutral-50 border border-neutral-200 text-neutral-700 rounded"
                  >
                    {comp}
                  </span>
                ))}
              </div>
            </div>

            {/* Column 3: Citation & Grounding Rule */}
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 font-semibold mb-3">
                Evidence & Citation Pattern
              </div>
              <div className="p-3 bg-neutral-900 text-white rounded-lg text-xs font-mono leading-relaxed">
                <div className="text-neutral-400 text-[10px] mb-1">Standard Citation Syntax:</div>
                <div className="text-white text-[11px]">{currentStyle.citationRule}</div>
              </div>

              <div className="mt-4 p-3 border border-neutral-200 rounded-lg text-[11px] text-neutral-600 leading-snug">
                <strong className="text-neutral-900 block mb-0.5">Autonomous Agent Behavior:</strong>
                When an application bot encounters an opening matching this archetype, it dynamically
                restructures your career history into this template with zero manual intervention.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
