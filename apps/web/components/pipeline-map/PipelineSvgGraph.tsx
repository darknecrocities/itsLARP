"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "../ui";
import { GraphNode } from "./types";
import { GRAPH_NODES, GRAPH_EDGES } from "./constants";
import { ArrowDown, Play, Pause, Plus, Activity, Sparkles, Send } from "lucide-react";
import { type BotTelemetry } from "@/lib/swarm";
import {
  getEdgePoint,
  buildWorkerLeaves,
  INITIAL_PACKETS,
  type DataPacket,
  type WorkerLeaf,
} from "./treeMath";

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

export function PipelineSvgGraph({
  running,
  selectedNodeId,
  onSelectNode,
  onFilterPool,
  bots = [],
  inspectedBotId,
  onInspectBot,
}: PipelineSvgGraphProps) {
  const selectedNode = GRAPH_NODES.find((n) => n.id === selectedNodeId) || GRAPH_NODES[0];
  const [hoveredBot, setHoveredBot] = useState<{ bot: BotTelemetry; x: number; y: number } | null>(null);
  const [spawnedCount, setSpawnedCount] = useState(0);
  const [recentlySpawnedId, setRecentlySpawnedId] = useState<string | null>(null);

  // Animated In-Flight Data Packets traversing the tree branches
  const [packets, setPackets] = useState<DataPacket[]>(INITIAL_PACKETS);

  // Animation loop updating data packets along tree branches
  useEffect(() => {
    if (!running) return;
    let animId: number;
    const animate = () => {
      setPackets((prev) =>
        prev.map((pkt) => ({
          ...pkt,
          t: (pkt.t + pkt.speed) % 1,
        }))
      );
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [running]);

  // Leaf Worker Nodes arranged under Level 2 nodes (4, 5, 6, 7)
  const workerLeaves: WorkerLeaf[] = useMemo(() => {
    return buildWorkerLeaves(bots, spawnedCount);
  }, [bots, spawnedCount]);

  // Spawn New Agent Handler
  const handleSpawnAgent = () => {
    const newIdx = spawnedCount + 1;
    setSpawnedCount(newIdx);
    const newId = `SPAWNED-BOT-${newIdx}`;
    setRecentlySpawnedId(newId);
    setTimeout(() => setRecentlySpawnedId(null), 2500);
  };

  return (
    <>
      {/* Top Tree Telemetry Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-2 bg-neutral-100 rounded border border-neutral-300 text-xs font-mono mb-3">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-black font-semibold">
            <Activity className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>Binary Search Tree: Active Agent Topology</span>
          </span>
          <span className="text-neutral-500 hidden sm:inline">
            Traversal: <strong className="text-black">Pre-Order Hierarchical Flow</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {recentlySpawnedId && (
            <span className="text-[10px] text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded font-bold animate-pulse">
              +1 Node Spawned: {recentlySpawnedId}
            </span>
          )}
          <button
            onClick={handleSpawnAgent}
            className="btn text-xs py-1 px-2.5 bg-black text-white hover:bg-neutral-800 flex items-center gap-1 transition-all"
            title="Dynamically spawn a new agent node into the binary tree"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Spawn Agent Node</span>
          </button>
        </div>
      </div>

      {/* Actual Binary Search Tree Canvas */}
      <div className="relative py-4 px-2 bg-neutral-50 border border-neutral-200 rounded overflow-x-auto flex flex-col items-center select-none">
        <svg
          viewBox="0 0 900 480"
          className="w-full max-w-[900px] h-auto select-none"
          style={{ minWidth: "580px" }}
        >
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Depth Level Indicator Labels on Left Margin */}
          <g id="tree-level-indicators" opacity={0.65} className="font-mono text-[10px]">
            <text x="18" y="58" fill="#525252" fontWeight="bold">L0 • ROOT DISPATCHER</text>
            <text x="18" y="178" fill="#525252" fontWeight="bold">L1 • SWARM PARTITIONS</text>
            <text x="18" y="298" fill="#525252" fontWeight="bold">L2 • SPECIALIZED HUBS</text>
            <text x="18" y="415" fill="#525252" fontWeight="bold">L3 • WORKER PODS</text>
          </g>

          {/* Tree Edge Branches */}
          <g id="tree-branches">
            {GRAPH_EDGES.map(([fromId, toId]) => {
              const fromNode = GRAPH_NODES.find((n) => n.id === fromId)!;
              const toNode = GRAPH_NODES.find((n) => n.id === toId)!;
              const isSelected = selectedNodeId === fromId || selectedNodeId === toId;
              const isBridge = fromId === 5 && toId === 6;
              const isFeedback = fromId === 7 && toId === 1;

              // Construct smooth Bezier curve
              let d = `M ${fromNode.x} ${fromNode.y} C ${fromNode.x} ${(fromNode.y + toNode.y) / 2}, ${toNode.x} ${(fromNode.y + toNode.y) / 2}, ${toNode.x} ${toNode.y}`;
              if (isBridge) {
                d = `M ${fromNode.x} ${fromNode.y} Q 450 340, ${toNode.x} ${toNode.y}`;
              } else if (isFeedback) {
                d = `M ${fromNode.x} ${fromNode.y} C 870 190, 620 25, ${toNode.x} ${toNode.y}`;
              }

              return (
                <g key={`edge-${fromId}-${toId}`}>
                  {/* Base Circuit Cable */}
                  <path
                    d={d}
                    fill="none"
                    stroke={isBridge ? "#f59e0b" : isFeedback ? "#6366f1" : "#171717"}
                    strokeWidth={isSelected ? 3.5 : isBridge ? 2 : 2.5}
                    strokeDasharray={isBridge || isFeedback ? "5 4" : undefined}
                    opacity={isSelected ? 0.95 : 0.45}
                    strokeLinecap="round"
                  />
                  {/* Animated Stream Pulses when Running */}
                  {running && (
                    <path
                      d={d}
                      fill="none"
                      stroke={isBridge ? "#f59e0b" : "#000000"}
                      strokeWidth={isSelected ? 2 : 1.5}
                      strokeDasharray="4 6"
                      strokeLinecap="round"
                      className="flow-active"
                      opacity={0.7}
                    />
                  )}
                </g>
              );
            })}
          </g>

          {/* Connecting Filaments from Level 2 Hubs to Leaf Worker Nodes */}
          <g id="worker-filaments" opacity={0.35}>
            {workerLeaves.map((leaf) => {
              const parent = GRAPH_NODES.find((n) => n.id === leaf.parentId)!;
              return (
                <line
                  key={`fil-${leaf.id}`}
                  x1={parent.x}
                  y1={parent.y}
                  x2={leaf.x}
                  y2={leaf.y}
                  stroke="#171717"
                  strokeWidth="1"
                  strokeDasharray="2 3"
                />
              );
            })}
          </g>

          {/* Dynamically Spawning Leaf Worker Nodes */}
          <g id="worker-nodes">
            {workerLeaves.map((leaf) => {
              const isInspected = inspectedBotId === leaf.bot.id;
              const isNewlySpawned = recentlySpawnedId === leaf.id;

              return (
                <g
                  key={leaf.id}
                  className="cursor-pointer"
                  onClick={() => onInspectBot && onInspectBot(leaf.bot)}
                  onMouseEnter={() => setHoveredBot({ bot: leaf.bot, x: leaf.x, y: leaf.y })}
                  onMouseLeave={() => setHoveredBot(null)}
                >
                  {/* Spawn ripple effect */}
                  {(running || isNewlySpawned) && (
                    <circle
                      cx={leaf.x}
                      cy={leaf.y}
                      r={isNewlySpawned ? 14 : 9}
                      fill="none"
                      stroke={isNewlySpawned ? "#10b981" : "#000000"}
                      strokeWidth={isNewlySpawned ? 2 : 1}
                      opacity={0.6}
                      className="animate-ping"
                    />
                  )}

                  {/* Worker Node Physical Circle */}
                  <circle
                    cx={leaf.x}
                    cy={leaf.y}
                    r={isInspected ? 6.5 : isNewlySpawned ? 6 : 4.5}
                    fill={isNewlySpawned ? "#10b981" : isInspected ? "#000000" : "#ffffff"}
                    stroke={isNewlySpawned ? "#059669" : "#000000"}
                    strokeWidth={isInspected ? 2.5 : 1.5}
                    className="transition-all duration-200 hover:scale-150"
                  />
                </g>
              );
            })}
          </g>

          {/* Animated Data Packets Flowing Between Nodes */}
          {running && (
            <g id="data-packets">
              {packets.map((pkt) => {
                const fromNode = GRAPH_NODES.find((n) => n.id === pkt.fromId);
                const toNode = GRAPH_NODES.find((n) => n.id === pkt.toId);
                if (!fromNode || !toNode) return null;

                const pos = getEdgePoint(fromNode, toNode, pkt.t);

                return (
                  <g key={pkt.id} className="pointer-events-none select-none">
                    {/* Glowing outer halo */}
                    <circle cx={pos.x} cy={pos.y} r={7} fill={pkt.color} opacity={0.3} filter="url(#glow)" />
                    {/* Central Packet Sphere */}
                    <circle cx={pos.x} cy={pos.y} r={3.5} fill={pkt.color} stroke="#ffffff" strokeWidth="1" />
                    {/* Packet Micro Label Tag */}
                    <text
                      x={pos.x + 6}
                      y={pos.y - 5}
                      fill="#000000"
                      fontSize="8"
                      fontWeight="bold"
                      fontFamily="monospace"
                      opacity={0.85}
                    >
                      {pkt.label}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* Macro Binary Tree Hub Nodes */}
          <g id="macro-tree-nodes">
            {GRAPH_NODES.map((n) => {
              const isSelected = selectedNodeId === n.id;
              const isRoot = n.id === 1;

              return (
                <motion.g
                  key={n.id}
                  className="cursor-pointer group"
                  style={{ transformOrigin: `${n.x}px ${n.y}px` }}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => onSelectNode(n.id)}
                >
                  {/* Selection Pulsing Aura */}
                  {isSelected && (
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={isRoot ? 36 : 30}
                      fill="none"
                      stroke="#000000"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                      className="animate-spin"
                      style={{ animationDuration: "12s" }}
                    />
                  )}

                  {/* Main Node Circle */}
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r={isRoot ? 28 : 22}
                    fill={isSelected ? "#000000" : isRoot ? "#171717" : "#ffffff"}
                    stroke="#000000"
                    strokeWidth={isRoot ? "3.5" : "2.5"}
                    className="transition-colors duration-200 shadow-md"
                  />

                  {/* Step ID Number */}
                  <text
                    x={n.x}
                    y={n.y + (isRoot ? 6 : 5)}
                    textAnchor="middle"
                    fill={isSelected || isRoot ? "#ffffff" : "#000000"}
                    fontSize={isRoot ? "16" : "13"}
                    fontWeight="bold"
                    fontFamily="monospace"
                    className="pointer-events-none select-none"
                  >
                    {n.id}
                  </text>

                  {/* Clean Node Label (Positioned without overlap) */}
                  <text
                    x={n.x}
                    y={n.labelY - (isRoot ? 20 : 0)}
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

        {/* Live Hover Tooltip for Worker Nodes */}
        {hoveredBot && (
          <div
            className="absolute z-30 pointer-events-none bg-black text-white p-2.5 rounded shadow-2xl text-left font-mono text-[11px] max-w-xs animate-in fade-in zoom-in-95 duration-150"
            style={{
              left: `${Math.min(560, Math.max(30, (hoveredBot.x / 900) * 100))}%`,
              top: `${Math.min(320, Math.max(20, (hoveredBot.y / 480) * 100))}%`,
            }}
          >
            <div className="flex items-center justify-between gap-2 border-b border-neutral-700 pb-1 mb-1.5">
              <span className="font-bold text-white uppercase">{hoveredBot.bot.id}</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-neutral-800 rounded font-semibold text-emerald-400">
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

        {/* Legend */}
        <div className="mt-3 text-[11px] text-neutral-600 font-mono flex flex-wrap items-center justify-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-black inline-block" />
            <span>Root / Partition Hub</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-white border border-black inline-block" />
            <span>Leaf Cluster</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span>Active Worker Node</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
            <span>Data Packet in Transit</span>
          </span>
          <span className="text-neutral-500 font-sans">
            (Click any node to inspect telemetry or spawn agents)
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
                <span>View Agents in this Subtree</span>
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
