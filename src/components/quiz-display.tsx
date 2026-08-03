"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MathOperation, MathProblem, OPERATION_COLORS } from "@/lib/types";
import { generateMathProblem } from "@/lib/math-generator";
import { Button } from "@/components/ui/button";
import { Volume2, X, Sparkles, Delete, CornerDownLeft, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type QuizDisplayProps = {
  activeOperations: MathOperation[];
  minRange: number;
  maxRange: number;
  allowNegatives: boolean;
  autoPlayAudio: boolean;
  onSpeak: (text: string) => void;
  onPlayChime: (correct: boolean) => void;
  onExit: () => void;
};

export function QuizDisplay({
  activeOperations,
  minRange,
  maxRange,
  allowNegatives,
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
    onSpeak(`${problem.num1} ${getOpWord(problem.operation)} ${problem.num2}`);
    setTimeout(() => setIsPlayingSound(false), 1200);
  }, [onSpeak]);

  const nextQuestion = useCallback(() => {
    if (playTimeoutRef.current) clearTimeout(playTimeoutRef.current);

    const problem = generateMathProblem(
      activeOperations,
      minRange,
      maxRange,
      allowNegatives
    );
    setCurrentProblem(problem);
    setInputVal("");
    setIsCorrect(null);

    if (autoPlayAudio) {
      playTimeoutRef.current = setTimeout(() => {
        playAudioPrompt(problem);
      }, 400);
    }
  }, [activeOperations, minRange, maxRange, allowNegatives, autoPlayAudio, playAudioPrompt]);

  useEffect(() => {
    nextQuestion();
    return () => {
      if (playTimeoutRef.current) clearTimeout(playTimeoutRef.current);
    };
  }, []);

  const handleSubmitInput = useCallback((submittedText: string) => {
    if (!currentProblem || isCorrect !== null || !submittedText) return;

    const userNum = parseInt(submittedText, 10);

    if (userNum === currentProblem.answer) {
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

    // Limit input length to max 4 characters
    if (inputVal.length >= 4) return;

    const newInput = inputVal + digit;
    setInputVal(newInput);

    // Auto-submit if digit length matches expected answer length
    const expectedStr = currentProblem.answer.toString();
    if (newInput === expectedStr) {
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
      } else if (e.key === "-") {
        handleKeyPress("-");
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

  return (
    <div
      className="fixed inset-0 z-40 bg-background flex flex-col justify-between p-3 sm:p-6 animate-in fade-in duration-300 select-none overflow-y-auto"
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between w-full max-w-4xl mx-auto gap-2 shrink-0">
        <Button
          variant="outline"
          size="sm"
          className="rounded-full gap-1.5 text-muted-foreground hover:text-foreground shrink-0 font-headline font-bold"
          onPointerDown={(e) => {
            e.stopPropagation();
            onExit();
          }}
          onClick={(e) => {
            e.stopPropagation();
            onExit();
          }}
        >
          <X className="w-4 h-4" />
          <span className="hidden sm:inline">Exit Quiz</span>
        </Button>

        {/* Audio Replay Button */}
        <Button
          size="sm"
          variant="ghost"
          className={cn(
            "rounded-full gap-2 px-4 py-1.5 font-headline font-bold text-sm transition-transform active:scale-95 text-muted-foreground hover:text-foreground",
            isPlayingSound ? "animate-pulse scale-105 text-primary" : ""
          )}
          onPointerDown={(e) => {
            e.stopPropagation();
            if (currentProblem) playAudioPrompt(currentProblem);
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (currentProblem) playAudioPrompt(currentProblem);
          }}
          aria-label="Replay equation audio"
        >
          <Volume2 className="w-4 h-4" />
          <span>Listen</span>
        </Button>

        {/* Score & Streak Badge */}
        <div className="flex items-center gap-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3.5 py-1.5 rounded-full font-bold text-sm shrink-0 font-headline">
          <Sparkles className="w-4 h-4" />
          <span>{score}</span>
          {streak > 1 && (
            <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full font-black">
              🔥 {streak}
            </span>
          )}
        </div>
      </div>

      {/* Hero Equation Card */}
      <div className="w-full max-w-2xl mx-auto my-auto py-2 shrink-0 flex justify-center">
        <div
          className={cn(
            "w-full rounded-3xl p-5 sm:p-8 flex items-center justify-center relative cursor-pointer shadow-xl transition-all duration-300",
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
          <div className="flex items-center justify-center whitespace-nowrap text-center">
            {/* First Number (Cyan) */}
            <span className="font-headline font-bold leading-none select-none text-cyan-300 [text-shadow:0_2px_8px_rgba(0,0,0,0.3)] text-5xl sm:text-7xl md:text-8xl">
              {currentProblem.num1}
            </span>

            {/* Operator */}
            <span className="font-headline font-normal leading-none select-none text-white/90 [text-shadow:3px_3px_6px_rgba(0,0,0,0.2)] text-5xl sm:text-7xl md:text-8xl mx-2 sm:mx-4">
              {currentProblem.operation}
            </span>

            {/* Second Number (Orange) */}
            <span className="font-headline font-bold leading-none select-none text-amber-300 [text-shadow:0_2px_8px_rgba(0,0,0,0.3)] text-5xl sm:text-7xl md:text-8xl">
              {currentProblem.num2}
            </span>

            {/* Equals Symbol */}
            <span className="font-headline font-normal leading-none select-none text-white/90 [text-shadow:3px_3px_6px_rgba(0,0,0,0.2)] text-5xl sm:text-7xl md:text-8xl ml-2 sm:ml-4 mr-2 sm:mr-4">
              =
            </span>

            {/* User Input / Question Mark Box */}
            <div className="relative inline-flex items-center justify-center px-1">
              <div
                className={cn(
                  "min-w-[70px] sm:min-w-[100px] h-[60px] sm:h-[84px] px-4 flex items-center justify-center rounded-2xl border-2 transition-all duration-200",
                  isCorrect === true
                    ? "bg-emerald-500 border-emerald-300 text-white shadow-lg"
                    : isCorrect === false
                    ? "bg-destructive/30 border-destructive text-white"
                    : inputVal
                    ? "bg-white/30 border-white text-white shadow-md"
                    : "bg-white/20 border-dashed border-white/40 text-white animate-pulse"
                )}
              >
                {inputVal ? (
                  <span className="font-headline font-bold leading-none text-white [text-shadow:3px_3px_6px_rgba(0,0,0,0.25)] text-4xl sm:text-6xl md:text-7xl">
                    {inputVal}
                  </span>
                ) : (
                  <span className="font-headline font-bold text-white/80 text-3xl sm:text-5xl md:text-6xl">
                    ?
                  </span>
                )}
                {isCorrect === true && (
                  <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-white ml-2 animate-in zoom-in" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Numeric Keypad Grid (3x4 Layout) */}
      <div className="w-full max-w-sm mx-auto grid grid-cols-3 gap-2.5 sm:gap-3 shrink-0 pb-2">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
          <button
            key={num}
            className="h-14 sm:h-16 rounded-2xl flex items-center justify-center font-headline font-bold text-3xl sm:text-4xl shadow-md transition-all active:scale-95 bg-card text-card-foreground border-2 border-transparent hover:border-primary/40 hover:scale-[1.02] outline-none select-none"
            style={{
              backgroundColor: `${opInfo.hex}18`,
              color: opInfo.hex,
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
              handleKeyPress(num);
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleKeyPress(num);
            }}
          >
            {num}
          </button>
        ))}

        {/* Backspace Button */}
        <button
          className="h-14 sm:h-16 rounded-2xl flex items-center justify-center font-headline font-bold text-xl sm:text-2xl shadow-md transition-all active:scale-95 bg-card text-muted-foreground border-2 border-transparent hover:border-destructive/40 hover:text-destructive hover:scale-[1.02] outline-none select-none"
          onPointerDown={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
          aria-label="Delete last digit"
        >
          <Delete className="w-6 h-6 sm:w-7 sm:h-7" />
        </button>

        {/* 0 Key */}
        <button
          className="h-14 sm:h-16 rounded-2xl flex items-center justify-center font-headline font-bold text-3xl sm:text-4xl shadow-md transition-all active:scale-95 bg-card text-card-foreground border-2 border-transparent hover:border-primary/40 hover:scale-[1.02] outline-none select-none"
          style={{
            backgroundColor: `${opInfo.hex}18`,
            color: opInfo.hex,
          }}
          onPointerDown={(e) => {
            e.stopPropagation();
            handleKeyPress("0");
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleKeyPress("0");
          }}
        >
          0
        </button>

        {/* Submit Key */}
        <button
          className={cn(
            "h-14 sm:h-16 rounded-2xl flex items-center justify-center font-headline font-bold text-xl sm:text-2xl shadow-md transition-all active:scale-95 text-white border-2 border-transparent outline-none select-none",
            inputVal ? "opacity-100 hover:scale-[1.02]" : "opacity-50"
          )}
          style={{
            backgroundColor: opInfo.hex,
          }}
          onPointerDown={(e) => {
            e.stopPropagation();
            handleSubmitInput(inputVal);
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleSubmitInput(inputVal);
          }}
          aria-label="Submit answer"
        >
          <CornerDownLeft className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
        </button>
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
