import { CORE_STEPS } from "./stepsCatalog";
import { EXTENDED_STEPS } from "./stepsCatalogExtended";
import { TourCategory, WalkthroughStep } from "./types";

export const ALL_WALKTHROUGH_STEPS: WalkthroughStep[] = [
  ...CORE_STEPS,
  ...EXTENDED_STEPS,
];

export const TOUR_CATEGORIES: TourCategory[] = [
  {
    id: "sidebar",
    label: "Sidebar & Navigation",
    startIndex: 0,
    count: 15,
    route: "/dashboard",
  },
  {
    id: "settings",
    label: "Settings & AI Gateway",
    startIndex: 15,
    count: 10,
    route: "/settings",
  },
  {
    id: "dashboard",
    label: "Command Workspace",
    startIndex: 25,
    count: 12,
    route: "/dashboard",
  },
  {
    id: "profile",
    label: "Career Profile Studio",
    startIndex: 37,
    count: 15,
    route: "/profile",
  },
  {
    id: "agents",
    label: "Auto-Apply Agents",
    startIndex: 52,
    count: 15,
    route: "/agents",
  },
  {
    id: "jobs",
    label: "Jobs Explorer",
    startIndex: 67,
    count: 12,
    route: "/jobs",
  },
  {
    id: "applications",
    label: "Applications Pipeline",
    startIndex: 79,
    count: 10,
    route: "/applications",
  },
  {
    id: "integrations",
    label: "Integrations & Email",
    startIndex: 89,
    count: 10,
    route: "/integrations",
  },
  {
    id: "analytics",
    label: "Analytics & Formats",
    startIndex: 99,
    count: 6,
    route: "/analytics",
  },
];

export function findCategoryForStep(stepIndex: number): TourCategory | null {
  for (const cat of TOUR_CATEGORIES) {
    if (stepIndex >= cat.startIndex && stepIndex < cat.startIndex + cat.count) {
      return cat;
    }
  }
  return null;
}
