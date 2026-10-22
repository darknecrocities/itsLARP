"use client";
import { useEffect, useRef, useState } from "react";
import { isCountersConfigured, type CounterId } from "./config";
import { recordVisit, subscribeCounters } from "./client";

export type CounterStatus = "loading" | "live" | "off";

export interface CounterBump {
  /** Monotonic id so consumers can react to every bump, even with equal values. */
  id: number;
  which: CounterId;
  value: number;
  /** True when the bump is this browser's own visit being recorded. */
  own: boolean;
}

type Counts = Record<CounterId, number | null>;

/**
 * Live visit + download counts from Firestore.
 * Records this browser's visit once (30 min window) and reports every increase,
 * including those caused by other visitors anywhere, via `lastBump`.
 */
export function useLiveCounters(onBump?: (bump: CounterBump) => void) {
  const [counts, setCounts] = useState<Counts>({ visits: null, downloads: null });
  const [status, setStatus] = useState<CounterStatus>(() => (isCountersConfigured() ? "loading" : "off"));
  const [lastBump, setLastBump] = useState<CounterBump | null>(null);

  const previous = useRef<Counts>({ visits: null, downloads: null });
  const bumpSeq = useRef(0);
  const ownVisitPending = useRef(false);
  const onBumpRef = useRef(onBump);

  useEffect(() => {
    onBumpRef.current = onBump;
  }, [onBump]);

  useEffect(() => {
    if (!isCountersConfigured()) return;
    let active = true;
    let visitAttempted = false;

    const unsubscribe = subscribeCounters(
      (which, value) => {
        if (!active) return;
        const before = previous.current[which];
        previous.current[which] = value;
        setCounts((c) => (c[which] === value ? c : { ...c, [which]: value }));

        if (before !== null && value > before) {
          const own = which === "visits" && ownVisitPending.current;
          if (own) ownVisitPending.current = false;
          bumpSeq.current += 1;
          const bump: CounterBump = { id: bumpSeq.current, which, value, own };
          setLastBump(bump);
          onBumpRef.current?.(bump);
        }
        if (previous.current.visits !== null && previous.current.downloads !== null) {
          setStatus("live");
          // Record our own visit only once the server base value is known, so the
          // optimistic local +1 renders as N+1 rather than briefly flashing 1.
          if (!visitAttempted) {
            visitAttempted = true;
            ownVisitPending.current = true;
            void recordVisit().then((recorded) => {
              if (!recorded) ownVisitPending.current = false;
            });
          }
        }
      },
      () => {
        if (active) setStatus("off");
      },
    );

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return { visits: counts.visits, downloads: counts.downloads, status, lastBump };
}
