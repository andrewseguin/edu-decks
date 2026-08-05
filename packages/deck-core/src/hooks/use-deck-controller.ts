"use client";

import { useState, useCallback, useEffect, useRef } from "react";

export type UseDeckControllerOptions = {
  itemCount: number;
  onNext?: () => void;
  onPrev?: () => void;
  onFlip?: (isFlipped: boolean) => void;
  onToggleQuiz?: () => void;
  enableShortcuts?: boolean;
};

export type DeckController = {
  currentIndex: number;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
  isFlipped: boolean;
  setIsFlipped: React.Dispatch<React.SetStateAction<boolean>>;
  slideDirection: "next" | "prev";
  setSlideDirection: React.Dispatch<React.SetStateAction<"next" | "prev">>;
  nextCard: () => void;
  prevCard: () => void;
  flipCard: () => void;
  handleTouchStart: (e: React.TouchEvent) => void;
  handleTouchEnd: (e: React.TouchEvent) => void;
};

export function useDeckController({
  itemCount,
  onNext,
  onPrev,
  onFlip,
  onToggleQuiz,
  enableShortcuts = true,
}: UseDeckControllerOptions): DeckController {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [slideDirection, setSlideDirection] = useState<"next" | "prev">("next");

  const touchStartXRef = useRef<number | null>(null);

  const nextCard = useCallback(() => {
    setSlideDirection("next");
    setIsFlipped(false);
    if (itemCount > 0) {
      setCurrentIndex((prev) => (prev + 1) % itemCount);
    }
    onNext?.();
  }, [itemCount, onNext]);

  const prevCard = useCallback(() => {
    setSlideDirection("prev");
    setIsFlipped(false);
    if (itemCount > 0) {
      setCurrentIndex((prev) => (prev - 1 + itemCount) % itemCount);
    }
    onPrev?.();
  }, [itemCount, onPrev]);

  const flipCard = useCallback(() => {
    setIsFlipped((f) => {
      const nextState = !f;
      onFlip?.(nextState);
      return nextState;
    });
  }, [onFlip]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      touchStartXRef.current = e.touches[0].clientX;
    }
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartXRef.current === null || e.changedTouches.length === 0) return;
      const diffX = e.changedTouches[0].clientX - touchStartXRef.current;
      touchStartXRef.current = null;
      if (diffX < -50) {
        nextCard();
      } else if (diffX > 50) {
        prevCard();
      }
    },
    [nextCard, prevCard]
  );

  useEffect(() => {
    if (!enableShortcuts) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        flipCard();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        nextCard();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevCard();
      } else if ((e.key === "q" || e.key === "Q") && onToggleQuiz) {
        e.preventDefault();
        onToggleQuiz();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enableShortcuts, flipCard, nextCard, prevCard, onToggleQuiz]);

  return {
    currentIndex,
    setCurrentIndex,
    isFlipped,
    setIsFlipped,
    slideDirection,
    setSlideDirection,
    nextCard,
    prevCard,
    flipCard,
    handleTouchStart,
    handleTouchEnd,
  };
}
