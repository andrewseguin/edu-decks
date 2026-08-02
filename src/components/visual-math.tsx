"use client";

import { useState, useEffect } from "react";
import { MathProblem } from "@/lib/types";
import { cn } from "@/lib/utils";

type VisualMathProps = {
  problem: MathProblem;
};

export function VisualMath({ problem }: VisualMathProps) {
  const { num1, num2, operation, answer } = problem;
  const [step, setStep] = useState(1);

  useEffect(() => {
    setStep(1);
    // Step 1: Empty frame or initial Cyan blocks
    // Step 2: Cyan blocks fill in (for addition) or Subtraction Orange ✕ badges begin
    const timer1 = setTimeout(() => {
      setStep(2);
    }, 250);

    // Step 3: Orange blocks fill in (for addition)
    const cyanDuration = Math.max(1, num1) * 100;
    const timer2 = setTimeout(() => {
      setStep(3);
    }, 250 + cyanDuration + 100);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [problem.id, num1]);

  // Don't render visual frames if numbers are huge (> 40)
  if (Math.abs(num1) > 40 || Math.abs(num2) > 40 || Math.abs(answer) > 40) {
    return null;
  }

  // ADDITION (+): Empty slots first -> Cyan blocks incrementally appear -> Orange blocks incrementally appear
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
                const isNum1 = slotIndex < num1;
                const isNum2 = slotIndex >= num1 && slotIndex < total;
                const isEmpty = slotIndex >= total;

                // Slot is empty beyond total problem answer
                if (isEmpty) {
                  return (
                    <div
                      key={`slot-${slotIndex}`}
                      className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-white/5 border border-dashed border-white/20"
                    />
                  );
                }

                // Cyan blocks: appear incrementally on Step 2
                if (isNum1) {
                  if (step < 2) {
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
                      style={{ animationDelay: `${slotIndex * 100}ms` }}
                    />
                  );
                }

                // Orange blocks: appear incrementally on Step 3
                if (isNum2) {
                  if (step < 3) {
                    return (
                      <div
                        key={`slot-${slotIndex}`}
                        className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-white/5 border border-dashed border-white/20"
                      />
                    );
                  }
                  const num2Index = slotIndex - num1;
                  return (
                    <div
                      key={`slot-${slotIndex}`}
                      className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-amber-400 border border-amber-500 shadow-xs animate-fill-in cursor-pointer hover:scale-125 transition-transform"
                      style={{ animationDelay: `${num2Index * 120}ms` }}
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

  // SUBTRACTION (-): Cyan blocks present -> Taken away incrementally by Orange ✕ badges with clear block & soft border
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
                const isRemoved = slotIndex >= remaining && slotIndex < total;
                const removedIndex = slotIndex - remaining;

                if (!isFilled) {
                  return (
                    <div
                      key={`slot-${slotIndex}`}
                      className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-white/5 border border-dashed border-white/20"
                    />
                  );
                }

                // Step 2: Incrementally taken away by Orange ✕ badges in a clear block with soft border
                if (isRemoved && step >= 2) {
                  return (
                    <div
                      key={`slot-${slotIndex}`}
                      className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-amber-400/90 text-amber-950 border border-amber-300/80 shadow-xs flex items-center justify-center font-bold text-xs animate-fill-in cursor-pointer hover:scale-110"
                      style={{ animationDelay: `${removedIndex * 120}ms` }}
                    >
                      ✕
                    </div>
                  );
                }

                // Initial Cyan block for num1
                return (
                  <div
                    key={`slot-${slotIndex}`}
                    className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-cyan-300 border border-cyan-400 shadow-xs animate-fade-in-zoom cursor-pointer hover:scale-125 transition-transform"
                    style={{ animationDelay: `${slotIndex * 30}ms` }}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    );
  }

  // MULTIPLICATION (×)
  if (operation === '×') {
    const total = num1 * num2;
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
                    style={{ animationDelay: `${slotIndex * 35}ms` }}
                  />
                );
              })}
            </div>
          );
        })}
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
                    style={{ animationDelay: `${slotIndex * 35}ms` }}
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
