"use client";
import React from "react";
import { useWalkthrough } from "./WalkthroughContext";
import { Compass, RotateCcw, CheckCircle2, Play } from "lucide-react";

export function WalkthroughSettingsCard() {
  const {
    startTour,
    hasCompleted,
    resetTour,
    categories,
    totalSteps,
    activeStepIndex,
  } = useWalkthrough();

  return (
    <section
      data-tour="settings-walkthrough-card"
      className="card p-6 border border-line bg-card mt-8 max-w-4xl"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-2 py-0.5 bg-black text-white rounded font-bold">
              APP WALKTHROUGH
            </span>
            <span className="font-mono text-xs px-2 py-0.5 bg-bg2 border border-line text-ink rounded font-semibold">
              {totalSteps} CHECKPOINTS
            </span>
            {hasCompleted && (
              <span className="font-mono text-xs px-2 py-0.5 bg-neutral-900 text-white rounded font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-white" />
                <span>COMPLETED</span>
              </span>
            )}
          </div>
          <h3 className="text-base font-semibold mt-2 text-ink">
            Interactive App Walkthrough & Spotlight Tour
          </h3>
          <p className="text-xs text-muted mt-0.5 max-w-2xl">
            Experience an interactive guided tour that highlights every sidebar control, input field, action button, and telemetry metric across itsLARP.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {hasCompleted && (
            <button
              type="button"
              onClick={resetTour}
              title="Reset walkthrough progress"
              className="btn text-xs py-2 px-3 border border-line hover:border-black flex items-center gap-1.5 text-muted hover:text-ink"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => startTour(0)}
            className="btn btn-primary text-xs py-2 px-4 flex items-center gap-2 bg-black text-white hover:bg-neutral-800"
          >
            <Play className="w-3.5 h-3.5" />
            <span>
              {activeStepIndex > 0 && !hasCompleted ? "Resume Walkthrough" : "Start Full App Tour"}
            </span>
          </button>
        </div>
      </div>

      {/* Chapters & Quick Track Launchers */}
      <div className="mt-4">
        <div className="text-[11px] font-mono uppercase tracking-wider text-muted mb-2 flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-ink" />
          <span>Explore by Feature Track:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => startTour(cat.id)}
              className="flex items-center justify-between p-2.5 rounded-lg border border-line bg-bg2/40 hover:bg-bg hover:border-black transition-colors text-left group"
            >
              <div className="min-w-0 pr-2">
                <div className="text-xs font-medium text-ink truncate group-hover:underline">
                  {cat.label}
                </div>
                <div className="text-[10px] text-muted font-mono truncate">
                  Route: {cat.route}
                </div>
              </div>
              <span className="font-mono text-[10px] px-1.5 py-0.5 bg-bg border border-line rounded text-muted shrink-0">
                {cat.count} steps
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
