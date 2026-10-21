import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Video, Img, staticFile } from "remotion";
import { THEME } from "../theme";
import { CinematicFrame } from "../components/CinematicFrame";
import { MaskedSlideText } from "../components/MaskedSlideText";
import { RollingCounter } from "../components/RollingCounter";
import { SplitShiftPanel } from "../components/SplitShiftPanel";

export const Seq4TheDrop: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Transition #20: THE DROP Explosive Multi-Panel Snap (frames 0 - 60)
  const dropSnap = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 240, mass: 0.8 },
  });
  const dropScale = interpolate(dropSnap, [0, 1], [1.15, 1.0]);

  // Transition #22: Left-to-Right Video Sweep (frames 180 - 270)
  const sweepProgress = spring({
    frame: Math.max(0, frame - 180),
    fps,
    config: { damping: 24, stiffness: 180, mass: 1 },
  });
  const videoSweepX = interpolate(sweepProgress, [0, 1], [120, 0]);

  // Transition #24: Circular Aperture Mask Shift (frames 360 - 450)
  const apertureRadius = interpolate(frame, [360, 420], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Transition #25: Kinetic Typography Interlock (frames 450 - 540)
  const interlockTop = interpolate(frame, [450, 520], [-100, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const interlockBottom = interpolate(frame, [450, 520], [100, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Transition #26: Lateral Card Push (frames 540 - 630)
  const lateralPush = spring({
    frame: Math.max(0, frame - 540),
    fps,
    config: { damping: 24, stiffness: 200, mass: 0.9 },
  });
  const cardPushX = interpolate(lateralPush, [0, 1], [0, -350]);
  const newCardX = interpolate(lateralPush, [0, 1], [350, 0]);

  // Transition #28: Perspective 3D Orbit (frames 720 - 810)
  const orbitAngleY = interpolate(frame, [720, 810], [0, 12], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const orbitAngleX = interpolate(frame, [720, 810], [0, 4], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Transition #29: Horizontal Filmstrip Slide (frames 810 - 944)
  const filmstripExit = interpolate(frame, [850, 944], [0, -120], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const isLateTelemetry = frame >= 360;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: THEME.colors.bg,
        overflow: "hidden",
        transform: `scale(${dropScale})`,
      }}
    >
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

      {/* Top Telemetry HUD Bar */}
      <div
        style={{
          position: "absolute",
          top: 36,
          left: 80,
          right: 80,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 35,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: THEME.colors.accentEmerald,
                boxShadow: "0 0 14px #10b981",
              }}
            />
            <span
              style={{
                fontFamily: THEME.fonts.mono,
                fontSize: 13,
                fontWeight: 700,
                color: THEME.colors.accentEmerald,
                letterSpacing: 2,
              }}
            >
              SWARM ACTIVE · 1,000 AUTONOMOUS AGENTS
            </span>
          </div>
          <div
            style={{
              fontFamily: THEME.fonts.display,
              fontSize: 36,
              fontWeight: 800,
              color: THEME.colors.ink,
              letterSpacing: -1,
            }}
          >
            PRECISION WORKFORCE IN MOTION
          </div>
        </div>

        {/* Transition #21: Rolling Digit Reel Counter Card */}
        <div
          style={{
            padding: "12px 24px",
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            border: `1px solid ${THEME.colors.borderLight}`,
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            gap: 16,
            boxShadow: "0 10px 40px rgba(0,0,0,0.8)",
          }}
        >
          <div>
            <div style={{ fontSize: 10, color: THEME.colors.inkSubtle, letterSpacing: 1, fontFamily: THEME.fonts.mono }}>
              APPLICATIONS DISPATCHED
            </div>
            <RollingCounter
              startVal={142}
              endVal={1000}
              startFrame={0}
              endFrame={900}
              suffix=" / 1,000"
              fontSize={26}
            />
          </div>
        </div>
      </div>

      {/* Main Stage: Transitions #22, #23, #24, #26, #28 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `perspective(1200px) rotateY(${orbitAngleY}deg) rotateX(${orbitAngleX}deg) translateX(${filmstripExit}%)`,
          willChange: "transform",
        }}
      >
        <div style={{ marginTop: 55 }}>
          {!isLateTelemetry ? (
            /* Part 1: Workforce Swarm Live Video with Opposing Split Panels (Frames 0 - 360) */
            <CinematicFrame
              width={1540}
              height={840}
              title="itslarp.app — Workforce Swarm Dispatch & Real-Time DOM Automation"
            >
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  transform: `translateX(${videoSweepX}px)`,
                }}
              >
                {frame < 270 ? (
                  <Video
                    src={staticFile("videos/workforce-swarm-demo.mp4")}
                    startFrom={0}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  /* Transition #23: Opposing Split-Panel Glide */
                  <SplitShiftPanel
                    triggerFrame={270}
                    splitRatio={0.65}
                    opposingDistance={120}
                    direction="vertical"
                    leftContent={
                      <Video
                        src={staticFile("videos/workforce-swarm-demo.mp4")}
                        startFrom={120}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    }
                    rightContent={
                      <div
                        style={{
                          backgroundColor: "#0d0d0d",
                          padding: 24,
                          height: "100%",
                          fontFamily: THEME.fonts.mono,
                          fontSize: 12,
                          color: THEME.colors.ink,
                          display: "flex",
                          flexDirection: "column",
                          gap: 12,
                        }}
                      >
                        <div style={{ color: THEME.colors.accentEmerald, fontWeight: 700 }}>
                          LIVE DAEMON TELEMETRY
                        </div>
                        <div>[02:44:11] Worker #049: Form rendered on Greenhouse</div>
                        <div>[02:44:12] Injecting APA-7 formatted PDF payload</div>
                        <div>[02:44:13] Answering EEO compliance questionnaire</div>
                        <div>[02:44:14] Captcha bypass verified via resident token</div>
                        <div style={{ color: THEME.colors.accentEmerald }}>[02:44:15] Submission confirmed: ID #88921</div>
                      </div>
                    }
                  />
                )}
              </div>
            </CinematicFrame>
          ) : (
            /* Part 2: Auto Apply Agent & Guardrails with Circular Aperture Shift (Frames 360 - 944) */
            <div style={{ position: "relative" }}>
              <div style={{ transform: `translateX(${cardPushX}px)` }}>
                <CinematicFrame
                  width={1540}
                  height={840}
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
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "top left",
                      }}
                    />

                    {/* Transition #25: Kinetic Typography Interlock Overlay */}
                    {frame >= 450 && frame < 540 && (
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          backgroundColor: "rgba(0, 0, 0, 0.7)",
                          backdropFilter: "blur(8px)",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 12,
                          zIndex: 30,
                        }}
                      >
                        <div
                          style={{
                            fontFamily: THEME.fonts.display,
                            fontSize: 72,
                            fontWeight: 900,
                            color: THEME.colors.ink,
                            transform: `translateX(${interlockTop}px)`,
                          }}
                        >
                          1,000 BOTS. ZERO SPAM.
                        </div>
                        <div
                          style={{
                            fontFamily: THEME.fonts.mono,
                            fontSize: 22,
                            fontWeight: 700,
                            color: THEME.colors.accentEmerald,
                            letterSpacing: 4,
                            transform: `translateX(${interlockBottom}px)`,
                          }}
                        >
                          STRICT 50 APPS/DAY RATE LIMITS · 98% MATCH THRESHOLD
                        </div>
                      </div>
                    )}

                    {/* Transition #27: Vertical Ribbon Unfurl of Payload Verification */}
                    {frame >= 630 && frame < 750 && (
                      <div
                        style={{
                          position: "absolute",
                          right: 40,
                          top: 40,
                          bottom: 40,
                          width: 320,
                          backgroundColor: "rgba(0, 0, 0, 0.9)",
                          border: `1px solid ${THEME.colors.borderLight}`,
                          borderRadius: 14,
                          padding: 24,
                          display: "flex",
                          flexDirection: "column",
                          gap: 12,
                          fontFamily: THEME.fonts.mono,
                          boxShadow: "0 20px 60px rgba(0,0,0,0.9)",
                          zIndex: 35,
                        }}
                      >
                        <div style={{ color: THEME.colors.accentAmber, fontWeight: 700, fontSize: 12 }}>
                          VERIFIED PAYLOAD SPEC
                        </div>
                        <div style={{ fontSize: 13, color: THEME.colors.ink }}>
                          File: resume_apa_architect.pdf
                        </div>
                        <div style={{ fontSize: 11, color: THEME.colors.inkSubtle }}>
                          Hash: 7f3b89a24c...
                        </div>
                        <div style={{ fontSize: 11, color: THEME.colors.accentEmerald }}>
                          ATS Parsability: 99.4%
                        </div>
                        <div style={{ fontSize: 11, color: THEME.colors.inkSubtle }}>
                          Job Target: Staff Distributed Systems Engineer
                        </div>
                      </div>
                    )}
                  </div>
                </CinematicFrame>
              </div>

              {/* Lateral incoming card push from right */}
              {frame >= 540 && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    transform: `translateX(${newCardX}px)`,
                    pointerEvents: "none",
                  }}
                >
                  {/* Visual continuity card */}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
