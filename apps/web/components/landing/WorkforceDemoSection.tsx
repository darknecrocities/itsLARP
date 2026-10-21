"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui";
import { HorizontalPipelineMap } from "@/components/HorizontalPipelineMap";
import { FadeIn } from "@/components/motion";
import { DEMO_LOGS } from "./constants";
import { Pause, Play, ArrowRight } from "lucide-react";
import { SAMPLE_PROFILE } from "@/lib/sampleResume";

export function WorkforceDemoSection() {
  const [activeLogIndex, setActiveLogIndex] = useState(DEMO_LOGS.length - 1);
  const [simRunning, setSimRunning] = useState(true);
  const [demoTab, setDemoTab] = useState<"pipeline" | "apa" | "notion">("pipeline");

  useEffect(() => {
    const handleHash = () => {
      if (typeof window !== "undefined" && window.location.hash === "#apa-format") {
        setDemoTab("apa");
        const el = document.getElementById("apa-format") || document.getElementById("workforce-demo");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  useEffect(() => {
    if (!simRunning) return;
    const timer = setInterval(() => {
      setActiveLogIndex((prev) => (prev + 1) % DEMO_LOGS.length);
    }, 2400);
    return () => clearInterval(timer);
  }, [simRunning]);

  return (
    <section id="workforce-demo" className="py-20 border-b border-line bg-bg2/30">
      <div className="max-w-6xl mx-auto px-6">
        <FadeIn direction="up" distance={24} className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">How Your AI Team Works Together</h2>
            <p className="text-muted text-sm mt-1 max-w-xl">
              See how your AI assistants find job openings, write tailored resumes, and prepare your applications in the background.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <motion.button
              whileTap={{ scale: 0.96 }}
              className={`btn text-xs ${simRunning ? "bg-black text-white" : ""}`}
              onClick={() => setSimRunning(!simRunning)}
            >
              {simRunning ? (
                <span className="inline-flex items-center gap-1.5">
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause Demo</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5" />
                  <span>Resume Demo</span>
                </span>
              )}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              className={`btn text-xs ${demoTab === "pipeline" ? "bg-black text-white" : ""}`}
              onClick={() => setDemoTab("pipeline")}
            >
              Team Workflow
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              className={`btn text-xs ${demoTab === "apa" ? "bg-black text-white" : ""}`}
              onClick={() => setDemoTab("apa")}
            >
              Tailored Resume
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              className={`btn text-xs ${demoTab === "notion" ? "bg-black text-white" : ""}`}
              onClick={() => setDemoTab("notion")}
            >
              Notion Board
            </motion.button>
          </div>
        </FadeIn>

        <AnimatePresence mode="wait">
          {demoTab === "pipeline" ? (
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
              className="card p-8 md:p-10 bg-white text-black border border-line shadow-lg font-serif max-w-3xl mx-auto"
            >
              {/* APA Running Head */}
              <div className="flex justify-between items-center text-[10px] sm:text-xs text-neutral-500 font-mono border-b border-neutral-300 pb-2 mb-6">
                <span className="truncate">RUNNING HEAD: CHEN / CURRICULUM VITAE</span>
                <span className="shrink-0 ml-2">Page 1</span>
              </div>

              {/* APA Title Block */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold">{SAMPLE_PROFILE.name}</h3>
                <div className="text-sm italic text-neutral-700 mt-0.5">{SAMPLE_PROFILE.headline}</div>
                <div className="text-[11px] sm:text-xs text-neutral-500 font-mono mt-1 break-words">
                  {SAMPLE_PROFILE.email} | {SAMPLE_PROFILE.location} | {SAMPLE_PROFILE.links.github}
                </div>
              </div>

              {/* Section 1: Professional Abstract */}
              <div className="mb-5">
                <h4 className="text-center font-bold text-xs uppercase border-b border-black pb-1 mb-2 tracking-wider font-sans">
                  Professional Abstract
                </h4>
                <p className="text-xs text-neutral-800 leading-relaxed indent-6 text-justify">
                  Empirical technical practitioner with {SAMPLE_PROFILE.years}+ years of experience architecting high-throughput distributed software platforms, local LLM inference engines, and artificial intelligence infrastructure. Technical competencies span {SAMPLE_PROFILE.skills.slice(0, 8).join(", ")}. All claims are verified against primary source code evidence.
                </p>
              </div>

              {/* Section 2: Academic Credentials */}
              <div className="mb-5">
                <h4 className="text-center font-bold text-xs uppercase border-b border-black pb-1 mb-2 tracking-wider font-sans">
                  Academic Preparation & Credentials
                </h4>
                <div className="text-xs space-y-1 text-neutral-800 whitespace-pre-line">
                  {SAMPLE_PROFILE.education}
                </div>
              </div>

              {/* Section 3: Professional Employment History */}
              <div className="mb-5">
                <h4 className="text-center font-bold text-xs uppercase border-b border-black pb-1 mb-2 tracking-wider font-sans">
                  Professional Employment History
                </h4>
                <div className="space-y-3 text-xs">
                  {SAMPLE_PROFILE.experience.map((exp, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between items-baseline font-sans">
                        <span className="font-bold text-black">{exp.role || exp.title}</span>
                        <span className="text-[11px] font-mono text-neutral-600">{exp.dates}</span>
                      </div>
                      <div className="italic text-neutral-700 text-[11px] mb-1">{exp.company}</div>
                      <ul className="list-disc list-inside space-y-0.5 text-neutral-800 leading-relaxed pl-1">
                        {(exp.bullets || []).map((b, bIdx) => (
                          <li key={bIdx} className="text-justify">{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 4: Technical Competencies */}
              <div className="mb-5">
                <h4 className="text-center font-bold text-xs uppercase border-b border-black pb-1 mb-2 tracking-wider font-sans">
                  Technical Competencies & Frameworks
                </h4>
                <div className="flex flex-wrap gap-1.5 text-[11px] font-mono">
                  {SAMPLE_PROFILE.skills.map((s) => (
                    <span key={s} className="px-2 py-0.5 bg-neutral-100 border border-neutral-300 rounded text-neutral-800">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Section 5: Software Artifacts (APA 7th Format) */}
              <div className="mb-5">
                <h4 className="text-center font-bold text-xs uppercase border-b border-black pb-1 mb-2 tracking-wider font-sans">
                  Software Artifacts (APA 7th Format)
                </h4>
                <div className="space-y-2 text-xs">
                  {SAMPLE_PROFILE.projects.map((proj) => (
                    <div key={proj.name} className="pl-4 -indent-4">
                      <p className="leading-snug">
                        <strong>Chen, A.</strong> (2026). <em>{proj.name}</em> [Computer software / {proj.tech.join(", ")}].
                      </p>
                      <p className="indent-0 text-[11px] text-neutral-600 mt-0.5 pl-4">
                        {proj.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 6: Verifiable Evidence Corpus */}
              <div className="mb-6">
                <h4 className="text-center font-bold text-xs uppercase border-b border-black pb-1 mb-2 tracking-wider font-sans">
                  Verifiable Evidence Corpus
                </h4>
                <div className="space-y-1.5 text-[11px] font-mono text-neutral-700">
                  {SAMPLE_PROFILE.evidence.map((ev, i) => (
                    <div key={i} className="p-1.5 bg-neutral-50 border border-neutral-200 rounded">
                      <span className="font-bold text-black">[{i + 1}] Source: {ev.source}</span>
                      <div className="italic text-neutral-600 mt-0.5">"{ev.text}"</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-300 flex flex-wrap justify-between items-center gap-3 text-xs font-mono">
                <span className="text-neutral-500">Standard APA 7th Edition Output · 100% Verifiable</span>
                <Link href="/resume" className="btn text-xs py-1.5 px-3 bg-black text-white hover:bg-neutral-800 transition-colors inline-flex items-center gap-1.5">
                  <span>Open Full APA Resume Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
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
              className="card p-6 bg-bg border border-line text-xs"
            >
              <div className="flex justify-between items-center border-b border-line pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold">Your Notion Tracker</span>
                  <span className="text-xs text-emerald-600 font-medium">Synced in Real Time</span>
                </div>
                <Link href="/integrations" className="btn text-xs py-1 px-2.5 inline-flex items-center gap-1.5">
                  <span>Connect Your Notion</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-[11px] font-semibold text-muted uppercase tracking-wider border-b border-line">
                    <tr>
                      <th scope="col" className="py-2">Company</th>
                      <th scope="col">Role</th>
                      <th scope="col">Job Board</th>
                      <th scope="col">Status</th>
                      <th scope="col">Match</th>
                      <th scope="col">Resume</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {[
                      { company: "Anthropic Labs", role: "Staff AI Engineer", platform: "LinkedIn", status: "Applied", match: "94%" },
                      { company: "FinTech Systems", role: "Senior Full Stack Lead", platform: "JobStreet", status: "Ready to Submit", match: "88%" },
                      { company: "CloudScale AI", role: "Backend Engineer", platform: "Indeed", status: "Interview", match: "91%" },
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
                        <td>
                          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            row.status === "Interview"
                              ? "bg-purple-100 text-purple-800"
                              : row.status === "Applied"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-neutral-100 text-neutral-800"
                          }`}>
                            {row.status}
                          </span>
                        </td>
                        <td>{row.match}</td>
                        <td>Tailored</td>
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
  );
}
