import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

interface ShutterBladeWipeProps {
  slatCount?: number;
  triggerFrame?: number;
  durationInFrames?: number;
  direction?: "horizontal" | "vertical";
  children?: React.ReactNode;
}

export const ShutterBladeWipe: React.FC<ShutterBladeWipeProps> = ({
  slatCount = 6,
  triggerFrame = 0,
  durationInFrames = 45,
  direction = "vertical",
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const activeFrame = Math.max(0, frame - triggerFrame);
  if (frame < triggerFrame) return <>{children}</>;

  const progress = spring({
    frame: activeFrame,
    fps,
    config: { damping: 24, stiffness: 200, mass: 0.9 },
  });

  const slats = Array.from({ length: slatCount }, (_, i) => i);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
      {children}
      {/* Slat overlays */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 50 }}>
        {slats.map((idx) => {
          const isEven = idx % 2 === 0;
          const shift = interpolate(progress, [0, 1], [0, isEven ? -100 : 100]);
          const slatPercent = 100 / slatCount;

          return (
            <div
              key={idx}
              style={{
                position: "absolute",
                backgroundColor: "#000000",
                ...(direction === "vertical"
                  ? {
                      top: 0,
                      bottom: 0,
                      left: `${idx * slatPercent}%`,
                      width: `${slatPercent + 0.1}%`,
                      transform: `translateY(${shift}%)`,
                    }
                  : {
                      left: 0,
                      right: 0,
                      top: `${idx * slatPercent}%`,
                      height: `${slatPercent + 0.1}%`,
                      transform: `translateX(${shift}%)`,
                    }),
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
