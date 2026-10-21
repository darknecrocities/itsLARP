export const THEME = {
  colors: {
    bg: "#08080a",
    bgElevated: "#0f0f13",
    bgCard: "#141419",
    border: "#27272a",
    borderLight: "rgba(255, 255, 255, 0.12)",
    ink: "#ffffff",
    inkMuted: "#a1a1aa",
    inkSubtle: "#71717a",
    accentEmerald: "#10b981",
    accentAmber: "#f59e0b",
    accentPurple: "#a855f7",
    glow: "rgba(255, 255, 255, 0.08)",
  },
  fonts: {
    display: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
    mono: '"SF Mono", "JetBrains Mono", "Menlo", monospace',
  },
  springs: {
    // Calibrated for 60 FPS
    snappy: { damping: 22, stiffness: 240, mass: 0.9 },
    cinematic: { damping: 32, stiffness: 140, mass: 1.2 },
    impact: { damping: 16, stiffness: 340, mass: 0.7 },
    glide: { damping: 45, stiffness: 90, mass: 1.6 },
  },
};
