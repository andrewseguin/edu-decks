"use client";

import { useState, useEffect, useCallback } from "react";
import { MathOperation, MathProblem, OPERATION_COLORS } from "@/lib/types";
import { generateMathProblem, generateQuizOptions } from "@/lib/math-generator";
import { Button } from "@/components/ui/button";
import { Volume2, X, Flame, Trophy, Sparkles, CheckCircle2, XCircle } from "lucide-react";
import confetti from "canvas-confetti";
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
  const [bestStreak, setBestStreak] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answerState, setAnswerState] = useState<"idle" | "correct" | "wrong">("idle");
  const [shakingOption, setShakingOption] = useState<number | null>(null);

  const loadNextQuestion = useCallback(() => {
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
    setAnswerState("idle");
    setShakingOption(null);

    if (autoPlayAudio) {
      onSpeak(`What is ${problem.num1} ${getOpWord(problem.operation)} ${problem.num2}?`);
    }
  }, [activeOperations, minRange, maxRange, allowNegatives, optionCount, autoPlayAudio, onSpeak]);

  useEffect(() => {
    loadNextQuestion();
  }, [loadNextQuestion]);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#059669', '#D97706', '#7C3AED', '#0284C7', '#F59E0B'],
      });
    } catch {
      // Confetti fallback
    }
  };

  const handleOptionClick = (option: number) => {
    if (!currentProblem || answerState === "correct") return;

    setSelectedOption(option);

    if (option === currentProblem.answer) {
      setAnswerState("correct");
      onPlayChime(true);
      const newScore = score + 1;
      const newStreak = streak + 1;
      setScore(newScore);
      setStreak(newStreak);
      if (newStreak > bestStreak) {
        setBestStreak(newStreak);
      }

      // Celebrate streak milestones (3, 5, 10, 15...)
      if (newStreak % 5 === 0 || newStreak === 3) {
        triggerConfetti();
        onSpeak(`Awesome! ${newStreak} in a row!`);
      }

      // Auto advance after 1 second
      setTimeout(() => {
        loadNextQuestion();
      }, 1100);
    } else {
      setAnswerState("wrong");
      setShakingOption(option);
      onPlayChime(false);
      setStreak(0); // Reset streak on error

      setTimeout(() => {
        setShakingOption(null);
        setAnswerState("idle");
      }, 600);
    }
  };

  if (!currentProblem) return null;

  const opInfo = OPERATION_COLORS[currentProblem.operation];

  // Dynamic Grid Class based on optionCount
  // 4 cards: 2x2
  // 6 cards: 2x3 or 3x2
  // 8 cards: 2x4 or 4x2
  const gridClass =
    optionCount === 4
      ? "grid-cols-2 max-w-sm"
      : optionCount === 6
      ? "grid-cols-2 sm:grid-cols-3 max-w-md sm:max-w-xl"
      : "grid-cols-2 sm:grid-cols-4 max-w-md sm:max-w-2xl";

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col justify-between items-center p-4 sm:p-6 overflow-y-auto animate-fade-in-zoom">
      {/* Top Header Bar */}
      <div className="w-full max-w-2xl flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-3">
          {/* Score Badge */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-card border border-border shadow-xs font-bold">
            <Trophy className="h-5 w-5 text-amber-500" />
            <span className="text-foreground text-sm sm:text-base font-headline">
              Score: <span className="text-primary">{score}</span>
            </span>
          </div>

          {/* Streak Counter */}
          <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 font-bold text-sm">
            <Flame className="h-5 w-5 fill-orange-500 text-orange-500 animate-bounce" />
            <span>{streak}</span>
          </div>
        </div>

        {/* Exit Quiz Button */}
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-11 w-11 hover:bg-muted text-foreground/70 hover:text-foreground"
          onClick={onExit}
          aria-label="Exit quiz mode"
        >
          <X className="h-6 w-6" />
        </Button>
      </div>

      {/* Main Question Card Area */}
      <div className="my-auto w-full max-w-2xl flex flex-col items-center gap-6 py-4">
        <div
          className={cn(
            "w-full rounded-[2.5rem] bg-card border-4 p-8 sm:p-10 flex flex-col items-center justify-center gap-4 shadow-xl relative overflow-hidden transition-all duration-300",
            opInfo.border
          )}
        >
          {/* Audio Replay Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 rounded-full h-10 w-10 hover:bg-muted/80"
            onClick={() =>
              onSpeak(
                `What is ${currentProblem.num1} ${getOpWord(currentProblem.operation)} ${currentProblem.num2}?`
              )
            }
            aria-label="Replay equation prompt"
          >
            <Volume2 className="h-5 w-5 text-foreground/70" />
          </Button>

          <span
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase border",
              opInfo.badgeBg
            )}
          >
            {opInfo.name} Quiz
          </span>

          <div className="text-6xl sm:text-8xl font-black font-headline text-foreground tracking-tight">
            {currentProblem.displayText} = ?
          </div>
        </div>

        {/* Answer Options Grid */}
        <div className={cn("grid gap-3.5 w-full", gridClass)}>
          {options.map((option) => {
            const isSelected = selectedOption === option;
            const isCorrect = isSelected && answerState === "correct";
            const isWrong = shakingOption === option;

            return (
              <Button
                key={option}
                type="button"
                variant="outline"
                className={cn(
                  "h-20 sm:h-24 rounded-3xl text-3xl sm:text-4xl font-black font-headline border-3 shadow-md transition-all active:scale-95",
                  isCorrect
                    ? "bg-emerald-500 text-white border-emerald-600 scale-105 shadow-emerald-500/30"
                    : isWrong
                    ? "bg-rose-500 text-white border-rose-600 animate-shake shadow-rose-500/30"
                    : "bg-card hover:bg-muted/50 border-border text-foreground hover:scale-[1.02]"
                )}
                onClick={() => handleOptionClick(option)}
                disabled={answerState === "correct"}
              >
                {option}
                {isCorrect && <CheckCircle2 className="h-6 w-6 ml-2 animate-bounce" />}
                {isWrong && <XCircle className="h-6 w-6 ml-2" />}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="w-full text-center text-xs text-muted-foreground/60 font-semibold tracking-wider uppercase pb-2 flex items-center justify-center gap-2">
        <Sparkles className="h-4 w-4 text-amber-500" />
        <span>Best Streak: {bestStreak} 🔥</span>
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
