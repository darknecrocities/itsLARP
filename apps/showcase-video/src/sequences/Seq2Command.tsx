import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Img, staticFile } from "remotion";
import { THEME } from "../theme";
import { CinematicFrame } from "../components/CinematicFrame";
import { KineticText } from "../components/KineticText";
import { PerspectiveCard } from "../components/PerspectiveCard";
import { BeatPulse } from "../components/BeatPulse";

export const Seq2Command: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Beat pulses at local frames 0, 108, 144, 366
  const hitFrames = [0, 108, 144, 366];

  // Screen swap at local frame 250
  const isSecondScreen = frame >= 250;
  const swapProgress = spring({
    frame: Math.max(0, frame - 250),
    fps,
    config: THEME.springs.snappy,
  });

  return (
    <AbsoluteFill style={{ backgroundColor: THEME.colors.bg, overflow: "hidden" }}>
      <BeatPulse hitFrames={hitFrames}>
        {/* Background typographic watermark */}
        <div
          style={{
            position: "absolute",
            top: 60,
            left: 100,
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <KineticText
            text={!isSecondScreen ? "01 / COMMAND CENTER" : "02 / CAREER DNA"}
            fontSize={16}
            tracking={4}
            weight={700}
            color={THEME.colors.accentEmerald}
            fontFamily={THEME.fonts.mono}
            mode="line"
          />
          <KineticText
            text={!isSecondScreen ? "AUTONOMOUS CAREER OS" : "DEEP PROFILE EXTRACTION"}
            fontSize={42}
            tracking={-1}
            weight={800}
            color={THEME.colors.ink}
            mode="word"
          />
        </div>

        {/* 3D Perspective Hardware Stage */}
        <PerspectiveCard
          initialRotateX={10}
          initialRotateY={-8}
          targetRotateX={2}
          targetRotateY={4}
          initialScale={0.88}
          targetScale={1.02}
          duration={500}
          style={{ marginTop: 60 }}
        >
          <CinematicFrame
            width={1540}
            height={840}
            title={!isSecondScreen ? "itslarp.app — Executive Command Center" : "itslarp.app — Dynamic Career DNA & Skill Matrix"}
          >
            {/* Screen 1: Dashboard */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                opacity: interpolate(swapProgress, [0, 0.4], [1, 0]),
                transform: `translateX(${interpolate(swapProgress, [0, 1], [0, -120])}px)`,
              }}
            >
              <Img
                src={staticFile("images/dashboard.png")}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "top left",
                }}
              />
            </div>

            {/* Screen 2: Career DNA */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                opacity: interpolate(swapProgress, [0.3, 1], [0, 1]),
                transform: `translateX(${interpolate(swapProgress, [0, 1], [120, 0])}px)`,
              }}
            >
              <Img
                src={staticFile("images/career_dna.png")}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "top left",
                }}
              />
            </div>
          </CinematicFrame>
        </PerspectiveCard>

        {/* Bottom Feature Pill Callouts */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            left: 100,
            right: 100,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            zIndex: 10,
          }}
        >
          <div
            style={{
              padding: "10px 20px",
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              backdropFilter: "blur(12px)",
              border: `1px solid ${THEME.colors.borderLight}`,
              borderRadius: 30,
              fontFamily: THEME.fonts.mono,
              fontSize: 13,
              color: THEME.colors.inkMuted,
            }}
          >
            {!isSecondScreen ? "● LIVE TELEMETRY: 1,000 BOTS READY" : "● AUTO-EXTRACT: RESUME & LINKEDIN INGESTION"}
          </div>

          <div
            style={{
              padding: "10px 20px",
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              backdropFilter: "blur(12px)",
              border: `1px solid ${THEME.colors.borderLight}`,
              borderRadius: 30,
              fontFamily: THEME.fonts.mono,
              fontSize: 13,
              color: THEME.colors.accentEmerald,
              fontWeight: 700,
            }}
          >
            {!isSecondScreen ? "94% INTERVIEW MATCH SCORE" : "VERIFIED SKILL GRAPH VALIDATED"}
          </div>
        </div>
      </BeatPulse>
    </AbsoluteFill>
  );
};
