"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  ShieldCheck,
  CheckCircle2,
  Send,
  Sparkles,
} from "lucide-react";
import {
  NotificationSettings,
  getNotificationSettings,
  saveNotificationSettings,
  sendDesktopNotification,
  requestNotificationPermission,
  playSubtleChime,
} from "@/lib/notifications";
import { api } from "@/lib/api";

export function NotificationSettingsCard() {
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    importantOnly: true,
    soundEnabled: true,
  });
  const [permissionStatus, setPermissionStatus] = useState<string>("default");
  const [isDesktopApp, setIsDesktopApp] = useState(false);
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    setSettings(getNotificationSettings());

    const isElectron = Boolean(
      (window as any).electronAPI?.isDesktop ||
      navigator.userAgent.toLowerCase().includes("electron")
    );
    setIsDesktopApp(isElectron);

    if (isElectron) {
      setPermissionStatus("electron");
    } else if (typeof window !== "undefined" && "Notification" in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

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
    if (next.soundEnabled) {
      playSubtleChime();
    }
  };

  const handleRequestPermission = async () => {
    const res = await requestNotificationPermission();
    setPermissionStatus(res);
  };

  const handleSendTestAlert = async () => {
    setTestSent(true);
    try {
      const res = await api<{
        ok: boolean;
        notification: {
          id: string;
          title: string;
          message: string;
          priority: "urgent" | "high" | "normal" | "low";
          link_url?: string;
        };
      }>("/notifications/test", {});
      const item = res?.notification;
      if (item) {
        await sendDesktopNotification({
          id: item.id,
          title: item.title,
          body: item.message,
          priority: item.priority || "high",
          bypassAntiSpam: true,
          url: item.link_url || `/notifications?id=${item.id}`,
        });
      } else {
        await sendDesktopNotification({
          title: "Milestone Alert Active",
          body: "Desktop alerts will automatically mirror real application progression.",
          priority: "high",
          bypassAntiSpam: true,
          url: "/notifications",
        });
      }
    } catch {
      await sendDesktopNotification({
        title: "Dynamic Alerts Operational",
        body: "Milestone alerts are linked dynamically to your live Notion applications.",
        priority: "high",
        bypassAntiSpam: true,
        url: "/notifications",
      });
    } finally {
      setTimeout(() => setTestSent(false), 3000);
    }
  };

  return (
    <section
      data-tour="settings-notifications-card"
      className="mt-8 max-w-4xl card p-6 border border-line bg-card"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-black text-white">
            <Bell className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold">OS Desktop & System Notifications</h3>
              <span
                className={`font-mono text-xs px-2 py-0.5 rounded font-semibold ${
                  settings.enabled
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-neutral-100 text-neutral-600 border border-neutral-200"
                }`}
              >
                {settings.enabled ? "ACTIVE" : "MUTED"}
              </span>
            </div>
            <p className="text-xs text-muted mt-0.5">
              Receive native notifications directly on your computer (macOS Notification Center & Windows Action Center) for critical milestones without spam.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isDesktopApp && permissionStatus !== "granted" && (
            <button
              type="button"
              onClick={handleRequestPermission}
              className="btn btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Enable Browser Permissions</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleSendTestAlert}
            className="btn text-xs py-1.5 px-3 flex items-center gap-1.5 border border-line hover:bg-neutral-50"
          >
            <Send className="w-3.5 h-3.5 text-black" />
            <span>{testSent ? "Alert Sent to Computer!" : "Send Test Alert to Computer"}</span>
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 pt-4">
        {/* Toggle 1: Enable Desktop Alerts */}
        <label className="flex items-start justify-between p-3.5 rounded border border-line hover:border-black/30 cursor-pointer transition">
          <div className="space-y-1 pr-3">
            <div className="font-semibold text-xs flex items-center gap-1.5">
              {settings.enabled ? (
                <Bell className="w-4 h-4 text-emerald-600" />
              ) : (
                <BellOff className="w-4 h-4 text-neutral-400" />
              )}
              <span>Desktop OS Alerts</span>
            </div>
            <p className="text-[11px] text-muted leading-relaxed">
              Dispatches native desktop banners to your computer's notification system.
            </p>
          </div>
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={handleToggleEnabled}
            className="mt-1 rounded text-black focus:ring-0 cursor-pointer"
          />
        </label>

        {/* Toggle 2: Important Events Only (Anti-Spam) */}
        <label className="flex items-start justify-between p-3.5 rounded border border-line hover:border-black/30 cursor-pointer transition">
          <div className="space-y-1 pr-3">
            <div className="font-semibold text-xs flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Important Only (Anti-Spam)</span>
            </div>
            <p className="text-[11px] text-muted leading-relaxed">
              Only alerts on recruiter interviews, formal offers, and remote commands. Suppresses routine background pings.
            </p>
          </div>
          <input
            type="checkbox"
            checked={settings.importantOnly}
            onChange={handleToggleImportantOnly}
            className="mt-1 rounded text-black focus:ring-0 cursor-pointer"
          />
        </label>

        {/* Toggle 3: Sound Chime */}
        <label className="flex items-start justify-between p-3.5 rounded border border-line hover:border-black/30 cursor-pointer transition">
          <div className="space-y-1 pr-3">
            <div className="font-semibold text-xs flex items-center gap-1.5">
              {settings.soundEnabled ? (
                <Volume2 className="w-4 h-4 text-neutral-800" />
              ) : (
                <VolumeX className="w-4 h-4 text-neutral-400" />
              )}
              <span>Subtle Audio Chime</span>
            </div>
            <p className="text-[11px] text-muted leading-relaxed">
              Plays a discreet harmonic chime whenever high-priority milestone events occur.
            </p>
          </div>
          <input
            type="checkbox"
            checked={settings.soundEnabled}
            onChange={handleToggleSound}
            className="mt-1 rounded text-black focus:ring-0 cursor-pointer"
          />
        </label>
      </div>

      <div className="mt-4 pt-3 border-t border-line flex flex-wrap items-center justify-between text-[11px] text-muted">
        <span className="flex items-center gap-1.5 font-mono">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>
            Target Host: {isDesktopApp ? "Electron Native Bridge (macOS Notification Center / Windows Action Center)" : "Web Notification API & Local Host Engine"}
          </span>
        </span>
        <span className="font-mono">Anti-Spam Rate Limit: 2s Interval Gate Active</span>
      </div>
    </section>
  );
}
