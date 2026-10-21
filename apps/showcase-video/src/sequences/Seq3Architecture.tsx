import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Video, Img, staticFile } from "remotion";
import { THEME } from "../theme";
import { CinematicFrame } from "../components/CinematicFrame";
import { MaskedSlideText } from "../components/MaskedSlideText";
import { CarouselShift } from "../components/CarouselShift";
import { AccordionCompress } from "../components/AccordionCompress";

export const Seq3Architecture: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Sequence breakdown across 874 frames:
  // 0 - 270: APA Resume Engine video & template carousel (transitions #11, #12, #13)
  // 270 - 630: Job Platform integration & kinetic ticker (transitions #14, #15, #16, #17)
  // 630 - 750: Accordion compress into dark chamber (#18)
  // 750 - 874: Pre-drop tension & strobe pull-back "UNLEASH THE SWARM" (#19)

  // Transition #11: Dual-Column Curtain Push entrance (frames 0 - 60)
  const curtainProgress = spring({
    frame,
    fps,
    config: { damping: 22, stiffness: 200, mass: 0.9 },
  });
  const curtainUp = interpolate(curtainProgress, [0, 1], [-100, 0]);
  const curtainDown = interpolate(curtainProgress, [0, 1], [100, 0]);

  // Transition #13: Dynamic Zoom & Re-frame towards template selector (frames 150 - 270)
  const reframeZoom = interpolate(frame, [150, 270], [1.0, 1.08], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const reframeX = interpolate(frame, [150, 270], [0, -40], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Transition #14: Cross-Directional Shutter Push (frames 270 - 330)
  const shutterProgress = spring({
    frame: Math.max(0, frame - 270),
    fps,
    config: { damping: 24, stiffness: 180, mass: 1 },
  });
  const shutterSplit = interpolate(shutterProgress, [0, 1], [0, 100]);

  // Transition #15: Staggered Platform Icon Cascade (frames 330 - 450)
  const platforms = [
    { name: "LinkedIn", badge: "DIRECT API", color: "#0077b5" },
    { name: "Indeed", badge: "SWARM EXTRACTOR", color: "#2164f4" },
    { name: "Glassdoor", badge: "SALARY SYNC", color: "#0caa41" },
    { name: "ZipRecruiter", badge: "AUTO-SUBMIT", color: "#259a43" },
    { name: "Wellfound", badge: "STARTUP RADAR", color: "#da3743" },
  ];
  const platformStaggers = platforms.map((_, i) =>
    spring({
      frame: Math.max(0, frame - 330 - i * 14),
      fps,
      config: { damping: 18, stiffness: 220, mass: 0.8 },
    })
  );

  // Transition #17: Horizontal Text Ticker Shift (pixels per frame)
  const tickerOffset = (frame - 450) * 8;

  // Transition #19: Pre-drop tension & strobe pull-back (frames 750 - 874)
  const isPreDrop = frame >= 750;
  const preDropZoom = interpolate(frame, [750, 874], [1.0, 0.88], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const preDropFlash = interpolate(frame, [850, 873], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const isJobSection = frame >= 300 && frame < 750;

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
      {!isPreDrop && (
        <div
          style={{
            position: "absolute",
            top: 48,
            left: 90,
            zIndex: 30,
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <MaskedSlideText
            text={!isJobSection ? "03 / APA RESUME ENGINE" : "04 / UNIFIED JOB INGESTION"}
            direction="left"
            delay={10}
            fontSize={15}
            tracking={4}
            fontWeight={700}
            color={THEME.colors.accentAmber}
            fontFamily={THEME.fonts.mono}
          />
          <MaskedSlideText
            text={!isJobSection ? "20 CERTIFIED ARCHITECTURES" : "5 MAJOR JOB PLATFORMS · ONE PIPELINE"}
            direction="up"
            delay={25}
            fontSize={40}
            tracking={-1}
            fontWeight={800}
            color={THEME.colors.ink}
          />
        </div>
      )}

      {/* Section A: APA Resume Demo Video (Frames 0 - 300) */}
      {frame < 300 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `translate3d(${reframeX}px, 0, 0) scale(${reframeZoom})`,
            willChange: "transform",
          }}
        >
          {/* Dual-column curtain push reveals */}
          <div
            style={{
              display: "flex",
              width: "100%",
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                marginTop: 50,
                transform: `translateY(${curtainUp}px)`,
                width: 1540,
                height: 840,
              }}
            >
              <CinematicFrame width={1540} height={840} title="itslarp.app — APA-Certified Resume Architectures & Live PDF Engine">
                <div style={{ position: "relative", width: "100%", height: "100%" }}>
                  <Video
                    src={staticFile("videos/apa-resume-demo.mp4")}
                    startFrom={0}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />

                  {/* Transition #12: Horizontal Card Carousel Shift overlay at bottom */}
                  {frame >= 90 && frame < 270 && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: 30,
                        left: 40,
                        right: 40,
                        zIndex: 20,
                        overflow: "hidden",
                        backgroundColor: "rgba(0, 0, 0, 0.75)",
                        backdropFilter: "blur(12px)",
                        border: `1px solid ${THEME.colors.borderLight}`,
                        borderRadius: 14,
                        padding: "12px 20px",
                      }}
                    >
                      <div style={{ fontFamily: THEME.fonts.mono, fontSize: 11, color: THEME.colors.accentAmber, marginBottom: 8, letterSpacing: 1.5 }}>
                        LIVE PRESET ARCHITECTURES
                      </div>
                      <CarouselShift
                        cardWidth={280}
                        gap={16}
                        speed={3.5}
                        items={[
                          <div key="c1" style={{ padding: "8px 14px", backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", color: THEME.colors.ink, fontFamily: THEME.fonts.mono, fontSize: 12 }}>
                            01. Classic Academic (APA 7th)
                          </div>,
                          <div key="c2" style={{ padding: "8px 14px", backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", color: THEME.colors.ink, fontFamily: THEME.fonts.mono, fontSize: 12 }}>
                            02. Modern Executive Monochrome
                          </div>,
                          <div key="c3" style={{ padding: "8px 14px", backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", color: THEME.colors.ink, fontFamily: THEME.fonts.mono, fontSize: 12 }}>
                            03. Tech Lead & Architect V2
                          </div>,
                          <div key="c4" style={{ padding: "8px 14px", backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", color: THEME.colors.ink, fontFamily: THEME.fonts.mono, fontSize: 12 }}>
                            04. Quantitative Research Spec
                          </div>,
                        ]}
                      />
                    </div>
                  )}
                </div>
              </CinematicFrame>
            </div>
          </div>
        </div>
      )}

      {/* Section B: Job Platforms & Kinetic Ticker (Frames 270 - 750) */}
      {frame >= 270 && !isPreDrop && (
        <AccordionCompress triggerFrame={630} durationInFrames={120}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ marginTop: 50, position: "relative" }}>
              <CinematicFrame
                width={1540}
                height={840}
                title="itslarp.app — Unified Multi-Platform Recruiter Ingestion"
              >
                <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
                  <Img
                    src={staticFile("images/job_platform.png")}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "top left",
                    }}
                  />

                  {/* Transition #15: Staggered Platform Icon Cascade */}
                  {frame >= 330 && (
                    <div
                      style={{
                        position: "absolute",
                        top: 24,
                        right: 24,
                        display: "flex",
                        gap: 12,
                        zIndex: 25,
                      }}
                    >
                      {platforms.map((p, idx) => {
                        const dropY = interpolate(platformStaggers[idx], [0, 1], [-60, 0]);
                        const opacity = interpolate(platformStaggers[idx], [0, 0.4], [0, 1]);
                        return (
                          <div
                            key={idx}
                            style={{
                              transform: `translateY(${dropY}px)`,
                              opacity,
                              backgroundColor: "rgba(0, 0, 0, 0.85)",
                              border: `1px solid ${THEME.colors.borderLight}`,
                              padding: "10px 16px",
                              borderRadius: 10,
                              display: "flex",
                              flexDirection: "column",
                              gap: 2,
                              boxShadow: "0 10px 30px rgba(0,0,0,0.8)",
                            }}
                          >
                            <span style={{ fontSize: 13, fontWeight: 800, color: THEME.colors.ink, fontFamily: THEME.fonts.display }}>
                              {p.name}
                            </span>
                            <span style={{ fontSize: 9, fontFamily: THEME.fonts.mono, color: THEME.colors.accentAmber }}>
                              {p.badge}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Transition #17: Horizontal Text Ticker Shift (Frames 450 - 630) */}
                  {frame >= 450 && frame < 630 && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.9)",
                        borderTop: `1px solid ${THEME.colors.borderLight}`,
                        padding: "10px 0",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        zIndex: 30,
                      }}
                    >
                      <div
                        style={{
                          display: "inline-block",
                          transform: `translateX(${-tickerOffset}px)`,
                          fontFamily: THEME.fonts.mono,
                          fontSize: 16,
                          fontWeight: 700,
                          color: THEME.colors.ink,
                          letterSpacing: 3,
                        }}
                      >
                        20 APA CONFIGS · 5 UNIFIED BOARDS · REAL-TIME DOM CRAWLER · DEDUPLICATED LISTINGS · ATS SCORE &gt; 95% ·
                        20 APA CONFIGS · 5 UNIFIED BOARDS · REAL-TIME DOM CRAWLER · DEDUPLICATED LISTINGS · ATS SCORE &gt; 95% ·
                      </div>
                    </div>
                  )}
                </div>
              </CinematicFrame>
            </div>
          </div>
        </AccordionCompress>
      )}

      {/* Section C: Transition #19 Pre-drop Tension "UNLEASH THE SWARM" (Frames 750 - 874) */}
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
            <MaskedSlideText
              text="STAND BY FOR FLEET DEPLOYMENT"
              direction="up"
              delay={0}
              fontSize={16}
              tracking={8}
              fontWeight={700}
              color={THEME.colors.accentEmerald}
              fontFamily={THEME.fonts.mono}
            />
            <MaskedSlideText
              text="UNLEASH THE SWARM"
              direction="up"
              delay={15}
              fontSize={96}
              tracking={-2}
              fontWeight={900}
              color={THEME.colors.ink}
            />
            <div
              style={{
                fontFamily: THEME.fonts.mono,
                fontSize: 18,
                color: THEME.colors.inkSubtle,
                letterSpacing: 4,
                marginTop: 10,
              }}
            >
              1,000 CONCURRENT BOTS ARMED
            </div>
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
