"use client";

import Link from "next/link";
import React from "react";

interface BrandLogoProps {
  variant?: "mark" | "full" | "minimal";
  size?: "sm" | "md" | "lg" | "xl";
  showBadge?: boolean;
  href?: string;
  className?: string;
}

export function BrandLogo({
  variant = "full",
  size = "md",
  showBadge = true,
  href = "/",
  className = "",
}: BrandLogoProps) {
  const iconSizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
    xl: "w-12 h-12",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
  };

  const content = (
    <div className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
      {/* Precision Geometric Mark */}
      <div className={`relative shrink-0 rounded-lg overflow-hidden bg-black flex items-center justify-center shadow-xs border border-zinc-800 transition-transform duration-200 group-hover:scale-105 ${iconSizes[size]}`}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1"
        >
          {/* Subtle grid pattern */}
          <g opacity="0.12" stroke="#FFFFFF" strokeWidth="0.8">
            <line x1="8" y1="24" x2="40" y2="24" />
            <line x1="24" y1="8" x2="24" y2="40" />
          </g>
          {/* Geometric "L" */}
          <path
            d="M14 13 C14 11.9 14.9 11 16 11 H21 C22.1 11 23 11.9 23 13 V27 H33 C34.1 27 35 27.9 35 29 V34 C35 35.1 34.1 36 33 36 H16 C14.9 36 14 35.1 14 34 V13 Z"
            fill="#FFFFFF"
          />
          {/* Upward Ascending Vector Arrow */}
          <path
            d="M24 23 L34 13 M34 13 H27 M34 13 V20"
            stroke="#FFFFFF"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Emerald Radar Status Beacon */}
          <circle cx="36" cy="11" r="2.5" fill="#10B981" />
          <circle cx="36" cy="11" r="4.5" stroke="#10B981" strokeWidth="0.8" opacity="0.4" />
        </svg>
      </div>

      {variant !== "mark" && (
        <div className="flex items-center gap-2">
          <span className={`font-display font-bold tracking-tight text-ink group-hover:opacity-90 transition-opacity ${textSizes[size]}`}>
            its<span className="font-extrabold">LARP</span>
          </span>
          {showBadge && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-black text-white rounded font-semibold tracking-wide">
              OS
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex focus:outline-none focus-visible:ring-2 focus-visible:ring-black rounded-lg">
        {content}
      </Link>
    );
  }

  return content;
}
