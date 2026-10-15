"use client";
import React from "react";
import { Activity, Plus } from "lucide-react";

interface GraphTelemetryBarProps {
  isNetworkActive: boolean;
  onToggleStream: () => void;
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  fitToView: boolean;
  onToggleFit: () => void;
  recentlySpawnedId: string | null;
  onSpawnAgent: () => void;
}

export function GraphTelemetryBar({
  isNetworkActive,
  onToggleStream,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  fitToView,
  onToggleFit,
  recentlySpawnedId,
  onSpawnAgent,
}: GraphTelemetryBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-neutral-100 rounded border border-neutral-300 text-xs font-mono mb-3">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <span className="flex items-center gap-1.5 text-black font-semibold">
          <Activity className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          <span>Agent Topology</span>
        </span>
        <span className="text-neutral-500 hidden md:inline">
          Traversal: <strong className="text-black">Pre-Order Flow</strong>
        </span>
        <button
          type="button"
          onClick={onToggleStream}
          className={`px-2 py-0.5 rounded text-[11px] font-mono flex items-center gap-1.5 transition-colors border ${
            isNetworkActive
              ? "bg-emerald-50 text-emerald-800 border-emerald-300"
              : "bg-neutral-200 text-neutral-600 border-neutral-300"
          }`}
          title="Toggle live agent stream animation"
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isNetworkActive ? "bg-emerald-600 animate-ping" : "bg-neutral-400"}`} />
          <span>Stream: {isNetworkActive ? "Active" : "Paused"}</span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-[11px] font-mono bg-white px-2 py-0.5 rounded border border-neutral-300">
          <button
            type="button"
            onClick={onZoomOut}
            className="px-1 text-neutral-600 hover:text-black font-bold"
            title="Zoom Out"
          >
            -
          </button>
          <span className="text-[10px] text-neutral-500 w-7 text-center">{Math.round(zoomLevel * 100)}%</span>
          <button
            type="button"
            onClick={onZoomIn}
            className="px-1 text-neutral-600 hover:text-black font-bold"
            title="Zoom In"
          >
            +
          </button>
          <button
            type="button"
            onClick={onToggleFit}
            className="ml-1 text-[10px] px-1.5 py-0.5 bg-neutral-100 hover:bg-neutral-200 rounded border border-neutral-300"
            title="Toggle Auto Fit to Screen"
          >
            {fitToView ? "Fit" : "100%"}
          </button>
        </div>

        {recentlySpawnedId && (
          <span className="text-[10px] text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded font-bold animate-pulse hidden sm:inline">
            +1: {recentlySpawnedId}
          </span>
        )}
        <button
          type="button"
          onClick={onSpawnAgent}
          className="btn text-xs py-1 px-2.5 bg-black text-white hover:bg-neutral-800 flex items-center gap-1 transition-all"
          title="Dynamically spawn a new agent node into the binary tree"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Spawn Agent</span>
        </button>
      </div>
    </div>
  );
}
