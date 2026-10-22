import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Video, Img, staticFile } from "remotion";
import { THEME } from "../theme";
import { CinematicFrame } from "../components/CinematicFrame";
import { CameraZoomShift } from "../components/CameraZoomShift";
import { EditorialSplitStage } from "../components/EditorialSplitStage";
import { RollingCounter } from "../components/RollingCounter";

export const Seq4TheDrop: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Screen split at local frame 516 (global 2760):
  // 0 - 516: Feature 5 (Swarm Drop) with LEFT card & RIGHT zooming swarm video
  // 516 - 1056: Feature 6 (Guardrails) with RIGHT card & LEFT zooming guardrail image
  const isGuardrailsActive = frame >= 516;

  // Climax drop snap at frame 0 (global 2244)
  const dropSnap = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 240, mass: 0.8 },
  });
  const dropScale = interpolate(dropSnap, [0, 1], [1.14, 1.0]);

  // Circular aperture mask for guardrails image (frames 516 - 560)
  const apertureRadius = interpolate(frame, [516, 560], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: THEME.colors.bg,
        overflow: "hidden",
        transform: `scale(${dropScale})`,
      }}
    >
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

      {/* Feature 5: Workforce Swarm Live Video (Frames 0 - 516) */}
      {!isGuardrailsActive ? (
        <EditorialSplitStage
          side="left"
          badge="05 / WORKFORCE SWARM"
          badgeColor={THEME.colors.accentEmerald}
          title="1,000 AUTONOMOUS AGENTS"
          description="A thousand autonomous bots running in parallel. Scouring listings, tailoring payloads, and submitting."
          startFrame={10}
          metrics={[
            { label: "PARALLEL WORKERS", value: "1,000 ACTIVE", color: THEME.colors.accentEmerald },
            { label: "ATS RESOLUTION", value: "DYNAMIC", color: THEME.colors.ink },
            { label: "LATENCY PER SUBMISSION", value: "1.2s", color: THEME.colors.accentAmber },
          ]}
          mascotConfig={{
            dialogue: "1,000 bots deployed. Go!",
            scale: 0.65,
          }}
        >
          <CameraZoomShift
            durationInFrames={516}
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
              ambientGlowColor="rgba(16, 185, 129, 0.25)"
              title="itslarp.app — Workforce Swarm Dispatch & Real-Time Automation"
            >
              <div style={{ position: "relative", width: "100%", height: "100%" }}>
                <Video
                  src={staticFile("videos/workforce-swarm-demo.mp4")}
                  startFrom={0}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />

                {/* Live Rolling Digit Counter Card overlay */}
                <div
                  style={{
                    position: "absolute",
                    top: 24,
                    left: 24,
                    padding: "10px 20px",
                    backgroundColor: "rgba(0, 0, 0, 0.85)",
                    border: `1px solid ${THEME.colors.borderLight}`,
                    borderRadius: 12,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    zIndex: 20,
                  }}
                >
                  <span style={{ fontSize: 10, color: THEME.colors.inkSubtle, fontFamily: THEME.fonts.mono, letterSpacing: 1 }}>
                    LIVE DISPATCH REEL
                  </span>
                  <RollingCounter
                    startVal={120}
                    endVal={1000}
                    startFrame={15}
                    endFrame={420}
                    suffix=" / 1,000"
                    fontSize={22}
                  />
                </div>
              </div>
            </CinematicFrame>
          </CameraZoomShift>
        </EditorialSplitStage>
      ) : (
        /* Feature 6: Auto-Apply Guardrails (Frames 516 - 1056) */
        <EditorialSplitStage
          side="right"
          badge="06 / RATE GUARDRAILS"
          badgeColor={THEME.colors.accentAmber}
          title="PRECISION, NOT SPAM"
          description="With strict safety guardrails: fifty applications a day max, and a ninety-eight percent match threshold. Precision, not spam."
          startFrame={525}
          metrics={[
            { label: "DAILY CEILING", value: "50 APPS/DAY", color: THEME.colors.accentAmber },
            { label: "MATCH THRESHOLD", value: "98% MINIMUM", color: THEME.colors.accentEmerald },
            { label: "ACCOUNT SAFETY", value: "100% COMPLIANT", color: THEME.colors.ink },
          ]}
          mascotConfig={{
            dialogue: "50 apps/day limit enforced.",
            scale: 0.65,
          }}
        >
          <CameraZoomShift
            durationInFrames={540}
            fromScale={1.0}
            toScale={1.15}
            fromX={-20}
            toX={20}
            fromY={10}
            toY={-15}
          >
            <CinematicFrame
              width={1180}
              height={700}
              ambientGlowColor="rgba(245, 158, 11, 0.25)"
              title="itslarp.app — Autonomous Agent Guardrails & Rate Limits"
            >
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  clipPath: `circle(${apertureRadius}% at 50% 50%)`,
                }}
              >
                <Img
                  src={staticFile("images/auto_apply_agent.png")}
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top left" }}
                />

                {/* Guardrail Callout Pill */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 24,
                    right: 24,
                    backgroundColor: "rgba(0, 0, 0, 0.9)",
                    border: "1px solid rgba(245, 158, 11, 0.4)",
                    padding: "8px 18px",
                    borderRadius: 100,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    zIndex: 25,
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: THEME.colors.accentAmber,
                      boxShadow: "0 0 10px #f59e0b",
                    }}
                  />
                  <span style={{ fontFamily: THEME.fonts.mono, fontSize: 12, fontWeight: 700, color: THEME.colors.ink }}>
                    SAFETY CAP ACTIVE: 50 SUBMISSIONS/DAY
                  </span>
                </div>
              </div>
            </CinematicFrame>
          </CameraZoomShift>
        </EditorialSplitStage>
      )}

      {/* Transition: Feature 6 -> Feature 7 Vertical Alternating Slat Wipe Outro (Frames 1025 - 1056) */}
      {frame >= 1025 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            zIndex: 70,
            pointerEvents: "none",
          }}
        >
          {Array.from({ length: 10 }).map((_, idx) => {
            const slatProg = interpolate(frame, [1025, 1056], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const isEven = idx % 2 === 0;
            const shiftY = interpolate(slatProg, [0, 1], [isEven ? -100 : 100, 0]);
            return (
              <div
                key={idx}
                style={{
                  flex: 1,
                  height: "100%",
                  backgroundColor: "#000000",
                  transform: `translateY(${shiftY}%)`,
                  borderRight: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              />
            );
          })}
        </div>
      )}
    </AbsoluteFill>
  );
};
