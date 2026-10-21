import React from "react";
import { Audio, staticFile, useCurrentFrame, interpolate } from "remotion";

// Spoken ranges for smooth cosine ducking envelope (at 60 FPS across 108.000s)
const DUCK_RANGES = [
  { start: 30, end: 240 },     // Hook (0.50s - 4.00s)
  { start: 330, end: 575 },    // Dashboard (5.50s - 9.58s)
  { start: 690, end: 961 },    // Career DNA (11.50s - 16.01s)
  { start: 1050, end: 1541 },  // APA Engine (17.50s - 25.68s)
  { start: 1650, end: 2043 },  // Job Boards (27.50s - 34.05s)
  { start: 2160, end: 2317 },  // Pre-drop (36.00s - 38.62s)
  // Drop climax at frame 3096 (51.60s: music swells!)
  { start: 3168, end: 3614 },  // Workforce Swarm (52.80s - 60.24s)
  { start: 3870, end: 4381 },  // Guardrails (64.50s - 73.02s)
  { start: 4590, end: 4924 },  // Kanban (76.50s - 82.07s)
  { start: 5130, end: 5404 },  // Notion (85.50s - 90.06s)
  { start: 5610, end: 5833 },  // Clients (93.50s - 97.22s)
  { start: 6060, end: 6215 },  // Outro (101.00s - 103.59s)
];

export const AudioTrack: React.FC = () => {
  const frame = useCurrentFrame();

  // 1. Lowered background music baseline volume
  const BASE_MUSIC_VOL = 0.30;
  const DUCKED_MUSIC_VOL = 0.10;
  const DROP_MUSIC_VOL = 0.55;

  // 2. Calculate smooth ducking factor using 15-frame smooth cosine transitions
  let currentDuck = 0.0; // 0 = not ducked (ambient), 1 = fully ducked
  const RAMP = 15;

  for (const r of DUCK_RANGES) {
    if (frame >= r.start - RAMP && frame <= r.end + RAMP) {
      if (frame < r.start) {
        // Ramp down into ducking
        currentDuck = Math.max(currentDuck, interpolate(frame, [r.start - RAMP, r.start], [0, 1]));
      } else if (frame > r.end) {
        // Ramp up out of ducking
        currentDuck = Math.max(currentDuck, interpolate(frame, [r.end, r.end + RAMP], [1, 0]));
      } else {
        currentDuck = 1.0;
      }
    }
  }

  // 3. Drop Swell (frame 3090 to 3260, 51.50s - 54.33s): let the climax drop punch through with power
  const isDropSwell = frame >= 3090 && frame <= 3260;
  let musicVol = BASE_MUSIC_VOL - currentDuck * (BASE_MUSIC_VOL - DUCKED_MUSIC_VOL);
  if (isDropSwell) {
    musicVol = DROP_MUSIC_VOL;
  }

  // 4. Outro clean fade-out at the very end (frames 6400 to 6478)
  if (frame >= 6400) {
    musicVol = interpolate(frame, [6400, 6478], [musicVol, 0.0], {
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
