import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig, Video, Img, staticFile } from "remotion";
import { THEME } from "../theme";
import { CinematicFrame } from "../components/CinematicFrame";
import { KineticText } from "../components/KineticText";
import { PerspectiveCard } from "../components/PerspectiveCard";
import { BeatPulse } from "../components/BeatPulse";

export const Seq3Architecture: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Rhythm beat hits
  const hitFrames = [0, 87, 174, 261, 348, 435, 522, 609, 696, 783];

  // Section transitions:
  // 0 - 440: APA Resume Demo Video
  // 440 - 750: Job Platforms
  // 750 - 874: Pre-drop tension "UNLEASH THE SWARM"
  const isJobPlatforms = frame >= 440 && frame < 750;
  const isPreDrop = frame >= 750;

  const preDropFlash = interpolate(frame, [850, 873], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: THEME.colors.bg, overflow: "hidden" }}>
      <BeatPulse hitFrames={hitFrames}>
        {/* Header HUD */}
        {!isPreDrop && (
          <div
            style={{
              position: "absolute",
              top: 50,
              left: 100,
              zIndex: 10,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <KineticText
              text={!isJobPlatforms ? "03 / APA RESUME ENGINE" : "04 / MULTI-PLATFORM SYNC"}
              fontSize={15}
              tracking={4}
              weight={700}
              color={THEME.colors.accentAmber}
              fontFamily={THEME.fonts.mono}
              mode="line"
            />
            <KineticText
              text={!isJobPlatforms ? "20 CERTIFIED ARCHITECTURES" : "UNIFIED RECRUITER INGESTION"}
              fontSize={38}
              tracking={-1}
              weight={800}
              color={THEME.colors.ink}
              mode="word"
            />
          </div>
        )}

        {/* Content Stages */}
        {!isPreDrop ? (
          <PerspectiveCard
            initialRotateX={6}
            initialRotateY={-6}
            targetRotateX={0}
            targetRotateY={2}
            initialScale={0.92}
            targetScale={1.0}
            duration={750}
            style={{ marginTop: 50 }}
          >
            <CinematicFrame
              width={1540}
              height={840}
              title={
                !isJobPlatforms
                  ? "itslarp.app — APA-Certified Resume Architectures & Preview"
                  : "itslarp.app — LinkedIn, Indeed, Glassdoor, ZipRecruiter & Wellfound"
              }
            >
              {!isJobPlatforms ? (
                <div style={{ width: "100%", height: "100%", position: "relative" }}>
                  <Video
                    src={staticFile("videos/apa-resume-demo.mp4")}
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
                    ● REAL APPLICATION FOOTAGE · APA 20 CONFIGS
                  </div>
                </div>
              ) : (
                <Img
                  src={staticFile("images/job_platform.png")}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "top left",
                  }}
                />
              )}
            </CinematicFrame>
          </PerspectiveCard>
        ) : (
          /* Pre-Drop Tension Chamber */
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 24,
              backgroundColor: "#000000",
              zIndex: 20,
            }}
          >
            <KineticText
              text="AUTONOMOUS WORKFORCE ENGAGED"
              fontSize={18}
              tracking={8}
              weight={700}
              color={THEME.colors.accentAmber}
              fontFamily={THEME.fonts.mono}
              mode="line"
            />
            <KineticText
              text="UNLEASH THE SWARM."
              fontSize={96}
              tracking={-2}
              weight={900}
              color={THEME.colors.ink}
              mode="word"
            />
            <div
              style={{
                fontFamily: THEME.fonts.mono,
                fontSize: 16,
                color: THEME.colors.inkSubtle,
                letterSpacing: 2,
              }}
            >
              [ 1,000 AUTONOMOUS AGENTS SYNCHRONIZED ]
            </div>
          </div>
        )}

        {/* Impact flash entering Drop */}
        {preDropFlash > 0.01 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "#ffffff",
              opacity: preDropFlash,
              zIndex: 99,
            }}
          />
        )}
      </BeatPulse>
    </AbsoluteFill>
  );
};
