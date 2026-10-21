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
 * Features articulated eye pupils, animated eyelids, crawling legs, and authentic scissor-action crab pincers.
 * All moving joints use local-coordinate translation groups (0, 0 pivot) for zero-jumping rotational precision.
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
      <style>{`
        @keyframes legCrawling1 {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(5deg); }
        }
        @keyframes legCrawling2 {
          0%, 100% { transform: rotate(5deg); }
          50% { transform: rotate(-4deg); }
        }
        @keyframes legCrawling3 {
          0%, 100% { transform: rotate(-4deg); }
          50% { transform: rotate(4deg); }
        }
        .crab-leg-1 { animation: legCrawling1 1.7s infinite ease-in-out; }
        .crab-leg-2 { animation: legCrawling2 1.9s infinite ease-in-out 0.25s; }
        .crab-leg-3 { animation: legCrawling3 1.8s infinite ease-in-out 0.5s; }
        .crab-leg-1-fast { animation: legCrawling1 0.28s infinite ease-in-out; }
        .crab-leg-2-fast { animation: legCrawling2 0.32s infinite ease-in-out; }
        .crab-leg-3-fast { animation: legCrawling3 0.3s infinite ease-in-out; }
      `}</style>

      {/* 3 Lower Left Crawling Legs (Articulated at Hip Sockets) */}
      <g stroke="#000000" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* Top Walking Leg */}
        <g transform="translate(120, 185)">
          <g className={isSnapping ? "crab-leg-1-fast" : "crab-leg-1"}>
            <path d="M 0 0 L -38 15 L -68 45" />
          </g>
        </g>

        {/* Middle Walking Leg */}
        <g transform="translate(130, 215)">
          <g className={isSnapping ? "crab-leg-2-fast" : "crab-leg-2"}>
            <path d="M 0 0 L -36 20 L -56 57" />
          </g>
        </g>

        {/* Bottom Walking Leg */}
        <g transform="translate(148, 245)">
          <g className={isSnapping ? "crab-leg-3-fast" : "crab-leg-3"}>
            <path d="M 0 0 L -30 25 L -44 61" />
          </g>
        </g>
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

      {/* Left Arm & Authentic Scissor Crab Pincer */}
      <g>
        {/* Arm Segment reaching to wrist */}
        <path
          d="M 115 160 C 88 152, 70 142, 58 125"
          stroke="#000000"
          strokeWidth="4.2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Left Claw Local Coordinate Group (Origin (0,0) is Wrist Socket) */}
        <g transform="translate(58, 125)">
          {/* Bulbous Palm (Chela Base) */}
          <ellipse
            cx="0"
            cy="0"
            rx="11"
            ry="10"
            fill="#FFFFFF"
            stroke="#000000"
            strokeWidth="3.6"
          />

          {/* Upper Curved Pincer Jaw (Dactyl) — Pivots at (0, 0) */}
          <g
            transform={`rotate(${leftClawOpen ? 22 : 0})`}
            style={{ transition: "transform 110ms cubic-bezier(0.4, 0, 0.2, 1)" }}
          >
            <path
              d="M 0 -4 C -14 -20, -28 -20, -38 -3 C -30 2, -18 -4, 0 1 Z"
              fill="#FFFFFF"
              stroke="#000000"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
          </g>

          {/* Lower Curved Pincer Jaw (Pollex) — Pivots at (0, 0) */}
          <g
            transform={`rotate(${leftClawOpen ? -22 : 0})`}
            style={{ transition: "transform 110ms cubic-bezier(0.4, 0, 0.2, 1)" }}
          >
            <path
              d="M 0 4 C -14 20, -28 20, -38 3 C -30 -2, -18 4, 0 -1 Z"
              fill="#FFFFFF"
              stroke="#000000"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
          </g>
        </g>
      </g>

      {/* Right Raised Arm & Authentic Scissor Crab Pincer */}
      <g>
        {/* Raised Arm Segment reaching to wrist */}
        <path
          d="M 200 125 C 218 102, 224 78, 216 55"
          stroke="#000000"
          strokeWidth="4.2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Right Claw Local Coordinate Group (Origin (0,0) is Wrist Socket) */}
        <g transform="translate(216, 55)">
          {/* Bulbous Palm (Chela Base) */}
          <ellipse
            cx="0"
            cy="0"
            rx="11"
            ry="10"
            fill="#FFFFFF"
            stroke="#000000"
            strokeWidth="3.6"
          />

          {/* Upper Curved Pincer Jaw (Dactyl) — Pivots at (0, 0) */}
          <g
            transform={`rotate(${rightClawOpen ? 22 : 0})`}
            style={{ transition: "transform 110ms cubic-bezier(0.4, 0, 0.2, 1)" }}
          >
            <path
              d="M 0 -4 C -12 -22, -26 -22, -36 -6 C -28 0, -16 -5, 0 1 Z"
              fill="#FFFFFF"
              stroke="#000000"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
          </g>

          {/* Lower Curved Pincer Jaw (Pollex) — Pivots at (0, 0) */}
          <g
            transform={`rotate(${rightClawOpen ? -22 : 0})`}
            style={{ transition: "transform 110ms cubic-bezier(0.4, 0, 0.2, 1)" }}
          >
            <path
              d="M 0 4 C -12 22, -26 22, -36 6 C -28 0, -16 5, 0 -1 Z"
              fill="#FFFFFF"
              stroke="#000000"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
          </g>
        </g>
      </g>
    </svg>
  );
}
