import { useState, useEffect, useCallback, useRef } from "react";
import { MathOperation, MathProblem, Fraction, FractionDenominatorMode, FractionMaxDenominator } from "@/lib/types";
import { generateMathProblem } from "@/lib/math-generator";

export function parseFractionValue(str: string): number | null {
  const parts = str.trim().split('/');
  if (parts.length === 1) {
    const val = parseFloat(parts[0]);
    return isNaN(val) ? null : val;
  }
  if (parts.length === 2) {
    if (!parts[0] || !parts[1]) return null;
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
  fractionDenominatorMode?: FractionDenominatorMode;
  fractionMaxDenominator?: FractionMaxDenominator;
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
  fractionDenominatorMode = 'all',
  fractionMaxDenominator = 8,
  autoPlayAudio,
  onSpeak,
  onPlayChime,
}: UseQuizSessionOptions) {
  const [currentProblem, setCurrentProblem] = useState<MathProblem | null>(null);
  const [numInput, setNumInput] = useState<string>("");
  const [denInput, setDenInput] = useState<string>("");
  const [activeFractionSlot, setActiveFractionSlot] = useState<"numerator" | "denominator">("numerator");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isPlayingSound, setIsPlayingSound] = useState(false);

  const fractionStateRef = useRef<{
    num: string;
    den: string;
    slot: "numerator" | "denominator";
  }>({ num: "", den: "", slot: "numerator" });

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
      showFractions,
      fractionDenominatorMode,
      fractionMaxDenominator
    );
    setCurrentProblem(problem);
    fractionStateRef.current = { num: "", den: "", slot: "numerator" };
    setNumInput("");
    setDenInput("");
    setActiveFractionSlot("numerator");
    setIsCorrect(null);

    if (autoPlayAudio) {
      playTimeoutRef.current = setTimeout(() => {
        playAudioPrompt(problem);
      }, 400);
    }
  }, [activeOperations, minRange, maxRange, showWholeNumbers, showFractions, fractionDenominatorMode, fractionMaxDenominator, autoPlayAudio, playAudioPrompt]);

  useEffect(() => {
    nextQuestion();
    return () => {
      if (playTimeoutRef.current) clearTimeout(playTimeoutRef.current);
      if (submitTimeoutRef.current) clearTimeout(submitTimeoutRef.current);
      if (soundTimeoutRef.current) clearTimeout(soundTimeoutRef.current);
    };
  }, []);

  const inputVal = currentProblem?.isFraction
    ? denInput
      ? `${numInput}/${denInput}`
      : activeFractionSlot === "denominator"
      ? `${numInput}/`
      : numInput
    : numInput;

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
          fractionStateRef.current = { num: "", den: "", slot: "numerator" };
          setNumInput("");
          setDenInput("");
          setActiveFractionSlot("numerator");
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
        if (fractionStateRef.current.slot === "numerator" || !currentProblem.isFraction) {
          if (fractionStateRef.current.num === "") {
            fractionStateRef.current.num = "-";
            setNumInput("-");
          }
        }
        return;
      }

      if (digit === "/") {
        if (showFractions || currentProblem.isFraction) {
          fractionStateRef.current.slot = "denominator";
          setActiveFractionSlot("denominator");
        }
        return;
      }

      if (currentProblem.isFraction) {
        if (fractionStateRef.current.slot === "numerator") {
          if (fractionStateRef.current.num.length < 6) {
            fractionStateRef.current.num += digit;
            setNumInput(fractionStateRef.current.num);
          }

          const curNum = fractionStateRef.current.num;
          const curDen = fractionStateRef.current.den;
          const combined = curDen ? `${curNum}/${curDen}` : curNum;
          const parsedVal = parseFractionValue(combined);
          const isExactMatch = combined.trim() === currentProblem.answerText.trim();
          const isNumericMatch =
            parsedVal !== null &&
            Math.abs(parsedVal - currentProblem.answer) < 0.0001 &&
            (combined.includes("/") || currentProblem.answerText === combined);

          if (isExactMatch || isNumericMatch) {
            handleSubmitInput(combined);
          }
        } else {
          if (fractionStateRef.current.den.length < 6) {
            fractionStateRef.current.den += digit;
            setDenInput(fractionStateRef.current.den);
          }

          const curNum = fractionStateRef.current.num;
          const curDen = fractionStateRef.current.den;
          const combined = `${curNum || "0"}/${curDen}`;
          const parsedVal = parseFractionValue(combined);
          const isExactMatch = combined.trim() === currentProblem.answerText.trim();
          const isNumericMatch =
            parsedVal !== null &&
            Math.abs(parsedVal - currentProblem.answer) < 0.0001 &&
            (combined.includes("/") || currentProblem.answerText === combined);

          if (isExactMatch || isNumericMatch) {
            handleSubmitInput(combined);
          }
        }
      } else {
        if (fractionStateRef.current.num.length < 10) {
          fractionStateRef.current.num += digit;
          setNumInput(fractionStateRef.current.num);
        }

        const curNum = fractionStateRef.current.num;
        const parsedVal = parseFractionValue(curNum);
        const isExactMatch = curNum.trim() === currentProblem.answerText.trim();
        const isNumericMatch =
          parsedVal !== null && Math.abs(parsedVal - currentProblem.answer) < 0.0001;

        if (isExactMatch || isNumericMatch) {
          handleSubmitInput(curNum);
        }
      }
    },
    [isCorrect, currentProblem, showFractions, handleSubmitInput]
  );

  const handleDelete = useCallback(() => {
    if (isCorrect !== null) return;
    if (currentProblem?.isFraction) {
      if (fractionStateRef.current.slot === "denominator") {
        if (fractionStateRef.current.den.length > 0) {
          fractionStateRef.current.den = fractionStateRef.current.den.slice(0, -1);
          setDenInput(fractionStateRef.current.den);
        } else {
          fractionStateRef.current.slot = "numerator";
          setActiveFractionSlot("numerator");
        }
      } else {
        fractionStateRef.current.num = fractionStateRef.current.num.slice(0, -1);
        setNumInput(fractionStateRef.current.num);
      }
    } else {
      fractionStateRef.current.num = fractionStateRef.current.num.slice(0, -1);
      setNumInput(fractionStateRef.current.num);
    }
  }, [isCorrect, currentProblem?.isFraction]);

  const onSelectNumerator = useCallback(() => {
    if (isCorrect !== null) return;
    fractionStateRef.current.slot = "numerator";
    setActiveFractionSlot("numerator");
  }, [isCorrect]);

  const onSelectDenominator = useCallback(() => {
    if (isCorrect !== null) return;
    fractionStateRef.current.slot = "denominator";
    setActiveFractionSlot("denominator");
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
    numPart: numInput,
    denPart: denInput,
    activeFractionSlot,
    score,
    streak,
    isCorrect,
    isPlayingSound,
    playAudioPrompt,
    handleKeyPress,
    handleDelete,
    handleSubmitInput,
    onSelectNumerator,
    onSelectDenominator,
  };
}
