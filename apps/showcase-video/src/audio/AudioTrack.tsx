import React from "react";
import { Audio, staticFile, useCurrentFrame, interpolate } from "remotion";

// Spoken ranges for smooth cosine ducking envelope (at 60 FPS)
const DUCK_RANGES = [
  { start: 30, end: 250 },     // Hook
  { start: 360, end: 585 },    // Dashboard
  { start: 600, end: 850 },    // Career DNA
  { start: 870, end: 1290 },   // APA Engine
  { start: 1310, end: 1590 },  // Job Boards
  { start: 1610, end: 1720 },  // Pre-drop
  // Drop climax at 1726 (music swells!)
  { start: 1840, end: 2220 },  // Workforce Swarm
  { start: 2240, end: 2650 },  // Guardrails
  { start: 2680, end: 2910 },  // Kanban
  { start: 2920, end: 3140 },  // Notion
  { start: 3160, end: 3370 },  // Clients
  { start: 3400, end: 3550 },  // Outro
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

  // 3. Drop Swell (frame 1715 to 1835): let the music hit with punch
  const isDropSwell = frame >= 1715 && frame <= 1835;
  let musicVol = BASE_MUSIC_VOL - currentDuck * (BASE_MUSIC_VOL - DUCKED_MUSIC_VOL);
  if (isDropSwell) {
    musicVol = DROP_MUSIC_VOL;
  }

  // 4. Outro clean fade-out at the very end (frames 3560 to 3598)
  if (frame >= 3560) {
    musicVol = interpolate(frame, [3560, 3598], [musicVol, 0.0], {
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
        endAt={3600}
      />

      {/* 2. Contiguous Master Voiceover Track (Zero Mount Glitches, Studio Diction) */}
      <Audio
        src={staticFile("audio/voiceover_master.wav")}
        volume={1.0}
        startFrom={0}
        endAt={3600}
      />

      {/* 3. Contiguous Master SFX Track (Pops, Snips, Whooshes & Drop Impact) */}
      <Audio
        src={staticFile("audio/sfx_master.wav")}
        volume={0.65}
        startFrom={0}
        endAt={3600}
      />
    </>
  );
};
