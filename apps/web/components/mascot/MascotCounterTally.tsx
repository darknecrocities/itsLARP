"use client";
import React from "react";
import Link from "next/link";
import { Eye, Download, Radio } from "lucide-react";
import { RollingNumber } from "./RollingNumber";
import type { CounterId } from "@/lib/counters/config";

interface MascotCounterTallyProps {
  visits: number | null;
  downloads: number | null;
  status: "loading" | "live" | "off";
  onHoverTarget?: (which: CounterId | null) => void;
  onActivate?: (which: CounterId) => void;
  className?: string;
  isMobile?: boolean;
}

export function MascotCounterTally({
  visits,
  downloads,
  status,
  onHoverTarget,
  onActivate,
  className = "",
  isMobile = false,
}: MascotCounterTallyProps) {
  // Never show mock or broken counters if Firebase is off or unconfigured
  if (status === "off") return null;

  return (
    <div
      className={`select-none transition-opacity duration-300 ${
        status === "loading" ? "opacity-40" : "opacity-100"
      } ${className}`}
      aria-label="Live community metrics"
    >
      {/* Live Activity Pulse Indicator */}
      <div className="flex items-center gap-2 mb-2.5">
        <span className="relative flex h-2 w-2" aria-hidden="true">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neutral-900 opacity-60" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-neutral-950" />
        </span>
        <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-neutral-600 flex items-center gap-1">
          <Radio className="w-2.5 h-2.5 text-neutral-700" aria-hidden="true" />
          <span>Live Telemetry</span>
        </span>
      </div>

      {/* Counters Container - Zero Card, Pure Typography */}
      <div
        className={`flex ${
          isMobile ? "flex-row gap-6 justify-between items-center" : "flex-col gap-3.5"
        }`}
      >
        {/* Visits Row */}
        <div
          role="button"
          tabIndex={0}
          onMouseEnter={() => onHoverTarget?.("visits")}
          onMouseLeave={() => onHoverTarget?.(null)}
          onClick={() => onActivate?.("visits")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onActivate?.("visits");
            }
          }}
          className="group cursor-pointer focus:outline-hidden"
          title="Live visitor count · Click to interact with Scuttle"
        >
          <div className="flex items-baseline gap-2">
            <RollingNumber
              value={visits ?? 0}
              className="text-2xl sm:text-3xl font-black text-neutral-950 font-display transition-transform duration-150 group-hover:translate-x-0.5"
            />
            <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold uppercase tracking-wider text-neutral-500 group-hover:text-neutral-950 transition-colors">
              <Eye className="w-3 h-3 text-neutral-500 group-hover:text-neutral-950" aria-hidden="true" />
              <span>Visits</span>
            </span>
          </div>
        </div>

        {/* Downloads Row */}
        <Link
          href="/download"
          onMouseEnter={() => onHoverTarget?.("downloads")}
          onMouseLeave={() => onHoverTarget?.(null)}
          onClick={() => {
            onActivate?.("downloads");
          }}
          className="group cursor-pointer focus:outline-hidden block"
          title="Desktop app downloads · Click to view releases"
        >
          <div className="flex items-baseline gap-2">
            <RollingNumber
              value={downloads ?? 0}
              className="text-2xl sm:text-3xl font-black text-neutral-950 font-display transition-transform duration-150 group-hover:translate-x-0.5"
            />
            <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold uppercase tracking-wider text-neutral-500 group-hover:text-neutral-950 transition-colors">
              <Download className="w-3 h-3 text-neutral-500 group-hover:text-neutral-950" aria-hidden="true" />
              <span>Downloads</span>
            </span>
          </div>
        </Link>
      </div>

      {/* Decorative Dashed Leader SVG pointing toward crab claw on desktop */}
      {!isMobile && (
        <div className="relative mt-2 h-4 w-36 pointer-events-none opacity-40">
          <svg className="w-full h-full" viewBox="0 0 144 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M 2 8 H 136 L 130 3 M 136 8 L 130 13"
              stroke="#000000"
              strokeWidth="1.2"
              strokeDasharray="3 3"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
