import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { THEME } from "../theme";
import { ScuttleMascot } from "./ScuttleMascot";

interface MascotMotionRailProps {
  dialogue?: string;
  snapBeats?: number[];
  railFromX?: number;
  railToX?: number;
  durationInFrames?: number;
  style?: React.CSSProperties;
}

export const MascotMotionRail: React.FC<MascotMotionRailProps> = ({
  dialogue = "Snip through the noise.",
  snapBeats = [40, 100, 160, 220],
  railFromX = 400,
  railToX = -40,
  durationInFrames = 300,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Rail slide progress with silky ease
  const progress = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateRight: "clamp",
  });

  const currentX = interpolate(progress, [0, 1], [railFromX, railToX]);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        right: 0,
        transform: `translateX(${currentX}px)`,
        willChange: "transform",
        zIndex: 40,
        ...style,
      }}
    >
      <ScuttleMascot dialogue={dialogue} snapBeats={snapBeats} />
    </div>
  );
};
