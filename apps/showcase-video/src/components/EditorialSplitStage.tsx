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

  // Entrance spring for pure typography
  const textSpring = spring({
    frame: Math.max(0, frame - startFrame),
    fps,
    config: { damping: 24, stiffness: 200, mass: 0.9 },
  });

  const textTranslateX = interpolate(
    textSpring,
    [0, 1],
    [side === "left" ? -70 : 70, 0]
  );
  const textOpacity = interpolate(textSpring, [0, 0.35], [0, 1]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: side === "left" ? "row" : "row-reverse",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 70px",
        overflow: "hidden",
      }}
    >
      {/* 1. Pure Floating Typography (NO CARDS / NO BOXES) */}
      <div
        style={{
          width: 540,
          display: "flex",
          flexDirection: "column",
          gap: 20,
          zIndex: 35,
          transform: `translateX(${textTranslateX}px)`,
          opacity: textOpacity,
          position: "relative",
          pointerEvents: "none",
        }}
      >
        {/* Category Kicker */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: "50%",
              backgroundColor: badgeColor,
              boxShadow: `0 0 12px ${badgeColor}`,
            }}
          />
          <span
            style={{
              fontFamily: THEME.fonts.mono,
              fontSize: 13,
              fontWeight: 800,
              color: badgeColor,
              letterSpacing: 3,
              textTransform: "uppercase",
            }}
          >
            {badge}
          </span>
        </div>

        {/* Ultra-Bold Feature Title (fontWeight: 900) */}
        <div
          style={{
            fontFamily: THEME.fonts.display,
            fontSize: 52,
            fontWeight: 900,
            color: "#ffffff",
            letterSpacing: -1.6,
            lineHeight: 1.05,
            textShadow: "0 4px 25px rgba(0, 0, 0, 0.95)",
          }}
        >
          {title}
        </div>

        {/* Pure Floating Bold Typewriter Description (NO BOX) */}
        <div style={{ position: "relative", marginTop: 4 }}>
          <TypewriterText
            text={description}
            startFrame={startFrame + 10}
            charsPerSecond={28}
            cursorColor={badgeColor}
            fontSize={18}
            fontWeight={700}
            lineHeight={1.55}
            color="#ffffff"
          />
        </div>

        {/* Inline Floating Telemetry Badges */}
        {metrics && metrics.length > 0 && (
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 6 }}>
            {metrics.map((m, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.75)",
                  border: `1px solid ${THEME.colors.borderLight}`,
                  borderRadius: 100,
                  padding: "8px 18px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  backdropFilter: "blur(12px)",
                  boxShadow: "0 6px 20px rgba(0, 0, 0, 0.6)",
                }}
              >
                <span
                  style={{
                    fontFamily: THEME.fonts.mono,
                    fontSize: 11,
                    color: THEME.colors.inkSubtle,
                    letterSpacing: 1,
                    fontWeight: 700,
                  }}
                >
                  {m.label}
                </span>
                <span
                  style={{
                    fontFamily: THEME.fonts.mono,
                    fontSize: 14,
                    fontWeight: 800,
                    color: m.color ?? "#ffffff",
                  }}
                >
                  {m.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Main Media Stage (Width: ~1200px) */}
      <div
        style={{
          width: 1200,
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 15,
        }}
      >
        {children}
      </div>

      {/* 3. Scuttle Mascot (Strictly on OPPOSITE screen corner from text to guarantee ZERO occlusion) */}
      {mascotConfig && (
        <div
          style={{
            position: "absolute",
            zIndex: 60,
            // If text is on LEFT (left: 70px), mascot is anchored to FAR RIGHT
            // If text is on RIGHT (right: 70px), mascot is anchored to FAR LEFT
            ...(side === "left"
              ? { bottom: 35, right: 60 }
              : { bottom: 35, left: 60 }),
          }}
        >
          <ScuttleMascot
            dialogue={mascotConfig.dialogue}
            scale={mascotConfig.scale ?? 0.65}
            flip={side === "right"} // Face towards the center
            disableEntrance
          />
        </div>
      )}
    </div>
  );
};
