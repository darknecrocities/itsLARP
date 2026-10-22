import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Video, Img, staticFile } from "remotion";
import { THEME } from "../theme";
import { CinematicFrame } from "../components/CinematicFrame";
import { CameraZoomShift } from "../components/CameraZoomShift";
import { EditorialSplitStage } from "../components/EditorialSplitStage";

export const Seq5Ecosystem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Screen split at local frame 390 (global 3690):
  // 0 - 390: Feature 7 (Kanban Tracking) with LEFT card & RIGHT zooming Kanban image
  // 390 - 720: Feature 8 (Notion 2-Way Sync) with RIGHT card & LEFT zooming Notion video
  const isNotionActive = frame >= 390;

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

      {/* Feature 7: Kanban Application Tracker (Frames 0 - 390) */}
      {!isNotionActive ? (
        <EditorialSplitStage
          side="left"
          badge="07 / KANBAN PIPELINE"
          badgeColor={THEME.colors.accentPurple}
          title="REAL-TIME RECRUITER TRACKING"
          description="Every stage tracks live in your Kanban pipeline, moving seamlessly toward interviews."
          startFrame={10}
          metrics={[
            { label: "APPLIED STAGE", value: "428 TRACKED", color: THEME.colors.ink },
            { label: "IN REVIEW", value: "64 JOBS", color: THEME.colors.accentAmber },
            { label: "INTERVIEWS", value: "18 SCHEDULED", color: THEME.colors.accentEmerald },
          ]}
          mascotConfig={{
            dialogue: "Interview unlocked!",
            scale: 0.65,
          }}
        >
          <CameraZoomShift
            durationInFrames={390}
            fromScale={1.0}
            toScale={1.14}
            fromX={10}
            toX={-25}
            fromY={0}
            toY={-15}
          >
            <CinematicFrame
              width={1180}
              height={700}
              ambientGlowColor="rgba(168, 85, 247, 0.25)"
              title="itslarp.app — Application Pipeline & Conversion Analytics"
            >
              <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
                <Img
                  src={staticFile("images/application_track.png")}
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top left" }}
                />
              </div>
            </CinematicFrame>
          </CameraZoomShift>
        </EditorialSplitStage>
      ) : (
        /* Feature 8: Notion 2-Way Synchronized Database (Frames 390 - 720) */
        <EditorialSplitStage
          side="right"
          badge="08 / 2-WAY NOTION SYNC"
          badgeColor={THEME.colors.accentPurple}
          title="WORKSPACE SYNCHRONIZATION"
          description="And syncs bi-directionally to your Notion workspace in under twelve milliseconds."
          startFrame={395}
          metrics={[
            { label: "NOTION INTEGRATION", value: "OFFICIAL V2", color: THEME.colors.accentPurple },
            { label: "SYNC LATENCY", value: "< 12ms", color: THEME.colors.accentEmerald },
            { label: "DATABASE PROPERTIES", value: "100% MAPPED", color: THEME.colors.ink },
          ]}
          mascotConfig={{
            dialogue: "Synced in < 12ms.",
            scale: 0.65,
          }}
        >
          <CameraZoomShift
            durationInFrames={330}
            fromScale={1.0}
            toScale={1.12}
            fromX={-15}
            toX={15}
            fromY={10}
            toY={-10}
          >
            <CinematicFrame
              width={1180}
              height={700}
              ambientGlowColor="rgba(168, 85, 247, 0.25)"
              title="Notion Workspace — Live 2-Way Synchronized Job Tracker"
            >
              <div style={{ position: "relative", width: "100%", height: "100%" }}>
                <Video
                  src={staticFile("videos/notion-pipeline-demo.mp4")}
                  startFrom={0}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: 20,
                    left: 20,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    backgroundColor: "rgba(0, 0, 0, 0.85)",
                    padding: "8px 16px",
                    borderRadius: 8,
                    border: `1px solid ${THEME.colors.borderLight}`,
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
                  <span style={{ fontFamily: THEME.fonts.mono, fontSize: 11, color: THEME.colors.ink }}>
                    NOTION API V2 · WEBHOOK ACTIVE
                  </span>
                </div>
              </div>
            </CinematicFrame>
          </CameraZoomShift>
        </EditorialSplitStage>
      )}

      {/* Transition: Feature 7 -> Feature 8 High-Speed Scanline Laser Sweep (Frames 375 - 395) */}
      {frame >= 375 && frame <= 395 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 70,
            pointerEvents: "none",
            overflow: "hidden",
          }}
        >
          {(() => {
            const scanProg = interpolate(frame, [375, 395], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return (
              <>
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: `${scanProg * 100}%`,
                    height: 4,
                    backgroundColor: "#ffffff",
                    boxShadow: `0 0 30px 10px ${THEME.colors.accentPurple}, 0 0 60px 20px #ffffff`,
                  }}
                />
                {frame >= 383 && frame <= 387 && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      backgroundColor: THEME.colors.accentPurple,
                      opacity: 0.2,
                    }}
                  />
                )}
              </>
            );
          })()}
        </div>
      )}

      {/* Transition: Feature 8 -> Feature 9 Optical Flash & Shutter Outro (Frames 695 - 720) */}
      {frame >= 695 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "#000000",
            opacity: interpolate(frame, [695, 720], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            zIndex: 75,
            pointerEvents: "none",
          }}
        />
      )}
    </AbsoluteFill>
  );
};
