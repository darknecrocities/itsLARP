"use client";
import React, { useEffect } from "react";
import { motion, useMotionValue, useSpring, useMotionTemplate } from "framer-motion";

export function HeroBackground() {
  const mouseX = useMotionValue(400);
  const mouseY = useMotionValue(200);

  const springConfig = { damping: 30, stiffness: 140 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const hero = document.getElementById("hero-section");
      if (hero) {
        const rect = hero.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
      } else {
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  const spotlight = useMotionTemplate`radial-gradient(600px circle at ${smoothX}px ${smoothY}px, rgba(0, 0, 0, 0.045), transparent 80%)`;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
      {/* Architectural Vertical Column Grid Lines (Mascota Studio Style) */}
      <div className="absolute inset-0 max-w-7xl mx-auto px-6 grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 pointer-events-none">
        {Array.from({ length: 10 }).map((_, idx) => (
          <div
            key={idx}
            className={`h-full border-r border-neutral-200/40 ${idx === 0 ? "border-l" : ""} ${idx >= 6 ? "hidden sm:block" : ""} ${idx >= 8 ? "hidden md:block" : ""}`}
          />
        ))}
      </div>

      {/* SVG Geometric Dot Matrix */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.035]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="hero-dot-grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill="#000000" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-dot-grid)" />
      </svg>

      {/* Mouse Follow Spotlight */}
      <motion.div
        className="absolute inset-0"
        style={{ background: spotlight }}
      />

      {/* Floating Ambient Micro-Nodes (Pure Monochrome) */}
      {[
        { x: "12%", y: "25%", d: 18, size: 4 },
        { x: "88%", y: "18%", d: 22, size: 3 },
        { x: "78%", y: "70%", d: 20, size: 4 },
        { x: "18%", y: "75%", d: 24, size: 3 },
      ].map((node, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-black/15"
          style={{
            left: node.x,
            top: node.y,
            width: node.size,
            height: node.size,
          }}
          animate={{
            y: [0, -16, 0],
            x: [0, 10, 0],
            opacity: [0.15, 0.35, 0.15],
          }}
          transition={{
            duration: node.d,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
