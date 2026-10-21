import React from "react";
import { useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { THEME } from "../theme";

interface ScuttleMascotProps {
  style?: React.CSSProperties;
  dialogue?: string;
  snapBeats?: number[]; // frames where claw snaps
  scale?: number;
  flip?: boolean;
  disableEntrance?: boolean;
}

export const ScuttleMascot: React.FC<ScuttleMascotProps> = ({
  style,
  dialogue = "Snip through the noise.",
  snapBeats = [30, 73, 117, 160],
  scale = 1.0,
  flip = false,
  disableEntrance = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance slide-in from bottom right (optional)
  const entrance = spring({
    frame,
    fps,
    config: THEME.springs.snappy,
  });

  const translateX = disableEntrance ? 0 : interpolate(entrance, [0, 1], [180, 0]);
  const translateY = disableEntrance ? 0 : interpolate(entrance, [0, 1], [140, 0]);

  // Breathing / gentle float
  const floatY = Math.sin(frame / 15) * 5;

  // Snapping logic based on snapBeats
  let clawAngle = 0;
  for (const b of snapBeats) {
    if (frame >= b - 10 && frame <= b + 10) {
      // 10 frames before beat: claw opens (22 deg); on beat: snaps shut (0 deg)
      if (frame < b) {
        clawAngle = interpolate(frame, [b - 10, b], [0, 24]);
      } else {
        clawAngle = interpolate(frame, [b, b + 6], [24, 0]);
      }
      break;
    }
  }

  // Blinking: blink every ~120 frames
  const isBlinking = frame % 120 >= 112 && frame % 120 <= 118;

  // Eye tracking: subtle gaze drift
  const eyeX = Math.sin(frame / 20) * 3;
  const eyeY = Math.cos(frame / 25) * 2;

  // Dialogue bubble opacity and pop-in
  const dialogueEntrance = spring({
    frame: Math.max(0, frame - 25),
    fps,
    config: THEME.springs.impact,
  });

  return (
    <div
      style={{
        position: "relative",
        transform: `translate(${translateX}px, ${translateY + floatY}px) scale(${scale}) scaleX(${flip ? -1 : 1})`,
        display: "inline-block",
        transformOrigin: "center center",
        ...style,
      }}
    >
      {/* Dialogue Bubble */}
      {dialogue && (
        <div
          style={{
            position: "absolute",
            top: -70,
            right: 140,
            backgroundColor: "#ffffff",
            color: "#000000",
            padding: "10px 18px",
            borderRadius: 20,
            fontFamily: THEME.fonts.mono,
            fontSize: 14,
            fontWeight: 700,
            whiteSpace: "nowrap",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
            border: "2px solid #000000",
            opacity: dialogueEntrance,
            transform: `scale(${dialogueEntrance}) translateY(${interpolate(dialogueEntrance, [0, 1], [15, 0])}px)`,
            transformOrigin: "bottom right",
            zIndex: 10,
          }}
        >
          {dialogue}
          {/* Bubble tail */}
          <div
            style={{
              position: "absolute",
              bottom: -8,
              right: 28,
              width: 0,
              height: 0,
              borderLeft: "8px solid transparent",
              borderRight: "8px solid transparent",
              borderTop: "8px solid #ffffff",
            }}
          />
        </div>
      )}

      {/* Scuttle 2D Mascot SVG */}
      <svg
        viewBox="0 0 280 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width: 320,
          height: 360,
          overflow: "visible",
          filter: "drop-shadow(0 20px 30px rgba(0, 0, 0, 0.7))",
        }}
      >
        {/* Lower Left Crawling Legs */}
        <g stroke="#000000" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <g transform={`translate(120, 185) rotate(${Math.sin(frame / 6) * 6})`}>
            <path d="M 0 0 L -38 15 L -68 45" />
          </g>
          <g transform={`translate(130, 215) rotate(${Math.cos(frame / 7) * 5})`}>
            <path d="M 0 0 L -36 20 L -56 57" />
          </g>
          <g transform={`translate(148, 245) rotate(${Math.sin(frame / 8) * 6})`}>
            <path d="M 0 0 L -30 25 L -44 61" />
          </g>
        </g>

        {/* Crab Carapace */}
        <g>
          <path
            d="M 140 120 C 100 130, 85 185, 110 235 C 135 285, 210 290, 270 280 L 280 120 C 240 110, 180 110, 140 120 Z"
            fill="#FFFFFF"
            stroke="#000000"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <path d="M 132 165 Q 185 155 255 168" stroke="#E5E5E5" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M 125 200 Q 185 190 262 205" stroke="#E5E5E5" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M 138 235 Q 190 225 266 240" stroke="#E5E5E5" strokeWidth="2.4" strokeLinecap="round" />

          {/* Bowtie */}
          <g transform="translate(175, 235)">
            <path d="M -10 -5 L -10 5 L 0 0 Z" fill="#000000" />
            <path d="M 10 -5 L 10 5 L 0 0 Z" fill="#000000" />
            <circle cx="0" cy="0" r="3" fill="#FFFFFF" stroke="#000000" strokeWidth="1.8" />
          </g>

          {/* Smile */}
          <path d="M 152 195 Q 174 212 196 195" stroke="#000000" strokeWidth="3.2" strokeLinecap="round" fill="none" />
          <circle cx="150" cy="193" r="1.5" fill="#000000" />
          <circle cx="198" cy="193" r="1.5" fill="#000000" />
        </g>

        {/* Eyes */}
        <g>
          <path d="M 130 135 L 108 82" stroke="#000000" strokeWidth="4" strokeLinecap="round" />
          <path d="M 175 125 L 182 68" stroke="#000000" strokeWidth="4" strokeLinecap="round" />
          <circle cx="104" cy="74" r="24" fill="#FFFFFF" stroke="#000000" strokeWidth="3.8" />
          <circle cx="184" cy="60" r="24" fill="#FFFFFF" stroke="#000000" strokeWidth="3.8" />

          {isBlinking ? (
            <>
              <path d="M 86 74 Q 104 82 122 74" stroke="#000000" strokeWidth="3.6" strokeLinecap="round" />
              <path d="M 166 60 Q 184 68 202 60" stroke="#000000" strokeWidth="3.6" strokeLinecap="round" />
            </>
          ) : (
            <>
              <g transform={`translate(${eyeX}, ${eyeY})`}>
                <circle cx="104" cy="74" r="10.5" fill="#000000" />
                <circle cx="101" cy="70.5" r="3.2" fill="#FFFFFF" />
                <circle cx="106.5" cy="76" r="1.5" fill="#FFFFFF" />
              </g>
              <g transform={`translate(${eyeX}, ${eyeY})`}>
                <circle cx="184" cy="60" r="10.5" fill="#000000" />
                <circle cx="181" cy="56.5" r="3.2" fill="#FFFFFF" />
                <circle cx="186.5" cy="62" r="1.5" fill="#FFFFFF" />
              </g>
            </>
          )}
        </g>

        {/* Left Arm & Pincer */}
        <g>
          <path d="M 115 160 C 88 152, 70 142, 58 125" stroke="#000000" strokeWidth="4.2" strokeLinecap="round" fill="none" />
          <g transform="translate(58, 125)">
            <ellipse cx="0" cy="0" rx="11" ry="10" fill="#FFFFFF" stroke="#000000" strokeWidth="3.6" />
            {/* Dactyl */}
            <g transform={`rotate(${clawAngle})`}>
              <path d="M 0 -4 C -14 -20, -28 -20, -38 -3 C -30 2, -18 -4, 0 1 Z" fill="#FFFFFF" stroke="#000000" strokeWidth="3.5" strokeLinejoin="round" />
            </g>
            {/* Pollex */}
            <g transform={`rotate(${-clawAngle})`}>
              <path d="M 0 4 C -14 20, -28 20, -38 3 C -30 -2, -18 4, 0 -1 Z" fill="#FFFFFF" stroke="#000000" strokeWidth="3.5" strokeLinejoin="round" />
            </g>
          </g>
        </g>

        {/* Right Raised Arm & Pincer */}
        <g>
          <path d="M 200 125 C 218 102, 224 78, 216 55" stroke="#000000" strokeWidth="4.2" strokeLinecap="round" fill="none" />
          <g transform="translate(216, 55)">
            <ellipse cx="0" cy="0" rx="11" ry="10" fill="#FFFFFF" stroke="#000000" strokeWidth="3.6" />
            {/* Dactyl */}
            <g transform={`rotate(${clawAngle})`}>
              <path d="M 0 -4 C -12 -22, -26 -22, -36 -6 C -28 0, -16 -5, 0 1 Z" fill="#FFFFFF" stroke="#000000" strokeWidth="3.5" strokeLinejoin="round" />
            </g>
            {/* Pollex */}
            <g transform={`rotate(${-clawAngle})`}>
              <path d="M 0 4 C -12 22, -26 22, -36 6 C -28 0, -16 5, 0 -1 Z" fill="#FFFFFF" stroke="#000000" strokeWidth="3.5" strokeLinejoin="round" />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
};
