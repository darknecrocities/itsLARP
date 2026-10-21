export type MascotMood = "idle" | "working" | "celebrating" | "curious" | "sleeping";

export type MascotSize = "xs" | "sm" | "md" | "lg" | "xl" | "hero";

export interface MascotInteractiveProps {
  size?: MascotSize;
  mood?: MascotMood;
  interactive?: boolean;
  showDialogue?: boolean;
  dialogueText?: string;
  className?: string;
  onClick?: () => void;
}

export interface MascotCompanionCardProps {
  title?: string;
  statusLabel?: string;
  customQuote?: string;
  showQuickActions?: boolean;
  className?: string;
}
