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

      {/* Sequence 1: The Genesis (00:00.00 - 00:04.00, 240 frames) */}
      <Sequence from={0} durationInFrames={240} name="1. Genesis">
        <Seq1Genesis />
      </Sequence>

      {/* Sequence 2: Command Center (00:04.00 - 00:16.00, 720 frames) */}
      <Sequence from={240} durationInFrames={720} name="2. Command Center">
        <Seq2Command />
      </Sequence>

      {/* Sequence 3: The Architecture (00:16.00 - 00:37.40, 1284 frames) */}
      <Sequence from={960} durationInFrames={1284} name="3. Architecture">
        <Seq3Architecture />
      </Sequence>

      {/* Sequence 4: The Drop (00:37.40 - 00:55.00, 1056 frames) */}
      <Sequence from={2244} durationInFrames={1056} name="4. The Drop">
        <Seq4TheDrop />
      </Sequence>

      {/* Sequence 5: Ecosystem & Mascot (00:55.00 - 01:07.00, 720 frames) */}
      <Sequence from={3300} durationInFrames={720} name="5. Ecosystem & Mascot">
        <Seq5Ecosystem />
      </Sequence>

      {/* Sequence 6: Resolution (01:07.00 - 01:16.00, 540 frames) */}
      <Sequence from={4020} durationInFrames={540} name="6. Resolution">
        <Seq6Resolution />
      </Sequence>
    </AbsoluteFill>
  );
};
