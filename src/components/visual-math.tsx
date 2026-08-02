"use client";

import { MathProblem } from "@/lib/types";

type VisualMathProps = {
  problem: MathProblem;
};

export function VisualMath({ problem }: VisualMathProps) {
  const { num1, num2, operation, answer } = problem;

  // Don't render visual blocks if numbers are huge (> 50) to prevent overflow
  if (Math.abs(num1) > 50 || Math.abs(num2) > 50 || Math.abs(answer) > 50) {
    return (
      <div className="text-center text-sm text-muted-foreground mt-2">
        Answer: <span className="font-bold text-foreground">{answer}</span>
      </div>
    );
  }

  if (operation === '+') {
    return (
      <div className="flex flex-col items-center gap-3 max-w-full px-4">
        <div className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
          Visual Grouping ({num1} + {num2})
        </div>
        <div className="flex flex-wrap justify-center items-center gap-3 p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
          {/* First Group */}
          <div className="flex flex-wrap gap-1.5 justify-center max-w-[140px]">
            {Array.from({ length: Math.max(0, num1) }).map((_, i) => (
              <div
                key={`a-${i}`}
                className="w-5 h-5 rounded-md bg-emerald-500 shadow-sm animate-fade-in-zoom"
                style={{ animationDelay: `${i * 30}ms` }}
              />
            ))}
          </div>

          <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xl">+</span>

          {/* Second Group */}
          <div className="flex flex-wrap gap-1.5 justify-center max-w-[140px]">
            {Array.from({ length: Math.max(0, num2) }).map((_, i) => (
              <div
                key={`b-${i}`}
                className="w-5 h-5 rounded-md bg-teal-500 shadow-sm animate-fade-in-zoom"
                style={{ animationDelay: `${(num1 + i) * 30}ms` }}
              />
            ))}
          </div>
        </div>
        <div className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
          Total = {answer} blocks
        </div>
      </div>
    );
  }

  if (operation === '-') {
    const total = num1;
    const takenAway = num2;
    return (
      <div className="flex flex-col items-center gap-3 max-w-full px-4">
        <div className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
          Take Away ({total} - {takenAway})
        </div>
        <div className="flex flex-wrap justify-center gap-1.5 p-3 rounded-2xl bg-amber-500/5 border border-amber-500/20 max-w-[280px]">
          {Array.from({ length: Math.max(0, total) }).map((_, i) => {
            const isRemoved = i >= total - takenAway;
            return (
              <div
                key={`s-${i}`}
                className={`w-6 h-6 rounded-md flex items-center justify-center transition-all ${
                  isRemoved
                    ? "bg-amber-200/50 dark:bg-amber-950/40 text-amber-500 line-through opacity-40 scale-90 border border-dashed border-amber-400"
                    : "bg-amber-500 text-white shadow-sm font-bold text-xs"
                }`}
              >
                {isRemoved ? "×" : ""}
              </div>
            );
          })}
        </div>
        <div className="text-xs font-medium text-amber-700 dark:text-amber-300">
          Remaining = {answer} blocks
        </div>
      </div>
    );
  }

  if (operation === '×') {
    const rows = Math.max(0, num1);
    const cols = Math.max(0, num2);
    return (
      <div className="flex flex-col items-center gap-3 max-w-full px-4">
        <div className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
          Array Grid ({rows} × {cols})
        </div>
        <div className="p-3 rounded-2xl bg-purple-500/5 border border-purple-500/20 overflow-x-auto max-w-full">
          <div
            className="grid gap-1.5 justify-center"
            style={{ gridTemplateColumns: `repeat(${cols || 1}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: rows * cols }).map((_, i) => (
              <div
                key={`m-${i}`}
                className="w-5 h-5 rounded-md bg-purple-600 shadow-sm animate-fade-in-zoom"
                style={{ animationDelay: `${i * 20}ms` }}
              />
            ))}
          </div>
        </div>
        <div className="text-xs font-medium text-purple-700 dark:text-purple-300">
          Grid Total = {answer} blocks
        </div>
      </div>
    );
  }

  if (operation === '÷') {
    const groupCount = Math.max(1, num2);
    const perGroup = answer; // quotient
    return (
      <div className="flex flex-col items-center gap-3 max-w-full px-4">
        <div className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
          Equal Groups ({num1} ÷ {groupCount})
        </div>
        <div className="flex flex-wrap justify-center gap-2 p-3 rounded-2xl bg-sky-500/5 border border-sky-500/20 max-w-[320px]">
          {Array.from({ length: groupCount }).map((_, gIdx) => (
            <div
              key={`g-${gIdx}`}
              className="flex flex-wrap gap-1 p-2 rounded-xl bg-sky-500/10 border border-sky-400/30 justify-center items-center"
            >
              {Array.from({ length: Math.max(0, perGroup) }).map((_, itemIdx) => (
                <div
                  key={`gi-${gIdx}-${itemIdx}`}
                  className="w-4 h-4 rounded-md bg-sky-500 shadow-xs"
                />
              ))}
            </div>
          ))}
        </div>
        <div className="text-xs font-medium text-sky-700 dark:text-sky-300">
          {groupCount} groups of {perGroup} = {answer}
        </div>
      </div>
    );
  }

  return null;
}
