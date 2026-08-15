"use client";

import React from "react";
import type { SvgMutation } from "../types";
import {
  LABEL_FONT, STROKE_W, WHITE50, WHITE70, WHITE90,
  arcPath, SvgLabel, UnknownPill,
} from "./svg-primitives";

// ─────────────────────────────────────────────────────────────────────────────
// Angle helper component
// ─────────────────────────────────────────────────────────────────────────────

export function LegendValueToken({
  x,
  y,
  label,
  value,
  isUnknown,
  revealValue,
  color,
}: {
  x: number;
  y: number;
  label: string;
  value: number;
  isUnknown: boolean;
  revealValue?: number;
  color: string;
}) {
  const isRevealed = revealValue != null;
  const pillW = 34;
  const pillH = 22;
  const valueX = x + 6;
  const pillCx = valueX + pillW / 2;

  return (
    <g>
      {/* Label "A = " or "B = " */}
      <text
        x={x}
        y={y + 4}
        textAnchor="end"
        fontSize={13}
        fontWeight="700"
        fill={color}
        fontFamily={LABEL_FONT}
      >
        {label} =
      </text>

      {!isUnknown ? (
        /* Known value: simple text */
        <text
          x={valueX}
          y={y + 4}
          textAnchor="start"
          fontSize={14}
          fontWeight="700"
          fill={color}
          fontFamily={LABEL_FONT}
        >
          {value}°
        </text>
      ) : (
        /* Unknown value: glassmorphic ? badge when unrevealed, text when revealed */
        <>
          {/* Revealed answer */}
          <text
            x={valueX}
            y={y + 4}
            textAnchor="start"
            fontSize={14}
            fontWeight="700"
            fill={color}
            fontFamily={LABEL_FONT}
            style={{
              opacity: isRevealed ? 1 : 0,
              transition: "opacity 0.4s ease 0.15s",
            }}
          >
            {revealValue}°
          </text>

          {/* Glassmorphic ? badge */}
          <g
            style={{
              opacity: isRevealed ? 0 : 1,
              transform: isRevealed ? "scale(0.75)" : "scale(1)",
              transformOrigin: `${pillCx}px ${y}px`,
              transition: "opacity 0.3s ease, transform 0.3s ease",
            }}
          >
            <rect
              x={valueX}
              y={y - pillH / 2}
              width={pillW}
              height={pillH}
              rx={pillH / 2}
              fill="rgba(255,255,255,0.22)"
              stroke="rgba(255,255,255,0.65)"
              strokeWidth={1.5}
            />
            <text
              x={pillCx}
              y={y + 4}
              textAnchor="middle"
              fontSize={14}
              fontWeight="800"
              fill="rgba(255,255,255,0.95)"
              fontFamily={LABEL_FONT}
            >
              ?
            </text>
          </g>
        </>
      )}
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Angle shapes
// ─────────────────────────────────────────────────────────────────────────────

export function AngleSingle({ dims, mutation }: { dims: Record<string, number | string>; mutation?: SvgMutation }) {
  const angleDeg = typeof dims.angle === "number" ? dims.angle : 60;
  const isUnknown = dims.unknown === "A";
  const vx = 60, vy = 150, rayLen = 100;
  const baseEnd = { x: vx + rayLen, y: vy };
  const rad = (angleDeg * Math.PI) / 180;
  const secondEnd = { x: vx + rayLen * Math.cos(-rad), y: vy + rayLen * Math.sin(-rad) };
  const arcR = 36;
  // Arc endpoints sit on the two rays at distance arcR from vertex.
  // sweep=1 (CW on screen) goes upward from the base ray to the second ray.
  const arcEx = vx + arcR * Math.cos(-rad);
  const arcEy = vy + arcR * Math.sin(-rad);
  const large = angleDeg > 180 ? 1 : 0;
  const aPath = `M ${vx + arcR} ${vy} A ${arcR} ${arcR} 0 ${large} 0 ${arcEx} ${arcEy}`;
  const arcLen = (arcR * 2 * Math.PI * angleDeg) / 360;
  const labelAngle = angleDeg / 2;
  const labelR = arcR + 18;
  const labelX = vx + labelR * Math.cos(-(labelAngle * Math.PI) / 180);
  const labelY = vy + labelR * Math.sin(-(labelAngle * Math.PI) / 180);
  return (
    <svg viewBox="0 0 220 190" className="w-full h-full" aria-hidden>
      <line x1={vx} y1={vy} x2={baseEnd.x} y2={baseEnd.y} stroke={WHITE70} strokeWidth={STROKE_W} strokeLinecap="round" />
      <line x1={vx} y1={vy} x2={secondEnd.x} y2={secondEnd.y} stroke={WHITE70} strokeWidth={STROKE_W} strokeLinecap="round" />
      <circle cx={vx} cy={vy} r={3} fill={WHITE90} />
      <path d={aPath} fill="none" stroke={WHITE90} strokeWidth={2.5} strokeLinecap="round"
        style={{ strokeDasharray: `${arcLen} 1000`, strokeDashoffset: mutation?.drawAngleArc ? arcLen : 0,
          animation: mutation?.drawAngleArc ? `drawArc 0.55s cubic-bezier(0.4,0,0.2,1) forwards` : undefined,
          "--arc-length": arcLen } as React.CSSProperties} />
      {isUnknown ? <UnknownPill x={labelX} y={labelY} /> : <SvgLabel x={labelX} y={labelY} text={`${angleDeg}°`} />}
    </svg>
  );
}

export function AngleSupplementary({ dims, mutation }: { dims: Record<string, number | string>; mutation?: SvgMutation }) {
  const aAngle = typeof dims.A === "number" ? dims.A : 53;
  const bAngle = 180 - aAngle;
  const unknownDim = dims.unknown as string | undefined;
  const vx = 110, vy = 85, rayLen = 80;
  const leftEnd = { x: vx - rayLen, y: vy }, rightEnd = { x: vx + rayLen, y: vy };
  const rad = (aAngle * Math.PI) / 180;
  const midEnd = { x: vx + rayLen * Math.cos(Math.PI - rad), y: vy - rayLen * Math.sin(rad) };
  const arcR = 32;
  const midArcX = vx + arcR * Math.cos(Math.PI - rad);
  const midArcY = vy - arcR * Math.sin(rad);
  const arcBPath = `M ${vx + arcR} ${vy} A ${arcR} ${arcR} 0 ${bAngle > 180 ? 1 : 0} 0 ${midArcX} ${midArcY}`;
  const arcAPath = `M ${midArcX} ${midArcY} A ${arcR} ${arcR} 0 ${aAngle > 180 ? 1 : 0} 0 ${vx - arcR} ${vy}`;
  const COLOR_A = "#5ee8ff"; // Cyan
  const COLOR_B = "#ffd45e"; // Yellow

  // Wedge fills
  const wr = 28;
  const mwx = vx + wr * Math.cos(Math.PI - rad);
  const mwy = vy - wr * Math.sin(rad);
  const wedgeA = `M ${vx} ${vy} L ${vx - wr} ${vy} A ${wr} ${wr} 0 ${aAngle > 180 ? 1 : 0} 1 ${mwx} ${mwy} Z`;
  const wedgeB = `M ${vx} ${vy} L ${mwx} ${mwy} A ${wr} ${wr} 0 ${bAngle > 180 ? 1 : 0} 1 ${vx + wr} ${vy} Z`;

  // Letter labels inside diagram arcs (just "A" and "B" — compact 11px font)
  const letterR = arcR + 14;
  const aMid = 180 - aAngle / 2;
  const aLx = vx + letterR * Math.cos(-(aMid * Math.PI) / 180);
  const aLy = vy + letterR * Math.sin(-(aMid * Math.PI) / 180);

  const bMid = bAngle / 2;
  const bLx = vx + letterR * Math.cos(-(bMid * Math.PI) / 180);
  const bLy = vy + letterR * Math.sin(-(bMid * Math.PI) / 180);

  const legendY = 120;

  return (
    <svg viewBox="0 0 220 140" className="w-full h-full" aria-hidden>
      <path d={wedgeA} fill={COLOR_A} fillOpacity={0.12} />
      <path d={wedgeB} fill={COLOR_B} fillOpacity={0.12} />
      <line x1={leftEnd.x} y1={leftEnd.y} x2={rightEnd.x} y2={rightEnd.y} stroke={WHITE70} strokeWidth={STROKE_W} strokeLinecap="round" />
      <line x1={vx} y1={vy} x2={midEnd.x} y2={midEnd.y} stroke={WHITE70} strokeWidth={STROKE_W} strokeLinecap="round" />
      <circle cx={vx} cy={vy} r={3} fill={WHITE90} />
      <path d={arcAPath} fill="none" stroke={COLOR_A} strokeWidth={2.5} strokeLinecap="round" strokeOpacity={0.85} />
      <path d={arcBPath} fill="none" stroke={COLOR_B} strokeWidth={2.5} strokeLinecap="round" strokeOpacity={0.85} />

      {/* Letter labels inside diagram arcs */}
      <SvgLabel x={aLx} y={aLy} text="A" size={11} color={COLOR_A} />
      <SvgLabel x={bLx} y={bLy} text="B" size={11} color={COLOR_B} />

      {/* Visually centered legend row below diagram */}
      <LegendValueToken x={60} y={legendY} label="A" value={aAngle} isUnknown={unknownDim === "A"} revealValue={mutation?.revealAnswer} color={COLOR_A} />
      <LegendValueToken x={148} y={legendY} label="B" value={bAngle} isUnknown={unknownDim === "B"} revealValue={mutation?.revealAnswer} color={COLOR_B} />
    </svg>
  );
}

export function AngleComplementary({ dims, mutation }: { dims: Record<string, number | string>; mutation?: SvgMutation }) {
  const aAngle = typeof dims.A === "number" ? dims.A : 34;
  const bAngle = 90 - aAngle;
  const unknownDim = dims.unknown as string | undefined;
  const vx = 55, vy = 90, rayLen = 80;
  const rightEnd = { x: vx + rayLen, y: vy }, upEnd = { x: vx, y: vy - rayLen };
  const rad = (aAngle * Math.PI) / 180;
  const midEnd = { x: vx + rayLen * Math.cos(-rad), y: vy + rayLen * Math.sin(-rad) };
  const arcR = 30;
  const midArcX = vx + arcR * Math.cos(-rad);
  const midArcY = vy + arcR * Math.sin(-rad);
  const arcAPath = `M ${vx + arcR} ${vy} A ${arcR} ${arcR} 0 0 0 ${midArcX} ${midArcY}`;
  const arcBPath = `M ${midArcX} ${midArcY} A ${arcR} ${arcR} 0 0 0 ${vx} ${vy - arcR}`;
  const COLOR_A = "#5ee8ff"; // Cyan
  const COLOR_B = "#ffd45e"; // Yellow

  // Wedge fills
  const wr = 26;
  const mwx = vx + wr * Math.cos(-rad);
  const mwy = vy + wr * Math.sin(-rad);
  const wedgeA = `M ${vx} ${vy} L ${vx + wr} ${vy} A ${wr} ${wr} 0 0 0 ${mwx} ${mwy} Z`;
  const wedgeB = `M ${vx} ${vy} L ${mwx} ${mwy} A ${wr} ${wr} 0 0 0 ${vx} ${vy - wr} Z`;

  // Letter labels inside diagram arcs
  const letterR = arcR + 14;
  const aMid = aAngle / 2;
  const aLx = vx + letterR * Math.cos((-aMid * Math.PI) / 180);
  const aLy = vy + letterR * Math.sin((-aMid * Math.PI) / 180);

  const bMid = aAngle + bAngle / 2;
  const bLx = vx + letterR * Math.cos((-bMid * Math.PI) / 180);
  const bLy = vy + letterR * Math.sin((-bMid * Math.PI) / 180);

  const legendY = 120;

  return (
    <svg viewBox="0 0 190 140" className="w-full h-full" aria-hidden>
      <path d={wedgeA} fill={COLOR_A} fillOpacity={0.12} />
      <path d={wedgeB} fill={COLOR_B} fillOpacity={0.12} />
      <rect x={vx} y={vy - 14} width={14} height={14} fill="none" stroke={WHITE50} strokeWidth={1.5} />
      <line x1={vx} y1={vy} x2={rightEnd.x} y2={rightEnd.y} stroke={WHITE70} strokeWidth={STROKE_W} strokeLinecap="round" />
      <line x1={vx} y1={vy} x2={upEnd.x} y2={upEnd.y} stroke={WHITE70} strokeWidth={STROKE_W} strokeLinecap="round" />
      <line x1={vx} y1={vy} x2={midEnd.x} y2={midEnd.y} stroke={WHITE70} strokeWidth={STROKE_W} strokeLinecap="round" />
      <circle cx={vx} cy={vy} r={3} fill={WHITE90} />
      <path d={arcAPath} fill="none" stroke={COLOR_A} strokeWidth={2.5} strokeLinecap="round" strokeOpacity={0.85} />
      <path d={arcBPath} fill="none" stroke={COLOR_B} strokeWidth={2.5} strokeLinecap="round" strokeOpacity={0.85} />

      {/* Letter labels inside diagram arcs */}
      <SvgLabel x={aLx} y={aLy} text="A" size={11} color={COLOR_A} />
      <SvgLabel x={bLx} y={bLy} text="B" size={11} color={COLOR_B} />

      {/* Visually centered legend row below diagram */}
      <LegendValueToken x={48} y={legendY} label="A" value={aAngle} isUnknown={unknownDim === "A"} revealValue={mutation?.revealAnswer} color={COLOR_A} />
      <LegendValueToken x={130} y={legendY} label="B" value={bAngle} isUnknown={unknownDim === "B"} revealValue={mutation?.revealAnswer} color={COLOR_B} />
    </svg>
  );
}

export function AngleVerticallyOpposite({ dims, mutation }: { dims: Record<string, number | string>; mutation?: SvgMutation }) {
  const aAngle = typeof dims.A === "number" ? dims.A : 42;
  const bAngle = 180 - aAngle;
  const unknownDim = dims.unknown as string | undefined;

  const COLOR_A = "#5ee8ff"; // Cyan
  const COLOR_B = "#ffd45e"; // Yellow
  // In calculation mode for C, use gold for C so A and C have unique colors!
  const COLOR_C = unknownDim ? COLOR_B : COLOR_A;

  const vx = 110, vy = 62, rayLen = 65;
  const rad = (aAngle * Math.PI) / 180;

  // Four ray endpoints
  const ends = [
    { x: vx + rayLen, y: vy },                                          // east
    { x: vx - rayLen, y: vy },                                          // west
    { x: vx + rayLen * Math.cos(-rad), y: vy + rayLen * Math.sin(-rad) }, // upper-right
    { x: vx - rayLen * Math.cos(-rad), y: vy - rayLen * Math.sin(-rad) }, // lower-left
  ];
  const arcR = 24;
  const eArcX = vx + arcR, eArcY = vy;
  const wArcX = vx - arcR, wArcY = vy;
  const urArcX = vx + arcR * Math.cos(-rad), urArcY = vy + arcR * Math.sin(-rad);
  const llArcX = vx - arcR * Math.cos(-rad), llArcY = vy - arcR * Math.sin(-rad);
  const la = aAngle > 180 ? 1 : 0, lb = bAngle > 180 ? 1 : 0;

  // A arcs: east→upper-right and west→lower-left
  const arcAPath1 = `M ${eArcX} ${eArcY} A ${arcR} ${arcR} 0 ${la} 0 ${urArcX} ${urArcY}`;
  const arcAPath2 = `M ${wArcX} ${wArcY} A ${arcR} ${arcR} 0 ${la} 0 ${llArcX} ${llArcY}`;
  // B arcs: upper-right→west and lower-left→east
  const arcBPath1 = `M ${urArcX} ${urArcY} A ${arcR} ${arcR} 0 ${lb} 0 ${wArcX} ${wArcY}`;
  const arcBPath2 = `M ${llArcX} ${llArcY} A ${arcR} ${arcR} 0 ${lb} 0 ${eArcX} ${eArcY}`;

  // Letter label positions inside/near diagram arcs
  const letterR = arcR + 12;
  const aMid = aAngle / 2;
  const aLx = vx + letterR * Math.cos((-aMid * Math.PI) / 180);
  const aLy = vy + letterR * Math.sin((-aMid * Math.PI) / 180);

  const bMid = aAngle + bAngle / 2;
  const bLx = vx + letterR * Math.cos((-bMid * Math.PI) / 180);
  const bLy = vy + letterR * Math.sin((-bMid * Math.PI) / 180);

  const cMid = 180 + aAngle / 2;
  const cLx = vx + letterR * Math.cos((-cMid * Math.PI) / 180);
  const cLy = vy + letterR * Math.sin((-cMid * Math.PI) / 180);

  const dMid = 180 + aAngle + bAngle / 2;
  const dLx = vx + letterR * Math.cos((-dMid * Math.PI) / 180);
  const dLy = vy + letterR * Math.sin((-dMid * Math.PI) / 180);

  const legendY = 118;

  return (
    <svg viewBox="0 0 220 140" className="w-full h-full" aria-hidden>
      <line x1={ends[0].x} y1={ends[0].y} x2={ends[1].x} y2={ends[1].y} stroke={WHITE70} strokeWidth={STROKE_W} strokeLinecap="round" />
      <line x1={ends[2].x} y1={ends[2].y} x2={ends[3].x} y2={ends[3].y} stroke={WHITE70} strokeWidth={STROKE_W} strokeLinecap="round" />
      <circle cx={vx} cy={vy} r={3} fill={WHITE90} />

      {/* Arcs: in calculation mode, only show the given angle A and target angle C in unique colors */}
      <path d={arcAPath1} fill="none" stroke={COLOR_A} strokeWidth={2.5} strokeLinecap="round" strokeOpacity={0.85} />
      <path d={arcAPath2} fill="none" stroke={COLOR_C} strokeWidth={2.5} strokeLinecap="round" strokeOpacity={0.85} />
      {!unknownDim && (
        <>
          <path d={arcBPath1} fill="none" stroke={COLOR_B} strokeWidth={2.5} strokeLinecap="round" strokeOpacity={0.85} />
          <path d={arcBPath2} fill="none" stroke={COLOR_B} strokeWidth={2.5} strokeLinecap="round" strokeOpacity={0.85} />
        </>
      )}

      {/* Letter labels inside diagram arcs */}
      <SvgLabel x={aLx} y={aLy} text="A" size={11} color={COLOR_A} />
      <SvgLabel x={cLx} y={cLy} text="C" size={11} color={COLOR_C} />
      {!unknownDim && (
        <>
          <SvgLabel x={bLx} y={bLy} text="B" size={11} color={COLOR_B} />
          <SvgLabel x={dLx} y={dLy} text="D" size={11} color={COLOR_B} />
        </>
      )}

      {/* Visually centered legend row below diagram */}
      <LegendValueToken
        x={60}
        y={legendY}
        label="A"
        value={aAngle}
        isUnknown={unknownDim === "A"}
        revealValue={mutation?.revealAnswer}
        color={COLOR_A}
      />
      <LegendValueToken
        x={148}
        y={legendY}
        label={unknownDim === "B" || unknownDim === "D" ? "B" : "C"}
        value={unknownDim === "B" || unknownDim === "D" ? bAngle : aAngle}
        isUnknown={Boolean(unknownDim && (unknownDim === "C" || unknownDim === "B" || unknownDim === "D"))}
        revealValue={mutation?.revealAnswer}
        color={COLOR_C}
      />
    </svg>
  );
}

export function AngleReflex({ dims }: { dims: Record<string, number | string> }) {
  const angles = typeof dims.angles === "string" ? (dims.angles as string).split(",").map(Number) : [200, 270, 330];
  return (
    <svg viewBox="0 0 220 200" className="w-full h-full" aria-hidden>
      {angles.map((angleDeg, i) => {
        const localVx = [55, 110, 165][i], localVy = 140;
        const rad = (angleDeg * Math.PI) / 180;
        const displayAngle = 360 - angleDeg;
        const reflexPath = arcPath(localVx, localVy, 28, 0, displayAngle);
        return (
          <g key={i}>
            <line x1={localVx} y1={localVy} x2={localVx + 40} y2={localVy} stroke="rgba(255,255,255,0.6)" strokeWidth={1.5} strokeLinecap="round" />
            <line x1={localVx} y1={localVy} x2={localVx + 40 * Math.cos(-rad)} y2={localVy + 40 * Math.sin(-rad)} stroke="rgba(255,255,255,0.6)" strokeWidth={1.5} strokeLinecap="round" />
            <path d={reflexPath} fill="none" stroke="rgba(255,200,80,0.85)" strokeWidth={2} strokeLinecap="round" />
            <text x={localVx} y={localVy - 38} textAnchor="middle" fontSize={11} fontWeight="600" fill={WHITE90} fontFamily={LABEL_FONT}>{angleDeg}°</text>
          </g>
        );
      })}
      <text x={110} y={185} textAnchor="middle" fontSize={12} fill="rgba(255,255,255,0.6)" fontFamily={LABEL_FONT}>180° &lt; reflex &lt; 360°</text>
    </svg>
  );
}

export function AngleParallelAlternate({ dims }: { dims: Record<string, number | string> }) {
  const angle = typeof dims.angle === "number" ? dims.angle : 55;
  const rad = (angle * Math.PI) / 180;
  const ar = 22;
  // Upper intersection: east → upper-right. CCW on screen = sweep=0.
  const u1x = 80 + ar * Math.cos(-rad), u1y = 60 + ar * Math.sin(-rad);
  const arcTop = `M ${80 + ar} ${60} A ${ar} ${ar} 0 0 0 ${u1x} ${u1y}`;
  // Lower intersection: alternate angle is west → lower-left. CW on screen = sweep=1.
  const u2x = 140 - ar * Math.cos(-rad), u2y = 140 - ar * Math.sin(-rad);
  const arcBot = `M ${140 - ar} ${140} A ${ar} ${ar} 0 0 1 ${u2x} ${u2y}`;
  return (
    <svg viewBox="0 0 220 200" className="w-full h-full" aria-hidden>
      <line x1={20} y1={60} x2={200} y2={60} stroke={WHITE70} strokeWidth={STROKE_W} />
      <line x1={20} y1={140} x2={200} y2={140} stroke={WHITE70} strokeWidth={STROKE_W} />
      <line x1={95} y1={52} x2={105} y2={68} stroke={WHITE50} strokeWidth={1.5} />
      <line x1={95} y1={132} x2={105} y2={148} stroke={WHITE50} strokeWidth={1.5} />
      <line x1={60} y1={20} x2={160} y2={180} stroke="rgba(255,220,100,0.8)" strokeWidth={2} />
      <path d={arcTop} fill="none" stroke="rgba(255,220,100,0.9)" strokeWidth={2.5} strokeLinecap="round" />
      <path d={arcBot} fill="none" stroke="rgba(255,220,100,0.9)" strokeWidth={2.5} strokeLinecap="round" />
      <text x={78} y={50} textAnchor="middle" fontSize={12} fontWeight="600" fill={WHITE90} fontFamily={LABEL_FONT}>{angle}°</text>
      <text x={144} y={170} textAnchor="middle" fontSize={12} fontWeight="600" fill={WHITE90} fontFamily={LABEL_FONT}>{angle}°</text>
      <text x={110} y={195} textAnchor="middle" fontSize={11} fill={WHITE50} fontFamily={LABEL_FONT}>alternate angles equal</text>
    </svg>
  );
}

export function AngleParallelCointerior({ dims }: { dims: Record<string, number | string> }) {
  const aAngle = typeof dims.A === "number" ? dims.A : 110;
  const bAngle = 180 - aAngle;
  const radA = (aAngle * Math.PI) / 180;
  const radB = (bAngle * Math.PI) / 180;
  const ar = 24;
  // Upper intersection at (103, 60): arc from west → upper-left. CCW = sweep=0.
  const aArcEx = 103 + ar * Math.cos(Math.PI - radA); // = 103 - ar*cos(radA)
  const aArcEy = 60 - ar * Math.sin(radA);
  const arcA = `M ${103 - ar} ${60} A ${ar} ${ar} 0 ${aAngle > 180 ? 1 : 0} 0 ${aArcEx} ${aArcEy}`;
  // Lower intersection at (137, 140): arc from east → upper-right. CCW = sweep=0.
  const bArcEx = 137 + ar * Math.cos(-radB);
  const bArcEy = 140 + ar * Math.sin(-radB); // = 140 - ar*sin(radB)
  const arcB = `M ${137 + ar} ${140} A ${ar} ${ar} 0 0 0 ${bArcEx} ${bArcEy}`;
  return (
    <svg viewBox="0 0 220 200" className="w-full h-full" aria-hidden>
      <line x1={20} y1={60} x2={200} y2={60} stroke={WHITE70} strokeWidth={STROKE_W} />
      <line x1={20} y1={140} x2={200} y2={140} stroke={WHITE70} strokeWidth={STROKE_W} />
      <line x1={95} y1={52} x2={105} y2={68} stroke={WHITE50} strokeWidth={1.5} />
      <line x1={95} y1={132} x2={105} y2={148} stroke={WHITE50} strokeWidth={1.5} />
      <line x1={70} y1={20} x2={150} y2={180} stroke="rgba(180,220,255,0.8)" strokeWidth={2} />
      <path d={arcA} fill="none" stroke="rgba(180,220,255,0.9)" strokeWidth={2.5} strokeLinecap="round" />
      <path d={arcB} fill="none" stroke="rgba(180,220,255,0.9)" strokeWidth={2.5} strokeLinecap="round" />
      <text x={130} y={53} textAnchor="start" fontSize={12} fontWeight="600" fill={WHITE90} fontFamily={LABEL_FONT}>A = {aAngle}°</text>
      <text x={132} y={160} textAnchor="start" fontSize={12} fontWeight="600" fill={WHITE90} fontFamily={LABEL_FONT}>B = {bAngle}°</text>
      <text x={110} y={195} textAnchor="middle" fontSize={11} fill={WHITE50} fontFamily={LABEL_FONT}>A + B = 180°</text>
    </svg>
  );
}
