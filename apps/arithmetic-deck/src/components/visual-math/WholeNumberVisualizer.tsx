import { MathProblem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { StepControls } from "./StepControls";

type WholeNumberVisualizerProps = {
  problem: MathProblem;
  activeStep: number;
  cyanVisible: number;
  orangeVisible: number;
  subtractionCount: number;
  whiteCount: number;
  onStepClick: (step: number) => void;
  onReplay: () => void;
};

export function WholeNumberVisualizer({
  problem,
  activeStep,
  cyanVisible,
  orangeVisible,
  subtractionCount,
  whiteCount,
  onStepClick,
  onReplay,
}: WholeNumberVisualizerProps) {
  const { num1, num2, operation, answer } = problem;

  // Don't render visual frames if numbers are extremely huge
  if (operation === '×' || operation === '÷') {
    if (Math.abs(num1) > 144 || Math.abs(num2) > 12 || Math.abs(answer) > 100) {
      return null;
    }
  } else {
    if (Math.abs(num1) > 100 || Math.abs(num2) > 100 || Math.abs(answer) > 100) {
      return null;
    }
  }

  // ADDITION (+)
  if (operation === '+') {
    const total = num1 + num2;
    const frameCount = Math.max(1, Math.ceil(total / 10));
    const isCompact = frameCount > 4;
    const slotSize = isCompact ? "w-3 h-3 sm:w-4 sm:h-4" : "w-3.5 h-3.5 sm:w-5 sm:h-5 [@media(max-height:640px)]:w-3 [@media(max-height:640px)]:h-3";
    const framePadding = isCompact ? "p-1 sm:p-1.5" : "p-1.5 sm:p-2";
    const frameGap = isCompact ? "gap-0.5 sm:gap-1" : "gap-1 sm:gap-1.5";

    return (
      <div className="flex flex-col items-center justify-center gap-1.5 [@media(max-height:640px)]:scale-85">
        <div className="flex flex-wrap justify-center items-center gap-1.5 p-1 sm:p-2.5 rounded-2xl bg-white/10 border border-white/20 max-w-full backdrop-blur-xs">
          {Array.from({ length: frameCount }).map((_, fIdx) => {
            const frameStartIndex = fIdx * 10;
            const frameSlots = Array.from({ length: 10 }).map((_, i) => frameStartIndex + i);

            return (
              <div
                key={`tf-${fIdx}`}
                className={cn("grid grid-rows-2 grid-cols-5 rounded-xl bg-white/15 border border-white/30 backdrop-blur-xs shadow-xs", framePadding, frameGap)}
              >
                {frameSlots.map((slotIndex) => {
                  const isNum1Slot = slotIndex < num1;
                  const isNum2Slot = slotIndex >= num1 && slotIndex < total;
                  const isEmptySlot = slotIndex >= total;

                  if (isEmptySlot) {
                    return (
                      <div
                        key={`slot-${slotIndex}`}
                        className={cn("rounded-md bg-white/5 border border-dashed border-white/20", slotSize)}
                      />
                    );
                  }

                  if (isNum1Slot) {
                    if (slotIndex >= cyanVisible) {
                      return (
                        <div
                          key={`slot-${slotIndex}`}
                          className={cn("rounded-md bg-white/5 border border-dashed border-white/20", slotSize)}
                        />
                      );
                    }
                    return (
                      <div
                        key={`slot-${slotIndex}`}
                        className={cn("rounded-md bg-cyan-300 border border-cyan-400 shadow-xs transition-opacity duration-200", slotSize)}
                      />
                    );
                  }

                  if (isNum2Slot) {
                    const orangeIdx = slotIndex - num1;
                    if (orangeIdx >= orangeVisible) {
                      return (
                        <div
                          key={`slot-${slotIndex}`}
                          className={cn("rounded-md bg-white/5 border border-dashed border-white/20", slotSize)}
                        />
                      );
                    }
                    return (
                      <div
                        key={`slot-${slotIndex}`}
                        className={cn("rounded-md bg-amber-300 border border-amber-200 shadow-xs transition-opacity duration-200", slotSize)}
                      />
                    );
                  }

                  return null;
                })}
              </div>
            );
          })}
        </div>

        <StepControls
          steps={[
            { step: 1, label: `1. Start (${num1})`, activeColor: "bg-cyan-300 text-cyan-950 border-cyan-200" },
            { step: 2, label: `2. Add (${num2})`, activeColor: "bg-amber-300 text-amber-950 border-amber-200" },
          ]}
          activeStep={activeStep}
          onStepClick={onStepClick}
          onReplay={onReplay}
        />
      </div>
    );
  }

  // SUBTRACTION (-)
  if (operation === '-') {
    const total = num1;
    const takenAway = num2;
    const remaining = Math.max(0, total - takenAway);
    const frameCount = Math.max(1, Math.ceil(total / 10));
    const isCompact = frameCount > 4;
    const slotSize = isCompact ? "w-3 h-3 sm:w-4 sm:h-4" : "w-3.5 h-3.5 sm:w-5 sm:h-5 [@media(max-height:640px)]:w-3 [@media(max-height:640px)]:h-3";
    const framePadding = isCompact ? "p-1 sm:p-1.5" : "p-1.5 sm:p-2";
    const frameGap = isCompact ? "gap-0.5 sm:gap-1" : "gap-1 sm:gap-1.5";

    return (
      <div className="flex flex-col items-center justify-center gap-1.5 [@media(max-height:640px)]:scale-85">
        <div className="flex flex-wrap justify-center items-center gap-1.5 p-1 sm:p-2.5 rounded-2xl bg-white/10 border border-white/20 max-w-full backdrop-blur-xs">
          {Array.from({ length: frameCount }).map((_, fIdx) => {
            const frameStartIndex = fIdx * 10;
            const frameSlots = Array.from({ length: 10 }).map((_, i) => frameStartIndex + i);

            return (
              <div
                key={`tf-${fIdx}`}
                className={cn("grid grid-rows-2 grid-cols-5 rounded-xl bg-white/15 border border-white/30 backdrop-blur-xs shadow-xs", framePadding, frameGap)}
              >
                {frameSlots.map((slotIndex) => {
                  const isFilled = slotIndex < total;
                  const isRemovedSlot = slotIndex >= remaining && slotIndex < total;

                  if (!isFilled) {
                    return (
                      <div
                        key={`slot-${slotIndex}`}
                        className={cn("rounded-md bg-white/5 border border-dashed border-white/20", slotSize)}
                      />
                    );
                  }

                  if (slotIndex >= cyanVisible) {
                    return (
                      <div
                        key={`slot-${slotIndex}`}
                        className={cn("rounded-md bg-white/5 border border-dashed border-white/20", slotSize)}
                      />
                    );
                  }

                  const subReverseIndex = (total - 1) - slotIndex;

                  if (isRemovedSlot && subReverseIndex < subtractionCount) {
                    return (
                      <div
                        key={`slot-${slotIndex}`}
                        className={cn("rounded-md bg-transparent text-amber-400 border border-dashed border-amber-400/80 shadow-xs flex items-center justify-center font-bold text-xs sm:text-sm transition-opacity duration-200", slotSize)}
                      >
                        <span>✕</span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={`slot-${slotIndex}`}
                      className={cn("rounded-md bg-cyan-300 border border-cyan-400 shadow-xs transition-opacity duration-200", slotSize)}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>

        <StepControls
          steps={[
            { step: 1, label: `1. Start (${num1})`, activeColor: "bg-cyan-300 text-cyan-950 border-cyan-200" },
            { step: 2, label: `2. Subtract (${num2})`, activeColor: "bg-amber-300 text-amber-950 border-amber-200" },
          ]}
          activeStep={activeStep}
          onStepClick={onStepClick}
          onReplay={onReplay}
        />
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
      <div className="flex flex-col items-center justify-center gap-1.5 [@media(max-height:640px)]:scale-85">
        <div className="flex flex-col justify-center items-center p-1 sm:p-1.5 rounded-2xl bg-white/10 border border-white/20 max-w-full backdrop-blur-xs">
          <div
            className="grid p-1.5 rounded-xl bg-white/15 border border-white/30 shadow-xs"
            style={{ gap: `${gapSize}px` }}
          >
            {/* Top X-Axis Header (Cyan) */}
            <div className="flex items-center" style={{ gap: `${gapSize}px` }}>
              <div className="rounded-md bg-transparent shrink-0" style={{ width: `${blockSize}px`, height: `${blockSize}px` }} />
              {Array.from({ length: xCount }).map((_, xIdx) => {
                const isVisible = xIdx < cyanVisible;
                return (
                  <div
                    key={`x-axis-${xIdx}`}
                    className={cn(
                      "rounded-md shadow-xs flex items-center justify-center font-bold leading-none shrink-0 transition-all duration-300",
                      isVisible
                        ? "bg-cyan-300 border border-cyan-400 text-cyan-950 opacity-100 scale-100"
                        : "bg-white/5 border border-dashed border-white/20 text-transparent opacity-30 scale-90"
                    )}
                    style={{ width: `${blockSize}px`, height: `${blockSize}px`, fontSize: `${fontSize}px` }}
                  >
                    {xIdx + 1}
                  </div>
                );
              })}
            </div>

            {/* Grid Rows with Y-Axis Header (Amber) */}
            {Array.from({ length: yCount }).map((_, yIdx) => {
              const rowStartIndex = yIdx * xCount;
              const isYVisible = yIdx < orangeVisible;

              return (
                <div key={`y-row-${yIdx}`} className="flex items-center" style={{ gap: `${gapSize}px` }}>
                  <div
                    className={cn(
                      "rounded-md shadow-xs flex items-center justify-center font-bold leading-none shrink-0 transition-all duration-300",
                      isYVisible
                        ? "bg-amber-300 border border-amber-200 text-amber-950 font-extrabold opacity-100 scale-100 shadow-sm"
                        : "bg-white/5 border border-dashed border-white/20 text-transparent opacity-30 scale-90"
                    )}
                    style={{ width: `${blockSize}px`, height: `${blockSize}px`, fontSize: `${fontSize}px` }}
                  >
                    {yIdx + 1}
                  </div>

                  {Array.from({ length: xCount }).map((_, xIdx) => {
                    const areaIndex = rowStartIndex + xIdx;
                    const isCellFilled = activeStep === 2 ? areaIndex < whiteCount : false;

                    if (!isCellFilled) {
                      return (
                        <div
                          key={`area-slot-${areaIndex}`}
                          className="rounded-md bg-white/5 border border-dashed border-white/20 shrink-0 transition-all duration-200"
                          style={{ width: `${blockSize}px`, height: `${blockSize}px` }}
                        />
                      );
                    }

                    return (
                      <div
                        key={`area-slot-${areaIndex}`}
                        className="rounded-md bg-white border border-white/80 shadow-xs shrink-0 transition-all duration-200 animate-fade-in"
                        style={{ width: `${blockSize}px`, height: `${blockSize}px` }}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        <StepControls
          steps={[
            { step: 1, label: `1. Setup (${num1}×${num2})`, activeColor: "bg-cyan-300 text-cyan-950 border-cyan-200" },
            { step: 2, label: "2. Math Grid", activeColor: "bg-white text-slate-900 border-white" },
          ]}
          activeStep={activeStep}
          onStepClick={onStepClick}
          onReplay={onReplay}
        />
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

    // Pre-compute layout for both states so the container is pre-sized
    // and dots animate between flat and grouped positions.
    const pad = 6; // container padding (p-1.5)
    const flatGap = 2;
    const grpInternalGap = 2;
    const grpPad = 4;
    const outerGap = 8;

    // Grouped layout dimensions
    const groupW = itemsPerGroup * blockSize + (itemsPerGroup - 1) * grpInternalGap + 2 * grpPad;
    const groupH = blockSize + 2 * grpPad;
    const innerW = maxW - 2 * pad;
    const groupsPerRow = Math.max(1, Math.floor((innerW + outerGap) / (groupW + outerGap)));
    const numRows = Math.ceil(groupCount / groupsPerRow);
    const groupsInWidestRow = Math.min(groupCount, groupsPerRow);
    const groupedGridW = groupsInWidestRow * groupW + (groupsInWidestRow - 1) * outerGap;
    const groupedGridH = numRows * groupH + (numRows - 1) * outerGap;
    const groupXOffset = Math.round((innerW - groupedGridW) / 2);

    // Flat layout dimensions
    const flatDotsPerRow = Math.max(1, Math.floor((innerW + flatGap) / (blockSize + flatGap)));
    const flatRows = Math.ceil(total / flatDotsPerRow);
    const flatGridW = Math.min(total, flatDotsPerRow) * (blockSize + flatGap) - flatGap;
    const flatGridH = flatRows * (blockSize + flatGap) - flatGap;
    const flatXOffset = Math.round((innerW - flatGridW) / 2);
    const flatYOffset = Math.round((groupedGridH - flatGridH) / 2);

    // Compute each dot's position in both layouts.
    // Flat positions are arranged in row strips that match grouped rows,
    // so dots only move horizontally (not diagonally) when separating.
    const dotPositions = Array.from({ length: total }, (_, i) => {
      // Grouped position — center each row independently
      const groupIdx = Math.floor(i / itemsPerGroup);
      const indexInGroup = i % itemsPerGroup;
      const gRow = Math.floor(groupIdx / groupsPerRow);
      const gCol = groupIdx % groupsPerRow;
      const groupsInThisRow = Math.min(groupsPerRow, groupCount - gRow * groupsPerRow);
      const thisRowW = groupsInThisRow * groupW + (groupsInThisRow - 1) * outerGap;
      const thisRowXOffset = Math.round((innerW - thisRowW) / 2);
      const gX = thisRowXOffset + gCol * (groupW + outerGap) + grpPad + indexInGroup * (blockSize + grpInternalGap);
      const gY = gRow * (groupH + outerGap) + grpPad;

      // Flat position: continuous row strips matching group rows
      const firstGroupInRow = gRow * groupsPerRow;
      const firstDotInRow = firstGroupInRow * itemsPerGroup;
      const posInRow = i - firstDotInRow;
      const dotsInThisRow = Math.min(groupsInThisRow * itemsPerGroup, total - firstDotInRow);
      const flatRowW = dotsInThisRow * (blockSize + flatGap) - flatGap;
      const flatRowXOffset = Math.round((innerW - flatRowW) / 2);
      const flatX = flatRowXOffset + posInRow * (blockSize + flatGap);
      // Vertically centered within the grouped row band
      const flatY = gRow * (groupH + outerGap) + (groupH - blockSize) / 2;

      return { flatX, flatY, groupedX: gX, groupedY: gY };
    });

    const containerH = groupedGridH + 2 * pad;

    return (
      <div className="flex flex-col items-center justify-center gap-1.5 [@media(max-height:640px)]:scale-85">
        <div
          className="rounded-2xl bg-white/10 border border-white/20 max-w-full backdrop-blur-xs relative overflow-hidden"
          style={{ height: `${containerH}px`, width: `${maxW}px` }}
        >
          {/* Group backgrounds — rendered behind dots */}
          {Array.from({ length: groupCount }).map((_, gIdx) => {
            const gRow = Math.floor(gIdx / groupsPerRow);
            const gCol = gIdx % groupsPerRow;
            const groupsInThisRow = Math.min(groupsPerRow, groupCount - gRow * groupsPerRow);
            const thisRowW = groupsInThisRow * groupW + (groupsInThisRow - 1) * outerGap;
            const thisRowXOffset = Math.round((innerW - thisRowW) / 2);
            const gX = pad + thisRowXOffset + gCol * (groupW + outerGap);
            const gY = pad + gRow * (groupH + outerGap);
            return (
              <div
                key={`div-grp-bg-${gIdx}`}
                className="absolute rounded-xl transition-all duration-500 ease-out"
                style={{
                  left: `${gX}px`,
                  top: `${gY}px`,
                  width: `${groupW}px`,
                  height: `${groupH}px`,
                  opacity: isSeparated ? 1 : 0,
                  background: isSeparated ? 'rgba(255,255,255,0.15)' : 'transparent',
                  border: isSeparated ? '1px solid rgba(255,255,255,0.3)' : '1px solid transparent',
                }}
              />
            );
          })}

          {/* Dots — animate between flat and grouped positions */}
          {dotPositions.map((pos, i) => (
            <div
              key={`div-dot-${i}`}
              className="absolute rounded-md bg-cyan-300 border border-cyan-400 shadow-xs transition-all duration-700 ease-out"
              style={{
                width: `${blockSize}px`,
                height: `${blockSize}px`,
                left: `${pad + (isSeparated ? pos.groupedX : pos.flatX)}px`,
                top: `${pad + (isSeparated ? pos.groupedY : pos.flatY)}px`,
              }}
            />
          ))}
        </div>

        <StepControls
          steps={[
            { step: 1, label: `1. Total (${num1})`, activeColor: "bg-cyan-300 text-cyan-950 border-cyan-200" },
            { step: 2, label: `2. Form Groups (${num2})`, activeColor: "bg-amber-300 text-amber-950 border-amber-200" },
          ]}
          activeStep={activeStep}
          onStepClick={onStepClick}
          onReplay={onReplay}
        />
      </div>
    );
  }

  return null;
}
