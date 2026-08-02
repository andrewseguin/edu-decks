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

  const minCardHeight =
    optionCount <= 4 ? "min-h-[22vh]" : optionCount <= 6 ? "min-h-[16vh]" : "min-h-[12vh]";

  return (
    <div
      className="fixed inset-0 z-40 bg-background flex flex-col justify-between p-3 sm:p-6 animate-in fade-in duration-300 select-none"
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between w-full max-w-4xl mx-auto gap-2">
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

        {/* Center Prompt Replay Button */}
        <Button
          size="sm"
          variant="default"
          className={cn(
            "rounded-full gap-2 px-5 py-2 font-headline font-bold text-base shadow-md transition-transform active:scale-95 outline-none text-white",
            isPlayingSound ? "animate-pulse scale-105" : "hover:opacity-90"
          )}
          style={{ backgroundColor: opInfo.hex }}
          onPointerDown={(e) => {
            e.stopPropagation();
            if (currentProblem) playAudioPrompt(currentProblem);
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (currentProblem) playAudioPrompt(currentProblem);
          }}
          aria-label="Replay equation"
        >
          <Volume2 className="w-5 h-5 text-white" />
          <span>{currentProblem.displayText} = ?</span>
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

      {/* Dynamic Options Grid */}
      <div
        className={cn(
          "w-full mx-auto flex-1 grid my-auto p-2 min-h-0 items-center",
          options.length <= 4
            ? "max-w-2xl grid-cols-2 gap-3 sm:gap-6 max-h-[72vh]"
            : options.length <= 6
            ? "max-w-4xl grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4 max-h-[78vh]"
            : "max-w-5xl grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 max-h-[82vh]"
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
                "h-full w-full rounded-3xl flex items-center justify-center font-headline font-bold shadow-lg transition-all active:scale-95 relative overflow-hidden border-4 border-transparent p-2 outline-none select-none text-4xl sm:text-6xl md:text-7xl",
                minCardHeight,
                isSelectedCorrect &&
                  "bg-emerald-500 text-white scale-105 border-emerald-400 z-10 shadow-2xl shadow-emerald-500/30",
                isSelectedIncorrect &&
                  "bg-destructive/20 text-destructive border-destructive animate-shake",
                !isSelected &&
                  "bg-card text-card-foreground hover:border-primary/40 hover:scale-[1.01]"
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
                <CheckCircle2 className="absolute top-3 right-3 w-8 h-8 text-white animate-in zoom-in" />
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
