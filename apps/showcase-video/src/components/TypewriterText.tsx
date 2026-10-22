import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { THEME } from "../theme";

interface TypewriterTextProps {
  text: string;
  startFrame?: number;
  charsPerSecond?: number;
  cursorColor?: string;
  showCursor?: boolean;
  fontFamily?: string;
  fontSize?: number;
  color?: string;
  lineHeight?: number | string;
  fontWeight?: number | string;
  letterSpacing?: number | string;
  style?: React.CSSProperties;
  enableZoomShiftTracking?: boolean;
  side?: "left" | "right" | "center";
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  startFrame = 0,
  charsPerSecond = 26,
  cursorColor = THEME.colors.accentEmerald,
  showCursor = true,
  fontFamily = THEME.fonts.mono,
  fontSize = 18,
  color = "#ffffff", // Pure high-contrast white
  lineHeight = 1.55,
  fontWeight = 700, // Bold
  letterSpacing = 0.3,
  style,
  enableZoomShiftTracking = true,
  side = "left",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 1. Typing Timeline & Kinematics
  const elapsed = Math.max(0, frame - startFrame);
  const charsCount = Math.min(text.length, Math.floor(elapsed * (charsPerSecond / fps)));
  const visibleText = text.slice(0, charsCount);
  const isTypingComplete = charsCount >= text.length;

  const typingDurationInFrames = Math.max(1, Math.ceil((text.length / charsPerSecond) * fps));
  const typingProgress = interpolate(
    frame,
    [startFrame, startFrame + typingDurationInFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Elastic settle spring when typing concludes
  const settleSpring = spring({
    frame: Math.max(0, frame - (startFrame + typingDurationInFrames)),
    fps,
    config: { damping: 22, stiffness: 140, mass: 0.9 },
  });

  // Dynamic Typographic Camera Zoom Push-In: 1.0 -> 1.07 during typing, eases back to 1.02 on settle
  const trackingScale = enableZoomShiftTracking
    ? interpolate(typingProgress, [0, 1], [1.0, 1.07]) - settleSpring * 0.05
    : 1.0;

  // Reading Trajectory Pan X (+18px along left-to-right reading for left stage, -18px for right stage)
  const panDirectionX = side === "left" ? 18 : side === "right" ? -18 : 0;
  const trackingTranslateX = enableZoomShiftTracking
    ? interpolate(typingProgress, [0, 1], [0, panDirectionX]) * (1 - settleSpring * 0.5)
    : 0;

  // Multi-line Vertical Pan Y: as text fills downwards, camera glides down to center active cursor
  const estimatedLines = Math.max(1, Math.ceil(text.length / 38));
  const maxPanY = Math.min(24, (estimatedLines - 1) * 10);
  const trackingTranslateY = enableZoomShiftTracking
    ? interpolate(typingProgress, [0, 1], [0, -maxPanY]) * (1 - settleSpring * 0.5)
    : 0;

  // Micro-Perspective 3D Tilt: starts slightly angled and squares up to perpendicular
  const tiltDirectionY = side === "left" ? 2.2 : side === "right" ? -2.2 : 0;
  const trackingRotateY = enableZoomShiftTracking
    ? interpolate(typingProgress, [0, 1], [tiltDirectionY, 0])
    : 0;
  const trackingRotateX = enableZoomShiftTracking
    ? interpolate(typingProgress, [0, 1], [-1.2, 0])
    : 0;

  // Split into settled text and newly emerged blooming characters
  const settledText = isTypingComplete ? visibleText : visibleText.slice(0, -2);
  const bloomingChars = isTypingComplete ? "" : visibleText.slice(-2);

  // Cursor blinks every 20 frames once complete; solid while typing
  const isBlinkVisible = isTypingComplete ? Math.floor(frame / 20) % 2 === 0 : true;

  const origin = side === "left" ? "left center" : side === "right" ? "right center" : "center center";

  return (
    <div
      style={{
        position: "relative",
        transform: `perspective(1000px) scale(${trackingScale}) translate3d(${trackingTranslateX}px, ${trackingTranslateY}px, 0) rotateX(${trackingRotateX}deg) rotateY(${trackingRotateY}deg)`,
        transformOrigin: origin,
        willChange: "transform",
        ...style,
      }}
    >
      <div
        style={{
          fontFamily,
          fontSize,
          color,
          lineHeight,
          fontWeight,
          letterSpacing,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          textShadow: "0 2px 14px rgba(0, 0, 0, 0.95)",
        }}
      >
        <span>{settledText}</span>
        {bloomingChars && (
          <span
            style={{
              color: "#ffffff",
              textShadow: `0 0 18px ${cursorColor}, 0 0 10px #ffffff`,
            }}
          >
            {bloomingChars}
          </span>
        )}
        {showCursor && (
          <span
            style={{
              display: "inline-block",
              width: 10,
              height: fontSize * 0.95,
              backgroundColor: isBlinkVisible ? cursorColor : "transparent",
              marginLeft: 4,
              verticalAlign: "middle",
              boxShadow: isBlinkVisible ? `0 0 14px ${cursorColor}` : "none",
              borderRadius: 2,
            }}
          />
        )}
      </div>

      {/* Active Specular Typing Halo Light Flare */}
      {showCursor && !isTypingComplete && (
        <div
          style={{
            position: "absolute",
            bottom: -6,
            left: 0,
            width: "100%",
            height: 20,
            background: `radial-gradient(ellipse 60% 100% at ${Math.min(100, Math.max(10, typingProgress * 100))}% 50%, ${cursorColor}28 0%, transparent 70%)`,
            pointerEvents: "none",
            filter: "blur(6px)",
          }}
        />
      )}
    </div>
  );
};
