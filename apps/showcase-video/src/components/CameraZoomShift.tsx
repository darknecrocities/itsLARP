import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

interface CameraZoomShiftProps {
  children: React.ReactNode;
  durationInFrames: number;
  fromScale?: number;
  toScale?: number;
  fromX?: number;
  toX?: number;
  fromY?: number;
  toY?: number;
  fromRotateX?: number;
  toRotateX?: number;
  fromRotateY?: number;
  toRotateY?: number;
  perspective?: number;
  style?: React.CSSProperties;
}

export const CameraZoomShift: React.FC<CameraZoomShiftProps> = ({
  children,
  durationInFrames,
  fromScale = 1.0,
  toScale = 1.14,
  fromX = 0,
  toX = -25,
  fromY = 0,
  toY = -15,
  fromRotateX = 2,
  toRotateX = 0,
  fromRotateY = -3,
  toRotateY = 1,
  perspective = 1400,
  style,
}) => {
  const frame = useCurrentFrame();

  const scale = interpolate(frame, [0, durationInFrames], [fromScale, toScale], {
    extrapolateRight: "clamp",
  });
  const currentX = interpolate(frame, [0, durationInFrames], [fromX, toX], {
    extrapolateRight: "clamp",
  });
  const currentY = interpolate(frame, [0, durationInFrames], [fromY, toY], {
    extrapolateRight: "clamp",
  });
  const rotateX = interpolate(frame, [0, durationInFrames], [fromRotateX, toRotateX], {
    extrapolateRight: "clamp",
  });
  const rotateY = interpolate(frame, [0, durationInFrames], [fromRotateY, toRotateY], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        perspective,
        transformStyle: "preserve-3d",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...style,
      }}
    >
      <div
        style={{
          transform: `translate3d(${currentX}px, ${currentY}px, 0) scale(${scale}) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transformOrigin: "center center",
          willChange: "transform",
        }}
      >
        {children}
      </div>
    </div>
  );
};
