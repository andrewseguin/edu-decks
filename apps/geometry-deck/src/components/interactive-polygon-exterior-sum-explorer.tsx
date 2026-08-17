import React, { useState, useEffect, useCallback, useRef } from "react";
import { useContainerWidth } from "@/hooks/use-container-width";
import { Play, RotateCcw } from "lucide-react";

type InteractivePolygonExteriorSumProps = {
  color?: string;
};

const SVG_H = 175;
const R = 64;

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
const COLOR_GOLD = "#ffd45e";

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
  const CY = 84;

  const [n, setN] = useState(5); // n in [3..12]
  // animProgress in [0 .. n - 1] (can be animated to any step)
  const [animProgress, setAnimProgress] = useState(0);
  const [targetStep, setTargetStep] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  const animRef = useRef<number | null>(null);
  const currProgRef = useRef<number>(0);
  currProgRef.current = animProgress;

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => e.stopPropagation(), []);

  // Compute vertices (upright with apex at top)
  const vertices = Array.from({ length: n }, (_, i) => {
    const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
    return { x: CX + R * Math.cos(angle), y: CY + R * Math.sin(angle) };
  });

  const totalSteps = n - 1;
  const eachExteriorAngle = 360 / n;
  const sweepAngle = (2 * Math.PI) / n;
  const arcR = Math.max(16, Math.min(24, 100 / n));
  const polyName = POLY_NAMES[n] || `${n}-gon`;

  // Animate from current progress to target step
  const animateToStep = useCallback((target: number, durationPerStep = 600) => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    const startVal = currProgRef.current;
    const distance = Math.abs(target - startVal);
    if (distance < 0.01) {
      setAnimProgress(target);
      setTargetStep(target);
      return;
    }

    const duration = Math.max(400, distance * durationPerStep);
    const startTime = performance.now();

    const frame = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      // Smooth cubic in-out ease
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const current = startVal + (target - startVal) * ease;
      setAnimProgress(current);

      if (t < 1) {
        animRef.current = requestAnimationFrame(frame);
      } else {
        setAnimProgress(target);
        setTargetStep(target);
        setIsAutoPlaying(false);
      }
    };
    animRef.current = requestAnimationFrame(frame);
  }, []);

  // When shape changes, reset to 0
  useEffect(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setAnimProgress(0);
    setTargetStep(0);
    setIsAutoPlaying(false);
  }, [n]);

  // Stepping actions
  const stepForward = () => {
    if (targetStep < totalSteps) {
      const next = targetStep + 1;
      setTargetStep(next);
      animateToStep(next);
    }
  };

  const stepBackward = () => {
    if (targetStep > 0) {
      const prev = targetStep - 1;
      setTargetStep(prev);
      animateToStep(prev);
    }
  };

  const handleReset = () => {
    setTargetStep(0);
    animateToStep(0);
  };

  const handlePlayAll = () => {
    setIsAutoPlaying(true);
    setAnimProgress(0);
    setTargetStep(totalSteps);
    animateToStep(totalSteps, 850);
  };

  // User taps on a specific vertex:
  // Vertex index (k + 1) % n corresponds to step k (for k in 0..n-1)
  const handleVertexClick = (vIndex: number) => {
    // Map vertex index to step:
    // vIndex 1 -> step 0
    // vIndex 2 -> step 1
    // ...
    // vIndex 0 -> step n - 1 (or 0)
    let destStep = vIndex === 0 ? totalSteps : vIndex - 1;
    if (destStep > totalSteps) destStep = totalSteps;
    setTargetStep(destStep);
    animateToStep(destStep);
  };

  // Current position of moving cluster along polygon edges
  const currentLeg = Math.min(totalSteps - 1, Math.max(0, Math.floor(animProgress)));
  const subT = Math.max(0, Math.min(1, animProgress - currentLeg));

  const fromV = vertices[(currentLeg + 1) % n] || vertices[0];
  const toV = vertices[(currentLeg + 2) % n] || vertices[0];

  const clusterX = fromV.x + (toV.x - fromV.x) * subT;
  const clusterY = fromV.y + (toV.y - fromV.y) * subT;

  const isComplete = animProgress >= totalSteps;
  const movingSectorsCount = isComplete ? n : currentLeg + 1 + (subT > 0.95 ? 1 : 0);
  const accumulatedDegrees = Math.min(360, Math.round(movingSectorsCount * eachExteriorAngle));

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-2 w-full max-w-[440px] mx-auto pb-1 select-none" onClick={stop} onPointerDown={stop}>
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        style={{ maxHeight: 165 }}
        className="w-full max-w-[360px] touch-none select-none overflow-visible"
      >
        {/* Base Outer Polygon */}
        <polygon
          points={vertices.map((v) => `${v.x},${v.y}`).join(" ")}
          fill="rgba(255, 255, 255, 0.05)"
          stroke="rgba(255, 255, 255, 0.95)"
          strokeWidth={2.5}
          strokeLinejoin="round"
        />

        {/* Extended Heading Dashed Rays at Corners */}
        {vertices.map((v, i) => {
          const nextV = vertices[(i + 1) % n];
          const heading = Math.atan2(nextV.y - v.y, nextV.x - v.x);
          const extLen = Math.max(20, Math.min(30, 120 / n));
          const rayEndX = nextV.x + Math.cos(heading) * extLen;
          const rayEndY = nextV.y + Math.sin(heading) * extLen;

          return (
            <line
              key={`ray-${i}`}
              x1={nextV.x}
              y1={nextV.y}
              x2={rayEndX}
              y2={rayEndY}
              stroke="rgba(255, 255, 255, 0.45)"
              strokeWidth={1.5}
              strokeDasharray="3 2"
            />
          );
        })}

        {/* Stationary Waiting Arcs (at vertices that haven't been picked up yet) */}
        {vertices.map((v, i) => {
          const isWaiting = i >= movingSectorsCount && !isComplete;
          if (!isWaiting) return null;

          const nextV = vertices[(i + 1) % n];
          const heading = Math.atan2(nextV.y - v.y, nextV.x - v.x);
          const arcD = getArcPath(nextV, heading, sweepAngle, arcR);
          const sectorD = getSectorPath(nextV, heading, sweepAngle, arcR);

          return (
            <g key={`waiting-arc-${i}`}>
              <path d={sectorD} fill="rgba(216, 180, 254, 0.25)" stroke="none" />
              <path d={arcD} fill="none" stroke={COLOR_LILAC} strokeWidth={2.5} strokeLinecap="round" />
            </g>
          );
        })}

        {/* The Traveling / Cascading Arc Cluster */}
        <g style={{ filter: "drop-shadow(0px 2px 5px rgba(216, 180, 254, 0.8))" }}>
          {Array.from({ length: movingSectorsCount }, (_, i) => {
            const heading = Math.atan2(vertices[(i + 1) % n].y - vertices[i].y, vertices[(i + 1) % n].x - vertices[i].x);
            const sectorD = getSectorPath({ x: clusterX, y: clusterY }, heading, sweepAngle, arcR);
            const arcD = getArcPath({ x: clusterX, y: clusterY }, heading, sweepAngle, arcR);

            return (
              <g key={`moving-sector-${i}`}>
                <path d={sectorD} fill="rgba(216, 180, 254, 0.45)" stroke="none" />
                <path d={arcD} fill="none" stroke={COLOR_LILAC} strokeWidth={3} strokeLinecap="round" />
              </g>
            );
          })}
        </g>

        {/* Interactive Clickable Vertex Target Dots */}
        {vertices.map((v, i) => {
          // Next target vertex to click
          const isNextTarget = (i === (targetStep + 2) % n && targetStep < totalSteps) || (targetStep === totalSteps && i === 1);

          return (
            <g key={`v-${i}`} className="cursor-pointer" onClick={() => handleVertexClick(i)}>
              {/* Invisible large touch target */}
              <circle cx={v.x} cy={v.y} r={18} fill="transparent" />

              {/* Target Guide Ring on Next Reachable Vertex */}
              {isNextTarget && (
                <circle
                  cx={v.x}
                  cy={v.y}
                  r={8}
                  fill="none"
                  stroke={COLOR_GOLD}
                  strokeWidth={1.5}
                  strokeDasharray="3 2"
                  opacity={0.9}
                />
              )}

              <circle cx={v.x} cy={v.y} r={3.5} fill={isNextTarget ? COLOR_GOLD : "#ffffff"} />
            </g>
          );
        })}
      </svg>

      {/* Row 1: Number of Sides Stepper */}
      <div className="flex items-center justify-between w-[280px] sm:w-[300px] bg-white/10 backdrop-blur-md px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border border-white/25 shadow-sm pointer-events-auto z-30 select-none">
        <button
          onClick={() => setN((prev) => Math.max(3, prev - 1))}
          disabled={n <= 3}
          className="w-6 h-6 shrink-0 rounded-full flex items-center justify-center font-bold text-sm transition-all border-none bg-transparent hover:bg-white/15 text-white disabled:opacity-30 disabled:pointer-events-none active:scale-95 cursor-pointer"
          aria-label="Decrease sides"
        >
          −
        </button>
        <div className="flex-1 text-center px-1 text-xs sm:text-sm font-headline font-bold text-white whitespace-nowrap">
          {polyName} ({n} sides · {Number(eachExteriorAngle.toFixed(1))}°)
        </div>
        <button
          onClick={() => setN((prev) => Math.min(12, prev + 1))}
          disabled={n >= 12}
          className="w-6 h-6 shrink-0 rounded-full flex items-center justify-center font-bold text-sm transition-all border-none bg-transparent hover:bg-white/15 text-white disabled:opacity-30 disabled:pointer-events-none active:scale-95 cursor-pointer"
          aria-label="Increase sides"
        >
          +
        </button>
      </div>

      {/* Row 2: Step-by-Step Back / Forward Controls */}
      <div className="flex items-center gap-2 bg-black/35 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 shadow-sm text-xs sm:text-sm select-none">
        {targetStep > 0 && (
          <button
            onClick={stepBackward}
            className="px-2.5 py-0.5 rounded-full font-bold text-xs bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all cursor-pointer"
          >
            ◀ Back
          </button>
        )}

        <span className="text-white/90 font-medium px-1 text-xs sm:text-sm whitespace-nowrap">
          {targetStep === 0
            ? "1 angle (tap next vertex)"
            : isComplete
            ? `Full circle complete (360°)`
            : `${movingSectorsCount} angles combined`}
        </span>

        {!isComplete ? (
          <div className="flex items-center gap-1.5">
            <button
              onClick={stepForward}
              className="px-2.5 py-0.5 rounded-full font-bold text-xs bg-amber-400/30 hover:bg-amber-400/40 text-amber-200 border border-amber-300/40 active:scale-95 transition-all cursor-pointer flex items-center gap-1"
            >
              Next ➔
            </button>
            <button
              onClick={handlePlayAll}
              className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white active:scale-95 transition-all cursor-pointer"
              title="Auto-combine all angles"
              aria-label="Auto-combine all angles"
            >
              <Play className="w-3 h-3 fill-white" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleReset}
            className="px-2.5 py-0.5 rounded-full font-bold text-xs bg-white/15 hover:bg-white/25 text-white active:scale-95 transition-all cursor-pointer flex items-center gap-1"
            title="Reset to start"
          >
            <RotateCcw className="w-3 h-3 stroke-[2.5]" />
            Reset
          </button>
        )}
      </div>

      {/* Live Synchronized Equation Banner */}
      <div className="flex justify-center mt-0.5">
        <div className="flex items-center gap-2.5 px-5 py-1.5 rounded-2xl bg-black/45 backdrop-blur-md border border-white/20 shadow-md text-xs sm:text-sm font-bold font-headline select-none">
          <span style={{ color: COLOR_LILAC }}>Exterior angle sum</span>
          <span className="text-white/50">=</span>
          <span className="text-white/90">
            <span style={{ color: COLOR_GOLD }}>{n}</span> × {Number(eachExteriorAngle.toFixed(1))}°
          </span>
          <span className="text-white/50">=</span>
          <span className="text-white font-bold text-base">360°</span>
        </div>
      </div>
    </div>
  );
}
