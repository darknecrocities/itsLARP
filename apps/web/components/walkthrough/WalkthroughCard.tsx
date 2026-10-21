"use client";
import React from "react";
import { useWalkthrough } from "./WalkthroughContext";
import { ChevronLeft, ChevronRight, X, Check, Compass } from "lucide-react";

interface WalkthroughCardProps {
  targetRect: DOMRect | null;
}

export function WalkthroughCard({ targetRect }: WalkthroughCardProps) {
  const {
    currentStep,
    activeStepIndex,
    totalSteps,
    progressPercent,
    categories,
    activeCategory,
    nextStep,
    prevStep,
    skipTour,
    jumpToCategory,
  } = useWalkthrough();

  if (!currentStep) return null;

  // Compute card positioning relative to target element or center of screen
  const cardWidth = 380;
  const cardHeight = 240;
  const padding = 16;

  let style: React.CSSProperties = {
    position: "fixed",
    zIndex: 100,
    width: `min(${cardWidth}px, calc(100vw - 32px))`,
  };

  if (!targetRect || targetRect.width === 0 || targetRect.height === 0) {
    // Center in viewport if target element is not mounted
    style = {
      ...style,
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
    };
  } else {
    const spaceBelow = window.innerHeight - targetRect.bottom;
    const spaceAbove = targetRect.top;
    const spaceRight = window.innerWidth - targetRect.right;
    const spaceLeft = targetRect.left;

    let placement = currentStep.placement || "auto";

    if (placement === "auto") {
      if (spaceBelow >= cardHeight + padding) {
        placement = "bottom";
      } else if (spaceAbove >= cardHeight + padding) {
        placement = "top";
      } else if (spaceRight >= cardWidth + padding) {
        placement = "right";
      } else if (spaceLeft >= cardWidth + padding) {
        placement = "left";
      } else {
        placement = "bottom";
      }
    }

    if (placement === "bottom") {
      const top = Math.min(targetRect.bottom + 12, window.innerHeight - cardHeight - padding);
      const left = Math.max(padding, Math.min(targetRect.left, window.innerWidth - cardWidth - padding));
      style.top = `${top}px`;
      style.left = `${left}px`;
    } else if (placement === "top") {
      const top = Math.max(padding, targetRect.top - cardHeight - 12);
      const left = Math.max(padding, Math.min(targetRect.left, window.innerWidth - cardWidth - padding));
      style.top = `${top}px`;
      style.left = `${left}px`;
    } else if (placement === "right") {
      const top = Math.max(padding, Math.min(targetRect.top, window.innerHeight - cardHeight - padding));
      const left = Math.min(targetRect.right + 12, window.innerWidth - cardWidth - padding);
      style.top = `${top}px`;
      style.left = `${left}px`;
    } else {
      // left
      const top = Math.max(padding, Math.min(targetRect.top, window.innerHeight - cardHeight - padding));
      const left = Math.max(padding, targetRect.left - cardWidth - 12);
      style.top = `${top}px`;
      style.left = `${left}px`;
    }
  }

  const isFirst = activeStepIndex === 0;
  const isLast = activeStepIndex === totalSteps - 1;

  return (
    <div
      style={style}
      className="bg-bg border border-line rounded-xl shadow-2xl p-4 sm:p-5 flex flex-col gap-3 text-ink transition-all duration-200 pointer-events-auto"
      role="dialog"
      aria-modal="true"
      aria-label={currentStep.title}
    >
      {/* Top Progress & Header Bar */}
      <div>
        <div className="flex items-center justify-between text-[11px] font-mono text-muted mb-1.5">
          <div className="flex items-center gap-1.5 font-semibold text-ink uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-black shrink-0 inline-block" />
            <span>{currentStep.category}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>
              {activeStepIndex + 1} / {totalSteps}
            </span>
            <button
              type="button"
              onClick={skipTour}
              title="Skip Tour (Esc)"
              className="p-1 rounded text-muted hover:text-ink hover:bg-bg2 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-line h-1 rounded-full overflow-hidden">
          <div
            className="bg-black h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Title & Description */}
      <div className="space-y-1.5">
        <h3 className="text-sm font-semibold tracking-tight text-ink">
          {currentStep.title}
        </h3>
        <p className="text-xs text-muted leading-relaxed">
          {currentStep.description}
        </p>
      </div>

      {/* Chapter Dropdown Quick Jump */}
      <div className="flex items-center justify-between pt-1 border-t border-line/60 text-xs">
        <label htmlFor="tour-category-select" className="text-[11px] font-mono text-muted flex items-center gap-1">
          <Compass className="w-3 h-3 text-muted" />
          <span>Jump Track:</span>
        </label>
        <select
          id="tour-category-select"
          value={activeCategory?.id || ""}
          onChange={(e) => jumpToCategory(e.target.value)}
          className="bg-bg2 border border-line rounded px-2 py-0.5 text-xs font-mono text-ink cursor-pointer focus:outline-none"
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.label} ({cat.count})
            </option>
          ))}
        </select>
      </div>

      {/* Controls: Skip, Back, Next */}
      <div className="flex items-center justify-between pt-2 border-t border-line/80">
        <button
          type="button"
          onClick={skipTour}
          className="text-xs font-medium text-muted hover:text-ink transition-colors px-1 py-1"
        >
          Skip Tour
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prevStep}
            disabled={isFirst}
            className={`btn text-xs py-1 px-2.5 flex items-center gap-1 border border-line ${
              isFirst
                ? "opacity-40 cursor-not-allowed text-muted"
                : "hover:border-black text-ink"
            }`}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <button
            type="button"
            onClick={nextStep}
            className="btn btn-primary text-xs py-1 px-3 flex items-center gap-1 bg-black text-white hover:bg-neutral-800"
          >
            <span>{isLast ? "Complete Tour" : "Next"}</span>
            {isLast ? <Check className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
