/**
 * Visit de-duplication and write protection for the browser counter.
 * Pure logic with injectable storage and clock so it can be unit tested.
 */

/** One visit per browser per 30 minutes (refreshes and extra tabs are not re-counted). */
export const VISIT_WINDOW_MS = 30 * 60 * 1000;
export const VISIT_STORAGE_KEY = "itslarp:lastVisitAt";

/** After quota / permission errors, stop writing for 5 minutes. */
export const CIRCUIT_BREAKER_PENALTY_MS = 5 * 60 * 1000;

export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/** Non-sensitive timestamp only. Never store tokens or identifiers here. */
export function shouldRecordVisit(store: KeyValueStore, now: number): boolean {
  let raw: string | null = null;
  try {
    raw = store.getItem(VISIT_STORAGE_KEY);
  } catch {
    return true;
  }
  if (!raw) return true;
  const last = Number(raw);
  // Corrupt or future timestamps are treated as "never visited"
  if (!Number.isFinite(last) || last <= 0 || last > now) return true;
  return now - last >= VISIT_WINDOW_MS;
}

export function markVisitRecorded(store: KeyValueStore, now: number): void {
  try {
    store.setItem(VISIT_STORAGE_KEY, String(now));
  } catch {
    // Storage blocked (private mode): the in-page guard still prevents duplicates
  }
}

/** Error codes that indicate abuse protection, quota exhaustion, or rule denial. */
const BREAKER_CODES = new Set(["permission-denied", "resource-exhausted", "unavailable"]);

export class CircuitBreaker {
  private openUntil = 0;

  constructor(
    private readonly penaltyMs: number = CIRCUIT_BREAKER_PENALTY_MS,
    private readonly now: () => number = Date.now,
  ) {}

  isOpen(): boolean {
    return this.now() < this.openUntil;
  }

  /** Trips the breaker when the error code warrants backing off. Returns true if tripped. */
  record(code: string | undefined): boolean {
    if (!code || !BREAKER_CODES.has(code)) return false;
    this.openUntil = this.now() + this.penaltyMs;
    return true;
  }
}

/** localStorage with an in-memory fallback when storage is unavailable. */
export function safeLocalStorage(): KeyValueStore {
  const memory = new Map<string, string>();
  const fallback: KeyValueStore = {
    getItem: (k) => memory.get(k) ?? null,
    setItem: (k, v) => void memory.set(k, v),
  };
  try {
    if (typeof window === "undefined" || !window.localStorage) return fallback;
    const probe = "itslarp:probe";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    return fallback;
  }
}
