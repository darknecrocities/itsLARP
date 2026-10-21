import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

interface SplitShiftPanelProps {
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
  triggerFrame?: number;
  splitRatio?: number; // e.g. 0.5
  opposingDistance?: number;
  direction?: "vertical" | "horizontal";
  style?: React.CSSProperties;
}

export const SplitShiftPanel: React.FC<SplitShiftPanelProps> = ({
  leftContent,
  rightContent,
  triggerFrame = 0,
  splitRatio = 0.5,
  opposingDistance = 80,
  direction = "vertical",
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: Math.max(0, frame - triggerFrame),
    fps,
    config: { damping: 26, stiffness: 180, mass: 1 },
  });

  const shiftLeft = interpolate(progress, [0, 1], [opposingDistance, 0]);
  const shiftRight = interpolate(progress, [0, 1], [-opposingDistance, 0]);

  const leftPercent = splitRatio * 100;
  const rightPercent = (1 - splitRatio) * 100;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        overflow: "hidden",
        ...style,
      }}
    >
      {/* Left / Top Panel */}
      <div
        style={{
          width: `${leftPercent}%`,
          height: "100%",
          overflow: "hidden",
          position: "relative",
          transform:
            direction === "vertical"
              ? `translateY(${shiftLeft}px)`
              : `translateX(${shiftLeft}px)`,
        }}
      >
        {leftContent}
      </div>

      {/* Center Divider Wire */}
      <div
        style={{
          width: 1,
          height: "100%",
          backgroundColor: "rgba(255, 255, 255, 0.15)",
          zIndex: 10,
        }}
      />

      {/* Right / Bottom Panel */}
      <div
        style={{
          width: `${rightPercent}%`,
          height: "100%",
          overflow: "hidden",
          position: "relative",
          transform:
            direction === "vertical"
              ? `translateY(${shiftRight}px)`
              : `translateX(${shiftRight}px)`,
        }}
      >
        {rightContent}
      </div>
    </div>
  );
};
