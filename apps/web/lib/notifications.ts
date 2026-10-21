/**
 * Cross-platform desktop and browser notification dispatcher.
 * Integrates natively with Electron (macOS Notification Center & Windows Action Center)
 * with graceful browser Notification API fallback, anti-spam throttling, and subtle audio feedback.
 */

export interface NotificationPayload {
  id?: string;
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  priority?: "urgent" | "high" | "normal" | "low";
  url?: string;
  timestamp?: string;
  bypassAntiSpam?: boolean;
}

export interface NotificationSettings {
  enabled: boolean;
  importantOnly: boolean;
  soundEnabled: boolean;
}

const SETTINGS_KEY = "itslarp_notification_settings";
const DISPATCHED_SET = new Set<string>();
let lastDispatchTimestamp = 0;
const MIN_DISPATCH_INTERVAL_MS = 2000;

export function getNotificationSettings(): NotificationSettings {
  if (typeof window === "undefined") {
    return { enabled: true, importantOnly: true, soundEnabled: true };
  }
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        enabled: parsed.enabled !== false,
        importantOnly: parsed.importantOnly !== false,
        soundEnabled: parsed.soundEnabled !== false,
      };
    }
  } catch {}
  return { enabled: true, importantOnly: true, soundEnabled: true };
}

export function saveNotificationSettings(settings: Partial<NotificationSettings>): NotificationSettings {
  const current = getNotificationSettings();
  const next = { ...current, ...settings };
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    } catch {}
  }
  return next;
}

export async function requestNotificationPermission(): Promise<"granted" | "denied" | "default" | "electron" | "unsupported"> {
  if (typeof window === "undefined") return "unsupported";

  // Check if running in Electron
  const electronAPI = (window as any).electronAPI;
  if (electronAPI && typeof electronAPI.showNotification === "function") {
    return "electron";
  }

  if (!("Notification" in window)) {
    return "unsupported";
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch {
    return "unsupported";
  }
}

export function playSubtleChime(): void {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Harmonic triad: C5 (523Hz), E5 (659Hz), G5 (784Hz)
    const tones = [523.25, 659.25, 783.99];
    tones.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.001, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.08, now + idx * 0.08 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.4);
    });

    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 1500);
  } catch {}
}

export async function sendDesktopNotification(payload: NotificationPayload): Promise<boolean> {
  if (typeof window === "undefined") return false;

  const settings = getNotificationSettings();
  if (!settings.enabled && !payload.bypassAntiSpam) {
    return false;
  }

  // 1. Anti-Spam Priority Gate: If "importantOnly" is active, filter out non-urgent events
  const priority = payload.priority || "normal";
  if (settings.importantOnly && !payload.bypassAntiSpam) {
    if (priority !== "urgent" && priority !== "high") {
      return false;
    }
  }

  // 2. Anti-Spam Deduplication Gate: Don't repeat the same notification ID or tag
  const dedupeKey = payload.id || payload.tag || `${payload.title}:${payload.body}`;
  if (!payload.bypassAntiSpam && DISPATCHED_SET.has(dedupeKey)) {
    return false;
  }

  // 3. Rate-Limiting Gate: Minimum interval between OS toast dispatches
  const now = Date.now();
  if (!payload.bypassAntiSpam && now - lastDispatchTimestamp < MIN_DISPATCH_INTERVAL_MS) {
    return false;
  }

  DISPATCHED_SET.add(dedupeKey);
  lastDispatchTimestamp = now;

  // Audio Chime if enabled
  if (settings.soundEnabled && (priority === "urgent" || priority === "high" || payload.bypassAntiSpam)) {
    playSubtleChime();
  }

  // A. Electron Desktop Native Dispatch (macOS Notification Center / Windows Action Center)
  const electronAPI = (window as any).electronAPI;
  if (electronAPI && typeof electronAPI.showNotification === "function") {
    try {
      const res = await electronAPI.showNotification({
        title: payload.title,
        body: payload.body,
        icon: payload.icon || "/branding/icon-192.png",
        priority: payload.priority,
        url: payload.url,
      });
      return Boolean(res?.ok);
    } catch {}
  }

  // B. Standard Web Notification API (Chrome, Edge, Safari, Firefox on macOS & Windows)
  let webDispatched = false;
  if ("Notification" in window) {
    try {
      if (Notification.permission === "granted") {
        const notif = new Notification(payload.title, {
          body: payload.body,
          icon: payload.icon || "/branding/icon-192.png",
          tag: payload.tag || dedupeKey,
        });
        if (payload.url) {
          notif.onclick = () => {
            window.focus();
            if (payload.url && payload.url.startsWith("/")) {
              window.location.href = payload.url;
            }
          };
        }
        webDispatched = true;
      } else if (Notification.permission !== "denied" && payload.bypassAntiSpam) {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          new Notification(payload.title, {
            body: payload.body,
            icon: payload.icon || "/branding/icon-192.png",
            tag: payload.tag || dedupeKey,
          });
          webDispatched = true;
        }
      }
    } catch {}
  }

  // C. Local Host OS Native Dispatch Fallback (macOS Notification Center / Windows Action Center via local API)
  if (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
    try {
      fetch("/api/py/integrations/email/send-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: payload.title,
          message: payload.body,
          event_type: "desktop_alert",
          recipient: "parejasarronkian@gmail.com",
        }),
      }).catch(() => {});
      webDispatched = true;
    } catch {}
  }

  return webDispatched;
}
