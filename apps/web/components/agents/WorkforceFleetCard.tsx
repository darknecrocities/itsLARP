"use client";
import React, { useState } from "react";
import { Users, Bot, Sliders, ShieldCheck, Activity, Cpu } from "lucide-react";

interface WorkforceFleetCardProps {
  workers: number;
  onWorkersChange: (num: number) => void;
  targetJobs: number;
  onTargetJobsChange: (num: number) => void;
  running: boolean;
  onStart: (workers: number) => void;
  onStop: () => void;
  activeCount: number;
  discoveredCount: number;
}

export function WorkforceFleetCard({
  workers,
  onWorkersChange,
  targetJobs,
  onTargetJobsChange,
  running,
  onStart,
  onStop,
  activeCount,
  discoveredCount,
}: WorkforceFleetCardProps) {
  const [fleetMode, setFleetMode] = useState<"autonomous" | "guarded">("autonomous");

  const discoveryCount = Math.floor(workers * 0.30);
  const tailoringCount = Math.floor(workers * 0.35);
  const dispatcherCount = workers - discoveryCount - tailoringCount;

  return (
    <div className="card p-4 border border-line bg-bg2/40 rounded-xl space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-bold">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-ink">Autonomous Bot Fleet Configuration</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium">
                Max 50,000 Parallel Bots
              </span>
            </div>
            <p className="text-xs text-muted">
              Configure simultaneous workforce scaling, pool allocations, and execution guardrails.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {running ? (
            <button
              type="button"
              data-tour="agents-emergency-stop-btn"
              onClick={onStop}
              className="btn btn-primary bg-black text-white hover:bg-neutral-800 text-xs px-4 py-2 font-medium"
            >
              Stop Workforce ({workers.toLocaleString()} Bots)
            </button>
          ) : (
            <button
              type="button"
              data-tour="agents-deploy-btn"
              onClick={() => onStart(workers)}
              className="btn btn-primary bg-black text-white hover:bg-neutral-800 text-xs px-4 py-2 font-medium"
            >
              Deploy {workers.toLocaleString()} Bots &bull; Target {targetJobs.toLocaleString()} Applications
            </button>
          )}
        </div>
      </div>

      {/* Grid: Fleet Size & Target Goals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Fleet Size Controller */}
        <div className="p-3.5 rounded-lg border border-line bg-bg space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-ink flex items-center gap-1.5" htmlFor="worker-slider">
              <Users className="w-3.5 h-3.5 text-muted" />
              <span>Simultaneous Bot Fleet Size</span>
            </label>
            <span className="text-xs font-mono font-bold text-ink">
              {workers.toLocaleString()} Active Bots
            </span>
          </div>

          <input
            id="worker-slider"
            data-tour="agents-bots-slider"
            type="range"
            min={100}
            max={50000}
            step={100}
            value={workers}
            disabled={running}
            onChange={(e) => onWorkersChange(Number(e.target.value))}
            className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-black"
          />

          <div className="flex flex-wrap items-center justify-between gap-1 pt-1">
            <span className="text-[11px] text-muted font-mono">Presets:</span>
            {[100, 1000, 5000, 10000, 25000, 50000].map((n) => (
              <button
                key={n}
                type="button"
                disabled={running}
                onClick={() => onWorkersChange(n)}
                className={`px-2 py-0.5 text-[11px] rounded font-mono border transition-all ${
                  workers === n
                    ? "bg-black text-white border-black font-semibold shadow-xs"
                    : "bg-bg text-muted border-line hover:text-ink hover:border-neutral-400"
                }`}
              >
                {n >= 1000 ? `${n / 1000}k` : n}
              </button>
            ))}
          </div>
        </div>

        {/* Target Applications Goal */}
        <div className="p-3.5 rounded-lg border border-line bg-bg space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-ink flex items-center gap-1.5" htmlFor="target-input">
              <Activity className="w-3.5 h-3.5 text-muted" />
              <span>Target Application Submissions</span>
            </label>
            <div className="flex items-center gap-1.5">
              <input
                id="target-input"
                data-tour="agents-target-input"
                type="number"
                min={1}
                max={50000}
                value={targetJobs}
                disabled={running}
                onChange={(e) => onTargetJobsChange(Math.max(1, Math.min(50000, Number(e.target.value) || 1)))}
                className="w-20 px-2 py-0.5 text-xs font-mono font-bold text-right border border-line rounded bg-bg2 text-ink focus:outline-none focus:border-black"
                title="Enter exact target number of jobs to apply for"
              />
              <span className="text-xs font-mono font-bold text-ink">Apps</span>
            </div>
          </div>

          <input
            id="target-slider"
            type="range"
            min={1}
            max={50000}
            step={10}
            value={targetJobs}
            disabled={running}
            onChange={(e) => onTargetJobsChange(Number(e.target.value))}
            className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-black"
          />

          <div data-tour="agents-target-presets" className="flex flex-wrap items-center justify-between gap-1 pt-1">
            <span className="text-[11px] text-muted font-mono">Presets:</span>
            {[10, 50, 250, 1000, 5000, 10000, 50000].map((n) => (
              <button
                key={n}
                type="button"
                disabled={running}
                onClick={() => onTargetJobsChange(n)}
                className={`px-2 py-0.5 text-[11px] rounded font-mono border transition-all ${
                  targetJobs === n
                    ? "bg-black text-white border-black font-semibold shadow-xs"
                    : "bg-bg text-muted border-line hover:text-ink hover:border-neutral-400"
                }`}
              >
                {n >= 1000 ? `${n / 1000}k` : n}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bot Pool Distribution Bar */}
      <div className="p-3 rounded-lg border border-line bg-bg space-y-2">
        <div className="flex items-center justify-between text-xs text-muted">
          <span className="font-semibold text-ink flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-muted" />
            <span>Parallel Workforce Allocation</span>
          </span>
          <span className="font-mono text-[11px]">
            {discoveryCount.toLocaleString()} Scrapers &bull; {tailoringCount.toLocaleString()} Tailors &bull; {dispatcherCount.toLocaleString()} Dispatchers
          </span>
        </div>

        <div className="w-full h-2 rounded-full overflow-hidden flex bg-neutral-200 dark:bg-neutral-800">
          <div style={{ width: "30%" }} className="bg-blue-500" title="Discovery Bots (30%)" />
          <div style={{ width: "35%" }} className="bg-purple-500" title="Resume Tailoring Bots (35%)" />
          <div style={{ width: "35%" }} className="bg-emerald-500" title="Application Dispatcher Bots (35%)" />
        </div>

        <div className="flex flex-wrap items-center justify-between text-[11px] text-muted font-mono">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Discovery Bots (30%)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            Resume Tailoring Bots (35%)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Application Dispatchers (35%)
          </span>
        </div>
      </div>
    </div>
  );
}
