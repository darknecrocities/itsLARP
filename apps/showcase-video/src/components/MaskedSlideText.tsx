import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { THEME } from "../theme";

interface MaskedSlideTextProps {
  text: string;
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
  fontSize?: number;
  tracking?: number;
  fontWeight?: number | string;
  color?: string;
  fontFamily?: string;
  style?: React.CSSProperties;
  lineHeight?: number | string;
}

export const MaskedSlideText: React.FC<MaskedSlideTextProps> = ({
  text,
  direction = "up",
  delay = 0,
  fontSize = 64,
  tracking = -1,
  fontWeight = 800,
  color = THEME.colors.ink,
  fontFamily = THEME.fonts.display,
  style,
  lineHeight = 1.1,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 26, stiffness: 220, mass: 0.8 },
  });

  // Calculate translation based on direction
  const offset = interpolate(progress, [0, 1], [110, 0]);

  let transformStr = `translateY(${offset}%)`;
  if (direction === "down") transformStr = `translateY(${-offset}%)`;
  if (direction === "left") transformStr = `translateX(${offset}%)`;
  if (direction === "right") transformStr = `translateX(${-offset}%)`;

  const trackingVal = interpolate(progress, [0, 1], [tracking + 6, tracking]);

  return (
    <div
      style={{
        overflow: "hidden",
        display: "inline-block",
        verticalAlign: "bottom",
        ...style,
      }}
    >
      <div
        style={{
          fontFamily,
          fontSize,
          fontWeight,
          color,
          letterSpacing: `${trackingVal}px`,
          lineHeight,
          transform: transformStr,
          willChange: "transform",
          userSelect: "none",
        }}
      >
        {text}
      </div>
    </div>
  );
};
