import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Video, Img, staticFile } from "remotion";
import { THEME } from "../theme";
import { CinematicFrame } from "../components/CinematicFrame";
import { MaskedSlideText } from "../components/MaskedSlideText";
import { MascotMotionRail } from "../components/MascotMotionRail";

export const Seq5Ecosystem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Sequence breakdown across 480 frames:
  // 0 - 120: Transition #30 Kanban Column Cascade (application_track.png)
  // 120 - 270: Transitions #31 & #32 Bi-Directional Drawer Slide & Notion Video (notion-pipeline-demo.mp4)
  // 270 - 480: Transitions #33 & #34 Scuttle Mascot Rail Glide & Scissor Snip

  // Transition #30: Kanban Column Cascade (staggered vertical drop)
  const colCascade1 = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 200, mass: 0.9 },
  });
  const colCascade2 = spring({
    frame: Math.max(0, frame - 25),
    fps,
    config: { damping: 20, stiffness: 200, mass: 0.9 },
  });
  const colCascade3 = spring({
    frame: Math.max(0, frame - 50),
    fps,
    config: { damping: 20, stiffness: 200, mass: 0.9 },
  });

  // Transition #31: Bi-Directional Drawer Slide at frame 120
  const drawerProgress = spring({
    frame: Math.max(0, frame - 120),
    fps,
    config: { damping: 24, stiffness: 180, mass: 1 },
  });
  const drawerLeftX = interpolate(drawerProgress, [0, 1], [0, -100]);
  const drawerRightX = interpolate(drawerProgress, [0, 1], [100, 0]);

  // Section switcher
  const isNotionSync = frame >= 120;

  return (
    <AbsoluteFill style={{ backgroundColor: THEME.colors.bg, overflow: "hidden" }}>
      {/* Blueprint Grid */}
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

      {/* Header HUD */}
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
          text={!isNotionSync ? "05 / KANBAN PIPELINE" : "05 / 2-WAY NOTION ECOSYSTEM"}
          direction="left"
          delay={10}
          fontSize={15}
          tracking={4}
          fontWeight={700}
          color={THEME.colors.accentPurple}
          fontFamily={THEME.fonts.mono}
        />
        <MaskedSlideText
          text={!isNotionSync ? "REAL-TIME APPLICATION TRACKING" : "BIDIRECTIONAL WORKSPACE SYNC"}
          direction="up"
          delay={25}
          fontSize={40}
          tracking={-1}
          fontWeight={800}
          color={THEME.colors.ink}
        />
      </div>

      {/* Main Stage Viewport */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ marginTop: 55, position: "relative" }}>
          {!isNotionSync ? (
            /* Stage 1: Kanban Pipeline Cascade (Frames 0 - 120) */
            <CinematicFrame
              width={1540}
              height={840}
              title="itslarp.app — Application Pipeline & Conversion Analytics"
            >
              <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
                <Img
                  src={staticFile("images/application_track.png")}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "top left",
                  }}
                />

                {/* Staggered Column Cascade Indicator Overlays */}
                <div
                  style={{
                    position: "absolute",
                    top: 20,
                    right: 30,
                    display: "flex",
                    gap: 16,
                    zIndex: 20,
                  }}
                >
                  <div
                    style={{
                      transform: `translateY(${interpolate(colCascade1, [0, 1], [-40, 0])}px)`,
                      opacity: interpolate(colCascade1, [0, 1], [0, 1]),
                      backgroundColor: "rgba(0, 0, 0, 0.85)",
                      border: `1px solid ${THEME.colors.borderLight}`,
                      padding: "8px 16px",
                      borderRadius: 8,
                      fontFamily: THEME.fonts.mono,
                      fontSize: 12,
                      color: THEME.colors.ink,
                    }}
                  >
                    Stage 1: APPLIED (428)
                  </div>
                  <div
                    style={{
                      transform: `translateY(${interpolate(colCascade2, [0, 1], [-40, 0])}px)`,
                      opacity: interpolate(colCascade2, [0, 1], [0, 1]),
                      backgroundColor: "rgba(0, 0, 0, 0.85)",
                      border: `1px solid ${THEME.colors.borderLight}`,
                      padding: "8px 16px",
                      borderRadius: 8,
                      fontFamily: THEME.fonts.mono,
                      fontSize: 12,
                      color: THEME.colors.accentAmber,
                    }}
                  >
                    Stage 2: IN REVIEW (64)
                  </div>
                  <div
                    style={{
                      transform: `translateY(${interpolate(colCascade3, [0, 1], [-40, 0])}px)`,
                      opacity: interpolate(colCascade3, [0, 1], [0, 1]),
                      backgroundColor: "rgba(0, 0, 0, 0.85)",
                      border: "1px solid rgba(16, 185, 129, 0.4)",
                      padding: "8px 16px",
                      borderRadius: 8,
                      fontFamily: THEME.fonts.mono,
                      fontSize: 12,
                      color: THEME.colors.accentEmerald,
                    }}
                  >
                    Stage 3: INTERVIEW (18)
                  </div>
                </div>
              </div>
            </CinematicFrame>
          ) : (
            /* Stage 2: Notion Video Reveal (Frames 120 - 480) */
            <div style={{ transform: `translateX(${drawerRightX}px)` }}>
              <CinematicFrame
                width={1540}
                height={840}
                title="Notion Workspace — Live 2-Way Synchronized Job Tracker"
              >
                <div style={{ position: "relative", width: "100%", height: "100%" }}>
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
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      backgroundColor: "rgba(0, 0, 0, 0.85)",
                      padding: "8px 16px",
                      borderRadius: 8,
                      border: `1px solid ${THEME.colors.borderLight}`,
                      zIndex: 10,
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: THEME.colors.accentPurple,
                        boxShadow: `0 0 10px ${THEME.colors.accentPurple}`,
                      }}
                    />
                    <span
                      style={{
                        fontFamily: THEME.fonts.mono,
                        fontSize: 12,
                        color: THEME.colors.ink,
                      }}
                    >
                      NOTION API V2 · ZERO-LATENCY WEBHOOK SYNC
                    </span>
                  </div>
                </div>
              </CinematicFrame>
            </div>
          )}
        </div>
      </div>

      {/* Transitions #33 & #34: Scuttle Mascot Kinetic Rail Glide & Scissor Snip (Frames 260 - 480) */}
      {frame >= 260 && (
        <MascotMotionRail
          dialogue="Snip through the noise."
          snapBeats={[20, 80, 140, 190]}
          railFromX={500}
          railToX={-30}
          durationInFrames={220}
        />
      )}
    </AbsoluteFill>
  );
};
