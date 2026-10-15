"use client";
import React from "react";
import { Download } from "lucide-react";
import { Badge } from "./ui";
import type { RecommendedModel } from "@/lib/ollamaTypes";

interface OllamaModelCardProps {
  model: RecommendedModel;
  installed: boolean;
  isActive: boolean;
  isPulling: boolean;
  pullProgress: { status: string; pct?: number } | null;
  onSelect: (name: string) => void;
  onPull: (name: string) => void;
}

export function OllamaModelCard({
  model: m,
  installed,
  isActive,
  isPulling,
  pullProgress,
  onSelect,
  onPull,
}: OllamaModelCardProps) {
  return (
    <div
      className={`p-4 rounded border flex flex-col justify-between transition-all ${
        isActive
          ? "border-black bg-neutral-100 shadow-sm"
          : installed
          ? "border-neutral-300 bg-white"
          : "border-neutral-200 bg-neutral-50"
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-mono text-xs font-bold text-black">{m.name}</span>
          {m.is_default && <Badge tone="ok">RECOMMENDED</Badge>}
        </div>

        <div className="text-[11px] text-neutral-500 font-mono mb-2">{m.tier}</div>
        <p className="text-xs text-neutral-700 leading-snug mb-3">{m.best_for}</p>

        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono p-2 bg-white rounded border border-neutral-200 mb-3">
          <div>Size: <strong>{m.size}</strong></div>
          <div>Min RAM: <strong>{m.min_ram}</strong></div>
          <div>Speed: <strong>{m.speed_score}/10</strong></div>
          <div>Ability: <strong>{m.ability_score}/10</strong></div>
        </div>
      </div>

      <div className="pt-2 border-t border-neutral-200">
        {isPulling ? (
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-mono">
              <span className="truncate">{pullProgress?.status || "Pulling..."}</span>
              <span>{pullProgress?.pct ? `${pullProgress.pct}%` : ""}</span>
            </div>
            <div className="w-full bg-neutral-200 h-1.5 rounded overflow-hidden">
              <div
                className="bg-black h-full transition-all duration-300"
                style={{ width: `${pullProgress?.pct || 20}%` }}
              />
            </div>
          </div>
        ) : isActive ? (
          <div className="text-center py-1 text-xs font-mono font-bold text-black bg-neutral-200 rounded">
            ✓ Active Engine
          </div>
        ) : installed ? (
          <button
            onClick={() => onSelect(m.name)}
            className="btn w-full text-xs py-1.5 font-medium border border-neutral-300 hover:border-black"
          >
            Set Active
          </button>
        ) : (
          <button
            onClick={() => onPull(m.name)}
            className="btn btn-primary w-full text-xs py-1.5 flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>1-Click Download ({m.size})</span>
          </button>
        )}
      </div>
    </div>
  );
}
