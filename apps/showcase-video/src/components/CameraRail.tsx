import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

export interface RailWaypoint {
  frame: number;
  x: number;
  y: number;
  scale?: number;
  tiltX?: number;
  tiltY?: number;
}

interface CameraRailProps {
  waypoints: RailWaypoint[];
  children: React.ReactNode;
  perspective?: number;
  style?: React.CSSProperties;
}

export const CameraRail: React.FC<CameraRailProps> = ({
  waypoints,
  children,
  perspective = 1400,
  style,
}) => {
  const frame = useCurrentFrame();

  if (waypoints.length === 0) return <>{children}</>;
  if (waypoints.length === 1) {
    const wp = waypoints[0];
    return (
      <div
        style={{
          transform: `translate3d(${wp.x}px, ${wp.y}px, 0) scale(${wp.scale ?? 1}) rotateX(${wp.tiltX ?? 0}deg) rotateY(${wp.tiltY ?? 0}deg)`,
          ...style,
        }}
      >
        {children}
      </div>
    );
  }

  const frames = waypoints.map((w) => w.frame);
  const xs = waypoints.map((w) => w.x);
  const ys = waypoints.map((w) => w.y);
  const scales = waypoints.map((w) => w.scale ?? 1);
  const tiltXs = waypoints.map((w) => w.tiltX ?? 0);
  const tiltYs = waypoints.map((w) => w.tiltY ?? 0);

  const currentX = interpolate(frame, frames, xs, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const currentY = interpolate(frame, frames, ys, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const currentScale = interpolate(frame, frames, scales, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const currentTiltX = interpolate(frame, frames, tiltXs, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const currentTiltY = interpolate(frame, frames, tiltYs, {
    extrapolateLeft: "clamp",
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
          transform: `translate3d(${currentX}px, ${currentY}px, 0) scale(${currentScale}) rotateX(${currentTiltX}deg) rotateY(${currentTiltY}deg)`,
          transformOrigin: "center center",
          willChange: "transform",
        }}
      >
        {children}
      </div>
    </div>
  );
};
