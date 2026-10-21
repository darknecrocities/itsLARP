import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Img, staticFile } from "remotion";
import { THEME } from "../theme";
import { CinematicFrame } from "../components/CinematicFrame";
import { KineticText } from "../components/KineticText";
import { PerspectiveCard } from "../components/PerspectiveCard";

export const Seq6Resolution: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Switch to Final Brand Lockup at local frame 210 (3.5s)
  const isFinalLockup = frame >= 210;
  const lockupEntrance = spring({
    frame: Math.max(0, frame - 210),
    fps,
    config: THEME.springs.snappy,
  });

  // Final outro clean fade to black on the very last 15 frames (3585-3599)
  const finalFade = interpolate(frame, [435, 450], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: THEME.colors.bg, overflow: "hidden" }}>
      {!isFinalLockup ? (
        /* Part A: Cross-Platform Desktop Showcase */
        <div style={{ position: "absolute", inset: 0 }}>
          <div
            style={{
              position: "absolute",
              top: 50,
              left: 100,
              zIndex: 10,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <KineticText
              text="06 / HARDWARE & CLIENTS"
              fontSize={15}
              tracking={4}
              weight={700}
              color={THEME.colors.accentEmerald}
              fontFamily={THEME.fonts.mono}
              mode="line"
            />
            <KineticText
              text="BUILT FOR EVERY WORKSTATION"
              fontSize={40}
              tracking={-1}
              weight={800}
              color={THEME.colors.ink}
              mode="word"
            />
          </div>

          <PerspectiveCard
            initialRotateX={8}
            initialRotateY={-4}
            targetRotateX={0}
            targetRotateY={0}
            initialScale={0.9}
            targetScale={1.0}
            duration={210}
            style={{ marginTop: 50 }}
          >
            <CinematicFrame
              width={1540}
              height={840}
              title="itslarp.app — Cross-Platform Client for macOS, Windows & Web"
            >
              <Img
                src={staticFile("images/download.png")}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "top left",
                }}
              />
            </CinematicFrame>
          </PerspectiveCard>
        </div>
      ) : (
        /* Part B: Premium Monochromatic Final Brand Lockup */
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 28,
            zIndex: 20,
            transform: `scale(${interpolate(lockupEntrance, [0, 1], [0.92, 1.0])})`,
            opacity: interpolate(lockupEntrance, [0, 0.4], [0, 1]),
          }}
        >
          {/* Official App Logo */}
          <div
            style={{
              padding: 18,
              borderRadius: 28,
              backgroundColor: "rgba(255, 255, 255, 0.06)",
              border: `1px solid ${THEME.colors.borderLight}`,
              boxShadow: "0 30px 80px rgba(0, 0, 0, 0.9)",
            }}
          >
            <Img
              src={staticFile("images/applogo.png")}
              style={{
                width: 140,
                height: 140,
                objectFit: "contain",
                filter: "drop-shadow(0 0 30px rgba(255, 255, 255, 0.35))",
              }}
            />
          </div>

          {/* Master Tagline */}
          <div
            style={{
              fontFamily: THEME.fonts.display,
              fontSize: 108,
              fontWeight: 800,
              color: THEME.colors.ink,
              letterSpacing: -2,
              lineHeight: 1,
            }}
          >
            Lets Larp
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontFamily: THEME.fonts.mono,
              fontSize: 18,
              color: THEME.colors.inkMuted,
              letterSpacing: 4,
              textTransform: "uppercase",
            }}
          >
            Autonomous AI Career Operating System
          </div>

          {/* CTA URL */}
          <div
            style={{
              marginTop: 12,
              padding: "12px 32px",
              borderRadius: 40,
              backgroundColor: "#ffffff",
              color: "#000000",
              fontFamily: THEME.fonts.mono,
              fontSize: 18,
              fontWeight: 800,
              letterSpacing: 1,
              boxShadow: "0 10px 40px rgba(255, 255, 255, 0.2)",
            }}
          >
            itslarp.app
          </div>
        </div>
      )}

      {/* Frame 3599 Absolute Zero Black Outro */}
      {finalFade > 0.01 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "#000000",
            opacity: finalFade,
            zIndex: 99,
          }}
        />
      )}
    </AbsoluteFill>
  );
};
