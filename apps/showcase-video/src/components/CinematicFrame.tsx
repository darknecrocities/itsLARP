import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { THEME } from "../theme";

interface CinematicFrameProps {
  title?: string;
  children: React.ReactNode;
  width?: number | string;
  height?: number | string;
  glow?: boolean;
  ambientGlowColor?: string;
  style?: React.CSSProperties;
}

export const CinematicFrame: React.FC<CinematicFrameProps> = ({
  title = "itsLARP — Autonomous Career OS",
  children,
  width = 1600,
  height = 920,
  glow = true,
  ambientGlowColor = "rgba(16, 185, 129, 0.15)",
  style,
}) => {
  const frame = useCurrentFrame();

  // Subtle continuous specular light sweep along the top window bezel
  const sheenX = interpolate(frame % 180, [0, 180], [-200, 1800]);

  return (
    <div
      style={{
        width,
        height,
        backgroundColor: THEME.colors.bgElevated,
        borderRadius: 16,
        border: `1px solid ${THEME.colors.borderLight}`,
        boxShadow: glow
          ? `0 35px 100px rgba(0, 0, 0, 0.95), 0 0 70px ${ambientGlowColor}`
          : "0 20px 60px rgba(0, 0, 0, 0.8)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        ...style,
      }}
    >
      {/* Specular Bezel Highlight Sweep */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          background: `linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.7) ${sheenX}px, transparent)`,
          pointerEvents: "none",
          zIndex: 30,
        }}
      />

      {/* Title bar */}
      <div
        style={{
          height: 40,
          backgroundColor: THEME.colors.bgCard,
          borderBottom: `1px solid ${THEME.colors.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          userSelect: "none",
          position: "relative",
          zIndex: 20,
        }}
      >
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#ef4444", opacity: 0.85, boxShadow: "0 0 6px #ef4444" }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#eab308", opacity: 0.85, boxShadow: "0 0 6px #eab308" }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#22c55e", opacity: 0.85, boxShadow: "0 0 6px #22c55e" }} />
        </div>

        <div
          style={{
            fontFamily: THEME.fonts.mono,
            fontSize: 12,
            fontWeight: 700,
            color: "#ffffff",
            letterSpacing: 0.5,
          }}
        >
          {title}
        </div>

        <div style={{ width: 40 }} />
      </div>

      {/* Frame content */}
      <div
        style={{
          flex: 1,
          position: "relative",
          overflow: "hidden",
          backgroundColor: THEME.colors.bg,
        }}
      >
        {children}

        {/* Ultra-fine high-tech scanline texture (2% opacity) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.25) 2px, rgba(0, 0, 0, 0.25) 4px)",
            pointerEvents: "none",
            opacity: 0.08,
            zIndex: 10,
          }}
        />
      </div>
    </div>
  );
};
