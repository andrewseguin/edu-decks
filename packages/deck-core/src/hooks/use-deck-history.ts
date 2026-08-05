"use client";

import { useState, useCallback, useEffect } from "react";

export type UseDeckHistoryOptions<TItem> = {
  generateNext: () => TItem;
  autoPlayAudio?: boolean;
  isQuizActive?: boolean;
  speak?: (item: TItem, isFlipped: boolean) => void;
  hydrated?: boolean;
};

export function useDeckHistory<TItem>({
  generateNext,
  autoPlayAudio = false,
  isQuizActive = false,
  speak,
  hydrated = true,
}: UseDeckHistoryOptions<TItem>) {
  const [history, setHistory] = useState<TItem[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [cardCount, setCardCount] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [slideDirection, setSlideDirection] = useState<"next" | "prev">("next");

  const nextCard = useCallback(
    (autoPlay: boolean = true) => {
      setSlideDirection("next");
      setIsFlipped(false);
      const newItem = generateNext();
      setHistory((prev) => {
        const nextHist = [...prev, newItem];
        setHistoryIndex(nextHist.length - 1);
        return nextHist;
      });
      setCardCount((c) => c + 1);

      if (autoPlayAudio && !isQuizActive && autoPlay && speak) {
        speak(newItem, false);
      }
    },
    [generateNext, autoPlayAudio, isQuizActive, speak]
  );

  useEffect(() => {
    if (hydrated && history.length === 0) {
      nextCard(true);
    }
  }, [hydrated, history.length, nextCard]);

  const handlePrevCard = useCallback(() => {
    setSlideDirection("prev");
    setIsFlipped(false);
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      const item = history[prevIdx];
      if (autoPlayAudio && !isQuizActive && speak && item) {
        speak(item, false);
      }
    }
  }, [historyIndex, history, autoPlayAudio, isQuizActive, speak]);

  const handleNextCard = useCallback(() => {
    setSlideDirection("next");
    setIsFlipped(false);
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      const item = history[nextIdx];
      if (autoPlayAudio && !isQuizActive && speak && item) {
        speak(item, false);
      }
    } else {
      nextCard(true);
    }
  }, [historyIndex, history, autoPlayAudio, isQuizActive, speak, nextCard]);

  const handleCardTap = useCallback(() => {
    if (!isFlipped) {
      setIsFlipped(true);
      const currentItem = history[historyIndex];
      if (autoPlayAudio && !isQuizActive && speak && currentItem) {
        speak(currentItem, true);
      }
    } else {
      handleNextCard();
    }
  }, [isFlipped, history, historyIndex, autoPlayAudio, isQuizActive, speak, handleNextCard]);

  const currentItem = historyIndex >= 0 ? history[historyIndex] : null;

  return {
    history,
    historyIndex,
    currentItem,
    currentProblem: currentItem,
    cardCount,
    isFlipped,
    slideDirection,
    handlePrevCard,
    handleNextCard,
    handleCardTap,
  };
}
