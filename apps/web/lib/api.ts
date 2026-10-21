export const API =
  process.env.NEXT_PUBLIC_API_URL ??
  (typeof window !== "undefined" ? "/api/py" : "http://127.0.0.1:8000");

let autoStartPromise: Promise<boolean> | null = null;

async function attemptAutoStartBackend(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (autoStartPromise) return autoStartPromise;

  autoStartPromise = (async () => {
    try {
      // Trigger auto-start route handler
      const res = await fetch("/api/backend", { method: "POST" });
      if (res.ok) {
        // Poll for up to 3.5s until online
        const start = Date.now();
        while (Date.now() - start < 3500) {
          await new Promise((r) => setTimeout(r, 400));
          const check = await fetch("/api/backend").then((r) => r.json()).catch(() => null);
          if (check && check.status === "online") {
            return true;
          }
        }
        return true;
      }
    } catch {
      // Non-blocking fallback
    } finally {
      autoStartPromise = null;
    }
    return false;
  })();

  return autoStartPromise;
}

const DIRECT_BACKEND = "http://127.0.0.1:8000";

export async function api<T>(path: string, body?: unknown, method: string = "POST", hasRetried = false): Promise<T> {
  let r: Response | null = null;
  const isGet = body === undefined && method === "GET";
  const reqInit = {
    method: isGet ? "GET" : method,
    headers: { "Content-Type": "application/json" },
    body: isGet ? undefined : JSON.stringify(body ?? {}),
  };

  try {
    r = await fetch(`${API}${path}`, reqInit);
    if (!r.ok && r.status >= 500 && API !== DIRECT_BACKEND && typeof window !== "undefined") {
      try {
        const directRes = await fetch(`${DIRECT_BACKEND}${path}`, reqInit);
        if (directRes.ok || directRes.status < 500) {
          r = directRes;
        }
      } catch {
        // Keep original response
      }
    }
  } catch (err) {
    if (API !== DIRECT_BACKEND && typeof window !== "undefined") {
      try {
        r = await fetch(`${DIRECT_BACKEND}${path}`, reqInit);
      } catch {
        // Fall through to retry logic
      }
    }
    if (!r) {
      if (!hasRetried) {
        const started = await attemptAutoStartBackend();
        if (started) {
          return api<T>(path, body, method, true);
        }
      }
      throw new Error("Could not reach the HowToLarped API. The backend service is initializing on port 8000.");
    }
  }
  if (!r.ok) {
    const d = await r.json().catch(() => null);
    throw new Error(d?.detail && typeof d.detail === "string" ? d.detail : (d?.message || `Request failed (${r.status}). Your career data is safe.`));
  }
  return r.json();
}

export async function apiGet<T>(path: string, hasRetried = false): Promise<T> {
  let r: Response | null = null;
  const reqInit = {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  };
  try {
    r = await fetch(`${API}${path}`, reqInit);
    if (!r.ok && r.status >= 500 && API !== DIRECT_BACKEND && typeof window !== "undefined") {
      try {
        const directRes = await fetch(`${DIRECT_BACKEND}${path}`, reqInit);
        if (directRes.ok || directRes.status < 500) {
          r = directRes;
        }
      } catch {
        // Keep original
      }
    }
  } catch {
    if (API !== DIRECT_BACKEND && typeof window !== "undefined") {
      try {
        r = await fetch(`${DIRECT_BACKEND}${path}`, reqInit);
      } catch {
        // Fall through
      }
    }
    if (!r) {
      if (!hasRetried) {
        const started = await attemptAutoStartBackend();
        if (started) {
          return apiGet<T>(path, true);
        }
      }
      throw new Error("Could not reach the HowToLarped API. The backend service is initializing on port 8000.");
    }
  }
  if (!r.ok) {
    const d = await r.json().catch(() => null);
    throw new Error(d?.detail && typeof d.detail === "string" ? d.detail : (d?.message || `Request failed (${r.status}).`));
  }
  return r.json();
}

export async function apiUpload<T>(path: string, formData: FormData, hasRetried = false): Promise<T> {
  let r: Response;
  try {
    r = await fetch(`${API}${path}`, {
      method: "POST",
      body: formData,
    });
  } catch {
    if (!hasRetried) {
      const started = await attemptAutoStartBackend();
      if (started) {
        return apiUpload<T>(path, formData, true);
      }
    }
    throw new Error("Could not reach the HowToLarped API for upload. The backend is starting on port 8000.");
  }
  if (!r.ok) {
    const d = await r.json().catch(() => null);
    throw new Error(d?.detail && typeof d.detail === "string" ? d.detail : "Upload failed.");
  }
  return r.json();
}
