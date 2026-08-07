import { useState, useEffect, useCallback, useRef } from "react";
import { MathOperation, MathProblem, Fraction } from "@/lib/types";
import { generateMathProblem } from "@/lib/math-generator";

export function parseFractionValue(str: string): number | null {
  const parts = str.trim().split('/');
  if (parts.length === 1) {
    const val = parseFloat(parts[0]);
    return isNaN(val) ? null : val;
  }
  if (parts.length === 2) {
    const n = parseFloat(parts[0]);
    const d = parseFloat(parts[1]);
    if (isNaN(n) || isNaN(d) || d === 0) return null;
    return n / d;
  }
  return null;
}

export function stringToFraction(str: string): Fraction | null {
  const parts = str.trim().split('/');
  if (parts.length === 2) {
    const n = parseInt(parts[0], 10);
    const d = parseInt(parts[1], 10);
    if (!isNaN(n) && !isNaN(d) && d > 0) {
      return { n, d };
    }
  }
  return null;
}

type UseQuizSessionOptions = {
  activeOperations: MathOperation[];
  minRange: number;
  maxRange: number;
  showWholeNumbers?: boolean;
  showFractions?: boolean;
  autoPlayAudio: boolean;
  onSpeak: (text: string, onEnd?: () => void) => void;
  onPlayChime: (correct: boolean) => void;
  onExit?: () => void;
};

export function useQuizSession({
  activeOperations,
  minRange,
  maxRange,
  showWholeNumbers = true,
  showFractions = false,
  autoPlayAudio,
  onSpeak,
  onPlayChime,
}: UseQuizSessionOptions) {
  const [currentProblem, setCurrentProblem] = useState<MathProblem | null>(null);
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
    (problem: MathProblem) => {
      if (isPlayingSoundRef.current) return;
      setIsPlayingSound(true);
      if (soundTimeoutRef.current) clearTimeout(soundTimeoutRef.current);

      // Fallback timer in case speech engine doesn't fire onEnd
      soundTimeoutRef.current = setTimeout(() => {
        setIsPlayingSound(false);
      }, 4000);

      onSpeak(problem.problemSpeechText, () => {
        if (soundTimeoutRef.current) clearTimeout(soundTimeoutRef.current);
        setIsPlayingSound(false);
      });
    },
    [onSpeak]
  );

  const nextQuestion = useCallback(() => {
    if (playTimeoutRef.current) clearTimeout(playTimeoutRef.current);

    const problem = generateMathProblem(
      activeOperations,
      minRange,
      maxRange,
      showWholeNumbers,
      showFractions
    );
    setCurrentProblem(problem);
    setInputVal("");
    setIsCorrect(null);

    if (autoPlayAudio) {
      playTimeoutRef.current = setTimeout(() => {
        playAudioPrompt(problem);
      }, 400);
    }
  }, [activeOperations, minRange, maxRange, showWholeNumbers, showFractions, autoPlayAudio, playAudioPrompt]);

  useEffect(() => {
    nextQuestion();
    return () => {
      if (playTimeoutRef.current) clearTimeout(playTimeoutRef.current);
      if (submitTimeoutRef.current) clearTimeout(submitTimeoutRef.current);
      if (soundTimeoutRef.current) clearTimeout(soundTimeoutRef.current);
    };
  }, []);

  const handleSubmitInput = useCallback(
    (submittedText: string) => {
      if (!currentProblem || isCorrect !== null || !submittedText) return;

      const parsedUserVal = parseFractionValue(submittedText);
      const isExactStringMatch = submittedText.trim() === currentProblem.answerText.trim();
      const isNumericMatch = parsedUserVal !== null && Math.abs(parsedUserVal - currentProblem.answer) < 0.0001;

      const isAnswerCorrect = isExactStringMatch || isNumericMatch;

      if (submitTimeoutRef.current) clearTimeout(submitTimeoutRef.current);

      if (isAnswerCorrect) {
        setIsCorrect(true);
        setScore((s) => s + 1);
        setStreak((s) => s + 1);
        onPlayChime(true);

        submitTimeoutRef.current = setTimeout(() => {
          nextQuestion();
        }, 800);
      } else {
        setIsCorrect(false);
        setStreak(0);
        onPlayChime(false);

        submitTimeoutRef.current = setTimeout(() => {
          setInputVal("");
          setIsCorrect(null);
        }, 700);
      }
    },
    [currentProblem, isCorrect, nextQuestion, onPlayChime]
  );

  const handleKeyPress = useCallback(
    (digit: string) => {
      if (isCorrect !== null || !currentProblem) return;

      if (digit === "-") {
        if (inputVal === "") setInputVal("-");
        return;
      }

      if (digit === "/") {
        if ((showFractions || currentProblem.isFraction) && inputVal && !inputVal.includes("/")) {
          const newInput = inputVal + "/";
          setInputVal(newInput);
        }
        return;
      }

      if (inputVal.length >= 6) return;

      const newInput = inputVal + digit;
      setInputVal(newInput);

      if (newInput === currentProblem.answerText) {
        handleSubmitInput(newInput);
      }
    },
    [inputVal, isCorrect, currentProblem, showFractions, handleSubmitInput]
  );

  const handleDelete = useCallback(() => {
    if (isCorrect !== null) return;
    setInputVal((prev) => prev.slice(0, -1));
  }, [isCorrect]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") {
        handleKeyPress(e.key);
      } else if (e.key === "-") {
        handleKeyPress("-");
      } else if (e.key === "/" && (showFractions || currentProblem?.isFraction)) {
        handleKeyPress("/");
      } else if (e.key === "Backspace" || e.key === "Delete") {
        handleDelete();
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleSubmitInput(inputVal);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyPress, handleDelete, handleSubmitInput, inputVal, showFractions, currentProblem?.isFraction]);

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
    handleSubmitInput,
  };
}
