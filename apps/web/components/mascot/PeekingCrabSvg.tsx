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
 * Features articulated eye pupils, animated eyelids, crawling legs, and pinching claws.
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
      {/* 3 Lower Left Crawling / Walking Legs (Articulated at Hip Sockets) */}
      <g stroke="#000000" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* Top Walking Leg */}
        <motion.g
          animate={{
            rotate: isSnapping ? [-8, 8, -8] : [-3, 4, -3],
          }}
          style={{ originX: "120px", originY: "185px" }}
          transition={{
            duration: isSnapping ? 0.28 : 1.6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <path d="M 120 185 L 82 200 L 52 230" />
        </motion.g>

        {/* Middle Walking Leg */}
        <motion.g
          animate={{
            rotate: isSnapping ? [8, -8, 8] : [4, -3, 4],
          }}
          style={{ originX: "130px", originY: "215px" }}
          transition={{
            duration: isSnapping ? 0.32 : 1.9,
            repeat: Infinity,
            ease: "easeInOut",
            delay: isSnapping ? 0.05 : 0.25,
          }}
        >
          <path d="M 130 215 L 94 235 L 74 272" />
        </motion.g>

        {/* Bottom Walking Leg */}
        <motion.g
          animate={{
            rotate: isSnapping ? [-7, 7, -7] : [-4, 3, -4],
          }}
          style={{ originX: "148px", originY: "245px" }}
          transition={{
            duration: isSnapping ? 0.3 : 1.75,
            repeat: Infinity,
            ease: "easeInOut",
            delay: isSnapping ? 0.1 : 0.5,
          }}
        >
          <path d="M 148 245 L 118 270 L 104 306" />
        </motion.g>
      </g>

      {/* Crab Carapace (Shell Body Peeking In From Right Screen Edge) */}
      <g>
        {/* Main Shell Silhouette */}
        <path
          d="M 140 120 C 100 130, 85 185, 110 235 C 135 285, 210 290, 270 280 L 280 120 C 240 110, 180 110, 140 120 Z"
          fill="#FFFFFF"
          stroke="#000000"
          strokeWidth="4"
          strokeLinejoin="round"
        />

        {/* Shell Curved Architectural Seams (Subtle Depth Contour) */}
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

        {/* Minimalist Monochrome Bowtie */}
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
        {/* Dimples */}
        <circle cx="150" cy="193" r="1.5" fill="#000000" />
        <circle cx="198" cy="193" r="1.5" fill="#000000" />
      </g>

      {/* Dual Eye Stalks and Large Spherical Eyeballs */}
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
            {/* Left Closed Eyelid Curved Arc */}
            <path d="M 86 74 Q 104 82 122 74" stroke="#000000" strokeWidth="3.6" strokeLinecap="round" />
            {/* Right Closed Eyelid Curved Arc */}
            <path d="M 166 60 Q 184 68 202 60" stroke="#000000" strokeWidth="3.6" strokeLinecap="round" />
          </>
        ) : (
          <>
            {/* Left Eye Pupil with Specular Highlights */}
            <g transform={`translate(${eyeOffset.x * 1.6}, ${eyeOffset.y * 1.6})`}>
              <circle cx="104" cy="74" r="10.5" fill="#000000" />
              <circle cx="101" cy="70.5" r="3.2" fill="#FFFFFF" />
              <circle cx="106.5" cy="76" r="1.5" fill="#FFFFFF" />
            </g>

            {/* Right Eye Pupil with Specular Highlights */}
            <g transform={`translate(${eyeOffset.x * 1.6}, ${eyeOffset.y * 1.6})`}>
              <circle cx="184" cy="60" r="10.5" fill="#000000" />
              <circle cx="181" cy="56.5" r="3.2" fill="#FFFFFF" />
              <circle cx="186.5" cy="62" r="1.5" fill="#FFFFFF" />
            </g>
          </>
        )}
      </g>

      {/* Left Arm & Claw (Authentic 2D Scissor Pincer) */}
      <g>
        {/* Arm Segment */}
        <path
          d="M 115 160 C 88 150, 68 140, 56 125"
          stroke="#000000"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />

        {/* Claw Wrist Socket */}
        <ellipse
          cx="56"
          cy="125"
          rx="9"
          ry="8"
          fill="#FFFFFF"
          stroke="#000000"
          strokeWidth="3.5"
        />

        {/* Upper Curved Pincer Jaw (Clamps Down on Pinch) */}
        <motion.g
          animate={{ rotate: leftClawOpen ? 18 : 0 }}
          style={{ originX: "54px", originY: "120px" }}
          transition={{ duration: 0.12, ease: "easeInOut" }}
        >
          <path
            d="M 54 120 C 42 92, 30 86, 18 106 C 32 100, 42 108, 50 122 Z"
            fill="#FFFFFF"
            stroke="#000000"
            strokeWidth="3.4"
            strokeLinejoin="round"
          />
        </motion.g>

        {/* Lower Curved Pincer Jaw (Clamps Up on Pinch) */}
        <motion.g
          animate={{ rotate: leftClawOpen ? -18 : 0 }}
          style={{ originX: "56px", originY: "128px" }}
          transition={{ duration: 0.12, ease: "easeInOut" }}
        >
          <path
            d="M 56 128 C 44 150, 32 150, 18 116 C 32 120, 42 122, 52 126 Z"
            fill="#FFFFFF"
            stroke="#000000"
            strokeWidth="3.4"
            strokeLinejoin="round"
          />
        </motion.g>
      </g>

      {/* Right Arm & Raised Claw (Authentic 2D Scissor Pincer) */}
      <g>
        {/* Raised Arm Armature */}
        <path
          d="M 210 130 C 228 105, 238 80, 236 60"
          stroke="#000000"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />

        {/* Claw Wrist Socket */}
        <ellipse
          cx="236"
          cy="60"
          rx="9"
          ry="8"
          fill="#FFFFFF"
          stroke="#000000"
          strokeWidth="3.5"
        />

        {/* Upper Curved Pincer Jaw (Clamps Down on Pinch) */}
        <motion.g
          animate={{ rotate: rightClawOpen ? 18 : 0 }}
          style={{ originX: "232px", originY: "54px" }}
          transition={{ duration: 0.12, ease: "easeInOut" }}
        >
          <path
            d="M 232 54 C 224 24, 210 16, 194 32 C 208 24, 222 34, 228 56 Z"
            fill="#FFFFFF"
            stroke="#000000"
            strokeWidth="3.4"
            strokeLinejoin="round"
          />
        </motion.g>

        {/* Lower Curved Pincer Jaw (Clamps Up on Pinch) */}
        <motion.g
          animate={{ rotate: rightClawOpen ? -18 : 0 }}
          style={{ originX: "236px", originY: "64px" }}
          transition={{ duration: 0.12, ease: "easeInOut" }}
        >
          <path
            d="M 236 64 C 226 86, 212 86, 194 44 C 208 50, 222 54, 230 62 Z"
            fill="#FFFFFF"
            stroke="#000000"
            strokeWidth="3.4"
            strokeLinejoin="round"
          />
        </motion.g>
      </g>
    </svg>
  );
}
