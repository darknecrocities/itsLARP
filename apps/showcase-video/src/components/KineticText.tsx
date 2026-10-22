import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { THEME } from "../theme";

interface KineticTextProps {
  text: string;
  delay?: number;
  fontSize?: number;
  tracking?: number;
  color?: string;
  weight?: number | string;
  fontFamily?: string;
  style?: React.CSSProperties;
  mode?: "word" | "char" | "line";
  animateTracking?: boolean;
}

export const KineticText: React.FC<KineticTextProps> = ({
  text,
  delay = 0,
  fontSize = 48,
  tracking = 0,
  color = THEME.colors.ink,
  weight = 700,
  fontFamily = THEME.fonts.display,
  style,
  mode = "word",
  animateTracking = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const adjustedFrame = Math.max(0, frame - delay);

  // Tracking expansion / compression
  const letterSpacing = animateTracking
    ? interpolate(adjustedFrame, [0, 45], [tracking + 12, tracking], {
        extrapolateRight: "clamp",
      })
    : tracking;

  if (mode === "line") {
    const opacity = interpolate(adjustedFrame, [0, 20], [0, 1], {
      extrapolateRight: "clamp",
    });
    const translateY = interpolate(adjustedFrame, [0, 25], [30, 0], {
      extrapolateRight: "clamp",
    });

    return (
      <div
        style={{
          fontFamily,
          fontSize,
          fontWeight: weight,
          color,
          letterSpacing: `${letterSpacing}px`,
          opacity,
          transform: `translateY(${translateY}px)`,
          lineHeight: 1.15,
          userSelect: "none",
          ...style,
        }}
      >
        {text}
      </div>
    );
  }

  const items = mode === "word" ? text.split(" ") : text.split("");

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: mode === "word" ? "0.3em" : "0",
        fontFamily,
        fontSize,
        fontWeight: weight,
        color,
        letterSpacing: `${letterSpacing}px`,
        lineHeight: 1.15,
        userSelect: "none",
        ...style,
      }}
    >
      {items.map((item, idx) => {
        const itemDelay = idx * 3; // 3 frames per item at 60 FPS
        const itemFrame = Math.max(0, adjustedFrame - itemDelay);

        const springVal = spring({
          frame: itemFrame,
          fps,
          config: THEME.springs.snappy,
        });

        const opacity = interpolate(itemFrame, [0, 15], [0, 1], {
          extrapolateRight: "clamp",
        });
        const translateY = interpolate(springVal, [0, 1], [35, 0]);

        return (
          <span
            key={idx}
            style={{
              display: "inline-block",
              opacity,
              transform: `translateY(${translateY}px)`,
            }}
          >
            {item}
          </span>
        );
      })}
    </div>
  );
};
