"use client";
import React from "react";
import { motion } from "framer-motion";

interface CloudDialogueBubbleProps {
  text: string;
  onClose: () => void;
  className?: string;
}

/**
 * Cartoon cloud speech/thought bubble for the peeking mascot.
 * Styled in pure monochrome vector with puffy cloud lobes and trailing bubbles.
 */
export function CloudDialogueBubble({
  text,
  onClose,
  className = "",
}: CloudDialogueBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85, y: -10 }}
      transition={{ type: "spring", stiffness: 380, damping: 24 }}
      className={`absolute z-30 select-none ${className}`}
      role="dialog"
      aria-label="Scuttle message"
    >
      <div className="relative w-[280px] sm:w-[320px] md:w-[350px]">
        {/* SVG Puffy Cloud Vector Silhouette */}
        <svg
          viewBox="0 0 340 180"
          className="w-full h-auto drop-shadow-md overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main Puffy Cloud Body */}
          <path
            d="M 75 50
               C 65 25, 105 15, 130 30
               C 150 15, 190 15, 210 30
               C 235 15, 275 25, 265 55
               C 295 70, 295 110, 265 125
               C 275 155, 235 165, 210 150
               C 190 165, 150 165, 130 150
               C 105 165, 65 155, 75 125
               C 45 110, 45 70, 75 50 Z"
            fill="#FFFFFF"
            stroke="#000000"
            strokeWidth="3.2"
            strokeLinejoin="round"
          />

          {/* Cloud Thought Trail Bubbles (pointing down to crab's eye stalks) */}
          <circle cx="215" cy="158" r="9" fill="#FFFFFF" stroke="#000000" strokeWidth="2.6" />
          <circle cx="230" cy="172" r="5.5" fill="#FFFFFF" stroke="#000000" strokeWidth="2.2" />
          <circle cx="240" cy="183" r="3.5" fill="#FFFFFF" stroke="#000000" strokeWidth="1.8" />
        </svg>

        {/* Content Inside Cloud */}
        <div className="absolute inset-x-8 top-7 bottom-10 flex items-center justify-center text-center px-2">
          <p className="text-xs sm:text-sm font-mono font-medium text-neutral-900 leading-snug">
            {text}
          </p>
        </div>

        {/* Close Button on Top Right Cloud Lobe */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-10 w-5 h-5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-black flex items-center justify-center text-[11px] font-bold transition-colors"
          aria-label="Dismiss thought cloud"
        >
          ✕
        </button>
      </div>
    </motion.div>
  );
}
