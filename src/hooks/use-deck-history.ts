import { useState, useCallback, useEffect } from "react";
import { MathProblem, MathOperation } from "@/lib/types";
import { generateMathProblem } from "@/lib/math-generator";

type UseDeckHistoryOptions = {
  activeOperations: MathOperation[];
  minRange: number;
  maxRange: number;
  showWholeNumbers: boolean;
  showFractions: boolean;
  autoPlayAudio: boolean;
  isQuizActive: boolean;
  speak: (text: string) => void;
  hydrated: boolean;
};

export function useDeckHistory({
  activeOperations,
  minRange,
  maxRange,
  showWholeNumbers,
  showFractions,
  autoPlayAudio,
  isQuizActive,
  speak,
  hydrated,
}: UseDeckHistoryOptions) {
  const [history, setHistory] = useState<MathProblem[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [cardCount, setCardCount] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [slideDirection, setSlideDirection] = useState<"next" | "prev">("next");

  const nextCard = useCallback(
    (autoPlay: boolean = true) => {
      setSlideDirection("next");
      setIsFlipped(false);
      const newProblem = generateMathProblem(
        activeOperations,
        minRange,
        maxRange,
        showWholeNumbers,
        showFractions
      );
      setHistory((prev) => {
        const nextHist = [...prev, newProblem];
        setHistoryIndex(nextHist.length - 1);
        return nextHist;
      });
      setCardCount((c) => c + 1);

      if (autoPlayAudio && !isQuizActive && autoPlay) {
        speak(newProblem.problemSpeechText);
      }
    },
    [activeOperations, minRange, maxRange, showWholeNumbers, showFractions, autoPlayAudio, isQuizActive, speak]
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
      if (autoPlayAudio && !isQuizActive) {
        speak(history[prevIdx].problemSpeechText);
      }
    }
  }, [historyIndex, history, autoPlayAudio, isQuizActive, speak]);

  const handleNextCard = useCallback(() => {
    setSlideDirection("next");
    setIsFlipped(false);
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      if (autoPlayAudio && !isQuizActive) {
        speak(history[nextIdx].problemSpeechText);
      }
    } else {
      nextCard(true);
    }
  }, [historyIndex, history, autoPlayAudio, isQuizActive, speak, nextCard]);

  const handleCardTap = useCallback(() => {
    if (!isFlipped) {
      setIsFlipped(true);
      const currentProb = history[historyIndex];
      if (autoPlayAudio && !isQuizActive && currentProb) {
        speak(currentProb.fullSpeechText);
      }
    } else {
      handleNextCard();
    }
  }, [isFlipped, history, historyIndex, autoPlayAudio, isQuizActive, speak, handleNextCard]);

  const currentProblem = historyIndex >= 0 ? history[historyIndex] : null;

  return {
    history,
    historyIndex,
    currentProblem,
    cardCount,
    isFlipped,
    slideDirection,
    handlePrevCard,
    handleNextCard,
    handleCardTap,
  };
}
