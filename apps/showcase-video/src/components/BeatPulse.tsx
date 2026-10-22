import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

interface BeatPulseProps {
  hitFrames: number[];
  children: React.ReactNode;
  maxScale?: number;
  glow?: boolean;
}

export const BeatPulse: React.FC<BeatPulseProps> = ({
  hitFrames,
  children,
  maxScale = 1.04,
  glow = true,
}) => {
  const frame = useCurrentFrame();

  // Find most recent hit frame
  let recentHit = -999;
  for (const h of hitFrames) {
    if (frame >= h && frame - h < 24) {
      recentHit = Math.max(recentHit, h);
    }
  }

  const delta = frame - recentHit;

  let scale = 1.0;
  let flashOpacity = 0.0;

  if (delta >= 0 && delta <= 20) {
    // Sharp attack (0-2 frames), exponential decay (2-20 frames)
    scale = interpolate(delta, [0, 2, 20], [1.0, maxScale, 1.0], {
      extrapolateRight: "clamp",
    });
    flashOpacity = interpolate(delta, [0, 2, 16], [0.0, 0.18, 0.0], {
      extrapolateRight: "clamp",
    });
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        transform: `scale(${scale})`,
        position: "relative",
      }}
    >
      {children}
      {glow && flashOpacity > 0.005 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "#ffffff",
            opacity: flashOpacity,
            pointerEvents: "none",
            mixBlendMode: "overlay",
          }}
        />
      )}
    </div>
  );
};
