export type TourPlacement = "top" | "bottom" | "left" | "right" | "auto";

export interface WalkthroughStep {
  id: string;
  category: string;
  title: string;
  description: string;
  route: string;
  selector: string;
  placement?: TourPlacement;
  actionHint?: string;
}

export interface TourCategory {
  id: string;
  label: string;
  startIndex: number;
  count: number;
  route: string;
}

export interface WalkthroughContextValue {
  isOpen: boolean;
  activeStepIndex: number;
  currentStep: WalkthroughStep | null;
  totalSteps: number;
  progressPercent: number;
  categories: TourCategory[];
  activeCategory: TourCategory | null;
  startTour: (startIndexOrCategory?: number | string) => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
  jumpToStep: (index: number) => void;
  jumpToCategory: (categoryId: string) => void;
  resetTour: () => void;
  hasCompleted: boolean;
}
