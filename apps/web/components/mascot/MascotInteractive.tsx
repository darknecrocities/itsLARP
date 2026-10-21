"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MascotSvg } from "./MascotSvg";
import { type MascotInteractiveProps, type MascotMood } from "./types";

const QUOTES = [
  "Hi, I'm Scuttle! I apply to jobs so you don't have to.",
  "Let me handle those 50-page Workday forms for you.",
  "0% AI Hallucination. 100% verified credentials.",
  "Ready to snip through today's job listings!",
  "Workforce standing by: 1,000 bots in formation.",
  "Snip, snip! Your tailored resume is ready.",
  "Deduplication safeguard active: no duplicate applications ever.",
];

export function MascotInteractive({
  size = "md",
  mood: initialMood = "idle",
  interactive = true,
  showDialogue = false,
  dialogueText,
  className = "",
  onClick,
}: MascotInteractiveProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mood, setMood] = useState<MascotMood>(initialMood);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const [leftClawOpen, setLeftClawOpen] = useState(false);
  const [rightClawOpen, setRightClawOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [bubbleVisible, setBubbleVisible] = useState(showDialogue);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync mood prop changes
  useEffect(() => {
    setMood(initialMood);
  }, [initialMood]);

  // Periodic natural blink loop
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const scheduleBlink = () => {
      const delay = Math.random() * 3200 + 2200; // 2.2s - 5.4s
      timeout = setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => {
          setIsBlinking(false);
          scheduleBlink();
        }, 140);
      }, delay);
    };

    scheduleBlink();
    return () => clearTimeout(timeout);
  }, []);

  // Automatic sleep detection when user is idle for 45 seconds
  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (initialMood === "idle" && mood === "sleeping") {
      setMood("idle");
    }

    idleTimerRef.current = setTimeout(() => {
      if (initialMood === "idle") {
        setMood("sleeping");
      }
    }, 45000);
  }, [initialMood, mood]);

  // Global mousemove tracking for eye gaze
  useEffect(() => {
    if (!interactive) return;

    const handleMouseMove = (e: MouseEvent) => {
      resetIdleTimer();
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const angle = Math.atan2(dy, dx);
      const distance = Math.hypot(dx, dy);

      // Clamp pupil travel within a 4.2px radius
      const maxOffset = 4.2;
      const offsetDistance = Math.min(distance / 45, maxOffset);

      setEyeOffset({
        x: Math.cos(angle) * offsetDistance,
        y: Math.sin(angle) * offsetDistance,
      });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [interactive, resetIdleTimer]);

  // Trigger double-snip action on click or hover
  const triggerSnipAction = () => {
    setLeftClawOpen(true);
    setTimeout(() => {
      setLeftClawOpen(false);
      setRightClawOpen(true);
      setTimeout(() => {
        setRightClawOpen(false);
        // Double snip together
        setTimeout(() => {
          setLeftClawOpen(true);
          setRightClawOpen(true);
          setTimeout(() => {
            setLeftClawOpen(false);
            setRightClawOpen(false);
          }, 140);
        }, 100);
      }, 120);
    }, 120);
  };

  const handleClick = () => {
    triggerSnipAction();
    setBubbleVisible(true);
    setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
    if (onClick) onClick();
  };

  const activeQuote = dialogueText || QUOTES[quoteIndex];

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex flex-col items-center justify-center group ${className}`}
      onMouseEnter={() => {
        setIsHovered(true);
        if (mood !== "working" && mood !== "celebrating") {
          setMood("curious");
        }
        triggerSnipAction();
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        if (mood === "curious") setMood(initialMood);
      }}
      onClick={handleClick}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label="Interactive Mascot Scuttle"
      style={{ cursor: interactive ? "pointer" : "default" }}
    >
      {/* Speech / Dialogue Bubble Popover */}
      <AnimatePresence>
        {(bubbleVisible || showDialogue) && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full mb-2 z-30 px-3 py-1.5 bg-black text-white rounded-lg shadow-lg text-xs font-mono max-w-[240px] text-center pointer-events-none select-none border border-neutral-800"
          >
            <div>{activeQuote}</div>
            {/* Downward triangle arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-black" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mascot MascotSvg with interactive bounce */}
      <motion.div
        whileHover={interactive ? { scale: 1.05 } : {}}
        whileTap={interactive ? { scale: 0.95, y: 2 } : {}}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <MascotSvg
          size={size}
          mood={mood}
          eyeOffset={eyeOffset}
          isBlinking={isBlinking}
          leftClawOpen={leftClawOpen}
          rightClawOpen={rightClawOpen}
        />
      </motion.div>
    </div>
  );
}
