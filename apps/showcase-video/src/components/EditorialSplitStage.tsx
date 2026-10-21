import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { THEME } from "../theme";
import { TypewriterText } from "./TypewriterText";
import { ScuttleMascot } from "./ScuttleMascot";

export interface MetricItem {
  label: string;
  value: string;
  color?: string;
}

export interface MascotPlacement {
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "on-card" | "top-bezel";
  dialogue?: string;
  scale?: number;
  flip?: boolean;
}

interface EditorialSplitStageProps {
  side: "left" | "right";
  badge: string;
  badgeColor?: string;
  title: string;
  description: string;
  startFrame?: number;
  metrics?: MetricItem[];
  mascotConfig?: MascotPlacement;
  children: React.ReactNode;
}

export const EditorialSplitStage: React.FC<EditorialSplitStageProps> = ({
  side = "left",
  badge,
  badgeColor = THEME.colors.accentEmerald,
  title,
  description,
  startFrame = 0,
  metrics,
  mascotConfig,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring for editorial card
  const cardSpring = spring({
    frame: Math.max(0, frame - startFrame),
    fps,
    config: { damping: 24, stiffness: 200, mass: 0.9 },
  });

  const cardTranslateX = interpolate(
    cardSpring,
    [0, 1],
    [side === "left" ? -80 : 80, 0]
  );
  const cardOpacity = interpolate(cardSpring, [0, 0.4], [0, 1]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: side === "left" ? "row" : "row-reverse",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 60px",
        overflow: "hidden",
      }}
    >
      {/* 1. Editorial Text Card (Width: ~540px) */}
      <div
        style={{
          width: 540,
          display: "flex",
          flexDirection: "column",
          gap: 20,
          zIndex: 30,
          transform: `translateX(${cardTranslateX}px)`,
          opacity: cardOpacity,
          position: "relative",
        }}
      >
        {/* Category Badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: badgeColor,
              boxShadow: `0 0 10px ${badgeColor}`,
            }}
          />
          <span
            style={{
              fontFamily: THEME.fonts.mono,
              fontSize: 13,
              fontWeight: 700,
              color: badgeColor,
              letterSpacing: 2.5,
              textTransform: "uppercase",
            }}
          >
            {badge}
          </span>
        </div>

        {/* Feature Title */}
        <div
          style={{
            fontFamily: THEME.fonts.display,
            fontSize: 44,
            fontWeight: 800,
            color: THEME.colors.ink,
            letterSpacing: -1.2,
            lineHeight: 1.08,
          }}
        >
          {title}
        </div>

        {/* Live Typewriter Description */}
        <div
          style={{
            backgroundColor: "rgba(15, 15, 19, 0.85)",
            border: `1px solid ${THEME.colors.borderLight}`,
            borderRadius: 14,
            padding: "20px 24px",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(16px)",
            position: "relative",
          }}
        >
          <TypewriterText
            text={description}
            startFrame={startFrame + 10}
            charsPerSecond={28}
            cursorColor={badgeColor}
            fontSize={16}
            lineHeight={1.5}
            color={THEME.colors.ink}
          />

          {/* Optional Mascot on top of Card */}
          {mascotConfig?.position === "on-card" && (
            <div style={{ position: "absolute", top: -85, right: 20, zIndex: 40 }}>
              <ScuttleMascot
                dialogue={mascotConfig.dialogue}
                scale={mascotConfig.scale ?? 0.55}
                flip={mascotConfig.flip ?? false}
                disableEntrance
              />
            </div>
          )}
        </div>

        {/* Live Telemetry Metric Badges */}
        {metrics && metrics.length > 0 && (
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {metrics.map((m, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.8)",
                  border: `1px solid ${THEME.colors.borderLight}`,
                  borderRadius: 10,
                  padding: "8px 16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <span
                  style={{
                    fontFamily: THEME.fonts.mono,
                    fontSize: 10,
                    color: THEME.colors.inkSubtle,
                    letterSpacing: 1,
                  }}
                >
                  {m.label}
                </span>
                <span
                  style={{
                    fontFamily: THEME.fonts.mono,
                    fontSize: 15,
                    fontWeight: 800,
                    color: m.color ?? THEME.colors.ink,
                  }}
                >
                  {m.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Main Media Stage (Width: ~1240px) */}
      <div
        style={{
          width: 1220,
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 15,
        }}
      >
        {children}

        {/* Optional Mascot on top bezel or around media frame */}
        {mascotConfig && mascotConfig.position !== "on-card" && (
          <div
            style={{
              position: "absolute",
              zIndex: 50,
              ...(mascotConfig.position === "top-right" && { top: 70, right: 30 }),
              ...(mascotConfig.position === "top-left" && { top: 70, left: 30 }),
              ...(mascotConfig.position === "bottom-right" && { bottom: 50, right: 20 }),
              ...(mascotConfig.position === "bottom-left" && { bottom: 50, left: 20 }),
              ...(mascotConfig.position === "top-bezel" && { top: 60, left: "50%", transform: "translateX(-50%)" }),
            }}
          >
            <ScuttleMascot
              dialogue={mascotConfig.dialogue}
              scale={mascotConfig.scale ?? 0.65}
              flip={mascotConfig.flip ?? false}
              disableEntrance
            />
          </div>
        )}
      </div>
    </div>
  );
};
