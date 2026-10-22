import React from "react";
import { Audio, staticFile, useCurrentFrame, interpolate } from "remotion";

// Spoken ranges for smooth cosine ducking envelope (at 60 FPS across 108.000s)
const DUCK_RANGES = [
  { start: 30, end: 240 },     // Hook (0.50s - 4.00s)
  { start: 300, end: 660 },    // Dashboard (5.00s - 11.00s)
  { start: 696, end: 967 },    // Career DNA (11.60s - 16.11s)
  { start: 1080, end: 1571 },  // APA Engine (18.00s - 26.18s)
  { start: 2040, end: 2433 },  // Job Boards (34.00s - 40.55s)
  { start: 2928, end: 3085 },  // Pre-drop Riser (48.80s - 51.42s)
  // Drop climax at frame 3096 (51.60s: music swells to 0.32!)
  { start: 3168, end: 3614 },  // Workforce Swarm (52.80s - 60.24s)
  { start: 3870, end: 4381 },  // Guardrails (64.50s - 73.02s)
  { start: 4590, end: 4924 },  // Kanban (76.50s - 82.07s)
  { start: 5130, end: 5404 },  // Notion (85.50s - 90.06s)
  { start: 5610, end: 5833 },  // Clients (93.50s - 97.22s)
  { start: 6060, end: 6215 },  // Outro (101.00s - 103.59s)
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

  // 3. Drop Swell (frame 3090 to 3240, 51.50s - 54.00s): let the climax drop punch through with power
  let musicVol = BASE_MUSIC_VOL - currentDuck * (BASE_MUSIC_VOL - DUCKED_MUSIC_VOL);
  if (frame >= 3090 && frame <= 3240) {
    musicVol = interpolate(
      frame,
      [3090, 3105, 3210, 3240],
      [musicVol, DROP_MUSIC_VOL, DROP_MUSIC_VOL, DUCKED_MUSIC_VOL],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );
  }

  // 4. Outro smooth fade-out (frames 6180 to 6478): gentle resolution, zero volume spike
  if (frame >= 6180) {
    musicVol = interpolate(frame, [6180, 6478], [Math.min(musicVol, 0.10), 0.0], {
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
        endAt={6480}
      />

      {/* 2. Contiguous Master Voiceover Track (Zero Collisions, Studio Clarity) */}
      <Audio
        src={staticFile("audio/voiceover_master.wav")}
        volume={1.0}
        startFrom={0}
        endAt={6480}
      />

      {/* 3. Contiguous Master SFX Track (Pops, Snips, Whooshes & Climax Drop Impact) */}
      <Audio
        src={staticFile("audio/sfx_master.wav")}
        volume={0.65}
        startFrom={0}
        endAt={6480}
      />
    </>
  );
};
