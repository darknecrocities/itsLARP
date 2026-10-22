/**
 * Live counter configuration for the itsLARP landing page.
 *
 * Values come exclusively from environment variables (apps/web/.env.local
 * locally, Vercel Project Settings in production). Nothing is hardcoded.
 *
 * Note: Firebase *web* config is public by design (Next.js inlines
 * NEXT_PUBLIC_* into the browser bundle). Data protection is enforced by
 * Firestore Security Rules (see /firestore.rules), not by hiding these values.
 */

export const COUNTER_COLLECTION = "itslarpcounter";
export const COUNTER_IDS = ["visits", "downloads"] as const;
export type CounterId = (typeof COUNTER_IDS)[number];

export interface FirebaseWebConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

/**
 * Each variable is referenced explicitly so Next.js can inline it at build time.
 * A dynamic `process.env[name]` lookup would NOT be inlined into the client bundle.
 */
export function getFirebaseWebConfig(): FirebaseWebConfig {
  return {
    apiKey: (process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "").trim(),
    authDomain: (process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "").trim(),
    projectId: (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "").trim(),
    storageBucket: (process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "").trim(),
    messagingSenderId: (process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "").trim(),
    appId: (process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "").trim(),
  };
}

/** Project IDs are 6-30 chars of lowercase letters, digits and hyphens. */
const PROJECT_ID_PATTERN = /^[a-z][a-z0-9-]{4,28}[a-z0-9]$/;

/** Fail closed: counters stay off unless the minimum valid config is present. */
export function isCountersConfigured(config: FirebaseWebConfig = getFirebaseWebConfig()): boolean {
  return config.apiKey.length > 0 && PROJECT_ID_PATTERN.test(config.projectId);
}

export function isCounterId(value: unknown): value is CounterId {
  return typeof value === "string" && (COUNTER_IDS as readonly string[]).includes(value);
}
