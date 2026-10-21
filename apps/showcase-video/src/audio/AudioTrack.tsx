import React from "react";
import { Audio, staticFile, useCurrentFrame, interpolate } from "remotion";

export const AudioTrack: React.FC = () => {
  const frame = useCurrentFrame();

  // Master volume envelope for exact 60.00s (3600 frames @ 60 FPS)
  // Subtle initial fade-in (10 frames) to prevent click
  // Intentional musical fade-out during final 120 frames (58.0s - 60.0s)
  const volume = interpolate(
    frame,
    [0, 10, 3480, 3595],
    [0.0, 1.0, 1.0, 0.0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  return (
    <Audio
      src={staticFile("soundtrack.mp3")}
      volume={volume}
      startFrom={0}
      endAt={3600}
    />
  );
};
