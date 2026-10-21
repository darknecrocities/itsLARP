"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useWalkthrough } from "./WalkthroughContext";
import { WalkthroughCard } from "./WalkthroughCard";

export function WalkthroughSpotlightOverlay() {
  const { isOpen, currentStep, nextStep } = useWalkthrough();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const updateTargetRect = useCallback(() => {
    if (!currentStep) {
      setTargetRect(null);
      return;
    }

    const element = document.querySelector(currentStep.selector);
    if (element) {
      const rect = element.getBoundingClientRect();
      setTargetRect(rect);
    } else {
      setTargetRect(null);
    }
  }, [currentStep]);

  // Scroll target element into view smoothly when step changes
  useEffect(() => {
    if (!isOpen || !currentStep) return;

    let attempts = 0;
    const maxAttempts = 15;

    const findAndScroll = () => {
      const element = document.querySelector(currentStep.selector);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);
      } else if (attempts < maxAttempts) {
        attempts++;
        setTimeout(findAndScroll, 120);
      } else {
        setTargetRect(null);
      }
    };

    findAndScroll();
  }, [isOpen, currentStep]);

  // Continuously track target element position during scrolling or resizing
  useEffect(() => {
    if (!isOpen) return;

    const handleUpdate = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(updateTargetRect);
    };

    window.addEventListener("scroll", handleUpdate, true);
    window.addEventListener("resize", handleUpdate);

    const interval = setInterval(updateTargetRect, 200);

    return () => {
      window.removeEventListener("scroll", handleUpdate, true);
      window.removeEventListener("resize", handleUpdate);
      clearInterval(interval);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isOpen, updateTargetRect]);

  if (!isOpen || !currentStep) return null;

  // Add 6px padding around the spotlight target element
  const pad = 6;
  const hasTarget = Boolean(targetRect && targetRect.width > 0 && targetRect.height > 0);
  const x = hasTarget && targetRect ? Math.max(0, targetRect.left - pad) : 0;
  const y = hasTarget && targetRect ? Math.max(0, targetRect.top - pad) : 0;
  const width = hasTarget && targetRect ? targetRect.width + pad * 2 : 0;
  const height = hasTarget && targetRect ? targetRect.height + pad * 2 : 0;

  return (
    <div className="fixed inset-0 z-[90] overflow-hidden">
      {/* SVG Mask Backdrop with transparent cut-out */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <mask id="walkthrough-spotlight-mask">
            {/* White covers entire screen */}
            <rect width="100%" height="100%" fill="white" />
            {/* Black cuts out the spotlight hole */}
            {hasTarget && (
              <rect
                x={x}
                y={y}
                width={width}
                height={height}
                rx={8}
                fill="black"
                className="transition-all duration-200"
              />
            )}
          </mask>
        </defs>

        {/* Semi-transparent dark overlay through mask */}
        <rect
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.72)"
          mask="url(#walkthrough-spotlight-mask)"
          className="pointer-events-auto cursor-pointer"
          onClick={nextStep}
        />

        {/* Crisp border ring around cut-out hole */}
        {hasTarget && (
          <rect
            x={x}
            y={y}
            width={width}
            height={height}
            rx={8}
            fill="none"
            stroke="rgba(255, 255, 255, 0.9)"
            strokeWidth={2}
            className="transition-all duration-200 drop-shadow-[0_0_8px_rgba(255,255,255,0.35)]"
          />
        )}
      </svg>

      {/* Floating Guided Card */}
      <WalkthroughCard targetRect={targetRect} />
    </div>
  );
}
