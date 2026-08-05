"use client";

import { useState, useCallback } from "react";

export type DeckQuizState = {
  score: number;
  streak: number;
  isCorrect: boolean | null;
  setIsCorrect: (val: boolean | null) => void;
  recordAnswer: (correct: boolean) => void;
  resetScore: () => void;
};

export function useDeckQuizState(initialScore = 0, initialStreak = 0): DeckQuizState {
  const [score, setScore] = useState(initialScore);
  const [streak, setStreak] = useState(initialStreak);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const recordAnswer = useCallback((correct: boolean) => {
    setIsCorrect(correct);
    if (correct) {
      setScore((s) => s + 1);
      setStreak((st) => st + 1);
    } else {
      setStreak(0);
    }
  }, []);

  const resetScore = useCallback(() => {
    setScore(0);
    setStreak(0);
    setIsCorrect(null);
  }, []);

  return {
    score,
    streak,
    isCorrect,
    setIsCorrect,
    recordAnswer,
    resetScore,
  };
}
