import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig, Img, staticFile } from "remotion";
import { THEME } from "../theme";
import { CinematicFrame } from "./CinematicFrame";

interface DeviceFanOutProps {
  fanStartFrame?: number;
  fanDuration?: number;
  convergeStartFrame?: number;
  convergeDuration?: number;
}

export const DeviceFanOut: React.FC<DeviceFanOutProps> = ({
  fanStartFrame = 0,
  fanDuration = 60,
  convergeStartFrame = 90,
  convergeDuration = 60,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Fan-out progress (0 to 1)
  const fanProgress = spring({
    frame: Math.max(0, frame - fanStartFrame),
    fps,
    config: { damping: 22, stiffness: 160, mass: 1 },
  });

  // Convergence progress (0 to 1)
  const convergeProgress = spring({
    frame: Math.max(0, frame - convergeStartFrame),
    fps,
    config: { damping: 26, stiffness: 200, mass: 1.1 },
  });

  // Card 1: Left (macOS client)
  const leftX = interpolate(fanProgress, [0, 1], [0, -320]);
  const leftRotateZ = interpolate(fanProgress, [0, 1], [0, -8]);
  const leftRotateY = interpolate(fanProgress, [0, 1], [0, 15]);
  const leftConvX = interpolate(convergeProgress, [0, 1], [leftX, 0]);
  const leftConvRotZ = interpolate(convergeProgress, [0, 1], [leftRotateZ, 0]);
  const leftConvRotY = interpolate(convergeProgress, [0, 1], [leftRotateY, 0]);

  // Card 2: Center (Web client)
  const centerY = interpolate(fanProgress, [0, 1], [40, -20]);
  const centerScale = interpolate(fanProgress, [0, 1], [0.95, 1.05]);
  const centerConvY = interpolate(convergeProgress, [0, 1], [centerY, 0]);
  const centerConvScale = interpolate(convergeProgress, [0, 1], [centerScale, 1.0]);

  // Card 3: Right (Windows client)
  const rightX = interpolate(fanProgress, [0, 1], [0, 320]);
  const rightRotateZ = interpolate(fanProgress, [0, 1], [0, 8]);
  const rightRotateY = interpolate(fanProgress, [0, 1], [0, -15]);
  const rightConvX = interpolate(convergeProgress, [0, 1], [rightX, 0]);
  const rightConvRotZ = interpolate(convergeProgress, [0, 1], [rightRotateZ, 0]);
  const rightConvRotY = interpolate(convergeProgress, [0, 1], [rightRotateY, 0]);

  const cards = [
    {
      title: "macOS Silicon & Intel Client (v1.4.2)",
      badge: "APPLE SILICON / INTEL",
      tag: "DMG / PKG",
      x: frame >= convergeStartFrame ? leftConvX : leftX,
      y: 10,
      rotateZ: frame >= convergeStartFrame ? leftConvRotZ : leftRotateZ,
      rotateY: frame >= convergeStartFrame ? leftConvRotY : leftRotateY,
      scale: 0.88,
      zIndex: 1,
      opacity: frame >= convergeStartFrame ? interpolate(convergeProgress, [0, 1], [0.9, 0]) : 0.9,
    },
    {
      title: "itslarp.app — Production Web Console",
      badge: "CHROMIUM · BRAVE · SAFARI",
      tag: "PWA READY",
      x: 0,
      y: frame >= convergeStartFrame ? centerConvY : centerY,
      rotateZ: 0,
      rotateY: 0,
      scale: frame >= convergeStartFrame ? centerConvScale : centerScale,
      zIndex: 10,
      opacity: 1,
    },
    {
      title: "Windows x64 Native Daemon (v1.4.2)",
      badge: "WINDOWS 11 / 10",
      tag: "MSIX / EXE",
      x: frame >= convergeStartFrame ? rightConvX : rightX,
      y: 10,
      rotateZ: frame >= convergeStartFrame ? rightConvRotZ : rightRotateZ,
      rotateY: frame >= convergeStartFrame ? rightConvRotY : rightRotateY,
      scale: 0.88,
      zIndex: 2,
      opacity: frame >= convergeStartFrame ? interpolate(convergeProgress, [0, 1], [0.9, 0]) : 0.9,
    },
  ];

  return (
    <div
      style={{
        perspective: 1400,
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {cards.map((c, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            transform: `translate3d(${c.x}px, ${c.y}px, 0) scale(${c.scale}) rotateZ(${c.rotateZ}deg) rotateY(${c.rotateY}deg)`,
            zIndex: c.zIndex,
            opacity: c.opacity,
            willChange: "transform, opacity",
            boxShadow: "0 30px 100px rgba(0, 0, 0, 0.9)",
          }}
        >
          <CinematicFrame width={1100} height={620} title={c.title}>
            <div style={{ position: "relative", width: "100%", height: "100%" }}>
              <Img
                src={staticFile("images/download.png")}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "top left",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 20,
                  left: 24,
                  display: "flex",
                  gap: 12,
                  zIndex: 20,
                }}
              >
                <span
                  style={{
                    backgroundColor: "rgba(0, 0, 0, 0.85)",
                    border: `1px solid ${THEME.colors.borderLight}`,
                    padding: "4px 10px",
                    borderRadius: 6,
                    fontSize: 11,
                    fontFamily: THEME.fonts.mono,
                    fontWeight: 700,
                    color: THEME.colors.ink,
                  }}
                >
                  {c.badge}
                </span>
                <span
                  style={{
                    backgroundColor: "rgba(16, 185, 129, 0.15)",
                    border: "1px solid rgba(16, 185, 129, 0.4)",
                    padding: "4px 10px",
                    borderRadius: 6,
                    fontSize: 11,
                    fontFamily: THEME.fonts.mono,
                    fontWeight: 700,
                    color: THEME.colors.accentEmerald,
                  }}
                >
                  {c.tag}
                </span>
              </div>
            </div>
          </CinematicFrame>
        </div>
      ))}
    </div>
  );
};
