"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "../ui";
import { GraphNode } from "./types";
import { GRAPH_NODES, GRAPH_EDGES } from "./constants";

interface PipelineSvgGraphProps {
  running: boolean;
  selectedNodeId: number;
  onSelectNode: (id: number) => void;
  onFilterPool: (poolKey: "all" | "discovery" | "tailor" | "apply") => void;
}

export function PipelineSvgGraph({
  running,
  selectedNodeId,
  onSelectNode,
  onFilterPool,
}: PipelineSvgGraphProps) {
  const selectedNode = GRAPH_NODES.find((n) => n.id === selectedNodeId) || GRAPH_NODES[0];

  return (
    <>
      {/* Actual Node Diagram SVG Canvas (Click nodes directly, no pill clutter) */}
      <div className="relative py-3 px-2 bg-neutral-50 border border-neutral-200 rounded overflow-x-auto flex justify-center">
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
                <motion.g
                  key={n.id}
                  className="cursor-pointer group"
                  style={{ transformOrigin: `${n.x}px ${n.y}px` }}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  onClick={() => onSelectNode(n.id)}
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
                    className="transition-colors duration-150 group-hover:stroke-black"
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
                </motion.g>
              );
            })}
          </g>
        </svg>
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
                className="btn text-xs py-1 px-2.5 bg-white border border-neutral-300 text-black hover:border-black font-mono"
                onClick={() => onFilterPool(selectedNode.poolKey)}
              >
                View Agents Below ↓
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
