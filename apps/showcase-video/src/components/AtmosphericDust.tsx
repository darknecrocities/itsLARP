import React, { useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";

interface Particle {
  id: number;
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  size: number;
  speed: number;
  opacity: number;
  driftX: number;
}

interface AtmosphericDustProps {
  particleCount?: number;
  color?: string;
  maxOpacity?: number;
}

export const AtmosphericDust: React.FC<AtmosphericDustProps> = ({
  particleCount = 36,
  color = "rgba(255, 255, 255, 0.4)",
  maxOpacity = 0.35,
}) => {
  const frame = useCurrentFrame();

  const particles: Particle[] = useMemo(() => {
    const list: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      // Deterministic pseudo-random generation based on index
      const seed = i * 9973 + 12345;
      const x = (seed % 1000) / 10.0;
      const y = ((seed * 7) % 1000) / 10.0;
      const size = 1.5 + (seed % 30) / 10.0; // 1.5px to 4.5px
      const speed = 0.2 + (seed % 40) / 100.0; // speed
      const opacity = 0.15 + (seed % 50) / 100.0; // 0.15 to 0.65
      const driftX = (((seed % 20) - 10) / 10.0) * 15; // horizontal oscillation
      list.push({ id: i, x, y, size, speed, opacity, driftX });
    }
    return list;
  }, [particleCount]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 5,
        overflow: "hidden",
      }}
    >
      {particles.map((p) => {
        // Vertical upward float with wrapping
        const currentY = (p.y - frame * p.speed * 0.4 + 1000) % 100;
        // Subtle sinusoidal sway
        const currentX = p.x + Math.sin((frame * p.speed + p.id) * 0.05) * 1.5;
        // Twinkle factor
        const twinkle = Math.sin((frame * 0.08 + p.id * 3)) * 0.3 + 0.7;
        const finalOpacity = Math.min(maxOpacity, p.opacity * twinkle);

        return (
          <div
            key={p.id}
            style={{
              position: "absolute",
              left: `${currentX}%`,
              top: `${currentY}%`,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              backgroundColor: color,
              boxShadow: `0 0 ${p.size * 2}px ${color}`,
              opacity: finalOpacity,
              transform: "translate3d(0, 0, 0)",
            }}
          />
        );
      })}
    </div>
  );
};
