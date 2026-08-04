"use client";

import { useState, useEffect, useRef } from "react";
import { MathProblem, Fraction } from "@/lib/types";
import { cn } from "@/lib/utils";
import { RotateCcw } from "lucide-react";

type VisualMathProps = {
  problem: MathProblem;
  isFlipped?: boolean;
};

// Greatest Common Divisor helper
function gcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcd(b, a % b);
}

// Helper: Least Common Multiple
function lcm(a: number, b: number): number {
  return (a * b) / gcd(a, b);
}

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

// Helper to construct SVG path data for rectangles with individual corner radii (uniform path structure for CSS d attribute transitions)
function getRoundedRectPath(
  x: number,
  y: number,
  w: number,
  h: number,
  tl: number,
  tr: number,
  br: number,
  bl: number
): string {
  const maxR = Math.min(w / 2, h / 2);
  const rTL = Math.max(0, Math.min(tl, maxR));
  const rTR = Math.max(0, Math.min(tr, maxR));
  const rBR = Math.max(0, Math.min(br, maxR));
  const rBL = Math.max(0, Math.min(bl, maxR));

  const safeTL = rTL === 0 ? 0.001 : rTL;
  const safeTR = rTR === 0 ? 0.001 : rTR;
  const safeBR = rBR === 0 ? 0.001 : rBR;
  const safeBL = rBL === 0 ? 0.001 : rBL;

  return [
    `M ${x + safeTL} ${y}`,
    `L ${x + w - safeTR} ${y}`,
    `A ${safeTR} ${safeTR} 0 0 1 ${x + w} ${y + safeTR}`,
    `L ${x + w} ${y + h - safeBR}`,
    `A ${safeBR} ${safeBR} 0 0 1 ${x + w - safeBR} ${y + h}`,
    `L ${x + safeBL} ${y + h}`,
    `A ${safeBL} ${safeBL} 0 0 1 ${x} ${y + h - safeBL}`,
    `L ${x} ${y + safeTL}`,
    `A ${safeTL} ${safeTL} 0 0 1 ${x + safeTL} ${y}`,
    'Z',
  ].join(' ');
}

type StepConfig = {
  step: number;
  label: string;
  activeColor: string;
};

function StepControls({
  steps,
  activeStep,
  onStepClick,
  onReplay,
}: {
  steps: StepConfig[];
  activeStep: number;
  onStepClick: (step: number) => void;
  onReplay: () => void;
}) {
  return (
    <div className="flex items-center gap-1 sm:gap-1.5 mt-2 bg-black/30 backdrop-blur-md px-2.5 sm:px-3 py-1 rounded-full border border-white/20 shadow-sm pointer-events-auto z-30 select-none animate-fade-in">
      {steps.map((s) => (
        <button
          key={`step-btn-${s.step}`}
          type="button"
          onClick={() => onStepClick(s.step)}
          className={cn(
            "px-2 sm:px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-headline font-bold transition-colors duration-300 cursor-pointer border",
            activeStep === s.step
              ? s.activeColor
              : "bg-transparent text-white/70 border-transparent hover:text-white hover:bg-white/15"
          )}
        >
          {s.label}
        </button>
      ))}
      <div className="w-px h-3 bg-white/25 mx-0.5" />
      <button
        type="button"
        onClick={onReplay}
        title="Replay animation"
        className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/20 transition-transform active:scale-95 cursor-pointer"
      >
        <RotateCcw className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
      </button>
    </div>
  );
}

export function VisualMath({ problem, isFlipped = true }: VisualMathProps) {
  const { num1, num2, operation, answer } = problem;
  const [cyanVisible, setCyanVisible] = useState(0);
  const [orangeVisible, setOrangeVisible] = useState(0);
  const [subtractionCount, setSubtractionCount] = useState(0);
  const [whiteCount, setWhiteCount] = useState(0);
  const [activeStep, setActiveStep] = useState(1);
  const [replayKey, setReplayKey] = useState(0);

  const stepTimersRef = useRef<{
    t1?: ReturnType<typeof setTimeout>;
    t2?: ReturnType<typeof setTimeout>;
    i1?: ReturnType<typeof setInterval>;
    i2?: ReturnType<typeof setInterval>;
  }>({});

  const clearStepTimers = () => {
    if (stepTimersRef.current.t1) clearTimeout(stepTimersRef.current.t1);
    if (stepTimersRef.current.t2) clearTimeout(stepTimersRef.current.t2);
    if (stepTimersRef.current.i1) clearInterval(stepTimersRef.current.i1);
    if (stepTimersRef.current.i2) clearInterval(stepTimersRef.current.i2);
    stepTimersRef.current = {};
  };

  const replayAnimation = () => {
    clearStepTimers();
    setReplayKey((k) => k + 1);
  };

  const handleStepClick = (targetStep: number) => {
    const isForward = targetStep > activeStep;
    clearStepTimers();
    setActiveStep(targetStep);

    if (problem.isFraction && problem.frac1 && problem.frac2) {
      const f1 = problem.frac1;
      const f2 = problem.frac2;
      const commonD = lcm(f1.d, f2.d);
      const c1 = f1.n * (commonD / f1.d);
      const c2 = f2.n * (commonD / f2.d);

      if (operation === '×') {
        if (targetStep === 1) {
          setCyanVisible(f1.n);
          setOrangeVisible(0);
          setWhiteCount(0);
        } else if (targetStep === 2) {
          setCyanVisible(f1.n);
          setOrangeVisible(1);
          setWhiteCount(0);
        } else if (targetStep === 3) {
          setCyanVisible(f1.n);
          setOrangeVisible(1);
          if (isForward) {
            let currentWhite = 0;
            const totalCells = f1.n * f2.n;
            stepTimersRef.current.i1 = setInterval(() => {
              currentWhite++;
              setWhiteCount(currentWhite);
              if (currentWhite >= totalCells) clearStepTimers();
            }, 200);
          } else {
            setWhiteCount(f1.n * f2.n);
          }
        }
      } else if (operation === '+') {
        setCyanVisible(c1);
        if (targetStep === 1) {
          setOrangeVisible(0);
        } else {
          if (isForward) {
            let currentOrange = 0;
            stepTimersRef.current.i1 = setInterval(() => {
              currentOrange++;
              setOrangeVisible(currentOrange);
              if (currentOrange >= c2) clearStepTimers();
            }, 100);
          } else {
            setOrangeVisible(c2);
          }
        }
      } else if (operation === '-') {
        setCyanVisible(c1);
        if (targetStep === 1) {
          setSubtractionCount(0);
        } else {
          if (isForward) {
            let currentSub = 0;
            stepTimersRef.current.i1 = setInterval(() => {
              currentSub++;
              setSubtractionCount(currentSub);
              if (currentSub >= c2) clearStepTimers();
            }, 140);
          } else {
            setSubtractionCount(c2);
          }
        }
      } else if (operation === '÷') {
        setCyanVisible(c1);
        setOrangeVisible(targetStep === 1 ? 0 : c2);
      }
    } else {
      if (operation === '+') {
        setCyanVisible(num1);
        if (targetStep === 1) {
          setOrangeVisible(0);
        } else {
          if (isForward) {
            let currentOrange = 0;
            stepTimersRef.current.i1 = setInterval(() => {
              currentOrange++;
              setOrangeVisible(currentOrange);
              if (currentOrange >= num2) clearStepTimers();
            }, 100);
          } else {
            setOrangeVisible(num2);
          }
        }
      } else if (operation === '-') {
        setCyanVisible(num1);
        if (targetStep === 1) {
          setSubtractionCount(0);
        } else {
          if (isForward) {
            let currentSub = 0;
            stepTimersRef.current.i1 = setInterval(() => {
              currentSub++;
              setSubtractionCount(currentSub);
              if (currentSub >= num2) clearStepTimers();
            }, 140);
          } else {
            setSubtractionCount(num2);
          }
        }
      } else if (operation === '×') {
        setCyanVisible(num1);
        setOrangeVisible(num2);
        if (targetStep === 1) {
          setWhiteCount(0);
        } else {
          if (isForward) {
            let currentWhite = 0;
            const totalCells = num1 * num2;
            const speed = totalCells > 30 ? 25 : 55;
            stepTimersRef.current.i1 = setInterval(() => {
              currentWhite++;
              setWhiteCount(currentWhite);
              if (currentWhite >= totalCells) clearStepTimers();
            }, speed);
          } else {
            setWhiteCount(num1 * num2);
          }
        }
      } else if (operation === '÷') {
        setCyanVisible(num1);
        setOrangeVisible(targetStep === 1 ? 0 : 1);
      }
    }
  };

  useEffect(() => {
    clearStepTimers();

    // Reset state for new problem
    if (problem.isFraction && problem.frac1) {
      setCyanVisible(problem.frac1.n);
    } else {
      setCyanVisible(operation === '×' ? 0 : num1);
    }
    setOrangeVisible(0);
    setSubtractionCount(0);
    setWhiteCount(0);
    setActiveStep(1);

    if (!isFlipped) {
      return () => {
        clearStepTimers();
      };
    }

    if (problem.isFraction && problem.frac1 && problem.frac2) {
      const f1 = problem.frac1;
      const f2 = problem.frac2;
      const commonD = lcm(f1.d, f2.d);
      const c1 = f1.n * (commonD / f1.d);
      const c2 = f2.n * (commonD / f2.d);

      if (operation === '+') {
        let currentCyan = 0;
        stepTimersRef.current.i1 = setInterval(() => {
          currentCyan++;
          setCyanVisible(currentCyan);
          if (currentCyan >= c1) {
            if (stepTimersRef.current.i1) clearInterval(stepTimersRef.current.i1);

            stepTimersRef.current.t1 = setTimeout(() => {
              setActiveStep(2);
              let currentOrange = 0;
              stepTimersRef.current.i2 = setInterval(() => {
                currentOrange++;
                setOrangeVisible(currentOrange);
                if (currentOrange >= c2) {
                  if (stepTimersRef.current.i2) clearInterval(stepTimersRef.current.i2);
                }
              }, 110);
            }, 400);
          }
        }, 90);
      } else if (operation === '-') {
        let currentCyan = 0;
        stepTimersRef.current.i1 = setInterval(() => {
          currentCyan++;
          setCyanVisible(currentCyan);
          if (currentCyan >= c1) {
            if (stepTimersRef.current.i1) clearInterval(stepTimersRef.current.i1);

            stepTimersRef.current.t1 = setTimeout(() => {
              setActiveStep(2);
              let currentSub = 0;
              stepTimersRef.current.i2 = setInterval(() => {
                currentSub++;
                setSubtractionCount(currentSub);
                if (currentSub >= c2) {
                  if (stepTimersRef.current.i2) clearInterval(stepTimersRef.current.i2);
                }
              }, 150);
            }, 650);
          }
        }, 90);
      } else if (operation === '×') {
        setActiveStep(1);
        setCyanVisible(f1.n);
        setOrangeVisible(0);
        setWhiteCount(0);

        // Step 2: Orange Cut Line & Separation at t=900ms
        stepTimersRef.current.t1 = setTimeout(() => {
          setActiveStep(2);
          setOrangeVisible(1);

          // Step 3: Incremental White fill starting at t=1900ms
          const totalOverlapCells = f1.n * f2.n;
          let currentWhite = 0;

          stepTimersRef.current.t2 = setTimeout(() => {
            setActiveStep(3);
            stepTimersRef.current.i1 = setInterval(() => {
              currentWhite++;
              setWhiteCount(currentWhite);
              if (currentWhite >= totalOverlapCells && stepTimersRef.current.i1) {
                clearInterval(stepTimersRef.current.i1);
              }
            }, 240);
          }, 1000);
        }, 900);
      } else if (operation === '÷') {
        setActiveStep(1);
        setCyanVisible(c1);
        setOrangeVisible(0);

        stepTimersRef.current.t1 = setTimeout(() => {
          setActiveStep(2);
          setOrangeVisible(c2);
        }, 900);
      }
    } else {
      if (operation === '+') {
        let currentCyan = 0;
        stepTimersRef.current.i1 = setInterval(() => {
          currentCyan++;
          setCyanVisible(currentCyan);
          if (currentCyan >= num1) {
            if (stepTimersRef.current.i1) clearInterval(stepTimersRef.current.i1);

            stepTimersRef.current.t1 = setTimeout(() => {
              setActiveStep(2);
              let currentOrange = 0;
              stepTimersRef.current.i2 = setInterval(() => {
                currentOrange++;
                setOrangeVisible(currentOrange);
                if (currentOrange >= num2) {
                  if (stepTimersRef.current.i2) clearInterval(stepTimersRef.current.i2);
                }
              }, 110);
            }, 400);
          }
        }, 90);
      } else if (operation === '-') {
        let currentCyan = 0;
        stepTimersRef.current.i1 = setInterval(() => {
          currentCyan++;
          setCyanVisible(currentCyan);
          if (currentCyan >= num1) {
            if (stepTimersRef.current.i1) clearInterval(stepTimersRef.current.i1);

            stepTimersRef.current.t1 = setTimeout(() => {
              setActiveStep(2);
              let currentSub = 0;
              stepTimersRef.current.i2 = setInterval(() => {
                currentSub++;
                setSubtractionCount(currentSub);
                if (currentSub >= num2) {
                  if (stepTimersRef.current.i2) clearInterval(stepTimersRef.current.i2);
                }
              }, 150);
            }, 650);
          }
        }, 90);
      } else if (operation === '×') {
        setActiveStep(1);
        setCyanVisible(0);
        setOrangeVisible(0);
        setWhiteCount(0);

        // Step 1a: Increment X-axis Cyan Headers
        let currentX = 0;
        stepTimersRef.current.i1 = setInterval(() => {
          currentX++;
          setCyanVisible(currentX);
          if (currentX >= num1) {
            if (stepTimersRef.current.i1) clearInterval(stepTimersRef.current.i1);

            // Step 1b: Increment Y-axis Amber Headers
            stepTimersRef.current.t1 = setTimeout(() => {
              let currentY = 0;
              stepTimersRef.current.i2 = setInterval(() => {
                currentY++;
                setOrangeVisible(currentY);
                if (currentY >= num2) {
                  if (stepTimersRef.current.i2) clearInterval(stepTimersRef.current.i2);

                  // Step 2: Fill interior White Grid Cells
                  stepTimersRef.current.t2 = setTimeout(() => {
                    setActiveStep(2);
                    let currentWhite = 0;
                    const totalCells = num1 * num2;
                    const speed = totalCells > 30 ? 25 : 55;

                    stepTimersRef.current.i1 = setInterval(() => {
                      currentWhite++;
                      setWhiteCount(currentWhite);
                      if (currentWhite >= totalCells) {
                        if (stepTimersRef.current.i1) clearInterval(stepTimersRef.current.i1);
                      }
                    }, speed);
                  }, 400);
                }
              }, 80);
            }, 150);
          }
        }, 80);
      } else if (operation === '÷') {
        setCyanVisible(num1);
        stepTimersRef.current.t1 = setTimeout(() => {
          setActiveStep(2);
          setOrangeVisible(1);
        }, 550);
      }
    }

    return () => {
      clearStepTimers();
    };
  }, [problem.id, isFlipped, replayKey, num1, num2, operation, problem.isFraction]);

  // Fraction Visualizer Component with 2-Step Addition, Subtraction & Multiplication
  if (problem.isFraction && problem.frac1 && problem.frac2) {
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
              { step: 2, label: `2. Add (${f2.d === 1 ? f2.n : `${f2.n}/${f2.d}`})`, activeColor: "bg-amber-400 text-amber-950 border-amber-300" },
            ]}
            activeStep={activeStep}
            onStepClick={handleStepClick}
            onReplay={replayAnimation}
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
              { step: 2, label: `2. Subtract (${f2.d === 1 ? f2.n : `${f2.n}/${f2.d}`})`, activeColor: "bg-amber-400 text-amber-950 border-amber-300" },
            ]}
            activeStep={activeStep}
            onStepClick={handleStepClick}
            onReplay={replayAnimation}
          />
        </div>
      );
    }

    // FRACTION MULTIPLICATION (×): 3-Step Incremental Sequence (Step 1: Cyan bars -> Step 2: Orange Cut Line & Separation -> Step 3: Incremental White Fill)
    if (operation === '×') {
      const cols = f1.d; // d1 vertical columns
      const cyanCols = f1.n; // n1 Cyan columns
      const rows = f2.d; // d2 horizontal rows
      const orangeRows = f2.n; // n2 Orange rows

      const isSubdivided = orangeVisible > 0;

      const pad = 8;
      const gap = isSubdivided ? 4 : 0;
      const gridW = 160;
      const gridH = 120;

      const svgW = gridW + pad * 2;
      const svgH = gridH + pad * 2;

      const cellW = (gridW - (cols - 1) * gap) / cols;
      const cellH = (gridH - (rows - 1) * gap) / rows;
      const cornerRadius = 6;

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

            {/* Grid Cells: Step 1 (Cyan bars) -> Step 2 (Separated Cyan sub-cards) -> Step 3 (Incremental White fill) */}
            {Array.from({ length: cols }).map((_, c) => {
              const isCyanCol = c < cyanCols;

              return Array.from({ length: rows }).map((_, r) => {
                const isOrangeRow = isSubdivided && r < orangeRows;
                const isOverlap = isCyanCol && isOrangeRow;

                // Step 3 incremental white indexing (row by row left to right)
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

            {/* Step 2: Bold Glowing Orange Horizontal Cut Lines (2nd fraction multiplier) */}
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
              { step: 2, label: `2. Grid Cut (${f2.n}/${f2.d})`, activeColor: "bg-amber-400 text-amber-950 border-amber-300" },
              { step: 3, label: `3. Answer (${ans ? (ans.d === 1 ? ans.n : `${ans.n}/${ans.d}`) : ''})`, activeColor: "bg-white text-slate-900 border-white" },
            ]}
            activeStep={activeStep}
            onStepClick={handleStepClick}
            onReplay={replayAnimation}
          />
        </div>
      );
    }

    // FRACTION DIVISION (÷): Dual Bracket Common Grid Model ("Compare Quantities on Common Grid")
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

      // Cyan bracket width (Dividend = c1 boxes)
      const cyanW = c1 * boxW + (c1 - 1) * gap;
      // Amber bracket width (Divisor = c2 boxes)
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

              {/* Grid Boxes (Representing 1 Whole) */}
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

              {/* Bottom Amber Bracket (Divisor - Step 2) */}
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
              { step: 2, label: `2. Compare (${f2.d === 1 ? f2.n : `${f2.n}/${f2.d}`})`, activeColor: "bg-amber-400 text-amber-950 border-amber-300" },
            ]}
            activeStep={activeStep}
            onStepClick={handleStepClick}
            onReplay={replayAnimation}
          />
        </div>
      );
    }
  }

  // Don't render visual frames if numbers are extremely huge (> 144 for mult/div, > 100 for add/sub)
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
    const slotSize = isCompact ? "w-3 h-3 sm:w-4 sm:h-4" : "w-4 h-4 sm:w-5 sm:h-5";
    const framePadding = isCompact ? "p-1 sm:p-1.5" : "p-2";
    const frameGap = isCompact ? "gap-1" : "gap-1.5";

    return (
      <div className="flex flex-col items-center justify-center gap-1.5">
        <div className="flex flex-wrap justify-center items-center gap-1.5 p-1.5 sm:p-2.5 rounded-2xl bg-white/10 border border-white/20 max-w-full backdrop-blur-xs">
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
                        className={cn("rounded-md bg-amber-400 border border-amber-500 shadow-xs transition-opacity duration-200", slotSize)}
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
            { step: 2, label: `2. Add (${num2})`, activeColor: "bg-amber-400 text-amber-950 border-amber-300" },
          ]}
          activeStep={activeStep}
          onStepClick={handleStepClick}
          onReplay={replayAnimation}
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
    const slotSize = isCompact ? "w-3 h-3 sm:w-4 sm:h-4" : "w-4 h-4 sm:w-5 sm:h-5";
    const framePadding = isCompact ? "p-1 sm:p-1.5" : "p-2";
    const frameGap = isCompact ? "gap-1" : "gap-1.5";

    return (
      <div className="flex flex-col items-center justify-center gap-1.5">
        <div className="flex flex-wrap justify-center items-center gap-1.5 p-1.5 sm:p-2.5 rounded-2xl bg-white/10 border border-white/20 max-w-full backdrop-blur-xs">
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
            { step: 2, label: `2. Subtract (${num2})`, activeColor: "bg-amber-400 text-amber-950 border-amber-300" },
          ]}
          activeStep={activeStep}
          onStepClick={handleStepClick}
          onReplay={replayAnimation}
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
      <div className="flex flex-col items-center justify-center gap-1.5">
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
                        ? "bg-amber-400 border border-amber-500 text-amber-950 opacity-100 scale-100"
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
            { step: 2, label: `2. Grid Area (${num1 * num2})`, activeColor: "bg-white text-slate-900 border-white" },
          ]}
          activeStep={activeStep}
          onStepClick={handleStepClick}
          onReplay={replayAnimation}
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

    return (
      <div className="flex flex-col items-center justify-center gap-1.5">
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
                  isSeparated ? "bg-white/15 border border-white/30 shadow-xs" : "bg-transparent border border-transparent"
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

        <StepControls
          steps={[
            { step: 1, label: `1. Total (${num1})`, activeColor: "bg-cyan-300 text-cyan-950 border-cyan-200" },
            { step: 2, label: `2. Groups (${groupCount}×${itemsPerGroup})`, activeColor: "bg-amber-400 text-amber-950 border-amber-300" },
          ]}
          activeStep={activeStep}
          onStepClick={handleStepClick}
          onReplay={replayAnimation}
        />
      </div>
    );
  }


  return null;
}
