"use client";

import { MathProblem } from "@/lib/types";
import { cn } from "@/lib/utils";

type VisualMathProps = {
  problem: MathProblem;
};

// Helper: Render 2x5 Ten Frame Grid Box with Glassmorphic styling & Cyan/Orange Counter Tokens
function renderTenFrameGrid(
  frameIndex: number,
  num1Count: number,
  num2Count: number,
  totalItems: number,
  isSubtraction: boolean = false,
  subtractionTakenAway: number = 0
) {
  const frameStartIndex = frameIndex * 10;
  const frameSlots = Array.from({ length: 10 }).map((_, i) => frameStartIndex + i);

  // Skip extra empty frames beyond 1 frame
  if (frameStartIndex >= Math.max(10, Math.ceil(totalItems / 10) * 10) && frameIndex > 0) {
    return null;
  }

  return (
    <div
      key={`tf-${frameIndex}`}
      className="grid grid-rows-2 grid-cols-5 gap-1.5 p-2 rounded-xl bg-card/90 dark:bg-card/95 border border-border/80 shadow-xs"
    >
      {frameSlots.map((slotIndex) => {
        if (isSubtraction) {
          const isFilled = slotIndex < totalItems;
          const isRemoved = slotIndex >= totalItems - subtractionTakenAway && slotIndex < totalItems;

          if (!isFilled) {
            return (
              <div
                key={`slot-${slotIndex}`}
                className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-muted/30 border border-dashed border-border/40"
              />
            );
          }

          return (
            <div
              key={`slot-${slotIndex}`}
              className={cn(
                "w-4 h-4 sm:w-5 sm:h-5 rounded-md flex items-center justify-center font-bold text-xs transition-all duration-300 animate-fade-in-zoom cursor-pointer hover:scale-110",
                isRemoved
                  ? "bg-muted/40 text-muted-foreground/50 border border-dashed border-border/50 scale-90"
                  : "bg-cyan-500 text-white shadow-xs border border-cyan-600"
              )}
              style={{ animationDelay: `${slotIndex * 20}ms` }}
            >
              {isRemoved ? "✕" : ""}
            </div>
          );
        }

        // Addition & general: num1 = Vibrant Cyan, num2 = Vibrant Orange
        const isNum1 = slotIndex < num1Count;
        const isNum2 = slotIndex >= num1Count && slotIndex < num1Count + num2Count;
        const isEmpty = slotIndex >= num1Count + num2Count;

        if (isEmpty) {
          return (
            <div
              key={`slot-${slotIndex}`}
              className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-muted/30 border border-dashed border-border/40"
            />
          );
        }

        return (
          <div
            key={`slot-${slotIndex}`}
            className={cn(
              "w-4 h-4 sm:w-5 sm:h-5 rounded-md shadow-xs animate-fade-in-zoom hover:scale-125 transition-transform cursor-pointer",
              isNum1
                ? "bg-cyan-500 border border-cyan-600"
                : "bg-amber-500 border border-amber-600"
            )}
            style={{ animationDelay: `${slotIndex * 20}ms` }}
          />
        );
      })}
    </div>
  );
}

export function VisualMath({ problem }: VisualMathProps) {
  const { num1, num2, operation, answer } = problem;

  // Don't render visual frames if numbers are huge (> 40)
  if (Math.abs(num1) > 40 || Math.abs(num2) > 40 || Math.abs(answer) > 40) {
    return null;
  }

  // ADDITION (+): Ten Frames showing num1 (Cyan) and num2 (Orange) filling 2x5 grids
  if (operation === '+') {
    const total = num1 + num2;
    const frameCount = Math.max(1, Math.ceil(total / 10));

    return (
      <div className="flex flex-wrap justify-center items-center gap-2 p-1.5 sm:p-2 rounded-2xl bg-muted/40 border border-border/50 max-w-full backdrop-blur-xs">
        {Array.from({ length: frameCount }).map((_, fIdx) =>
          renderTenFrameGrid(fIdx, num1, num2, total, false, 0)
        )}
      </div>
    );
  }

  // SUBTRACTION (-): Ten Frames showing total items with taken away items crossed out
  if (operation === '-') {
    const total = num1;
    const takenAway = num2;
    const frameCount = Math.max(1, Math.ceil(total / 10));

    return (
      <div className="flex flex-wrap justify-center items-center gap-2 p-1.5 sm:p-2 rounded-2xl bg-muted/40 border border-border/50 max-w-full backdrop-blur-xs">
        {Array.from({ length: frameCount }).map((_, fIdx) =>
          renderTenFrameGrid(fIdx, 0, 0, total, true, takenAway)
        )}
      </div>
    );
  }

  // MULTIPLICATION (×): Ten Frames for total product
  if (operation === '×') {
    const total = num1 * num2;
    const frameCount = Math.max(1, Math.ceil(total / 10));

    return (
      <div className="flex flex-wrap justify-center items-center gap-2 p-1.5 sm:p-2 rounded-2xl bg-muted/40 border border-border/50 max-w-full backdrop-blur-xs">
        {Array.from({ length: frameCount }).map((_, fIdx) =>
          renderTenFrameGrid(fIdx, total, 0, total, false, 0)
        )}
      </div>
    );
  }

  // DIVISION (÷): Ten Frames for quotient
  if (operation === '÷') {
    const total = answer;
    const frameCount = Math.max(1, Math.ceil(total / 10));

    return (
      <div className="flex flex-wrap justify-center items-center gap-2 p-1.5 sm:p-2 rounded-2xl bg-muted/40 border border-border/50 max-w-full backdrop-blur-xs">
        {Array.from({ length: frameCount }).map((_, fIdx) =>
          renderTenFrameGrid(fIdx, total, 0, total, false, 0)
        )}
      </div>
    );
  }

  return null;
}
