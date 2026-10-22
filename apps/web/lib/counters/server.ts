/**
 * Server-side counter increments for route handlers (e.g. /api/download).
 *
 * Uses the Firestore REST `documents:commit` endpoint with the public web API key,
 * so writes are evaluated against the same Security Rules as the browser
 * (exactly +1 only). No service account or admin secret is involved.
 */
import {
  COUNTER_COLLECTION,
  getFirebaseWebConfig,
  isCountersConfigured,
  type CounterId,
} from "./config";

export const REQUEST_TIMEOUT_MS = 3000;
export const MAX_ATTEMPTS = 2;

export function buildIncrementCommit(projectId: string, which: CounterId) {
  return {
    writes: [
      {
        transform: {
          document: `projects/${projectId}/databases/(default)/documents/${COUNTER_COLLECTION}/${which}`,
          fieldTransforms: [
            { fieldPath: "count", increment: { integerValue: "1" } },
            { fieldPath: "updatedAt", setToServerValue: "REQUEST_TIME" },
          ],
        },
      },
    ],
  };
}

export function commitUrl(projectId: string): string {
  return `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents:commit`;
}

/** 429 and 5xx are transient; anything else (400/403) will not succeed on retry. */
function isRetryableStatus(status: number): boolean {
  return status === 429 || status >= 500;
}

export interface IncrementDeps {
  fetchImpl?: typeof fetch;
  sleep?: (ms: number) => Promise<void>;
  random?: () => number;
}

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Increments a counter by exactly 1. Never throws; resolves true on success.
 * 3s timeout per attempt, at most one retry with 200-600ms jittered backoff.
 */
export async function incrementCounterServer(which: CounterId, deps: IncrementDeps = {}): Promise<boolean> {
  const config = getFirebaseWebConfig();
  if (!isCountersConfigured(config)) return false;

  const fetchImpl = deps.fetchImpl ?? fetch;
  const sleep = deps.sleep ?? defaultSleep;
  const random = deps.random ?? Math.random;
  const body = JSON.stringify(buildIncrementCommit(config.projectId, which));

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetchImpl(commitUrl(config.projectId), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // API key in a header, never in the URL, so it doesn't end up in access logs
          "X-Goog-Api-Key": config.apiKey,
        },
        body,
        cache: "no-store",
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      if (res.ok) return true;
      if (!isRetryableStatus(res.status)) {
        console.warn(`[counters] ${which} increment rejected: HTTP ${res.status}`);
        return false;
      }
    } catch {
      // Network error or timeout: fall through to retry
    }
    if (attempt < MAX_ATTEMPTS) await sleep(200 + Math.floor(random() * 400));
  }
  console.warn(`[counters] ${which} increment failed after ${MAX_ATTEMPTS} attempts`);
  return false;
}
