"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "../ui";
import { GraphNode } from "./types";
import { ArrowDown } from "lucide-react";

interface NodeDetailsCardProps {
  selectedNode: GraphNode;
  onFilterPool: (poolKey: "all" | "discovery" | "tailor" | "apply" | "notion") => void;
}

export function NodeDetailsCard({ selectedNode, onFilterPool }: NodeDetailsCardProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={selectedNode.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="mt-4 p-4 sm:p-5 bg-neutral-100 border border-neutral-300 rounded font-sans"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-300 pb-3 mb-3 font-mono">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-black text-white text-xs font-bold rounded">
              NODE {selectedNode.id}
            </span>
            <h4 className="text-base font-bold text-black font-sans">{selectedNode.title}</h4>
            <span className="text-xs text-neutral-600 font-sans hidden sm:inline">
              ({selectedNode.role})
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Badge tone="dark">{selectedNode.badge}</Badge>
            <button
              className="btn text-xs py-1 px-2.5 bg-white border border-neutral-300 text-black hover:border-black font-mono inline-flex items-center gap-1"
              onClick={() => onFilterPool(selectedNode.poolKey)}
            >
              <span>View Node Agents</span>
              <ArrowDown className="w-3 h-3" />
            </button>
          </div>
        </div>

        <p className="text-xs text-neutral-700 leading-relaxed max-w-4xl mb-3 font-sans">
          {selectedNode.desc}
        </p>

        {/* Step Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-xs font-mono">
          {selectedNode.stats.map((s, idx) => (
            <div key={idx} className="p-2 sm:p-2.5 bg-white rounded border border-neutral-300">
              <div className="text-[10px] text-neutral-500 uppercase">{s.label}</div>
              <div className="font-bold text-xs sm:text-sm text-black mt-0.5 truncate">{s.val}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
