"use client";

import { MathProblem } from "@/lib/types";

type VisualMathProps = {
  problem: MathProblem;
};

export function VisualMath({ problem }: VisualMathProps) {
  const { num1, num2, operation, answer } = problem;

  // Don't render visual blocks if numbers are huge (> 50) to prevent overflow
  if (Math.abs(num1) > 50 || Math.abs(num2) > 50 || Math.abs(answer) > 50) {
    return null;
  }

  if (operation === '+') {
    return (
      <div className="flex flex-wrap justify-center items-center gap-3 p-3 rounded-2xl bg-white/10 border border-white/20 max-w-full">
        {/* First Group */}
        <div className="flex flex-wrap gap-1.5 justify-center max-w-[140px]">
          {Array.from({ length: Math.max(0, num1) }).map((_, i) => (
            <div
              key={`a-${i}`}
              className="w-5 h-5 rounded-md bg-white shadow-xs animate-fade-in-zoom"
              style={{ animationDelay: `${i * 20}ms` }}
            />
          ))}
        </div>

        <span className="text-white font-bold text-xl">+</span>

        {/* Second Group */}
        <div className="flex flex-wrap gap-1.5 justify-center max-w-[140px]">
          {Array.from({ length: Math.max(0, num2) }).map((_, i) => (
            <div
              key={`b-${i}`}
              className="w-5 h-5 rounded-md bg-white/80 shadow-xs animate-fade-in-zoom"
              style={{ animationDelay: `${(num1 + i) * 20}ms` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (operation === '-') {
    const total = num1;
    const takenAway = num2;
    return (
      <div className="flex flex-wrap justify-center gap-1.5 p-3 rounded-2xl bg-white/10 border border-white/20 max-w-[280px]">
        {Array.from({ length: Math.max(0, total) }).map((_, i) => {
          const isRemoved = i >= total - takenAway;
          return (
            <div
              key={`s-${i}`}
              className={`w-6 h-6 rounded-md flex items-center justify-center transition-all ${
                isRemoved
                  ? "bg-white/20 text-white/50 line-through scale-90 border border-dashed border-white/30"
                  : "bg-white text-amber-600 shadow-xs font-bold text-xs"
              }`}
            >
              {isRemoved ? "×" : ""}
            </div>
          );
        })}
      </div>
    );
  }

  if (operation === '×') {
    const rows = Math.max(0, num1);
    const cols = Math.max(0, num2);
    return (
      <div className="p-3 rounded-2xl bg-white/10 border border-white/20 max-w-full">
        <div
          className="grid gap-1.5 justify-center"
          style={{ gridTemplateColumns: `repeat(${cols || 1}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: rows * cols }).map((_, i) => (
            <div
              key={`m-${i}`}
              className="w-5 h-5 rounded-md bg-white shadow-xs animate-fade-in-zoom"
              style={{ animationDelay: `${i * 15}ms` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (operation === '÷') {
    const groupCount = Math.max(1, num2);
    const perGroup = answer;
    return (
      <div className="flex flex-wrap justify-center gap-2 p-3 rounded-2xl bg-white/10 border border-white/20 max-w-[320px]">
        {Array.from({ length: groupCount }).map((_, gIdx) => (
          <div
            key={`g-${gIdx}`}
            className="flex flex-wrap gap-1 p-2 rounded-xl bg-white/20 border border-white/30 justify-center items-center"
          >
            {Array.from({ length: Math.max(0, perGroup) }).map((_, itemIdx) => (
              <div
                key={`gi-${gIdx}-${itemIdx}`}
                className="w-4 h-4 rounded-md bg-white shadow-xs"
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return null;
}
