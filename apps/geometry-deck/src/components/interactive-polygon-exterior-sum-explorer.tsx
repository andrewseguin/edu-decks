import React, { useState, useEffect, useCallback, useRef } from "react";
import { useContainerWidth } from "@/hooks/use-container-width";
import { Play, Pause, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

type InteractivePolygonExteriorSumProps = {
  color?: string;
};

const SVG_H = 185;
const R = 66;

const POLY_NAMES: Record<number, string> = {
  3: "Triangle",
  4: "Quadrilateral",
  5: "Pentagon",
  6: "Hexagon",
  7: "Heptagon",
  8: "Octagon",
  9: "Nonagon",
  10: "Decagon",
  11: "Hendecagon",
  12: "Dodecagon",
};

const COLOR_LILAC = "#d8b4fe"; // Exterior angle color

const PROOF_STEPS = [
  { step: 1, label: "1. Polygon" },
  { step: 2, label: "2. Angles" },
  { step: 3, label: "3. Combined" },
];

function getSectorPath(
  center: { x: number; y: number },
  startAngle: number,
  sweepAngle: number,
  r: number
): string {
  const steps = 16;
  const pts: string[] = [`M ${center.x.toFixed(2)} ${center.y.toFixed(2)}`];
  for (let s = 0; s <= steps; s++) {
    const a = startAngle + (sweepAngle * s) / steps;
    const px = center.x + r * Math.cos(a);
    const py = center.y + r * Math.sin(a);
    pts.push(`L ${px.toFixed(2)} ${py.toFixed(2)}`);
  }
  pts.push("Z");
  return pts.join(" ");
}

function getArcPath(
  center: { x: number; y: number },
  startAngle: number,
  sweepAngle: number,
  r: number
): string {
  const steps = 16;
  const pts: string[] = [];
  for (let s = 0; s <= steps; s++) {
    const a = startAngle + (sweepAngle * s) / steps;
    const px = center.x + r * Math.cos(a);
    const py = center.y + r * Math.sin(a);
    pts.push(`${s === 0 ? "M" : "L"} ${px.toFixed(2)} ${py.toFixed(2)}`);
  }
  return pts.join(" ");
}

export function InteractivePolygonExteriorSumExplorer({ color }: InteractivePolygonExteriorSumProps) {
  const { containerRef, width: rawW } = useContainerWidth(320);
  const SVG_W = Math.max(280, Math.min(460, rawW - 24));
  const CX = SVG_W / 2;
  const CY = 90;

  const [n, setN] = useState(5); // n in [3..12]
  // progress in [0 .. 3]:
  // 0.0: Step 1 — Pure clean polygon (no extensions)
  // 0.0 -> 1.0: Extensions shoot outward
  // 1.0 -> 2.0: Step 2 — Pink exterior angle wedges sweep open from polygon edges
  // 2.0 -> 3.0: Step 3 — Pink wedges glide into center to form 360° circle
  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const animRef = useRef<number | null>(null);
  const currProgRef = useRef<number>(0);
  currProgRef.current = progress;
  const dragStartRef = useRef<{ startX: number; startVal: number } | null>(null);

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => e.stopPropagation(), []);

  const eachExteriorAngle = 360 / n;
  const sweepAngle = (2 * Math.PI) / n;
  const polyName = POLY_NAMES[n] || `${n}-gon`;
  const arcR = Math.max(30, Math.min(42, 140 / Math.sqrt(n)));

  // Smooth animation to target progress (calibrated to comfortable, measured pace)
  const animateTo = useCallback((target: number, duration = 2000, onDone?: () => void) => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    const startVal = currProgRef.current;
    const distance = Math.abs(target - startVal);
    if (distance < 0.005) {
      setProgress(target);
      setActiveStep(target < 0.8 ? 1 : target < 2.5 ? 2 : 3);
      onDone?.();
      return;
    }

    const actualDuration = Math.max(600, distance * duration);
    const startTime = performance.now();

    const frame = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / actualDuration);
      const current = startVal + (target - startVal) * t;
      setProgress(current);
      setActiveStep(current < 0.8 ? 1 : current < 2.5 ? 2 : 3);

      if (t < 1) {
        animRef.current = requestAnimationFrame(frame);
      } else {
        setProgress(target);
        setActiveStep(target < 0.8 ? 1 : target < 2.5 ? 2 : 3);
        setIsAutoPlaying(false);
        onDone?.();
      }
    };
    animRef.current = requestAnimationFrame(frame);
  }, []);

  // Jump to specific step
  const handleStepClick = (stepNum: number) => {
    setIsAutoPlaying(false);
    if (stepNum === 1) {
      animateTo(0.0, 1000);
    } else if (stepNum === 2) {
      animateTo(2.0, 1400);
    } else if (stepNum === 3) {
      animateTo(3.0, 1600);
    }
  };

  // Trigger full 3-step proof sequence with comfortable pauses (~6.8s total)
  const startFullSequence = useCallback(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setIsAutoPlaying(true);
    setProgress(0);
    setActiveStep(1);

    const EXTEND_TIME = 1600;
    const PAUSE_1 = 500;
    const DRAW_TIME = 1800;
    const PAUSE_2 = 1300; // Distinct, deliberate pause to absorb the fanned-out exterior angles
    const COMBINE_TIME = 2200;

    const t0 = performance.now();

    const tick = (now: number) => {
      const elapsed = now - t0;

      if (elapsed < EXTEND_TIME) {
        // Phase 1: 0.0 -> 1.0
        const t = elapsed / EXTEND_TIME;
        setProgress(t);
        setActiveStep(1);
      } else if (elapsed < EXTEND_TIME + PAUSE_1) {
        setProgress(1.0);
        setActiveStep(1);
      } else if (elapsed < EXTEND_TIME + PAUSE_1 + DRAW_TIME) {
        // Phase 2: 1.0 -> 2.0
        const t = (elapsed - EXTEND_TIME - PAUSE_1) / DRAW_TIME;
        setProgress(1.0 + t);
        setActiveStep(2);
      } else if (elapsed < EXTEND_TIME + PAUSE_1 + DRAW_TIME + PAUSE_2) {
        setProgress(2.0);
        setActiveStep(2);
      } else if (elapsed < EXTEND_TIME + PAUSE_1 + DRAW_TIME + PAUSE_2 + COMBINE_TIME) {
        // Phase 3: 2.0 -> 3.0
        const t = (elapsed - EXTEND_TIME - PAUSE_1 - DRAW_TIME - PAUSE_2) / COMBINE_TIME;
        setProgress(2.0 + t);
        setActiveStep(3);
      } else {
        setProgress(3.0);
        setActiveStep(3);
        setIsAutoPlaying(false);
        return;
      }
      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
  }, []);

  // Reset when shape changes
  useEffect(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setProgress(0);
    setActiveStep(1);
    setIsAutoPlaying(false);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [n]);

  // Direct tactile touch: drag horizontally across canvas to scrub through all 3 phases
  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setIsAutoPlaying(false);
    setIsDragging(true);
    (e.target as Element).setPointerCapture?.(e.pointerId);
    dragStartRef.current = {
      startX: e.clientX,
      startVal: currProgRef.current,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDragging || !dragStartRef.current) return;
    const deltaX = e.clientX - dragStartRef.current.startX;
    const deltaProgress = (deltaX / 160) * 3;
    const nextVal = Math.max(0, Math.min(3, dragStartRef.current.startVal + deltaProgress));
    setProgress(nextVal);
    setActiveStep(nextVal < 1.0 ? 1 : nextVal < 2.0 ? 2 : 3);
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    (e.target as Element).releasePointerCapture?.(e.pointerId);
    dragStartRef.current = null;
  };

  const isComplete = progress >= 2.95;

  const handlePlayToggle = () => {
    if (isAutoPlaying) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      setIsAutoPlaying(false);
    } else if (isComplete) {
      startFullSequence();
    } else {
      startFullSequence();
    }
  };

  // Compute regular polygon vertices
  const vertices = Array.from({ length: n }, (_, i) => {
    const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
    return { x: CX + R * Math.cos(angle), y: CY + R * Math.sin(angle) };
  });

  // Calculate phase values
  // Phase 1 (Extensions): 0.0 -> 1.0
  const rayExtFactor = Math.min(1, Math.max(0, progress));

  // Phase 2 (Draw Arcs): 1.0 -> 2.0
  const arcSweepFactor = Math.min(1, Math.max(0, progress - 1.0));

  // Phase 3 (Combine into Center): 2.0 -> 3.0
  const combineFactor = Math.min(1, Math.max(0, progress - 2.0));

  const extLenMax = Math.max(28, Math.min(44, 150 / Math.sqrt(n)));
  const currentExtLen = extLenMax * rayExtFactor;

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-2 w-full max-w-[440px] mx-auto pb-1 select-none" onClick={stop} onPointerDown={stop}>
      
      {/* Tier 2: Interactive SVG Canvas */}
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        style={{ maxHeight: 175 }}
        className={cn(
          "w-full max-w-[360px] touch-none select-none overflow-visible",
          isDragging ? "cursor-grabbing" : "cursor-grab"
        )}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <title>Drag to scrub through the 3-step proof</title>

        {/* 1. Base Polygon Outline & Interior */}
        <polygon
          points={vertices.map((v) => `${v.x},${v.y}`).join(" ")}
          fill="rgba(255, 255, 255, 0.05)"
          stroke="rgba(255, 255, 255, 0.95)"
          strokeWidth={2.5}
          strokeLinejoin="round"
        />

        {/* 2. Radial Glide Guidelines (visible during Phase 3 translation) */}
        {combineFactor > 0 && vertices.map((v, i) => (
          <line
            key={`radial-guide-${i}`}
            x1={v.x}
            y1={v.y}
            x2={CX}
            y2={CY}
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth={1}
            strokeDasharray="2 3"
          />
        ))}

        {/* 3. Step 1: Extended Tangent Rays (Grow outward from vertices) */}
        {currentExtLen > 0 && vertices.map((v, i) => {
          const nextV = vertices[(i + 1) % n];
          const heading = Math.atan2(nextV.y - v.y, nextV.x - v.x);
          const rayEndX = nextV.x + Math.cos(heading) * currentExtLen;
          const rayEndY = nextV.y + Math.sin(heading) * currentExtLen;

          return (
            <line
              key={`tangent-ray-${i}`}
              x1={nextV.x}
              y1={nextV.y}
              x2={rayEndX}
              y2={rayEndY}
              stroke="rgba(255, 255, 255, 0.55)"
              strokeWidth={1.6}
              strokeDasharray="3 2"
            />
          );
        })}

        {/* 4. Ghost Outlines at Original Corners (revealed once wedges start gliding inward) */}
        {combineFactor > 0.05 && vertices.map((v, i) => {
          const nextV = vertices[(i + 1) % n];
          const heading = Math.atan2(nextV.y - v.y, nextV.x - v.x);
          const ghostArc = getArcPath(nextV, heading, sweepAngle, arcR);

          return (
            <path
              key={`ghost-arc-${i}`}
              d={ghostArc}
              fill="none"
              stroke="rgba(216, 180, 254, 0.35)"
              strokeWidth={1.5}
              strokeDasharray="2 2"
            />
          );
        })}

        {/* 5. Step 2 & 3: Pink Exterior Angle Wedges (Clean Luminous Lilac) */}
        {arcSweepFactor > 0 && (
          <g style={{ filter: "drop-shadow(0px 2px 8px rgba(216, 180, 254, 0.75))" }}>
            {vertices.map((v, i) => {
              const nextV = vertices[(i + 1) % n];
              const nextNextV = vertices[(i + 2) % n];
              const heading1 = Math.atan2(nextV.y - v.y, nextV.x - v.x);
              const heading2 = Math.atan2(nextNextV.y - nextV.y, nextNextV.x - nextV.x);

              // Phase 3 translation: Synchronous lockstep glide so all sectors maintain equal distance
              const curCenter = {
                x: nextV.x + (CX - nextV.x) * combineFactor,
                y: nextV.y + (CY - nextV.y) * combineFactor,
              };

              // Phase 2 sweep angle growth: Arcs OUTWARD from the polygon side edge (heading2) towards extended ray (heading1)
              const currentSweep = sweepAngle * arcSweepFactor;
              const startAngle = heading2 - currentSweep;

              const sectorD = getSectorPath(curCenter, startAngle, currentSweep, arcR);
              const arcD = getArcPath(curCenter, startAngle, currentSweep, arcR);

              return (
                <g key={`sliding-sector-${i}`}>
                  {/* Rich, vibrant lilac sector fill */}
                  <path
                    d={sectorD}
                    fill={isComplete ? "rgba(216, 180, 254, 0.85)" : "rgba(216, 180, 254, 0.78)"}
                    stroke={combineFactor > 0.1 ? "rgba(255, 255, 255, 0.5)" : "none"}
                    strokeWidth={1.2}
                  />
                  {/* Crisp outer arc in bright luminous lilac */}
                  <path
                    d={arcD}
                    fill="none"
                    stroke="#f5d0fe"
                    strokeWidth={2.8}
                    strokeLinecap="round"
                  />
                </g>
              );
            })}
          </g>
        )}

        {/* 6. Completed Center Circle Glow */}
        {isComplete && (
          <circle
            cx={CX}
            cy={CY}
            r={arcR}
            fill="none"
            stroke="#ffffff"
            strokeWidth={1.5}
            opacity={0.8}
            className="animate-pulse"
          />
        )}
      </svg>

      {/* Tier 3: Controls Row 1 — Number of Sides Stepper */}
      <div className="flex items-center justify-between w-[240px] sm:w-[260px] bg-white/10 backdrop-blur-md px-1.5 sm:px-2 py-0.5 rounded-full border border-white/25 shadow-sm pointer-events-auto z-30 select-none">
        <button
          onClick={() => setN((prev) => Math.max(3, prev - 1))}
          disabled={n <= 3}
          className="w-5 h-5 shrink-0 rounded-full flex items-center justify-center font-bold text-xs transition-all border-none bg-transparent hover:bg-white/15 text-white disabled:opacity-30 disabled:pointer-events-none active:scale-95 cursor-pointer"
          aria-label="Decrease sides"
        >
          −
        </button>
        <div className="flex-1 text-center px-1 text-[11px] sm:text-xs font-headline font-bold text-white whitespace-nowrap">
          {polyName} ({n} sides · {Number(eachExteriorAngle.toFixed(1))}°)
        </div>
        <button
          onClick={() => setN((prev) => Math.min(12, prev + 1))}
          disabled={n >= 12}
          className="w-5 h-5 shrink-0 rounded-full flex items-center justify-center font-bold text-xs transition-all border-none bg-transparent hover:bg-white/15 text-white disabled:opacity-30 disabled:pointer-events-none active:scale-95 cursor-pointer"
          aria-label="Increase sides"
        >
          +
        </button>
      </div>

      {/* Tier 3: Controls Row 2 — Step Navigation Pills + Play/Replay Toggle */}
      <div className="flex items-center gap-1 sm:gap-1.5 bg-white/10 backdrop-blur-md px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border border-white/25 shadow-sm pointer-events-auto z-30 select-none">
        {PROOF_STEPS.map((s) => (
          <button
            key={`step-${s.step}`}
            type="button"
            onClick={() => handleStepClick(s.step)}
            className={cn(
              "px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-headline font-bold transition-all duration-200 cursor-pointer border-none",
              activeStep === s.step
                ? "bg-white/20 text-white shadow-none"
                : "bg-transparent text-white/70 hover:text-white hover:bg-white/10"
            )}
          >
            {s.label}
          </button>
        ))}

        <div className="w-px h-3 bg-white/20 mx-0.5" />

        <button
          type="button"
          onClick={handlePlayToggle}
          title={isComplete ? "Replay animation" : isAutoPlaying ? "Pause animation" : "Play step sequence"}
          className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/15 transition-all active:scale-95 cursor-pointer border-none"
          aria-label={isComplete ? "Replay" : isAutoPlaying ? "Pause" : "Play"}
        >
          {isComplete ? (
            <RotateCcw className="w-3 sm:w-3.5 h-3 sm:h-3.5 stroke-[2.4]" />
          ) : isAutoPlaying ? (
            <Pause className="w-3 sm:w-3.5 h-3 sm:h-3.5 fill-white" />
          ) : (
            <Play className="w-3 sm:w-3.5 h-3 sm:h-3.5 fill-white ml-0.5" />
          )}
        </button>
      </div>

      {/* Tier 4: Live Synchronized Equation Banner (Bottom Conclusion) */}
      <div className="flex justify-center mt-0.5">
        <div className="flex items-center gap-2.5 px-5 py-1.5 rounded-2xl bg-black/45 backdrop-blur-md border border-white/20 shadow-md text-xs sm:text-sm font-bold font-headline select-none">
          <span style={{ color: COLOR_LILAC }}>Exterior angle sum</span>
          <span className="text-white/50">=</span>
          <span className="text-white">
            <span>{n}</span>
            <span className="text-white/60"> × </span>
            <span>{Number(eachExteriorAngle.toFixed(1))}°</span>
          </span>
          <span className="text-white/50">=</span>
          <span className="text-white font-bold text-sm sm:text-base">360°</span>
        </div>
      </div>
    </div>
  );
}
