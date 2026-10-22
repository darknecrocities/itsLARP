import React from "react";
import { Audio, staticFile, useCurrentFrame, interpolate } from "remotion";

// Spoken ranges for smooth cosine ducking envelope (at 60 FPS across 76.000s)
const DUCK_RANGES = [
  { start: 18, end: 228 },     // Hook (0.30s - 3.80s)
  { start: 240, end: 600 },    // Dashboard (4.00s - 10.00s)
  { start: 630, end: 901 },    // Career DNA (10.50s - 15.01s)
  { start: 990, end: 1481 },   // APA Engine (16.50s - 24.68s)
  { start: 1530, end: 1923 },  // Job Boards (25.50s - 32.05s)
  { start: 2076, end: 2233 },  // Pre-drop Riser (34.60s - 37.22s)
  // Drop climax at frame 2244 (37.40s: music swells to 0.32!)
  { start: 2268, end: 2714 },  // Workforce Swarm (37.80s - 45.24s)
  { start: 2760, end: 3271 },  // Guardrails (46.00s - 54.52s)
  { start: 3318, end: 3652 },  // Kanban (55.30s - 60.87s)
  { start: 3690, end: 3964 },  // Notion (61.50s - 66.06s)
  { start: 4038, end: 4261 },  // Clients (67.30s - 71.02s)
  { start: 4290, end: 4446 },  // Outro (71.50s - 74.09s)
];

export const AudioTrack: React.FC = () => {
  const frame = useCurrentFrame();

  // 1. Calibrated background music volume parameters (gentle bed, zero voice overlay)
  const BASE_MUSIC_VOL = 0.16;
  const DUCKED_MUSIC_VOL = 0.06;
  const DROP_MUSIC_VOL = 0.32;

  // 2. Calculate smooth ducking factor using 36-frame (0.60s) S-curve transitions
  let currentDuck = 0.0; // 0 = not ducked (ambient bed), 1 = fully ducked under speech
  const RAMP = 36;

  for (const r of DUCK_RANGES) {
    if (frame >= r.start - RAMP && frame <= r.end + RAMP) {
      if (frame < r.start) {
        // Smooth ramp down into ducking
        currentDuck = Math.max(currentDuck, interpolate(frame, [r.start - RAMP, r.start], [0, 1]));
      } else if (frame > r.end) {
        // Smooth ramp up out of ducking
        currentDuck = Math.max(currentDuck, interpolate(frame, [r.end, r.end + RAMP], [1, 0]));
      } else {
        currentDuck = 1.0;
      }
    }
  }

  // 3. Drop Swell (frame 2238 to 2350, 37.30s - 39.17s): let the climax drop punch through with power
  let musicVol = BASE_MUSIC_VOL - currentDuck * (BASE_MUSIC_VOL - DUCKED_MUSIC_VOL);
  if (frame >= 2238 && frame <= 2350) {
    musicVol = interpolate(
      frame,
      [2238, 2250, 2320, 2350],
      [musicVol, DROP_MUSIC_VOL, DROP_MUSIC_VOL, DUCKED_MUSIC_VOL],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );
  }

  // 4. Outro smooth fade-out (frames 4450 to 4558): gentle resolution, zero volume spike
  if (frame >= 4450) {
    musicVol = interpolate(frame, [4450, 4558], [Math.min(musicVol, 0.10), 0.0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }

  return (
    <>
      {/* 1. Primary Background Music (Clean, Low, Ducked with S-Curves) */}
      <Audio
        src={staticFile("soundtrack.mp3")}
        volume={musicVol}
        startFrom={0}
        endAt={4560}
      />

      {/* 2. Contiguous Master Voiceover Track (Zero Collisions, Studio Clarity) */}
      <Audio
        src={staticFile("audio/voiceover_master.wav")}
        volume={1.0}
        startFrom={0}
        endAt={4560}
      />

      {/* 3. Contiguous Master SFX Track (Pops, Snips, Whooshes & Climax Drop Impact) */}
      <Audio
        src={staticFile("audio/sfx_master.wav")}
        volume={0.65}
        startFrom={0}
        endAt={4560}
      />
    </>
  );
};
