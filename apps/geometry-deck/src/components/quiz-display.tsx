"use client";

import { useGeometryQuizSession } from "@/hooks/use-geometry-quiz-session";
import { DeckQuizManager } from "@decks/core";
import { GeometryQuizKeypad } from "./quiz/geometry-quiz-keypad";
import { FormattedMathText } from "./ui/formatted-math-text";
import { renderShapeSvg } from "@/lib/svg-shapes";
import type { TopicType, MeasurementUnit } from "@/lib/types";
import { TOPIC_COLORS } from "@/lib/colors";
import { cn } from "@/lib/utils";

type QuizDisplayProps = {
  activeTopics: TopicType[];
  measurementUnit: MeasurementUnit;
  includeReverseProblems?: boolean;
  autoPlayAudio: boolean;
  onSpeak: (text: string, onEnd?: () => void) => void;
  onPlayChime: (correct: boolean) => void;
  onExit: () => void;
};

export function QuizDisplay({
  activeTopics,
  measurementUnit,
  includeReverseProblems = true,
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
  } = useGeometryQuizSession({
    activeTopics,
    measurementUnit,
    includeReverseProblems,
    autoPlayAudio,
    onSpeak,
    onPlayChime,
    onExit,
  });

  if (!currentProblem) return null;

  const topicColor = TOPIC_COLORS[currentProblem.topic] || currentProblem.color;

  return (
    <DeckQuizManager
      score={score}
      showStreak={true}
      streak={streak}
      onExit={onExit}
      onReplayAudio={() => playAudioPrompt(currentProblem)}
      isPlayingSound={isPlayingSound}
      contentClassName="landscape:flex-row landscape:max-w-5xl md:landscape:max-w-6xl landscape:items-center landscape:justify-center landscape:gap-6 md:landscape:gap-10 min-h-0 py-2 sm:py-4 px-2"
      promptClassName="landscape:flex-1 landscape:w-full landscape:min-w-0 landscape:max-w-xl landscape:my-auto"
      inputClassName="landscape:w-[260px] sm:landscape:w-[320px] md:landscape:w-[360px] lg:landscape:w-[380px] landscape:shrink-0 landscape:my-auto"
      prompt={
        <div
          className={cn(
            "w-full rounded-3xl p-4 sm:p-6 flex flex-col items-center justify-center relative cursor-pointer shadow-xl transition-all duration-300 gap-3 sm:gap-4",
            "min-h-[220px] max-h-[380px] sm:max-h-[440px]",
            "landscape:min-h-[200px] sm:landscape:min-h-[260px] md:landscape:min-h-[300px] landscape:max-h-[360px] sm:landscape:max-h-[420px] md:landscape:max-h-[460px] landscape:p-4 sm:landscape:p-6",
            "[@media(orientation:landscape)_and_(max-height:540px)]:min-h-[140px] [@media(orientation:landscape)_and_(max-height:540px)]:max-h-[220px] [@media(orientation:landscape)_and_(max-height:540px)]:p-2.5",
            isCorrect === true && "border-4 border-emerald-400 shadow-emerald-500/30 scale-[1.02]",
            isCorrect === false && "border-4 border-destructive animate-shake"
          )}
          style={{
            backgroundColor: topicColor,
            boxShadow:
              "0 1px 1px rgba(0,0,0,0.12), 0 2px 2px rgba(0,0,0,0.12), 0 4px 4px rgba(0,0,0,0.12), 0 8px 8px rgba(0,0,0,0.12)",
          }}
          onClick={() => playAudioPrompt(currentProblem)}
        >
          {/* Question Prompt */}
          {currentProblem.frontPrompt && (
            <h3 className="font-bold text-white text-center leading-tight text-lg sm:text-xl md:text-2xl tracking-wide">
              <FormattedMathText text={currentProblem.frontPrompt} />
            </h3>
          )}

          {/* SVG Diagram */}
          {currentProblem.frontSvg && (
            <div className="w-full flex-1 max-w-[280px] sm:max-w-[340px] md:max-w-[380px] max-h-[160px] sm:max-h-[200px] flex items-center justify-center">
              {renderShapeSvg(currentProblem.frontSvg)}
            </div>
          )}

          {/* Answer Input Slot */}
          <div className="flex items-center justify-center gap-2 bg-black/40 border border-white/20 px-5 py-1.5 sm:py-2 rounded-2xl shadow-inner">
            <span className="text-white/80 font-bold text-sm sm:text-base">Answer:</span>
            <div
              className={cn(
                "min-w-[60px] text-center font-mono font-extrabold text-2xl sm:text-3xl text-white tracking-wider px-2 py-0.5 rounded-lg",
                inputVal ? "bg-white/20 border border-white/40" : "bg-white/10 border border-dashed border-white/30 text-white/50 animate-pulse"
              )}
            >
              {inputVal || "?"}
            </div>
          </div>
        </div>
      }
      input={
        <GeometryQuizKeypad
          hexColor={topicColor}
          onKeyPress={handleKeyPress}
          onDelete={handleDelete}
        />
      }
    />
  );
}
