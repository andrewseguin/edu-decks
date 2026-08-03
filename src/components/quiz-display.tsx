"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MathOperation, MathProblem, OPERATION_COLORS } from "@/lib/types";
import { generateMathProblem, generateQuizOptions } from "@/lib/math-generator";
import { Button } from "@/components/ui/button";
import { Volume2, X, Sparkles, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type QuizDisplayProps = {
  activeOperations: MathOperation[];
  minRange: number;
  maxRange: number;
  allowNegatives: boolean;
  optionCount: number; // 4, 6, or 8
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
  optionCount,
  autoPlayAudio,
  onSpeak,
  onPlayChime,
  onExit,
}: QuizDisplayProps) {
  const [currentProblem, setCurrentProblem] = useState<MathProblem | null>(null);
  const [options, setOptions] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
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
    const opts = generateQuizOptions(problem, optionCount, minRange, maxRange);
    setCurrentProblem(problem);
    setOptions(opts);
    setSelectedOption(null);
    setIsCorrect(null);

    if (autoPlayAudio) {
      playTimeoutRef.current = setTimeout(() => {
        playAudioPrompt(problem);
      }, 400);
    }
  }, [activeOperations, minRange, maxRange, allowNegatives, optionCount, autoPlayAudio, playAudioPrompt]);

  useEffect(() => {
    nextQuestion();
    return () => {
      if (playTimeoutRef.current) clearTimeout(playTimeoutRef.current);
    };
  }, []);

  const handleSelectOption = (option: number) => {
    if (!currentProblem || selectedOption !== null) return;

    setSelectedOption(option);

    if (option === currentProblem.answer) {
      setIsCorrect(true);
      setScore((s) => s + 1);
      setStreak((s) => s + 1);
      onPlayChime(true);

      setTimeout(() => {
        nextQuestion();
      }, 1000);
    } else {
      setIsCorrect(false);
      setStreak(0);
      onPlayChime(false);

      setTimeout(() => {
        setSelectedOption(null);
        setIsCorrect(null);
      }, 800);
    }
  };

  if (!currentProblem) return null;

  const opInfo = OPERATION_COLORS[currentProblem.operation];

  return (
    <div
      className="fixed inset-0 z-40 bg-background flex flex-col justify-between p-3 sm:p-6 animate-in fade-in duration-300 select-none overflow-y-auto"
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Top Header Bar: Exit Button on left, Audio Button in center, Score/Streak on right */}
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

      {/* Hero Equation Card (Prominent Center Piece) */}
      <div className="w-full max-w-3xl mx-auto my-auto py-2 sm:py-4 shrink-0 flex justify-center">
        <div
          className="w-full rounded-3xl p-6 sm:p-8 flex items-center justify-center relative cursor-pointer shadow-xl transition-all duration-300 hover:scale-[1.01]"
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

            {/* Obscured Question Mark Badge */}
            <div className="relative inline-flex items-center justify-center px-1">
              <div className="flex items-center justify-center bg-white/20 backdrop-blur-md rounded-2xl border-2 border-dashed border-white/40 shadow-sm px-4 py-1 sm:px-6 sm:py-2 animate-pulse">
                <span className="font-headline font-bold text-white text-4xl sm:text-6xl md:text-7xl">
                  ?
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Options Grid */}
      <div
        className={cn(
          "w-full max-w-4xl mx-auto grid shrink-0 gap-3 sm:gap-4 pb-2",
          options.length <= 4
            ? "grid-cols-2 max-w-2xl"
            : options.length <= 6
            ? "grid-cols-2 sm:grid-cols-3"
            : "grid-cols-2 sm:grid-cols-4"
        )}
      >
        {options.map((option) => {
          const isSelected = selectedOption === option;
          const isSelectedCorrect = isSelected && isCorrect === true;
          const isSelectedIncorrect = isSelected && isCorrect === false;

          return (
            <button
              key={option}
              className={cn(
                "h-20 sm:h-24 md:h-28 w-full rounded-2xl flex items-center justify-center font-headline font-bold shadow-md transition-all active:scale-95 relative overflow-hidden border-4 border-transparent outline-none select-none text-4xl sm:text-5xl md:text-6xl",
                isSelectedCorrect &&
                  "bg-emerald-500 text-white scale-105 border-emerald-400 z-10 shadow-xl shadow-emerald-500/30",
                isSelectedIncorrect &&
                  "bg-destructive/20 text-destructive border-destructive animate-shake",
                !isSelected &&
                  "bg-card text-card-foreground hover:border-primary/40 hover:scale-[1.02]"
              )}
              style={{
                backgroundColor: !isSelected ? `${opInfo.hex}18` : undefined,
                color: !isSelected ? opInfo.hex : undefined,
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
                handleSelectOption(option);
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleSelectOption(option);
              }}
            >
              <span className="select-none inline-block leading-none">{option}</span>
              {isSelectedCorrect && (
                <CheckCircle2 className="absolute top-2 right-2 w-6 h-6 text-white animate-in zoom-in" />
              )}
            </button>
          );
        })}
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
