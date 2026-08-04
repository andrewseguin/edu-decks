import { MathProblem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { lcm, getRoundedRectPath } from "./visual-utils";
import { StepControls } from "./StepControls";

type FractionVisualizerProps = {
  problem: MathProblem;
  activeStep: number;
  cyanVisible: number;
  orangeVisible: number;
  subtractionCount: number;
  whiteCount: number;
  onStepClick: (step: number) => void;
  onReplay: () => void;
};

export function FractionVisualizer({
  problem,
  activeStep,
  cyanVisible,
  orangeVisible,
  subtractionCount,
  whiteCount,
  onStepClick,
  onReplay,
}: FractionVisualizerProps) {
  if (!problem.isFraction || !problem.frac1 || !problem.frac2) return null;

  const { operation } = problem;
  const f1 = problem.frac1;
  const f2 = problem.frac2;
  const ans = problem.fracAnswer;

  // Common denominator for unified pie visualization (lcm of f1.d and f2.d)
  const commonD = lcm(f1.d, f2.d);
  const c1 = f1.n * (commonD / f1.d);
  const c2 = f2.n * (commonD / f2.d);

  // FRACTION ADDITION (+): Cyan pie slices fill first, then Orange pie slices fill in right beside them!
  if (operation === '+') {
    const totalFilled = c1 + c2;
    const pieCount = Math.max(1, Math.ceil(totalFilled / commonD));

    return (
      <div className="flex flex-col items-center justify-center gap-1.5">
        <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 max-w-full">
          {Array.from({ length: pieCount }).map((_, pIdx) => {
            const pieStartSlot = pIdx * commonD;

            return (
              <div key={`pie-${pIdx}`} className="flex flex-col items-center justify-center">
                <svg width={130} height={130} viewBox="0 0 130 130" className="drop-shadow-md">
                  {Array.from({ length: commonD }).map((_, i) => {
                    const globalSlotIndex = pieStartSlot + i;
                    const isCyanSlot = globalSlotIndex < c1;
                    const isOrangeSlot = globalSlotIndex >= c1 && globalSlotIndex < c1 + c2;

                    const startAngle = (i * 360) / commonD - 90;
                    const endAngle = ((i + 1) * 360) / commonD - 90;

                    const radius = 58;
                    const center = 65;

                    const startRad = (startAngle * Math.PI) / 180;
                    const endRad = (endAngle * Math.PI) / 180;

                    const x1 = center + radius * Math.cos(startRad);
                    const y1 = center + radius * Math.sin(startRad);
                    const x2 = center + radius * Math.cos(endRad);
                    const y2 = center + radius * Math.sin(endRad);

                    const largeArc = 360 / commonD > 180 ? 1 : 0;
                    const pathData =
                      commonD === 1
                        ? `M ${center - radius}, ${center} a ${radius},${radius} 0 1,0 ${radius * 2},0 a ${radius},${radius} 0 1,0 -${radius * 2},0`
                        : `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

                    if (isCyanSlot) {
                      const isVisible = globalSlotIndex < cyanVisible;
                      return (
                        <path
                          key={`slice-${i}`}
                          d={pathData}
                          className={cn(
                            "transition-all duration-300",
                            isVisible
                              ? "fill-cyan-300 stroke-cyan-400 stroke-2"
                              : "fill-white/10 stroke-white/30 stroke-1 stroke-dashed"
                          )}
                        />
                      );
                    }

                    if (isOrangeSlot) {
                      const orangeSlotIdx = globalSlotIndex - c1;
                      const isVisible = orangeSlotIdx < orangeVisible;
                      return (
                        <path
                          key={`slice-${i}`}
                          d={pathData}
                          className={cn(
                            "transition-all duration-300",
                            isVisible
                              ? "fill-amber-400 stroke-amber-500 stroke-2"
                              : "fill-white/10 stroke-white/30 stroke-1 stroke-dashed"
                          )}
                        />
                      );
                    }

                    return (
                      <path
                        key={`slice-${i}`}
                        d={pathData}
                        className="fill-white/10 stroke-white/30 stroke-1 stroke-dashed"
                      />
                    );
                  })}
                </svg>
              </div>
            );
          })}
        </div>

        <StepControls
          steps={[
            { step: 1, label: `1. Start (${f1.d === 1 ? f1.n : `${f1.n}/${f1.d}`})`, activeColor: "bg-cyan-300 text-cyan-950 border-cyan-200" },
            { step: 2, label: `2. Add (${f2.d === 1 ? f2.n : `${f2.n}/${f2.d}`})`, activeColor: "bg-amber-300 text-amber-950 border-amber-200" },
          ]}
          activeStep={activeStep}
          onStepClick={onStepClick}
          onReplay={onReplay}
        />
      </div>
    );
  }

  // FRACTION SUBTRACTION (-): Cyan pie slices fill first, then Orange ✕ take-away badges animate!
  if (operation === '-') {
    const pieCount = Math.max(1, Math.ceil(c1 / commonD));
    const remaining = Math.max(0, c1 - c2);

    return (
      <div className="flex flex-col items-center justify-center gap-1.5">
        <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 max-w-full">
          {Array.from({ length: pieCount }).map((_, pIdx) => {
            const pieStartSlot = pIdx * commonD;

            return (
              <div key={`pie-${pIdx}`} className="flex flex-col items-center justify-center">
                <svg width={130} height={130} viewBox="0 0 130 130" className="drop-shadow-md">
                  {Array.from({ length: commonD }).map((_, i) => {
                    const globalSlotIndex = pieStartSlot + i;
                    const isCyanSlot = globalSlotIndex < c1;
                    const isRemovedSlot = globalSlotIndex >= remaining && globalSlotIndex < c1;

                    const startAngle = (i * 360) / commonD - 90;
                    const endAngle = ((i + 1) * 360) / commonD - 90;

                    const radius = 58;
                    const center = 65;

                    const startRad = (startAngle * Math.PI) / 180;
                    const endRad = (endAngle * Math.PI) / 180;

                    const x1 = center + radius * Math.cos(startRad);
                    const y1 = center + radius * Math.sin(startRad);
                    const x2 = center + radius * Math.cos(endRad);
                    const y2 = center + radius * Math.sin(endRad);

                    const largeArc = 360 / commonD > 180 ? 1 : 0;
                    const pathData =
                      commonD === 1
                        ? `M ${center - radius}, ${center} a ${radius},${radius} 0 1,0 ${radius * 2},0 a ${radius},${radius} 0 1,0 -${radius * 2},0`
                        : `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

                    if (!isCyanSlot) {
                      return (
                        <path
                          key={`slice-${i}`}
                          d={pathData}
                          className="fill-white/10 stroke-white/30 stroke-1 stroke-dashed"
                        />
                      );
                    }

                    if (globalSlotIndex >= cyanVisible) {
                      return (
                        <path
                          key={`slice-${i}`}
                          d={pathData}
                          className="fill-white/10 stroke-white/30 stroke-1 stroke-dashed"
                        />
                      );
                    }

                    const subReverseIndex = (c1 - 1) - globalSlotIndex;

                    if (isRemovedSlot && subReverseIndex < subtractionCount) {
                      return (
                        <g key={`slice-g-${i}`}>
                          <path
                            d={pathData}
                            className="fill-amber-500/20 stroke-amber-400 stroke-2 stroke-dashed transition-all duration-300"
                          />
                        </g>
                      );
                    }

                    return (
                      <path
                        key={`slice-${i}`}
                        d={pathData}
                        className="fill-cyan-300 stroke-cyan-400 stroke-2 transition-all duration-300"
                      />
                    );
                  })}
                </svg>
              </div>
            );
          })}
        </div>

        <StepControls
          steps={[
            { step: 1, label: `1. Start (${f1.d === 1 ? f1.n : `${f1.n}/${f1.d}`})`, activeColor: "bg-cyan-300 text-cyan-950 border-cyan-200" },
            { step: 2, label: `2. Subtract (${f2.d === 1 ? f2.n : `${f2.n}/${f2.d}`})`, activeColor: "bg-amber-300 text-amber-950 border-amber-200" },
          ]}
          activeStep={activeStep}
          onStepClick={onStepClick}
          onReplay={onReplay}
        />
      </div>
    );
  }

  // FRACTION MULTIPLICATION (×): 3-Step Incremental Sequence
  if (operation === '×') {
    const cols = f1.d;
    const cyanCols = f1.n;
    const rows = f2.d;
    const orangeRows = f2.n;

    const isSubdivided = orangeVisible > 0;

    const pad = 8;
    const gap = isSubdivided ? 4 : 0;
    const gridW = 160;
    const gridH = 120;

    const svgW = gridW + pad * 2;
    const svgH = gridH + pad * 2;

    const cellW = (gridW - (cols - 1) * gap) / cols;
    const cellH = (gridH - (rows - 1) * gap) / rows;

    return (
      <div className="flex flex-col items-center justify-center gap-1.5">
        <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} className="drop-shadow-md overflow-visible">
          {/* Outer Backdrop */}
          <rect
            x={1}
            y={1}
            width={svgW - 2}
            height={svgH - 2}
            rx={14}
            className="fill-white/5 stroke-white/30 stroke-2"
          />

          {/* Grid Cells */}
          {Array.from({ length: cols }).map((_, c) => {
            const isCyanCol = c < cyanCols;

            return Array.from({ length: rows }).map((_, r) => {
              const isOrangeRow = isSubdivided && r < orangeRows;
              const isOverlap = isCyanCol && isOrangeRow;

              const overlapIdx = r * cyanCols + c;
              const isWhite = isSubdivided && isOverlap && overlapIdx < whiteCount;

              const x = pad + c * (cellW + gap);
              const y = pad + r * (cellH + gap);

              let fillClass = "fill-transparent";
              let strokeClass = "stroke-white/20";

              if (isCyanCol) {
                fillClass = isWhite ? "fill-white" : "fill-cyan-300";
                strokeClass = isWhite ? "stroke-white/90 shadow-sm" : "stroke-cyan-400";
              }

              const tlRadius = isSubdivided ? 6 : (c === 0 && r === 0 ? 6 : 0);
              const trRadius = isSubdivided ? 6 : (c === cols - 1 && r === 0 ? 6 : 0);
              const brRadius = isSubdivided ? 6 : (c === cols - 1 && r === rows - 1 ? 6 : 0);
              const blRadius = isSubdivided ? 6 : (c === 0 && r === rows - 1 ? 6 : 0);

              const cellPath = getRoundedRectPath(x, y, cellW, cellH, tlRadius, trRadius, brRadius, blRadius);

              return (
                <path
                  key={`cell-${c}-${r}`}
                  d={cellPath}
                  className={cn(
                    "transition-all duration-500 ease-out",
                    fillClass,
                    strokeClass
                  )}
                />
              );
            });
          })}

          {/* Step 2: Bold Glowing Orange Horizontal Cut Lines */}
          {Array.from({ length: rows - 1 }).map((_, rIdx) => {
            const lineY = isSubdivided
              ? pad + (rIdx + 1) * cellH + rIdx * gap + gap / 2
              : pad + (rIdx + 1) * (gridH / rows);

            return (
              <line
                key={`h-line-${rIdx}`}
                x1={pad - 3}
                y1={lineY}
                x2={svgW - pad + 3}
                y2={lineY}
                stroke="#fbbf24"
                strokeWidth={3.5}
                strokeDasharray="8 4"
                strokeLinecap="round"
                className="transition-opacity duration-700 ease-out drop-shadow-sm"
                style={{ opacity: isSubdivided ? 1 : 0 }}
              />
            );
          })}
        </svg>

        <StepControls
          steps={[
            { step: 1, label: `1. Start (${f1.n}/${f1.d})`, activeColor: "bg-cyan-300 text-cyan-950 border-cyan-200" },
            { step: 2, label: `2. Grid Cut (${f2.n}/${f2.d})`, activeColor: "bg-amber-300 text-amber-950 border-amber-200" },
            { step: 3, label: `3. Answer (${ans ? (ans.d === 1 ? ans.n : `${ans.n}/${ans.d}`) : ''})`, activeColor: "bg-white text-slate-900 border-white" },
          ]}
          activeStep={activeStep}
          onStepClick={onStepClick}
          onReplay={onReplay}
        />
      </div>
    );
  }

  // FRACTION DIVISION (÷): Dual Bracket Common Grid Model
  if (operation === '÷') {
    const isDivisorVisible = orangeVisible > 0;

    const D = commonD;
    const totalBoxes = Math.max(D, c1, c2);

    const maxW = 270;
    const gap = 4;
    const pad = 10;
    const gridW = maxW - pad * 2;
    const boxW = Math.min(34, Math.max(14, Math.floor((gridW - (totalBoxes - 1) * gap) / totalBoxes)));
    const boxH = 32;

    const gridY = pad + 20;
    const svgW = totalBoxes * boxW + (totalBoxes - 1) * gap + pad * 2;
    const svgH = gridY + boxH + (isDivisorVisible ? 24 : 6) + pad;

    const cyanW = c1 * boxW + (c1 - 1) * gap;
    const amberW = c2 * boxW + (c2 - 1) * gap;

    return (
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="flex flex-col items-center justify-center gap-1">
          <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} className="drop-shadow-md overflow-visible">
            {/* Outer Container Frame */}
            <rect
              x={1}
              y={1}
              width={svgW - 2}
              height={svgH - 2}
              rx={14}
              className="fill-white/5 stroke-white/25 stroke-2"
            />

            {/* Top Cyan Bracket (Dividend) */}
            <g className="animate-fade-in">
              <path
                d={`M ${pad} ${gridY - 4} L ${pad} ${gridY - 12} L ${pad + cyanW} ${gridY - 12} L ${pad + cyanW} ${gridY - 4}`}
                className="fill-none stroke-cyan-300 stroke-2"
              />
              <rect
                x={pad + cyanW / 2 - 36}
                y={gridY - 20}
                width={72}
                height={15}
                rx={7.5}
                className="fill-cyan-400 stroke-cyan-300 stroke-1"
              />
              <text
                x={pad + cyanW / 2}
                y={gridY - 9}
                textAnchor="middle"
                className="font-headline font-extrabold text-[10px] fill-cyan-950 select-none pointer-events-none"
              >
                {f1.d === 1 ? f1.n : `${f1.n}/${f1.d}`} = {c1} box{c1 > 1 ? 'es' : ''}
              </text>
            </g>

            {/* Grid Boxes */}
            {Array.from({ length: totalBoxes }).map((_, i) => {
              const x = pad + i * (boxW + gap);

              const isCyanSlot = i < c1 && i < cyanVisible;
              const isAmberSlot = isDivisorVisible && i < c2;

              let fillStyle = "fill-white/5 stroke-white/20 stroke-1 stroke-dashed";
              if (isCyanSlot) {
                fillStyle = "fill-cyan-300 stroke-cyan-400 stroke-2";
              }

              return (
                <g key={`grid-box-${i}`} className="transition-all duration-500">
                  <rect
                    x={x}
                    y={gridY}
                    width={boxW}
                    height={boxH}
                    rx={6}
                    className={cn("transition-all duration-500 ease-out", fillStyle)}
                  />

                  {/* Step 2 Amber highlight line inside box */}
                  {isAmberSlot && (
                    <line
                      x1={x + 3}
                      y1={gridY + boxH - 3}
                      x2={x + boxW - 3}
                      y2={gridY + boxH - 3}
                      className="stroke-amber-400 stroke-[3px] stroke-linecap-round animate-fade-in"
                    />
                  )}
                </g>
              );
            })}

            {/* Bottom Amber Bracket (Divisor) */}
            {isDivisorVisible && (
              <g className="animate-fade-in transition-all duration-500">
                <path
                  d={`M ${pad} ${gridY + boxH + 4} L ${pad} ${gridY + boxH + 12} L ${pad + amberW} ${gridY + boxH + 12} L ${pad + amberW} ${gridY + boxH + 4}`}
                  className="fill-none stroke-amber-400 stroke-2 stroke-dashed"
                />
                <rect
                  x={pad + amberW / 2 - 36}
                  y={gridY + boxH + 6}
                  width={72}
                  height={15}
                  rx={7.5}
                  className="fill-amber-400 stroke-amber-300 stroke-1"
                />
                <text
                  x={pad + amberW / 2}
                  y={gridY + boxH + 17}
                  textAnchor="middle"
                  className="font-headline font-extrabold text-[10px] fill-amber-950 select-none pointer-events-none"
                >
                  {f2.d === 1 ? f2.n : `${f2.n}/${f2.d}`} = {c2} box{c2 > 1 ? 'es' : ''}
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Explanation Badge */}
        {isDivisorVisible ? (
          <div className="bg-amber-400/20 border border-amber-400/40 px-3 py-1 rounded-full text-xs font-headline font-bold text-amber-200 shadow-xs animate-fade-in">
            <span>
              {c1} Cyan boxes ÷ {c2} Amber boxes = <strong className="text-white font-extrabold">{ans ? (ans.d === 1 ? ans.n : `${ans.n}/${ans.d}`) : ''}</strong>
            </span>
          </div>
        ) : (
          <div className="bg-cyan-400/20 border border-cyan-400/40 px-3 py-1 rounded-full text-xs font-headline font-bold text-cyan-200 shadow-xs animate-fade-in">
            <span>Shaded <strong className="text-white font-extrabold">{f1.d === 1 ? f1.n : `${f1.n}/${f1.d}`}</strong> ({c1} boxes) in Cyan</span>
          </div>
        )}

        <StepControls
          steps={[
            { step: 1, label: `1. Start (${f1.d === 1 ? f1.n : `${f1.n}/${f1.d}`})`, activeColor: "bg-cyan-300 text-cyan-950 border-cyan-200" },
            { step: 2, label: `2. Compare (${f2.d === 1 ? f2.n : `${f2.n}/${f2.d}`})`, activeColor: "bg-amber-300 text-amber-950 border-amber-200" },
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
