"use client";

import { FractionDenominatorMode, FractionMaxDenominator, MathOperation, OPERATION_COLORS } from "@/lib/types";
import { FractionDisplay } from "./fraction-display";
import { MathSymbol } from "./math-symbol";
import { cn } from "@/lib/utils";
import { useQuizSession } from "@/hooks/use-quiz-session";
import { DeckQuizManager } from "@decks/core";
import { QuizKeypad } from "./quiz/quiz-keypad";

type QuizDisplayProps = {
  activeOperations: MathOperation[];
  minRange: number;
  maxRange: number;
  allowNegatives?: boolean;
  showWholeNumbers?: boolean;
  showFractions?: boolean;
  fractionDenominatorMode?: FractionDenominatorMode;
  fractionMaxDenominator?: FractionMaxDenominator;
  autoPlayAudio: boolean;
  onSpeak: (text: string, onEnd?: () => void) => void;
  onPlayChime: (correct: boolean) => void;
  onExit: () => void;
};

export function QuizDisplay({
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
  onExit,
}: QuizDisplayProps) {
  const {
    currentProblem,
    inputVal,
    numPart,
    denPart,
    activeFractionSlot,
    score,
    streak,
    isCorrect,
    isPlayingSound,
    playAudioPrompt,
    handleKeyPress,
    handleDelete,
    onSelectNumerator,
    onSelectDenominator,
  } = useQuizSession({
    activeOperations,
    minRange,
    maxRange,
    showWholeNumbers,
    showFractions,
    fractionDenominatorMode,
    fractionMaxDenominator,
    autoPlayAudio,
    onSpeak,
    onPlayChime,
  });

  if (!currentProblem) return null;

  const opInfo = OPERATION_COLORS[currentProblem.operation];
  const isFractionActive = Boolean(showFractions || currentProblem.isFraction);

  return (
    <DeckQuizManager
      score={score}
      showStreak={false}
      onExit={onExit}
      onReplayAudio={() => playAudioPrompt(currentProblem)}
      isPlayingSound={isPlayingSound}
      contentClassName="landscape:flex-row landscape:max-w-5xl md:landscape:max-w-6xl landscape:items-center landscape:justify-center landscape:gap-8 md:landscape:gap-12 min-h-0 py-2 sm:py-4 px-2"
      promptClassName="landscape:flex-1 landscape:w-full landscape:min-w-0 landscape:max-w-xl landscape:my-auto"
      inputClassName="landscape:w-[260px] sm:landscape:w-[320px] md:landscape:w-[360px] lg:landscape:w-[380px] landscape:shrink-0 landscape:my-auto"
      prompt={
        <div
          className={cn(
            "w-full rounded-3xl p-4 sm:p-8 flex items-center justify-center relative cursor-pointer shadow-xl transition-all duration-300",
            "h-auto min-h-[160px] max-h-[280px] sm:max-h-[340px]",
            "landscape:min-h-[140px] sm:landscape:min-h-[240px] md:landscape:min-h-[280px] landscape:max-h-[280px] sm:landscape:max-h-[360px] md:landscape:max-h-[400px] landscape:p-6 sm:landscape:p-8 md:landscape:p-10",
            "[@media(orientation:landscape)_and_(max-height:540px)]:min-h-[100px] [@media(orientation:landscape)_and_(max-height:540px)]:max-h-[180px] [@media(orientation:landscape)_and_(max-height:540px)]:p-3",
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
              <span className="font-headline font-bold leading-none select-none text-cyan-300 [text-shadow:0_2px_10px_rgba(0,0,0,0.4)] text-5xl sm:text-7xl md:text-8xl landscape:text-4xl sm:landscape:text-6xl md:landscape:text-7xl lg:landscape:text-8xl [@media(orientation:landscape)_and_(max-height:540px)]:text-4xl shrink-0">
                {currentProblem.num1}
              </span>
            )}

            {/* Operator */}
            <MathSymbol
              symbol={currentProblem.operation}
              isFraction={currentProblem.isFraction}
              className="text-white/90 [text-shadow:3px_3px_6px_rgba(0,0,0,0.2)] text-5xl sm:text-7xl md:text-8xl landscape:text-4xl sm:landscape:text-6xl md:landscape:text-7xl lg:landscape:text-8xl [@media(orientation:landscape)_and_(max-height:540px)]:text-4xl mx-2 sm:mx-4 landscape:mx-2 sm:landscape:mx-3 md:landscape:mx-4 [@media(orientation:landscape)_and_(max-height:540px)]:mx-1.5"
            />

            {/* Second Number / Fraction */}
            {currentProblem.isFraction && currentProblem.frac2 ? (
              <FractionDisplay fraction={currentProblem.frac2} colorClass="text-amber-300" size="lg" />
            ) : (
              <span className="font-headline font-bold leading-none select-none text-amber-300 [text-shadow:0_2px_10px_rgba(0,0,0,0.4)] text-5xl sm:text-7xl md:text-8xl landscape:text-4xl sm:landscape:text-6xl md:landscape:text-7xl lg:landscape:text-8xl [@media(orientation:landscape)_and_(max-height:540px)]:text-4xl shrink-0">
                {currentProblem.num2}
              </span>
            )}

            {/* Equals Symbol */}
            <MathSymbol
              symbol="="
              isFraction={currentProblem.isFraction}
              className="text-white/90 [text-shadow:3px_3px_6px_rgba(0,0,0,0.2)] text-5xl sm:text-7xl md:text-8xl landscape:text-4xl sm:landscape:text-6xl md:landscape:text-7xl lg:landscape:text-8xl [@media(orientation:landscape)_and_(max-height:540px)]:text-4xl ml-2 sm:ml-4 mr-2 sm:mr-4 landscape:mx-2 sm:landscape:mx-3 md:landscape:mx-4 [@media(orientation:landscape)_and_(max-height:540px)]:mx-1.5"
            />

            {/* User Input / Question Mark Box */}
            {currentProblem.isFraction ? (
              <div className="relative inline-flex items-center justify-center px-1 shrink-0">
                {(() => {
                  const isNumActive = activeFractionSlot === "numerator";
                  const isDenActive = activeFractionSlot === "denominator";

                  const getBoxClass = (isActive: boolean) =>
                    cn(
                      "min-w-[64px] sm:min-w-[96px] md:min-w-[114px] h-[52px] sm:h-[72px] md:h-[84px] px-2.5 sm:px-4 flex items-center justify-center rounded-2xl sm:rounded-3xl border-2 sm:border-3 transition-all duration-200 select-none font-headline font-bold leading-none text-3xl sm:text-5xl md:text-6xl cursor-pointer outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 [-webkit-tap-highlight-color:transparent]",
                      "landscape:min-w-[56px] sm:landscape:min-w-[80px] md:landscape:min-w-[96px] landscape:h-[44px] sm:landscape:h-[62px] md:landscape:h-[72px] landscape:text-2xl sm:landscape:text-4xl md:landscape:text-5xl",
                      "[@media(orientation:landscape)_and_(max-height:540px)]:min-w-[44px] [@media(orientation:landscape)_and_(max-height:540px)]:h-[34px] [@media(orientation:landscape)_and_(max-height:540px)]:text-xl [@media(orientation:landscape)_and_(max-height:540px)]:rounded-xl",
                      isCorrect === true
                        ? "bg-emerald-500 border-emerald-300 text-white shadow-lg"
                        : isCorrect === false
                        ? "bg-destructive/30 border-destructive text-white"
                        : isActive
                        ? "bg-white/45 border-solid border-white text-white shadow-md"
                        : "bg-black/25 border-dashed border-white/30 text-white/70 shadow-none"
                    );

                  return (
                    <div
                      className="inline-flex flex-col items-center justify-center font-headline font-bold leading-none align-middle select-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Numerator Box */}
                      <button
                        type="button"
                        tabIndex={-1}
                        className={getBoxClass(isNumActive)}
                        onClick={(e) => {
                          (e.currentTarget as HTMLElement).blur();
                          onSelectNumerator();
                        }}
                        aria-label="Numerator input"
                        aria-selected={isNumActive}
                      >
                        {numPart ? (
                          <span className="text-white [text-shadow:2px_2px_4px_rgba(0,0,0,0.3)]">{numPart}</span>
                        ) : (
                          <span className={isNumActive ? "text-white font-extrabold" : "text-white/40"}>?</span>
                        )}
                      </button>

                      {/* Fraction Bar Line */}
                      <div className="w-full h-1 sm:h-1.5 md:h-2 my-1.5 sm:my-2 bg-white/90 rounded-full shadow-xs shrink-0" />

                      {/* Denominator Box */}
                      <button
                        type="button"
                        tabIndex={-1}
                        className={getBoxClass(isDenActive)}
                        onClick={(e) => {
                          (e.currentTarget as HTMLElement).blur();
                          onSelectDenominator();
                        }}
                        aria-label="Denominator input"
                        aria-selected={isDenActive}
                      >
                        {denPart ? (
                          <span className="text-white [text-shadow:2px_2px_4px_rgba(0,0,0,0.3)]">{denPart}</span>
                        ) : (
                          <span className={isDenActive ? "text-white font-extrabold" : "text-white/40"}>?</span>
                        )}
                      </button>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="relative inline-flex items-center justify-center px-1 shrink-0">
                <div
                  className={cn(
                    "min-w-[64px] sm:min-w-[90px] h-[54px] sm:h-[76px] px-3 flex items-center justify-center rounded-2xl border-2 transition-all duration-200",
                    "landscape:min-w-[58px] sm:landscape:min-w-[80px] md:landscape:min-w-[96px] landscape:h-[48px] sm:landscape:h-[70px] md:landscape:h-[82px] landscape:px-2 sm:landscape:px-3",
                    "[@media(orientation:landscape)_and_(max-height:540px)]:min-w-[48px] [@media(orientation:landscape)_and_(max-height:540px)]:h-[42px] [@media(orientation:landscape)_and_(max-height:540px)]:px-1.5 [@media(orientation:landscape)_and_(max-height:540px)]:rounded-xl",
                    isCorrect === true
                      ? "bg-emerald-500 border-emerald-300 text-white shadow-lg"
                      : isCorrect === false
                      ? "bg-destructive/30 border-destructive text-white"
                      : inputVal
                      ? "bg-white/35 border-white text-white shadow-md"
                      : "bg-white/25 border-dashed border-white/50 text-white"
                  )}
                >
                  {inputVal ? (
                    <span className="font-headline font-bold leading-none text-white [text-shadow:3px_3px_6px_rgba(0,0,0,0.25)] text-3xl sm:text-5xl md:text-6xl landscape:text-2xl sm:landscape:text-4xl md:landscape:text-5xl lg:landscape:text-6xl [@media(orientation:landscape)_and_(max-height:540px)]:text-2xl">
                      {inputVal}
                    </span>
                  ) : (
                    <span className="font-headline font-bold text-white/80 text-2xl sm:text-4xl md:text-5xl landscape:text-2xl sm:landscape:text-3xl md:landscape:text-4xl lg:landscape:text-5xl [@media(orientation:landscape)_and_(max-height:540px)]:text-xl">
                      ?
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      }
      input={
        <QuizKeypad
          hexColor={opInfo.hex}
          isFractionActive={isFractionActive}
          onKeyPress={handleKeyPress}
          onDelete={handleDelete}
        />
      }
    />
  );
}
