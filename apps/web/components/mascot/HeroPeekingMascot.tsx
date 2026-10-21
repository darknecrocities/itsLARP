"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useSpring, useMotionValue } from "framer-motion";
import { CloudDialogueBubble } from "./CloudDialogueBubble";
import { PeekingCrabSvg } from "./PeekingCrabSvg";

const HERO_QUOTES = [
  "Snip, snip! Your personal AI workforce is ready.",
  "0% hallucinations. 100% verified APA 7th resumes.",
  "I'll handle those tedious 50-page Workday applications!",
  "1,000 bots actively scouting your target companies.",
  "Tailoring every resume to match the job description.",
  "1-click sync to your Notion job tracker.",
];

interface HeroPeekingMascotProps {
  className?: string;
}

export function HeroPeekingMascot({ className = "" }: HeroPeekingMascotProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isBlinking, setIsBlinking] = useState(false);
  const [isSnapping, setIsSnapping] = useState(false);
  const [leftClawOpen, setLeftClawOpen] = useState(false);
  const [rightClawOpen, setRightClawOpen] = useState(false);
  const [speechVisible, setSpeechVisible] = useState(true);
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Smooth springs for eye pupil tracking
  const rawPupilX = useMotionValue(0);
  const rawPupilY = useMotionValue(0);
  const springPupilX = useSpring(rawPupilX, { damping: 26, stiffness: 220 });
  const springPupilY = useSpring(rawPupilY, { damping: 26, stiffness: 220 });

  // Spring for subtle body parallax tilt
  const rawTiltZ = useMotionValue(0);
  const springTiltZ = useSpring(rawTiltZ, { damping: 30, stiffness: 120 });

  const [pupilCoords, setPupilCoords] = useState({ x: 0, y: 0 });

  // Update state whenever spring changes
  useEffect(() => {
    const unsubX = springPupilX.on("change", (val) => {
      setPupilCoords((prev) => ({ ...prev, x: val }));
    });
    const unsubY = springPupilY.on("change", (val) => {
      setPupilCoords((prev) => ({ ...prev, y: val }));
    });
    return () => {
      unsubX();
      unsubY();
    };
  }, [springPupilX, springPupilY]);

  // Periodic natural blink loop
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const scheduleBlink = () => {
      const delay = Math.random() * 3200 + 2600;
      timeout = setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => {
          setIsBlinking(false);
          scheduleBlink();
        }, 150);
      }, delay);
    };
    scheduleBlink();
    return () => clearTimeout(timeout);
  }, []);

  // Global mousemove handler for eye tracking and parallax tilt
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const eyeCenterX = rect.left + rect.width * 0.45;
      const eyeCenterY = rect.top + rect.height * 0.28;

      const dx = e.clientX - eyeCenterX;
      const dy = e.clientY - eyeCenterY;
      const angle = Math.atan2(dy, dx);
      const distance = Math.hypot(dx, dy);

      // Max eye pupil travel offset
      const maxOffset = 5.2;
      const offsetDistance = Math.min(distance / 50, maxOffset);

      rawPupilX.set(Math.cos(angle) * offsetDistance);
      rawPupilY.set(Math.sin(angle) * offsetDistance);

      // Parallax body tilt: tilt slightly toward the cursor
      const tilt = Math.max(-4, Math.min(4, (e.clientX - (window.innerWidth / 2)) / 140));
      rawTiltZ.set(tilt);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [rawPupilX, rawPupilY, rawTiltZ]);

  // Snip animation (pincers only, no body jumping)
  const triggerDoubleSnip = useCallback(() => {
    setIsSnapping(true);
    setRightClawOpen(true);
    setTimeout(() => {
      setRightClawOpen(false);
      setLeftClawOpen(true);
      setTimeout(() => {
        setLeftClawOpen(false);
        // Synchronized double snip
        setTimeout(() => {
          setRightClawOpen(true);
          setLeftClawOpen(true);
          setTimeout(() => {
            setRightClawOpen(false);
            setLeftClawOpen(false);
            setIsSnapping(false);
          }, 140);
        }, 80);
      }, 100);
    }, 110);
  }, []);

  const handleClick = () => {
    triggerDoubleSnip();
    setSpeechVisible(true);
    setQuoteIndex((prev) => (prev + 1) % HERO_QUOTES.length);
  };

  return (
    <div
      ref={containerRef}
      className={`relative select-none flex items-center justify-end ${className}`}
    >
      {/* Cartoon Cloud Dialogue Bubble positioned safely to upper-left of Scuttle */}
      <AnimatePresence>
        {speechVisible && (
          <CloudDialogueBubble
            text={HERO_QUOTES[quoteIndex]}
            onClose={() => setSpeechVisible(false)}
            className="absolute top-2 -left-64 sm:top-4 sm:-left-72 lg:top-4 lg:-left-80 z-30"
          />
        )}
      </AnimatePresence>

      {/* Main Peeking Crab Body Wrapper with Parallax Spring (No Body Jumping) */}
      <motion.div
        style={{ rotateZ: springTiltZ }}
        className="cursor-pointer group relative origin-bottom-right"
        onClick={handleClick}
        onMouseEnter={triggerDoubleSnip}
        title="Scuttle · Click to pinch & speak!"
      >
        <PeekingCrabSvg
          eyeOffset={pupilCoords}
          isBlinking={isBlinking}
          isSnapping={isSnapping}
          leftClawOpen={leftClawOpen}
          rightClawOpen={rightClawOpen}
          className="w-[280px] sm:w-[340px] md:w-[400px] lg:w-[460px] xl:w-[520px] h-auto drop-shadow-md transition-transform duration-200 group-hover:scale-[1.02]"
        />
      </motion.div>
    </div>
  );
}
