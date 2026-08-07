import { Delete } from "lucide-react";
import { cn } from "@/lib/utils";

type QuizKeypadProps = {
  hexColor: string;
  isFractionActive: boolean;
  onKeyPress: (digit: string) => void;
  onDelete: () => void;
};

export function QuizKeypad({
  hexColor,
  isFractionActive,
  onKeyPress,
  onDelete,
}: QuizKeypadProps) {
  const btnBaseClass =
    "rounded-2xl sm:rounded-3xl flex items-center justify-center font-headline font-bold shadow-md transition-all active:scale-95 bg-card text-card-foreground border border-border/60 hover:bg-accent hover:scale-[1.02] outline-none focus:outline-none focus:ring-0 focus:border-transparent focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-transparent [-webkit-tap-highlight-color:transparent] select-none";

  const numBtnClass = cn(
    btnBaseClass,
    "h-14 sm:h-18 md:h-20 text-3xl sm:text-4xl md:text-5xl",
    "landscape:h-12 sm:landscape:h-16 md:landscape:h-18 lg:landscape:h-20 landscape:text-2xl sm:landscape:text-3xl md:landscape:text-4xl lg:landscape:text-5xl landscape:rounded-2xl sm:landscape:rounded-3xl",
    "[@media(orientation:landscape)_and_(max-height:540px)]:h-11 [@media(orientation:landscape)_and_(max-height:540px)]:text-xl [@media(orientation:landscape)_and_(max-height:540px)]:rounded-2xl"
  );

  const fracBtnClass = cn(
    btnBaseClass,
    "h-14 sm:h-18 md:h-20 text-2xl sm:text-3xl md:text-4xl",
    "landscape:h-12 sm:landscape:h-16 md:landscape:h-18 lg:landscape:h-20 landscape:text-xl sm:landscape:text-2xl md:landscape:text-3xl lg:landscape:text-4xl landscape:rounded-2xl sm:landscape:rounded-3xl",
    "[@media(orientation:landscape)_and_(max-height:540px)]:h-11 [@media(orientation:landscape)_and_(max-height:540px)]:text-lg [@media(orientation:landscape)_and_(max-height:540px)]:rounded-2xl"
  );

  return (
    <div
      className={cn(
        "w-full grid grid-cols-3 shrink-0 mx-auto p-1 transition-all duration-200",
        "max-w-md sm:max-w-lg md:max-w-xl gap-2.5 sm:gap-4 md:gap-5",
        "landscape:max-w-none landscape:gap-2 sm:landscape:gap-3.5 md:landscape:gap-4",
        "[@media(orientation:landscape)_and_(max-height:540px)]:gap-1.5"
      )}
    >
      {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
        <button
          key={num}
          type="button"
          className={numBtnClass}
          style={{
            borderBottom: `3px solid ${hexColor}`,
          }}
          onClick={(e) => {
            e.stopPropagation();
            (e.currentTarget as HTMLElement).blur();
            onKeyPress(num);
          }}
        >
          {num}
        </button>
      ))}

      {/* Fraction Bar Button */}
      {isFractionActive ? (
        <button
          type="button"
          className={fracBtnClass}
          style={{
            borderBottom: `3px solid ${hexColor}`,
          }}
          onClick={(e) => {
            e.stopPropagation();
            (e.currentTarget as HTMLElement).blur();
            onKeyPress("/");
          }}
          aria-label="Fraction bar"
        >
          /
        </button>
      ) : (
        <div className="h-14 sm:h-18 md:h-20 landscape:h-12 sm:landscape:h-16 md:landscape:h-18 lg:landscape:h-20 [@media(orientation:landscape)_and_(max-height:540px)]:h-11 rounded-2xl sm:landscape:rounded-3xl bg-transparent pointer-events-none" />
      )}

      {/* 0 Key */}
      <button
        type="button"
        className={numBtnClass}
        style={{
          borderBottom: `3px solid ${hexColor}`,
        }}
        onClick={(e) => {
          e.stopPropagation();
          (e.currentTarget as HTMLElement).blur();
          onKeyPress("0");
        }}
      >
        0
      </button>

      {/* Backspace Button */}
      <button
        type="button"
        className={cn(
          btnBaseClass,
          "h-14 sm:h-18 md:h-20 text-xl sm:text-2xl text-muted-foreground hover:text-destructive hover:bg-destructive/10",
          "landscape:h-12 sm:landscape:h-16 md:landscape:h-18 lg:landscape:h-20 landscape:rounded-2xl sm:landscape:rounded-3xl",
          "[@media(orientation:landscape)_and_(max-height:540px)]:h-11 [@media(orientation:landscape)_and_(max-height:540px)]:text-base [@media(orientation:landscape)_and_(max-height:540px)]:rounded-2xl"
        )}
        style={{
          borderBottom: "3px solid var(--border)",
        }}
        onClick={(e) => {
          e.stopPropagation();
          (e.currentTarget as HTMLElement).blur();
          onDelete();
        }}
        aria-label="Delete last digit"
      >
        <Delete className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 landscape:w-5 sm:landscape:w-7 md:landscape:w-8 lg:landscape:w-9 landscape:h-5 sm:landscape:h-7 md:landscape:h-8 lg:landscape:h-9 [@media(orientation:landscape)_and_(max-height:540px)]:w-5 [@media(orientation:landscape)_and_(max-height:540px)]:h-5" />
      </button>
    </div>
  );
}
