"use client";
import React from "react";
import { type BotTelemetry } from "@/lib/swarm";

interface AgentExplorerGridProps {
  bots: BotTelemetry[];
  activePoolTab: "all" | "discovery" | "tailor" | "apply" | "notion" | "alerts";
  alertsCount: number;
  inspectedBotId?: string;
  onSelectPoolTab: (tab: "all" | "discovery" | "tailor" | "apply" | "notion" | "alerts") => void;
  onInspectBot: (bot: BotTelemetry) => void;
}

export function AgentExplorerGrid({
  bots,
  activePoolTab,
  alertsCount,
  inspectedBotId,
  onSelectPoolTab,
  onInspectBot,
}: AgentExplorerGridProps) {
  return (
    <div className="card p-3 sm:p-5 bg-white text-black border border-neutral-300">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-bold font-sans">Individual Agent Explorer</h3>
          <p className="text-xs text-neutral-600 font-sans">
            Click any Agent below to see its current job search task and recent actions.
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
            onClick={() => onSelectPoolTab("all")}
          >
            All Agents
          </button>
          <button
            className={`px-3 py-1 rounded border transition-colors ${
              activePoolTab === "discovery"
                ? "bg-black text-white border-black font-semibold"
                : "bg-white border-neutral-300 text-neutral-800 hover:border-black"
            }`}
            onClick={() => onSelectPoolTab("discovery")}
          >
            Job Finders
          </button>
          <button
            className={`px-3 py-1 rounded border transition-colors ${
              activePoolTab === "tailor"
                ? "bg-black text-white border-black font-semibold"
                : "bg-white border-neutral-300 text-neutral-800 hover:border-black"
            }`}
            onClick={() => onSelectPoolTab("tailor")}
          >
            Resume Makers
          </button>
          <button
            className={`px-3 py-1 rounded border transition-colors ${
              activePoolTab === "apply"
                ? "bg-black text-white border-black font-semibold"
                : "bg-white border-neutral-300 text-neutral-800 hover:border-black"
            }`}
            onClick={() => onSelectPoolTab("apply")}
          >
            Auto-Appliers
          </button>
          <button
            className={`px-3 py-1 rounded border transition-colors ${
              activePoolTab === "notion"
                ? "bg-black text-white border-black font-semibold"
                : "bg-white border-neutral-300 text-neutral-800 hover:border-black"
            }`}
            onClick={() => onSelectPoolTab("notion")}
          >
            Notion Sync
          </button>

          {alertsCount > 0 && (
            <button
              className={`px-3 py-1 rounded border transition-colors flex items-center gap-1.5 ${
                activePoolTab === "alerts"
                  ? "bg-black text-white border-black font-semibold"
                  : "bg-neutral-200 border-black text-black font-semibold"
              }`}
              onClick={() => onSelectPoolTab("alerts")}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
              Needs Verification ({alertsCount})
            </button>
          )}
        </div>
      </div>

      {/* Minimalist Agent Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 max-h-72 overflow-y-auto p-2 bg-neutral-50 rounded border border-neutral-200">
        {bots.map((bot) => {
          const isAlert = bot.status === "needs_verification" || bot.verification_challenge;
          const isInspected = inspectedBotId === bot.id;

          return (
            <button
              key={bot.id}
              onClick={() => onInspectBot(bot)}
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
                {bot.status}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
