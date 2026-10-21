"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ExternalLink,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  sendDesktopNotification,
} from "@/lib/notifications";
import { apiGet, api } from "@/lib/api";

interface ToastItem {
  id: string;
  title: string;
  message: string;
  priority: "urgent" | "high" | "normal" | "low";
  linkUrl?: string;
  timestamp: string;
}

export function DesktopNotificationWatcher() {
  const router = useRouter();
  const [activeToasts, setActiveToasts] = useState<ToastItem[]>([]);
  const isPollingRef = useRef(false);

  // Sync Electron IPC navigation
  useEffect(() => {
    const isElectron = Boolean(
      (window as any).electronAPI?.isDesktop ||
      navigator.userAgent.toLowerCase().includes("electron")
    );

    if (isElectron) {
      const electronAPI = (window as any).electronAPI;
      if (electronAPI && typeof electronAPI.onNotificationNavigate === "function") {
        const cleanup = electronAPI.onNotificationNavigate((url: string) => {
          if (url) router.push(url);
        });
        return cleanup;
      }
    }
  }, [router]);

  const removeToast = useCallback((id: string) => {
    setActiveToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleDispatchNotification = useCallback(
    async (item: {
      id: string;
      title: string;
      message: string;
      priority?: string;
      link_url?: string;
      tag?: string;
    }) => {
      const priority = (item.priority as any) || "high";

      // 1. Dispatch OS Desktop Notification (macOS Center / Windows Action Center)
      await sendDesktopNotification({
        id: item.id,
        title: item.title,
        body: item.message,
        priority,
        url: item.link_url,
        tag: item.tag,
      });

      // 2. Render In-App Floating Toast
      const toastItem: ToastItem = {
        id: item.id,
        title: item.title,
        message: item.message,
        priority,
        linkUrl: item.link_url,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setActiveToasts((prev) => {
        const filtered = prev.filter((t) => t.id !== item.id);
        return [toastItem, ...filtered].slice(0, 4);
      });

      // Auto-dismiss after 6.5 seconds
      setTimeout(() => {
        removeToast(item.id);
      }, 6500);
    },
    [removeToast]
  );

  // Poll for background server notifications
  const pollNotifications = useCallback(async () => {
    if (isPollingRef.current) return;
    isPollingRef.current = true;
    try {
      const res = await apiGet<{
        ok: boolean;
        notifications: Array<{
          id: string;
          event_type: string;
          title: string;
          message: string;
          priority: string;
          link_url?: string;
          tag?: string;
          read: boolean;
        }>;
      }>("/notifications/feed?unread_only=true&important_only=true&limit=10");

      if (res?.ok && Array.isArray(res.notifications) && res.notifications.length > 0) {
        const toMarkRead: string[] = [];
        for (const notif of res.notifications) {
          await handleDispatchNotification(notif);
          toMarkRead.push(notif.id);
        }

        if (toMarkRead.length > 0) {
          api("/notifications/read", { ids: toMarkRead }).catch(() => {});
        }
      }
    } catch {
      // Non-blocking fallback
    } finally {
      isPollingRef.current = false;
    }
  }, [handleDispatchNotification]);

  useEffect(() => {
    pollNotifications();
    const interval = setInterval(pollNotifications, 5000);
    return () => clearInterval(interval);
  }, [pollNotifications]);

  if (activeToasts.length === 0) {
    return null;
  }

  return (
    <aside
      aria-label="Desktop notifications"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      {activeToasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className="pointer-events-auto bg-neutral-900 border border-neutral-700/80 shadow-2xl rounded-lg p-3.5 text-neutral-100 flex items-start justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <div className="flex items-start gap-2.5 min-w-0">
            <div
              className={`p-1.5 rounded mt-0.5 shrink-0 ${
                t.priority === "urgent"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              }`}
            >
              {t.priority === "urgent" ? (
                <AlertCircle className="w-4 h-4" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-mono uppercase text-neutral-400">
                  {t.priority === "urgent" ? "High Priority" : "Activity"}
                </span>
                <span className="text-neutral-500 text-[10px]">· {t.timestamp}</span>
              </div>
              <h4 className="text-xs font-semibold text-white truncate mt-0.5">{t.title}</h4>
              <p className="text-[11px] text-neutral-300 line-clamp-2 mt-0.5 leading-relaxed">
                {t.message}
              </p>
              {t.linkUrl && (
                <button
                  onClick={() => {
                    removeToast(t.id);
                    router.push(t.linkUrl!);
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-300 hover:text-amber-200 mt-2 transition-colors cursor-pointer"
                >
                  <span>View Application</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
          <button
            onClick={() => removeToast(t.id)}
            className="text-neutral-400 hover:text-white p-1 rounded transition-colors shrink-0 cursor-pointer"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </aside>
  );
}
