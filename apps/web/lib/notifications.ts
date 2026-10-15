/**
 * Cross-platform desktop and browser notification dispatcher.
 * Integrates natively with Electron (macOS Notification Center & Windows Action Center)
 * with graceful browser Notification API fallback.
 */

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
}

export async function sendDesktopNotification(payload: NotificationPayload): Promise<boolean> {
  if (typeof window === "undefined") return false;

  // 1. Electron Desktop Native Dispatch
  const electronAPI = (window as any).electronAPI;
  if (electronAPI && typeof electronAPI.showNotification === "function") {
    try {
      const res = await electronAPI.showNotification(payload);
      return Boolean(res?.ok);
    } catch {
      // Fall through to browser Notification API
    }
  }

  // 2. Standard Web Notification API
  if ("Notification" in window) {
    try {
      if (Notification.permission === "granted") {
        new Notification(payload.title, {
          body: payload.body,
          icon: payload.icon || "/branding/icon-192.png",
        });
        return true;
      } else if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          new Notification(payload.title, {
            body: payload.body,
            icon: payload.icon || "/branding/icon-192.png",
          });
          return true;
        }
      }
    } catch {}
  }

  return false;
}
