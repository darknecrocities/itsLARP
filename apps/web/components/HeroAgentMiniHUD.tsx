"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LIVE_OPPORTUNITIES = [
  {
    role: "Lead AI Engineer",
    company: "Anthropic Labs",
    platform: "LinkedIn",
    match: "96%",
    timeSaved: "45 mins",
    status: "STAGED IN NOTION",
    step: "Application Staged",
  },
  {
    role: "Senior Full Stack Lead",
    company: "FinTech Systems",
    platform: "JobStreet",
    match: "94%",
    timeSaved: "35 mins",
    status: "READY FOR 1-TAP REVIEW",
    step: "APA Resume Formatted",
  },
  {
    role: "Staff Backend Engineer",
    company: "CloudScale AI",
    platform: "Indeed",
    match: "92%",
    timeSaved: "50 mins",
    status: "STAGED IN NOTION",
    step: "Form Questions Filled",
  },
];

export function HeroAgentMiniHUD() {
  const [index, setIndex] = useState(0);
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % LIVE_OPPORTUNITIES.length);
      setActiveStep((prev) => (prev % 3) + 1);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  const opp = LIVE_OPPORTUNITIES[index];

  return (
    <div className="relative w-full max-w-lg mx-auto lg:mx-0">
      {/* Floating Levitation Pill */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-3.5 -right-2 z-20 hidden sm:inline-flex items-center gap-2 px-3 py-1 bg-black text-white text-[11px] font-mono rounded-full shadow-lg"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        <span>1,000 Agents on Autopilot</span>
      </motion.div>

      {/* Main HUD Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white border-2 border-black rounded-lg p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-mono text-xs text-black"
      >
        {/* HUD Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
            <span className="font-bold tracking-tight">AGENT WORKFORCE SIMULATION</span>
          </div>
          <span className="px-2 py-0.5 bg-neutral-100 border border-neutral-300 rounded text-[10px]">
            ACTIVE
          </span>
        </div>

        {/* Live Opportunity Details */}
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-3"
          >
            <div>
              <div className="text-[10px] text-neutral-500 uppercase tracking-wider">
                CURRENT OPPORTUNITY PROCESSED
              </div>
              <div className="flex items-baseline justify-between gap-2 mt-0.5 font-sans">
                <span className="font-bold text-base text-black truncate">{opp.role}</span>
                <span className="text-xs text-neutral-600 shrink-0 font-mono">@{opp.company}</span>
              </div>
            </div>

            {/* Platform & Status Badge Strip */}
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              <span className="px-2 py-0.5 bg-neutral-100 rounded border border-neutral-300">
                {opp.platform}
              </span>
              <span className="px-2 py-0.5 bg-black text-white font-bold rounded">
                {opp.match} Match
              </span>
              <span className="px-2 py-0.5 bg-neutral-50 text-neutral-600 rounded border border-neutral-200">
                Saved {opp.timeSaved}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* 3-Step Agent Progression Bar */}
        <div className="mt-5 pt-4 border-t border-neutral-200">
          <div className="text-[10px] text-neutral-500 uppercase mb-2">
            AUTOMATION STAGES
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { num: "01", label: "Job Discovered" },
              { num: "02", label: "APA Resume Tailored" },
              { num: "03", label: "Staged in Notion" },
            ].map((step, idx) => {
              const isCurrent = activeStep >= idx + 1;
              return (
                <div
                  key={idx}
                  className={`p-2 rounded border transition-colors ${
                    isCurrent
                      ? "bg-neutral-100 border-black font-semibold text-black"
                      : "bg-white border-neutral-200 text-neutral-400"
                  }`}
                >
                  <div className="text-[9px] text-neutral-500">{step.num}</div>
                  <div className="text-[10px] mt-0.5 leading-tight">{step.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
