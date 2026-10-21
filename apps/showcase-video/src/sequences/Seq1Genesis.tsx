import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Img, staticFile } from "remotion";
import { THEME } from "../theme";
import { KineticText } from "../components/KineticText";

export const Seq1Genesis: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo entrance
  const logoSpring = spring({
    frame: Math.max(0, frame - 10),
    fps,
    config: THEME.springs.snappy,
  });

  const logoScale = interpolate(logoSpring, [0, 1], [0.5, 1.0]);
  const logoOpacity = interpolate(frame, [10, 35], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Background subtle radial glow pulsing
  const pulseGlow = Math.sin(frame / 20) * 0.04 + 0.08;

  // Flash / impact right before frame 348 (beat hit)
  const exitFlash = interpolate(frame, [325, 347], [0, 0.95], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const exitScale = interpolate(frame, [310, 348], [1.0, 1.15], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: THEME.colors.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transform: `scale(${exitScale})`,
        overflow: "hidden",
      }}
    >
      {/* Ambient background glow */}
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(255, 255, 255, ${pulseGlow}) 0%, rgba(0, 0, 0, 0) 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* Grid overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          pointerEvents: "none",
        }}
      />

      {/* Brand content container */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 28,
          zIndex: 5,
        }}
      >
        {/* Official App Logo */}
        <div
          style={{
            transform: `scale(${logoScale})`,
            opacity: logoOpacity,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              padding: 16,
              borderRadius: 24,
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: `1px solid ${THEME.colors.borderLight}`,
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.8)",
            }}
          >
            <Img
              src={staticFile("images/applogo.png")}
              style={{
                width: 120,
                height: 120,
                objectFit: "contain",
                filter: "drop-shadow(0 0 20px rgba(255, 255, 255, 0.3))",
              }}
            />
          </div>
        </div>

        {/* Category kicker */}
        <KineticText
          text="AUTONOMOUS CAREER OPERATING SYSTEM"
          delay={40}
          fontSize={15}
          tracking={6}
          weight={600}
          color={THEME.colors.inkSubtle}
          fontFamily={THEME.fonts.mono}
          mode="line"
        />

        {/* Hero Tagline: "Lets Larp" */}
        <KineticText
          text="Lets Larp"
          delay={70}
          fontSize={110}
          tracking={-2}
          weight={800}
          color={THEME.colors.ink}
          mode="word"
        />

        {/* Subtitle */}
        <KineticText
          text="Stop applying manually. Let 1,000 autonomous bots fight for your interviews."
          delay={120}
          fontSize={22}
          tracking={0.5}
          weight={400}
          color={THEME.colors.inkMuted}
          mode="line"
        />
      </div>

      {/* Frame 348 Beat Flash */}
      {exitFlash > 0.01 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "#ffffff",
            opacity: exitFlash,
            zIndex: 99,
          }}
        />
      )}
    </AbsoluteFill>
  );
};
