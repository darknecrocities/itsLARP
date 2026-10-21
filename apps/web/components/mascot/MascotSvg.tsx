"use client";
import React from "react";
import { motion } from "framer-motion";
import { type MascotMood, type MascotSize } from "./types";

interface MascotSvgProps {
  size?: MascotSize;
  mood?: MascotMood;
  eyeOffset?: { x: number; y: number };
  isBlinking?: boolean;
  leftClawOpen?: boolean;
  rightClawOpen?: boolean;
  className?: string;
}

const SIZE_MAP: Record<MascotSize, number> = {
  xs: 32,
  sm: 48,
  md: 72,
  lg: 104,
  xl: 140,
  hero: 180,
};

export function MascotSvg({
  size = "md",
  mood = "idle",
  eyeOffset = { x: 0, y: 0 },
  isBlinking = false,
  leftClawOpen = false,
  rightClawOpen = false,
  className = "",
}: MascotSvgProps) {
  const pixelSize = SIZE_MAP[size] || 72;
  const isSleeping = mood === "sleeping";
  const isWorking = mood === "working";
  const isCelebrating = mood === "celebrating";

  return (
    <svg
      viewBox="0 0 120 100"
      width={pixelSize}
      height={pixelSize * (100 / 120)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none overflow-visible ${className}`}
      aria-label="Scuttle the Career Automation Mascot"
      role="img"
    >
      {/* 6 Skittering Walking Legs (3 Left, 3 Right) */}
      <g stroke="#000000" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
        {/* Left Legs */}
        <motion.path
          d="M 32 60 L 16 66 L 8 76"
          animate={
            isWorking
              ? { d: ["M 32 60 L 16 66 L 8 76", "M 32 60 L 14 63 L 9 78", "M 32 60 L 16 66 L 8 76"] }
              : isCelebrating
              ? { d: ["M 32 60 L 16 66 L 8 76", "M 32 60 L 18 69 L 10 74", "M 32 60 L 16 66 L 8 76"] }
              : {}
          }
          transition={{ duration: 0.35, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          d="M 34 68 L 20 76 L 14 88"
          animate={
            isWorking
              ? { d: ["M 34 68 L 20 76 L 14 88", "M 34 68 L 18 73 L 16 90", "M 34 68 L 20 76 L 14 88"] }
              : {}
          }
          transition={{ duration: 0.3, repeat: Infinity, ease: "easeInOut", delay: 0.05 }}
        />
        <motion.path
          d="M 40 76 L 28 85 L 24 96"
          animate={
            isWorking
              ? { d: ["M 40 76 L 28 85 L 24 96", "M 40 76 L 26 83 L 26 98", "M 40 76 L 28 85 L 24 96"] }
              : {}
          }
          transition={{ duration: 0.32, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
        />

        {/* Right Legs */}
        <motion.path
          d="M 88 60 L 104 66 L 112 76"
          animate={
            isWorking
              ? { d: ["M 88 60 L 104 66 L 112 76", "M 88 60 L 106 63 L 111 78", "M 88 60 L 104 66 L 112 76"] }
              : isCelebrating
              ? { d: ["M 88 60 L 104 66 L 112 76", "M 88 60 L 102 69 L 110 74", "M 88 60 L 104 66 L 112 76"] }
              : {}
          }
          transition={{ duration: 0.35, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          d="M 86 68 L 100 76 L 106 88"
          animate={
            isWorking
              ? { d: ["M 86 68 L 100 76 L 106 88", "M 86 68 L 102 73 L 104 90", "M 86 68 L 100 76 L 106 88"] }
              : {}
          }
          transition={{ duration: 0.3, repeat: Infinity, ease: "easeInOut", delay: 0.05 }}
        />
        <motion.path
          d="M 80 76 L 92 85 L 96 96"
          animate={
            isWorking
              ? { d: ["M 80 76 L 92 85 L 96 96", "M 80 76 L 94 83 L 94 98", "M 80 76 L 92 85 L 96 96"] }
              : {}
          }
          transition={{ duration: 0.32, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
        />
      </g>

      {/* Main Carapace (Crab Body Shell) */}
      <motion.g
        animate={
          isWorking
            ? { y: [0, -1.5, 0] }
            : isCelebrating
            ? { y: [0, -5, 0] }
            : isSleeping
            ? { y: [0, 1.2, 0] }
            : { y: [0, -0.8, 0] }
        }
        transition={{
          duration: isWorking ? 0.25 : isCelebrating ? 0.4 : isSleeping ? 2.5 : 1.8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Carapace Shell Silhouette */}
        <ellipse
          cx="60"
          cy="64"
          rx="34"
          ry="26"
          fill="#FFFFFF"
          stroke="#000000"
          strokeWidth="3.2"
        />

        {/* Subtle Carapace Tech Grooves (Monochrome Vector) */}
        <path
          d="M 44 54 Q 60 50 76 54"
          stroke="#E5E5E5"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M 40 64 Q 60 59 80 64"
          stroke="#E5E5E5"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M 46 74 Q 60 70 74 74"
          stroke="#E5E5E5"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* Small Mechanical Bowtie Accent */}
        <g transform="translate(60, 78)">
          <path d="M -6 -3 L -6 3 L 0 0 Z" fill="#000000" />
          <path d="M 6 -3 L 6 3 L 0 0 Z" fill="#000000" />
          <circle cx="0" cy="0" r="1.8" fill="#FFFFFF" stroke="#000000" strokeWidth="1" />
        </g>

        {/* Mouth / Smile Expression */}
        {isCelebrating ? (
          <path
            d="M 52 64 Q 60 73 68 64 Z"
            fill="#000000"
            stroke="#000000"
            strokeWidth="1.5"
          />
        ) : isWorking ? (
          <line
            x1="54"
            y1="66"
            x2="66"
            y2="66"
            stroke="#000000"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        ) : (
          <path
            d="M 54 65 Q 60 69 66 65"
            stroke="#000000"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />
        )}
      </motion.g>

      {/* Dual Eye Stalks & Eyeballs */}
      <g>
        {/* Left Eye Stalk */}
        <path d="M 47 44 L 44 26" stroke="#000000" strokeWidth="3" strokeLinecap="round" />
        {/* Right Eye Stalk */}
        <path d="M 73 44 L 76 26" stroke="#000000" strokeWidth="3" strokeLinecap="round" />

        {/* Left Eyeball */}
        <circle cx="43" cy="22" r="11" fill="#FFFFFF" stroke="#000000" strokeWidth="3" />
        {/* Right Eyeball */}
        <circle cx="77" cy="22" r="11" fill="#FFFFFF" stroke="#000000" strokeWidth="3" />

        {/* Eye Pupils (Cursor Following) or Closed Eyelids (Blinking/Sleeping) */}
        {isBlinking || isSleeping ? (
          <>
            {/* Left Eyelid Curved Line */}
            <path d="M 35 22 Q 43 25 51 22" stroke="#000000" strokeWidth="2.8" strokeLinecap="round" />
            {/* Right Eyelid Curved Line */}
            <path d="M 69 22 Q 77 25 85 22" stroke="#000000" strokeWidth="2.8" strokeLinecap="round" />
          </>
        ) : (
          <>
            {/* Left Pupil */}
            <g transform={`translate(${eyeOffset.x}, ${eyeOffset.y})`}>
              <circle cx="43" cy="22" r="4.8" fill="#000000" />
              <circle cx="41.5" cy="20.5" r="1.5" fill="#FFFFFF" />
            </g>

            {/* Right Pupil */}
            <g transform={`translate(${eyeOffset.x}, ${eyeOffset.y})`}>
              <circle cx="77" cy="22" r="4.8" fill="#000000" />
              <circle cx="75.5" cy="20.5" r="1.5" fill="#FFFFFF" />
            </g>
          </>
        )}
      </g>

      {/* Left Articulated Pincer Claw */}
      <motion.g
        transform-origin="28 50"
        animate={
          isCelebrating
            ? { rotate: [-15, -45, -15], y: [-2, -8, -2] }
            : isWorking
            ? { rotate: leftClawOpen ? -35 : -15 }
            : { rotate: leftClawOpen ? -28 : -10 }
        }
        transition={{
          duration: isWorking ? 0.18 : isCelebrating ? 0.45 : 0.3,
          repeat: isCelebrating ? Infinity : 0,
          ease: "easeInOut",
        }}
      >
        {/* Left Arm Armature */}
        <path d="M 32 50 C 22 45, 16 38, 16 28" stroke="#000000" strokeWidth="3" strokeLinecap="round" fill="none" />
        
        {/* Left Fixed Claw Base */}
        <path
          d="M 16 28 C 12 24, 6 22, 4 28 C 2 34, 8 40, 16 34 Z"
          fill="#FFFFFF"
          stroke="#000000"
          strokeWidth="2.8"
        />
        
        {/* Left Upper Pincer Blade (Snip Action) */}
        <motion.path
          d="M 12 25 C 10 16, 4 12, 1 14 C -1 16, 2 24, 8 28 Z"
          fill="#FFFFFF"
          stroke="#000000"
          strokeWidth="2.6"
          animate={{ rotate: leftClawOpen ? -22 : 0 }}
          style={{ originX: "12px", originY: "25px" }}
          transition={{ duration: 0.18 }}
        />
      </motion.g>

      {/* Right Articulated Pincer Claw */}
      <motion.g
        transform-origin="92 50"
        animate={
          isCelebrating
            ? { rotate: [15, 45, 15], y: [-2, -8, -2] }
            : isWorking
            ? { rotate: rightClawOpen ? 35 : 15 }
            : { rotate: rightClawOpen ? 28 : 10 }
        }
        transition={{
          duration: isWorking ? 0.18 : isCelebrating ? 0.45 : 0.3,
          repeat: isCelebrating ? Infinity : 0,
          ease: "easeInOut",
        }}
      >
        {/* Right Arm Armature */}
        <path d="M 88 50 C 98 45, 104 38, 104 28" stroke="#000000" strokeWidth="3" strokeLinecap="round" fill="none" />
        
        {/* Right Fixed Claw Base */}
        <path
          d="M 104 28 C 108 24, 114 22, 116 28 C 118 34, 112 40, 104 34 Z"
          fill="#FFFFFF"
          stroke="#000000"
          strokeWidth="2.8"
        />
        
        {/* Right Upper Pincer Blade (Snip Action) */}
        <motion.path
          d="M 108 25 C 110 16, 116 12, 119 14 C 121 16, 118 24, 112 28 Z"
          fill="#FFFFFF"
          stroke="#000000"
          strokeWidth="2.6"
          animate={{ rotate: rightClawOpen ? 22 : 0 }}
          style={{ originX: "108px", originY: "25px" }}
          transition={{ duration: 0.18 }}
        />
      </motion.g>
    </svg>
  );
}
