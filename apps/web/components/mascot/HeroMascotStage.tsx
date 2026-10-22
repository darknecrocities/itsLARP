"use client";
import React, { useState, useRef, useCallback } from "react";
import { useLiveCounters, type CounterBump } from "@/lib/counters/useLiveCounters";
import { MascotCounterTally } from "./MascotCounterTally";
import { HeroPeekingMascot, type MascotReaction } from "./HeroPeekingMascot";
import type { CounterId } from "@/lib/counters/config";

interface HeroMascotStageProps {
  className?: string;
  isMobile?: boolean;
}

const VISIT_CLICK_REACTIONS = [
  "Keep clicking! Every visit powers our AI workforce.",
  "Snip snip! 100% verified APA 7th career profiles.",
  "Scuttle standing by! Watching JobStreet, LinkedIn & Indeed.",
  "Zero manual forms, zero wasted hours applying.",
];

export function HeroMascotStage({ className = "", isMobile = false }: HeroMascotStageProps) {
  const [reaction, setReaction] = useState<MascotReaction | null>(null);
  const clickCountRef = useRef(0);

  const handleBump = useCallback((bump: CounterBump) => {
    if (bump.which === "visits") {
      const msg = bump.own
        ? `Welcome! You are visitor #${bump.value.toLocaleString()}.`
        : `Snip! Visitor #${bump.value.toLocaleString()} just scuttled in.`;
      setReaction({
        id: bump.id,
        text: msg,
        claw: "both",
      });
    } else if (bump.which === "downloads") {
      setReaction({
        id: bump.id,
        text: `Someone just grabbed the app! (${bump.value.toLocaleString()} downloads)`,
        claw: "right",
      });
    }
  }, []);

  const { visits, downloads, status } = useLiveCounters(handleBump);

  const handleHoverTarget = (target: CounterId | null) => {
    if (!target) return;

    if (target === "visits") {
      const countStr = visits !== null ? visits.toLocaleString() : "our";
      setReaction({
        id: Date.now(),
        text: `${countStr} visits and counting! Snip snip!`,
        claw: "left",
      });
    } else if (target === "downloads") {
      const countStr = downloads !== null ? downloads.toLocaleString() : "many others";
      setReaction({
        id: Date.now(),
        text: `Join ${countStr}! Run your job-hunt locally.`,
        claw: "right",
      });
    }
  };

  const handleActivate = (target: CounterId) => {
    if (target === "visits") {
      const idx = clickCountRef.current % VISIT_CLICK_REACTIONS.length;
      clickCountRef.current += 1;
      setReaction({
        id: Date.now(),
        text: VISIT_CLICK_REACTIONS[idx],
        claw: "both",
      });
    }
  };

  const counterSlot = (
    <MascotCounterTally
      visits={visits}
      downloads={downloads}
      status={status}
      isMobile={isMobile}
      onHoverTarget={handleHoverTarget}
      onActivate={handleActivate}
    />
  );

  return (
    <HeroPeekingMascot
      className={className}
      isMobile={isMobile}
      reaction={reaction}
      counterSlot={counterSlot}
    />
  );
}
