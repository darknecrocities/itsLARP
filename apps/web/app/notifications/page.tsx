"use client";

import React, { useState, useEffect, useRef, useTransition, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Terminal,
  Trophy,
  ExternalLink,
  Trash2,
  CheckCheck,
  Send,
  SlidersHorizontal,
  Mail,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { apiGet, api } from "@/lib/api";
import { sendDesktopNotification } from "@/lib/notifications";

interface NotificationItem {
  id: string;
  event_type: string;
  title: string;
  message: string;
  priority: "urgent" | "high" | "normal" | "low";
  recipient?: string;
  link_url?: string;
  tag?: string;
  timestamp: string;
  read: boolean;
}

function NotificationsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const highlightedId = searchParams.get("id") || searchParams.get("highlight");

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "recruiter" | "swarm" | "remote" | "unread">("all");
  const [simulating, setSimulating] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const highlightedRef = useRef<HTMLDivElement | null>(null);

  const fetchFeed = async () => {
    try {
      const res = await apiGet<{
        ok: boolean;
        notifications: NotificationItem[];
        unread_count: number;
      }>("/notifications/feed?limit=50&important_only=false");
      if (res?.ok && Array.isArray(res.notifications)) {
        setNotifications(res.notifications);
      }
    } catch {
      // Non-blocking fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
    const interval = setInterval(fetchFeed, 6000);
    return () => clearInterval(interval);
  }, []);

  // When navigated with a specific ID, automatically mark it read and scroll into view
  useEffect(() => {
    if (highlightedId && notifications.length > 0) {
      const target = notifications.find((n) => n.id === highlightedId);
      if (target && !target.read) {
        api("/notifications/read", { ids: [highlightedId] }).then(() => {
          setNotifications((prev) =>
            prev.map((n) => (n.id === highlightedId ? { ...n, read: true } : n))
          );
        });
      }
      if (highlightedRef.current) {
        highlightedRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [highlightedId, notifications]);

  const handleMarkRead = async (id: string) => {
    try {
      await api("/notifications/read", { ids: [id] });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await api("/notifications/read-all", {});
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setFeedbackMsg("All notifications marked as read.");
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch {}
  };

  const handleClearAll = async () => {
    if (!confirm("Clear all notification logs? Your actual applications and Notion data will remain safe.")) return;
    try {
      await api("/notifications/clear", {});
      setNotifications([]);
      setFeedbackMsg("Notification history cleared.");
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch {}
  };

  const handleTriggerDynamicAlert = async () => {
    setSimulating(true);
    setFeedbackMsg(null);
    try {
      const res = await api<{ ok: boolean; notification: NotificationItem }>("/notifications/test", {});
      const item = res?.notification;
      if (item) {
        // Dispatch to host OS (macOS Notification Center / Windows Action Center)
        await sendDesktopNotification({
          id: item.id,
          title: item.title,
          body: item.message,
          priority: item.priority,
          url: `/notifications?id=${item.id}`,
          bypassAntiSpam: true,
        });

        // Prepend to active list immediately
        setNotifications((prev) => [item, ...prev.filter((n) => n.id !== item.id)]);
        setFeedbackMsg(`Dynamic alert dispatched to your computer screen: "${item.title}"`);
      }
    } catch (e: any) {
      setFeedbackMsg(e.message || "Failed to dispatch dynamic alert.");
    } finally {
      setSimulating(false);
      setTimeout(() => setFeedbackMsg(null), 4500);
    }
  };

  const filteredNotifs = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "recruiter") return n.event_type.includes("recruiter");
    if (filter === "swarm") return n.event_type.includes("swarm") || n.event_type.includes("application");
    if (filter === "remote") return n.event_type.includes("remote") || n.event_type.includes("command");
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;
  const recruiterCount = notifications.filter((n) => n.event_type.includes("recruiter")).length;
  const swarmCount = notifications.filter((n) => n.event_type.includes("swarm") || n.event_type.includes("application")).length;

  const renderEventIcon = (eventType: string, priority: string) => {
    if (eventType.includes("offer")) {
      return <Trophy className="w-4 h-4 text-amber-500" />;
    }
    if (eventType.includes("interview")) {
      return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    }
    if (eventType.includes("command") || eventType.includes("remote")) {
      return <Terminal className="w-4 h-4 text-purple-600" />;
    }
    if (eventType.includes("swarm") || eventType.includes("applied")) {
      return <Send className="w-4 h-4 text-blue-600" />;
    }
    return <Bell className="w-4 h-4 text-neutral-600" />;
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-ink">Notifications & Activity Feed</h1>
            {unreadCount > 0 && (
              <span className="font-mono text-xs px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full font-bold">
                {unreadCount} UNREAD
              </span>
            )}
          </div>
          <p className="text-xs text-muted mt-1 leading-relaxed">
            Real-time milestone alerts, recruiter interview requests, autonomous swarm applications, and email remote commands.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleTriggerDynamicAlert}
            disabled={simulating}
            className="btn btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 shadow-sm"
            title="Dispatch a real dynamic test notification to your computer"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>{simulating ? "Dispatching..." : "Simulate Dynamic Alert"}</span>
          </button>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="btn text-xs py-1.5 px-3 flex items-center gap-1.5 border border-line hover:bg-neutral-50"
            >
              <CheckCheck className="w-3.5 h-3.5 text-neutral-600" />
              <span>Mark All Read</span>
            </button>
          )}

          <Link
            href="/settings"
            className="btn text-xs py-1.5 px-2.5 flex items-center gap-1 border border-line hover:bg-neutral-50"
            title="Notification Preferences"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-600" />
            <span className="hidden sm:inline">Preferences</span>
          </Link>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-medium rounded border border-emerald-200 animate-in fade-in duration-150">
          {feedbackMsg}
        </div>
      )}

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
        <div className="p-3.5 card bg-bg2/40 border border-line">
          <div className="text-[11px] text-muted uppercase">Unread Alerts</div>
          <div className="text-2xl font-bold mt-1 text-ink flex items-center gap-2">
            <span>{unreadCount}</span>
            {unreadCount > 0 && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
          </div>
        </div>

        <div className="p-3.5 card bg-bg2/40 border border-line">
          <div className="text-[11px] text-muted uppercase">Recruiter Communications</div>
          <div className="text-2xl font-bold mt-1 text-ink">{recruiterCount}</div>
        </div>

        <div className="p-3.5 card bg-bg2/40 border border-line">
          <div className="text-[11px] text-muted uppercase">Swarm Submissions</div>
          <div className="text-2xl font-bold mt-1 text-ink">{swarmCount}</div>
        </div>

        <div className="p-3.5 card bg-bg2/40 border border-line">
          <div className="text-[11px] text-muted uppercase">Total Tracked</div>
          <div className="text-2xl font-bold mt-1 text-ink">{notifications.length}</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-2">
        <div className="flex flex-wrap gap-1 text-xs">
          {[
            { id: "all", label: "All Activity" },
            { id: "recruiter", label: "Recruiter Updates" },
            { id: "swarm", label: "Swarm Submissions" },
            { id: "remote", label: "Remote Commands" },
            { id: "unread", label: `Unread (${unreadCount})` },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id as any)}
              className={`px-3 py-1.5 rounded transition font-medium cursor-pointer ${
                filter === t.id
                  ? "bg-black text-white"
                  : "bg-white text-neutral-600 hover:text-black hover:bg-neutral-100 border border-neutral-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {notifications.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="text-[11px] text-neutral-400 hover:text-red-600 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Notification List */}
      <div className="space-y-2.5">
        {loading ? (
          <div className="p-12 text-center text-xs text-muted font-mono">
            Loading live activity feed...
          </div>
        ) : filteredNotifs.length === 0 ? (
          <div className="p-12 card text-center border-dashed border-2 border-neutral-300 rounded-lg space-y-3">
            <div className="w-10 h-10 rounded-full bg-neutral-100 mx-auto flex items-center justify-center text-neutral-500">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-black">No notifications found</h3>
              <p className="text-xs text-neutral-500 mt-1">
                {filter === "all"
                  ? "Your notification feed will populate dynamically as autonomous bots apply and recruiters reply."
                  : `No notifications match the "${filter}" filter.`}
              </p>
            </div>
            <button
              onClick={handleTriggerDynamicAlert}
              className="btn btn-primary text-xs py-1.5 px-3 mx-auto"
            >
              Simulate Dynamic Milestone Alert
            </button>
          </div>
        ) : (
          filteredNotifs.map((n) => {
            const isHighlighted = highlightedId === n.id;
            return (
              <div
                key={n.id}
                ref={isHighlighted ? highlightedRef : undefined}
                className={`card p-4 transition-all duration-200 border ${
                  isHighlighted
                    ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20 shadow-md"
                    : n.read
                    ? "border-line bg-white opacity-85 hover:opacity-100"
                    : "border-black/30 bg-neutral-50/50 shadow-xs"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div
                      className={`p-2 rounded mt-0.5 shrink-0 border ${
                        n.priority === "urgent"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : n.priority === "high"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-neutral-100 text-neutral-600 border-neutral-200"
                      }`}
                    >
                      {renderEventIcon(n.event_type, n.priority)}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-[11px]">
                        <span
                          className={`font-mono font-bold px-1.5 py-0.2 rounded text-[10px] ${
                            n.priority === "urgent"
                              ? "bg-amber-100 text-amber-800"
                              : n.priority === "high"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-neutral-200 text-neutral-700"
                          }`}
                        >
                          {n.priority.toUpperCase()}
                        </span>

                        <span className="font-mono text-muted">
                          {new Date(n.timestamp).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          · {new Date(n.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>

                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500" title="Unread alert" />
                        )}
                      </div>

                      <h3 className="text-sm font-semibold text-black leading-snug">{n.title}</h3>
                      <p className="text-xs text-neutral-700 leading-relaxed font-sans">{n.message}</p>

                      {/* Quick deep link actions */}
                      <div className="pt-2 flex flex-wrap items-center gap-2">
                        {n.link_url && (
                          <Link
                            href={n.link_url}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-black hover:underline"
                          >
                            <span>Open Details</span>
                            <ExternalLink className="w-3 h-3 text-neutral-500" />
                          </Link>
                        )}

                        {n.event_type.includes("recruiter") && (
                          <Link
                            href="/applications"
                            className="text-[11px] text-emerald-700 hover:underline font-mono"
                          >
                            → View Application Pipeline
                          </Link>
                        )}

                        {n.event_type.includes("command") && (
                          <Link
                            href="/integrations"
                            className="text-[11px] text-purple-700 hover:underline font-mono"
                          >
                            → Remote Control Console
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {!n.read ? (
                      <button
                        type="button"
                        onClick={() => handleMarkRead(n.id)}
                        className="p-1 text-neutral-400 hover:text-black rounded"
                        title="Mark as read"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      </button>
                    ) : (
                      <span className="text-[10px] text-neutral-400 font-mono px-1">Read</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs font-mono">Loading notifications...</div>}>
      <NotificationsContent />
    </Suspense>
  );
}
