import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Img, staticFile } from "remotion";
import { THEME } from "../theme";
import { CinematicFrame } from "../components/CinematicFrame";
import { CameraZoomShift } from "../components/CameraZoomShift";
import { EditorialSplitStage } from "../components/EditorialSplitStage";

export const Seq2Command: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Screen split at local frame 360 (6.0s for Feature 1, 6.0s for Feature 2):
  // 0 - 360: Feature 1 (Dashboard) with LEFT text card & RIGHT zooming image
  // 360 - 720: Feature 2 (Career DNA) with RIGHT text card & LEFT zooming image
  const isCareerDnaActive = frame >= 360;

  // Transition #10: Venetian Blinds Outro at frames 680 - 720
  const blindsProgress = spring({
    frame: Math.max(0, frame - 680),
    fps,
    config: { damping: 24, stiffness: 190, mass: 1 },
  });
  const blindsAngle = interpolate(blindsProgress, [0, 1], [0, 90]);

  // Transition: Diagonal Laser Split Wipe between Feature 1 and Feature 2 (Frames 345 - 370)
  const isTransition1to2 = frame >= 345 && frame <= 370;
  const diagProgress = interpolate(frame, [345, 370], [0, 1], {
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

      {/* Feature 1: Command Center (Frames 0 - 360) */}
      {!isCareerDnaActive ? (
        <EditorialSplitStage
          side="left"
          badge="01 / COMMAND CENTER"
          badgeColor={THEME.colors.accentEmerald}
          title="AUTONOMOUS BOT WORKSPACE"
          description="Stop tweaking resumes just to get ghosted. Meet itsLARP: your real-time autonomous bot command center."
          startFrame={10}
          metrics={[
            { label: "BOTS CONFIGURED", value: "1,000", color: THEME.colors.accentEmerald },
            { label: "ATS READINESS", value: "99.4%", color: THEME.colors.ink },
            { label: "PIPELINE HEALTH", value: "OPTIMAL", color: THEME.colors.accentEmerald },
          ]}
          mascotConfig={{
            dialogue: "Telemetry nominal.",
            scale: 0.65,
          }}
        >
          <CameraZoomShift
            durationInFrames={360}
            fromScale={1.0}
            toScale={1.14}
            fromX={10}
            toX={-30}
            fromY={0}
            toY={-15}
            fromRotateX={3}
            toRotateX={0}
            fromRotateY={-4}
            toRotateY={1}
          >
            <CinematicFrame
              width={1180}
              height={700}
              ambientGlowColor="rgba(16, 185, 129, 0.25)"
              title="itslarp.app — Executive Command Center & Active Bots"
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
            </CinematicFrame>
          </CameraZoomShift>
        </EditorialSplitStage>
      ) : (
        /* Feature 2: Career DNA Graph (Frames 360 - 720) */
        <EditorialSplitStage
          side="right"
          badge="02 / CAREER DNA GRAPH"
          badgeColor={THEME.colors.accentAmber}
          title="VERIFIED SKILL EXTRACTION"
          description="It extracts your real work into a verified engineering skill graph with deep multi-modal competency clusters."
          startFrame={370}
          metrics={[
            { label: "AI SYSTEMS", value: "98% MATCH", color: THEME.colors.accentEmerald },
            { label: "VECTOR GRAPH", value: "VERIFIED", color: THEME.colors.accentAmber },
            { label: "COMPETENCY TIERS", value: "STAFF LEVEL", color: THEME.colors.ink },
          ]}
          mascotConfig={{
            dialogue: "Extracting superpowers.",
            scale: 0.65,
          }}
        >
          <CameraZoomShift
            durationInFrames={360}
            fromScale={1.02}
            toScale={1.16}
            fromX={-20}
            toX={20}
            fromY={10}
            toY={-20}
            fromRotateX={-2}
            toRotateX={2}
            fromRotateY={3}
            toRotateY={-2}
          >
            <CinematicFrame
              width={1180}
              height={700}
              ambientGlowColor="rgba(245, 158, 11, 0.25)"
              title="itslarp.app — Dynamic Career DNA & Profile Intelligence"
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
            </CinematicFrame>
          </CameraZoomShift>
        </EditorialSplitStage>
      )}

      {/* Transition: Feature 1 -> Feature 2 Diagonal Laser Split Wipe (Frames 345 - 370) */}
      {isTransition1to2 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 70,
            pointerEvents: "none",
            overflow: "hidden",
          }}
        >
          {/* Laser Wipe Beam Sweep */}
          <div
            style={{
              position: "absolute",
              top: -200,
              bottom: -200,
              width: 5,
              backgroundColor: "#ffffff",
              boxShadow: `0 0 35px 12px ${THEME.colors.accentAmber}, 0 0 90px 25px #ffffff`,
              left: `${diagProgress * 120 - 10}%`,
              transform: "skewX(-20deg)",
            }}
          />
          {/* Specular Flash at midpoint (frame 360) */}
          {frame >= 358 && frame <= 362 && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundColor: "#ffffff",
                opacity: 0.3,
              }}
            />
          )}
        </div>
      )}

      {/* Transition #10: Venetian Blinds Transition Slat Overlay (Frames 680 - 720) */}
      {frame >= 680 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            zIndex: 60,
            pointerEvents: "none",
          }}
        >
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              style={{
                flex: 1,
                backgroundColor: THEME.colors.bg,
                transform: `rotateX(${blindsAngle}deg)`,
                transformOrigin: "top center",
                borderBottom: "1px solid rgba(255, 255, 255, 0.15)",
                backfaceVisibility: "hidden",
              }}
            />
          ))}
        </div>
      )}
    </AbsoluteFill>
  );
};
