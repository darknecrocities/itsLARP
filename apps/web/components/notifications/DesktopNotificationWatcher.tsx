"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  ExternalLink,
  X,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";
import {
  NotificationPayload,
  NotificationSettings,
  getNotificationSettings,
  saveNotificationSettings,
  sendDesktopNotification,
  requestNotificationPermission,
  playSubtleChime,
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
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    importantOnly: true,
    soundEnabled: true,
  });
  const [permissionStatus, setPermissionStatus] = useState<string>("default");
  const [activeToasts, setActiveToasts] = useState<ToastItem[]>([]);
  const [showConfig, setShowConfig] = useState(false);
  const [isDesktopApp, setIsDesktopApp] = useState(false);
  const isPollingRef = useRef(false);

  // Sync settings on mount
  useEffect(() => {
    setSettings(getNotificationSettings());

    const isElectron = Boolean(
      (window as any).electronAPI?.isDesktop ||
      navigator.userAgent.toLowerCase().includes("electron")
    );
    setIsDesktopApp(isElectron);

    if (isElectron) {
      setPermissionStatus("electron");
      // Handle notification clicks from Electron
      const electronAPI = (window as any).electronAPI;
      if (electronAPI && typeof electronAPI.onNotificationNavigate === "function") {
        const cleanup = electronAPI.onNotificationNavigate((url: string) => {
          if (url) router.push(url);
        });
        return cleanup;
      }
    } else if ("Notification" in window) {
      setPermissionStatus(Notification.permission);
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

        // Mark as acknowledged on backend
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
    // Initial check
    pollNotifications();
    const interval = setInterval(pollNotifications, 4500);
    return () => clearInterval(interval);
  }, [pollNotifications]);

  const handleRequestPermission = async () => {
    const res = await requestNotificationPermission();
    setPermissionStatus(res);
  };

  const handleToggleEnabled = () => {
    const next = saveNotificationSettings({ enabled: !settings.enabled });
    setSettings(next);
  };

  const handleToggleImportantOnly = () => {
    const next = saveNotificationSettings({ importantOnly: !settings.importantOnly });
    setSettings(next);
  };

  const handleToggleSound = () => {
    const next = saveNotificationSettings({ soundEnabled: !settings.soundEnabled });
    setSettings(next);
  };

  const handleSendTestNotification = async () => {
    playSubtleChime();
    const testItem = {
      id: `test-${Date.now()}`,
      title: "Interview Request: Auterion",
      message: "Recruiter invitation received for Senior Full-Stack Engineer.",
      priority: "urgent" as const,
      link_url: "/applications",
      tag: `test-${Date.now()}`,
    };

    await sendDesktopNotification({
      id: testItem.id,
      title: testItem.title,
      body: testItem.message,
      priority: "urgent",
      url: testItem.link_url,
      bypassAntiSpam: true,
    });

    setActiveToasts((prev) => [
      {
        id: testItem.id,
        title: testItem.title,
        message: testItem.message,
        priority: "urgent",
        linkUrl: testItem.link_url,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
      ...prev.slice(0, 3),
    ]);

    setTimeout(() => removeToast(testItem.id), 6500);
  };

  return (
    <>
      {/* Toast Notification Stack (Bottom-Right Anchor) */}
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

      {/* Persistent Settings Pill (Bottom-Left Anchor) */}
      <div className="fixed bottom-3 left-3 z-40">
        <button
          onClick={() => setShowConfig((prev) => !prev)}
          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-full text-xs font-medium border shadow-sm transition-all cursor-pointer ${
            settings.enabled
              ? "bg-white text-neutral-800 border-neutral-300 hover:bg-neutral-50"
              : "bg-neutral-100 text-neutral-500 border-neutral-200"
          }`}
          title="Configure Desktop & OS Notifications"
          aria-label="Desktop Notification Preferences"
        >
          {settings.enabled ? (
            <Bell className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <BellOff className="w-3.5 h-3.5 text-neutral-400" />
          )}
          <span className="hidden sm:inline font-mono text-[11px]">
            {isDesktopApp ? "Desktop OS" : "Alerts"}: {settings.enabled ? "Active" : "Muted"}
          </span>
          {settings.importantOnly && settings.enabled && (
            <span className="hidden md:inline px-1 py-0.2 text-[9px] font-semibold bg-emerald-100 text-emerald-800 rounded">
              Important Only
            </span>
          )}
          <SlidersHorizontal className="w-3 h-3 text-neutral-400" />
        </button>

        {/* Modal / Flyout Configuration Panel */}
        {showConfig && (
          <div className="absolute bottom-10 left-0 w-72 bg-white border border-neutral-200 shadow-xl rounded-lg p-3.5 text-neutral-800 text-xs space-y-3 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
              <div className="flex items-center gap-1.5 font-semibold text-neutral-900">
                <Bell className="w-4 h-4 text-emerald-600" />
                <span>OS Desktop Notifications</span>
              </div>
              <button
                onClick={() => setShowConfig(false)}
                className="text-neutral-400 hover:text-neutral-700 p-0.5 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="text-[11px] text-neutral-500 leading-relaxed">
              {isDesktopApp
                ? "Native notifications enabled for macOS Notification Center & Windows Action Center."
                : "Desktop browser notifications for critical app milestones and recruiter responses."}
            </div>

            {/* Permission Requester if Web */}
            {!isDesktopApp && permissionStatus !== "granted" && (
              <button
                onClick={handleRequestPermission}
                className="w-full py-1.5 px-2 bg-neutral-900 text-white rounded font-medium text-xs hover:bg-neutral-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Enable Browser Notifications</span>
              </button>
            )}

            {/* Toggles */}
            <div className="space-y-2 pt-1">
              <label className="flex items-center justify-between cursor-pointer">
                <span>Enable Desktop Alerts</span>
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={handleToggleEnabled}
                  className="rounded text-neutral-900 focus:ring-0 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <div>Important Events Only</div>
                  <div className="text-[10px] text-neutral-400">Interviews, offers, submissions</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.importantOnly}
                  onChange={handleToggleImportantOnly}
                  className="rounded text-neutral-900 focus:ring-0 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="flex items-center gap-1.5">
                  {settings.soundEnabled ? (
                    <Volume2 className="w-3.5 h-3.5 text-neutral-600" />
                  ) : (
                    <VolumeX className="w-3.5 h-3.5 text-neutral-400" />
                  )}
                  <span>Audio Chime</span>
                </span>
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={handleToggleSound}
                  className="rounded text-neutral-900 focus:ring-0 cursor-pointer"
                />
              </label>
            </div>

            {/* Test Action */}
            <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
              <span className="text-[10px] text-neutral-400 font-mono">Anti-Spam Filter: ON</span>
              <button
                onClick={handleSendTestNotification}
                className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium rounded text-[11px] transition-colors cursor-pointer"
              >
                Test Alert
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
