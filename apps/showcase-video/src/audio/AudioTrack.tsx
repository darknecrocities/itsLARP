import React from "react";
import { Audio, staticFile, useCurrentFrame, Sequence, interpolate } from "remotion";

// Voiceover cues with exact global start frames and durations (at 60 FPS)
export const VO_CUES = [
  { id: "vo_01_hook", file: "audio/vo/vo_01_hook.mp3", start: 30, duration: 210 },
  { id: "vo_02_dashboard", file: "audio/vo/vo_02_dashboard.mp3", start: 360, duration: 220 },
  { id: "vo_03_career_dna", file: "audio/vo/vo_03_career_dna.mp3", start: 600, duration: 240 },
  { id: "vo_04_apa_engine", file: "audio/vo/vo_04_apa_engine.mp3", start: 870, duration: 420 },
  { id: "vo_05_job_boards", file: "audio/vo/vo_05_job_boards.mp3", start: 1310, duration: 320 },
  { id: "vo_06_pre_drop", file: "audio/vo/vo_06_pre_drop.mp3", start: 1610, duration: 110 },
  { id: "vo_07_the_drop", file: "audio/vo/vo_07_the_drop.mp3", start: 1840, duration: 380 },
  { id: "vo_08_guardrails", file: "audio/vo/vo_08_guardrails.mp3", start: 2240, duration: 410 },
  { id: "vo_09_kanban", file: "audio/vo/vo_09_kanban.mp3", start: 2680, duration: 230 },
  { id: "vo_10_notion", file: "audio/vo/vo_10_notion.mp3", start: 2920, duration: 220 },
  { id: "vo_11_clients", file: "audio/vo/vo_11_clients.mp3", start: 3160, duration: 210 },
  { id: "vo_12_outro", file: "audio/vo/vo_12_outro.mp3", start: 3400, duration: 150 },
];

export const AudioTrack: React.FC = () => {
  const frame = useCurrentFrame();

  // Dynamic soundtrack volume ducking
  // 1. Check if speech is currently active (with 10-frame padding for smooth transitions)
  let isSpeaking = false;
  for (const cue of VO_CUES) {
    if (frame >= cue.start - 8 && frame <= cue.start + cue.duration + 8) {
      isSpeaking = true;
      break;
    }
  }

  // 2. The musical drop hits at frame 1726 (28.76s). Swell music to 100% impact!
  const isDropSwell = frame >= 1715 && frame <= 1840;

  // 3. Base target volume
  let targetVol = 0.78;
  if (isDropSwell) {
    targetVol = 1.0;
  } else if (isSpeaking) {
    targetVol = 0.26; // Smoothly duck music beneath spoken voiceover
  }

  // 4. Smooth volume envelope: fade-in at start, fade-out at very end (frames 3550 - 3598)
  let masterVol = targetVol;
  if (frame < 15) {
    masterVol = interpolate(frame, [0, 15], [0, targetVol], { extrapolateRight: "clamp" });
  } else if (frame >= 3550) {
    masterVol = interpolate(frame, [3550, 3598], [targetVol, 0.0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }

  return (
    <>
      {/* Primary Background Soundtrack with Dynamic Ducking */}
      <Audio
        src={staticFile("soundtrack.mp3")}
        volume={masterVol}
        startFrom={0}
        endAt={3600}
      />

      {/* Voiceover Narration Track Sequences */}
      {VO_CUES.map((cue) => (
        <Sequence
          key={cue.id}
          from={cue.start}
          durationInFrames={cue.duration + 10}
          name={cue.id}
        >
          <Audio src={staticFile(cue.file)} volume={1.0} />
        </Sequence>
      ))}
    </>
  );
};
