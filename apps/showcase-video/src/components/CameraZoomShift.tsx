import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";

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
  fromScale = 0.98,
  toScale = 1.14,
  fromX = 15,
  toX = -25,
  fromY = 10,
  toY = -15,
  fromRotateX = 3,
  toRotateX = -1,
  fromRotateY = -4,
  toRotateY = 2,
  perspective = 1400,
  style,
}) => {
  const frame = useCurrentFrame();

  // Silky-smooth continuous multi-axis camera drift with sinusoidal easing
  const cameraEasing = Easing.inOut(Easing.sin);
  const scale = interpolate(frame, [0, durationInFrames], [fromScale, toScale], {
    easing: cameraEasing,
    extrapolateRight: "clamp",
  });
  const currentX = interpolate(frame, [0, durationInFrames], [fromX, toX], {
    easing: cameraEasing,
    extrapolateRight: "clamp",
  });
  const currentY = interpolate(frame, [0, durationInFrames], [fromY, toY], {
    easing: cameraEasing,
    extrapolateRight: "clamp",
  });
  const rotateX = interpolate(frame, [0, durationInFrames], [fromRotateX, toRotateX], {
    easing: cameraEasing,
    extrapolateRight: "clamp",
  });
  const rotateY = interpolate(frame, [0, durationInFrames], [fromRotateY, toRotateY], {
    easing: cameraEasing,
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
