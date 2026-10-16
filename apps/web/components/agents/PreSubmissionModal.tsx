"use client";
import React, { useState } from "react";
import { X, ExternalLink, RefreshCw, CheckCircle2 } from "lucide-react";

interface PreSubmissionModalProps {
  appId: string;
  company: string;
  role: string;
  matchScore: number;
  onClose: () => void;
}

export function PreSubmissionModal({
  appId,
  company,
  role,
  matchScore,
  onClose,
}: PreSubmissionModalProps) {
  const [cacheBuster, setCacheBuster] = useState<number>(Date.now());
  const [loading, setLoading] = useState<boolean>(false);

  const screenshotUrl = `http://localhost:8000/applications/${appId}/screenshot?t=${cacheBuster}`;

  const handleRefresh = () => {
    setLoading(true);
    setCacheBuster(Date.now());
    setTimeout(() => setLoading(false), 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-xl border border-line bg-bg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-line bg-bg2/90">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-ink">
                  Pre-Submission Form Proof: {company}
                </h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium">
                  {matchScore}% Grounded
                </span>
              </div>
              <p className="text-xs text-muted">
                {role} &bull; Visual capture of form filled out by autonomous bot right before submission click
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading}
              className="p-1.5 text-xs text-muted hover:text-ink rounded border border-line bg-bg hover:bg-bg2 transition-colors flex items-center gap-1.5"
              title="Refresh Screenshot"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <a
              href={screenshotUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-xs text-muted hover:text-ink rounded border border-line bg-bg hover:bg-bg2 transition-colors flex items-center gap-1.5"
              title="Open full size"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Raw PNG</span>
            </a>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-muted hover:text-ink rounded border border-line bg-bg hover:bg-bg2 transition-colors"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Screenshot Viewport */}
        <div className="flex-1 overflow-auto p-4 bg-neutral-950 flex flex-col items-center justify-center">
          <div className="w-full max-w-4xl rounded-lg overflow-hidden border border-neutral-800 shadow-xl bg-neutral-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={screenshotUrl}
              alt={`Pre-submission application proof for ${company} - ${role}`}
              className="w-full h-auto object-contain block"
              loading="eager"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-line bg-bg2/70 flex flex-wrap items-center justify-between text-xs text-muted gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>
              All form fields injected &bull; Cursor poised on Submit Application button &bull; Synced with Notion
            </span>
          </div>
          <div className="font-mono text-[11px] text-muted">
            ID: {appId} &bull; Headless Chrome Viewport
          </div>
        </div>
      </div>
    </div>
  );
}
