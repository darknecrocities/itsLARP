import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { THEME } from "../theme";

interface RollingCounterProps {
  startVal?: number;
  endVal?: number;
  startFrame?: number;
  endFrame?: number;
  prefix?: string;
  suffix?: string;
  fontSize?: number;
  color?: string;
}

export const RollingCounter: React.FC<RollingCounterProps> = ({
  startVal = 0,
  endVal = 1000,
  startFrame = 0,
  endFrame = 120,
  prefix = "",
  suffix = "",
  fontSize = 32,
  color = THEME.colors.ink,
}) => {
  const frame = useCurrentFrame();

  const currentVal = Math.floor(
    interpolate(frame, [startFrame, endFrame], [startVal, endVal], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  const formatted = currentVal.toLocaleString();

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        fontFamily: THEME.fonts.mono,
        fontSize,
        fontWeight: 800,
        color,
        letterSpacing: 1,
      }}
    >
      {prefix && <span>{prefix}</span>}
      <span style={{ fontVariantNumeric: "tabular-nums" }}>{formatted}</span>
      {suffix && <span style={{ fontSize: fontSize * 0.6, color: THEME.colors.inkMuted }}>{suffix}</span>}
    </div>
  );
};
