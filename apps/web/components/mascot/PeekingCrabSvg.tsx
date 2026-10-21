"use client";
import React from "react";
import { motion } from "framer-motion";

export interface PeekingCrabSvgProps {
  eyeOffset?: { x: number; y: number };
  isBlinking?: boolean;
  isSnapping?: boolean;
  leftClawOpen?: boolean;
  rightClawOpen?: boolean;
  className?: string;
}

/**
 * Premium 2D Monochrome Vector Mascot Crab peeking in from the right edge.
 * Features articulated eye pupils, animated eyelids, and interactive pincer claws.
 */
export function PeekingCrabSvg({
  eyeOffset = { x: 0, y: 0 },
  isBlinking = false,
  isSnapping = false,
  leftClawOpen = false,
  rightClawOpen = false,
  className = "",
}: PeekingCrabSvgProps) {
  return (
    <svg
      viewBox="0 0 280 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none overflow-visible ${className}`}
      aria-label="Scuttle 2D Peeking Mascot Crab"
      role="img"
    >
      <defs>
        {/* Soft depth drop shadow filter for premium vector separation */}
        <filter id="crab-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="-4" dy="8" stdDeviation="12" floodColor="#000000" floodOpacity="0.08" />
        </filter>
      </defs>

      {/* Main Mascot Group with Depth Shadow */}
      <g filter="url(#crab-shadow)">
        {/* 3 Lower Left Skittering Walking Legs */}
        <g stroke="#000000" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Top Leg */}
          <motion.path
            d="M 120 185 L 82 200 L 52 230"
            animate={isSnapping ? { d: ["M 120 185 L 82 200 L 52 230", "M 120 185 L 78 194 L 48 234", "M 120 185 L 82 200 L 52 230"] } : {}}
            transition={{ duration: 0.25 }}
          />
          {/* Middle Leg */}
          <motion.path
            d="M 130 215 L 94 235 L 74 272"
            animate={isSnapping ? { d: ["M 130 215 L 94 235 L 74 272", "M 130 215 L 90 230 L 70 276", "M 130 215 L 94 235 L 74 272"] } : {}}
            transition={{ duration: 0.25, delay: 0.04 }}
          />
          {/* Bottom Leg */}
          <motion.path
            d="M 148 245 L 118 270 L 104 306"
            animate={isSnapping ? { d: ["M 148 245 L 118 270 L 104 306", "M 148 245 L 114 265 L 100 310", "M 148 245 L 118 270 L 104 306"] } : {}}
            transition={{ duration: 0.25, delay: 0.08 }}
          />
        </g>

        {/* Crab Carapace (Shell Body Peeking In) */}
        <g>
          {/* Main Shell Silhouette */}
          <path
            d="M 140 120 C 100 130, 85 185, 110 235 C 135 285, 210 290, 270 280 L 280 120 C 240 110, 180 110, 140 120 Z"
            fill="#FFFFFF"
            stroke="#000000"
            strokeWidth="4"
            strokeLinejoin="round"
          />

          {/* Shell Curved Architectural Seams (Monochrome Accent) */}
          <path
            d="M 132 165 Q 185 155 255 168"
            stroke="#E5E5E5"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M 125 200 Q 185 190 262 205"
            stroke="#E5E5E5"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M 138 235 Q 190 225 266 240"
            stroke="#E5E5E5"
            strokeWidth="2.4"
            strokeLinecap="round"
          />

          {/* Mechanical Bowtie (Black and White) */}
          <g transform="translate(175, 235)">
            <path d="M -10 -5 L -10 5 L 0 0 Z" fill="#000000" />
            <path d="M 10 -5 L 10 5 L 0 0 Z" fill="#000000" />
            <circle cx="0" cy="0" r="3" fill="#FFFFFF" stroke="#000000" strokeWidth="1.8" />
          </g>

          {/* Friendly Expression Smile */}
          <path
            d="M 152 195 Q 174 212 196 195"
            stroke="#000000"
            strokeWidth="3.2"
            strokeLinecap="round"
            fill="none"
          />
          {/* Subtle dimple accent */}
          <circle cx="150" cy="193" r="1.5" fill="#000000" />
          <circle cx="198" cy="193" r="1.5" fill="#000000" />
        </g>

        {/* Dual Eye Stalks and Large Eyeballs */}
        <g>
          {/* Left Eye Stalk */}
          <path d="M 130 135 L 108 82" stroke="#000000" strokeWidth="4" strokeLinecap="round" />
          {/* Right Eye Stalk */}
          <path d="M 175 125 L 182 68" stroke="#000000" strokeWidth="4" strokeLinecap="round" />

          {/* Left Eyeball (Spherical White Globe) */}
          <circle cx="104" cy="74" r="24" fill="#FFFFFF" stroke="#000000" strokeWidth="3.8" />
          {/* Right Eyeball (Spherical White Globe) */}
          <circle cx="184" cy="60" r="24" fill="#FFFFFF" stroke="#000000" strokeWidth="3.8" />

          {/* Blinking State vs Eye Tracking Pupils */}
          {isBlinking ? (
            <>
              {/* Left Closed Eyelid Curved Smile */}
              <path d="M 86 74 Q 104 82 122 74" stroke="#000000" strokeWidth="3.6" strokeLinecap="round" />
              {/* Right Closed Eyelid Curved Smile */}
              <path d="M 166 60 Q 184 68 202 60" stroke="#000000" strokeWidth="3.6" strokeLinecap="round" />
            </>
          ) : (
            <>
              {/* Left Eye Pupil with Specular Highlights */}
              <g transform={`translate(${eyeOffset.x * 1.6}, ${eyeOffset.y * 1.6})`}>
                <circle cx="104" cy="74" r="10.5" fill="#000000" />
                {/* Primary Specular Light Dot */}
                <circle cx="101" cy="70.5" r="3.2" fill="#FFFFFF" />
                {/* Secondary Micro Catchlight Dot */}
                <circle cx="106.5" cy="76" r="1.5" fill="#FFFFFF" />
              </g>

              {/* Right Eye Pupil with Specular Highlights */}
              <g transform={`translate(${eyeOffset.x * 1.6}, ${eyeOffset.y * 1.6})`}>
                <circle cx="184" cy="60" r="10.5" fill="#000000" />
                {/* Primary Specular Light Dot */}
                <circle cx="181" cy="56.5" r="3.2" fill="#FFFFFF" />
                {/* Secondary Micro Catchlight Dot */}
                <circle cx="186.5" cy="62" r="1.5" fill="#FFFFFF" />
              </g>
            </>
          )}
        </g>

        {/* Left Arm & Claw (Resting / Gripping the Border) */}
        <motion.g
          animate={leftClawOpen ? { rotate: -8, y: -4 } : { rotate: 0, y: 0 }}
          style={{ originX: "90px", originY: "155px" }}
          transition={{ duration: 0.18 }}
        >
          {/* Arm Segment */}
          <path
            d="M 115 160 C 85 150, 60 140, 48 115"
            stroke="#000000"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />

          {/* Lower Claw Bulb */}
          <path
            d="M 48 115 C 38 105, 20 102, 12 118 C 4 134, 20 152, 45 138 Z"
            fill="#FFFFFF"
            stroke="#000000"
            strokeWidth="3.6"
            strokeLinejoin="round"
          />

          {/* Upper Claw Pincer Blade (Articulated Snip) */}
          <motion.path
            d="M 38 110 C 32 90, 16 78, 6 82 C -4 86, 4 106, 22 118 Z"
            fill="#FFFFFF"
            stroke="#000000"
            strokeWidth="3.4"
            strokeLinejoin="round"
            animate={{ rotate: leftClawOpen ? -20 : 0 }}
            style={{ originX: "38px", originY: "110px" }}
            transition={{ duration: 0.16 }}
          />
        </motion.g>

        {/* Right Arm & Raised Claw (Waving / Snipping in the Air) */}
        <motion.g
          animate={
            isSnapping
              ? { rotate: [0, 8, -6, 0] }
              : rightClawOpen
              ? { rotate: 12, y: -6 }
              : { rotate: 0, y: 0 }
          }
          style={{ originX: "220px", originY: "115px" }}
          transition={{ duration: 0.22 }}
        >
          {/* Raised Arm Armature */}
          <path
            d="M 215 115 C 235 90, 245 65, 235 35"
            stroke="#000000"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />

          {/* Right Fixed Claw Bulb */}
          <path
            d="M 235 35 C 248 24, 266 22, 272 38 C 278 54, 260 70, 238 56 Z"
            fill="#FFFFFF"
            stroke="#000000"
            strokeWidth="3.6"
            strokeLinejoin="round"
          />

          {/* Right Articulated Pincer Blade (Snip Action) */}
          <motion.path
            d="M 242 30 C 248 10, 266 -2, 276 2 C 286 6, 278 26, 260 38 Z"
            fill="#FFFFFF"
            stroke="#000000"
            strokeWidth="3.4"
            strokeLinejoin="round"
            animate={{ rotate: rightClawOpen ? 26 : 0 }}
            style={{ originX: "242px", originY: "30px" }}
            transition={{ duration: 0.16 }}
          />
        </motion.g>
      </g>
    </svg>
  );
}
