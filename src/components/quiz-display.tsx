"use client";

import { MathOperation, OPERATION_COLORS } from "@/lib/types";
import { FractionDisplay } from "./fraction-display";
import { cn } from "@/lib/utils";
import { useQuizSession, stringToFraction } from "@/hooks/use-quiz-session";
import { QuizHeader } from "./quiz/quiz-header";
import { QuizKeypad } from "./quiz/quiz-keypad";

type QuizDisplayProps = {
  activeOperations: MathOperation[];
  minRange: number;
  maxRange: number;
  allowNegatives?: boolean;
  showWholeNumbers?: boolean;
  showFractions?: boolean;
  autoPlayAudio: boolean;
  onSpeak: (text: string) => void;
  onPlayChime: (correct: boolean) => void;
  onExit: () => void;
};

export function QuizDisplay({
  activeOperations,
  minRange,
  maxRange,
  showWholeNumbers = true,
  showFractions = false,
  autoPlayAudio,
  onSpeak,
  onPlayChime,
  onExit,
}: QuizDisplayProps) {
  const {
    currentProblem,
    inputVal,
    score,
    streak,
    isCorrect,
    isPlayingSound,
    playAudioPrompt,
    handleKeyPress,
    handleDelete,
  } = useQuizSession({
    activeOperations,
    minRange,
    maxRange,
    showWholeNumbers,
    showFractions,
    autoPlayAudio,
    onSpeak,
    onPlayChime,
  });

  if (!currentProblem) return null;

  const opInfo = OPERATION_COLORS[currentProblem.operation];
  const userFraction = stringToFraction(inputVal);
  const isFractionActive = Boolean(showFractions || currentProblem.isFraction);

  return (
    <div
      className="fixed inset-0 z-40 bg-background flex flex-col justify-between p-3 sm:p-6 select-none overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Top Header Bar */}
      <QuizHeader
        score={score}
        streak={streak}
        isPlayingSound={isPlayingSound}
        onExit={onExit}
        onAudioPrompt={() => playAudioPrompt(currentProblem)}
      />

      {/* Main Content Area */}
      <div className="w-full max-w-2xl mx-auto flex-1 flex flex-col [@media(orientation:landscape)_and_(max-height:540px)]:flex-row [@media(orientation:landscape)_and_(max-height:540px)]:max-w-5xl items-center justify-center gap-4 sm:gap-6 min-h-0 py-2">
        {/* Hero Equation Card */}
        <div className="w-full flex-1 flex items-center justify-center min-h-0 min-w-0 [@media(orientation:landscape)_and_(max-height:540px)]:max-h-full">
          <div
            className={cn(
              "w-full rounded-3xl p-5 sm:p-8 flex items-center justify-center relative cursor-pointer shadow-xl transition-all duration-300",
              "h-auto max-h-[220px] sm:max-h-[260px] [@media(orientation:landscape)_and_(max-height:540px)]:max-h-[180px]",
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
                <FractionDisplay fraction={currentProblem.frac1} colorClass="text-cyan-300" size="lg" />
              ) : (
                <span className="font-headline font-bold leading-none select-none text-cyan-300 [text-shadow:0_2px_8px_rgba(0,0,0,0.3)] text-5xl sm:text-7xl md:text-8xl shrink-0">
                  {currentProblem.num1}
                </span>
              )}

              {/* Operator */}
              <span className="font-headline font-normal leading-none select-none text-white/90 [text-shadow:3px_3px_6px_rgba(0,0,0,0.2)] text-5xl sm:text-7xl md:text-8xl mx-2 sm:mx-4 shrink-0">
                {currentProblem.operation}
              </span>

              {/* Second Number / Fraction */}
              {currentProblem.isFraction && currentProblem.frac2 ? (
                <FractionDisplay fraction={currentProblem.frac2} colorClass="text-amber-300" size="lg" />
              ) : (
                <span className="font-headline font-bold leading-none select-none text-amber-300 [text-shadow:0_2px_8px_rgba(0,0,0,0.3)] text-5xl sm:text-7xl md:text-8xl shrink-0">
                  {currentProblem.num2}
                </span>
              )}

              {/* Equals Symbol */}
              <span className="font-headline font-normal leading-none select-none text-white/90 [text-shadow:3px_3px_6px_rgba(0,0,0,0.2)] text-5xl sm:text-7xl md:text-8xl ml-2 sm:ml-4 mr-2 sm:mr-4 shrink-0">
                =
              </span>

              {/* User Input / Question Mark Box */}
              <div className="relative inline-flex items-center justify-center px-1 shrink-0">
                <div
                  className={cn(
                    "min-w-[64px] sm:min-w-[90px] h-[54px] sm:h-[76px] px-3 flex items-center justify-center rounded-2xl border-2 transition-all duration-200",
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
                      <FractionDisplay fraction={userFraction} colorClass="text-white" size="md" />
                    ) : (
                      <span className="font-headline font-bold leading-none text-white [text-shadow:3px_3px_6px_rgba(0,0,0,0.25)] text-3xl sm:text-5xl md:text-6xl">
                        {inputVal}
                      </span>
                    )
                  ) : (
                    <span className="font-headline font-bold text-white/80 text-2xl sm:text-4xl md:text-5xl">
                      ?
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Numeric Keypad Grid */}
        <QuizKeypad
          hexColor={opInfo.hex}
          isFractionActive={isFractionActive}
          onKeyPress={handleKeyPress}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
