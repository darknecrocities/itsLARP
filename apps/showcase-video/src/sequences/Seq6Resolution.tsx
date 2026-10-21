import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Img, staticFile } from "remotion";
import { THEME } from "../theme";
import { TypewriterText } from "../components/TypewriterText";
import { DeviceFanOut } from "../components/DeviceFanOut";
import { ScuttleMascot } from "../components/ScuttleMascot";

export const Seq6Resolution: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Screen split at local frame 210:
  // 0 - 210: Feature 9 (Cross-Platform Clients 3D Fan-out)
  // 210 - 450: Feature 10 (Final Master Lockup Assembly & Harmonic Resolve)
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

  // Clean Exponential Harmonic Resolve on very last 30 frames (420 - 450)
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
        /* Part A: Feature 9 Cross-Platform Clients 3D Fan-Out & Convergence */
        <div style={{ position: "absolute", inset: 0 }}>
          {/* Header HUD with Live Typewriter */}
          <div
            style={{
              position: "absolute",
              top: 48,
              left: 90,
              zIndex: 35,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div
              style={{
                fontFamily: THEME.fonts.mono,
                fontSize: 13,
                fontWeight: 700,
                color: THEME.colors.accentEmerald,
                letterSpacing: 3,
                textTransform: "uppercase",
              }}
            >
              09 / CROSS-PLATFORM CLIENTS
            </div>
            <div
              style={{
                fontFamily: THEME.fonts.display,
                fontSize: 42,
                fontWeight: 800,
                color: THEME.colors.ink,
                letterSpacing: -1,
              }}
            >
              BUILT FOR EVERY WORKSTATION
            </div>
            <TypewriterText
              text="Runs natively on macOS, Windows, and the Web."
              startFrame={5}
              charsPerSecond={26}
              fontSize={18}
              color={THEME.colors.inkMuted}
            />
          </div>

          {/* Scuttle Mascot perched on Top Left Window Header */}
          <div style={{ position: "absolute", top: 50, right: 90, zIndex: 40 }}>
            <ScuttleMascot
              dialogue="Native Mac & Windows."
              scale={0.65}
              disableEntrance
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
        /* Part B: Feature 10 Final Master Lockup & Harmonic Resolve */
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
              marginBottom: 24,
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

          {/* Expanding Crosshair Ruler Line */}
          <div
            style={{
              width: lineLength * 2,
              height: 1,
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              marginBottom: 24,
            }}
          />

          {/* Brand Tagline: "Lets Larp" */}
          <div
            style={{
              fontFamily: THEME.fonts.display,
              fontSize: 96,
              fontWeight: 900,
              color: THEME.colors.ink,
              letterSpacing: -2,
            }}
          >
            Lets Larp
          </div>

          {/* Live Typewriter Final Signoff */}
          <TypewriterText
            text="Stop applying manually. Lets Larp."
            startFrame={250}
            charsPerSecond={24}
            fontSize={20}
            color={THEME.colors.inkMuted}
            style={{ marginTop: 12 }}
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

          {/* Scuttle Mascot Standing Beside Logo */}
          <div style={{ position: "absolute", bottom: 60, right: 120, zIndex: 50 }}>
            <ScuttleMascot dialogue="Lets Larp." scale={0.7} disableEntrance />
          </div>
        </AbsoluteFill>
      )}

      {/* Clean Outro Fade to Black */}
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
