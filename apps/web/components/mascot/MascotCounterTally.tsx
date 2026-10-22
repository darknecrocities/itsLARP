"use client";
import React from "react";
import Link from "next/link";
import { Eye, Download } from "lucide-react";
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
      {/* Clean Live Status Eyebrow */}
      <div className="flex items-center gap-1.5 mb-2.5" aria-hidden="true">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
        </span>
        <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-neutral-500">
          Live
        </span>
      </div>

      {/* Dual Metrics Grid (Architectural Divide, Zero Card) */}
      <div
        className={`grid grid-cols-2 divide-x divide-neutral-200/90 ${
          isMobile ? "max-w-full" : "max-w-[280px] sm:max-w-[320px]"
        }`}
      >
        {/* Visits Column */}
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
          className="group cursor-pointer focus:outline-hidden pr-4 sm:pr-6"
        >
          <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-neutral-950 font-display tracking-tight leading-none group-hover:opacity-75 transition-opacity">
            <RollingNumber value={visits ?? 0} />
          </div>
          <div className="flex items-center gap-1 mt-1.5 sm:mt-2 text-[10px] sm:text-[11px] font-mono font-bold text-neutral-500 uppercase tracking-wider group-hover:text-neutral-950 transition-colors">
            <Eye className="w-3 h-3 text-neutral-400 group-hover:text-neutral-950 transition-colors" aria-hidden="true" />
            <span>Visits</span>
          </div>
        </div>

        {/* Downloads Column */}
        <Link
          href="/download"
          onMouseEnter={() => onHoverTarget?.("downloads")}
          onMouseLeave={() => onHoverTarget?.(null)}
          onClick={() => onActivate?.("downloads")}
          className="group cursor-pointer focus:outline-hidden pl-4 sm:pl-6 block"
        >
          <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-neutral-950 font-display tracking-tight leading-none group-hover:opacity-75 transition-opacity">
            <RollingNumber value={downloads ?? 0} />
          </div>
          <div className="flex items-center gap-1 mt-1.5 sm:mt-2 text-[10px] sm:text-[11px] font-mono font-bold text-neutral-500 uppercase tracking-wider group-hover:text-neutral-950 transition-colors">
            <Download className="w-3 h-3 text-neutral-400 group-hover:text-neutral-950 transition-colors" aria-hidden="true" />
            <span>Downloads</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
