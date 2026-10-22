"use client";
import React, { useEffect, useRef } from "react";
import { useMotionValue, useSpring, useReducedMotion } from "framer-motion";

interface RollingNumberProps {
  value: number;
  className?: string;
  duration?: number;
}

const formatter = new Intl.NumberFormat("en-US");

/**
 * Animated number display that smoothly rolls up when the value changes.
 * Preserves accessibility via aria-live and gracefully respects prefers-reduced-motion.
 */
export function RollingNumber({ value, className = "" }: RollingNumberProps) {
  const shouldReduceMotion = useReducedMotion();
  const spanRef = useRef<HTMLSpanElement>(null);
  const motionVal = useMotionValue(value);
  const springVal = useSpring(motionVal, {
    stiffness: 90,
    damping: 24,
  });

  useEffect(() => {
    if (shouldReduceMotion) {
      if (spanRef.current) {
        spanRef.current.textContent = formatter.format(value);
      }
      return;
    }
    motionVal.set(value);
  }, [value, motionVal, shouldReduceMotion]);

  useEffect(() => {
    if (shouldReduceMotion) return;
    const unsub = springVal.on("change", (latest) => {
      if (spanRef.current) {
        spanRef.current.textContent = formatter.format(Math.round(latest));
      }
    });
    return () => unsub();
  }, [springVal, shouldReduceMotion]);

  return (
    <span
      ref={spanRef}
      className={`tabular-nums font-mono font-bold tracking-tight ${className}`}
      aria-live="polite"
      aria-atomic="true"
    >
      {formatter.format(value)}
    </span>
  );
}
