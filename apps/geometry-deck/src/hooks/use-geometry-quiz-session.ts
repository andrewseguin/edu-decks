import { useState, useEffect, useCallback, useRef } from "react";
import type { TopicType, MeasurementUnit, GeometryCard } from "@/lib/types";
import { generateGeometryCard } from "@/lib/card-generator";

type UseGeometryQuizSessionOptions = {
  activeTopics: TopicType[];
  measurementUnit: MeasurementUnit;
  includeReverseProblems?: boolean;
  autoPlayAudio: boolean;
  onSpeak: (text: string, onEnd?: () => void) => void;
  onPlayChime: (correct: boolean) => void;
  onExit?: () => void;
};

export function useGeometryQuizSession({
  activeTopics,
  measurementUnit,
  includeReverseProblems = true,
  autoPlayAudio,
  onSpeak,
  onPlayChime,
}: UseGeometryQuizSessionOptions) {
  const [currentProblem, setCurrentProblem] = useState<GeometryCard | null>(null);
  const [inputVal, setInputVal] = useState<string>("");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isPlayingSound, setIsPlayingSound] = useState(false);

  const playTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const submitTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const soundTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isPlayingSoundRef = useRef(false);
  isPlayingSoundRef.current = isPlayingSound;

  const playAudioPrompt = useCallback(
    (card: GeometryCard) => {
      if (isPlayingSoundRef.current) return;
      setIsPlayingSound(true);
      if (soundTimeoutRef.current) clearTimeout(soundTimeoutRef.current);

      soundTimeoutRef.current = setTimeout(() => {
        setIsPlayingSound(false);
      }, 4000);

      const text = card.frontSpeechText || card.frontPrompt || "Find the missing value";
      onSpeak(text, () => {
        if (soundTimeoutRef.current) clearTimeout(soundTimeoutRef.current);
        setIsPlayingSound(false);
      });
    },
    [onSpeak]
  );

  const nextQuestion = useCallback(() => {
    if (submitTimeoutRef.current) clearTimeout(submitTimeoutRef.current);
    if (playTimeoutRef.current) clearTimeout(playTimeoutRef.current);

    const newCard = generateGeometryCard({
      activeTopics,
      activeCardTypes: ["calculation"],
      includeReverseProblems,
      measurementUnit,
    });

    setCurrentProblem(newCard);
    setInputVal("");
    setIsCorrect(null);

    if (autoPlayAudio) {
      playTimeoutRef.current = setTimeout(() => {
        playAudioPrompt(newCard);
      }, 300);
    }
  }, [activeTopics, includeReverseProblems, measurementUnit, autoPlayAudio, playAudioPrompt]);

  // Initial load
  useEffect(() => {
    nextQuestion();
    return () => {
      if (submitTimeoutRef.current) clearTimeout(submitTimeoutRef.current);
      if (playTimeoutRef.current) clearTimeout(playTimeoutRef.current);
      if (soundTimeoutRef.current) clearTimeout(soundTimeoutRef.current);
    };
  }, []);

  const checkAnswer = useCallback(
    (valToCheck: string) => {
      if (!currentProblem || currentProblem.numericAnswer == null || isCorrect !== null) return;
      const parsed = parseInt(valToCheck.trim(), 10);
      if (isNaN(parsed)) return;

      const expected = currentProblem.numericAnswer;
      if (parsed === expected) {
        setIsCorrect(true);
        onPlayChime(true);
        setScore((s) => s + 1);
        setStreak((st) => st + 1);

        if (autoPlayAudio && currentProblem.backSpeechText) {
          onSpeak(currentProblem.backSpeechText);
        }

        submitTimeoutRef.current = setTimeout(() => {
          nextQuestion();
        }, 800);
      } else {
        setIsCorrect(false);
        onPlayChime(false);
        setStreak(0);

        submitTimeoutRef.current = setTimeout(() => {
          setIsCorrect(null);
          setInputVal("");
        }, 600);
      }
    },
    [currentProblem, isCorrect, onPlayChime, autoPlayAudio, onSpeak, nextQuestion]
  );

  const handleKeyPress = useCallback(
    (digit: string) => {
      if (isCorrect !== null || !currentProblem) return;

      const newVal = inputVal + digit;
      if (newVal.length > 5) return; // Prevent excessive digits

      setInputVal(newVal);

      // Auto-validate if the entered length matches the expected answer's string length
      const expectedStr = String(currentProblem.numericAnswer ?? "");
      if (newVal.length >= expectedStr.length) {
        checkAnswer(newVal);
      }
    },
    [inputVal, isCorrect, currentProblem, checkAnswer]
  );

  const handleDelete = useCallback(() => {
    if (isCorrect !== null) return;
    setInputVal((prev) => prev.slice(0, -1));
  }, [isCorrect]);

  const handleSubmit = useCallback(() => {
    if (isCorrect !== null || !inputVal) return;
    checkAnswer(inputVal);
  }, [isCorrect, inputVal, checkAnswer]);

  // Physical keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;

      if (e.key >= "0" && e.key <= "9") {
        e.preventDefault();
        handleKeyPress(e.key);
      } else if (e.key === "Backspace") {
        e.preventDefault();
        handleDelete();
      } else if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyPress, handleDelete, handleSubmit]);

  return {
    currentProblem,
    inputVal,
    score,
    streak,
    isCorrect,
    isPlayingSound,
    playAudioPrompt,
    handleKeyPress,
    handleDelete,
    handleSubmit,
    nextQuestion,
  };
}
