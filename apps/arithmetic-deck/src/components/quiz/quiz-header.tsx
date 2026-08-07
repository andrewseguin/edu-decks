import { Button } from "@/components/ui/button";
import { Volume2, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type QuizHeaderProps = {
  score: number;
  streak: number;
  isPlayingSound: boolean;
  onExit: () => void;
  onAudioPrompt: () => void;
};

export function QuizHeader({
  score,
  streak,
  isPlayingSound,
  onExit,
  onAudioPrompt,
}: QuizHeaderProps) {
  return (
    <div className="flex items-center justify-between w-full max-w-4xl mx-auto gap-2 shrink-0 h-10">
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
        disabled={isPlayingSound}
        className={cn(
          "rounded-full gap-1.5 px-3.5 py-1.5 font-headline font-bold text-xs sm:text-sm transition-transform active:scale-95 text-muted-foreground hover:text-foreground h-8 disabled:pointer-events-none disabled:opacity-60 disabled:cursor-not-allowed",
          isPlayingSound ? "animate-pulse scale-105 text-primary" : ""
        )}
        onClick={(e) => {
          e.stopPropagation();
          if (isPlayingSound) return;
          onAudioPrompt();
        }}
        aria-label="Replay equation audio"
      >
        <Volume2 className="w-4 h-4" />
        <span>Listen</span>
      </Button>

      {/* Score & Streak Badge */}
      <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3.5 py-1.5 rounded-full font-bold text-xs sm:text-sm shrink-0 font-headline h-8">
        <Sparkles className="w-4 h-4" />
        <span>{score}</span>
        {streak > 1 && (
          <span className="text-[10px] sm:text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full font-black">
            🔥 {streak}
          </span>
        )}
      </div>
    </div>
  );
}
