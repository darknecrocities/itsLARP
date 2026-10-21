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
  fontSize = 18,
  color = "#ffffff", // Pure high-contrast white
  lineHeight = 1.55,
  fontWeight = 700, // Bold
  letterSpacing = 0.3,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const elapsed = Math.max(0, frame - startFrame);
  const charsCount = Math.min(text.length, Math.floor(elapsed * (charsPerSecond / fps)));
  const visibleText = text.slice(0, charsCount);
  const isTypingComplete = charsCount >= text.length;

  // Split into settled text and newly emerged blooming characters
  const settledText = isTypingComplete ? visibleText : visibleText.slice(0, -2);
  const bloomingChars = isTypingComplete ? "" : visibleText.slice(-2);

  // Cursor blinks every 20 frames once complete; solid while typing
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
        textShadow: "0 2px 14px rgba(0, 0, 0, 0.95)",
        ...style,
      }}
    >
      <span>{settledText}</span>
      {bloomingChars && (
        <span
          style={{
            color: "#ffffff",
            textShadow: `0 0 16px ${cursorColor}, 0 0 8px #ffffff`,
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
            boxShadow: isBlinkVisible ? `0 0 12px ${cursorColor}` : "none",
            borderRadius: 2,
          }}
        />
      )}
    </div>
  );
};
