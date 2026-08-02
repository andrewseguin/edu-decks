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
      // Incrementally reveal White Area blocks inside the matrix (1 block every 25ms)
      const total = num1 * num2;
      const intervalMs = total > 30 ? 20 : 45;
      let currentCyan = 0;
      const cyanInterval = setInterval(() => {
        currentCyan++;
        setCyanVisible(currentCyan);
        if (currentCyan >= total) {
          clearInterval(cyanInterval);
        }
      }, intervalMs);

      return () => clearInterval(cyanInterval);
    }

    if (operation === '÷') {
      // Step 1: Reveal total num1 Cyan blocks (1 every 40ms)
      const total = num1;
      const groupCount = Math.max(1, answer);
      let currentCyan = 0;
      const cyanInterval = setInterval(() => {
        currentCyan++;
        setCyanVisible(currentCyan);
        if (currentCyan >= total) {
          clearInterval(cyanInterval);

          // Step 2: 500ms pause, then sequentially partition into Orange Group Containers (1 every 200ms)
          setTimeout(() => {
            let currentOrange = 0;
            const orangeInterval = setInterval(() => {
              currentOrange++;
              setOrangeVisible(currentOrange);
              if (currentOrange >= groupCount) {
                clearInterval(orangeInterval);
              }
            }, 200);
          }, 500);
        }
      }, 40);

      return () => clearInterval(cyanInterval);
    }
  }, [problem.id, num1, num2, operation]);

  // Don't render visual frames if numbers are extremely huge (> 100 for mult/div, > 40 for add/sub)
  if (operation === '×' || operation === '÷') {
    if (Math.abs(num1) > 144 || Math.abs(num2) > 12 || Math.abs(answer) > 100) {
      return null;
    }
  } else {
    if (Math.abs(num1) > 40 || Math.abs(num2) > 40 || Math.abs(answer) > 40) {
      return null;
    }
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

  // MULTIPLICATION (×): Perfectly Proportioned Axis Grid (maxH=120px, maxW=480px, top-[140px])
  if (operation === '×') {
    const xCount = num1; // Cyan X-Axis across
    const yCount = num2; // Orange Y-Axis down
    const cols = xCount + 1; // Including Y-axis header column
    const rows = yCount + 1; // Including X-axis header row

    // Max available container dimensions inside card lower region
    const maxW = 480;
    const maxH = 120; // 120px max height guarantees 0% collision!

    // Calculate max square block size (in px) taking into account container padding & gaps
    const gapSize = Math.max(cols, rows) > 8 ? 2 : 4;
    const padding = 10;

    const availW = maxW - padding - (cols - 1) * gapSize;
    const availH = maxH - padding - (rows - 1) * gapSize;

    const rawSize = Math.min(availW / cols, availH / rows);
    const blockSize = Math.max(10, Math.min(26, Math.floor(rawSize)));
    const fontSize = Math.max(7, Math.floor(blockSize * 0.52));

    return (
      <div className="flex flex-col justify-center items-center p-1 sm:p-1.5 rounded-2xl bg-white/10 border border-white/20 max-w-full backdrop-blur-xs">
        <div
          className="grid p-1.5 rounded-xl bg-white/15 border border-white/30 shadow-xs"
          style={{ gap: `${gapSize}px` }}
        >
          {/* Top Row: Spacer Corner + Cyan X-Axis Headers across */}
          <div className="flex items-center" style={{ gap: `${gapSize}px` }}>
            {/* Top-Left Corner Spacer */}
            <div className="rounded-md bg-transparent shrink-0" style={{ width: `${blockSize}px`, height: `${blockSize}px` }} />

            {/* Cyan X-Axis Blocks across */}
            {Array.from({ length: xCount }).map((_, xIdx) => (
              <div
                key={`x-axis-${xIdx}`}
                className="rounded-md bg-cyan-300 border border-cyan-400 shadow-xs flex items-center justify-center font-bold text-cyan-950 animate-fade-in-zoom leading-none shrink-0"
                style={{ width: `${blockSize}px`, height: `${blockSize}px`, fontSize: `${fontSize}px` }}
              >
                {xIdx + 1}
              </div>
            ))}
          </div>

          {/* Rows: Orange Y-Axis Header + White Area Blocks */}
          {Array.from({ length: yCount }).map((_, yIdx) => {
            const rowStartIndex = yIdx * xCount;

            return (
              <div key={`y-row-${yIdx}`} className="flex items-center" style={{ gap: `${gapSize}px` }}>
                {/* Orange Y-Axis Block down */}
                <div
                  className="rounded-md bg-amber-400 border border-amber-500 shadow-xs flex items-center justify-center font-bold text-amber-950 animate-fade-in-zoom leading-none shrink-0"
                  style={{ width: `${blockSize}px`, height: `${blockSize}px`, fontSize: `${fontSize}px` }}
                >
                  {yIdx + 1}
                </div>

                {/* White Area Blocks inside matrix */}
                {Array.from({ length: xCount }).map((_, xIdx) => {
                  const areaIndex = rowStartIndex + xIdx;

                  if (areaIndex >= cyanVisible) {
                    return (
                      <div
                        key={`area-slot-${areaIndex}`}
                        className="rounded-md bg-white/5 border border-dashed border-white/20 shrink-0"
                        style={{ width: `${blockSize}px`, height: `${blockSize}px` }}
                      />
                    );
                  }

                  return (
                    <div
                      key={`area-slot-${areaIndex}`}
                      className="rounded-md bg-white border border-white/80 shadow-xs animate-fill-in cursor-pointer hover:scale-125 transition-transform shrink-0"
                      style={{ width: `${blockSize}px`, height: `${blockSize}px` }}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // DIVISION (÷): Total Cyan blocks (num1) partitioned into Orange group containers of size num2
  if (operation === '÷') {
    const total = num1;        // Total Cyan items to partition
    const groupSize = Math.max(1, num2); // Items per group
    const groupCount = Math.max(1, answer); // Total groups (answer)

    const blockSizeClass =
      total <= 12
        ? "w-3.5 h-3.5 sm:w-4 sm:h-4"
        : total <= 30
        ? "w-2.5 h-2.5 sm:w-3 sm:h-3"
        : "w-2 h-2 sm:w-2.5 sm:h-2.5";

    return (
      <div className="flex flex-wrap justify-center items-center gap-2 p-1.5 sm:p-2 rounded-2xl bg-white/10 border border-white/20 max-w-full backdrop-blur-xs">
        {Array.from({ length: groupCount }).map((_, gIdx) => {
          const groupStartIndex = gIdx * groupSize;
          const groupItems = Array.from({ length: groupSize }).map((_, i) => groupStartIndex + i);

          const isGroupPartitioned = gIdx < orangeVisible;

          return (
            <div
              key={`div-group-${gIdx}`}
              className={cn(
                "relative flex items-center gap-1 p-1.5 sm:p-2 rounded-xl transition-all duration-300",
                isGroupPartitioned
                  ? "bg-amber-500/20 border-2 border-amber-400 shadow-xs animate-silly-pop"
                  : "bg-white/10 border border-dashed border-white/25"
              )}
            >
              {/* Orange Group Number Badge when Partitioned */}
              {isGroupPartitioned && (
                <div className="absolute -top-2.5 -left-2.5 w-5 h-5 rounded-full bg-amber-400 border border-amber-500 shadow-xs flex items-center justify-center font-bold text-[10px] text-amber-950 animate-fade-in-zoom">
                  {gIdx + 1}
                </div>
              )}

              {/* Cyan items inside this group */}
              {groupItems.map((slotIndex) => {
                if (slotIndex >= total) return null;

                if (slotIndex >= cyanVisible) {
                  return (
                    <div
                      key={`div-slot-${slotIndex}`}
                      className={cn("rounded-md bg-white/5 border border-dashed border-white/20", blockSizeClass)}
                    />
                  );
                }

                return (
                  <div
                    key={`div-slot-${slotIndex}`}
                    className={cn(
                      "rounded-md bg-cyan-300 border border-cyan-400 shadow-xs animate-fill-in cursor-pointer hover:scale-125 transition-transform",
                      blockSizeClass
                    )}
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
