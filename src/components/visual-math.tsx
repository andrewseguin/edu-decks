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

  // Trigger step 2 after 450ms so the user visually sees the second number fill-in or take-away
  useEffect(() => {
    setStep(1);
    const timer = setTimeout(() => {
      setStep(2);
    }, 450);
    return () => clearTimeout(timer);
  }, [problem.id]);

  // Don't render visual frames if numbers are huge (> 40)
  if (Math.abs(num1) > 40 || Math.abs(num2) > 40 || Math.abs(answer) > 40) {
    return null;
  }

  // ADDITION (+): num1 Cyan blocks appear first, then num2 Orange blocks fill in on step 2
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
                const isNum2 = slotIndex >= num1 && slotIndex < num1 + num2;
                const isEmpty = slotIndex >= total;

                if (isEmpty) {
                  return (
                    <div
                      key={`slot-${slotIndex}`}
                      className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-white/5 border border-dashed border-white/20"
                    />
                  );
                }

                if (isNum1) {
                  return (
                    <div
                      key={`slot-${slotIndex}`}
                      className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-cyan-300 border border-cyan-400 shadow-xs animate-fade-in-zoom cursor-pointer hover:scale-125 transition-transform"
                      style={{ animationDelay: `${slotIndex * 30}ms` }}
                    />
                  );
                }

                // num2 Orange blocks: only visible on Step 2 with fill-in drop animation!
                if (isNum2) {
                  if (step < 2) {
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
                      style={{ animationDelay: `${num2Index * 60}ms` }}
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

  // SUBTRACTION (-): Total blocks appear first, then takenAway blocks dissolve on step 2
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

                if (isRemoved && step >= 2) {
                  return (
                    <div
                      key={`slot-${slotIndex}`}
                      className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-white/10 text-white/40 border border-dashed border-white/30 flex items-center justify-center font-bold text-xs animate-take-away"
                      style={{ animationDelay: `${removedIndex * 75}ms` }}
                    >
                      ✕
                    </div>
                  );
                }

                return (
                  <div
                    key={`slot-${slotIndex}`}
                    className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-cyan-300 border border-cyan-400 shadow-xs animate-fade-in-zoom cursor-pointer hover:scale-125 transition-transform"
                    style={{ animationDelay: `${slotIndex * 25}ms` }}
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
                    style={{ animationDelay: `${slotIndex * 20}ms` }}
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
                    style={{ animationDelay: `${slotIndex * 20}ms` }}
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
