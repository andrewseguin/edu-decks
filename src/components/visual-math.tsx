"use client";

import { useState, useEffect } from "react";
import { MathProblem, Fraction } from "@/lib/types";
import { cn } from "@/lib/utils";

type VisualMathProps = {
  problem: MathProblem;
};

// SVG Fraction Circle Component
function FractionCircle({
  fraction,
  fillColor,
  strokeColor,
  size = 64,
}: {
  fraction: Fraction;
  fillColor: string;
  strokeColor: string;
  size?: number;
}) {
  const { n, d } = fraction;
  const radius = size / 2 - 4;
  const center = size / 2;

  // Handle whole numbers or values >= 1
  const wholeCount = Math.floor(n / d);
  const remainderN = n % d;
  const totalCircles = Math.max(1, wholeCount + (remainderN > 0 ? 1 : 0));

  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: totalCircles }).map((_, circleIdx) => {
        let filledSlices = d;
        if (circleIdx === wholeCount) {
          filledSlices = remainderN;
        } else if (circleIdx > wholeCount) {
          filledSlices = 0;
        }

        const slices = Array.from({ length: d }).map((_, i) => {
          const startAngle = (i * 360) / d - 90;
          const endAngle = ((i + 1) * 360) / d - 90;

          const startRad = (startAngle * Math.PI) / 180;
          const endRad = (endAngle * Math.PI) / 180;

          const x1 = center + radius * Math.cos(startRad);
          const y1 = center + radius * Math.sin(startRad);
          const x2 = center + radius * Math.cos(endRad);
          const y2 = center + radius * Math.sin(endRad);

          const largeArcFlag = 360 / d > 180 ? 1 : 0;

          const pathData =
            d === 1
              ? `M ${center - radius}, ${center} a ${radius},${radius} 0 1,0 ${radius * 2},0 a ${radius},${radius} 0 1,0 -${radius * 2},0`
              : `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

          const isFilled = i < filledSlices;

          return (
            <path
              key={`slice-${i}`}
              d={pathData}
              className={cn(
                "transition-all duration-300",
                isFilled
                  ? `${fillColor} ${strokeColor} stroke-2`
                  : "fill-white/10 stroke-white/30 stroke-1 stroke-dashed"
              )}
            />
          );
        });

        return (
          <svg
            key={`circle-${circleIdx}`}
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="drop-shadow-xs"
          >
            {slices}
          </svg>
        );
      })}
    </div>
  );
}

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
      let currentCyan = 0;
      const cyanInterval = setInterval(() => {
        currentCyan++;
        setCyanVisible(currentCyan);
        if (currentCyan >= num1) {
          clearInterval(cyanInterval);

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
      let currentCyan = 0;
      const cyanInterval = setInterval(() => {
        currentCyan++;
        setCyanVisible(currentCyan);
        if (currentCyan >= num1) {
          clearInterval(cyanInterval);

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
      setCyanVisible(num1);
      const timeoutId = setTimeout(() => {
        setOrangeVisible(1);
      }, 550);

      return () => clearTimeout(timeoutId);
    }
  }, [problem.id, num1, num2, operation]);

  // Fraction Visualizer Component
  if (problem.isFraction && problem.frac1 && problem.frac2) {
    const f1 = problem.frac1;
    const f2 = problem.frac2;
    const ans = problem.fracAnswer;

    return (
      <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-5 p-2 rounded-2xl bg-white/10 border border-white/20 max-w-full backdrop-blur-xs">
        {/* Fraction 1 Circle (Cyan) */}
        <div className="flex flex-col items-center gap-1">
          <FractionCircle fraction={f1} fillColor="fill-cyan-300" strokeColor="stroke-cyan-400" size={54} />
          <span className="text-xs font-headline font-bold text-cyan-300">
            {f1.n}/{f1.d}
          </span>
        </div>

        <span className="text-lg sm:text-xl font-bold text-white/80">
          {problem.operation}
        </span>

        {/* Fraction 2 Circle (Orange) */}
        <div className="flex flex-col items-center gap-1">
          <FractionCircle fraction={f2} fillColor="fill-amber-400" strokeColor="stroke-amber-500" size={54} />
          <span className="text-xs font-headline font-bold text-amber-300">
            {f2.n}/{f2.d}
          </span>
        </div>

        {ans && (
          <>
            <span className="text-lg sm:text-xl font-bold text-white/80">=</span>
            {/* Answer Fraction Circle (White) */}
            <div className="flex flex-col items-center gap-1">
              <FractionCircle fraction={ans} fillColor="fill-white" strokeColor="stroke-white/80" size={54} />
              <span className="text-xs font-headline font-bold text-white">
                {ans.n}/{ans.d}
              </span>
            </div>
          </>
        )}
      </div>
    );
  }

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

  // ADDITION (+)
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
                      className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-cyan-300 border border-cyan-400 shadow-xs transition-opacity duration-200"
                    />
                  );
                }

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
                      className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-amber-400 border border-amber-500 shadow-xs transition-opacity duration-200"
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

  // SUBTRACTION (-)
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

                if (slotIndex >= cyanVisible) {
                  return (
                    <div
                      key={`slot-${slotIndex}`}
                      className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-white/5 border border-dashed border-white/20"
                    />
                  );
                }

                const subReverseIndex = (total - 1) - slotIndex;

                if (isRemovedSlot && subReverseIndex < subtractionCount) {
                  return (
                    <div
                      key={`slot-${slotIndex}`}
                      className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-transparent text-amber-400 border border-dashed border-amber-400/80 shadow-xs flex items-center justify-center font-bold text-xs sm:text-sm transition-opacity duration-200"
                    >
                      <span>✕</span>
                    </div>
                  );
                }

                return (
                  <div
                    key={`slot-${slotIndex}`}
                    className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-cyan-300 border border-cyan-400 shadow-xs transition-opacity duration-200"
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
    const xCount = num1;
    const yCount = num2;
    const cols = xCount + 1;
    const rows = yCount + 1;

    const maxW = 480;
    const maxH = 120;

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
          <div className="flex items-center" style={{ gap: `${gapSize}px` }}>
            <div className="rounded-md bg-transparent shrink-0" style={{ width: `${blockSize}px`, height: `${blockSize}px` }} />
            {Array.from({ length: xCount }).map((_, xIdx) => (
              <div
                key={`x-axis-${xIdx}`}
                className="rounded-md bg-cyan-300 border border-cyan-400 shadow-xs flex items-center justify-center font-bold text-cyan-950 leading-none shrink-0"
                style={{ width: `${blockSize}px`, height: `${blockSize}px`, fontSize: `${fontSize}px` }}
              >
                {xIdx + 1}
              </div>
            ))}
          </div>

          {Array.from({ length: yCount }).map((_, yIdx) => {
            const rowStartIndex = yIdx * xCount;

            return (
              <div key={`y-row-${yIdx}`} className="flex items-center" style={{ gap: `${gapSize}px` }}>
                <div
                  className="rounded-md bg-amber-400 border border-amber-500 shadow-xs flex items-center justify-center font-bold text-amber-950 leading-none shrink-0"
                  style={{ width: `${blockSize}px`, height: `${blockSize}px`, fontSize: `${fontSize}px` }}
                >
                  {yIdx + 1}
                </div>

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
                      className="rounded-md bg-white border border-white/80 shadow-xs transition-opacity duration-150 shrink-0"
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

  // DIVISION (÷)
  if (operation === '÷') {
    const total = num1;
    const itemsPerGroup = num2;
    const groupCount = answer;

    const isSeparated = orangeVisible > 0;

    const maxW = 460;

    const groupPadding = 12;
    const groupGap = 10;
    const itemGap = 3;

    const totalItemGaps = groupCount * Math.max(0, itemsPerGroup - 1) * itemGap;
    const totalGroupGaps = Math.max(0, groupCount - 1) * groupGap;
    const totalGroupPadding = groupCount * groupPadding;

    const availWForBlocks = maxW - totalItemGaps - totalGroupGaps - totalGroupPadding - 16;
    const rawBlockSize = Math.floor(availWForBlocks / total);
    const blockSize = Math.max(12, Math.min(24, rawBlockSize));

    return (
      <div
        className={cn(
          "flex flex-wrap justify-center items-center rounded-2xl bg-white/10 border border-white/20 max-w-full backdrop-blur-xs transition-all duration-500 ease-out p-1.5 sm:p-2",
          isSeparated ? "gap-2 sm:gap-2.5" : "gap-0.5 sm:gap-1"
        )}
      >
        {Array.from({ length: groupCount }).map((_, gIdx) => {
          const groupStartIndex = gIdx * itemsPerGroup;
          const groupSlots = Array.from({ length: itemsPerGroup }).map((_, i) => groupStartIndex + i);

          return (
            <div
              key={`div-group-${gIdx}`}
              className={cn(
                "flex items-center justify-center rounded-xl transition-all duration-500 ease-out whitespace-nowrap shrink-0 p-1 sm:p-1.5 gap-0.5 sm:gap-1",
                isSeparated
                  ? "bg-amber-500/20 border-2 border-amber-400/80 shadow-xs"
                  : "bg-transparent border-2 border-transparent"
              )}
            >
              {groupSlots.map((slotIndex) => {
                if (slotIndex >= total) return null;

                return (
                  <div
                    key={`div-slot-${slotIndex}`}
                    className="rounded-md bg-cyan-300 border border-cyan-400 shadow-xs cursor-pointer hover:scale-125 transition-all duration-500 shrink-0"
                    style={{ width: `${blockSize}px`, height: `${blockSize}px` }}
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
