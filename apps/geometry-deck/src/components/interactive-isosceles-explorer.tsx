"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { SvgTriangle } from "../lib/svg-shapes";

type InteractiveIsoscelesExplorerProps = {
  color?: string;
};

const LEG_LEN = 95;
const BASE_Y = 145;
const CX = 110;
const STROKE_W = 2.5;

/** Round to 4 decimal places to avoid SSR/client floating-point hydration mismatches */
const r = (n: number) => Math.round(n * 10000) / 10000;

export function InteractiveIsoscelesExplorer({ color }: InteractiveIsoscelesExplorerProps) {
  // Even apex angles (30° to 120°, step 2) so base angles are always exact integers
  const [apexAngle, setApexAngle] = useState(50);
  const [isUserControlling, setIsUserControlling] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const animRef = useRef<number>(0);
  const startTimeRef = useRef<number | null>(null);
  const ucRef = useRef(false);

  useEffect(() => {
    ucRef.current = isUserControlling;
  }, [isUserControlling]);

  const animate = useCallback((ts: number) => {
    if (ucRef.current) return;
    if (startTimeRef.current === null) startTimeRef.current = ts;
    const t = (Math.sin(((ts - startTimeRef.current) / 1000) * Math.PI * 0.2) + 1) / 2;
    const rawDeg = 16 + t * (148 - 16);
    const evenDeg = Math.round(rawDeg / 2) * 2;
    setApexAngle(evenDeg);
    animRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    if (!isUserControlling) {
      startTimeRef.current = null;
      animRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [animate, isUserControlling]);

  // Direct vertical drag on apex vertex
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsUserControlling(true);
    setIsDragging(true);
    if (animRef.current) cancelAnimationFrame(animRef.current);
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scY = 135 / rect.height;

    const onMove = (ev: PointerEvent) => {
      const py = (ev.clientY - rect.top) * scY + 25;
      const h = Math.max(15, Math.min(92, BASE_Y - py));
      const halfRad = Math.acos(Math.max(0.15, Math.min(0.97, h / LEG_LEN)));
      const rawDeg = (halfRad * 2 * 180) / Math.PI;
      const evenDeg = Math.max(16, Math.min(150, Math.round(rawDeg / 2) * 2));
      setApexAngle(evenDeg);
    };

    const onUp = () => {
      setIsDragging(false);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }, []);

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => e.stopPropagation(), []);

  // Geometry calculations (even integer apex angles guarantee baseAngle is an exact whole integer and apex + 2*base = 180° exactly)
  const displayApexAngle = Math.round(apexAngle / 2) * 2;
  const baseAngle = (180 - displayApexAngle) / 2;

  const halfApexRad = ((displayApexAngle / 2) * Math.PI) / 180;
  const hw = r(LEG_LEN * Math.sin(halfApexRad));
  const h = r(LEG_LEN * Math.cos(halfApexRad));

  const x1 = r(CX - hw);
  const x2 = r(CX + hw);
  const apexX = CX;
  const apexY = r(BASE_Y - h);

  // Midpoints for tick marks on equal legs
  const midLeftX = r((x1 + apexX) / 2);
  const midLeftY = r((BASE_Y + apexY) / 2);
  const midRightX = r((x2 + apexX) / 2);
  const midRightY = r((BASE_Y + apexY) / 2);

  // Exact normal vectors (100% perpendicular to leg line at all angles)
  const tickHalfLen = 7;
  const leftLegRad = Math.atan2(BASE_Y - apexY, x1 - apexX);
  const leftNormalX = -Math.sin(leftLegRad);
  const leftNormalY = Math.cos(leftLegRad);
  const tickLeft1 = { x: r(midLeftX - tickHalfLen * leftNormalX), y: r(midLeftY - tickHalfLen * leftNormalY) };
  const tickLeft2 = { x: r(midLeftX + tickHalfLen * leftNormalX), y: r(midLeftY + tickHalfLen * leftNormalY) };

  const rightLegRad = Math.atan2(BASE_Y - apexY, x2 - apexX);
  const rightNormalX = -Math.sin(rightLegRad);
  const rightNormalY = Math.cos(rightLegRad);
  const tickRight1 = { x: r(midRightX - tickHalfLen * rightNormalX), y: r(midRightY - tickHalfLen * rightNormalY) };
  const tickRight2 = { x: r(midRightX + tickHalfLen * rightNormalX), y: r(midRightY + tickHalfLen * rightNormalY) };

  // Base angle arcs strictly inside triangle polygon
  const arcR = Math.min(24, Math.max(10, hw * 0.4));
  const leftArcEnd = {
    x: r(x1 + arcR * Math.cos(Math.atan2(BASE_Y - apexY, apexX - x1))),
    y: r(BASE_Y - arcR * Math.sin(Math.atan2(BASE_Y - apexY, apexX - x1))),
  };
  const leftArcPath = `M ${r(x1 + arcR)} ${BASE_Y} A ${arcR} ${arcR} 0 0 0 ${leftArcEnd.x} ${leftArcEnd.y}`;

  const rightArcEnd = {
    x: r(x2 - arcR * Math.cos(Math.atan2(BASE_Y - apexY, x2 - apexX))),
    y: r(BASE_Y - arcR * Math.sin(Math.atan2(BASE_Y - apexY, x2 - apexX))),
  };
  const rightArcPath = `M ${r(x2 - arcR)} ${BASE_Y} A ${arcR} ${arcR} 0 0 1 ${rightArcEnd.x} ${rightArcEnd.y}`;

  // Apex arc path
  const apexArcR = Math.min(26, Math.max(12, h * 0.4));
  const apexArcLeft = {
    x: r(apexX + apexArcR * Math.cos(leftLegRad)),
    y: r(apexY + apexArcR * Math.sin(leftLegRad)),
  };
  const apexArcRight = {
    x: r(apexX + apexArcR * Math.cos(rightLegRad)),
    y: r(apexY + apexArcR * Math.sin(rightLegRad)),
  };
  const apexArcPath = `M ${apexArcLeft.x} ${apexArcLeft.y} A ${apexArcR} ${apexArcR} 0 0 0 ${apexArcRight.x} ${apexArcRight.y}`;

  return (
    <div className="w-full flex flex-col items-center select-none pb-1" onClick={stop} onPointerDown={stop}>
      {/* SVG Diagram */}
      <div className="relative w-full max-w-[340px] aspect-[22/13.5] flex items-center justify-center">
        <svg
          ref={svgRef}
          viewBox="0 25 220 135"
          className="w-full h-full overflow-visible touch-none select-none"
          style={{ cursor: isDragging ? "grabbing" : "default" }}
          aria-hidden
        >
          {/* Main Triangle Polygon */}
          <SvgTriangle
            x1={x1} y1={BASE_Y}
            x2={x2} y2={BASE_Y}
            x3={apexX} y3={apexY}
            fill="rgba(255,255,255,0.06)"
            stroke="rgba(255,255,255,0.95)"
            strokeWidth={STROKE_W}
          />

          {/* Equal Legs Tick Marks (Strictly Orthogonal to leg at every angle) */}
          <g stroke="rgba(255,255,255,0.95)" strokeWidth={2} strokeLinecap="round">
            <line x1={tickLeft1.x} y1={tickLeft1.y} x2={tickLeft2.x} y2={tickLeft2.y} />
            <line x1={tickRight1.x} y1={tickRight1.y} x2={tickRight2.x} y2={tickRight2.y} />
          </g>

          {/* Base Angle Arcs (Cyan) */}
          <path
            d={leftArcPath}
            fill="none"
            stroke="#5ee8ff"
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          <path
            d={rightArcPath}
            fill="none"
            stroke="#5ee8ff"
            strokeWidth={2.5}
            strokeLinecap="round"
          />

          {/* Apex Angle Arc (Gold) */}
          <path
            d={apexArcPath}
            fill="none"
            stroke="#ffd45e"
            strokeWidth={2.5}
            strokeLinecap="round"
          />

          {/* Base Angle Readouts (Cyan) */}
          <text
            x={x1 - 10}
            y={BASE_Y + 3}
            textAnchor="end"
            fontSize={12}
            fontWeight="800"
            fill="#5ee8ff"
            fontFamily="var(--font-heading, system-ui)"
            style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.7))" }}
          >
            {baseAngle}°
          </text>
          <text
            x={x2 + 10}
            y={BASE_Y + 3}
            textAnchor="start"
            fontSize={12}
            fontWeight="800"
            fill="#5ee8ff"
            fontFamily="var(--font-heading, system-ui)"
            style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.7))" }}
          >
            {baseAngle}°
          </text>

          {/* Apex Angle Value Label (Floating OUTSIDE above apex vertex) */}
          <text
            x={apexX}
            y={apexY - 14}
            textAnchor="middle"
            fontSize={12}
            fontWeight="800"
            fill="#ffd45e"
            fontFamily="var(--font-heading, system-ui)"
            style={{ filter: "drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.7))" }}
          >
            {displayApexAngle}°
          </text>

          {/* Transparent hit area */}
          <circle
            cx={apexX}
            cy={apexY}
            r={24}
            fill="transparent"
            style={{ cursor: isDragging ? "grabbing" : "grab", touchAction: "none" }}
            onPointerDown={handlePointerDown}
          />
          {/* Draggable Apex handle */}
          <circle
            cx={apexX}
            cy={apexY}
            r={10}
            fill="rgba(255,255,255,0.15)"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth={2}
            className="pointer-events-none"
          />
          <circle cx={apexX} cy={apexY} r={3.5} fill="white" className="pointer-events-none" />
        </svg>
      </div>

      {/* Live equation */}
      <div className="flex justify-center my-2">
        <div className="flex items-center gap-2 px-5 py-1.5 rounded-2xl bg-black/45 backdrop-blur-md border border-white/20 shadow-md text-base sm:text-lg font-bold font-headline select-none">
          <span style={{ color: "#5ee8ff" }}>{baseAngle}°</span>
          <span className="text-white/50">+</span>
          <span style={{ color: "#5ee8ff" }}>{baseAngle}°</span>
          <span className="text-white/50">+</span>
          <span style={{ color: "#ffd45e" }}>{displayApexAngle}°</span>
          <span className="text-white/50">=</span>
          <span className="text-white font-bold">180°</span>
        </div>
      </div>
    </div>
  );
}
