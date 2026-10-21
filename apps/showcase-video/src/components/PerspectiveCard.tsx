import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { THEME } from "../theme";

interface PerspectiveCardProps {
  children: React.ReactNode;
  initialRotateX?: number;
  initialRotateY?: number;
  targetRotateX?: number;
  targetRotateY?: number;
  initialScale?: number;
  targetScale?: number;
  initialTranslateY?: number;
  targetTranslateY?: number;
  duration?: number;
  style?: React.CSSProperties;
}

export const PerspectiveCard: React.FC<PerspectiveCardProps> = ({
  children,
  initialRotateX = 8,
  initialRotateY = -12,
  targetRotateX = 2,
  targetRotateY = -2,
  initialScale = 0.9,
  targetScale = 1.0,
  initialTranslateY = 40,
  targetTranslateY = 0,
  duration = 180,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame,
    fps,
    config: THEME.springs.cinematic,
  });

  const continuousPan = interpolate(frame, [0, duration], [0, 1], {
    extrapolateRight: "clamp",
  });

  const rotateX = interpolate(
    progress,
    [0, 1],
    [initialRotateX, targetRotateX]
  ) + interpolate(continuousPan, [0, 1], [0, -1]);

  const rotateY = interpolate(
    progress,
    [0, 1],
    [initialRotateY, targetRotateY]
  ) + interpolate(continuousPan, [0, 1], [0, 2]);

  const scale = interpolate(
    progress,
    [0, 1],
    [initialScale, targetScale]
  ) + interpolate(continuousPan, [0, 1], [0, 0.04]);

  const translateY = interpolate(
    progress,
    [0, 1],
    [initialTranslateY, targetTranslateY]
  ) + interpolate(continuousPan, [0, 1], [0, -10]);

  return (
    <div
      style={{
        perspective: 1200,
        transformStyle: "preserve-3d",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        ...style,
      }}
    >
      <div
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale}) translateY(${translateY}px)`,
          transformOrigin: "center center",
          transition: "none",
        }}
      >
        {children}
      </div>
    </div>
  );
};
