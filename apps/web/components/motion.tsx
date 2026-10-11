"use client";
import React, { useRef, useEffect, useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useSpring,
  useInView,
  type Variants,
} from "framer-motion";

/**
 * Top Scroll Progress Bar
 * Renders a crisp 2px black line at the top of the viewport indicating page scroll progress.
 */
export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-[2.5px] bg-black origin-left z-50 pointer-events-none"
    />
  );
}

/**
 * FadeIn Component
 * Triggers a smooth, premium easing animation when scrolled into view.
 */
export function FadeIn({
  children,
  delay = 0,
  duration = 0.6,
  direction = "up",
  distance = 28,
  className = "",
  once = true,
}: {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
  className?: string;
  once?: boolean;
}) {
  const getOffset = () => {
    switch (direction) {
      case "up":
        return { y: distance, x: 0 };
      case "down":
        return { y: -distance, x: 0 };
      case "left":
        return { x: distance, y: 0 };
      case "right":
        return { x: -distance, y: 0 };
      case "none":
        return { x: 0, y: 0 };
    }
  };

  const offset = getOffset();

  return (
    <motion.div
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, margin: "-40px" }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1], // Apple / Linear cubic-bezier ease
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * StaggerContainer & StaggerItem
 * Creates cascading staggered entrance animations for grids, lists, and metrics.
 */
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: (custom: { delay?: number; stagger?: number } = {}) => ({
    opacity: 1,
    transition: {
      delayChildren: custom.delay || 0.1,
      staggerChildren: custom.stagger || 0.08,
    },
  }),
};

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export function StaggerContainer({
  children,
  className = "",
  delay = 0.1,
  stagger = 0.08,
  once = true,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  stagger?: number;
  once?: boolean;
}) {
  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-50px" }}
      custom={{ delay, stagger }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={staggerItemVariants} className={className}>
      {children}
    </motion.div>
  );
}

/**
 * CardMotion
 * Wrapper for interactive cards with subtle hover lift and tap responses.
 */
export function CardMotion({
  children,
  className = "",
  hoverLift = -4,
}: {
  children: React.ReactNode;
  className?: string;
  hoverLift?: number;
}) {
  return (
    <motion.div
      whileHover={{
        y: hoverLift,
        transition: { duration: 0.2, ease: "easeOut" },
      }}
      whileTap={{ scale: 0.99 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * AnimatedCounter
 * Counts up smoothly from 0 to target number when scrolled into view.
 */
export function AnimatedCounter({
  to,
  suffix = "",
  duration = 1.2,
}: {
  to: number;
  suffix?: string;
  duration?: number;
}) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-30px" });

  useEffect(() => {
    if (!inView) return;
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      // Ease out expo
      const current = Math.floor(to * (1 - Math.pow(2, -10 * progress)));
      setVal(progress >= 1 ? to : current);
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }, [inView, to, duration]);

  return (
    <span ref={ref}>
      {val.toLocaleString()}
      {suffix}
    </span>
  );
}

/**
 * TextReveal
 * Slides text lines up smoothly as if revealed from an invisible mask.
 */
export function TextReveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <div className="overflow-hidden">
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{
          duration: 0.75,
          delay,
          ease: [0.16, 1, 0.3, 1],
        }}
        className={className}
      >
        {children}
      </motion.div>
    </div>
  );
}

/**
 * AnimatedLoopText
 * Loops through an array of words or phrases with smooth vertical slide and blur-fade transitions.
 * Perfect for dynamic hero titles and rotating feature highlights.
 */
export function AnimatedLoopText({
  words,
  interval = 2800,
  className = "",
}: {
  words: string[];
  interval?: number;
  className?: string;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!words || words.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, interval);
    return () => clearInterval(timer);
  }, [words, interval]);

  return (
    <span className={`inline-grid overflow-hidden align-baseline ${className}`}>
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ y: 32, opacity: 0, filter: "blur(4px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={{ y: -32, opacity: 0, filter: "blur(4px)" }}
          transition={{
            duration: 0.45,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="inline-block whitespace-nowrap"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/**
 * InfiniteLoopMarquee
 * Continuously scrolls text across the screen in an infinite horizontal loop without pause.
 * Styled in pure monochrome black/white.
 */
export function InfiniteLoopMarquee({
  items,
  speed = 30,
  className = "",
}: {
  items: string[];
  speed?: number;
  className?: string;
}) {
  return (
    <div
      className={`relative w-full overflow-hidden whitespace-nowrap flex select-none border-y border-line py-3.5 bg-bg ${className}`}
    >
      <motion.div
        className="flex shrink-0 items-center gap-8 pr-8"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: speed,
        }}
      >
        {items.map((item, idx) => (
          <span
            key={`a-${idx}`}
            className="inline-flex items-center gap-8 font-mono text-xs uppercase tracking-wider text-dmuted"
          >
            <span className="font-bold text-ink">{item}</span>
            <span className="text-neutral-400">✦</span>
          </span>
        ))}
        {items.map((item, idx) => (
          <span
            key={`b-${idx}`}
            className="inline-flex items-center gap-8 font-mono text-xs uppercase tracking-wider text-dmuted"
          >
            <span className="font-bold text-ink">{item}</span>
            <span className="text-neutral-400">✦</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/**
 * RotatingBadgeLoop
 * Cycles through quick status updates or feature tags with an animated pulse dot.
 */
export function RotatingBadgeLoop({
  items,
  interval = 3200,
  className = "",
}: {
  items: string[];
  interval?: number;
  className?: string;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!items || items.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, interval);
    return () => clearInterval(timer);
  }, [items, interval]);

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 bg-bg2 border border-line rounded text-xs font-mono text-dmuted ${className}`}
    >
      <span className="w-2 h-2 rounded-full bg-black inline-block animate-pulse shrink-0" />
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="font-medium text-ink"
        >
          {items[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

