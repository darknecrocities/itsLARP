"use client";
import React, { useState, useEffect } from "react";
import {
  X,
  RefreshCw,
  Download,
  GitBranch,
  GitMerge,
  Check,
  AlertCircle,
  Laptop,
  Zap,
  ShieldCheck,
  Copy,
  ExternalLink,
  Terminal,
} from "lucide-react";
import {
  LATEST_UPDATE_DATA,
  CURRENT_RELEASE_VERSION,
  CURRENT_COMMIT_SHA,
  MAIN_BRANCH,
  type UpdateRelease,
} from "@/lib/updates";

interface UpdateNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckUpdates?: () => void;
  isChecking?: boolean;
  initialTab?: TabKey;
}

type TabKey = "merged" | "adds" | "fixes" | "verification" | "updater";

export function UpdateNotificationModal({
  isOpen,
  onClose,
  onCheckUpdates,
  isChecking = false,
  initialTab = "merged",
}: UpdateNotificationModalProps) {
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const data: UpdateRelease = LATEST_UPDATE_DATA;

  const [isDesktop, setIsDesktop] = useState(false);
  const [checking, setChecking] = useState(isChecking);
  const [lastCheckedTime, setLastCheckedTime] = useState<string>("Just now");
  const [updateStatus, setUpdateStatus] = useState<"up_to_date" | "update_available" | "error">("up_to_date");
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [updateMsg, setUpdateMsg] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsDesktop(
        Boolean(
          (window as any).electronAPI?.isDesktop ||
          (window as any).isDesktop ||
          navigator.userAgent.toLowerCase().includes("electron")
        )
      );
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleRunUpdateCheck = async () => {
    setChecking(true);
    setUpdateMsg("");
    try {
      if (onCheckUpdates) {
        await onCheckUpdates();
      }
      if (typeof window !== "undefined" && (window as any).electronAPI?.checkForUpdates) {
        const res = await (window as any).electronAPI.checkForUpdates();
        if (res?.updateAvailable) {
          setUpdateStatus("update_available");
          setUpdateMsg(`New release ${res.latestVersion || "available"} ready for download.`);
        } else {
          setUpdateStatus("up_to_date");
          setUpdateMsg("Desktop binary and repository are synchronized with production.");
        }
      } else {
        const res = await fetch("/api/updates");
        const json = await res.json();
        if (json?.updateAvailable) {
          setUpdateStatus("update_available");
          setUpdateMsg(`New release ${json.latestVersion} detected on origin/main.`);
        } else {
          setUpdateStatus("up_to_date");
          setUpdateMsg("Working tree is completely up to date with origin/main.");
        }
      }
      setLastCheckedTime(new Date().toLocaleTimeString());
    } catch {
      setUpdateStatus("error");
      setUpdateMsg("Unable to contact GitHub update endpoint. Offline fallback active.");
    } finally {
      setChecking(false);
    }
  };

  const handleDownloadOrInstall = () => {
    if (typeof window !== "undefined" && (window as any).electronAPI?.downloadUpdate) {
      (window as any).electronAPI.downloadUpdate();
    } else {
      window.location.href = "/download";
    }
  };

  const copySyncCommand = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText("git pull origin main && npm run build");
      setCopiedCmd(true);
      setTimeout(() => setCopiedCmd(false), 2000);
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { id: "merged" as TabKey, label: "Merged Pull Requests", icon: GitMerge, count: data.mergedPullRequests.length },
    { id: "adds" as TabKey, label: "Feature Additions", icon: Zap, count: data.featureAdditions.length },
    { id: "fixes" as TabKey, label: "Resolved Fixes", icon: ShieldCheck, count: data.stabilityFixes.length },
    { id: "verification" as TabKey, label: "Verification Suite", icon: Check, count: data.verificationStatus.length },
    { id: "updater" as TabKey, label: "Software Updates", icon: RefreshCw, badge: updateStatus === "update_available" ? "NEW" : "LIVE" },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="update-modal-title"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white text-black border border-neutral-300 rounded-xl shadow-2xl max-w-4xl w-full h-[88vh] max-h-[700px] flex flex-col font-sans overflow-hidden"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-neutral-200 bg-neutral-50/90">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-[11px] font-bold px-2 py-0.5 bg-black text-white rounded">
              v{CURRENT_RELEASE_VERSION}
            </span>
            <span className="font-mono text-[11px] px-2 py-0.5 bg-neutral-200 border border-neutral-300 rounded font-semibold text-neutral-800">
              {MAIN_BRANCH}@{CURRENT_COMMIT_SHA}
            </span>
            <span className={`font-mono text-[11px] px-2 py-0.5 rounded font-semibold border ${
              updateStatus === "update_available"
                ? "bg-amber-100 text-amber-800 border-amber-300"
                : "bg-emerald-50 text-emerald-700 border-emerald-300"
            }`}>
              [{updateStatus === "update_available" ? "UPDATE AVAILABLE" : "UP TO DATE"}]
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-neutral-200 text-neutral-500 hover:text-black transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2-Column Body: Sticky Sidebar + Main Content */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Left Vertical Sidebar (Sticky) */}
          <aside className="w-64 shrink-0 bg-neutral-50/90 border-r border-neutral-200 flex flex-col justify-between p-3 select-none">
            <div className="space-y-1">
              <div className="px-3 pt-1 pb-2 text-[10px] font-mono font-bold tracking-wider text-neutral-400 uppercase">
                Release Inspector
              </div>
              {tabs.map((t) => {
                const Icon = t.icon;
                const active = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTab(t.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono transition-all text-left ${
                      active
                        ? "bg-black text-white shadow-xs font-bold"
                        : "text-neutral-700 hover:bg-neutral-200/70 hover:text-black font-medium"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${active ? "text-white" : "text-neutral-500"}`} />
                      <span className="truncate">{t.label}</span>
                    </div>
                    {t.count !== undefined && (
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full shrink-0 ml-1.5 ${
                        active ? "bg-neutral-800 text-neutral-300" : "bg-neutral-200 text-neutral-700"
                      }`}>
                        {t.count}
                      </span>
                    )}
                    {t.badge && (
                      <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold shrink-0 ml-1.5 ${
                        t.badge === "NEW" ? "bg-amber-500 text-black" : "bg-emerald-600 text-white"
                      }`}>
                        {t.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Sticky Sidebar Telemetry Box */}
            <div className="pt-3 border-t border-neutral-200/80 space-y-2">
              <div className="p-2.5 rounded-lg bg-white border border-neutral-200 text-[11px] font-mono space-y-1.5">
                <div className="flex items-center justify-between text-neutral-500 text-[10px]">
                  <span>RUNTIME</span>
                  <span className="font-semibold text-black">{isDesktop ? "Electron Native" : "Cloud Web Client"}</span>
                </div>
                <div className="flex items-center justify-between text-neutral-500 text-[10px]">
                  <span>CHECKED</span>
                  <span className="font-semibold text-black">{lastCheckedTime}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRunUpdateCheck}
                disabled={checking}
                className="w-full btn text-xs py-2 px-3 bg-neutral-900 text-white hover:bg-black rounded-lg flex items-center justify-center gap-2 font-mono"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${checking ? "animate-spin" : ""}`} />
                <span>{checking ? "Checking..." : "Check Updates"}</span>
              </button>
            </div>
          </aside>

          {/* Right Main Content Pane */}
          <main className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
            {activeTab === "merged" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                  <h3 className="text-sm font-bold font-sans text-black">Merged Pull Requests</h3>
                  <span className="text-xs font-mono text-neutral-500">
                    {data.mergedPullRequests.length} Production PRs
                  </span>
                </div>
                <div className="space-y-3">
                  {data.mergedPullRequests.map((pr) => (
                    <div key={pr.id} className="p-4 rounded-lg border border-neutral-200 bg-neutral-50 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 bg-black text-white rounded">
                            PR #{pr.id}
                          </span>
                          <span className="text-xs font-bold text-black">{pr.title}</span>
                        </div>
                        <span className="font-mono text-[10px] text-neutral-500">
                          {new Date(pr.mergedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="font-mono text-[11px] text-neutral-500">
                        Target: {pr.branch}
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-xs text-neutral-700 pl-1 pt-1">
                        {pr.highlights.map((h, i) => (
                          <li key={i} className="leading-relaxed">
                            {h}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "adds" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                  <h3 className="text-sm font-bold font-sans text-black">Architectural Feature Additions</h3>
                  <span className="text-xs font-mono text-neutral-500">
                    {data.featureAdditions.length} Verified Capabilities
                  </span>
                </div>
                <div className="space-y-3">
                  {data.featureAdditions.map((item, idx) => (
                    <div key={idx} className="p-3.5 rounded-lg border border-neutral-200 bg-neutral-50">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 bg-neutral-200 border border-neutral-300 rounded text-black">
                          [{item.category.toUpperCase()}]
                        </span>
                        <strong className="text-xs text-black">{item.title}</strong>
                      </div>
                      <p className="text-xs text-neutral-700 leading-relaxed pl-1 mt-1">
                        {item.details}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "fixes" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                  <h3 className="text-sm font-bold font-sans text-black">Resolved Stability Fixes</h3>
                  <span className="text-xs font-mono text-neutral-500">
                    {data.stabilityFixes.length} Resolved Items
                  </span>
                </div>
                <div className="space-y-3">
                  {data.stabilityFixes.map((item, idx) => (
                    <div key={idx} className="p-3.5 rounded-lg border border-neutral-200 bg-neutral-50 space-y-2">
                      <div className="font-mono text-[10px] font-bold text-neutral-500">
                        [{item.category.toUpperCase()}]
                      </div>
                      <div className="text-xs font-semibold text-black">
                        Issue: <span className="font-normal text-neutral-800">{item.issue}</span>
                      </div>
                      <div className="text-xs font-semibold text-neutral-900 bg-white p-2.5 rounded border border-neutral-200">
                        Resolution: <span className="font-normal text-neutral-700">{item.resolution}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "verification" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                  <h3 className="text-sm font-bold font-sans text-black">Automated Verification Suite</h3>
                  <span className="text-xs font-mono text-neutral-500">Continuous CI Gates</span>
                </div>
                <div className="border border-neutral-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-neutral-100 border-b border-neutral-200 text-neutral-700">
                      <tr>
                        <th className="py-2.5 px-3">Test Suite</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Verification Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {data.verificationStatus.map((v, i) => (
                        <tr key={i} className="hover:bg-neutral-50">
                          <td className="py-2.5 px-3 font-semibold text-black">{v.testSuite}</td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded text-[10px] font-bold">
                              [{v.result}]
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-neutral-600">{v.details}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "updater" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                  <h3 className="text-sm font-bold font-sans text-black">Live Software Update Engine</h3>
                  <span className="text-xs font-mono text-neutral-500">Auto-Updater v1.0</span>
                </div>

                <div className="p-4 rounded-lg border border-neutral-200 bg-neutral-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold font-mono text-black">CURRENT RELEASE: v{CURRENT_RELEASE_VERSION}</div>
                      <div className="text-[11px] font-mono text-neutral-500">Commit SHA: {CURRENT_COMMIT_SHA}</div>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-black text-white text-xs font-mono font-bold">
                      {MAIN_BRANCH}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-700 leading-relaxed">
                    itsLARP checks GitHub releases and commit deltas to ensure your application workforce operates with the latest security definitions, platform scrapers, and AI engines.
                  </p>

                  {updateMsg && (
                    <div className="p-3 rounded bg-white border border-neutral-200 text-xs font-mono text-neutral-800 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-neutral-600 shrink-0" />
                      <span>{updateMsg}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={handleRunUpdateCheck}
                      disabled={checking}
                      className="btn py-2 px-4 bg-black text-white text-xs font-mono flex items-center gap-2"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${checking ? "animate-spin" : ""}`} />
                      <span>{checking ? "Checking Release..." : "Check for Updates Now"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadOrInstall}
                      className="btn py-2 px-4 border border-neutral-300 bg-white hover:border-black text-xs font-mono flex items-center gap-2"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isDesktop ? "Download Latest Release Package" : "Get Desktop Installer (.dmg / .exe)"}</span>
                    </button>
                  </div>
                </div>

                {/* Git Synchronization Box */}
                <div className="p-4 rounded-lg border border-neutral-200 bg-white space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold font-mono text-black">
                    <Terminal className="w-4 h-4" />
                    <span>Developer Git Synchronization</span>
                  </div>
                  <p className="text-xs text-neutral-600">
                    If running locally in development mode, execute this command in terminal to pull the latest production changes:
                  </p>
                  <div className="flex items-center justify-between p-2.5 bg-neutral-100 rounded border border-neutral-200 font-mono text-xs">
                    <code>git pull origin main && npm run build</code>
                    <button
                      type="button"
                      onClick={copySyncCommand}
                      className="btn text-[11px] py-1 px-2.5 bg-white border border-neutral-300 hover:border-black flex items-center gap-1.5"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedCmd ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-neutral-200 bg-neutral-50 text-xs font-mono text-neutral-600">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span>itsLARP Automated Release Verification Suite · origin/main</span>
          </div>
          <button
            onClick={onClose}
            className="btn py-1 px-4 text-xs font-semibold bg-black text-white hover:bg-neutral-800 transition-colors"
          >
            Close & Return to App
          </button>
        </div>
      </div>
    </div>
  );
}
