import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig, Img, staticFile } from "remotion";
import { THEME } from "../theme";

export const ApertureIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 1. Aperture Iris expansion (frames 0 - 60)
  const apertureProgress = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 180, mass: 0.9 },
  });

  const irisSize = interpolate(apertureProgress, [0, 1], [0, 1400]);
  const crosshairLen = interpolate(apertureProgress, [0, 1], [0, 300]);

  // 2. 3D Logo Perspective Tumble & Lock (frames 50 - 160)
  const logoProgress = spring({
    frame: Math.max(0, frame - 50),
    fps,
    config: { damping: 24, stiffness: 140, mass: 1.1 },
  });

  const logoRotateY = interpolate(logoProgress, [0, 1], [-55, 0]);
  const logoRotateX = interpolate(logoProgress, [0, 1], [25, 0]);
  const logoScale = interpolate(logoProgress, [0, 1], [0.35, 1.0]);
  const logoTranslateZ = interpolate(logoProgress, [0, 1], [-400, 0]);
  const logoOpacity = interpolate(frame, [50, 75], [0, 1], { extrapolateRight: "clamp" });

  // 3. Specular sheen sweep across logo (frames 140 - 200)
  const sheenX = interpolate(frame, [140, 200], [-150, 250], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // 4. Coordinate grid opacity
  const gridOpacity = interpolate(frame, [15, 60], [0, 0.05], { extrapolateRight: "clamp" });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Background blueprint grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          opacity: gridOpacity,
          pointerEvents: "none",
        }}
      />

      {/* Crosshair Ruler Lines drawing outward */}
      <div
        style={{
          position: "absolute",
          width: crosshairLen * 2,
          height: 1,
          backgroundColor: THEME.colors.borderLight,
          opacity: 0.4,
        }}
      />
      <div
        style={{
          position: "absolute",
          height: crosshairLen * 2,
          width: 1,
          backgroundColor: THEME.colors.borderLight,
          opacity: 0.4,
        }}
      />

      {/* Circular Aperture Ring */}
      <div
        style={{
          position: "absolute",
          width: irisSize,
          height: irisSize,
          borderRadius: "50%",
          border: `1px solid rgba(255, 255, 255, 0.15)`,
          boxShadow: "0 0 60px rgba(255, 255, 255, 0.05)",
          pointerEvents: "none",
        }}
      />

      {/* 3D Tumbling Logo Container */}
      <div
        style={{
          perspective: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            transform: `scale(${logoScale}) rotateX(${logoRotateX}deg) rotateY(${logoRotateY}deg) translateZ(${logoTranslateZ}px)`,
            opacity: logoOpacity,
            padding: 20,
            borderRadius: 30,
            backgroundColor: "rgba(255, 255, 255, 0.04)",
            border: `1px solid ${THEME.colors.borderLight}`,
            boxShadow: "0 30px 90px rgba(0, 0, 0, 0.9), 0 0 40px rgba(255, 255, 255, 0.05)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Img
            src={staticFile("images/applogo.png")}
            style={{
              width: 140,
              height: 140,
              objectFit: "contain",
              display: "block",
            }}
          />

          {/* Specular Light Sheen */}
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              width: 50,
              background:
                "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.35), transparent)",
              transform: `translateX(${sheenX}px) skewX(-25deg)`,
              pointerEvents: "none",
            }}
          />
        </div>
      </div>
    </div>
  );
};
