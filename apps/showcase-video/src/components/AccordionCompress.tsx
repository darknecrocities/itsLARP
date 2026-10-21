import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";

interface AccordionCompressProps {
  children: React.ReactNode;
  triggerFrame?: number;
  durationInFrames?: number;
  numSlices?: number;
  style?: React.CSSProperties;
}

export const AccordionCompress: React.FC<AccordionCompressProps> = ({
  children,
  triggerFrame = 0,
  durationInFrames = 60,
  numSlices = 5,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const activeFrame = Math.max(0, frame - triggerFrame);
  if (frame < triggerFrame) return <>{children}</>;

  const progress = spring({
    frame: activeFrame,
    fps,
    config: { damping: 20, stiffness: 180, mass: 1 },
  });

  // Accordion fold rotation (-25 to 0 or 0 to 25 deg per fold)
  const foldAngle = interpolate(progress, [0, 0.5, 1], [0, 35, 0]);
  const scaleX = interpolate(progress, [0, 0.5, 1], [1, 0.75, 1]);

  return (
    <div
      style={{
        perspective: 1200,
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: `scaleX(${scaleX}) rotateY(${foldAngle}deg)`,
        transformStyle: "preserve-3d",
        transition: "transform 0.1s linear",
        ...style,
      }}
    >
      {children}
    </div>
  );
};
