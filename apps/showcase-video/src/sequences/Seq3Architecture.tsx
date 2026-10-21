import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Video, Img, staticFile } from "remotion";
import { THEME } from "../theme";
import { CinematicFrame } from "../components/CinematicFrame";
import { CameraZoomShift } from "../components/CameraZoomShift";
import { EditorialSplitStage } from "../components/EditorialSplitStage";
import { CarouselShift } from "../components/CarouselShift";
import { TypewriterText } from "../components/TypewriterText";
import { ScuttleMascot } from "../components/ScuttleMascot";

export const Seq3Architecture: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Breakdown across 874 frames:
  // 0 - 450: Feature 3 (APA Resumes) with LEFT card & RIGHT zooming video
  // 450 - 750: Feature 4 (Job Platforms) with RIGHT card & LEFT zooming image
  // 750 - 874: Pre-drop tension & strobe pull-back "UNLEASH THE SWARM"
  const isJobSection = frame >= 450 && frame < 750;
  const isPreDrop = frame >= 750;

  // Staggered Platform Icon Cascade (frames 460 - 560)
  const platforms = [
    { name: "LinkedIn", badge: "DIRECT API" },
    { name: "Indeed", badge: "SWARM EXTRACTOR" },
    { name: "Glassdoor", badge: "SALARY SYNC" },
    { name: "ZipRecruiter", badge: "AUTO-SUBMIT" },
    { name: "Wellfound", badge: "STARTUP RADAR" },
  ];
  const platformStaggers = platforms.map((_, i) =>
    spring({
      frame: Math.max(0, frame - 470 - i * 12),
      fps,
      config: { damping: 18, stiffness: 220, mass: 0.8 },
    })
  );

  // Pre-drop zoom and flash
  const preDropZoom = interpolate(frame, [750, 874], [1.0, 0.88], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const preDropFlash = interpolate(frame, [850, 873], [0, 1], {
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

      {/* Feature 3: APA Resume Engine (Frames 0 - 450) */}
      {!isJobSection && !isPreDrop && (
        <EditorialSplitStage
          side="left"
          badge="03 / APA RESUME ENGINE"
          badgeColor={THEME.colors.accentAmber}
          title="20 CERTIFIED ARCHITECTURES"
          description="Then it constructs twenty certified APA architectures with zero hallucinations and guaranteed ATS pass rates."
          startFrame={5}
          metrics={[
            { label: "APA FORMAT", value: "7TH EDITION", color: THEME.colors.accentAmber },
            { label: "HALLUCINATIONS", value: "0.0%", color: THEME.colors.accentEmerald },
            { label: "ATS PARSE YIELD", value: "99.4%", color: THEME.colors.ink },
          ]}
          mascotConfig={{
            dialogue: "100% ATS score. Zero typos.",
            scale: 0.65,
          }}
        >
          <CameraZoomShift
            durationInFrames={450}
            fromScale={1.0}
            toScale={1.14}
            fromX={10}
            toX={-20}
            fromY={10}
            toY={-10}
          >
            <CinematicFrame
              width={1180}
              height={700}
              title="itslarp.app — APA-Certified Resume Architectures & Live PDF Engine"
            >
              <div style={{ position: "relative", width: "100%", height: "100%" }}>
                <Video
                  src={staticFile("videos/apa-resume-demo.mp4")}
                  startFrom={0}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />

                {/* Preset Carousel Shift */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 24,
                    left: 24,
                    right: 24,
                    zIndex: 20,
                    overflow: "hidden",
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    backdropFilter: "blur(12px)",
                    border: `1px solid ${THEME.colors.borderLight}`,
                    borderRadius: 12,
                    padding: "10px 16px",
                  }}
                >
                  <CarouselShift
                    cardWidth={260}
                    gap={14}
                    speed={3}
                    items={[
                      <div key="c1" style={{ padding: "6px 12px", backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 6, color: THEME.colors.ink, fontFamily: THEME.fonts.mono, fontSize: 11 }}>
                        01. Classic Academic (APA 7th)
                      </div>,
                      <div key="c2" style={{ padding: "6px 12px", backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 6, color: THEME.colors.ink, fontFamily: THEME.fonts.mono, fontSize: 11 }}>
                        02. Modern Executive Monochrome
                      </div>,
                      <div key="c3" style={{ padding: "6px 12px", backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 6, color: THEME.colors.ink, fontFamily: THEME.fonts.mono, fontSize: 11 }}>
                        03. Tech Lead & Architect V2
                      </div>,
                    ]}
                  />
                </div>
              </div>
            </CinematicFrame>
          </CameraZoomShift>
        </EditorialSplitStage>
      )}

      {/* Feature 4: Unified Job Ingestion (Frames 450 - 750) */}
      {isJobSection && (
        <EditorialSplitStage
          side="right"
          badge="04 / UNIFIED JOB INGESTION"
          badgeColor={THEME.colors.accentEmerald}
          title="5 MAJOR JOB PLATFORMS"
          description="Connecting across LinkedIn, Indeed, Glassdoor, and Greenhouse in one unified feed."
          startFrame={455}
          metrics={[
            { label: "CONNECTED BOARDS", value: "5 PLATFORMS", color: THEME.colors.accentEmerald },
            { label: "LISTING DEDUP", value: "REAL-TIME", color: THEME.colors.ink },
            { label: "DOM CRAWLER", value: "ACTIVE", color: THEME.colors.accentAmber },
          ]}
          mascotConfig={{
            dialogue: "5 boards scanned.",
            scale: 0.65,
          }}
        >
          <CameraZoomShift
            durationInFrames={300}
            fromScale={1.0}
            toScale={1.15}
            fromX={-15}
            toX={20}
            fromY={0}
            toY={-15}
          >
            <CinematicFrame
              width={1180}
              height={700}
              title="itslarp.app — Unified Multi-Platform Recruiter Ingestion"
            >
              <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
                <Img
                  src={staticFile("images/job_platform.png")}
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top left" }}
                />

                {/* Staggered Platform Icon Badges */}
                <div style={{ position: "absolute", top: 20, right: 20, display: "flex", gap: 10, zIndex: 25 }}>
                  {platforms.map((p, idx) => {
                    const dropY = interpolate(platformStaggers[idx], [0, 1], [-50, 0]);
                    const opacity = interpolate(platformStaggers[idx], [0, 0.4], [0, 1]);
                    return (
                      <div
                        key={idx}
                        style={{
                          transform: `translateY(${dropY}px)`,
                          opacity,
                          backgroundColor: "rgba(0, 0, 0, 0.85)",
                          border: `1px solid ${THEME.colors.borderLight}`,
                          padding: "8px 14px",
                          borderRadius: 8,
                          display: "flex",
                          flexDirection: "column",
                          gap: 2,
                        }}
                      >
                        <span style={{ fontSize: 12, fontWeight: 800, color: THEME.colors.ink, fontFamily: THEME.fonts.display }}>
                          {p.name}
                        </span>
                        <span style={{ fontSize: 9, fontFamily: THEME.fonts.mono, color: THEME.colors.accentAmber }}>
                          {p.badge}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CinematicFrame>
          </CameraZoomShift>
        </EditorialSplitStage>
      )}

      {/* Transition: Feature 3 -> Feature 4 Dual Curtain Push & Laser Blade Wipe (Frames 438 - 458) */}
      {frame >= 438 && frame <= 458 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 70,
            pointerEvents: "none",
            overflow: "hidden",
          }}
        >
          {/* Dual Curtain Slats sliding inwards */}
          {(() => {
            const curProg = interpolate(frame, [438, 458], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const slatOffset = interpolate(curProg, [0, 0.5, 1], [100, 0, -100]);
            return (
              <>
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    left: 0,
                    width: "50%",
                    backgroundColor: "#000000",
                    transform: `translateY(${slatOffset}%)`,
                    borderRight: `2px solid ${THEME.colors.accentEmerald}`,
                    boxShadow: `0 0 30px ${THEME.colors.accentEmerald}`,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    right: 0,
                    width: "50%",
                    backgroundColor: "#000000",
                    transform: `translateY(${-slatOffset}%)`,
                    borderLeft: `2px solid ${THEME.colors.accentEmerald}`,
                    boxShadow: `0 0 30px ${THEME.colors.accentEmerald}`,
                  }}
                />
              </>
            );
          })()}
        </div>
      )}

      {/* Pre-Drop Tension & Countdown (Frames 750 - 874) */}
      {isPreDrop && (
        <AbsoluteFill
          style={{
            backgroundColor: "#000000",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${preDropZoom})`,
            zIndex: 40,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <div
              style={{
                fontFamily: THEME.fonts.mono,
                fontSize: 16,
                fontWeight: 800,
                color: THEME.colors.accentEmerald,
                letterSpacing: 8,
              }}
            >
              STAND BY FOR FLEET DEPLOYMENT
            </div>
            <div
              style={{
                fontFamily: THEME.fonts.display,
                fontSize: 96,
                fontWeight: 900,
                color: "#ffffff",
                letterSpacing: -2,
                textShadow: "0 6px 40px rgba(0, 0, 0, 0.95)",
              }}
            >
              UNLEASH THE SWARM
            </div>
            <TypewriterText
              text="And then... we unleash the swarm."
              startFrame={755}
              charsPerSecond={22}
              fontSize={22}
              fontWeight={700}
              color="#ffffff"
            />
          </div>

          {/* Scuttle in Combat Stance Center Bottom */}
          <div style={{ position: "absolute", bottom: 40, zIndex: 45 }}>
            <ScuttleMascot dialogue="Unleash the bots!" scale={0.65} disableEntrance />
          </div>

          {/* Strobe impact on final frames before the drop */}
          {preDropFlash > 0.05 && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundColor: "#ffffff",
                opacity: preDropFlash * 0.9,
                pointerEvents: "none",
              }}
            />
          )}
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
