"use client";

import { useState, useEffect } from "react";
import { MathProblem } from "@/lib/types";
import { cn } from "@/lib/utils";

type VisualMathProps = {
  problem: MathProblem;
};

export function VisualMath({ problem }: VisualMathProps) {
  const { num1, num2, operation, answer } = problem;
  const [cyanVisible, setCyanVisible] = useState(0);
  const [orangeVisible, setOrangeVisible] = useState(0);
  const [subtractionCount, setSubtractionCount] = useState(0);

  useEffect(() => {
    // Reset state for new problem
    setCyanVisible(0);
    setOrangeVisible(0);
    setSubtractionCount(0);

    if (operation === '+') {
      // Step 1: Incrementally reveal Cyan blocks (1 every 90ms)
      let currentCyan = 0;
      const cyanInterval = setInterval(() => {
        currentCyan++;
        setCyanVisible(currentCyan);
        if (currentCyan >= num1) {
          clearInterval(cyanInterval);

          // Step 2: Incrementally reveal Orange blocks (1 every 110ms) after Cyan finishes + 400ms pause
          setTimeout(() => {
            let currentOrange = 0;
            const orangeInterval = setInterval(() => {
              currentOrange++;
              setOrangeVisible(currentOrange);
              if (currentOrange >= num2) {
                clearInterval(orangeInterval);
              }
            }, 110);
          }, 400);
        }
      }, 90);

      return () => clearInterval(cyanInterval);
    }

    if (operation === '-') {
      // Step 1: Incrementally reveal Cyan blocks (num1) from empty slots (1 every 90ms)
      let currentCyan = 0;
      const cyanInterval = setInterval(() => {
        currentCyan++;
        setCyanVisible(currentCyan);
        if (currentCyan >= num1) {
          clearInterval(cyanInterval);

          // Step 2: Clear 650ms pause before starting to animate Orange ✕ badges from the END
          setTimeout(() => {
            let currentSub = 0;
            const subInterval = setInterval(() => {
              currentSub++;
              setSubtractionCount(currentSub);
              if (currentSub >= num2) {
                clearInterval(subInterval);
              }
            }, 150);
          }, 650);
        }
      }, 90);

      return () => clearInterval(cyanInterval);
    }

    if (operation === '×') {
      // Incrementally reveal Cyan blocks across rows (num1 wide) down (num2 tall) (1 block every 80ms)
      const total = num1 * num2;
      let currentCyan = 0;
      const cyanInterval = setInterval(() => {
        currentCyan++;
        setCyanVisible(currentCyan);
        if (currentCyan >= total) {
          clearInterval(cyanInterval);
        }
      }, 80);

      return () => clearInterval(cyanInterval);
    }
  }, [problem.id, num1, num2, operation]);

  // Don't render visual frames if numbers are huge (> 40)
  if (Math.abs(num1) > 40 || Math.abs(num2) > 40 || Math.abs(answer) > 40) {
    return null;
  }

  // ADDITION (+): Truly empty slots -> Cyan blocks increment -> Orange blocks increment
  if (operation === '+') {
    const total = num1 + num2;
    const frameCount = Math.max(1, Math.ceil(total / 10));

    return (
      <div className="flex flex-wrap justify-center items-center gap-2 p-2 sm:p-2.5 rounded-2xl bg-white/10 border border-white/20 max-w-full backdrop-blur-xs">
        {Array.from({ length: frameCount }).map((_, fIdx) => {
          const frameStartIndex = fIdx * 10;
          const frameSlots = Array.from({ length: 10 }).map((_, i) => frameStartIndex + i);

          return (
            <div
              key={`tf-${fIdx}`}
              className="grid grid-rows-2 grid-cols-5 gap-1.5 p-2 rounded-xl bg-white/15 border border-white/30 backdrop-blur-xs shadow-xs"
            >
              {frameSlots.map((slotIndex) => {
                const isNum1Slot = slotIndex < num1;
                const isNum2Slot = slotIndex >= num1 && slotIndex < total;
                const isEmptySlot = slotIndex >= total;

                if (isEmptySlot) {
                  return (
                    <div
                      key={`slot-${slotIndex}`}
                      className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-white/5 border border-dashed border-white/20"
                    />
                  );
                }

                // Cyan block: TRULY empty until cyanVisible reaches this slot
                if (isNum1Slot) {
                  if (slotIndex >= cyanVisible) {
                    return (
                      <div
                        key={`slot-${slotIndex}`}
                        className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-white/5 border border-dashed border-white/20"
                      />
                    );
                  }
                  return (
                    <div
                      key={`slot-${slotIndex}`}
                      className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-cyan-300 border border-cyan-400 shadow-xs animate-fill-in cursor-pointer hover:scale-125 transition-transform"
                    />
                  );
                }

                // Orange block: TRULY empty until orangeVisible reaches this slot
                if (isNum2Slot) {
                  const orangeIdx = slotIndex - num1;
                  if (orangeIdx >= orangeVisible) {
                    return (
                      <div
                        key={`slot-${slotIndex}`}
                        className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-white/5 border border-dashed border-white/20"
                      />
                    );
                  }
                  return (
                    <div
                      key={`slot-${slotIndex}`}
                      className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-amber-400 border border-amber-500 shadow-xs animate-fill-in cursor-pointer hover:scale-125 transition-transform"
                    />
                  );
                }

                return null;
              })}
            </div>
          );
        })}
      </div>
    );
  }

  // SUBTRACTION (-): Empty slots -> Cyan blocks (num1) fill in -> Clear 650ms Pause -> Silly popping Orange ✕ badges
  if (operation === '-') {
    const total = num1;
    const takenAway = num2;
    const remaining = Math.max(0, total - takenAway);
    const frameCount = Math.max(1, Math.ceil(total / 10));

    return (
      <div className="flex flex-wrap justify-center items-center gap-2 p-2 sm:p-2.5 rounded-2xl bg-white/10 border border-white/20 max-w-full backdrop-blur-xs">
        {Array.from({ length: frameCount }).map((_, fIdx) => {
          const frameStartIndex = fIdx * 10;
          const frameSlots = Array.from({ length: 10 }).map((_, i) => frameStartIndex + i);

          return (
            <div
              key={`tf-${fIdx}`}
              className="grid grid-rows-2 grid-cols-5 gap-1.5 p-2 rounded-xl bg-white/15 border border-white/30 backdrop-blur-xs shadow-xs"
            >
              {frameSlots.map((slotIndex) => {
                const isFilled = slotIndex < total;
                const isRemovedSlot = slotIndex >= remaining && slotIndex < total;

                if (!isFilled) {
                  return (
                    <div
                      key={`slot-${slotIndex}`}
                      className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-white/5 border border-dashed border-white/20"
                    />
                  );
                }

                // Cyan block not yet filled in during Step 1
                if (slotIndex >= cyanVisible) {
                  return (
                    <div
                      key={`slot-${slotIndex}`}
                      className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-white/5 border border-dashed border-white/20"
                    />
                  );
                }

                // Reverse index from the end for subtraction take-away
                const subReverseIndex = (total - 1) - slotIndex;

                // Subtraction Orange ✕ Badge with silly popping animation & ONE-SHOT pop ring burst
                if (isRemovedSlot && subReverseIndex < subtractionCount) {
                  return (
                    <div
                      key={`slot-${slotIndex}`}
                      className="relative w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-transparent text-amber-400 border border-dashed border-amber-400/80 shadow-xs flex items-center justify-center font-bold text-xs sm:text-sm animate-silly-pop cursor-pointer hover:scale-125 transition-transform"
                    >
                      <span>✕</span>
                      {/* One-Shot Silly Pop Ring burst (runs ONCE and stops) */}
                      <span className="absolute -inset-1 rounded-lg border border-amber-400/70 animate-silly-ring-once pointer-events-none" />
                    </div>
                  );
                }

                // Initial Cyan block for num1
                return (
                  <div
                    key={`slot-${slotIndex}`}
                    className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-cyan-300 border border-cyan-400 shadow-xs animate-fill-in cursor-pointer hover:scale-125 transition-transform"
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    );
  }

  // MULTIPLICATION (×): Rectangular Area Grid (num1 columns across × num2 rows down)
  if (operation === '×') {
    const total = num1 * num2;
    const cols = Math.min(12, Math.max(1, num1));

    return (
      <div className="flex justify-center items-center p-2 sm:p-2.5 rounded-2xl bg-white/10 border border-white/20 max-w-full backdrop-blur-xs">
        <div
          className="grid gap-1.5 p-2 rounded-xl bg-white/15 border border-white/30 backdrop-blur-xs shadow-xs"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: total }).map((_, slotIndex) => {
            if (slotIndex >= cyanVisible) {
              return (
                <div
                  key={`mult-slot-${slotIndex}`}
                  className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-white/5 border border-dashed border-white/20"
                />
              );
            }

            return (
              <div
                key={`mult-slot-${slotIndex}`}
                className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-cyan-300 border border-cyan-400 shadow-xs animate-fill-in cursor-pointer hover:scale-125 transition-transform"
              />
            );
          })}
        </div>
      </div>
    );
  }

  // DIVISION (÷)
  if (operation === '÷') {
    const total = answer;
    const frameCount = Math.max(1, Math.ceil(total / 10));

    return (
      <div className="flex flex-wrap justify-center items-center gap-2 p-2 sm:p-2.5 rounded-2xl bg-white/10 border border-white/20 max-w-full backdrop-blur-xs">
        {Array.from({ length: frameCount }).map((_, fIdx) => {
          const frameStartIndex = fIdx * 10;
          const frameSlots = Array.from({ length: 10 }).map((_, i) => frameStartIndex + i);

          return (
            <div
              key={`tf-${fIdx}`}
              className="grid grid-rows-2 grid-cols-5 gap-1.5 p-2 rounded-xl bg-white/15 border border-white/30 backdrop-blur-xs shadow-xs"
            >
              {frameSlots.map((slotIndex) => {
                const isFilled = slotIndex < total;
                if (!isFilled) return null;
                return (
                  <div
                    key={`slot-${slotIndex}`}
                    className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-cyan-300 border border-cyan-400 shadow-xs animate-fade-in-zoom cursor-pointer hover:scale-125 transition-transform"
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    );
  }

  return null;
}
