"use client";

import { MathProblem } from "@/lib/types";
import { cn } from "@/lib/utils";

type VisualMathProps = {
  problem: MathProblem;
};

// Base Ten Block Helper: Renders Tens Rods (10 units) and Ones Units (1 unit)
function renderBaseTenBlocks(count: number) {
  if (count <= 0) return null;
  const tens = Math.floor(count / 10);
  const ones = count % 10;

  return (
    <div className="flex items-center gap-2">
      {/* Tens Rods (Each rod represents 10) */}
      {Array.from({ length: tens }).map((_, tIdx) => (
        <div
          key={`ten-${tIdx}`}
          className="flex flex-col gap-0.5 p-1 rounded-lg bg-white/25 border border-white/40 shadow-xs animate-fade-in-zoom hover:scale-105 transition-transform"
          title="10"
        >
          {Array.from({ length: 10 }).map((_, uIdx) => (
            <div
              key={`ten-u-${uIdx}`}
              className="w-3.5 h-1.5 rounded-xs bg-white"
            />
          ))}
        </div>
      ))}

      {/* Ones Units (Single blocks) */}
      {ones > 0 && (
        <div className="flex flex-wrap gap-1 max-w-[85px] items-center">
          {Array.from({ length: ones }).map((_, oIdx) => (
            <div
              key={`one-${oIdx}`}
              className="w-4 h-4 rounded-md bg-white shadow-xs animate-fade-in-zoom hover:scale-125 transition-transform cursor-pointer"
              style={{ animationDelay: `${(tens * 10 + oIdx) * 20}ms` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function VisualMath({ problem }: VisualMathProps) {
  const { num1, num2, operation, answer } = problem;

  // Don't render visual blocks if numbers are huge (> 50)
  if (Math.abs(num1) > 50 || Math.abs(num2) > 50 || Math.abs(answer) > 50) {
    return null;
  }

  // ADDITION (+): Base Ten representation for Group 1 + Group 2
  if (operation === '+') {
    return (
      <div className="flex justify-center items-center gap-2.5 p-2 sm:p-2.5 rounded-2xl bg-white/10 border border-white/20 max-w-full backdrop-blur-xs">
        {/* Num 1 Blocks */}
        {renderBaseTenBlocks(num1)}

        {/* Plus Symbol */}
        <span className="text-white/80 font-bold text-sm sm:text-base leading-none select-none px-0.5">
          +
        </span>

        {/* Num 2 Blocks */}
        {renderBaseTenBlocks(num2)}

        {/* Equals Result Summary if answer >= 10 */}
        {answer >= 10 && (
          <>
            <span className="text-white/80 font-bold text-sm sm:text-base leading-none select-none px-0.5">
              =
            </span>
            {renderBaseTenBlocks(answer)}
          </>
        )}
      </div>
    );
  }

  // SUBTRACTION (-): Base Ten representation of total with taken away
  if (operation === '-') {
    const total = num1;
    const takenAway = num2;
    const remaining = Math.max(0, total - takenAway);

    return (
      <div className="flex justify-center items-center gap-2 p-2 sm:p-2.5 rounded-2xl bg-white/10 border border-white/20 max-w-full backdrop-blur-xs">
        {renderBaseTenBlocks(remaining)}
      </div>
    );
  }

  // MULTIPLICATION (×): Grouped Sets of Base Ten Blocks
  if (operation === '×') {
    return (
      <div className="flex justify-center items-center gap-2 p-2 sm:p-2.5 rounded-2xl bg-white/10 border border-white/20 max-w-full backdrop-blur-xs">
        {renderBaseTenBlocks(answer)}
      </div>
    );
  }

  // DIVISION (÷): Shared Equal Groups of Base Ten Blocks
  if (operation === '÷') {
    return (
      <div className="flex justify-center items-center gap-2 p-2 sm:p-2.5 rounded-2xl bg-white/10 border border-white/20 max-w-full backdrop-blur-xs">
        {renderBaseTenBlocks(answer)}
      </div>
    );
  }

  return null;
}
