import React from "react";
import { THEME } from "../theme";

interface CinematicFrameProps {
  title?: string;
  children: React.ReactNode;
  width?: number | string;
  height?: number | string;
  glow?: boolean;
  style?: React.CSSProperties;
}

export const CinematicFrame: React.FC<CinematicFrameProps> = ({
  title = "itsLARP — Autonomous Career OS",
  children,
  width = 1600,
  height = 920,
  glow = true,
  style,
}) => {
  return (
    <div
      style={{
        width,
        height,
        backgroundColor: THEME.colors.bgElevated,
        borderRadius: 16,
        border: `1px solid ${THEME.colors.border}`,
        boxShadow: glow
          ? "0 30px 90px rgba(0, 0, 0, 0.85), 0 0 40px rgba(255, 255, 255, 0.04)"
          : "0 20px 60px rgba(0, 0, 0, 0.8)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        ...style,
      }}
    >
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
        }}
      >
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#ef4444", opacity: 0.8 }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#eab308", opacity: 0.8 }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#22c55e", opacity: 0.8 }} />
        </div>

        <div
          style={{
            fontFamily: THEME.fonts.mono,
            fontSize: 12,
            color: THEME.colors.inkMuted,
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
      </div>
    </div>
  );
};
