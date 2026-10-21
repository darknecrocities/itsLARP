"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ALL_WALKTHROUGH_STEPS, TOUR_CATEGORIES, findCategoryForStep } from "./walkthroughSteps";
import { TourCategory, WalkthroughContextValue, WalkthroughStep } from "./types";

const WalkthroughContext = createContext<WalkthroughContextValue | null>(null);

const STORAGE_KEY = "itslarp_walkthrough_completed";
const PROGRESS_KEY = "itslarp_walkthrough_last_step";

export function WalkthroughProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);

  // Rehydrate completed state from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const completed = localStorage.getItem(STORAGE_KEY) === "true";
      setHasCompleted(completed);
      const savedStep = localStorage.getItem(PROGRESS_KEY);
      if (savedStep) {
        const parsed = parseInt(savedStep, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed < ALL_WALKTHROUGH_STEPS.length) {
          setActiveStepIndex(parsed);
        }
      }
    }
  }, []);

  const currentStep: WalkthroughStep | null = isOpen
    ? ALL_WALKTHROUGH_STEPS[activeStepIndex] ?? null
    : null;

  const totalSteps = ALL_WALKTHROUGH_STEPS.length;
  const progressPercent = totalSteps > 0
    ? Math.round(((activeStepIndex + 1) / totalSteps) * 100)
    : 0;

  const activeCategory: TourCategory | null = findCategoryForStep(activeStepIndex);

  const navigateToStep = useCallback(
    (index: number) => {
      if (index < 0 || index >= totalSteps) return;
      const targetStep = ALL_WALKTHROUGH_STEPS[index];
      if (!targetStep) return;

      setActiveStepIndex(index);
      if (typeof window !== "undefined") {
        localStorage.setItem(PROGRESS_KEY, String(index));
      }

      if (pathname !== targetStep.route) {
        router.push(targetStep.route);
      }
    },
    [pathname, router, totalSteps]
  );

  const startTour = useCallback(
    (startIndexOrCategory?: number | string) => {
      let startIndex = 0;
      if (typeof startIndexOrCategory === "number") {
        startIndex = Math.max(0, Math.min(startIndexOrCategory, totalSteps - 1));
      } else if (typeof startIndexOrCategory === "string") {
        const cat = TOUR_CATEGORIES.find((c) => c.id === startIndexOrCategory);
        if (cat) {
          startIndex = cat.startIndex;
        }
      }
      setIsOpen(true);
      navigateToStep(startIndex);
    },
    [navigateToStep, totalSteps]
  );

  const nextStep = useCallback(() => {
    if (activeStepIndex < totalSteps - 1) {
      navigateToStep(activeStepIndex + 1);
    } else {
      // Completed full tour
      setIsOpen(false);
      setHasCompleted(true);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, "true");
      }
    }
  }, [activeStepIndex, navigateToStep, totalSteps]);

  const prevStep = useCallback(() => {
    if (activeStepIndex > 0) {
      navigateToStep(activeStepIndex - 1);
    }
  }, [activeStepIndex, navigateToStep]);

  const skipTour = useCallback(() => {
    setIsOpen(false);
  }, []);

  const jumpToStep = useCallback(
    (index: number) => {
      navigateToStep(index);
    },
    [navigateToStep]
  );

  const jumpToCategory = useCallback(
    (categoryId: string) => {
      const cat = TOUR_CATEGORIES.find((c) => c.id === categoryId);
      if (cat) {
        navigateToStep(cat.startIndex);
      }
    },
    [navigateToStep]
  );

  const resetTour = useCallback(() => {
    setActiveStepIndex(0);
    setHasCompleted(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(PROGRESS_KEY);
    }
  }, []);

  // Keyboard navigation shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        skipTour();
      } else if (e.key === "ArrowRight") {
        nextStep();
      } else if (e.key === "ArrowLeft") {
        prevStep();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, skipTour, nextStep, prevStep]);

  return (
    <WalkthroughContext.Provider
      value={{
        isOpen,
        activeStepIndex,
        currentStep,
        totalSteps,
        progressPercent,
        categories: TOUR_CATEGORIES,
        activeCategory,
        startTour,
        nextStep,
        prevStep,
        skipTour,
        jumpToStep,
        jumpToCategory,
        resetTour,
        hasCompleted,
      }}
    >
      {children}
    </WalkthroughContext.Provider>
  );
}

export function useWalkthrough(): WalkthroughContextValue {
  const ctx = useContext(WalkthroughContext);
  if (!ctx) {
    throw new Error("useWalkthrough must be used within a WalkthroughProvider");
  }
  return ctx;
}
