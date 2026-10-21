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

      {/* Sequence 1: The Genesis (00:00.00 - 00:05.00, 300 frames) */}
      <Sequence from={0} durationInFrames={300} name="1. Genesis">
        <Seq1Genesis />
      </Sequence>

      {/* Sequence 2: Command Center (00:05.00 - 00:17.00, 720 frames) */}
      <Sequence from={300} durationInFrames={720} name="2. Command Center">
        <Seq2Command />
      </Sequence>

      {/* Sequence 3: The Architecture (00:17.00 - 00:51.60, 2076 frames) */}
      <Sequence from={1020} durationInFrames={2076} name="3. Architecture">
        <Seq3Architecture />
      </Sequence>

      {/* Sequence 4: The Drop (00:51.60 - 01:16.00, 1464 frames) */}
      <Sequence from={3096} durationInFrames={1464} name="4. The Drop">
        <Seq4TheDrop />
      </Sequence>

      {/* Sequence 5: Ecosystem & Mascot (01:16.00 - 01:33.00, 1020 frames) */}
      <Sequence from={4560} durationInFrames={1020} name="5. Ecosystem & Mascot">
        <Seq5Ecosystem />
      </Sequence>

      {/* Sequence 6: Resolution (01:33.00 - 01:48.00, 900 frames) */}
      <Sequence from={5580} durationInFrames={900} name="6. Resolution">
        <Seq6Resolution />
      </Sequence>
    </AbsoluteFill>
  );
};
