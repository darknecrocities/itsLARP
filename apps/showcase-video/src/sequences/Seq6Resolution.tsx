import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Img, staticFile } from "remotion";
import { THEME } from "../theme";
import { MaskedSlideText } from "../components/MaskedSlideText";
import { DeviceFanOut } from "../components/DeviceFanOut";

export const Seq6Resolution: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Sequence breakdown across 450 frames:
  // 0 - 210: Transitions #35 & #36 3D Multi-Device Fan-Out & Prismatic Convergence
  // 210 - 450: Transitions #37 & #38 Final Master Lockup Assembly & Exponential Harmonic Resolve

  const isFinalLockup = frame >= 210;

  // Master Lockup Spring Entrance (frame 210)
  const lockupSpring = spring({
    frame: Math.max(0, frame - 210),
    fps,
    config: { damping: 24, stiffness: 180, mass: 1 },
  });
  const lockupScale = interpolate(lockupSpring, [0, 1], [0.88, 1.0]);
  const lockupOpacity = interpolate(lockupSpring, [0, 0.4], [0, 1]);

  // Geometric Rule Lines drawing outward from logo (frames 230 - 330)
  const lineProgress = spring({
    frame: Math.max(0, frame - 230),
    fps,
    config: { damping: 20, stiffness: 160, mass: 0.9 },
  });
  const lineLength = interpolate(lineProgress, [0, 1], [0, 260]);

  // Specular sheen sweep across final logo (frames 270 - 330)
  const sheenX = interpolate(frame, [270, 330], [-150, 250], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Transition #38: Clean Exponential Harmonic Resolve on very last 30 frames (420 - 450)
  const resolveFade = interpolate(frame, [420, 449], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: THEME.colors.bg, overflow: "hidden" }}>
      {/* Background blueprint grid */}
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

      {!isFinalLockup ? (
        /* Part A: Transitions #35 & #36 3D Multi-Device Fan-Out & Convergence */
        <div style={{ position: "absolute", inset: 0 }}>
          <div
            style={{
              position: "absolute",
              top: 48,
              left: 90,
              zIndex: 35,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <MaskedSlideText
              text="06 / CROSS-PLATFORM CLIENTS"
              direction="left"
              delay={5}
              fontSize={15}
              tracking={4}
              fontWeight={700}
              color={THEME.colors.accentEmerald}
              fontFamily={THEME.fonts.mono}
            />
            <MaskedSlideText
              text="BUILT FOR EVERY WORKSTATION"
              direction="up"
              delay={20}
              fontSize={40}
              tracking={-1}
              fontWeight={800}
              color={THEME.colors.ink}
            />
          </div>

          <div style={{ position: "absolute", inset: 0, marginTop: 40 }}>
            <DeviceFanOut
              fanStartFrame={0}
              fanDuration={70}
              convergeStartFrame={110}
              convergeDuration={70}
            />
          </div>
        </div>
      ) : (
        /* Part B: Transitions #37 & #38 Final Master Lockup & Harmonic Resolve */
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${lockupScale})`,
            opacity: lockupOpacity,
            zIndex: 40,
          }}
        >
          {/* Logo with Specular Glass Sheen */}
          <div
            style={{
              position: "relative",
              padding: 24,
              borderRadius: 32,
              backgroundColor: "rgba(255, 255, 255, 0.04)",
              border: `1px solid ${THEME.colors.borderLight}`,
              boxShadow: "0 40px 100px rgba(0, 0, 0, 0.9), 0 0 50px rgba(255, 255, 255, 0.06)",
              overflow: "hidden",
              marginBottom: 28,
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
                width: 60,
                background:
                  "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.35), transparent)",
                transform: `translateX(${sheenX}px) skewX(-25deg)`,
                pointerEvents: "none",
              }}
            />
          </div>

          {/* Expanding Crosshair Ruler Lines */}
          <div style={{ position: "relative", width: lineLength * 2, height: 1, backgroundColor: "rgba(255, 255, 255, 0.2)", marginBottom: 28 }} />

          {/* Brand Tagline: "Lets Larp" */}
          <MaskedSlideText
            text="Lets Larp"
            direction="up"
            delay={230}
            fontSize={96}
            tracking={-2}
            fontWeight={900}
            color={THEME.colors.ink}
            fontFamily={THEME.fonts.display}
          />

          {/* Domain CTA Pill */}
          <div
            style={{
              marginTop: 24,
              padding: "14px 36px",
              borderRadius: 100,
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              border: `1px solid ${THEME.colors.borderLight}`,
              backdropFilter: "blur(12px)",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.7)",
            }}
          >
            <span
              style={{
                fontFamily: THEME.fonts.mono,
                fontSize: 20,
                fontWeight: 700,
                color: THEME.colors.ink,
                letterSpacing: 3,
              }}
            >
              ITSLARP.APP
            </span>
          </div>

          <div
            style={{
              fontFamily: THEME.fonts.mono,
              fontSize: 12,
              color: THEME.colors.inkSubtle,
              letterSpacing: 3,
              marginTop: 18,
            }}
          >
            MACOS · WINDOWS · WEB · AUTONOMOUS AGENT PROTOCOL
          </div>
        </AbsoluteFill>
      )}

      {/* Transition #38: Clean Outro Fade to Black */}
      {resolveFade > 0.01 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "#000000",
            opacity: resolveFade,
            pointerEvents: "none",
            zIndex: 100,
          }}
        />
      )}
    </AbsoluteFill>
  );
};
