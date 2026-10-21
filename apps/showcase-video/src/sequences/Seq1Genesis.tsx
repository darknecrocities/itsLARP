import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { THEME } from "../theme";
import { ApertureIntro } from "../components/ApertureIntro";
import { TypewriterText } from "../components/TypewriterText";
import { ShutterBladeWipe } from "../components/ShutterBladeWipe";
import { ScuttleMascot } from "../components/ScuttleMascot";

export const Seq1Genesis: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Subtle camera drift backward during intro (no pulse, pure dimensional drift)
  const driftScale = interpolate(frame, [0, 348], [1.04, 1.0], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: THEME.colors.bg,
        overflow: "hidden",
        transform: `scale(${driftScale})`,
      }}
    >
      <ShutterBladeWipe slatCount={8} triggerFrame={290} durationInFrames={58} direction="horizontal">
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Transitions #1 & #2: Aperture Iris & 3D Logo Perspective Lock */}
          <ApertureIntro />

          {/* Omnipresent Scuttle Mascot: Feature 0 (Hook) peeking top-right */}
          {frame >= 30 && (
            <div style={{ position: "absolute", top: 40, right: 80, zIndex: 40 }}>
              <ScuttleMascot
                dialogue="Systems armed."
                scale={0.55}
                disableEntrance
                snapBeats={[60, 120, 180]}
              />
            </div>
          )}

          {/* Transition #3: Typewriter Tagline & Category Reveal */}
          <div
            style={{
              position: "absolute",
              bottom: 110,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 14,
              zIndex: 30,
            }}
          >
            {/* Top kicker */}
            <div
              style={{
                fontFamily: THEME.fonts.mono,
                fontSize: 14,
                fontWeight: 800,
                color: THEME.colors.accentEmerald,
                letterSpacing: 6,
                textTransform: "uppercase",
              }}
            >
              AUTONOMOUS CAREER OPERATING SYSTEM
            </div>

            {/* Hero Tagline: "Lets Larp" */}
            <div
              style={{
                fontFamily: THEME.fonts.display,
                fontSize: 108,
                fontWeight: 900,
                color: "#ffffff",
                letterSpacing: -2,
                lineHeight: 1.0,
                textShadow: "0 6px 30px rgba(0, 0, 0, 0.9)",
              }}
            >
              Lets Larp
            </div>

            {/* Live Typewriter Hook (Pure Bold High-Contrast Text) */}
            <TypewriterText
              text="Let's be real. Job hunting is completely broken."
              startFrame={30}
              charsPerSecond={24}
              fontSize={20}
              fontWeight={700}
              color="#ffffff"
            />
          </div>
        </AbsoluteFill>
      </ShutterBladeWipe>
    </AbsoluteFill>
  );
};
