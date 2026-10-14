"use client";

import React from "react";
import { motion } from "framer-motion";

interface BrandItem {
  name: string;
  category: string;
  renderLogo: () => React.ReactNode;
}

const BRANDS: BrandItem[] = [
  {
    name: "Carousell",
    category: "Jobs & Marketplace",
    renderLogo: () => (
      <div className="flex items-center gap-2 select-none">
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 shrink-0">
          <rect width="32" height="32" rx="8" fill="#FF2636" />
          <circle cx="9" cy="9" r="2.2" fill="#FFFFFF" />
          <path
            d="M22 13 C17 12 12.5 16 12.5 21 C12.5 25.5 16.5 28.5 22 27"
            stroke="#FFFFFF"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
        </svg>
        <span className="font-extrabold text-lg tracking-tight text-neutral-900 dark:text-white">
          carousell
        </span>
      </div>
    ),
  },
  {
    name: "LinkedIn",
    category: "Professional Network",
    renderLogo: () => (
      <div className="flex items-center gap-1 select-none">
        <span className="font-bold text-lg tracking-tight text-neutral-800 dark:text-neutral-200">
          Linked
        </span>
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0">
          <rect width="24" height="24" rx="4" fill="#0A66C2" />
          <path
            d="M6 9.5 C6 8.7 6.7 8 7.5 8 C8.3 8 9 8.7 9 9.5 C9 10.3 8.3 11 7.5 11 C6.7 11 6 10.3 6 9.5 Z M6.2 12.5 H8.8 V19.5 H6.2 Z M10.5 12.5 H13 V13.6 C13.4 12.9 14.3 12.3 15.6 12.3 C17.7 12.3 18.2 13.6 18.2 15.5 V19.5 H15.8 V15.9 C15.8 14.8 15.5 14.2 14.6 14.2 C13.7 14.2 13 14.9 13 16.1 V19.5 H10.5 V12.5 Z"
            fill="#FFFFFF"
          />
        </svg>
      </div>
    ),
  },
  {
    name: "JobStreet",
    category: "SE Asia Career Portal",
    renderLogo: () => (
      <div className="flex items-center gap-2 select-none">
        <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 shrink-0">
          <circle cx="14" cy="14" r="14" fill="#1C3F94" />
          <path d="M14 6 L16 11.5 L21.5 12 L17.5 15.5 L18.5 21 L14 18 L9.5 21 L10.5 15.5 L6.5 12 L12 11.5 Z" fill="#FFC80A" />
        </svg>
        <span className="font-bold text-lg tracking-tight text-neutral-800 dark:text-neutral-200">
          JobStreet
        </span>
      </div>
    ),
  },
  {
    name: "Indeed",
    category: "Global Job Search",
    renderLogo: () => (
      <div className="flex items-center gap-1.5 select-none">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0">
          <path
            d="M6 5 C3.8 5 2 6.8 2 9 C2 11.2 3.8 13 6 13 C8.2 13 10 11.2 10 9 C10 6.8 8.2 5 6 5 Z M4.5 15 H7.5 V23 H4.5 Z"
            fill="#003A9B"
          />
        </svg>
        <span className="font-extrabold text-xl tracking-tight text-[#003A9B]">
          indeed
        </span>
      </div>
    ),
  },
  {
    name: "Notion",
    category: "Workspace & Tracker",
    renderLogo: () => (
      <div className="flex items-center gap-2 select-none">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0">
          <rect width="24" height="24" rx="4" fill="#000000" />
          <path
            d="M6 19 V7 L12 15 L18 7 V19"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="font-bold text-lg tracking-tight text-neutral-800 dark:text-neutral-200">
          Notion
        </span>
      </div>
    ),
  },
  {
    name: "Greenhouse",
    category: "Hiring Platform",
    renderLogo: () => (
      <div className="flex items-center gap-1.5 select-none">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0">
          <circle cx="12" cy="12" r="11" fill="#008552" />
          <path d="M9 14 C9 10 12 7 15 7 C15 11 13 14 9 14 Z" fill="#FFFFFF" />
        </svg>
        <span className="font-bold text-base tracking-tight text-neutral-800 dark:text-neutral-200">
          greenhouse
        </span>
      </div>
    ),
  },
  {
    name: "Lever",
    category: "ATS Integration",
    renderLogo: () => (
      <div className="flex items-center gap-1.5 select-none">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0">
          <rect width="24" height="24" rx="3" fill="#1B2432" />
          <path d="M7 17 L12 7 L17 17" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="font-bold text-base tracking-widest text-neutral-800 dark:text-neutral-200">
          LEVER
        </span>
      </div>
    ),
  },
  {
    name: "Workday",
    category: "Enterprise Applications",
    renderLogo: () => (
      <div className="flex items-center gap-1.5 select-none">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0">
          <path d="M3 16 C7 9 17 9 21 16" stroke="#E26D00" strokeWidth="2.8" strokeLinecap="round" />
          <circle cx="12" cy="7" r="2.5" fill="#0051C3" />
        </svg>
        <span className="font-bold text-base tracking-tight text-neutral-800 dark:text-neutral-200">
          workday
        </span>
      </div>
    ),
  },
  {
    name: "GitHub",
    category: "Developer Portfolios",
    renderLogo: () => (
      <div className="flex items-center gap-1.5 select-none">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0">
          <circle cx="12" cy="12" r="11" fill="#24292F" />
          <path
            d="M12 6 C8.7 6 6 8.7 6 12 C6 14.7 7.7 16.9 10.1 17.7 C10.4 17.8 10.5 17.6 10.5 17.4 V16.2 C8.8 16.5 8.5 15.4 8.5 15.4 C8.2 14.7 7.8 14.5 7.8 14.5 C7.3 14.1 7.9 14.1 7.9 14.1 C8.6 14.2 8.9 14.9 8.9 14.9 C9.4 15.8 10.4 15.5 10.7 15.3 C10.8 14.9 10.9 14.7 11.1 14.5 C9.8 14.3 8.4 13.8 8.4 11.5 C8.4 10.8 8.7 10.3 9.1 9.9 C9 9.8 8.8 9.2 9.2 8.4 C9.2 8.4 9.7 8.2 10.9 9.1 C11.4 9 12 8.9 12.5 8.9 C13 8.9 13.6 9 14.1 9.1 C15.3 8.2 15.8 8.4 15.8 8.4 C16.2 9.2 16 9.8 15.9 9.9 C16.3 10.3 16.6 10.8 16.6 11.5 C16.6 13.8 15.2 14.3 13.9 14.5 C14.2 14.7 14.4 15.1 14.4 15.8 V17.4 C14.4 17.6 14.5 17.8 14.9 17.7 C17.3 16.9 19 14.7 19 12 C19 8.7 16.3 6 13 6 Z"
            fill="#FFFFFF"
          />
        </svg>
        <span className="font-bold text-base tracking-tight text-neutral-800 dark:text-neutral-200">
          GitHub
        </span>
      </div>
    ),
  },
];

export function BrandLogoCarousel() {
  return (
    <section className="py-10 border-b border-line bg-bg relative overflow-hidden select-none">
      <div className="max-w-6xl mx-auto px-6 mb-5 text-center">
        <p className="text-xs font-semibold text-muted tracking-wide uppercase">
          Works seamlessly with the platforms where you want to work
        </p>
      </div>

      {/* Infinite Horizontal Logo Marquee */}
      <div className="relative w-full overflow-hidden flex [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
        <motion.div
          className="flex shrink-0 items-center gap-12 sm:gap-16 pr-12 sm:pr-16"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration: 35,
          }}
        >
          {/* Triple array for ultra-seamless loop across any ultra-wide screen */}
          {[...BRANDS, ...BRANDS, ...BRANDS].map((brand, idx) => (
            <div
              key={`${brand.name}-${idx}`}
              className="flex items-center opacity-85 hover:opacity-100 transition-all duration-150 transform hover:scale-105 cursor-default"
              title={`${brand.name} · ${brand.category}`}
            >
              {brand.renderLogo()}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
