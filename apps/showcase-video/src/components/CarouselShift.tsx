import React from "react";
import { useCurrentFrame, interpolate } from "remotion";

interface CarouselShiftProps {
  items: React.ReactNode[];
  cardWidth?: number;
  gap?: number;
  speed?: number; // pixels per frame
  style?: React.CSSProperties;
}

export const CarouselShift: React.FC<CarouselShiftProps> = ({
  items,
  cardWidth = 420,
  gap = 32,
  speed = 4,
  style,
}) => {
  const frame = useCurrentFrame();

  const totalWidth = (cardWidth + gap) * items.length;
  const currentOffset = (frame * speed) % totalWidth;

  return (
    <div
      style={{
        display: "flex",
        gap,
        transform: `translateX(${-currentOffset}px)`,
        willChange: "transform",
        ...style,
      }}
    >
      {/* Double items for infinite wrap */}
      {[...items, ...items].map((child, idx) => (
        <div
          key={idx}
          style={{
            width: cardWidth,
            flexShrink: 0,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
};
