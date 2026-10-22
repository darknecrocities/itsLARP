/**
 * Browser-only Firestore client for the landing page live counters.
 * Import this module only from client components.
 */
import { initializeApp, getApps } from "firebase/app";
import {
  doc,
  getFirestore,
  increment,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type Firestore,
} from "firebase/firestore";
import {
  COUNTER_COLLECTION,
  COUNTER_IDS,
  getFirebaseWebConfig,
  isCountersConfigured,
  type CounterId,
} from "./config";
import { isBotUserAgent } from "./filters";
import { CircuitBreaker, markVisitRecorded, safeLocalStorage, shouldRecordVisit } from "./visitGate";

const FIREBASE_APP_NAME = "itslarp-counters";

let firestore: Firestore | null = null;

function getDb(): Firestore | null {
  if (typeof window === "undefined" || !isCountersConfigured()) return null;
  if (firestore) return firestore;
  try {
    const existing = getApps().find((a) => a.name === FIREBASE_APP_NAME);
    const app = existing ?? initializeApp(getFirebaseWebConfig(), FIREBASE_APP_NAME);
    firestore = getFirestore(app);
    return firestore;
  } catch {
    console.warn("[counters] Firebase initialisation failed; live counters disabled.");
    return null;
  }
}

function errorCode(err: unknown): string | undefined {
  return typeof err === "object" && err !== null && "code" in err
    ? String((err as { code: unknown }).code)
    : undefined;
}

/** Only accept sane values from the database before rendering them. */
function readCount(data: unknown): number | null {
  if (typeof data !== "object" || data === null) return null;
  const value = (data as { count?: unknown }).count;
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0 ? value : null;
}

/**
 * Subscribes to both counters in real time. A missing document reads as 0.
 * Returns an unsubscribe function.
 */
export function subscribeCounters(
  onChange: (which: CounterId, count: number) => void,
  onError: () => void,
): () => void {
  const db = getDb();
  if (!db) return () => {};

  const unsubscribers = COUNTER_IDS.map((which) =>
    onSnapshot(
      doc(db, COUNTER_COLLECTION, which),
      (snap) => {
        const count = snap.exists() ? readCount(snap.data()) : 0;
        if (count !== null) onChange(which, count);
      },
      (err) => {
        console.warn(`[counters] ${which} listener error: ${errorCode(err) ?? "unknown"}`);
        onError();
      },
    ),
  );
  return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
}

const breaker = new CircuitBreaker();
let visitInFlight = false;
let visitHandledThisPage = false;

/**
 * Records at most one visit per browser per 30 minutes.
 * Resolves true only if this call actually incremented the counter.
 */
export async function recordVisit(): Promise<boolean> {
  if (visitHandledThisPage || visitInFlight || breaker.isOpen()) return false;
  if (typeof window === "undefined") return false;

  // Skip embedded previews, automation, and crawlers that execute JS
  if (window.self !== window.top) return false;
  if (navigator.webdriver || isBotUserAgent(navigator.userAgent)) return false;

  const store = safeLocalStorage();
  visitHandledThisPage = true;
  if (!shouldRecordVisit(store, Date.now())) return false;

  const db = getDb();
  if (!db) return false;

  visitInFlight = true;
  try {
    // merge + increment: creates the doc at 1 the first time, otherwise exactly +1 (enforced by rules)
    await setDoc(
      doc(db, COUNTER_COLLECTION, "visits"),
      { count: increment(1), updatedAt: serverTimestamp() },
      { merge: true },
    );
    markVisitRecorded(store, Date.now());
    return true;
  } catch (err) {
    const code = errorCode(err);
    breaker.record(code);
    console.warn(`[counters] visit write failed: ${code ?? "unknown"}`);
    return false;
  } finally {
    visitInFlight = false;
  }
}
