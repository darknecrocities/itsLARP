"use client";
import React, { useState, useEffect, useMemo } from "react";
import { GraphNode } from "./types";
import { GRAPH_NODES, GRAPH_EDGES } from "./constants";
import { type BotTelemetry } from "@/lib/swarm";
import {
  getEdgePoint,
  buildWorkerLeaves,
  INITIAL_PACKETS,
  type DataPacket,
  type WorkerLeaf,
} from "./treeMath";
import { NodeDetailsCard } from "./NodeDetailsCard";
import { GraphTelemetryBar } from "./GraphTelemetryBar";

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
  const [isLiveStream, setIsLiveStream] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [fitToView, setFitToView] = useState<boolean>(true);

  // Animated In-Flight Data Packets traversing the tree branches
  const [packets, setPackets] = useState<DataPacket[]>(INITIAL_PACKETS);

  useEffect(() => {
    if (!running && !isLiveStream) return;
    let animId: number;
    const animate = () => {
      setPackets((prev) =>
        prev.map((pkt) => ({
          ...pkt,
          t: (pkt.t + pkt.speed * (running ? 1.4 : 1)) % 1,
        }))
      );
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [running, isLiveStream]);

  const workerLeaves: WorkerLeaf[] = useMemo(() => {
    return buildWorkerLeaves(bots, spawnedCount);
  }, [bots, spawnedCount]);

  const handleSpawnAgent = () => {
    const newIdx = spawnedCount + 1;
    setSpawnedCount(newIdx);
    const newId = `SPAWNED-BOT-${newIdx}`;
    setRecentlySpawnedId(newId);
    setTimeout(() => setRecentlySpawnedId(null), 3000);

    const parentId = 4 + ((newIdx - 1) % 4);
    const parent = GRAPH_NODES.find((n) => n.id === parentId);
    if (onInspectBot && parent) {
      onInspectBot({
        id: newId,
        platform: parentId <= 5 ? "LinkedIn" : "Notion",
        pool: parent.poolKey === "all" ? "discovery" : parent.poolKey,
        status: "browsing",
        current_task: `Dynamically spawned autonomous worker attached to ${parent.title}`,
        cpu_pct: 22 + (newIdx % 10),
        memory_mb: 210 + (newIdx % 50),
        logs: [
          { t: "Just now", msg: `Spawned into ${parent.title} partition.` },
          { t: "Just now", msg: "Awaiting next batch of opportunity vectors." },
        ],
      });
    }
  };

  const isNetworkActive = running || isLiveStream;

  return (
    <>
      <GraphTelemetryBar
        isNetworkActive={isNetworkActive}
        onToggleStream={() => setIsLiveStream(!isLiveStream)}
        zoomLevel={zoomLevel}
        onZoomIn={() => setZoomLevel((z) => Math.min(1.4, Number((z + 0.1).toFixed(1))))}
        onZoomOut={() => setZoomLevel((z) => Math.max(0.6, Number((z - 0.1).toFixed(1))))}
        fitToView={fitToView}
        onToggleFit={() => {
          setZoomLevel(1);
          setFitToView(!fitToView);
        }}
        recentlySpawnedId={recentlySpawnedId}
        onSpawnAgent={handleSpawnAgent}
      />

      {/* Actual Binary Search Tree Canvas */}
      <div className={`relative py-2 sm:py-3 px-1 sm:px-2 bg-neutral-50 border border-neutral-200 rounded overflow-x-auto flex flex-col items-center select-none ${
        fitToView ? "max-h-[380px] sm:max-h-[460px] overflow-y-hidden" : "min-h-[420px]"
      }`}>
        <div
          style={{
            transform: zoomLevel !== 1 ? `scale(${zoomLevel})` : undefined,
            transformOrigin: "top center",
            transition: "transform 0.15s ease-out",
            width: "100%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <svg
            viewBox="0 0 900 430"
            className="w-full max-w-[900px] h-auto select-none"
            style={{ minWidth: "540px", maxHeight: fitToView ? "420px" : undefined }}
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Neural Network Layer Headers */}
            <g id="neural-layer-indicators" opacity={0.85} className="font-mono text-[10px]">
              <text data-tour="agents-layer-sensory" x="110" y="22" textAnchor="middle" fill="#171717" fontWeight="bold">LAYER 1: SENSORY INPUTS</text>
              <text data-tour="agents-layer-feature" x="350" y="22" textAnchor="middle" fill="#171717" fontWeight="bold">LAYER 2: FEATURE EXTRACTION</text>
              <text data-tour="agents-layer-scoring" x="590" y="22" textAnchor="middle" fill="#171717" fontWeight="bold">LAYER 3: SYNAPTIC SCORING</text>
              <text data-tour="agents-layer-output" x="830" y="22" textAnchor="middle" fill="#171717" fontWeight="bold">LAYER 4: ACTIONS & OUTPUTS</text>

              <text x="110" y="34" textAnchor="middle" fill="#737373" fontSize="8.5">Profile, feeds & rules</text>
              <text x="350" y="34" textAnchor="middle" fill="#737373" fontSize="8.5">ATS & safety limits</text>
              <text x="590" y="34" textAnchor="middle" fill="#737373" fontSize="8.5">Cosine fit & tailoring</text>
              <text x="830" y="34" textAnchor="middle" fill="#737373" fontSize="8.5">Submissions & sync</text>
            </g>

            {/* Neural Synapses */}
            <g id="neural-synapses">
              {GRAPH_EDGES.map(([fromId, toId]) => {
                const fromNode = GRAPH_NODES.find((n) => n.id === fromId);
                const toNode = GRAPH_NODES.find((n) => n.id === toId);
                if (!fromNode || !toNode) return null;
                const isSelected = selectedNodeId === fromId || selectedNodeId === toId;
                const isFeedback = fromId === 9 && toId === 2;

                const midX = fromNode.x + (toNode.x - fromNode.x) * 0.5;
                let d = `M ${fromNode.x} ${fromNode.y} C ${midX} ${fromNode.y}, ${midX} ${toNode.y}, ${toNode.x} ${toNode.y}`;
                if (isFeedback) {
                  d = `M ${fromNode.x} ${fromNode.y} C 800 440, 160 440, ${toNode.x} ${toNode.y}`;
                }

                return (
                  <g key={`synapse-${fromId}-${toId}`}>
                    <path
                      d={d}
                      fill="none"
                      stroke={isFeedback ? "#ec4899" : isSelected ? "#000000" : "#a3a3a3"}
                      strokeWidth={isSelected ? 2.5 : 1.25}
                      strokeDasharray={isFeedback ? "4 4" : undefined}
                      opacity={isSelected ? 0.95 : 0.35}
                      strokeLinecap="round"
                    />
                    {isNetworkActive && (
                      <path
                        d={d}
                        fill="none"
                        stroke={isFeedback ? "#ec4899" : isSelected ? "#000000" : "#525252"}
                        strokeWidth={isSelected ? 1.75 : 1}
                        strokeDasharray="4 6"
                        strokeLinecap="round"
                        className="flow-active"
                        opacity={0.6}
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
                    y1={parent.y + 15}
                    x2={leaf.x}
                    y2={leaf.y}
                    stroke="#171717"
                    strokeWidth="1"
                    strokeDasharray="2 3"
                  />
                );
              })}
            </g>

            {/* Leaf Worker Nodes */}
            <g id="worker-nodes">
              {workerLeaves.map((leaf) => {
                const isInspected = inspectedBotId === leaf.bot.id;
                const isNewlySpawned = recentlySpawnedId === leaf.id;

                const nodeColor = isNewlySpawned
                  ? "#10b981"
                  : isInspected
                  ? "#000000"
                  : isNetworkActive
                  ? leaf.bot.pool === "discovery"
                    ? "#059669"
                    : leaf.bot.pool === "tailor"
                    ? "#7c3aed"
                    : "#0284c7"
                  : "#ffffff";

                return (
                  <g
                    key={leaf.id}
                    className="cursor-pointer"
                    onClick={() => onInspectBot && onInspectBot(leaf.bot)}
                    onMouseEnter={() => setHoveredBot({ bot: leaf.bot, x: leaf.x, y: leaf.y })}
                    onMouseLeave={() => setHoveredBot(null)}
                  >
                    {(isNewlySpawned || isInspected || isNetworkActive) && (
                      <circle
                        cx={leaf.x}
                        cy={leaf.y}
                        r={isInspected ? 11 : isNewlySpawned ? 10 : 8}
                        fill="none"
                        stroke={isNewlySpawned ? "#10b981" : isInspected ? "#000000" : nodeColor}
                        strokeWidth="1.2"
                        opacity={isInspected ? 0.8 : 0.4}
                        strokeDasharray={isInspected ? "3 3" : undefined}
                      />
                    )}

                    <circle
                      cx={leaf.x}
                      cy={leaf.y}
                      r={isInspected ? 6.5 : isNewlySpawned ? 6 : 4.5}
                      fill={nodeColor}
                      stroke={isNewlySpawned ? "#059669" : "#000000"}
                      strokeWidth={isInspected ? 2 : 1.25}
                      className="transition-transform duration-150 hover:scale-125"
                    />
                  </g>
                );
              })}
            </g>

            {/* Animated Data Packets Flowing Between Nodes */}
            {isNetworkActive && (
              <g id="data-packets">
                {packets.map((pkt) => {
                  const fromNode = GRAPH_NODES.find((n) => n.id === pkt.fromId);
                  const toNode = GRAPH_NODES.find((n) => n.id === pkt.toId);
                  if (!fromNode || !toNode) return null;

                  const pos = getEdgePoint(fromNode, toNode, pkt.t);
                  const tagW = pkt.label.length * 5.6 + 8;

                  return (
                    <g key={pkt.id} className="pointer-events-none select-none">
                      <circle cx={pos.x} cy={pos.y} r={6.5} fill={pkt.color} opacity={0.25} filter="url(#glow)" />
                      <circle cx={pos.x} cy={pos.y} r={3.2} fill={pkt.color} stroke="#ffffff" strokeWidth="1" />
                      <rect
                        x={pos.x + 6}
                        y={pos.y - 12}
                        width={tagW}
                        height="12"
                        rx="2.5"
                        fill="#ffffff"
                        stroke="#d4d4d4"
                        strokeWidth="0.75"
                        opacity="0.95"
                      />
                      <text
                        x={pos.x + 6 + tagW / 2}
                        y={pos.y - 3}
                        textAnchor="middle"
                        fill="#171717"
                        fontSize="7.5"
                        fontWeight="bold"
                        fontFamily="monospace"
                        opacity={0.9}
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
                const labelW = n.label.length * 6 + 12;

                return (
                  <g
                    key={n.id}
                    className="cursor-pointer group"
                    onClick={() => onSelectNode(n.id)}
                  >
                    {isSelected && (
                      <circle
                        cx={n.x}
                        cy={n.y}
                        r={isRoot ? 35 : 28}
                        fill="none"
                        stroke="#000000"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                        opacity={0.7}
                      />
                    )}

                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={isRoot ? 28 : 22}
                      fill={isSelected ? "#000000" : isRoot ? "#171717" : "#ffffff"}
                      stroke="#000000"
                      strokeWidth={isRoot ? "3.5" : "2.5"}
                      className="transition-colors duration-200 shadow-md"
                    />

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

                    <rect
                      x={n.x - labelW / 2}
                      y={n.labelY - 10}
                      width={labelW}
                      height="14"
                      rx="3"
                      fill="#ffffff"
                      stroke="#e5e5e5"
                      strokeWidth="1"
                      opacity="0.95"
                    />
                    <text
                      x={n.x}
                      y={n.labelY + 1}
                      textAnchor="middle"
                      fill="#000000"
                      fontSize="9"
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
        <div className="mt-2 text-[10px] sm:text-[11px] text-neutral-600 font-mono flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-black inline-block" />
            <span>Neural Node</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
            <span>Active Synapse / Agent</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
            <span>In-Flight Tensor</span>
          </span>
          <span className="text-neutral-500 font-sans hidden sm:inline">
            (Click any node to inspect layer weights & telemetry)
          </span>
        </div>
      </div>

      <NodeDetailsCard
        selectedNode={selectedNode}
        onFilterPool={onFilterPool}
      />
    </>
  );
}
