import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { THEME } from "../theme";
import { ApertureIntro } from "../components/ApertureIntro";
import { MaskedSlideText } from "../components/MaskedSlideText";
import { ShutterBladeWipe } from "../components/ShutterBladeWipe";

export const Seq1Genesis: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Subtle camera drift backward during intro (no pulse, pure dimensional drift)
  const driftScale = interpolate(frame, [0, 348], [1.04, 1.0], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: THEME.colors.bg,
        overflow: "hidden",
        transform: `scale(${driftScale})`,
      }}
    >
      <ShutterBladeWipe slatCount={8} triggerFrame={290} durationInFrames={58} direction="horizontal">
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Transitions #1 & #2: Aperture Iris & 3D Logo Perspective Lock */}
          <ApertureIntro />

          {/* Transition #3: Masked Opposing Line Slide (Typographic Reveals) */}
          <div
            style={{
              position: "absolute",
              bottom: 120,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
              zIndex: 30,
            }}
          >
            {/* Top kicker sliding from right */}
            <MaskedSlideText
              text="AUTONOMOUS CAREER OPERATING SYSTEM"
              direction="left"
              delay={160}
              fontSize={14}
              tracking={6}
              fontWeight={700}
              color={THEME.colors.inkSubtle}
              fontFamily={THEME.fonts.mono}
            />

            {/* Hero Tagline: "Lets Larp" sliding up */}
            <MaskedSlideText
              text="Lets Larp"
              direction="up"
              delay={195}
              fontSize={108}
              tracking={-2}
              fontWeight={900}
              color={THEME.colors.ink}
              fontFamily={THEME.fonts.display}
            />

            {/* Subtitle sliding from bottom */}
            <MaskedSlideText
              text="Stop applying manually. Let 1,000 autonomous bots fight for your interviews."
              direction="up"
              delay={230}
              fontSize={20}
              tracking={0.2}
              fontWeight={400}
              color={THEME.colors.inkMuted}
              fontFamily={THEME.fonts.sans}
            />
          </div>
        </AbsoluteFill>
      </ShutterBladeWipe>
    </AbsoluteFill>
  );
};
