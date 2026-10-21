import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { THEME } from "./theme";
import { AudioTrack } from "./audio/AudioTrack";
import { Seq1Genesis } from "./sequences/Seq1Genesis";
import { Seq2Command } from "./sequences/Seq2Command";
import { Seq3Architecture } from "./sequences/Seq3Architecture";
import { Seq4TheDrop } from "./sequences/Seq4TheDrop";
import { Seq5Ecosystem } from "./sequences/Seq5Ecosystem";
import { Seq6Resolution } from "./sequences/Seq6Resolution";

export const ShowcaseVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: THEME.colors.bg }}>
      {/* Synchronized Master Audio Track */}
      <AudioTrack />

      {/* Sequence 1: The Genesis (00:00.00 - 00:05.80, 348 frames) */}
      <Sequence from={0} durationInFrames={348} name="1. Genesis">
        <Seq1Genesis />
      </Sequence>

      {/* Sequence 2: Command Center (00:05.80 - 00:14.20, 504 frames) */}
      <Sequence from={348} durationInFrames={504} name="2. Command Center">
        <Seq2Command />
      </Sequence>

      {/* Sequence 3: The Architecture (00:14.20 - 00:28.76, 874 frames) */}
      <Sequence from={852} durationInFrames={874} name="3. Architecture">
        <Seq3Architecture />
      </Sequence>

      {/* Sequence 4: The Drop (00:28.76 - 00:44.50, 944 frames) */}
      <Sequence from={1726} durationInFrames={944} name="4. The Drop">
        <Seq4TheDrop />
      </Sequence>

      {/* Sequence 5: Ecosystem & Mascot (00:44.50 - 00:52.50, 480 frames) */}
      <Sequence from={2670} durationInFrames={480} name="5. Ecosystem & Mascot">
        <Seq5Ecosystem />
      </Sequence>

      {/* Sequence 6: Resolution (00:52.50 - 01:00.00, 450 frames) */}
      <Sequence from={3150} durationInFrames={450} name="6. Resolution">
        <Seq6Resolution />
      </Sequence>
    </AbsoluteFill>
  );
};
