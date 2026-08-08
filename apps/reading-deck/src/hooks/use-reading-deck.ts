"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import useLocalStorage from "@/hooks/use-local-storage";
import { DisplayContent, ReadingDeckSettings } from "@/lib/types";
import { HARD_WORDS } from "@/lib/words";
import {
  shuffle,
  getPossibleWords,
  createInitialLetterCard,
  createLetterCard,
  createWordCard,
} from "@/lib/reading-generator";

type UseReadingDeckProps = {
  settings: ReadingDeckSettings;
  isMenuOpen: boolean;
};

export function useReadingDeck({ settings, isMenuOpen }: UseReadingDeckProps) {
  const availableLetters = useMemo(() => {
    return settings.selectedLetters.length > 0 ? settings.selectedLetters : [];
  }, [settings.selectedLetters]);

  const [lettersInCycle, setLettersInCycle] = useLocalStorage<string[]>(
    "first-read-cycle",
    []
  );
  const [wordsInCycle, setWordsInCycle] = useLocalStorage<string[]>(
    "first-read-word-cycle",
    []
  );

  const [history, setHistory] = useLocalStorage<DisplayContent[]>(
    "first-read-history",
    [createInitialLetterCard(availableLetters)]
  );
  const [historyIndex, setHistoryIndex] = useState(
    Math.max(0, history.length - 1)
  );
  const displayContent = history[historyIndex] ?? createInitialLetterCard(availableLetters);
  const displayContentRef = useRef<DisplayContent>(displayContent);

  const [cardCount, setCardCount] = useState(0);

  const lastChangeTimeRef = useRef(0);
  const isMenuOpenRef = useRef(isMenuOpen);

  useEffect(() => {
    displayContentRef.current = displayContent;
  }, [displayContent]);

  useEffect(() => {
    isMenuOpenRef.current = isMenuOpen;
  }, [isMenuOpen]);

  useEffect(() => {
    setLettersInCycle([]);
  }, [availableLetters, setLettersInCycle]);

  useEffect(() => {
    setWordsInCycle([]);
  }, [availableLetters, settings.wordDifficulty, setWordsInCycle]);

  const showNextContent = useCallback(
    (force = false, isInteraction = false, resetHistory = false) => {
      if (isMenuOpenRef.current && !force) return;

      const now = Date.now();
      if (now - lastChangeTimeRef.current < 100) {
        return;
      }
      lastChangeTimeRef.current = now;

      if (availableLetters.length === 0) {
        return;
      }

      if (settings.gameMode === "words") {
        const possibleWords = getPossibleWords(
          availableLetters,
          settings.wordDifficulty,
          settings.selectedWordLengths
        );

        if (possibleWords.length === 0) {
          const newContent: DisplayContent = {
            key: "no-words-msg",
            type: "message",
            value: "No words can be formed with these letters.",
          };
          if (resetHistory) {
            setHistory([newContent]);
            setHistoryIndex(0);
          } else {
            const newHistory = history.slice(0, historyIndex + 1);
            setHistory([...newHistory, newContent]);
            setHistoryIndex(newHistory.length);
          }
          return;
        }

        if (isInteraction) {
          setCardCount((prev) => prev + 1);
        }

        let currentCycle = wordsInCycle.filter((w) =>
          settings.selectedWordLengths.includes(w.length)
        );

        // Filter out hard words if in easy mode
        if (settings.wordDifficulty === "easy") {
          currentCycle = currentCycle.filter((w) => !HARD_WORDS.includes(w));
        }

        if (currentCycle.length === 0) {
          currentCycle = shuffle([...possibleWords]);
          if (
            possibleWords.length > 1 &&
            currentCycle[0] === displayContentRef.current?.value
          ) {
            const randomIndex =
              1 + Math.floor(Math.random() * (currentCycle.length - 1));
            [currentCycle[0], currentCycle[randomIndex]] = [
              currentCycle[randomIndex],
              currentCycle[0],
            ];
          }
        }

        const newWord = currentCycle[0];
        const newCycle = currentCycle.slice(1);
        setWordsInCycle(newCycle);

        const newContent = createWordCard(newWord);
        if (resetHistory) {
          setHistory([newContent]);
          setHistoryIndex(0);
        } else {
          const newHistory = history.slice(0, historyIndex + 1);
          setHistory([...newHistory, newContent]);
          setHistoryIndex(newHistory.length);
        }
        return;
      }

      // Letters mode
      if (isInteraction) {
        setCardCount((prev) => prev + 1);
      }
      let currentCycle = lettersInCycle;
      if (currentCycle.length === 0) {
        currentCycle = shuffle([...availableLetters]);
        if (
          availableLetters.length > 1 &&
          currentCycle[0] === displayContentRef.current?.value
        ) {
          const randomIndex =
            1 + Math.floor(Math.random() * (currentCycle.length - 1));
          [currentCycle[0], currentCycle[randomIndex]] = [
            currentCycle[randomIndex],
            currentCycle[0],
          ];
        }
      }

      const newLetter = currentCycle[0];
      const newCycle = currentCycle.slice(1);
      setLettersInCycle(newCycle);

      const newContent = createLetterCard(newLetter);
      if (resetHistory) {
        setHistory([newContent]);
        setHistoryIndex(0);
      } else {
        const newHistory = history.slice(0, historyIndex + 1);
        setHistory([...newHistory, newContent]);
        setHistoryIndex(newHistory.length);
      }
    },
    [
      availableLetters,
      lettersInCycle,
      setLettersInCycle,
      settings.gameMode,
      settings.wordDifficulty,
      settings.selectedWordLengths,
      history,
      historyIndex,
      setHistory,
      wordsInCycle,
      setWordsInCycle,
    ]
  );

  const prevSelectedLettersRef = useRef<string[]>(settings.selectedLetters);

  useEffect(() => {
    if (
      settings.gameMode === "words" &&
      prevSelectedLettersRef.current.join() !== settings.selectedLetters.join()
    ) {
      showNextContent(true, false, true);
      prevSelectedLettersRef.current = settings.selectedLetters;
    }
  }, [settings.gameMode, settings.selectedLetters, showNextContent]);

  useEffect(() => {
    if (settings.gameMode === "letters") {
      // If selectedLetters is empty, always show the message.
      if (settings.selectedLetters.length === 0) {
        if (
          history.length === 1 &&
          history[0].type === "message" &&
          history[0].key === "no-letters"
        ) {
          prevSelectedLettersRef.current = settings.selectedLetters;
          return;
        }

        const newContent: DisplayContent = {
          key: "no-letters",
          type: "message",
          value: "Choose some letters in the menu!",
        };
        setHistory([newContent]);
        setHistoryIndex(0);
        prevSelectedLettersRef.current = settings.selectedLetters;
        return;
      }

      // A brand new first letter was added (or hydrating from empty). Show it immediately.
      if (
        prevSelectedLettersRef.current.length === 0 &&
        settings.selectedLetters.length > 0
      ) {
        const firstLetter = settings.selectedLetters[0];
        const newContent = createLetterCard(firstLetter, "new-letter-added");
        setHistory([newContent]);
        setHistoryIndex(0);
        prevSelectedLettersRef.current = settings.selectedLetters;
        return;
      }

      // Handle state corrections
      const newContent = (prevDisplayContent: DisplayContent): DisplayContent => {
        // Hydration fix: Display is a message, but we have letters now.
        if (prevDisplayContent.type === "message") {
          const firstLetter = settings.selectedLetters[0];
          return createLetterCard(firstLetter, "hydration-fix");
        }

        // Deselection fix: Displayed letter is no longer in the set.
        if (
          prevDisplayContent.type === "letter" &&
          !settings.selectedLetters.includes(prevDisplayContent.value)
        ) {
          const firstLetter = settings.selectedLetters[0];
          return createLetterCard(firstLetter, "update-from-selection");
        }

        return prevDisplayContent;
      };

      const updatedContent = newContent(displayContent);
      const lettersChanged =
        prevSelectedLettersRef.current.length > 0 &&
        prevSelectedLettersRef.current.join() !== settings.selectedLetters.join();

      if (updatedContent !== displayContent || lettersChanged) {
        setHistory([updatedContent]);
        setHistoryIndex(0);
      }

      prevSelectedLettersRef.current = settings.selectedLetters;
    }
  }, [settings.gameMode, settings.selectedLetters, history, displayContent, setHistory]);

  const prevGameModeRef = useRef(settings.gameMode);
  useEffect(() => {
    if (prevGameModeRef.current !== settings.gameMode) {
      showNextContent(true, false, true);
      prevGameModeRef.current = settings.gameMode;
    }
  }, [settings.gameMode, showNextContent]);

  const prevWordSettingsRef = useRef({
    length: settings.selectedWordLengths.join(),
    diff: settings.wordDifficulty,
  });
  useEffect(() => {
    const prev = prevWordSettingsRef.current;
    const curr = {
      length: settings.selectedWordLengths.join(),
      diff: settings.wordDifficulty,
    };
    if (prev.length !== curr.length || prev.diff !== curr.diff) {
      if (settings.gameMode === "words") {
        showNextContent(true, false, true);
      }
      prevWordSettingsRef.current = curr;
    }
  }, [settings.selectedWordLengths, settings.wordDifficulty, settings.gameMode, showNextContent]);

  const handleNextCard = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => prev + 1);
    } else {
      showNextContent(false, true);
    }
  }, [historyIndex, history.length, showNextContent]);

  const handlePrevCard = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1);
    }
  }, [historyIndex]);

  const handleTap = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => prev + 1);
    } else {
      showNextContent(false, true);
    }
  }, [historyIndex, history.length, showNextContent]);

  return {
    displayContent,
    cardCount,
    handleNextCard,
    handlePrevCard,
    handleTap,
  };
}
