"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";

type InteractiveAngleExplorerProps = {
  /** Minimum angle in degrees (exclusive boundary, e.g. 0 for acute) */
  minAngle: number;
  /** Maximum angle in degrees (exclusive boundary, e.g. 90 for acute) */
  maxAngle: number;
  /** Label shown in the degree readout, e.g. "acute" */
  label: string;
  /** Card background color — used for theming */
  color: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// SVG geometry helpers (vertex-relative)
// ─────────────────────────────────────────────────────────────────────────────

const RAY_LEN = 130;
const ARC_R = 44;
const HANDLE_R = 14;
const PAD = 24; // padding around bounding box

/** Convert angle (degrees, 0 = along +x axis, CCW positive) to SVG point */
function toPoint(vx: number, vy: number, angleDeg: number, length: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: vx + length * Math.cos(rad),
    y: vy - length * Math.sin(rad),
  };
}

/** Build an SVG arc path */
function buildArcPath(vx: number, vy: number, startDeg: number, endDeg: number, r: number): string {
  const start = toPoint(vx, vy, startDeg, r);
  const end = toPoint(vx, vy, endDeg, r);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

/** Convert pointer position to angle in degrees */
function pointerToAngle(vx: number, vy: number, px: number, py: number): number {
  const dx = px - vx;
  const dy = -(py - vy);
  let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  if (angle < 0) angle += 360;
  return angle;
}

/**
 * Compute the bounding box of all arm positions + base ray + handle,
 * then derive the viewBox and vertex position.
 */
function computeLayout(minAngle: number, maxAngle: number) {
  let xMin = 0, xMax = 0, yMin = 0, yMax = 0;

  const expand = (x: number, y: number) => {
    xMin = Math.min(xMin, x);
    xMax = Math.max(xMax, x);
    yMin = Math.min(yMin, y);
    yMax = Math.max(yMax, y);
  };

  const sampleAt = (angleDeg: number, len: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    expand(len * Math.cos(rad), -len * Math.sin(rad));
  };

  // Arm endpoints (full reach) — only in the arm's actual sweep range + base ray
  const armLen = RAY_LEN + HANDLE_R;
  const armAngles = [0]; // base ray always at 0°
  for (let a = Math.floor(minAngle / 45) * 45; a <= maxAngle; a += 45) {
    armAngles.push(a);
  }
  armAngles.push(minAngle, maxAngle);
  for (const a of armAngles) sampleAt(a, armLen);

  // Arc sweep (shorter radius) — sweeps from 0° to maxAngle
  const arcLen = ARC_R + 6;
  for (let a = 0; a <= maxAngle; a += 45) {
    sampleAt(a, arcLen);
  }

  // Degree label (at ARC_R + 22 from vertex, positioned at angle/2 capped at 85°)
  sampleAt(Math.min(maxAngle / 2, 85), ARC_R + 26);

  const vx = -xMin + PAD;
  const vy = -yMin + PAD;
  const svgW = xMax - xMin + PAD * 2;
  const svgH = yMax - yMin + PAD * 2;

  return { vx, vy, svgW, svgH };
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function InteractiveAngleExplorer({
  minAngle,
  maxAngle,
  label,
  color,
}: InteractiveAngleExplorerProps) {
  const sweepMin = minAngle + 1;
  const sweepMax = maxAngle - 1;

  const { vx, vy, svgW, svgH } = useMemo(
    () => computeLayout(minAngle, maxAngle),
    [minAngle, maxAngle]
  );

  const [angle, setAngle] = useState(sweepMin);
  const [isUserControlling, setIsUserControlling] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const animRef = useRef<number>(0);
  const startTimeRef = useRef<number | null>(null);
  const isUserControllingRef = useRef(false);

  useEffect(() => {
    isUserControllingRef.current = isUserControlling;
  }, [isUserControlling]);

  // ── Auto-animation ──────────────────────────────────────────────────────
  const animate = useCallback(
    (timestamp: number) => {
      if (isUserControllingRef.current) return;
      if (startTimeRef.current === null) startTimeRef.current = timestamp;
      const elapsed = (timestamp - startTimeRef.current) / 1000;

      const t = (Math.sin(elapsed * Math.PI * 0.25) + 1) / 2;
      const newAngle = sweepMin + t * (sweepMax - sweepMin);
      setAngle(newAngle);

      animRef.current = requestAnimationFrame(animate);
    },
    [sweepMin, sweepMax]
  );

  useEffect(() => {
    if (!isUserControlling) {
      startTimeRef.current = null;
      animRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [animate, isUserControlling]);

  // ── Pointer drag on arm endpoint ────────────────────────────────────────
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsUserControlling(true);
      setIsDragging(true);
      if (animRef.current) cancelAnimationFrame(animRef.current);

      const svg = svgRef.current;
      if (!svg) return;

      const rect = svg.getBoundingClientRect();
      const scaleX = svgW / rect.width;
      const scaleY = svgH / rect.height;

      const onMove = (ev: PointerEvent) => {
        const px = (ev.clientX - rect.left) * scaleX;
        const py = (ev.clientY - rect.top) * scaleY;
        let a = pointerToAngle(vx, vy, px, py);
        a = Math.max(sweepMin, Math.min(sweepMax, a));
        setAngle(a);
      };

      const onUp = () => {
        setIsDragging(false);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [sweepMin, sweepMax, svgW, svgH, vx, vy]
  );

  // ── Slider input ────────────────────────────────────────────────────────
  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isUserControlling) {
        setIsUserControlling(true);
        if (animRef.current) cancelAnimationFrame(animRef.current);
      }
      setAngle(Number(e.target.value));
    },
    [isUserControlling]
  );

  // ── Prevent card tap-to-flip when interacting ───────────────────────────
  const stopPropagation = useCallback((e: React.PointerEvent | React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  // ── Computed SVG geometry ───────────────────────────────────────────────
  const armEnd = toPoint(vx, vy, angle, RAY_LEN);
  const baseEnd = toPoint(vx, vy, 0, RAY_LEN);
  const currentArc = buildArcPath(vx, vy, 0, angle, ARC_R);
  const boundaryMaxEnd = toPoint(vx, vy, maxAngle, RAY_LEN);

  const showMinBoundary = minAngle > 0;
  const boundaryMinEnd = showMinBoundary ? toPoint(vx, vy, minAngle, RAY_LEN) : null;

  // Degree label position — clamp to [25°, 85°] so it never overlaps the rays
  const labelAngle = Math.max(25, Math.min(angle / 2, 85));
  const labelPos = toPoint(vx, vy, labelAngle, ARC_R + 28);

  const displayAngle = Math.round(angle);

  // Filled wedge path
  const arcStart = toPoint(vx, vy, 0, ARC_R);
  const arcEnd = toPoint(vx, vy, angle, ARC_R);
  const wedgePath = `M ${vx} ${vy} L ${arcStart.x} ${arcStart.y} A ${ARC_R} ${ARC_R} 0 ${angle > 180 ? 1 : 0} 0 ${arcEnd.x} ${arcEnd.y} Z`;

  return (
    <div
      className="flex flex-col items-center gap-2 w-full pb-4"
      onClick={stopPropagation}
      onPointerDown={stopPropagation}
    >
      {/* SVG Diagram */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="w-full max-w-[300px] sm:max-w-[340px] touch-none select-none"
        style={{ cursor: isDragging ? "grabbing" : "default" }}
      >
        {/* Boundary lines (dashed, subtle) */}
        {showMinBoundary && boundaryMinEnd && (
          <line
            x1={vx} y1={vy}
            x2={boundaryMinEnd.x} y2={boundaryMinEnd.y}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth={1.5}
            strokeDasharray="6 4"
          />
        )}
        <line
          x1={vx} y1={vy}
          x2={boundaryMaxEnd.x} y2={boundaryMaxEnd.y}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={1.5}
          strokeDasharray="6 4"
        />

        {/* Filled wedge region (very subtle) */}
        <path d={wedgePath} fill="rgba(255,255,255,0.08)" />

        {/* Arc */}
        <path
          d={currentArc}
          fill="none"
          stroke="rgba(255,255,255,0.7)"
          strokeWidth={2}
          strokeLinecap="round"
        />

        {/* Base ray */}
        <line
          x1={vx} y1={vy}
          x2={baseEnd.x} y2={baseEnd.y}
          stroke="rgba(255,255,255,0.9)"
          strokeWidth={2.5}
          strokeLinecap="round"
        />

        {/* Rotating arm */}
        <line
          x1={vx} y1={vy}
          x2={armEnd.x} y2={armEnd.y}
          stroke="rgba(255,255,255,0.9)"
          strokeWidth={2.5}
          strokeLinecap="round"
        />

        {/* Vertex dot */}
        <circle cx={vx} cy={vy} r={4} fill="white" />

        {/* Degree label near arc */}
        <text
          x={labelPos.x}
          y={labelPos.y}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={16}
          fontWeight={700}
          fill="white"
          style={{ textShadow: "0 1px 4px rgba(0,0,0,0.4)" }}
        >
          {displayAngle}°
        </text>

        {/* Draggable handle at arm endpoint */}
        <circle
          cx={armEnd.x}
          cy={armEnd.y}
          r={HANDLE_R}
          fill="rgba(255,255,255,0.15)"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={2}
          style={{ cursor: isDragging ? "grabbing" : "grab", touchAction: "none" }}
          onPointerDown={handlePointerDown}
        />
        <circle
          cx={armEnd.x}
          cy={armEnd.y}
          r={4}
          fill="white"
          className="pointer-events-none"
        />
      </svg>

      {/* Slider */}
      <div
        className="w-full max-w-[260px] sm:max-w-[300px] px-2"
        onClick={stopPropagation}
      >
        <input
          type="range"
          min={sweepMin}
          max={sweepMax}
          step={1}
          value={Math.round(angle)}
          onChange={handleSliderChange}
          className="angle-slider w-full"
          style={
            {
              "--slider-color": color,
              "--slider-progress": `${((angle - sweepMin) / (sweepMax - sweepMin)) * 100}%`,
            } as React.CSSProperties
          }
          aria-label={`Adjust ${label} angle`}
        />
      </div>
    </div>
  );
}
