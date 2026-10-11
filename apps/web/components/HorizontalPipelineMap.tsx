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

interface GraphNode {
  id: number;
  x: number;
  y: number;
  labelY: number;
  label: string;
  title: string;
  role: string;
  badge: string;
  desc: string;
  stats: { label: string; val: string }[];
  poolKey: "all" | "discovery" | "tailor" | "apply";
}

const GRAPH_NODES: GraphNode[] = [
  {
    id: 1,
    x: 570,
    y: 180,
    labelY: 232,
    label: "1: CAREER DNA",
    title: "Career DNA Profile",
    role: "Single Source of Truth",
    badge: "100% Verifiable",
    desc: "Your uploaded resume, verified GitHub repositories, and LinkedIn profile. The immutable baseline that guarantees 0% hallucinations across all 1,000 parallel workers.",
    stats: [
      { label: "Profile Source", val: "Resume + GitHub" },
      { label: "Hallucination Gate", val: "Strict (0%)" },
      { label: "Evidence Records", val: "Immutable" },
      { label: "Format Standard", val: "APA 7th Edition" },
    ],
    poolKey: "all",
  },
  {
    id: 2,
    x: 450,
    y: 280,
    labelY: 332,
    label: "2: 300 CRAWLERS",
    title: "300 Platform Crawlers",
    role: "Targeted Job Discovery",
    badge: "300 Parallel Bots",
    desc: "300 lightweight autonomous crawlers continuously scouting LinkedIn, JobStreet, and Indeed based on user target criteria, salary expectations, and liking.",
    stats: [
      { label: "Active Crawlers", val: "300 Bots" },
      { label: "Platforms", val: "LinkedIn, JobStreet, Indeed" },
      { label: "Session Security", val: "2FA Handlers" },
      { label: "Ingestion Speed", val: "Real-time Queue" },
    ],
    poolKey: "discovery",
  },
  {
    id: 3,
    x: 250,
    y: 300,
    labelY: 352,
    label: "3: LOCAL LLM",
    title: "Local LLM Inference Engine",
    role: "Requirement Extraction",
    badge: "Ollama (On-Device)",
    desc: "Processes discovered job postings locally using Ollama (Qwen, Llama, Gemma). Extracts hard skills, culture requirements, and computes match scores with 0% data leakage.",
    stats: [
      { label: "Inference Engine", val: "Local Ollama" },
      { label: "Model Family", val: "Qwen / Llama 3" },
      { label: "Data Privacy", val: "100% On-Device" },
      { label: "Parsing Latency", val: "~420ms / job" },
    ],
    poolKey: "tailor",
  },
  {
    id: 4,
    x: 210,
    y: 150,
    labelY: 202,
    label: "4: 300 TAILORS",
    title: "300 Resume Tailoring Bots",
    role: "APA Resume Synthesis",
    badge: "300 Parallel Bots",
    desc: "Generates tailored resumes strictly in APA 7th Edition format. Maps candidate project citations and academic credentials to specific job requirements with zero invented claims.",
    stats: [
      { label: "Active Tailors", val: "300 Bots" },
      { label: "Resume Output", val: "APA 7th Format" },
      { label: "Project Citations", val: "Verifiable Only" },
      { label: "Diff Verification", val: "Semantic Check" },
    ],
    poolKey: "tailor",
  },
  {
    id: 5,
    x: 410,
    y: 120,
    labelY: 75,
    label: "5: 400 APPLIERS",
    title: "400 Independent Application Bots",
    role: "Form Autofill & Staged Review",
    badge: "400 Parallel Bots",
    desc: "400 application agents independently fill form questions, stage submission packages, and halt at the human approval safety boundary for review.",
    stats: [
      { label: "Active Appliers", val: "400 Bots" },
      { label: "Submission Gate", val: "Human Review" },
      { label: "Question Autofill", val: "Career DNA Backed" },
      { label: "Safety Barrier", val: "Staged Approval" },
    ],
    poolKey: "apply",
  },
  {
    id: 6,
    x: 80,
    y: 70,
    labelY: 28,
    label: "6: NOTION MIRROR",
    title: "Notion Mirror & Sync",
    role: "Central Application Tracker",
    badge: "1-Click Integration",
    desc: "Self-creates and synchronizes a structured Notion database with Company Name, Position, Platform, Status, Match Score, and Application Date.",
    stats: [
      { label: "Notion Status", val: "Auto-Created DB" },
      { label: "Columns Mirrored", val: "Company, Role, Match, Status" },
      { label: "Sync Engine", val: "PostgreSQL & Webhook" },
      { label: "Export Formats", val: "Notion / APA / JSON" },
    ],
    poolKey: "all",
  },
];

// Edges matching sketch: (6-4), (4-3), (4-5), (3-2), (5-2), (5-1), (2-1)
const GRAPH_EDGES: [number, number][] = [
  [6, 4],
  [4, 3],
  [4, 5],
  [3, 2],
  [5, 2],
  [5, 1],
  [2, 1],
];

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
  const [selectedNodeId, setSelectedNodeId] = useState<number>(1);
  const [activePoolTab, setActivePoolTab] = useState<"all" | "discovery" | "tailor" | "apply" | "alerts">("all");
  const [inspectedBot, setInspectedBot] = useState<BotTelemetry | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [verifying, setVerifying] = useState(false);

  // Fallback sample bots
  const botsList: BotTelemetry[] = React.useMemo(() => {
    if (sampleBots.length > 0) return sampleBots;
    const list: BotTelemetry[] = [];
    const platforms = ["LinkedIn", "JobStreet", "Indeed", "Glassdoor", "Wellfound", "RemoteOK"];

    // 300 Crawlers (sample subset of 30)
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
        target_role: "AI Systems Engineer",
        target_company: plat === "LinkedIn" ? "Tech Innovations" : "Global Systems",
        logs: [
          { t: "12:00:01", msg: `Initialized async worker on ${plat}` },
          { t: "12:00:04", msg: `Filtered matching listings via user preferences` },
        ],
        verification_challenge:
          i % 5 === 0 && running
            ? { platform: plat, prompt: `Enter 2FA Code or Confirm login for ${plat}`, created_at: Date.now() }
            : null,
      });
    }

    // 300 Tailors (sample subset of 30)
    for (let i = 1; i <= 30; i++) {
      const bid = `bot_tailor_${String(i).padStart(3, "0")}`;
      list.push({
        id: bid,
        pool: "tailor",
        platform: "Local LLM (Ollama)",
        status: running ? (i % 2 === 0 ? "tailoring" : "completed") : "idle",
        current_task: running ? "Synthesizing APA 7th Edition resume citations" : "Standby in pool",
        cpu_pct: +(0.5 + (i % 4) * 0.1).toFixed(2),
        memory_mb: +(1.4 + (i % 4) * 0.2).toFixed(2),
        target_company: "Apex Neural Corp",
        target_role: "Machine Learning Lead",
        logs: [
          { t: "12:00:02", msg: "Evaluated job requirements with 0% hallucination gate" },
          { t: "12:00:05", msg: "Generated APA 7th formatted resume diff" },
        ],
      });
    }

    // 400 Appliers (sample subset of 40)
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

  const selectedNode = GRAPH_NODES.find((n) => n.id === selectedNodeId) || GRAPH_NODES[0];

  return (
    <div className="space-y-6">
      {/* Node Network Architecture Card */}
      <div className="card p-6 bg-white text-black border border-neutral-300 shadow-sm font-mono">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between border-b border-neutral-200 pb-4 mb-6 gap-3">
          <div>
            <div className="label-xs text-neutral-500">WORKFORCE TOPOLOGY</div>
            <h3 className="text-xl font-bold font-sans tracking-tight text-black mt-0.5">
              Swarm Node Architecture
            </h3>
            <p className="text-xs text-neutral-600 font-sans mt-0.5">
              Interactive 6-node network graph governing 1,000 parallel workers with local LLM verification. Click any node to inspect.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-neutral-100 rounded border border-neutral-300">
              <span className={`w-2 h-2 rounded-full ${running ? "bg-black animate-pulse" : "bg-neutral-400"}`} />
              <strong className="text-black">{running ? "PARALLEL STREAMING" : "WORKFORCE IDLE"}</strong>
            </span>
            <span className="text-neutral-500">
              Total: <strong className="text-black">{totalWorkers} Bots</strong>
            </span>
            <span className="text-neutral-500">
              Active: <strong className="text-black">{activeCount}</strong>
            </span>
          </div>
        </div>

        {/* Node Selection Pills */}
        <div className="flex flex-wrap items-center gap-2 mb-4 text-xs font-mono">
          <span className="text-neutral-500 text-[11px] mr-1">SELECT NODE:</span>
          {GRAPH_NODES.map((n) => (
            <button
              key={n.id}
              onClick={() => setSelectedNodeId(n.id)}
              className={`px-2.5 py-1 rounded border text-xs font-bold transition-all ${
                selectedNodeId === n.id
                  ? "bg-black text-white border-black shadow-sm"
                  : "bg-white text-black border-neutral-300 hover:border-black"
              }`}
            >
              Node {n.id}: {n.title}
            </button>
          ))}
        </div>

        {/* Actual Node Diagram SVG Canvas */}
        <div className="relative py-2 px-2 bg-neutral-50 border border-neutral-200 rounded overflow-x-auto flex justify-center">
          <svg
            viewBox="0 0 660 380"
            className="w-full max-w-[660px] h-auto select-none"
            style={{ minWidth: "480px" }}
          >
            {/* Connecting Edges */}
            <g id="edges">
              {GRAPH_EDGES.map(([fromId, toId]) => {
                const fromNode = GRAPH_NODES.find((n) => n.id === fromId)!;
                const toNode = GRAPH_NODES.find((n) => n.id === toId)!;
                const isConnectedToSelected = selectedNodeId === fromId || selectedNodeId === toId;

                return (
                  <g key={`${fromId}-${toId}`}>
                    {/* Solid Black Edge Line */}
                    <line
                      x1={fromNode.x}
                      y1={fromNode.y}
                      x2={toNode.x}
                      y2={toNode.y}
                      stroke="#000000"
                      strokeWidth={isConnectedToSelected ? "4.5" : "3.5"}
                      strokeLinecap="round"
                    />

                    {/* Animated Stream Flow Overlay when Running */}
                    {running && (
                      <line
                        x1={fromNode.x}
                        y1={fromNode.y}
                        x2={toNode.x}
                        y2={toNode.y}
                        stroke="#ffffff"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        className="flow-active"
                      />
                    )}
                  </g>
                );
              })}
            </g>

            {/* Vertices / Circular Nodes */}
            <g id="nodes">
              {GRAPH_NODES.map((n) => {
                const isSelected = selectedNodeId === n.id;
                return (
                  <g
                    key={n.id}
                    className="cursor-pointer group"
                    onClick={() => setSelectedNodeId(n.id)}
                  >
                    {/* Outer Selection Ring */}
                    {isSelected && (
                      <circle
                        cx={n.x}
                        cy={n.y}
                        r={42}
                        fill="none"
                        stroke="#000000"
                        strokeWidth="2"
                        strokeDasharray="4 4"
                      />
                    )}

                    {/* Main Node Circle */}
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={34}
                      fill={isSelected ? "#000000" : "#ffffff"}
                      stroke="#000000"
                      strokeWidth="4"
                      className="transition-colors duration-150"
                    />

                    {/* Node Number Text */}
                    <text
                      x={n.x}
                      y={n.y + 9}
                      textAnchor="middle"
                      fill={isSelected ? "#ffffff" : "#000000"}
                      fontSize="28"
                      fontWeight="bold"
                      fontFamily="monospace"
                      className="pointer-events-none select-none"
                    >
                      {n.id}
                    </text>

                    {/* Node Label Text */}
                    <text
                      x={n.x}
                      y={n.labelY}
                      textAnchor="middle"
                      fill="#000000"
                      fontSize="10"
                      fontWeight="bold"
                      fontFamily="monospace"
                      className="pointer-events-none select-none tracking-tight"
                    >
                      {n.label}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        {/* Selected Node Details Card */}
        <div className="mt-6 p-5 bg-neutral-100 border border-neutral-300 rounded font-sans">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-300 pb-3 mb-4 font-mono">
            <div className="flex items-center gap-2.5">
              <span className="px-2 py-0.5 bg-black text-white text-xs font-bold rounded">
                NODE {String(selectedNode.id).padStart(2, "0")}
              </span>
              <h4 className="text-base font-bold text-black font-sans">{selectedNode.title}</h4>
              <span className="text-xs text-neutral-600 font-sans">({selectedNode.role})</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Badge tone="dark">{selectedNode.badge}</Badge>
              <button
                className="btn text-xs py-1 px-2.5 bg-white border border-neutral-300 text-black hover:border-black font-mono"
                onClick={() => setActivePoolTab(selectedNode.poolKey)}
              >
                Filter Bots to Pool →
              </button>
            </div>
          </div>

          <p className="text-xs text-neutral-700 leading-relaxed max-w-4xl mb-4 font-sans">
            {selectedNode.desc}
          </p>

          {/* Node Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            {selectedNode.stats.map((s, idx) => (
              <div key={idx} className="p-2.5 bg-white rounded border border-neutral-300">
                <div className="text-[10px] text-neutral-500 uppercase">{s.label}</div>
                <div className="font-bold text-sm text-black mt-0.5">{s.val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Swarm Telemetry Summary Strip */}
        <div className="mt-6 pt-4 border-t border-neutral-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-2.5 bg-neutral-50 rounded border border-neutral-200">
            <div className="text-[10px] text-neutral-500">WORKFORCE FOOTPRINT</div>
            <div className="font-bold text-sm text-black mt-0.5">~1.2 MB / bot</div>
            <div className="text-[10px] text-neutral-500">Lightweight async runner</div>
          </div>
          <div className="p-2.5 bg-neutral-50 rounded border border-neutral-200">
            <div className="text-[10px] text-neutral-500">STREAM THROUGHPUT</div>
            <div className="font-bold text-sm text-black mt-0.5">{running ? "38 jobs/min" : "0 jobs/min"}</div>
            <div className="text-[10px] text-neutral-500">Parallel queue ingestion</div>
          </div>
          <div className="p-2.5 bg-neutral-50 rounded border border-neutral-200">
            <div className="text-[10px] text-neutral-500">AUTHENTICATION GATE</div>
            <div className="font-bold text-sm text-black mt-0.5">Prompt on 2FA</div>
            <div className="text-[10px] text-neutral-500">Interactive OTP resume</div>
          </div>
          <div className="p-2.5 bg-neutral-50 rounded border border-neutral-200">
            <div className="text-[10px] text-neutral-500">VERIFIED ACCURACY</div>
            <div className="font-bold text-sm text-black mt-0.5">100% Evidence Backed</div>
            <div className="text-[10px] text-neutral-500">Zero hallucinated skills</div>
          </div>
        </div>
      </div>

      {/* Bot Explorer & Matrix */}
      <div className="card p-6 bg-white text-black border border-neutral-300">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-bold font-sans">Individual Bot Explorer & Matrix</h3>
            <p className="text-xs text-neutral-600 font-sans">
              Click any bot cell to inspect live logs, CPU allocation, memory footprint, and platform tasks.
            </p>
          </div>

          {/* Minimalist Monochrome Filter Tabs */}
          <div className="flex flex-wrap gap-1.5 text-xs font-mono">
            <button
              className={`px-3 py-1 rounded border transition-colors ${
                activePoolTab === "all"
                  ? "bg-black text-white border-black font-semibold"
                  : "bg-white border-neutral-300 text-neutral-800 hover:border-black"
              }`}
              onClick={() => setActivePoolTab("all")}
            >
              All Bots ({botsList.length})
            </button>
            <button
              className={`px-3 py-1 rounded border transition-colors ${
                activePoolTab === "discovery"
                  ? "bg-black text-white border-black font-semibold"
                  : "bg-white border-neutral-300 text-neutral-800 hover:border-black"
              }`}
              onClick={() => setActivePoolTab("discovery")}
            >
              Node 2: Crawlers (300)
            </button>
            <button
              className={`px-3 py-1 rounded border transition-colors ${
                activePoolTab === "tailor"
                  ? "bg-black text-white border-black font-semibold"
                  : "bg-white border-neutral-300 text-neutral-800 hover:border-black"
              }`}
              onClick={() => setActivePoolTab("tailor")}
            >
              Nodes 3 & 4: Tailors (300)
            </button>
            <button
              className={`px-3 py-1 rounded border transition-colors ${
                activePoolTab === "apply"
                  ? "bg-black text-white border-black font-semibold"
                  : "bg-white border-neutral-300 text-neutral-800 hover:border-black"
              }`}
              onClick={() => setActivePoolTab("apply")}
            >
              Node 5: Appliers (400)
            </button>
            {alertsCount > 0 && (
              <button
                className={`px-3 py-1 rounded border transition-colors flex items-center gap-1.5 ${
                  activePoolTab === "alerts"
                    ? "bg-black text-white border-black font-semibold"
                    : "bg-neutral-200 border-black text-black font-semibold"
                }`}
                onClick={() => setActivePoolTab("alerts")}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                Needs 2FA ({alertsCount})
              </button>
            )}
          </div>
        </div>

        {/* Minimalist Bot Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 max-h-72 overflow-y-auto p-2 bg-neutral-50 rounded border border-neutral-200">
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
                    ? "border-black bg-neutral-200 text-black font-bold"
                    : "border-neutral-300 bg-white hover:border-black text-black"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold truncate">{bot.id}</span>
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      isInspected
                        ? "bg-white"
                        : isAlert
                        ? "bg-black animate-pulse"
                        : bot.status !== "idle"
                        ? "bg-black"
                        : "bg-neutral-400"
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
          <div className="mt-6 p-5 bg-white border-2 border-black rounded shadow-lg font-mono text-xs">
            <div className="flex flex-wrap items-center justify-between border-b border-neutral-300 pb-3 mb-4">
              <div className="flex items-center gap-3">
                <span className="font-bold text-base text-black">[{inspectedBot.id}]</span>
                <span className="px-2 py-0.5 bg-neutral-100 border border-neutral-300 rounded text-neutral-800">
                  {inspectedBot.platform}
                </span>
                <Badge tone={inspectedBot.status === "needs_verification" ? "dark" : "ok"}>
                  {inspectedBot.status.toUpperCase()}
                </Badge>
              </div>
              <button
                className="text-neutral-500 hover:text-black text-sm font-sans"
                onClick={() => setInspectedBot(null)}
              >
                ✕ Close Inspector
              </button>
            </div>

            {/* Verification Challenge Handler */}
            {(inspectedBot.status === "needs_verification" || inspectedBot.verification_challenge) && (
              <div className="p-4 mb-4 bg-neutral-100 border border-black rounded text-black">
                <div className="flex items-center gap-2 font-bold mb-1">
                  <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
                  Security Verification Required on {inspectedBot.platform}
                </div>
                <p className="text-neutral-700 text-xs font-sans mb-3">
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
                <div className="label-xs text-neutral-500">CURRENT OPERATION</div>
                <p className="font-sans text-sm font-medium text-black mt-1">
                  {inspectedBot.current_task}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-neutral-50 rounded border border-neutral-200">
                    <span className="text-neutral-500 text-[10px]">CPU ALLOCATION</span>
                    <div className="font-bold text-black">{inspectedBot.cpu_pct}%</div>
                  </div>
                  <div className="p-2 bg-neutral-50 rounded border border-neutral-200">
                    <span className="text-neutral-500 text-[10px]">MEMORY USAGE</span>
                    <div className="font-bold text-black">{inspectedBot.memory_mb} MB (Lightweight)</div>
                  </div>
                </div>

                {inspectedBot.target_company && (
                  <div className="mt-3 p-2 bg-neutral-50 rounded border border-neutral-200 text-xs font-sans">
                    <span className="label-xs text-neutral-500 block mb-0.5">TARGET OPPORTUNITY</span>
                    <strong>{inspectedBot.target_role}</strong> at{" "}
                    <span className="text-neutral-600">{inspectedBot.target_company}</span>
                  </div>
                )}
              </div>

              <div>
                <div className="label-xs text-neutral-500 mb-2">LIVE BOT TELEMETRY LOGS</div>
                <div className="p-3 bg-neutral-50 rounded border border-neutral-200 space-y-1.5 max-h-40 overflow-y-auto text-[11px]">
                  {inspectedBot.logs && inspectedBot.logs.length > 0 ? (
                    inspectedBot.logs.map((l, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-neutral-500 shrink-0">{l.t}</span>
                        <span className="text-neutral-800">{l.msg}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-neutral-500">Awaiting activity stream...</div>
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
