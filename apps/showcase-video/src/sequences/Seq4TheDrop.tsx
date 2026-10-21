import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Video, Img, staticFile } from "remotion";
import { THEME } from "../theme";
import { CinematicFrame } from "../components/CinematicFrame";
import { KineticText } from "../components/KineticText";
import { BeatPulse } from "../components/BeatPulse";

export const Seq4TheDrop: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Driving 82.8 BPM kicks every ~43.5 frames
  const kickBeats = [
    0, 44, 87, 131, 174, 218, 261, 305, 348, 392, 435, 479, 522, 566, 609, 653, 696, 740, 783, 827, 870, 914,
  ];

  // Screen swap between live demo video and auto_apply telemetry at frame 500
  const isAgentTelemetry = frame >= 500;
  const swapProgress = spring({
    frame: Math.max(0, frame - 500),
    fps,
    config: THEME.springs.impact,
  });

  // Dynamic application counter simulation on beat
  const applicationsDispatched = Math.floor(
    interpolate(frame, [0, 944], [142, 1000], { extrapolateRight: "clamp" })
  );

  return (
    <AbsoluteFill style={{ backgroundColor: THEME.colors.bg, overflow: "hidden" }}>
      <BeatPulse hitFrames={kickBeats} maxScale={1.03}>
        {/* Top Telemetry HUD Bar */}
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 80,
            right: 80,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            zIndex: 10,
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
                  boxShadow: "0 0 12px #10b981",
                  display: "inline-block",
                }}
              />
              <span
                style={{
                  fontFamily: THEME.fonts.mono,
                  fontSize: 14,
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

          {/* Metric Counter Card */}
          <div
            style={{
              padding: "12px 24px",
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              border: `1px solid ${THEME.colors.borderLight}`,
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              gap: 16,
              fontFamily: THEME.fonts.mono,
            }}
          >
            <div>
              <div style={{ fontSize: 10, color: THEME.colors.inkSubtle, letterSpacing: 1 }}>DISPATCHED</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: THEME.colors.ink }}>
                {applicationsDispatched} <span style={{ fontSize: 13, color: THEME.colors.inkMuted }}>/ 1,000</span>
              </div>
            </div>
            <div style={{ width: 1, height: 32, backgroundColor: THEME.colors.border }} />
            <div>
              <div style={{ fontSize: 10, color: THEME.colors.inkSubtle, letterSpacing: 1 }}>STATUS</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: THEME.colors.accentEmerald }}>
                OPTIMAL
              </div>
            </div>
          </div>
        </div>

        {/* Center Stage Hardware Viewport */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 70,
          }}
        >
          <CinematicFrame
            width={1600}
            height={860}
            title={
              !isAgentTelemetry
                ? "itslarp.app — Autonomous Swarm Execution Stream"
                : "itslarp.app — Bot Guardrails & Safety Parameters"
            }
          >
            {/* Screen 1: Swarm Video */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                opacity: interpolate(swapProgress, [0, 0.3], [1, 0]),
                transform: `scale(${interpolate(swapProgress, [0, 1], [1, 0.95])})`,
              }}
            >
              <Video
                src={staticFile("videos/workforce-swarm-demo.mp4")}
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
                ● 1,000 AGENTS DEPLOYING IN PARALLEL
              </div>
            </div>

            {/* Screen 2: Auto Apply Agent Specs */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                opacity: interpolate(swapProgress, [0.3, 1], [0, 1]),
                transform: `scale(${interpolate(swapProgress, [0, 1], [1.05, 1])})`,
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
            </div>
          </CinematicFrame>
        </div>

        {/* Bottom Kinetic Impact Strips */}
        <div
          style={{
            position: "absolute",
            bottom: 30,
            left: 80,
            right: 80,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
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
              color: THEME.colors.ink,
              fontWeight: 600,
            }}
          >
            GUARDRAILS: MAX 50 APPS/DAY · STRICT DUPLICATE PREVENTION
          </div>

          <div
            style={{
              padding: "10px 20px",
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              border: `1px solid ${THEME.colors.borderLight}`,
              borderRadius: 30,
              fontFamily: THEME.fonts.mono,
              fontSize: 13,
              color: THEME.colors.accentEmerald,
              fontWeight: 700,
            }}
          >
            ✓ ZERO REPUTATIONAL RISK · 100% AUDITABLE
          </div>
        </div>
      </BeatPulse>
    </AbsoluteFill>
  );
};
