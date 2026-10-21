"use client";
import React from "react";
import Link from "next/link";
import { MascotInteractive } from "./MascotInteractive";
import { type MascotMood, type MascotCompanionCardProps } from "./types";
import { Bot, HelpCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { useWalkthrough } from "@/components/walkthrough";

export function MascotCompanionCard({
  title = "Scuttle · Career Companion",
  statusLabel = "Monitoring Feeds",
  customQuote = "I'm monitoring your career pipeline. Move your cursor to see me look around, or tap to snip!",
  showQuickActions = true,
  className = "",
}: MascotCompanionCardProps) {
  const { startTour } = useWalkthrough();

  return (
    <div
      className={`card p-4 bg-white border border-neutral-300 rounded-lg text-black font-sans shadow-xs ${className}`}
    >
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Interactive Mascot Avatar */}
        <div className="shrink-0 p-2 bg-neutral-50 border border-neutral-200 rounded-lg flex items-center justify-center">
          <MascotInteractive size="md" mood="idle" interactive={true} />
        </div>

        {/* Companion Content & Status */}
        <div className="flex-1 min-w-0 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-black">{title}</h4>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200 font-mono">
                Assistant
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{statusLabel}</span>
            </div>
          </div>

          <p className="text-xs text-neutral-600 leading-relaxed font-mono">
            "{customQuote}"
          </p>

          {/* Quick Action Navigation Buttons */}
          {showQuickActions && (
            <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2 border-t border-neutral-100">
              <Link
                href="/agents"
                className="btn text-xs py-1 px-2.5 bg-black text-white hover:bg-neutral-800 flex items-center gap-1 font-mono"
              >
                <Bot className="w-3 h-3" />
                <span>Launch Swarm</span>
              </Link>
              <button
                type="button"
                onClick={() => startTour(0)}
                className="btn text-xs py-1 px-2.5 bg-white border border-neutral-300 hover:border-black flex items-center gap-1 font-mono text-neutral-700"
              >
                <HelpCircle className="w-3 h-3" />
                <span>Take 105-Step Tour</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
