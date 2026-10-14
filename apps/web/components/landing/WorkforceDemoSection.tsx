"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui";
import { HorizontalPipelineMap } from "@/components/HorizontalPipelineMap";
import { FadeIn } from "@/components/motion";
import { DEMO_LOGS } from "./constants";
import { Pause, Play, ArrowRight } from "lucide-react";

export function WorkforceDemoSection() {
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
              className="card p-8 bg-white text-black border border-line shadow-lg font-serif max-w-3xl mx-auto"
            >
              <div className="flex justify-between items-center text-xs text-neutral-500 font-mono border-b border-neutral-300 pb-2 mb-6">
                <span>JANE DOE · RESUME PREVIEW</span>
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
                  Verified Project Work
                </h4>
                <p className="text-xs leading-snug pl-4 -indent-4">
                  <strong>Autonomous Task Runner</strong> (2026) · <em>Python, React, FastAPI</em>
                </p>
                <p className="text-[11px] text-neutral-600 pl-4 mt-0.5">
                  High-speed background runner processing thousands of tasks in parallel with 100% verified accuracy.
                </p>
              </div>
              <div className="pt-4 border-t border-neutral-300 flex justify-between items-center text-xs">
                <span className="text-neutral-500">Clean, Professional Formatting</span>
                <Link href="/resume" className="btn text-xs py-1 px-3 bg-black text-white inline-flex items-center gap-1.5">
                  <span>Open Resume Studio</span>
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
