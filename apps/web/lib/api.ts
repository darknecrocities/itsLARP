export const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function api<T>(path: string, body?: unknown, method: string = "POST"): Promise<T> {
  let r: Response;
  const isGet = body === undefined && method === "GET";
  try {
    r = await fetch(`${API}${path}`, {
      method: isGet ? "GET" : method,
      headers: { "Content-Type": "application/json" },
      body: isGet ? undefined : JSON.stringify(body ?? {}),
    });
  } catch {
    throw new Error("Could not reach the HowToLarped API. Ensure the backend is running on port 8000.");
  }
  if (!r.ok) {
    const d = await r.json().catch(() => null);
    throw new Error(d?.detail && typeof d.detail === "string" ? d.detail : "Request failed. Your career data is safe.");
  }
  return r.json();
}

export async function apiGet<T>(path: string): Promise<T> {
  let r: Response;
  try {
    r = await fetch(`${API}${path}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    throw new Error("Could not reach the HowToLarped API.");
  }
  if (!r.ok) {
    const d = await r.json().catch(() => null);
    throw new Error(d?.detail && typeof d.detail === "string" ? d.detail : "Request failed.");
  }
  return r.json();
}

export async function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  let r: Response;
  try {
    r = await fetch(`${API}${path}`, {
      method: "POST",
      body: formData,
    });
  } catch {
    throw new Error("Could not reach the HowToLarped API for upload.");
  }
  if (!r.ok) {
    const d = await r.json().catch(() => null);
    throw new Error(d?.detail && typeof d.detail === "string" ? d.detail : "Upload failed.");
  }
  return r.json();
}
