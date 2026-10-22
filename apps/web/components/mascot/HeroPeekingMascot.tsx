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

export interface MascotReaction {
  id: number;
  text: string;
  claw?: "left" | "right" | "both";
}

interface HeroPeekingMascotProps {
  className?: string;
  isMobile?: boolean;
  reaction?: MascotReaction | null;
  counterSlot?: React.ReactNode;
  onCrabClick?: () => void;
}

export function HeroPeekingMascot({
  className = "",
  isMobile = false,
  reaction = null,
  counterSlot,
  onCrabClick,
}: HeroPeekingMascotProps) {
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
  const prevReactionIdRef = useRef<number | null>(null);

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

  // Snip animation (authentic scissor pinching)
  const triggerDoubleSnip = useCallback(() => {
    if (isSnapping) return;
    setIsSnapping(true);

    setRightClawOpen(true);
    setTimeout(() => {
      setRightClawOpen(false);
      setLeftClawOpen(true);
      setTimeout(() => {
        setLeftClawOpen(false);
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
  }, [isSnapping]);

  // Trigger claw actions when an external reaction is dispatched
  useEffect(() => {
    if (!reaction || reaction.id === prevReactionIdRef.current) return;
    prevReactionIdRef.current = reaction.id;

    let cleanupTimer: NodeJS.Timeout | null = null;
    const triggerTimer = setTimeout(() => {
      if (reaction.claw === "left") {
        setLeftClawOpen(true);
        cleanupTimer = setTimeout(() => setLeftClawOpen(false), 900);
      } else if (reaction.claw === "right") {
        setRightClawOpen(true);
        cleanupTimer = setTimeout(() => setRightClawOpen(false), 900);
      } else {
        triggerDoubleSnip();
      }
    }, 20);

    return () => {
      clearTimeout(triggerTimer);
      if (cleanupTimer) clearTimeout(cleanupTimer);
    };
  }, [reaction, triggerDoubleSnip]);

  // Periodic autonomous gentle claw snip loop
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const scheduleSnip = () => {
      const delay = Math.random() * 2500 + 4200;
      timeout = setTimeout(() => {
        if (!isSnapping) {
          triggerDoubleSnip();
        }
        scheduleSnip();
      }, delay);
    };
    scheduleSnip();
    return () => clearTimeout(timeout);
  }, [isSnapping, triggerDoubleSnip]);

  // Global mousemove handler for eye tracking and subtle parallax tilt
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const eyeCenterX = rect.left + rect.width * 0.55;
      const eyeCenterY = rect.top + rect.height * 0.28;

      const dx = e.clientX - eyeCenterX;
      const dy = e.clientY - eyeCenterY;
      const angle = Math.atan2(dy, dx);
      const distance = Math.hypot(dx, dy);

      const maxOffset = 5.2;
      const offsetDistance = Math.min(distance / 50, maxOffset);

      rawPupilX.set(Math.cos(angle) * offsetDistance);
      rawPupilY.set(Math.sin(angle) * offsetDistance);

      const tilt = Math.max(-3.5, Math.min(3.5, (e.clientX - window.innerWidth / 2) / 160));
      rawTiltZ.set(tilt);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [rawPupilX, rawPupilY, rawTiltZ]);

  const handleClick = () => {
    triggerDoubleSnip();
    setSpeechVisible(true);
    setQuoteIndex((prev) => (prev + 1) % HERO_QUOTES.length);
    onCrabClick?.();
  };

  const displayText = reaction?.text || HERO_QUOTES[quoteIndex];

  if (isMobile) {
    return (
      <div
        ref={containerRef}
        className={`relative w-full min-h-[350px] overflow-visible select-none ${className}`}
      >
        {/* Mobile Counter Slot rendered cleanly above crab stage */}
        {counterSlot && <div className="mb-4 px-2">{counterSlot}</div>}

        <div className="relative w-full h-[280px]">
          {/* Cartoon Cloud Thought Bubble positioned on open left side */}
          <AnimatePresence>
            {speechVisible && (
              <CloudDialogueBubble
                text={displayText}
                onClose={() => setSpeechVisible(false)}
                className="absolute top-2 left-2 sm:left-6 w-[230px] sm:w-[260px] z-30"
              />
            )}
          </AnimatePresence>

          {/* Main Peeking Crab Body Wrapper Flush to Right Screen Edge */}
          <motion.div
            style={{ rotateZ: springTiltZ }}
            className="cursor-pointer group absolute right-0 bottom-0 origin-bottom-right z-20"
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
              className="w-[210px] sm:w-[250px] h-auto drop-shadow-md transition-transform duration-200 group-hover:scale-[1.02]"
            />
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative select-none flex items-center justify-end ${className}`}
    >
      {/* Cartoon Cloud Thought Bubble positioned cleanly to the upper-left of Scuttle */}
      <AnimatePresence>
        {speechVisible && (
          <CloudDialogueBubble
            text={displayText}
            onClose={() => setSpeechVisible(false)}
            isMobile={false}
            className="absolute -top-4 lg:top-0 xl:top-4 right-[280px] lg:right-[300px] xl:right-[340px] w-[290px] xl:w-[320px] z-30"
          />
        )}
      </AnimatePresence>

      {/* Counter Slot positioned directly under speech cloud on desktop */}
      {counterSlot && (
        <div className="absolute top-[168px] lg:top-[178px] xl:top-[188px] right-[270px] lg:right-[300px] xl:right-[340px] z-30 w-[300px] lg:w-[340px] xl:w-[380px]">
          {counterSlot}
        </div>
      )}

      {/* Main Peeking Crab Body Wrapper with Parallax Spring */}
      <motion.div
        style={{ rotateZ: springTiltZ }}
        className="cursor-pointer group relative origin-bottom-right z-20"
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
          className="w-[420px] lg:w-[460px] xl:w-[500px] h-auto drop-shadow-md transition-transform duration-200 group-hover:scale-[1.02]"
        />
      </motion.div>
    </div>
  );
}
