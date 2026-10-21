import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
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
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  startFrame = 0,
  charsPerSecond = 26,
  cursorColor = THEME.colors.accentEmerald,
  showCursor = true,
  fontFamily = THEME.fonts.mono,
  fontSize = 16,
  color = THEME.colors.inkMuted,
  lineHeight = 1.5,
  fontWeight = 500,
  letterSpacing = 0.2,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const elapsed = Math.max(0, frame - startFrame);
  const charsCount = Math.min(text.length, Math.floor(elapsed * (charsPerSecond / fps)));
  const visibleText = text.slice(0, charsCount);
  const isTypingComplete = charsCount >= text.length;

  // Cursor blinks every 16 frames; stays solid while actively typing
  const isBlinkVisible = isTypingComplete ? Math.floor(frame / 20) % 2 === 0 : true;

  return (
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
        ...style,
      }}
    >
      <span>{visibleText}</span>
      {showCursor && (
        <span
          style={{
            display: "inline-block",
            width: 8,
            height: fontSize * 0.9,
            backgroundColor: isBlinkVisible ? cursorColor : "transparent",
            marginLeft: 3,
            verticalAlign: "middle",
            boxShadow: isBlinkVisible ? `0 0 8px ${cursorColor}` : "none",
            borderRadius: 1,
          }}
        />
      )}
    </div>
  );
};
