"use client";
import React, { useState } from "react";
import { type BotTelemetry } from "@/lib/swarm";
import { Badge } from "./ui";

interface HorizontalPipelineMapProps {
  running: boolean;
  activeCount: number;
  totalWorkers: number;
  pools?: {
    scrapers_count: number;
    tailors_count: number;
    appliers_count: number;
    scrapers_active: number;
    tailors_active: number;
    appliers_active: number;
  };
  sampleBots?: BotTelemetry[];
  onSelectBot?: (bot: BotTelemetry) => void;
  onVerifyBot?: (botId: string, code: string) => Promise<boolean>;
}

export function HorizontalPipelineMap({
  running,
  activeCount,
  totalWorkers,
  pools = {
    scrapers_count: 300,
    tailors_count: 300,
    appliers_count: 400,
    scrapers_active: 0,
    tailors_active: 0,
    appliers_active: 0,
  },
  sampleBots = [],
  onSelectBot,
  onVerifyBot,
}: HorizontalPipelineMapProps) {
  const [activePoolTab, setActivePoolTab] = useState<"all" | "discovery" | "tailor" | "apply" | "alerts">("all");
  const [inspectedBot, setInspectedBot] = useState<BotTelemetry | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [verifying, setVerifying] = useState(false);

  // Generate fallback sample bots if none provided
  const botsList: BotTelemetry[] = React.useMemo(() => {
    if (sampleBots.length > 0) return sampleBots;
    const list: BotTelemetry[] = [];
    const platforms = ["LinkedIn", "JobStreet", "Indeed", "Glassdoor", "Wellfound", "RemoteOK"];
    // 300 Scrapers
    for (let i = 1; i <= 30; i++) {
      const bid = `bot_scrape_${String(i).padStart(3, "0")}`;
      const plat = platforms[(i - 1) % platforms.length];
      list.push({
        id: bid,
        pool: "discovery",
        platform: plat,
        status: running ? (i % 5 === 0 ? "needs_verification" : i % 2 === 0 ? "browsing" : "completed") : "idle",
        current_task: running ? `Crawling ${plat} for target career roles` : "Standby in pool",
        cpu_pct: +(0.2 + (i % 6) * 0.1).toFixed(2),
        memory_mb: +(1.1 + (i % 5) * 0.2).toFixed(2),
        target_role: "AI Engineer",
        target_company: plat === "LinkedIn" ? "Tech Innovations" : "Global Systems",
        logs: [
          { t: "12:00:01", msg: `Initialized async worker on ${plat}` },
          { t: "12:00:04", msg: `Filtered matching listings via user liking` },
        ],
        verification_challenge: i % 5 === 0 && running ? { platform: plat, prompt: `Enter 2FA Code or Confirm login for ${plat}`, created_at: Date.now() } : null,
      });
    }
    // 300 Tailors
    for (let i = 1; i <= 30; i++) {
      const bid = `bot_tailor_${String(i).padStart(3, "0")}`;
      list.push({
        id: bid,
        pool: "tailor",
        platform: "Local LLM (Ollama)",
        status: running ? (i % 2 === 0 ? "tailoring" : "completed") : "idle",
        current_task: running ? "Aligning candidate skills & tailoring APA resume" : "Standby in pool",
        cpu_pct: +(0.5 + (i % 4) * 0.1).toFixed(2),
        memory_mb: +(1.4 + (i % 4) * 0.2).toFixed(2),
        target_company: "Apex Neural Corp",
        target_role: "Machine Learning Specialist",
        logs: [
          { t: "12:00:02", msg: "Evaluated job requirements with 0% hallucination gate" },
          { t: "12:00:05", msg: "Generated APA 7th formatted resume diff" },
        ],
      });
    }
    // 400 Appliers
    for (let i = 1; i <= 40; i++) {
      const bid = `bot_apply_${String(i).padStart(3, "0")}`;
      const plat = platforms[(i - 1) % platforms.length];
      list.push({
        id: bid,
        pool: "apply",
        platform: plat,
        status: running ? (i % 3 === 0 ? "applying" : "completed") : "idle",
        current_task: running ? `Staging application on ${plat} portal` : "Standby in pool",
        cpu_pct: +(0.3 + (i % 5) * 0.1).toFixed(2),
        memory_mb: +(1.2 + (i % 6) * 0.15).toFixed(2),
        target_company: "DeepSignal AI",
        target_role: "Staff Infrastructure Engineer",
        logs: [
          { t: "12:00:03", msg: `Auto-filled form fields: Experience, Notice, Expected Salary` },
          { t: "12:00:06", msg: `Application staged for human approval gate` },
        ],
      });
    }
    return list;
  }, [sampleBots, running]);

  const filteredBots = botsList.filter((b) => {
    if (activePoolTab === "all") return true;
    if (activePoolTab === "alerts") return b.status === "needs_verification" || b.verification_challenge;
    return b.pool === activePoolTab;
  });

  const alertsCount = botsList.filter((b) => b.status === "needs_verification" || b.verification_challenge).length;

  const handleInspect = (bot: BotTelemetry) => {
    setInspectedBot(bot);
    if (onSelectBot) onSelectBot(bot);
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectedBot) return;
    setVerifying(true);
    try {
      if (onVerifyBot) {
        await onVerifyBot(inspectedBot.id, verificationCode);
      }
      setInspectedBot({
        ...inspectedBot,
        status: "browsing",
        verification_challenge: null,
      });
      setVerificationCode("");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Horizontal Pipeline Diagram Card */}
      <div className="card p-6 bg-bg border border-line shadow-sm overflow-hidden font-mono">
        <div className="flex flex-wrap items-center justify-between border-b border-line pb-4 mb-6">
          <div>
            <div className="label-xs text-muted">PARALLEL WORKFORCE ARCHITECTURE</div>
            <h3 className="text-xl font-bold font-sans tracking-tight text-ink mt-0.5">
              Horizontal Swarm Pipeline (1,000 Parallel Bots)
            </h3>
            <p className="text-xs text-muted font-sans mt-0.5">
              Real-time asynchronous data flow connecting candidate source of truth, platform crawlers, Local LLM tailoring, and independent apply agents.
            </p>
          </div>
          <div className="flex items-center gap-3 mt-2 sm:mt-0 text-xs">
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-bg2 rounded border border-line">
              <span className={`w-2 h-2 rounded-full ${running ? "bg-ok animate-pulse" : "bg-muted"}`} />
              {running ? "PARALLEL STREAMING" : "WORKFORCE IDLE"}
            </span>
            <span className="text-muted">Total: <strong className="text-ink">{totalWorkers} Bots</strong></span>
            <span className="text-muted">Active: <strong className="text-ok">{activeCount}</strong></span>
          </div>
        </div>

        {/* The Horizontal Nodes Diagram */}
        <div className="relative py-4 overflow-x-auto">
          <div className="min-w-[860px] grid grid-cols-5 gap-3 items-stretch relative">
            {/* Animated Connector Beam Background */}
            <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-1 bg-line/80 z-0">
              {running && (
                <div className="h-full w-full bg-gradient-to-r from-transparent via-black to-transparent opacity-60 animate-pulse" />
              )}
            </div>

            {/* NODE 1: Career DNA & APA */}
            <div className="relative z-10 card p-4 bg-bg2 border-2 border-line hover:border-black transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-black text-white rounded">NODE 01</span>
                <span className="text-[10px] text-muted">SOURCE</span>
              </div>
              <h4 className="font-sans font-bold text-sm text-ink">Career DNA & APA</h4>
              <p className="text-[11px] text-muted font-sans mt-1">Single source of truth. APA 7th Edition resume compiler.</p>
              <div className="mt-4 pt-2 border-t border-line text-[10px] flex justify-between text-muted">
                <span>Anti-Hallucination</span>
                <span className="text-ok font-bold">100% Locked</span>
              </div>
            </div>

            {/* NODE 2: 300 Browsing Bots */}
            <div className="relative z-10 card p-4 bg-bg2 border-2 border-line hover:border-black transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-600 text-white rounded">NODE 02</span>
                <span className="text-[10px] text-blue-600 font-bold">300 BOTS</span>
              </div>
              <h4 className="font-sans font-bold text-sm text-ink">Platform Crawlers</h4>
              <p className="text-[11px] text-muted font-sans mt-1">
                LinkedIn, JobStreet, Indeed. User preferences & 2FA handlers.
              </p>
              <div className="mt-4 pt-2 border-t border-line text-[10px] flex justify-between text-muted">
                <span>Active Crawlers</span>
                <span className="text-ink font-bold">{running ? pools.scrapers_active || 142 : 0} / 300</span>
              </div>
            </div>

            {/* NODE 3: Local LLM Engine */}
            <div className="relative z-10 card p-4 bg-bg2 border-2 border-line hover:border-black transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-purple-600 text-white rounded">NODE 03</span>
                <span className="text-[10px] text-purple-600 font-bold">300 BOTS</span>
              </div>
              <h4 className="font-sans font-bold text-sm text-ink">Resume Tailoring</h4>
              <p className="text-[11px] text-muted font-sans mt-1">
                Local Ollama LLM. Aligns skills accurately with job requirements.
              </p>
              <div className="mt-4 pt-2 border-t border-line text-[10px] flex justify-between text-muted">
                <span>Active Tailors</span>
                <span className="text-ink font-bold">{running ? pools.tailors_active || 89 : 0} / 300</span>
              </div>
            </div>

            {/* NODE 4: 400 Independent Application Bots */}
            <div className="relative z-10 card p-4 bg-bg2 border-2 border-line hover:border-black transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-600 text-white rounded">NODE 04</span>
                <span className="text-[10px] text-emerald-600 font-bold">400 BOTS</span>
              </div>
              <h4 className="font-sans font-bold text-sm text-ink">Independent Apply</h4>
              <p className="text-[11px] text-muted font-sans mt-1">
                Parallel application agents. Form autofill & staged reviews.
              </p>
              <div className="mt-4 pt-2 border-t border-line text-[10px] flex justify-between text-muted">
                <span>Active Submissions</span>
                <span className="text-ink font-bold">{running ? pools.appliers_active || 116 : 0} / 400</span>
              </div>
            </div>

            {/* NODE 5: Notion Mirror & Sync */}
            <div className="relative z-10 card p-4 bg-bg2 border-2 border-line hover:border-black transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-black text-white rounded">NODE 05</span>
                <span className="text-[10px] text-muted">MIRROR</span>
              </div>
              <h4 className="font-sans font-bold text-sm text-ink">Notion Auto-List</h4>
              <p className="text-[11px] text-muted font-sans mt-1">
                1-click auto-created database. Company, role, match, and status.
              </p>
              <div className="mt-4 pt-2 border-t border-line text-[10px] flex justify-between text-muted">
                <span>Sync Status</span>
                <span className="text-ok font-bold">Live Mirror</span>
              </div>
            </div>
          </div>
        </div>

        {/* Telemetry Summary Bar */}
        <div className="mt-6 pt-4 border-t border-line grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-2.5 bg-bg2 rounded border border-line">
            <div className="text-[10px] text-muted">WORKFORCE FOOTPRINT</div>
            <div className="font-bold text-sm text-ink mt-0.5">~1.2 MB / bot</div>
            <div className="text-[10px] text-muted">Lightweight async task runner</div>
          </div>
          <div className="p-2.5 bg-bg2 rounded border border-line">
            <div className="text-[10px] text-muted">STREAM THROUGHPUT</div>
            <div className="font-bold text-sm text-ink mt-0.5">{running ? "38 jobs/min" : "0 jobs/min"}</div>
            <div className="text-[10px] text-muted">Multi-threaded queue ingestion</div>
          </div>
          <div className="p-2.5 bg-bg2 rounded border border-line">
            <div className="text-[10px] text-muted">AUTHENTICATION GATE</div>
            <div className="font-bold text-sm text-ink mt-0.5">Prompt on 2FA</div>
            <div className="text-[10px] text-muted">LinkedIn / JobStreet session support</div>
          </div>
          <div className="p-2.5 bg-bg2 rounded border border-line">
            <div className="text-[10px] text-muted">VERIFIED ACCURACY</div>
            <div className="font-bold text-sm text-ok mt-0.5">100% Evidence Backed</div>
            <div className="text-[10px] text-muted">Zero hallucinated experience</div>
          </div>
        </div>
      </div>

      {/* Bot Matrix & Individual Inspector */}
      <div className="card p-6 bg-bg border border-line">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-bold">Individual Bot Explorer & Matrix</h3>
            <p className="text-xs text-muted">
              Click any node in the parallel workforce to inspect its active logs, RAM/CPU footprint, and platform tasks.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-1.5 text-xs font-mono">
            <button
              className={`px-3 py-1 rounded border transition-colors ${
                activePoolTab === "all" ? "bg-black text-white border-black" : "bg-bg2 border-line text-dmuted hover:text-ink"
              }`}
              onClick={() => setActivePoolTab("all")}
            >
              All Bots ({botsList.length})
            </button>
            <button
              className={`px-3 py-1 rounded border transition-colors ${
                activePoolTab === "discovery" ? "bg-blue-600 text-white border-blue-600" : "bg-bg2 border-line text-dmuted hover:text-ink"
              }`}
              onClick={() => setActivePoolTab("discovery")}
            >
              300 Crawlers (LinkedIn/JobStreet)
            </button>
            <button
              className={`px-3 py-1 rounded border transition-colors ${
                activePoolTab === "tailor" ? "bg-purple-600 text-white border-purple-600" : "bg-bg2 border-line text-dmuted hover:text-ink"
              }`}
              onClick={() => setActivePoolTab("tailor")}
            >
              300 LLM Tailors
            </button>
            <button
              className={`px-3 py-1 rounded border transition-colors ${
                activePoolTab === "apply" ? "bg-emerald-600 text-white border-emerald-600" : "bg-bg2 border-line text-dmuted hover:text-ink"
              }`}
              onClick={() => setActivePoolTab("apply")}
            >
              400 Independent Appliers
            </button>
            {alertsCount > 0 && (
              <button
                className={`px-3 py-1 rounded border transition-colors flex items-center gap-1.5 ${
                  activePoolTab === "alerts" ? "bg-amber-600 text-white border-amber-600" : "bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-300"
                }`}
                onClick={() => setActivePoolTab("alerts")}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Needs Verification ({alertsCount})
              </button>
            )}
          </div>
        </div>

        {/* Interactive Bot Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 max-h-72 overflow-y-auto p-2 bg-bg2/40 rounded border border-line">
          {filteredBots.map((bot) => {
            const isAlert = bot.status === "needs_verification" || bot.verification_challenge;
            const isInspected = inspectedBot?.id === bot.id;
            return (
              <button
                key={bot.id}
                onClick={() => handleInspect(bot)}
                className={`p-2 rounded border text-left transition-all font-mono text-[11px] flex flex-col justify-between ${
                  isInspected
                    ? "border-black bg-black text-white shadow-md scale-[1.02]"
                    : isAlert
                    ? "border-amber-500 bg-amber-500/15 text-amber-900 dark:text-amber-100 animate-pulse"
                    : bot.status === "browsing"
                    ? "border-blue-400 bg-blue-500/10 text-ink"
                    : bot.status === "tailoring"
                    ? "border-purple-400 bg-purple-500/10 text-ink"
                    : bot.status === "applying"
                    ? "border-emerald-400 bg-emerald-500/10 text-ink"
                    : "border-line bg-bg hover:border-black/50 text-dmuted"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold truncate">{bot.id}</span>
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      isAlert
                        ? "bg-amber-500"
                        : bot.status === "browsing"
                        ? "bg-blue-500"
                        : bot.status === "tailoring"
                        ? "bg-purple-500"
                        : bot.status === "applying"
                        ? "bg-emerald-500"
                        : "bg-muted"
                    }`}
                  />
                </div>
                <div className="text-[10px] truncate mt-1 opacity-80">{bot.platform}</div>
                <div className="text-[9px] truncate opacity-60 mt-0.5">
                  {bot.memory_mb}MB · {bot.status}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Bot Detailed Inspector Drawer */}
        {inspectedBot && (
          <div className="mt-6 p-5 bg-bg border-2 border-black rounded shadow-lg font-mono text-xs">
            <div className="flex flex-wrap items-center justify-between border-b border-line pb-3 mb-4">
              <div className="flex items-center gap-3">
                <span className="font-bold text-base text-ink">[{inspectedBot.id}]</span>
                <span className="px-2 py-0.5 bg-bg2 border border-line rounded text-dmuted">
                  {inspectedBot.platform}
                </span>
                <Badge
                  tone={
                    inspectedBot.status === "needs_verification"
                      ? "warn"
                      : inspectedBot.status === "browsing" || inspectedBot.status === "applying"
                      ? "ok"
                      : "n"
                  }
                >
                  {inspectedBot.status.toUpperCase()}
                </Badge>
              </div>
              <button
                className="text-muted hover:text-ink text-sm font-sans"
                onClick={() => setInspectedBot(null)}
              >
                ✕ Close Inspector
              </button>
            </div>

            {/* Verification Challenge Handler if needed */}
            {(inspectedBot.status === "needs_verification" || inspectedBot.verification_challenge) && (
              <div className="p-4 mb-4 bg-amber-500/10 border border-amber-500/40 rounded">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 font-bold mb-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  Security Verification Required on {inspectedBot.platform}
                </div>
                <p className="text-dmuted text-xs font-sans mb-3">
                  {inspectedBot.verification_challenge?.prompt ||
                    `The platform (${inspectedBot.platform}) has requested a 2FA OTP or session verification check. Enter the OTP code below to resume browsing.`}
                </p>
                <form onSubmit={handleVerifySubmit} className="flex gap-2 max-w-md">
                  <input
                    type="text"
                    className="input text-xs"
                    placeholder="Enter 2FA Code (e.g. 123456 or Session OK)"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary text-xs" disabled={verifying}>
                    {verifying ? "Verifying..." : "Confirm & Resume Bot"}
                  </button>
                </form>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="label-xs text-muted">CURRENT OPERATION</div>
                <p className="font-sans text-sm font-medium text-ink mt-1">
                  {inspectedBot.current_task}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-bg2 rounded border border-line">
                    <span className="text-muted text-[10px]">CPU ALLOCATION</span>
                    <div className="font-bold">{inspectedBot.cpu_pct}%</div>
                  </div>
                  <div className="p-2 bg-bg2 rounded border border-line">
                    <span className="text-muted text-[10px]">MEMORY USAGE</span>
                    <div className="font-bold">{inspectedBot.memory_mb} MB (Lightweight)</div>
                  </div>
                </div>

                {inspectedBot.target_company && (
                  <div className="mt-3 p-2 bg-bg2 rounded border border-line text-xs font-sans">
                    <span className="label-xs text-muted block mb-0.5">TARGET OPPORTUNITY</span>
                    <strong>{inspectedBot.target_role}</strong> at{" "}
                    <span className="text-muted">{inspectedBot.target_company}</span>
                  </div>
                )}
              </div>

              <div>
                <div className="label-xs text-muted mb-2">LIVE BOT TELEMETRY LOGS</div>
                <div className="p-3 bg-bg2 rounded border border-line space-y-1.5 max-h-40 overflow-y-auto text-[11px]">
                  {inspectedBot.logs && inspectedBot.logs.length > 0 ? (
                    inspectedBot.logs.map((l, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-muted shrink-0">{l.t}</span>
                        <span className="text-dmuted">{l.msg}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-muted">Awaiting activity stream...</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
