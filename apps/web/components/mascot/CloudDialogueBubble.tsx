"use client";
import React from "react";
import { motion } from "framer-motion";

interface CloudDialogueBubbleProps {
  text: string;
  onClose: () => void;
  className?: string;
  isMobile?: boolean;
}

/**
 * Cartoon cloud thought bubble for the peeking mascot.
 * Styled in pure monochrome vector with puffy cloud lobes and trailing bubbles.
 * Designed with a spacious central pocket so text fits comfortably without clipping.
 */
export function CloudDialogueBubble({
  text,
  onClose,
  className = "",
  isMobile = false,
}: CloudDialogueBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.88, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.88, y: -8 }}
      transition={{ type: "spring", stiffness: 380, damping: 25 }}
      className={`z-30 select-none ${className}`}
      role="dialog"
      aria-label="Scuttle message"
    >
      <div className="relative w-full max-w-[340px] mx-auto">
        {/* SVG Puffy Cloud Vector Silhouette */}
        <svg
          viewBox="0 0 340 210"
          className="w-full h-auto drop-shadow-md overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main Puffy Cloud Body */}
          <path
            d="M 50 72
               C 32 38, 76 16, 108 32
               C 132 10, 178 10, 202 32
               C 228 14, 276 26, 286 64
               C 316 84, 316 122, 286 140
               C 274 172, 228 180, 202 158
               C 178 178, 128 178, 104 158
               C 74 176, 32 162, 42 128
               C 16 110, 16 78, 50 72 Z"
            fill="#FFFFFF"
            stroke="#000000"
            strokeWidth="3.2"
            strokeLinejoin="round"
          />

          {/* Cloud Thought Trail Bubbles (pointing down toward Scuttle's eye stalks) */}
          <circle cx="230" cy="172" r="9.5" fill="#FFFFFF" stroke="#000000" strokeWidth="2.8" />
          <circle cx="248" cy="189" r="6" fill="#FFFFFF" stroke="#000000" strokeWidth="2.2" />
          <circle cx="260" cy="202" r="3.5" fill="#FFFFFF" stroke="#000000" strokeWidth="1.8" />
        </svg>

        {/* Content Inside Cloud (Centered within generous interior bounds) */}
        <div className="absolute inset-x-8 top-6 bottom-14 flex items-center justify-center text-center px-4 pointer-events-none">
          <p className="text-[11px] sm:text-xs font-mono font-medium text-neutral-900 leading-snug break-words max-w-[210px] select-text pointer-events-auto">
            {text}
          </p>
        </div>

        {/* Close Button tucked safely inside top-right cloud lobe */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-8 w-5 h-5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-black flex items-center justify-center text-[10px] font-bold transition-colors cursor-pointer z-10"
          aria-label="Dismiss thought cloud"
        >
          ✕
        </button>
      </div>
    </motion.div>
  );
}
