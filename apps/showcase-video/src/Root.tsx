import React from "react";
import { Composition } from "remotion";
import { ShowcaseVideo } from "./ShowcaseVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="ItsLarpProductShowcase"
      component={ShowcaseVideo}
      durationInFrames={6480} // Exactly 108.000 seconds @ 60.000 FPS
      fps={60}
      width={1920}
      height={1080}
      defaultProps={{}}
    />
  );
};
