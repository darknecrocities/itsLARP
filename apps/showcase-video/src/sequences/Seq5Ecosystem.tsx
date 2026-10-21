import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Video, Img, staticFile } from "remotion";
import { THEME } from "../theme";
import { CinematicFrame } from "../components/CinematicFrame";
import { KineticText } from "../components/KineticText";
import { PerspectiveCard } from "../components/PerspectiveCard";
import { ScuttleMascot } from "../components/ScuttleMascot";
import { BeatPulse } from "../components/BeatPulse";

export const Seq5Ecosystem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Snapping beats aligned with musical accents (local frames at 60 FPS)
  const snapBeats = [60, 147, 234, 321, 408];

  // Screen shift at frame 240 (from Notion demo video to application Kanban track)
  const isApplicationTrack = frame >= 240;
  const swapProgress = spring({
    frame: Math.max(0, frame - 240),
    fps,
    config: THEME.springs.snappy,
  });

  return (
    <AbsoluteFill style={{ backgroundColor: THEME.colors.bg, overflow: "hidden" }}>
      <BeatPulse hitFrames={snapBeats}>
        {/* Header HUD */}
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 80,
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <KineticText
            text="05 / LIVE PIPELINE & ECOSYSTEM"
            fontSize={15}
            tracking={4}
            weight={700}
            color={THEME.colors.accentPurple}
            fontFamily={THEME.fonts.mono}
            mode="line"
          />
          <KineticText
            text={!isApplicationTrack ? "BI-DIRECTIONAL NOTION SYNC" : "REAL-TIME INTERVIEW PIPELINE"}
            fontSize={40}
            tracking={-1}
            weight={800}
            color={THEME.colors.ink}
            mode="word"
          />
        </div>

        {/* 3D Viewport Hardware Stage */}
        <PerspectiveCard
          initialRotateX={4}
          initialRotateY={-6}
          targetRotateX={0}
          targetRotateY={0}
          initialScale={0.9}
          targetScale={1.0}
          duration={480}
          style={{ marginTop: 50 }}
        >
          <CinematicFrame
            width={1540}
            height={840}
            title={
              !isApplicationTrack
                ? "Notion Workspace — Live 2-Way Synchronized Database"
                : "itslarp.app — Application Pipeline & Recruiter Conversion Tracking"
            }
          >
            {/* View 1: Notion Demo Video */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                opacity: interpolate(swapProgress, [0, 0.4], [1, 0]),
                transform: `scale(${interpolate(swapProgress, [0, 1], [1, 0.95])})`,
              }}
            >
              <Video
                src={staticFile("videos/notion-pipeline-demo.mp4")}
                startFrom={0}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 24,
                  left: 24,
                  padding: "8px 16px",
                  backgroundColor: "rgba(0, 0, 0, 0.8)",
                  border: `1px solid ${THEME.colors.border}`,
                  borderRadius: 8,
                  fontFamily: THEME.fonts.mono,
                  fontSize: 12,
                  color: THEME.colors.ink,
                }}
              >
                ● 2-WAY NOTION SYNC · REAL-TIME STAGE UPDATES
              </div>
            </div>

            {/* View 2: Application Track Kanban */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                opacity: interpolate(swapProgress, [0.3, 1], [0, 1]),
                transform: `scale(${interpolate(swapProgress, [0, 1], [1.05, 1])})`,
              }}
            >
              <Img
                src={staticFile("images/application_track.png")}
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

        {/* Authentic 2D Scuttle Mascot Peeking in on the bottom-right */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            right: 40,
            zIndex: 30,
          }}
        >
          <ScuttleMascot
            dialogue="Snip through the noise."
            snapBeats={[80, 160, 240, 320, 400]}
          />
        </div>

        {/* Bottom Feature Pill */}
        <div
          style={{
            position: "absolute",
            bottom: 30,
            left: 80,
            zIndex: 10,
          }}
        >
          <div
            style={{
              padding: "10px 20px",
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              border: `1px solid ${THEME.colors.borderLight}`,
              borderRadius: 30,
              fontFamily: THEME.fonts.mono,
              fontSize: 13,
              color: THEME.colors.inkMuted,
            }}
          >
            ● NATIVE OS ALERTS ON INTERVIEWS & OFFERS · ZERO SPAM
          </div>
        </div>
      </BeatPulse>
    </AbsoluteFill>
  );
};
