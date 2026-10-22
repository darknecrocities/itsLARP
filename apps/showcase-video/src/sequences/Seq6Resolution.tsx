import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Img, staticFile } from "remotion";
import { THEME } from "../theme";
import { TypewriterText } from "../components/TypewriterText";
import { DeviceFanOut } from "../components/DeviceFanOut";
import { ScuttleMascot } from "../components/ScuttleMascot";
import { AtmosphericDust } from "../components/AtmosphericDust";

export const Seq6Resolution: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Screen split at local frame 270 (global 4290):
  // 0 - 270: Feature 9 (Cross-Platform Clients 3D Fan-out)
  // 270 - 540: Feature 10 (Final Master Lockup Assembly & Animated Domain Capsule)
  const isFinalLockup = frame >= 270;

  // Master Lockup Spring Entrance (frame 270)
  const lockupSpring = spring({
    frame: Math.max(0, frame - 270),
    fps,
    config: { damping: 24, stiffness: 180, mass: 1 },
  });
  const lockupScale = interpolate(lockupSpring, [0, 1], [0.88, 1.0]);
  const lockupOpacity = interpolate(lockupSpring, [0, 0.4], [0, 1]);

  // Geometric Rule Lines drawing outward from logo (frames 290 - 370)
  const lineProgress = spring({
    frame: Math.max(0, frame - 290),
    fps,
    config: { damping: 20, stiffness: 160, mass: 0.9 },
  });
  const lineLength = interpolate(lineProgress, [0, 1], [0, 260]);

  // Specular sheen sweep across final logo (frames 310 - 390)
  const sheenX = interpolate(frame, [310, 390], [-150, 250], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Clean Exponential Harmonic Resolve on very last frames (470 - 538)
  const resolveFade = interpolate(frame, [470, 538], [0, 1], {
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

      {/* Atmospheric Micro-Particles */}
      <AtmosphericDust particleCount={24} />

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
                fontWeight: 800,
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
                fontSize: 48,
                fontWeight: 900,
                color: "#ffffff",
                letterSpacing: -1.2,
                textShadow: "0 4px 25px rgba(0, 0, 0, 0.95)",
              }}
            >
              BUILT FOR EVERY WORKSTATION
            </div>
            <TypewriterText
              text="Runs natively on macOS, Windows, and the Web."
              startFrame={10}
              charsPerSecond={26}
              fontSize={20}
              fontWeight={700}
              color="#ffffff"
              side="left"
              enableZoomShiftTracking={true}
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
              fanDuration={60}
              convergeStartFrame={120}
              convergeDuration={80}
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
              fontSize: 104,
              fontWeight: 900,
              color: "#ffffff",
              letterSpacing: -2,
              textShadow: "0 6px 40px rgba(0, 0, 0, 0.95)",
            }}
          >
            Lets Larp
          </div>

          {/* Live Typewriter Final Signoff with Active Center Tracking */}
          <TypewriterText
            text="Stop applying manually. Lets Larp."
            startFrame={285}
            charsPerSecond={24}
            fontSize={22}
            fontWeight={700}
            color="#ffffff"
            side="center"
            enableZoomShiftTracking={true}
            style={{ marginTop: 12 }}
          />

          {/* Animated Interactive Domain Capsule: getitslarp.vercel.app */}
          {(() => {
            const pillSheenX = interpolate(frame, [320, 420], [-120, 360], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const pingScale = interpolate(
              (frame % 45),
              [0, 44],
              [1, 2.4],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );
            const pingOpacity = interpolate(
              (frame % 45),
              [0, 20, 44],
              [0.8, 0.4, 0],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );

            return (
              <div
                style={{
                  position: "relative",
                  marginTop: 26,
                  padding: "12px 28px",
                  borderRadius: 100,
                  backgroundColor: "rgba(10, 10, 10, 0.85)",
                  border: "1px solid rgba(16, 185, 129, 0.4)",
                  backdropFilter: "blur(16px)",
                  boxShadow: "0 12px 40px rgba(0, 0, 0, 0.8), 0 0 30px rgba(16, 185, 129, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  overflow: "hidden",
                }}
              >
                {/* Live Emerald Ping Beacon */}
                <div style={{ position: "relative", width: 10, height: 10 }}>
                  <div
                    style={{
                      position: "absolute",
                      inset: -4,
                      borderRadius: "50%",
                      backgroundColor: THEME.colors.accentEmerald,
                      opacity: pingOpacity,
                      transform: `scale(${pingScale})`,
                      pointerEvents: "none",
                    }}
                  />
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      backgroundColor: THEME.colors.accentEmerald,
                      boxShadow: "0 0 10px #10b981",
                    }}
                  />
                </div>

                {/* Animated Character Reveal for Domain with Active Zoom Tracking */}
                <div style={{ display: "flex", alignItems: "center" }}>
                  <TypewriterText
                    text="getitslarp.vercel.app"
                    startFrame={300}
                    charsPerSecond={26}
                    fontSize={22}
                    fontWeight={800}
                    color="#ffffff"
                    side="center"
                    enableZoomShiftTracking={true}
                    style={{ fontFamily: THEME.fonts.mono, letterSpacing: 2 }}
                  />
                </div>

                {/* Lucide-style Semantic Arrow Up Right Vector Icon */}
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={THEME.colors.accentEmerald}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ display: "block", marginLeft: 4 }}
                >
                  <line x1="7" y1="17" x2="17" y2="7" />
                  <polyline points="7 7 17 7 17 17" />
                </svg>

                {/* Specular Sheen Light Sweep Across Capsule */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    width: 50,
                    background:
                      "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.35), transparent)",
                    transform: `translateX(${pillSheenX}px) skewX(-25deg)`,
                    pointerEvents: "none",
                  }}
                />
              </div>
            );
          })()}

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
