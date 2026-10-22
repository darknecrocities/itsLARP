import { describe, it, expect } from "vitest";
import {
  shouldRecordVisit,
  markVisitRecorded,
  CircuitBreaker,
  VISIT_COOLDOWN_MS,
  type KeyValueStore,
} from "@/lib/counters/visitGate";

class MemoryStore implements KeyValueStore {
  private data = new Map<string, string>();
  getItem(k: string) {
    return this.data.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    this.data.set(k, v);
  }
}

describe("visit gate and circuit breaker", () => {
  it("allows the first visit when storage is empty", () => {
    const store = new MemoryStore();
    const now = 1_000_000;
    expect(shouldRecordVisit(store, now)).toBe(true);
  });

  it("blocks rapid sub-second double-mounts but allows reloads and revisits", () => {
    const store = new MemoryStore();
    const now = 1_000_000;
    markVisitRecorded(store, now);

    // 50ms later (same second double-mount / race): should block
    expect(shouldRecordVisit(store, now + 50)).toBe(false);

    // 1000ms later: should block
    expect(shouldRecordVisit(store, now + 1000)).toBe(false);

    // 2 seconds later (user reloads page): should allow!
    expect(shouldRecordVisit(store, now + 2000)).toBe(true);

    // After VISIT_COOLDOWN_MS (1.5s): should allow
    expect(shouldRecordVisit(store, now + VISIT_COOLDOWN_MS)).toBe(true);

    // 10 seconds later: should allow
    expect(shouldRecordVisit(store, now + 10_000)).toBe(true);
  });

  it("recovers gracefully if stored value is corrupt or in the future", () => {
    const store = new MemoryStore();
    const now = 1_000_000;

    store.setItem("itslarp:lastVisitAt", "not-a-number");
    expect(shouldRecordVisit(store, now)).toBe(true);

    store.setItem("itslarp:lastVisitAt", String(now + 9999999));
    expect(shouldRecordVisit(store, now)).toBe(true);
  });

  it("trips circuit breaker on permission and quota errors", () => {
    let fakeNow = 1_000_000;
    const penaltyMs = 300_000; // 5 min
    const breaker = new CircuitBreaker(penaltyMs, () => fakeNow);

    expect(breaker.isOpen()).toBe(false);

    // Irrelevant error should not trip
    expect(breaker.record("not-found")).toBe(false);
    expect(breaker.isOpen()).toBe(false);

    // Permission denied trips it
    expect(breaker.record("permission-denied")).toBe(true);
    expect(breaker.isOpen()).toBe(true);

    // Before cooldown expires: remains open
    fakeNow += 100_000;
    expect(breaker.isOpen()).toBe(true);

    // After cooldown: recovers
    fakeNow += 250_000;
    expect(breaker.isOpen()).toBe(false);
  });
});
