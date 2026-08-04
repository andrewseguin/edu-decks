import { Delete } from "lucide-react";

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
  return (
    <div className="w-full max-w-xs sm:max-w-sm grid grid-cols-3 gap-2.5 sm:gap-3 shrink-0 my-auto p-1">
      {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
        <button
          key={num}
          type="button"
          className="h-13 sm:h-16 rounded-2xl flex items-center justify-center font-headline font-bold text-2xl sm:text-3xl shadow-md transition-all active:scale-95 bg-card text-card-foreground border-2 border-transparent hover:border-primary/40 hover:scale-[1.02] outline-none select-none"
          style={{
            backgroundColor: `${hexColor}18`,
            color: hexColor,
          }}
          onClick={(e) => {
            e.stopPropagation();
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
          className="h-13 sm:h-16 rounded-2xl flex items-center justify-center font-headline font-bold text-xl sm:text-2xl shadow-md transition-all active:scale-95 bg-card text-card-foreground border-2 border-transparent hover:border-primary/40 hover:scale-[1.02] outline-none select-none"
          style={{
            backgroundColor: `${hexColor}18`,
            color: hexColor,
          }}
          onClick={(e) => {
            e.stopPropagation();
            onKeyPress("/");
          }}
          aria-label="Fraction bar"
        >
          /
        </button>
      ) : (
        <div className="h-13 sm:h-16 rounded-2xl bg-transparent pointer-events-none" />
      )}

      {/* 0 Key */}
      <button
        type="button"
        className="h-13 sm:h-16 rounded-2xl flex items-center justify-center font-headline font-bold text-2xl sm:text-3xl shadow-md transition-all active:scale-95 bg-card text-card-foreground border-2 border-transparent hover:border-primary/40 hover:scale-[1.02] outline-none select-none"
        style={{
          backgroundColor: `${hexColor}18`,
          color: hexColor,
        }}
        onClick={(e) => {
          e.stopPropagation();
          onKeyPress("0");
        }}
      >
        0
      </button>

      {/* Backspace Button */}
      <button
        type="button"
        className="h-13 sm:h-16 rounded-2xl flex items-center justify-center font-headline font-bold text-lg sm:text-xl shadow-md transition-all active:scale-95 bg-card text-muted-foreground border-2 border-transparent hover:border-destructive/40 hover:text-destructive hover:scale-[1.02] outline-none select-none"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        aria-label="Delete last digit"
      >
        <Delete className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
    </div>
  );
}
