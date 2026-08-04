"use client";

import { useState, useEffect, useRef } from "react";
import { MathProblem } from "@/lib/types";
import { lcm } from "./visual-utils";
import { FractionVisualizer } from "./FractionVisualizer";
import { WholeNumberVisualizer } from "./WholeNumberVisualizer";

export type VisualMathProps = {
  problem: MathProblem;
  isFlipped?: boolean;
};

export function VisualMath({ problem, isFlipped = true }: VisualMathProps) {
  const { num1, num2, operation } = problem;
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

  if (problem.isFraction) {
    return (
      <FractionVisualizer
        problem={problem}
        activeStep={activeStep}
        cyanVisible={cyanVisible}
        orangeVisible={orangeVisible}
        subtractionCount={subtractionCount}
        whiteCount={whiteCount}
        onStepClick={handleStepClick}
        onReplay={replayAnimation}
      />
    );
  }

  return (
    <WholeNumberVisualizer
      problem={problem}
      activeStep={activeStep}
      cyanVisible={cyanVisible}
      orangeVisible={orangeVisible}
      subtractionCount={subtractionCount}
      whiteCount={whiteCount}
      onStepClick={handleStepClick}
      onReplay={replayAnimation}
    />
  );
}
