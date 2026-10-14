"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "../ui";
import { GraphNode } from "./types";
import { GRAPH_NODES, GRAPH_EDGES } from "./constants";
import { ArrowDown, Cpu, HardDrive, CheckCircle, AlertTriangle, Play } from "lucide-react";
import { type BotTelemetry } from "@/lib/swarm";

interface PipelineSvgGraphProps {
  running: boolean;
  selectedNodeId: number;
  onSelectNode: (id: number) => void;
  onFilterPool: (poolKey: "all" | "discovery" | "tailor" | "apply" | "notion") => void;
  bots?: BotTelemetry[];
  inspectedBotId?: string;
  onInspectBot?: (bot: BotTelemetry) => void;
  notionConnected?: boolean;
}

interface DotPosition {
  bot: BotTelemetry;
  x: number;
  y: number;
  hubX: number;
  hubY: number;
}

export function PipelineSvgGraph({
  running,
  selectedNodeId,
  onSelectNode,
  onFilterPool,
  bots = [],
  inspectedBotId,
  onInspectBot,
  notionConnected = false,
}: PipelineSvgGraphProps) {
  const selectedNode = GRAPH_NODES.find((n) => n.id === selectedNodeId) || GRAPH_NODES[0];
  const [hoveredBot, setHoveredBot] = useState<{ bot: BotTelemetry; x: number; y: number } | null>(null);

  // Distribute bots into working dot nodes positioned around their respective macro hubs
  const dotPositions: DotPosition[] = React.useMemo(() => {
    if (!bots || bots.length === 0) return [];

    const node1 = GRAPH_NODES.find((n) => n.id === 1)!; // Profile (570, 180)
    const node2 = GRAPH_NODES.find((n) => n.id === 2)!; // Job Finders (450, 280)
    const node3 = GRAPH_NODES.find((n) => n.id === 3)!; // Smart Matcher (250, 300)
    const node4 = GRAPH_NODES.find((n) => n.id === 4)!; // Resume Maker (210, 150)
    const node5 = GRAPH_NODES.find((n) => n.id === 5)!; // Auto-Applier (410, 120)
    const node6 = GRAPH_NODES.find((n) => n.id === 6)!; // Notion Tracker (80, 70)

    const discBots = bots.filter((b) => b.pool === "discovery");
    const tailorBots = bots.filter((b) => b.pool === "tailor");
    const applyBots = bots.filter((b) => b.pool === "apply");
    const notionBots = bots.filter((b) => b.pool === "notion");

    const positions: DotPosition[] = [];

    // Helper to distribute items along an elliptical orbit
    const orbit = (
      items: BotTelemetry[],
      hub: GraphNode,
      rx: number,
      ry: number,
      startAngle = 0
    ) => {
      const n = items.length;
      if (n === 0) return;
      const angleStep = (2 * Math.PI) / n;
      items.forEach((bot, idx) => {
        const angle = startAngle + idx * angleStep;
        // add slight natural organic jitter based on index
        const jitter = (idx % 3) * 3 - 3;
        const x = hub.x + (rx + jitter) * Math.cos(angle);
        const y = hub.y + (ry + jitter) * Math.sin(angle);
        positions.push({ bot, x, y, hubX: hub.x, hubY: hub.y });
      });
    };

    // 1. Discovery Crawlers around Node 2 (Job Finders)
    orbit(discBots, node2, 58, 46, 0.4);

    // 2. Matcher bots (first 40% of tailor pool) around Node 3 (Smart Matcher)
    const halfTailor = Math.floor(tailorBots.length * 0.4);
    orbit(tailorBots.slice(0, halfTailor), node3, 54, 42, 0.8);

    // 3. Resume Maker bots (remaining 60% of tailor pool) around Node 4 (Resume Maker)
    orbit(tailorBots.slice(halfTailor), node4, 56, 46, 0.2);

    // 4. Auto-Applier bots around Node 5 (Auto-Applier)
    orbit(applyBots, node5, 58, 48, 1.2);

    // 5. Notion Sync bots around Node 6 (Notion Tracker)
    orbit(notionBots, node6, 52, 42, 0.5);

    return positions;
  }, [bots]);

  return (
    <>
      {/* Actual Node Diagram SVG Canvas with Interactive Agent Dot Nodes */}
      <div className="relative py-3 px-2 bg-neutral-50 border border-neutral-200 rounded overflow-x-auto flex flex-col items-center select-none">
        <svg
          viewBox="0 0 660 380"
          className="w-full max-w-[660px] h-auto select-none"
          style={{ minWidth: "480px" }}
        >
          {/* Subtle Grid Filaments */}
          <defs>
            <radialGradient id="dotPulse" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#000000" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Connecting Edges between Hubs */}
          <g id="edges">
            {GRAPH_EDGES.map(([fromId, toId]) => {
              const fromNode = GRAPH_NODES.find((n) => n.id === fromId)!;
              const toNode = GRAPH_NODES.find((n) => n.id === toId)!;
              const isConnectedToSelected = selectedNodeId === fromId || selectedNodeId === toId;

              return (
                <g key={`${fromId}-${toId}`}>
                  {/* Base Solid Circuit Cable */}
                  <line
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke="#000000"
                    strokeWidth={isConnectedToSelected ? "4" : "2.5"}
                    strokeLinecap="round"
                    opacity={isConnectedToSelected ? 0.9 : 0.4}
                  />

                  {/* Animated Stream Flow Overlay when Running */}
                  {running && (
                    <line
                      x1={fromNode.x}
                      y1={fromNode.y}
                      x2={toNode.x}
                      y2={toNode.y}
                      stroke="#000000"
                      strokeWidth="2"
                      strokeDasharray="6 6"
                      strokeLinecap="round"
                      className="flow-active"
                    />
                  )}
                </g>
              );
            })}
          </g>

          {/* Micro-Vector Filaments connecting each Agent Dot Node to its Parent Hub */}
          <g id="filaments" opacity={running ? 0.4 : 0.2}>
            {dotPositions.map((pos) => (
              <line
                key={`fil-${pos.bot.id}`}
                x1={pos.hubX}
                y1={pos.hubY}
                x2={pos.x}
                y2={pos.y}
                stroke="#000000"
                strokeWidth="0.75"
                strokeDasharray="2 3"
              />
            ))}
          </g>

          {/* Working Dot Nodes of EACH Agent */}
          <g id="agent-dots">
            {dotPositions.map((pos) => {
              const isInspected = inspectedBotId === pos.bot.id;
              const isAlert = pos.bot.status === "needs_verification" || pos.bot.verification_challenge;
              const isActive =
                running &&
                (pos.bot.status === "browsing" ||
                  pos.bot.status === "analyzing" ||
                  pos.bot.status === "tailoring" ||
                  pos.bot.status === "applying");

              return (
                <g
                  key={pos.bot.id}
                  className="cursor-pointer"
                  onClick={() => onInspectBot && onInspectBot(pos.bot)}
                  onMouseEnter={() => setHoveredBot({ bot: pos.bot, x: pos.x, y: pos.y })}
                  onMouseLeave={() => setHoveredBot(null)}
                >
                  {/* Outer Pulsating Ring when Active */}
                  {isActive && (
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={11}
                      fill="none"
                      stroke="#000000"
                      strokeWidth="1.5"
                      opacity={0.6}
                      className="animate-ping"
                    />
                  )}

                  {/* Selected Highlight Ring */}
                  {isInspected && (
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={9}
                      fill="none"
                      stroke="#000000"
                      strokeWidth="2"
                    />
                  )}

                  {/* Physical Agent Dot Node */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isInspected ? 6.5 : isActive ? 5.5 : 4.5}
                    fill={isAlert ? "#ef4444" : isActive || isInspected ? "#000000" : "#ffffff"}
                    stroke={isAlert ? "#b91c1c" : "#000000"}
                    strokeWidth={isInspected ? 2.5 : 1.5}
                    className="transition-all duration-200 hover:scale-125"
                  />

                  {/* Inner Micro Accent for Completed or Idle */}
                  {pos.bot.status === "completed" && !isActive && (
                    <circle cx={pos.x} cy={pos.y} r={1.5} fill="#ffffff" />
                  )}
                </g>
              );
            })}
          </g>

          {/* Vertices / Circular Macro Hubs */}
          <g id="nodes">
            {GRAPH_NODES.map((n) => {
              const isSelected = selectedNodeId === n.id;
              return (
                <motion.g
                  key={n.id}
                  className="cursor-pointer group"
                  style={{ transformOrigin: `${n.x}px ${n.y}px` }}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  onClick={() => onSelectNode(n.id)}
                >
                  {/* Outer Selection Ring */}
                  {isSelected && (
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={38}
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
                    r={30}
                    fill={isSelected ? "#000000" : "#ffffff"}
                    stroke="#000000"
                    strokeWidth="3.5"
                    className="transition-colors duration-150 group-hover:stroke-black shadow-sm"
                  />

                  {/* Node Number Text */}
                  <text
                    x={n.x}
                    y={n.y + 8}
                    textAnchor="middle"
                    fill={isSelected ? "#ffffff" : "#000000"}
                    fontSize="22"
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
                    fontSize="9.5"
                    fontWeight="bold"
                    fontFamily="monospace"
                    className="pointer-events-none select-none tracking-tight"
                  >
                    {n.label}
                  </text>
                </motion.g>
              );
            })}
          </g>
        </svg>

        {/* Live Hover Tooltip for Agent Dot Nodes */}
        {hoveredBot && (
          <div
            className="absolute z-20 pointer-events-none bg-black text-white p-2.5 rounded shadow-xl text-left font-mono text-[11px] max-w-xs animate-in fade-in zoom-in-95 duration-150"
            style={{
              left: `${Math.min(520, Math.max(20, (hoveredBot.x / 660) * 100))}%`,
              top: `${Math.min(260, Math.max(10, (hoveredBot.y / 380) * 100))}%`,
            }}
          >
            <div className="flex items-center justify-between gap-2 border-b border-neutral-700 pb-1 mb-1.5">
              <span className="font-bold text-white uppercase">{hoveredBot.bot.id}</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-neutral-800 rounded font-semibold text-neutral-300">
                {hoveredBot.bot.status.toUpperCase()}
              </span>
            </div>
            <div className="text-[10px] text-neutral-300">
              Platform: <strong className="text-white">{hoveredBot.bot.platform}</strong>
            </div>
            <div className="text-[10px] text-neutral-400 mt-1 line-clamp-2 font-sans">
              {hoveredBot.bot.current_task}
            </div>
            <div className="flex items-center gap-3 mt-2 text-[10px] text-neutral-400 border-t border-neutral-800 pt-1">
              <span>CPU: {hoveredBot.bot.cpu_pct}%</span>
              <span>RAM: {hoveredBot.bot.memory_mb}MB</span>
            </div>
          </div>
        )}

        {/* Sub-canvas live dot telemetry badge */}
        <div className="mt-2 text-[11px] text-neutral-600 font-mono flex flex-wrap items-center justify-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-white border border-black inline-block" />
            <span>Idle / Standby</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-black inline-block" />
            <span>Active Worker ({running ? "Working" : "Ready"})</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
            <span>Needs Verification</span>
          </span>
          <span className="text-neutral-500 font-sans">
            (Hover or click any agent dot node to inspect its live activity)
          </span>
        </div>
      </div>

      {/* Selected Node Details Card with Smooth Motion Transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedNode.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 p-5 bg-neutral-100 border border-neutral-300 rounded font-sans"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-300 pb-3 mb-4 font-mono">
            <div className="flex items-center gap-2.5">
              <span className="px-2 py-0.5 bg-black text-white text-xs font-bold rounded">
                STEP {selectedNode.id}
              </span>
              <h4 className="text-base font-bold text-black font-sans">{selectedNode.title}</h4>
              <span className="text-xs text-neutral-600 font-sans">({selectedNode.role})</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Badge tone="dark">{selectedNode.badge}</Badge>
              <button
                className="btn text-xs py-1 px-2.5 bg-white border border-neutral-300 text-black hover:border-black font-mono inline-flex items-center gap-1"
                onClick={() => onFilterPool(selectedNode.poolKey)}
              >
                <span>View Agents Below</span>
                <ArrowDown className="w-3 h-3" />
              </button>
            </div>
          </div>

          <p className="text-xs text-neutral-700 leading-relaxed max-w-4xl mb-4 font-sans">
            {selectedNode.desc}
          </p>

          {/* Simple Step Highlights Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            {selectedNode.stats.map((s, idx) => (
              <div key={idx} className="p-2.5 bg-white rounded border border-neutral-300">
                <div className="text-[10px] text-neutral-500 uppercase">{s.label}</div>
                <div className="font-bold text-sm text-black mt-0.5">{s.val}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
