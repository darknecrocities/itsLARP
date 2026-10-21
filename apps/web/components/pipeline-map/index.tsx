"use client";
import React, { useState, useMemo } from "react";
import { type BotTelemetry } from "@/lib/swarm";
import { HorizontalPipelineMapProps } from "./types";
import { generateSampleBots } from "./mockBots";
import { PipelineSvgGraph } from "./PipelineSvgGraph";
import { AgentExplorerGrid } from "./AgentExplorerGrid";
import { AgentInspectorDrawer } from "./AgentInspectorDrawer";

export * from "./types";
export * from "./constants";

export function HorizontalPipelineMap({
  running,
  activeCount,
  totalWorkers,
  sampleBots = [],
  onSelectBot,
  onVerifyBot,
}: HorizontalPipelineMapProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<number>(1);
  const [activePoolTab, setActivePoolTab] = useState<"all" | "discovery" | "tailor" | "apply" | "notion" | "alerts">("all");
  const [inspectedBot, setInspectedBot] = useState<BotTelemetry | null>(null);

  // Fallback sample bots
  const botsList: BotTelemetry[] = useMemo(() => {
    if (sampleBots.length > 0) return sampleBots;
    return generateSampleBots(running);
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

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Node Network Architecture Card */}
      <div data-tour="agents-neural-map" className="card p-3 sm:p-5 bg-white text-black border border-neutral-300 shadow-sm font-mono">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between border-b border-neutral-200 pb-3 mb-3 sm:mb-4 gap-2">
          <div>
            <div className="label-xs text-neutral-500">HOW YOUR AGENTS WORK TOGETHER</div>
            <h3 className="text-lg sm:text-xl font-bold font-sans tracking-tight text-black mt-0.5">
              Interactive Agent Network
            </h3>
            <p className="text-xs text-neutral-600 font-sans mt-0.5">
              Binary search tree hierarchy. Autonomous agent nodes spawn dynamically, transmitting live job criteria, match vectors, and tailored applications.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-neutral-100 rounded border border-neutral-300">
              <span className={`w-2 h-2 rounded-full ${running ? "bg-black animate-pulse" : "bg-neutral-400"}`} />
              <strong className="text-black">{running ? "AGENTS WORKING" : "AGENTS READY"}</strong>
            </span>
            <span className="text-neutral-500">
              Total: <strong className="text-black">{totalWorkers} Agents</strong>
            </span>
            <span className="text-neutral-500">
              Active: <strong className="text-black">{activeCount}</strong>
            </span>
          </div>
        </div>

        {/* SVG Canvas & Node Step Inspector with Working Agent Dot Nodes */}
        <PipelineSvgGraph
          running={running}
          selectedNodeId={selectedNodeId}
          onSelectNode={setSelectedNodeId}
          onFilterPool={setActivePoolTab}
          bots={botsList}
          inspectedBotId={inspectedBot?.id}
          onInspectBot={handleInspect}
        />
      </div>


      {/* Agent Explorer & Matrix */}
      <div>
        <AgentExplorerGrid
          bots={filteredBots}
          activePoolTab={activePoolTab}
          alertsCount={alertsCount}
          inspectedBotId={inspectedBot?.id}
          onSelectPoolTab={setActivePoolTab}
          onInspectBot={handleInspect}
        />

        {/* Selected Agent Detailed Inspector Drawer */}
        <AgentInspectorDrawer
          bot={inspectedBot}
          onClose={() => setInspectedBot(null)}
          onVerifyBot={onVerifyBot}
        />
      </div>
    </div>
  );
}
