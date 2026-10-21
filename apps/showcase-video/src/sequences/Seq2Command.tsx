import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Img, staticFile } from "remotion";
import { THEME } from "../theme";
import { CinematicFrame } from "../components/CinematicFrame";
import { MaskedSlideText } from "../components/MaskedSlideText";
import { CameraRail, RailWaypoint } from "../components/CameraRail";

export const Seq2Command: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Transitions #5, #6, #9: Multi-waypoint Camera Rail sweep across Dashboard & Career DNA
  // 0 - 90: sweeps right-to-left across top nav
  // 90 - 180: spotlight push into KPI metrics
  // 180 - 270: diagonal wipe to Career DNA
  // 270 - 360: kinetic skill bar displacement
  // 360 - 450: isometric tilt (tiltX: 10, tiltY: -12)
  // 450 - 504: venetian blinds wipe
  const waypoints: RailWaypoint[] = [
    { frame: 0, x: 40, y: -20, scale: 0.96, tiltX: 4, tiltY: -4 },
    { frame: 90, x: -30, y: -10, scale: 1.02, tiltX: 0, tiltY: 0 },
    { frame: 180, x: 0, y: -40, scale: 1.06, tiltX: -2, tiltY: 2 },
    { frame: 270, x: 0, y: 0, scale: 1.0, tiltX: 0, tiltY: 0 },
    { frame: 360, x: -20, y: 10, scale: 0.98, tiltX: 8, tiltY: -12 },
    { frame: 450, x: 0, y: 0, scale: 1.04, tiltX: 0, tiltY: 0 },
    { frame: 504, x: 0, y: 0, scale: 1.08, tiltX: 0, tiltY: 0 },
  ];

  // Transition #7: Diagonal Split Wipe from Dashboard to Career DNA at frame 180 - 240
  const diagonalWipeProgress = spring({
    frame: Math.max(0, frame - 180),
    fps,
    config: { damping: 24, stiffness: 180, mass: 1 },
  });
  const diagonalCut = interpolate(diagonalWipeProgress, [0, 1], [-20, 130]);

  // Transition #8: Kinetic Skill Bar Displacement at frames 270 - 360
  const skillBarStagger = [0, 15, 30, 45].map((delay) =>
    spring({
      frame: Math.max(0, frame - 270 - delay),
      fps,
      config: { damping: 22, stiffness: 220, mass: 0.8 },
    })
  );

  // Transition #10: Venetian Blinds Outro at frames 450 - 504
  const blindsProgress = spring({
    frame: Math.max(0, frame - 450),
    fps,
    config: { damping: 24, stiffness: 190, mass: 1 },
  });
  const blindsAngle = interpolate(blindsProgress, [0, 1], [0, 90]);

  const isCareerDnaActive = frame >= 220;

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

      {/* Kinetic Typographic Header HUD */}
      <div
        style={{
          position: "absolute",
          top: 48,
          left: 90,
          zIndex: 25,
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <MaskedSlideText
          text={!isCareerDnaActive ? "01 / COMMAND CENTER" : "02 / CAREER DNA GRAPH"}
          direction="left"
          delay={10}
          fontSize={15}
          tracking={4}
          fontWeight={700}
          color={THEME.colors.accentEmerald}
          fontFamily={THEME.fonts.mono}
        />
        <MaskedSlideText
          text={!isCareerDnaActive ? "AUTONOMOUS SYSTEM TELEMETRY" : "DEEP VERIFIED SKILL EXTRACTION"}
          direction="up"
          delay={25}
          fontSize={40}
          tracking={-1}
          fontWeight={800}
          color={THEME.colors.ink}
        />
      </div>

      {/* Camera Rail Pan-and-Scan Viewport */}
      <CameraRail waypoints={waypoints}>
        <div style={{ marginTop: 55, position: "relative" }}>
          <CinematicFrame
            width={1540}
            height={840}
            title={
              !isCareerDnaActive
                ? "itslarp.app — Executive Command Center & Active Bots"
                : "itslarp.app — Dynamic Career DNA & Profile Intelligence"
            }
          >
            {/* Layer 1: Dashboard */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                overflow: "hidden",
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

            {/* Layer 2: Transition #7 Diagonal Split Reveal of Career DNA */}
            {frame >= 180 && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  clipPath: `polygon(${diagonalCut - 30}% 0%, ${diagonalCut + 30}% 0%, ${diagonalCut}% 100%, ${diagonalCut - 60}% 100%)`,
                  overflow: "hidden",
                  zIndex: 10,
                  boxShadow: "-10px 0 40px rgba(0, 0, 0, 0.9)",
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
            )}

            {/* Full Career DNA once wipe completes */}
            {frame >= 250 && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 15,
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

                {/* Transition #8: Dynamic Kinetic Skill Bars Overlay */}
                {frame >= 270 && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: 30,
                      left: 30,
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                      backgroundColor: "rgba(0, 0, 0, 0.88)",
                      border: `1px solid ${THEME.colors.borderLight}`,
                      padding: "16px 22px",
                      borderRadius: 14,
                      boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
                      zIndex: 30,
                    }}
                  >
                    <div style={{ fontFamily: THEME.fonts.mono, fontSize: 11, color: THEME.colors.accentEmerald, letterSpacing: 2 }}>
                      VERIFIED DNA CLUSTERS
                    </div>
                    {[
                      { label: "AI Systems Engineering", pct: "98%", prog: skillBarStagger[0] },
                      { label: "Autonomous Swarm Protocols", pct: "94%", prog: skillBarStagger[1] },
                      { label: "Next.js & Distributed Arch", pct: "96%", prog: skillBarStagger[2] },
                      { label: "PostgreSQL & Vector Search", pct: "91%", prog: skillBarStagger[3] },
                    ].map((s, i) => {
                      const slideX = interpolate(s.prog, [0, 1], [-80, 0]);
                      const barWidth = interpolate(s.prog, [0, 1], [0, parseInt(s.pct, 10) * 1.8]);
                      return (
                        <div key={i} style={{ transform: `translateX(${slideX}px)`, display: "flex", alignItems: "center", gap: 14 }}>
                          <span style={{ width: 180, fontSize: 13, color: THEME.colors.ink, fontFamily: THEME.fonts.mono }}>
                            {s.label}
                          </span>
                          <div style={{ width: 180, height: 6, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 3, overflow: "hidden" }}>
                            <div style={{ width: barWidth, height: "100%", backgroundColor: THEME.colors.ink }} />
                          </div>
                          <span style={{ fontSize: 12, color: THEME.colors.inkSubtle, fontFamily: THEME.fonts.mono }}>
                            {s.pct}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </CinematicFrame>
        </div>
      </CameraRail>

      {/* Transition #10: Venetian Blinds Transition Slat Overlay (Frames 450 - 504) */}
      {frame >= 450 && (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", zIndex: 50, pointerEvents: "none" }}>
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
