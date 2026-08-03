"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MathOperation, MathProblem, OPERATION_COLORS, Fraction } from "@/lib/types";
import { generateMathProblem } from "@/lib/math-generator";
import { FractionDisplay } from "./fraction-display";
import { Button } from "@/components/ui/button";
import { Volume2, X, Sparkles, Delete, CornerDownLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type QuizDisplayProps = {
  activeOperations: MathOperation[];
  minRange: number;
  maxRange: number;
  allowNegatives: boolean;
  showWholeNumbers?: boolean;
  showFractions?: boolean;
  autoPlayAudio: boolean;
  onSpeak: (text: string) => void;
  onPlayChime: (correct: boolean) => void;
  onExit: () => void;
};

function parseFractionValue(str: string): number | null {
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

function stringToFraction(str: string): Fraction | null {
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

export function QuizDisplay({
  activeOperations,
  minRange,
  maxRange,
  allowNegatives,
  showWholeNumbers = true,
  showFractions = false,
  autoPlayAudio,
  onSpeak,
  onPlayChime,
  onExit,
}: QuizDisplayProps) {
  const [currentProblem, setCurrentProblem] = useState<MathProblem | null>(null);
  const [inputVal, setInputVal] = useState<string>("");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isPlayingSound, setIsPlayingSound] = useState(false);

  const playTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const playAudioPrompt = useCallback((problem: MathProblem) => {
    setIsPlayingSound(true);
    onSpeak(problem.problemSpeechText);
    setTimeout(() => setIsPlayingSound(false), 1400);
  }, [onSpeak]);

  const nextQuestion = useCallback(() => {
    if (playTimeoutRef.current) clearTimeout(playTimeoutRef.current);

    const problem = generateMathProblem(
      activeOperations,
      minRange,
      maxRange,
      allowNegatives,
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
  }, [activeOperations, minRange, maxRange, allowNegatives, showWholeNumbers, showFractions, autoPlayAudio, playAudioPrompt]);

  useEffect(() => {
    nextQuestion();
    return () => {
      if (playTimeoutRef.current) clearTimeout(playTimeoutRef.current);
    };
  }, []);

  const handleSubmitInput = useCallback((submittedText: string) => {
    if (!currentProblem || isCorrect !== null || !submittedText) return;

    const parsedUserVal = parseFractionValue(submittedText);
    const isExactStringMatch = submittedText.trim() === currentProblem.answerText.trim();
    const isNumericMatch = parsedUserVal !== null && Math.abs(parsedUserVal - currentProblem.answer) < 0.0001;

    const isAnswerCorrect = isExactStringMatch || isNumericMatch;

    if (isAnswerCorrect) {
      setIsCorrect(true);
      setScore((s) => s + 1);
      setStreak((s) => s + 1);
      onPlayChime(true);

      setTimeout(() => {
        nextQuestion();
      }, 800);
    } else {
      setIsCorrect(false);
      setStreak(0);
      onPlayChime(false);

      setTimeout(() => {
        setInputVal("");
        setIsCorrect(null);
      }, 700);
    }
  }, [currentProblem, isCorrect, nextQuestion, onPlayChime]);

  const handleKeyPress = useCallback((digit: string) => {
    if (isCorrect !== null || !currentProblem) return;

    // Handle Negative sign if allowed
    if (digit === "-") {
      if (inputVal === "") setInputVal("-");
      return;
    }

    // Handle Fraction Slash /
    if (digit === "/") {
      if (inputVal && !inputVal.includes("/")) {
        const newInput = inputVal + "/";
        setInputVal(newInput);
      }
      return;
    }

    // Limit input length to max 6 characters
    if (inputVal.length >= 6) return;

    const newInput = inputVal + digit;
    setInputVal(newInput);

    // Auto-submit if input matches exact answer text
    if (newInput === currentProblem.answerText) {
      handleSubmitInput(newInput);
    }
  }, [inputVal, isCorrect, currentProblem, handleSubmitInput]);

  const handleDelete = useCallback(() => {
    if (isCorrect !== null) return;
    setInputVal((prev) => prev.slice(0, -1));
  }, [isCorrect]);

  // Physical Keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") {
        handleKeyPress(e.key);
      } else if (e.key === "-" || e.key === "/") {
        handleKeyPress(e.key);
      } else if (e.key === "Backspace" || e.key === "Delete") {
        handleDelete();
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleSubmitInput(inputVal);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyPress, handleDelete, handleSubmitInput, inputVal]);

  if (!currentProblem) return null;

  const opInfo = OPERATION_COLORS[currentProblem.operation];
  const userFraction = stringToFraction(inputVal);

  return (
    <div
      className="fixed inset-0 z-40 bg-background flex flex-col justify-between p-2 sm:p-4 select-none overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between w-full max-w-5xl mx-auto gap-2 shrink-0 h-9 sm:h-10">
        <Button
          variant="outline"
          size="sm"
          className="rounded-full gap-1.5 text-muted-foreground hover:text-foreground shrink-0 font-headline font-bold h-8 text-xs sm:text-sm"
          onClick={(e) => {
            e.stopPropagation();
            onExit();
          }}
        >
          <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Exit Quiz</span>
        </Button>

        {/* Audio Replay Button */}
        <Button
          size="sm"
          variant="ghost"
          className={cn(
            "rounded-full gap-1.5 px-3 py-1 font-headline font-bold text-xs sm:text-sm transition-transform active:scale-95 text-muted-foreground hover:text-foreground h-8",
            isPlayingSound ? "animate-pulse scale-105 text-primary" : ""
          )}
          onClick={(e) => {
            e.stopPropagation();
            if (currentProblem) playAudioPrompt(currentProblem);
          }}
          aria-label="Replay equation audio"
        >
          <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Listen</span>
        </Button>

        {/* Score & Streak Badge */}
        <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full font-bold text-xs sm:text-sm shrink-0 font-headline h-8">
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>{score}</span>
          {streak > 1 && (
            <span className="text-[10px] sm:text-xs bg-amber-500 text-white px-1.5 py-0.5 rounded-full font-black">
              🔥 {streak}
            </span>
          )}
        </div>
      </div>

      {/* Main Content Area: Responsive Stack (Portrait) vs Side-by-Side (Landscape / Short Screens) */}
      <div className="w-full max-w-5xl mx-auto flex-1 flex flex-col max-h-[600px]:flex-row landscape:flex-row items-center justify-center gap-2 sm:gap-4 min-h-0 py-1 px-2 sm:px-4">
        {/* Hero Equation Card */}
        <div className="w-full flex-1 flex items-center justify-center min-h-0 min-w-0 p-1">
          <div
            className={cn(
              "w-full rounded-3xl px-3 py-4 sm:px-6 sm:py-6 flex items-center justify-center relative cursor-pointer shadow-xl transition-all duration-300",
              "h-auto max-h-[160px] sm:max-h-[220px]",
              isCorrect === true && "border-4 border-emerald-400 shadow-emerald-500/30 scale-[1.02]",
              isCorrect === false && "border-4 border-destructive animate-shake"
            )}
            style={{
              backgroundColor: opInfo.hex,
              boxShadow:
                "0 1px 1px rgba(0,0,0,0.12), 0 2px 2px rgba(0,0,0,0.12), 0 4px 4px rgba(0,0,0,0.12), 0 8px 8px rgba(0,0,0,0.12)",
            }}
            onClick={() => playAudioPrompt(currentProblem)}
          >
            <div className="flex items-center justify-center text-center max-w-full">
              {/* First Number / Fraction */}
              {currentProblem.isFraction && currentProblem.frac1 ? (
                <FractionDisplay fraction={currentProblem.frac1} colorClass="text-cyan-300" size="md" />
              ) : (
                <span className="font-headline font-bold leading-none select-none text-cyan-300 [text-shadow:0_2px_8px_rgba(0,0,0,0.3)] text-2xl sm:text-4xl md:text-5xl lg:text-6xl shrink-0">
                  {currentProblem.num1}
                </span>
              )}

              {/* Operator */}
              <span className="font-headline font-normal leading-none select-none text-white/90 [text-shadow:3px_3px_6px_rgba(0,0,0,0.2)] text-2xl sm:text-4xl md:text-5xl lg:text-6xl mx-1 sm:mx-2.5 shrink-0">
                {currentProblem.operation}
              </span>

              {/* Second Number / Fraction */}
              {currentProblem.isFraction && currentProblem.frac2 ? (
                <FractionDisplay fraction={currentProblem.frac2} colorClass="text-amber-300" size="md" />
              ) : (
                <span className="font-headline font-bold leading-none select-none text-amber-300 [text-shadow:0_2px_8px_rgba(0,0,0,0.3)] text-2xl sm:text-4xl md:text-5xl lg:text-6xl shrink-0">
                  {currentProblem.num2}
                </span>
              )}

              {/* Equals Symbol */}
              <span className="font-headline font-normal leading-none select-none text-white/90 [text-shadow:3px_3px_6px_rgba(0,0,0,0.2)] text-2xl sm:text-4xl md:text-5xl lg:text-6xl ml-1 sm:ml-2.5 mr-1 sm:mr-2.5 shrink-0">
                =
              </span>

              {/* User Input / Question Mark Box */}
              <div className="relative inline-flex items-center justify-center px-0.5 shrink-0">
                <div
                  className={cn(
                    "min-w-[44px] sm:min-w-[70px] h-[40px] sm:h-[58px] px-2.5 flex items-center justify-center rounded-xl sm:rounded-2xl border-2 transition-all duration-200",
                    isCorrect === true
                      ? "bg-emerald-500 border-emerald-300 text-white shadow-lg"
                      : isCorrect === false
                      ? "bg-destructive/30 border-destructive text-white"
                      : inputVal
                      ? "bg-white/30 border-white text-white shadow-md"
                      : "bg-white/20 border-dashed border-white/40 text-white"
                  )}
                >
                  {inputVal ? (
                    userFraction ? (
                      <FractionDisplay fraction={userFraction} colorClass="text-white" size="sm" />
                    ) : (
                      <span className="font-headline font-bold leading-none text-white [text-shadow:3px_3px_6px_rgba(0,0,0,0.25)] text-xl sm:text-3xl md:text-4xl">
                        {inputVal}
                      </span>
                    )
                  ) : (
                    <span className="font-headline font-bold text-white/80 text-lg sm:text-2xl md:text-3xl">
                      ?
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side (Landscape) / Bottom Side (Portrait): Numeric Keypad Grid */}
        <div className="w-full max-w-[250px] sm:max-w-[290px] grid grid-cols-3 gap-1.5 sm:gap-2.5 shrink-0 my-auto p-1">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
            <button
              key={num}
              type="button"
              className="h-10 sm:h-12 rounded-2xl flex items-center justify-center font-headline font-bold text-xl sm:text-2xl shadow-md transition-all active:scale-95 bg-card text-card-foreground border-2 border-transparent hover:border-primary/40 hover:scale-[1.02] outline-none select-none"
              style={{
                backgroundColor: `${opInfo.hex}18`,
                color: opInfo.hex,
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleKeyPress(num);
              }}
            >
              {num}
            </button>
          ))}

          {/* Fraction Bar / Button */}
          <button
            type="button"
            className="h-10 sm:h-12 rounded-2xl flex items-center justify-center font-headline font-bold text-lg sm:text-xl shadow-md transition-all active:scale-95 bg-card text-card-foreground border-2 border-transparent hover:border-primary/40 hover:scale-[1.02] outline-none select-none"
            style={{
              backgroundColor: `${opInfo.hex}18`,
              color: opInfo.hex,
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleKeyPress("/");
            }}
            aria-label="Fraction bar"
          >
            /
          </button>

          {/* 0 Key */}
          <button
            type="button"
            className="h-10 sm:h-12 rounded-2xl flex items-center justify-center font-headline font-bold text-xl sm:text-2xl shadow-md transition-all active:scale-95 bg-card text-card-foreground border-2 border-transparent hover:border-primary/40 hover:scale-[1.02] outline-none select-none"
            style={{
              backgroundColor: `${opInfo.hex}18`,
              color: opInfo.hex,
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleKeyPress("0");
            }}
          >
            0
          </button>

          {/* Backspace Button */}
          <button
            type="button"
            className="h-10 sm:h-12 rounded-2xl flex items-center justify-center font-headline font-bold text-base sm:text-lg shadow-md transition-all active:scale-95 bg-card text-muted-foreground border-2 border-transparent hover:border-destructive/40 hover:text-destructive hover:scale-[1.02] outline-none select-none"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            aria-label="Delete last digit"
          >
            <Delete className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function getOpWord(op: MathOperation): string {
  switch (op) {
    case '+':
      return 'plus';
    case '-':
      return 'minus';
    case '×':
      return 'times';
    case '÷':
      return 'divided by';
  }
}
