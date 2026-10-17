"use client";
import React, { useState, useEffect } from "react";
import { X, RefreshCw, Download, GitBranch, GitMerge, Check, AlertCircle, Laptop } from "lucide-react";
import { Badge } from "./ui";
import { LATEST_UPDATE_DATA, CURRENT_RELEASE_VERSION, CURRENT_COMMIT_SHA, MAIN_BRANCH, type UpdateRelease } from "@/lib/updates";

interface UpdateNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckUpdates?: () => void;
  isChecking?: boolean;
}

export function UpdateNotificationModal({
  isOpen,
  onClose,
  onCheckUpdates,
  isChecking = false,
}: UpdateNotificationModalProps) {
  const [activeTab, setActiveTab] = useState<"merged" | "adds" | "fixes" | "verification">("merged");
  const data: UpdateRelease = LATEST_UPDATE_DATA;

  const [isDesktop, setIsDesktop] = useState(false);

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

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="update-modal-title"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white text-black border border-neutral-300 rounded-lg shadow-2xl max-w-2xl w-full max-h-[88vh] flex flex-col font-sans overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-bold px-2 py-0.5 bg-black text-white rounded">
                VERSION {CURRENT_RELEASE_VERSION}
              </span>
              <span className="font-mono text-[11px] px-2 py-0.5 bg-neutral-200 border border-neutral-300 rounded font-semibold text-neutral-800">
                BRANCH: {MAIN_BRANCH}
              </span>
              <span className="font-mono text-[11px] px-2 py-0.5 bg-ok/10 text-ok border border-ok/30 rounded font-semibold">
                [STATUS: UP TO DATE]
              </span>
            </div>
            <h2 id="update-modal-title" className="text-lg font-bold mt-1 text-black">
              itsLARP Updates & Changelog
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-neutral-200 text-neutral-500 hover:text-black transition-colors"
            aria-label="Close updates modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sync Summary Banner */}
        <div className="px-6 py-3 bg-neutral-100 border-b border-neutral-200 text-xs font-mono text-neutral-700 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <GitMerge className="w-4 h-4 text-black shrink-0" />
            <span>Synchronized with <strong>origin/main</strong> at commit <strong>{CURRENT_COMMIT_SHA}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            {onCheckUpdates && (
              <button
                onClick={onCheckUpdates}
                disabled={isChecking}
                className="btn text-xs py-1 px-2.5 bg-white border border-neutral-300 hover:border-black flex items-center gap-1.5 font-medium"
              >
                <RefreshCw className={`w-3 h-3 ${isChecking ? "animate-spin" : ""}`} />
                <span>Check Updates</span>
              </button>
            )}
            {!isDesktop ? (
              <a
                href="/download"
                className="btn btn-primary text-xs py-1 px-2.5 flex items-center gap-1.5 font-medium"
              >
                <Download className="w-3 h-3" />
                <span>Get Desktop App</span>
              </a>
            ) : (
              <span className="font-mono text-[11px] px-2.5 py-1 bg-black text-white rounded font-medium flex items-center gap-1.5">
                <Laptop className="w-3.5 h-3.5" />
                <span>Desktop App Native</span>
              </span>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-neutral-200 px-6 bg-white gap-2 text-xs font-mono pt-2">
          <button
            onClick={() => setActiveTab("merged")}
            className={`py-2 px-3 border-b-2 font-semibold transition-colors ${
              activeTab === "merged"
                ? "border-black text-black"
                : "border-transparent text-neutral-500 hover:text-black"
            }`}
          >
            [MERGED PULL REQUESTS] ({data.mergedPullRequests.length})
          </button>
          <button
            onClick={() => setActiveTab("adds")}
            className={`py-2 px-3 border-b-2 font-semibold transition-colors ${
              activeTab === "adds"
                ? "border-black text-black"
                : "border-transparent text-neutral-500 hover:text-black"
            }`}
          >
            [FEATURE ADDS] ({data.featureAdditions.length})
          </button>
          <button
            onClick={() => setActiveTab("fixes")}
            className={`py-2 px-3 border-b-2 font-semibold transition-colors ${
              activeTab === "fixes"
                ? "border-black text-black"
                : "border-transparent text-neutral-500 hover:text-black"
            }`}
          >
            [RESOLVED FIXES] ({data.stabilityFixes.length})
          </button>
          <button
            onClick={() => setActiveTab("verification")}
            className={`py-2 px-3 border-b-2 font-semibold transition-colors ${
              activeTab === "verification"
                ? "border-black text-black"
                : "border-transparent text-neutral-500 hover:text-black"
            }`}
          >
            [VERIFICATION] ({data.verificationStatus.length})
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === "merged" && (
            <div className="space-y-4">
              <p className="text-xs text-neutral-600 font-mono">
                Recent Pull Requests reviewed, tested, and merged into the main production branch:
              </p>
              {data.mergedPullRequests.map((pr) => (
                <div key={pr.id} className="p-4 rounded border border-neutral-200 bg-neutral-50 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 bg-black text-white rounded">
                        PR #{pr.id}
                      </span>
                      <span className="text-xs font-bold text-black">{pr.title}</span>
                    </div>
                    <span className="font-mono text-[10px] text-neutral-500">
                      Merged: {new Date(pr.mergedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="font-mono text-[11px] text-neutral-500">
                    Source: {pr.branch}
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
          )}

          {activeTab === "adds" && (
            <div className="space-y-3">
              <p className="text-xs text-neutral-600 font-mono">
                Major architectural and capability additions merged into the current build:
              </p>
              {data.featureAdditions.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded border border-neutral-200 bg-neutral-50">
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
          )}

          {activeTab === "fixes" && (
            <div className="space-y-3">
              <p className="text-xs text-neutral-600 font-mono">
                Issues identified, resolved, and verified across web and desktop runtimes:
              </p>
              {data.stabilityFixes.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded border border-neutral-200 bg-neutral-50 space-y-1.5">
                  <div className="font-mono text-[10px] font-bold text-neutral-500">
                    [{item.category.toUpperCase()}]
                  </div>
                  <div className="text-xs font-semibold text-black">
                    Issue: <span className="font-normal text-neutral-800">{item.issue}</span>
                  </div>
                  <div className="text-xs font-semibold text-neutral-900 bg-white p-2 rounded border border-neutral-200">
                    Resolution: <span className="font-normal text-neutral-700">{item.resolution}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "verification" && (
            <div className="space-y-3">
              <p className="text-xs text-neutral-600 font-mono">
                Continuous quality gates and test suite verification status:
              </p>
              <div className="border border-neutral-200 rounded overflow-hidden">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-neutral-100 border-b border-neutral-200 text-neutral-700">
                    <tr>
                      <th className="py-2.5 px-3">Test Suite</th>
                      <th className="py-2.5 px-3">Result</th>
                      <th className="py-2.5 px-3">Verification Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {data.verificationStatus.map((v, i) => (
                      <tr key={i} className="hover:bg-neutral-50">
                        <td className="py-2.5 px-3 font-semibold text-black">{v.testSuite}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 bg-ok/10 text-ok border border-ok/30 rounded text-[10px] font-bold">
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
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-neutral-200 bg-neutral-50 text-xs font-mono text-neutral-600">
          <div>
            itsLARP Automated Release Verification Suite
          </div>
          <button
            onClick={onClose}
            className="btn py-1.5 px-5 text-xs font-semibold bg-black text-white hover:bg-neutral-800 transition-colors"
          >
            Close & Return to App
          </button>
        </div>
      </div>
    </div>
  );
}
