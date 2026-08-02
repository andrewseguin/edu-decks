"use client";

import { MathProblem } from "@/lib/types";
import { cn } from "@/lib/utils";

type VisualMathProps = {
  problem: MathProblem;
};

export function VisualMath({ problem }: VisualMathProps) {
  const { num1, num2, operation, answer } = problem;

  // Don't render visual blocks if numbers are huge (> 50) to prevent overflow
  if (Math.abs(num1) > 50 || Math.abs(num2) > 50 || Math.abs(answer) > 50) {
    return null;
  }

  // ADDITION (+): Group 1 (num1) + Group 2 (num2)
  if (operation === '+') {
    return (
      <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-2xl bg-white/10 border border-white/20 max-w-full backdrop-blur-xs">
        {/* First Group with Count Tag */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider">
            {num1}
          </span>
          <div className="flex flex-wrap gap-1 justify-center max-w-[130px]">
            {Array.from({ length: Math.max(0, num1) }).map((_, i) => (
              <div
                key={`a-${i}`}
                className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-white shadow-xs animate-fade-in-zoom hover:scale-125 transition-transform cursor-pointer"
                style={{ animationDelay: `${i * 25}ms` }}
              />
            ))}
          </div>
        </div>

        <span className="text-white font-bold text-lg sm:text-xl self-center">+</span>

        {/* Second Group with Count Tag */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider">
            {num2}
          </span>
          <div className="flex flex-wrap gap-1 justify-center max-w-[130px]">
            {Array.from({ length: Math.max(0, num2) }).map((_, i) => (
              <div
                key={`b-${i}`}
                className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-white/80 shadow-xs animate-fade-in-zoom hover:scale-125 transition-transform cursor-pointer"
                style={{ animationDelay: `${(num1 + i) * 25}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // SUBTRACTION (-): Total (num1) with Taken Away (num2) crossed out
  if (operation === '-') {
    const total = num1;
    const takenAway = num2;
    const remaining = Math.max(0, total - takenAway);

    return (
      <div className="flex flex-col items-center gap-1.5 p-2.5 sm:p-3 rounded-2xl bg-white/10 border border-white/20 max-w-[300px] backdrop-blur-xs">
        <div className="flex items-center justify-between w-full px-1 text-[10px] font-bold text-white/70 uppercase tracking-wider">
          <span>{remaining} remaining</span>
          <span>{takenAway} taken away</span>
        </div>
        <div className="flex flex-wrap justify-center gap-1 max-w-[260px]">
          {Array.from({ length: Math.max(0, total) }).map((_, i) => {
            const isRemoved = i >= remaining;
            return (
              <div
                key={`s-${i}`}
                className={cn(
                  "w-5 h-5 sm:w-6 sm:h-6 rounded-md flex items-center justify-center transition-all duration-300 animate-fade-in-zoom cursor-pointer hover:scale-110",
                  isRemoved
                    ? "bg-white/15 text-white/40 border border-dashed border-white/30 scale-90"
                    : "bg-white text-amber-700 shadow-xs font-bold text-xs"
                )}
                style={{ animationDelay: `${i * 20}ms` }}
              >
                {isRemoved ? "✕" : ""}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // MULTIPLICATION (×): Grouped Sets (num1 groups of num2)
  if (operation === '×') {
    const groups = Math.max(1, num1);
    const itemsPerGroup = Math.max(1, num2);
    return (
      <div className="flex flex-col items-center gap-1.5 p-2.5 sm:p-3 rounded-2xl bg-white/10 border border-white/20 max-w-full backdrop-blur-xs">
        <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider">
          {groups} groups of {itemsPerGroup}
        </span>
        <div className="flex flex-wrap justify-center gap-2 max-w-[320px]">
          {Array.from({ length: groups }).map((_, gIdx) => (
            <div
              key={`mg-${gIdx}`}
              className="flex flex-wrap gap-1 p-1.5 rounded-xl bg-white/15 border border-white/25 justify-center items-center"
            >
              {Array.from({ length: itemsPerGroup }).map((_, itemIdx) => (
                <div
                  key={`mgi-${gIdx}-${itemIdx}`}
                  className="w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-md bg-white shadow-xs animate-fade-in-zoom hover:scale-125 transition-transform cursor-pointer"
                  style={{ animationDelay: `${(gIdx * itemsPerGroup + itemIdx) * 20}ms` }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // DIVISION (÷): Distribute num1 items into num2 equal containers
  if (operation === '÷') {
    const groupCount = Math.max(1, num2); // divisor
    const perGroup = answer; // quotient
    return (
      <div className="flex flex-col items-center gap-1.5 p-2.5 sm:p-3 rounded-2xl bg-white/10 border border-white/20 max-w-full backdrop-blur-xs">
        <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider">
          {num1} shared into {groupCount} equal groups
        </span>
        <div className="flex flex-wrap justify-center gap-2 max-w-[320px]">
          {Array.from({ length: groupCount }).map((_, gIdx) => (
            <div
              key={`dg-${gIdx}`}
              className="flex flex-wrap gap-1 p-1.5 rounded-xl bg-white/15 border border-white/25 justify-center items-center min-w-[36px]"
            >
              {Array.from({ length: Math.max(0, perGroup) }).map((_, itemIdx) => (
                <div
                  key={`dgi-${gIdx}-${itemIdx}`}
                  className="w-4 h-4 rounded-md bg-white shadow-xs animate-fade-in-zoom hover:scale-125 transition-transform cursor-pointer"
                  style={{ animationDelay: `${(gIdx * perGroup + itemIdx) * 25}ms` }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
