"use client";

import React from "react";
import type { SvgDescriptor, SvgMutation } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Shared constants & helpers
// ─────────────────────────────────────────────────────────────────────────────

const LABEL_FONT = "inherit";
const LABEL_SIZE = 13;
const STROKE_W = 2;
const WHITE70 = "rgba(255,255,255,0.70)";
const WHITE90 = "rgba(255,255,255,0.90)";
const WHITE50 = "rgba(255,255,255,0.50)";
const WHITE25 = "rgba(255,255,255,0.25)";
const FILL_COLOR = "rgba(255,255,255,0.18)";

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end   = polarToCartesian(cx, cy, r, startAngle);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 0 ${end.x} ${end.y}`;
}

function SvgLabel({ x, y, text, size = LABEL_SIZE, opacity = 0.95, color }: {
  x: number; y: number; text: string; size?: number; opacity?: number; color?: string;
}) {
  const rx = Math.round(x * 100) / 100;
  const ry = Math.round(y * 100) / 100;
  const fill = color ?? `rgba(255,255,255,${opacity})`;
  return (
    <text x={rx} y={ry} textAnchor="middle" fontSize={size} fontWeight="600"
      fill={fill} fontFamily={LABEL_FONT}>{text}</text>
  );
}

function UnknownPill({
  x,
  y,
  label,
  revealValue,
  color,
  unit = "°",
}: {
  x: number;
  y: number;
  label?: string;
  revealValue?: number;
  color?: string;
  unit?: string;
}) {
  const rx = Math.round(x * 100) / 100;
  const ry = Math.round(y * 100) / 100;
  const isRevealed = revealValue != null;
  const pillW = 34;
  const pillH = 22;
  const labelColor = color ?? "white";

  const labelText = label ? `${label} = ` : "";
  const pillCx = label ? rx + 16 : rx;
  const labelX = label ? rx - 4 : rx;

  const displayAnswer = isRevealed ? `${revealValue}${unit}` : "";

  return (
    <g>
      {label && (
        <text
          x={labelX}
          y={ry + 4}
          textAnchor="end"
          fontSize={13}
          fontWeight="700"
          fill={labelColor}
          fontFamily={LABEL_FONT}
        >
          {labelText}
        </text>
      )}

      {/* Revealed answer */}
      <text
        x={pillCx}
        y={ry + 4}
        textAnchor={label ? "start" : "middle"}
        fontSize={14}
        fontWeight="700"
        fill={labelColor}
        fontFamily={LABEL_FONT}
        style={{
          opacity: isRevealed ? 1 : 0,
          transition: "opacity 0.4s ease 0.15s",
        }}
      >
        {displayAnswer}
      </text>

      {/* Glassmorphic ? badge */}
      <g
        style={{
          opacity: isRevealed ? 0 : 1,
          transform: isRevealed ? "scale(0.75)" : "scale(1)",
          transformOrigin: `${pillCx}px ${ry}px`,
          transition: "opacity 0.3s ease, transform 0.3s ease",
        }}
      >
        <rect
          x={pillCx - pillW / 2}
          y={ry - pillH / 2}
          width={pillW}
          height={pillH}
          rx={pillH / 2}
          fill="rgba(255,255,255,0.22)"
          stroke="rgba(255,255,255,0.65)"
          strokeWidth={1.5}
        />
        <text
          x={pillCx}
          y={ry + 4}
          textAnchor="middle"
          fontSize={14}
          fontWeight="800"
          fill="rgba(255,255,255,0.95)"
          fontFamily={LABEL_FONT}
        >
          ?
        </text>
      </g>
    </g>
  );
}

function DimLine({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={WHITE50} strokeWidth={1.5} strokeDasharray="4 3" />;
}

function TickMark({ x, y, angle = 0 }: { x: number; y: number; angle?: number }) {
  const rad = (angle * Math.PI) / 180;
  const len = 6;
  return <line x1={x - len * Math.sin(rad)} y1={y + len * Math.cos(rad)}
    x2={x + len * Math.sin(rad)} y2={y - len * Math.cos(rad)}
    stroke={WHITE90} strokeWidth={2} strokeLinecap="round" />;
}

// ─────────────────────────────────────────────────────────────────────────────
// ANGLE SHAPES (Phase 1)
// ─────────────────────────────────────────────────────────────────────────────

function AngleSingle({ dims, mutation }: { dims: Record<string, number | string>; mutation?: SvgMutation }) {
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

function LegendValueToken({
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

function AngleSupplementary({ dims, mutation }: { dims: Record<string, number | string>; mutation?: SvgMutation }) {
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
  const COLOR_A = "#5ee8ff";
  const COLOR_B = "#ffd45e";

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

function AngleComplementary({ dims, mutation }: { dims: Record<string, number | string>; mutation?: SvgMutation }) {
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
  const COLOR_A = "#5ee8ff";
  const COLOR_B = "#ffd45e";

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

function AngleVerticallyOpposite({ dims, mutation }: { dims: Record<string, number | string>; mutation?: SvgMutation }) {
  const aAngle = typeof dims.A === "number" ? dims.A : 42;
  const bAngle = 180 - aAngle;
  const unknownDim = dims.unknown as string | undefined;
  const vx = 110, vy = 90, rayLen = 85;
  const rad = (aAngle * Math.PI) / 180;
  // Four ray endpoints
  const ends = [
    { x: vx + rayLen, y: vy },                                          // east
    { x: vx - rayLen, y: vy },                                          // west
    { x: vx + rayLen * Math.cos(-rad), y: vy + rayLen * Math.sin(-rad) }, // upper-right
    { x: vx - rayLen * Math.cos(-rad), y: vy - rayLen * Math.sin(-rad) }, // lower-left
  ];
  const arcR = 28;
  // Arc points on each ray at distance arcR
  const eArcX = vx + arcR, eArcY = vy;                               // east
  const wArcX = vx - arcR, wArcY = vy;                               // west
  const urArcX = vx + arcR * Math.cos(-rad), urArcY = vy + arcR * Math.sin(-rad); // upper-right
  const llArcX = vx - arcR * Math.cos(-rad), llArcY = vy - arcR * Math.sin(-rad); // lower-left
  const la = aAngle > 180 ? 1 : 0, lb = bAngle > 180 ? 1 : 0;
  // A arcs: east→upper-right (sweep=0, CCW=upward) and west→lower-left (sweep=1, CW=downward)
  const arcAPath1 = `M ${eArcX} ${eArcY} A ${arcR} ${arcR} 0 ${la} 0 ${urArcX} ${urArcY}`;
  const arcAPath2 = `M ${wArcX} ${wArcY} A ${arcR} ${arcR} 0 ${la} 1 ${llArcX} ${llArcY}`;
  // B arcs: upper-right→west (sweep=0, CCW=through north) and lower-left→east (sweep=1, CW=through south)
  const arcBPath1 = `M ${urArcX} ${urArcY} A ${arcR} ${arcR} 0 ${lb} 0 ${wArcX} ${wArcY}`;
  const arcBPath2 = `M ${llArcX} ${llArcY} A ${arcR} ${arcR} 0 ${lb} 1 ${eArcX} ${eArcY}`;
  return (
    <svg viewBox="0 0 220 180" className="w-full h-full" aria-hidden>
      <line x1={ends[0].x} y1={ends[0].y} x2={ends[1].x} y2={ends[1].y} stroke={WHITE70} strokeWidth={STROKE_W} strokeLinecap="round" />
      <line x1={ends[2].x} y1={ends[2].y} x2={ends[3].x} y2={ends[3].y} stroke={WHITE70} strokeWidth={STROKE_W} strokeLinecap="round" />
      <circle cx={vx} cy={vy} r={3} fill={WHITE90} />
      <path d={arcAPath1} fill="none" stroke="rgba(255,220,100,0.9)" strokeWidth={2.5} strokeLinecap="round" />
      <path d={arcAPath2} fill="none" stroke="rgba(255,220,100,0.9)" strokeWidth={2.5} strokeLinecap="round" />
      <path d={arcBPath1} fill="none" stroke="rgba(180,220,255,0.75)" strokeWidth={2.5} strokeLinecap="round" />
      <path d={arcBPath2} fill="none" stroke="rgba(180,220,255,0.75)" strokeWidth={2.5} strokeLinecap="round" />
      <SvgLabel x={vx + arcR + 20} y={vy - 8} text={`A = ${aAngle}°`} />
      {unknownDim === "C" ? (
        <UnknownPill x={vx - arcR - 22} y={vy + 12} label="C" unit="°" revealValue={mutation?.revealAnswer} />
      ) : (
        <SvgLabel x={vx - arcR - 22} y={vy + 16} text={`C = ${aAngle}°`} />
      )}
      <SvgLabel x={vx - arcR - 22} y={vy - 8} text={`B = ${bAngle}°`} />
      <SvgLabel x={vx + arcR + 20} y={vy + 16} text={`D = ${bAngle}°`} />
      <text x={110} y={175} textAnchor="middle" fontSize={11} fill={WHITE50} fontFamily={LABEL_FONT}>A = C,  B = D</text>
    </svg>
  );
}

function AngleReflex({ dims }: { dims: Record<string, number | string> }) {
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

function AngleParallelAlternate({ dims }: { dims: Record<string, number | string> }) {
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

function AngleParallelCointerior({ dims }: { dims: Record<string, number | string> }) {
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

// ─────────────────────────────────────────────────────────────────────────────
// TRIANGLE SHAPES (Phase 2)
// ─────────────────────────────────────────────────────────────────────────────

function Triangle({ dims, mutation }: { dims: Record<string, number | string>; mutation?: SvgMutation }) {
  const lm = dims.labelMode as string ?? "numeric";
  const b = dims.b, h = dims.h;
  const a = dims.a, c = dims.c;
  const style = (dims.style as string) ?? "scalene"; // scalene | isosceles | equilateral
  const unknownDim = dims.unknown as string | undefined;
  const filled = mutation?.fillInterior;

  // Vertices: base centered, apex above
  const cx = 110;
  const baseY = 155, topY = 40;
  let x1: number, x2: number, x3: number;

  if (style === "equilateral") {
    const hw = 75;
    x1 = cx - hw; x2 = cx + hw; x3 = cx;
  } else if (style === "isosceles") {
    x1 = cx - 70; x2 = cx + 70; x3 = cx;
  } else {
    // scalene
    x1 = 30; x2 = 185; x3 = cx - 20;
  }

  const pts = `${x1},${baseY} ${x2},${baseY} ${x3},${topY}`;

  // Side lengths for labeling
  const bLen = Math.round(x2 - x1);
  const hLen = Math.round(baseY - topY);

  return (
    <svg viewBox="0 0 220 190" className="w-full h-full" aria-hidden>
      {filled && <polygon points={pts} fill={FILL_COLOR} />}
      <polygon points={pts} fill="none" stroke={WHITE90} strokeWidth={STROKE_W} strokeLinejoin="round" />

      {/* Tick marks for equilateral/isosceles */}
      {style === "equilateral" && (
        <>
          <TickMark x={(x1 + x3) / 2} y={(baseY + topY) / 2} angle={-50} />
          <TickMark x={(x2 + x3) / 2} y={(baseY + topY) / 2} angle={50} />
          <TickMark x={(x1 + x2) / 2} y={baseY} angle={0} />
        </>
      )}
      {style === "isosceles" && (
        <>
          <TickMark x={(x1 + x3) / 2} y={(baseY + topY) / 2} angle={-50} />
          <TickMark x={(x2 + x3) / 2} y={(baseY + topY) / 2} angle={50} />
        </>
      )}

      {/* Height dashed line */}
      {(lm === "numeric" || lm === "variable") && (
        <DimLine x1={x3} y1={topY} x2={x3} y2={baseY} />
      )}

      {/* Labels */}
      {lm === "numeric" && (
        <>
          {unknownDim === "A" ? <UnknownPill x={cx} y={topY - 14} /> : <SvgLabel x={cx} y={topY - 14} text={`A = ?`} />}
          {b !== undefined && <SvgLabel x={(x1 + x2) / 2} y={baseY + 16} text={`b = ${b}`} />}
          {h !== undefined && <SvgLabel x={x3 + 22} y={(baseY + topY) / 2 + 5} text={`h = ${h}`} />}
          {a !== undefined && <SvgLabel x={x1 - 12} y={(baseY + topY) / 2} text={`${a}`} />}
          {c !== undefined && <SvgLabel x={x2 + 12} y={(baseY + topY) / 2} text={`${c}`} />}
        </>
      )}
      {lm === "variable" && (
        <>
          <SvgLabel x={(x1 + x2) / 2} y={baseY + 16} text="b" />
          <SvgLabel x={x3 + 22} y={(baseY + topY) / 2 + 5} text="h" />
          {unknownDim === "A" ? <UnknownPill x={cx + 30} y={topY - 5} /> : <SvgLabel x={cx + 30} y={topY - 5} text="A = ?" />}
        </>
      )}

      {/* Angle labels for angle-sum cards */}
      {dims.angA !== undefined && (
        <>
          <SvgLabel x={x1 + 16} y={baseY - 10} text={`${dims.angA}°`} size={12} />
          <SvgLabel x={x2 - 16} y={baseY - 10} text={`${dims.angB}°`} size={12} />
          {unknownDim === "C"
            ? <UnknownPill x={x3} y={topY + 18} />
            : <SvgLabel x={x3} y={topY + 18} text={`C = ?`} size={12} />}
        </>
      )}
    </svg>
  );
}

function RightTriangle({ dims, mutation }: { dims: Record<string, number | string>; mutation?: SvgMutation }) {
  const lm = dims.labelMode as string ?? "numeric";
  const a = dims.a, b = dims.b, c_val = dims.c;
  const unknownDim = dims.unknown as string | undefined;
  const highlightHyp = mutation?.traceStroke === "hypotenuse";

  // Right angle at bottom-left
  const x1 = 40, y1 = 155; // bottom-left (right angle)
  const x2 = 175, y2 = 155; // bottom-right
  const x3 = 40, y3 = 50;   // top-left

  const hypLen = Math.sqrt((x2 - x3) ** 2 + (y2 - y3) ** 2);

  return (
    <svg viewBox="0 0 220 190" className="w-full h-full" aria-hidden>
      {mutation?.fillInterior && <polygon points={`${x1},${y1} ${x2},${y2} ${x3},${y3}`} fill={FILL_COLOR} />}
      <polygon points={`${x1},${y1} ${x2},${y2} ${x3},${y3}`} fill="none" stroke={WHITE90} strokeWidth={STROKE_W} strokeLinejoin="round" />
      {/* Right angle marker */}
      <rect x={x1} y={y1 - 14} width={14} height={14} fill="none" stroke={WHITE70} strokeWidth={1.5} />
      {/* Hypotenuse highlight */}
      {highlightHyp && (
        <line x1={x2} y1={y2} x2={x3} y2={y3} stroke="rgba(255,220,100,0.9)" strokeWidth={3.5} strokeLinecap="round"
          style={{ strokeDasharray: `${hypLen} ${hypLen}`, strokeDashoffset: hypLen,
            animation: `drawArc 0.7s cubic-bezier(0.4,0,0.2,1) forwards`, "--arc-length": hypLen } as React.CSSProperties} />
      )}
      {/* Labels */}
      {lm === "numeric" && (
        <>
          {a !== undefined && (unknownDim === "a" ? <UnknownPill x={x1 - 14} y={(y1 + y3) / 2} /> : <SvgLabel x={x1 - 14} y={(y1 + y3) / 2} text={`a = ${a}`} />)}
          {b !== undefined && (unknownDim === "b" ? <UnknownPill x={(x1 + x2) / 2} y={y1 + 16} /> : <SvgLabel x={(x1 + x2) / 2} y={y1 + 16} text={`b = ${b}`} />)}
          {c_val !== undefined && (unknownDim === "c" ? <UnknownPill x={(x2 + x3) / 2 + 10} y={(y2 + y3) / 2} /> : <SvgLabel x={(x2 + x3) / 2 + 10} y={(y2 + y3) / 2} text={`c = ${c_val}`} />)}
        </>
      )}
      {lm === "variable" && (
        <>
          <SvgLabel x={x1 - 10} y={(y1 + y3) / 2} text="a" />
          <SvgLabel x={(x1 + x2) / 2} y={y1 + 16} text="b" />
          {unknownDim === "c" ? <UnknownPill x={(x2 + x3) / 2 + 14} y={(y2 + y3) / 2} /> : <SvgLabel x={(x2 + x3) / 2 + 14} y={(y2 + y3) / 2} text="c = ?" />}
        </>
      )}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// QUADRILATERAL SHAPES (Phase 3)
// ─────────────────────────────────────────────────────────────────────────────

function Rectangle({ dims, mutation }: { dims: Record<string, number | string>; mutation?: SvgMutation }) {
  const lm = dims.labelMode as string ?? "numeric";
  const l = dims.l, w = dims.w;
  const unknownDim = dims.unknown as string | undefined;
  const filled = mutation?.fillInterior;
  const glowPerim = mutation?.traceStroke === "perimeter";

  const x1 = 35, y1 = 55, rw = 150, rh = 90;
  const x2 = x1 + rw, y2 = y1 + rh;

  return (
    <svg viewBox="0 0 220 190" className="w-full h-full" aria-hidden>
      {filled && <rect x={x1} y={y1} width={rw} height={rh} fill={FILL_COLOR} />}
      {glowPerim && (
        <rect x={x1} y={y1} width={rw} height={rh} fill="none"
          stroke="rgba(255,220,100,0.85)" strokeWidth={4} strokeLinejoin="round"
          style={{ strokeDasharray: `${2 * (rw + rh)} ${2 * (rw + rh)}`, strokeDashoffset: 2 * (rw + rh),
            animation: `drawArc 1.2s cubic-bezier(0.4,0,0.2,1) forwards`, "--arc-length": 2 * (rw + rh) } as React.CSSProperties} />
      )}
      <rect x={x1} y={y1} width={rw} height={rh} fill="none" stroke={WHITE90} strokeWidth={STROKE_W} />
      {/* Right-angle markers */}
      <rect x={x1} y={y1} width={10} height={10} fill="none" stroke={WHITE50} strokeWidth={1} />
      <rect x={x2 - 10} y={y1} width={10} height={10} fill="none" stroke={WHITE50} strokeWidth={1} />
      <rect x={x1} y={y2 - 10} width={10} height={10} fill="none" stroke={WHITE50} strokeWidth={1} />
      <rect x={x2 - 10} y={y2 - 10} width={10} height={10} fill="none" stroke={WHITE50} strokeWidth={1} />
      {lm === "numeric" && (
        <>
          {l !== undefined && (unknownDim === "l" ? <UnknownPill x={(x1 + x2) / 2} y={y1 - 14} /> : <SvgLabel x={(x1 + x2) / 2} y={y1 - 14} text={`l = ${l}`} />)}
          {w !== undefined && (unknownDim === "w" ? <UnknownPill x={x2 + 18} y={(y1 + y2) / 2} /> : <SvgLabel x={x2 + 18} y={(y1 + y2) / 2} text={`w = ${w}`} />)}
          {dims.A !== undefined && (unknownDim === "A" ? <UnknownPill x={(x1 + x2) / 2} y={(y1 + y2) / 2} /> : <SvgLabel x={(x1 + x2) / 2} y={(y1 + y2) / 2 + 4} text={`A = ${dims.A}`} />)}
        </>
      )}
      {lm === "variable" && (
        <>
          <SvgLabel x={(x1 + x2) / 2} y={y1 - 14} text="l" />
          <SvgLabel x={x2 + 14} y={(y1 + y2) / 2} text="w" />
          {unknownDim === "A" ? <UnknownPill x={(x1 + x2) / 2} y={(y1 + y2) / 2} /> : <SvgLabel x={(x1 + x2) / 2} y={(y1 + y2) / 2 + 4} text="A = ?" />}
          {unknownDim === "P" ? <UnknownPill x={(x1 + x2) / 2} y={(y1 + y2) / 2} /> : null}
        </>
      )}
    </svg>
  );
}

function Parallelogram({ dims, mutation }: { dims: Record<string, number | string>; mutation?: SvgMutation }) {
  const lm = dims.labelMode as string ?? "numeric";
  const b = dims.b, h = dims.h;
  const unknownDim = dims.unknown as string | undefined;
  const filled = mutation?.fillInterior;

  const skew = 35;
  const x1 = 30, y1 = 150, bw = 140, bh = 80;
  const pts = `${x1 + skew},${y1 - bh} ${x1 + skew + bw},${y1 - bh} ${x1 + bw},${y1} ${x1},${y1}`;

  return (
    <svg viewBox="0 0 220 180" className="w-full h-full" aria-hidden>
      {filled && <polygon points={pts} fill={FILL_COLOR} />}
      <polygon points={pts} fill="none" stroke={WHITE90} strokeWidth={STROKE_W} strokeLinejoin="round" />
      {/* Height dashed line */}
      <DimLine x1={x1 + skew} y1={y1 - bh} x2={x1 + skew} y2={y1} />
      {/* Parallel tick marks */}
      <TickMark x={(x1 + x1 + skew) / 2 + bw / 2} y={y1 - bh / 2 + 10} angle={60} />
      <TickMark x={(x1 + x1 + skew) / 2 + bw / 2 + 8} y={y1 - bh / 2 + 10} angle={60} />
      <TickMark x={(x1 + x1 + skew) / 2 - bw / 2 + 10} y={y1 - bh / 2 + 10} angle={60} />
      <TickMark x={(x1 + x1 + skew) / 2 - bw / 2 + 18} y={y1 - bh / 2 + 10} angle={60} />
      {lm === "numeric" && (
        <>
          {b !== undefined && <SvgLabel x={(x1 + x1 + bw) / 2} y={y1 + 16} text={`b = ${b}`} />}
          {h !== undefined && <SvgLabel x={x1 + skew - 20} y={y1 - bh / 2 + 5} text={`h = ${h}`} />}
          {unknownDim === "A" ? <UnknownPill x={x1 + skew + bw / 2} y={y1 - bh / 2} /> : null}
        </>
      )}
      {lm === "variable" && (
        <>
          <SvgLabel x={(x1 + x1 + bw) / 2} y={y1 + 16} text="b" />
          <SvgLabel x={x1 + skew - 20} y={y1 - bh / 2 + 5} text="h" />
          {unknownDim === "A" ? <UnknownPill x={x1 + skew + bw / 2} y={y1 - bh / 2} /> : <SvgLabel x={x1 + skew + bw / 2} y={y1 - bh / 2} text="A = ?" />}
        </>
      )}
    </svg>
  );
}

function Trapezoid({ dims, mutation }: { dims: Record<string, number | string>; mutation?: SvgMutation }) {
  const lm = dims.labelMode as string ?? "numeric";
  const a = dims.a, b = dims.b, h = dims.h;
  const unknownDim = dims.unknown as string | undefined;
  const filled = mutation?.fillInterior;

  const bBase = 150, topW = 90, baseY = 155, topY = 75;
  const xBase1 = 35, xBase2 = xBase1 + bBase;
  const xTop1 = (220 - topW) / 2, xTop2 = xTop1 + topW;
  const pts = `${xTop1},${topY} ${xTop2},${topY} ${xBase2},${baseY} ${xBase1},${baseY}`;

  return (
    <svg viewBox="0 0 220 190" className="w-full h-full" aria-hidden>
      {filled && <polygon points={pts} fill={FILL_COLOR} />}
      <polygon points={pts} fill="none" stroke={WHITE90} strokeWidth={STROKE_W} strokeLinejoin="round" />
      {/* Parallel tick marks on top & bottom */}
      <TickMark x={(xTop1 + xTop2) / 2} y={topY} angle={0} />
      <TickMark x={(xBase1 + xBase2) / 2 - 6} y={baseY} angle={0} />
      <TickMark x={(xBase1 + xBase2) / 2 + 6} y={baseY} angle={0} />
      {/* Height dashed line */}
      <DimLine x1={xTop2 + 12} y1={topY} x2={xTop2 + 12} y2={baseY} />
      {lm === "numeric" && (
        <>
          {a !== undefined && <SvgLabel x={(xTop1 + xTop2) / 2} y={topY - 14} text={`a = ${a}`} />}
          {b !== undefined && <SvgLabel x={(xBase1 + xBase2) / 2} y={baseY + 16} text={`b = ${b}`} />}
          {h !== undefined && <SvgLabel x={xTop2 + 28} y={(topY + baseY) / 2} text={`h = ${h}`} />}
          {unknownDim === "A" ? <UnknownPill x={110} y={(topY + baseY) / 2} /> : null}
        </>
      )}
      {lm === "variable" && (
        <>
          <SvgLabel x={(xTop1 + xTop2) / 2} y={topY - 14} text="a" />
          <SvgLabel x={(xBase1 + xBase2) / 2} y={baseY + 16} text="b" />
          <SvgLabel x={xTop2 + 28} y={(topY + baseY) / 2} text="h" />
          {unknownDim === "A" ? <UnknownPill x={110} y={(topY + baseY) / 2} /> : <SvgLabel x={110} y={(topY + baseY) / 2} text="A = ?" />}
        </>
      )}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CIRCLE (Phase 4)
// ─────────────────────────────────────────────────────────────────────────────

function Circle({ dims, mutation }: { dims: Record<string, number | string>; mutation?: SvgMutation }) {
  const lm = dims.labelMode as string ?? "numeric";
  const r = dims.r, cVal = dims.C, aVal = dims.A;
  const unknownDim = dims.unknown as string | undefined;
  const filled = mutation?.fillInterior;
  const traceCirc = mutation?.traceStroke === "circumference";

  const cx = 110, cy = 95, cr = 70;
  const circum = 2 * Math.PI * cr;

  return (
    <svg viewBox="0 0 220 190" className="w-full h-full" aria-hidden>
      {filled && <circle cx={cx} cy={cy} r={cr} fill={FILL_COLOR} />}
      {traceCirc && (
        <circle cx={cx} cy={cy} r={cr} fill="none" stroke="rgba(255,220,100,0.85)" strokeWidth={4}
          style={{ strokeDasharray: `${circum} ${circum}`, strokeDashoffset: circum,
            animation: `drawArc 1.2s cubic-bezier(0.4,0,0.2,1) forwards`, "--arc-length": circum } as React.CSSProperties} />
      )}
      <circle cx={cx} cy={cy} r={cr} fill="none" stroke={WHITE90} strokeWidth={STROKE_W} />
      {/* Center dot */}
      <circle cx={cx} cy={cy} r={3} fill={WHITE90} />
      {/* Radius line */}
      <line x1={cx} y1={cy} x2={cx + cr} y2={cy} stroke={WHITE70} strokeWidth={STROKE_W} strokeDasharray="5 4" />
      {/* Diameter line (if shown) */}
      {dims.showDiameter && <line x1={cx - cr} y1={cy} x2={cx + cr} y2={cy} stroke={WHITE70} strokeWidth={STROKE_W} />}

      {lm === "numeric" && (
        <>
          {/* Always show radius when known */}
          {r !== undefined && unknownDim !== "r" && (
            <SvgLabel x={cx + cr / 2} y={cy - 14} text={`radius (r) = ${r}`} size={11} />
          )}
          {/* Given C or A values (reverse problems) */}
          {cVal !== undefined && <SvgLabel x={cx} y={cy - cr - 14} text={`circumference (C) = ${cVal}`} size={11} />}
          {aVal !== undefined && <SvgLabel x={cx} y={cy - cr - 14} text={`area (A) = ${aVal}`} size={11} />}
        </>
      )}
      {lm === "variable" && (
        <>
          <SvgLabel x={cx + cr / 2} y={cy - 14} text="radius (r)" size={11} />
        </>
      )}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// POLYGON (Phase 5)
// ─────────────────────────────────────────────────────────────────────────────

function Polygon({ dims, mutation }: { dims: Record<string, number | string>; mutation?: SvgMutation }) {
  const n = typeof dims.n === "number" ? dims.n : 5;
  const s = dims.s;
  const lm = dims.labelMode as string ?? "numeric";
  const unknownDim = dims.unknown as string | undefined;
  const filled = mutation?.fillInterior;

  const cx = 110, cy = 98, r = 70;

  // Generate polygon vertices (top-pointing)
  const vertices = Array.from({ length: n }, (_, i) => {
    const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });
  const pts = vertices.map(v => `${v.x},${v.y}`).join(" ");

  // Perimeter glow
  const glowPerim = mutation?.traceStroke === "perimeter";
  const perimLen = n * 2 * r * Math.sin(Math.PI / n);

  return (
    <svg viewBox="0 0 220 190" className="w-full h-full" aria-hidden>
      {filled && <polygon points={pts} fill={FILL_COLOR} />}
      {glowPerim && (
        <polygon points={pts} fill="none" stroke="rgba(255,220,100,0.85)" strokeWidth={4} strokeLinejoin="round"
          style={{ strokeDasharray: `${perimLen} ${perimLen}`, strokeDashoffset: perimLen,
            animation: `drawArc 1.4s cubic-bezier(0.4,0,0.2,1) forwards`, "--arc-length": perimLen } as React.CSSProperties} />
      )}
      <polygon points={pts} fill="none" stroke={WHITE90} strokeWidth={STROKE_W} strokeLinejoin="round" />
      {/* n label */}
      <SvgLabel x={cx} y={cy + 5} text={`n = ${n}`} size={12} opacity={0.6} />

      {/* Side label on bottom edge */}
      {s !== undefined && (
        <SvgLabel x={(vertices[0].x + vertices[n - 1].x) / 2} y={vertices[0].y + 16}
          text={lm === "variable" ? "s" : `s = ${s}`} />
      )}
      {unknownDim && <UnknownPill x={cx} y={cy - r - 16} />}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3D SHAPES (Phase 6) — Isometric cabinet projection
// ─────────────────────────────────────────────────────────────────────────────

/** Isometric rectangular prism using 30° cabinet projection */
function Prism({ dims }: { dims: Record<string, number | string> }) {
  const lm = dims.labelMode as string ?? "numeric";
  const lv = lm === "variable";

  // Cabinet projection: right=30°, scale=0.5 for depth
  // Front face: rectangle, then top face parallelogram, then right face parallelogram
  const W = 90, H = 70, D = 50; // visual dimensions
  const ox = 30, oy = 50; // origin (front-bottom-left)
  const cos30 = Math.cos(Math.PI / 6), sin30 = Math.sin(Math.PI / 6);
  const dxD = (D / 2) * cos30, dyD = -(D / 2) * sin30;

  // Corners
  const fl = { x: ox,     y: oy + H }; // front-left-bottom
  const fr = { x: ox + W, y: oy + H }; // front-right-bottom
  const ftl = { x: ox,     y: oy };     // front-left-top
  const ftr = { x: ox + W, y: oy };     // front-right-top
  const bl = { x: ox + dxD,     y: oy + H + dyD }; // back-left-bottom
  const br = { x: ox + W + dxD, y: oy + H + dyD }; // back-right-bottom
  const btl = { x: ox + dxD,     y: oy + dyD };     // back-left-top
  const btr = { x: ox + W + dxD, y: oy + dyD };     // back-right-top

  return (
    <svg viewBox="0 0 220 185" className="w-full h-full" aria-hidden>
      {/* Hidden edges */}
      <line x1={bl.x} y1={bl.y} x2={btl.x} y2={btl.y} stroke={WHITE50} strokeWidth={1.2} strokeDasharray="3 3" />
      <line x1={bl.x} y1={bl.y} x2={fl.x} y2={fl.y} stroke={WHITE50} strokeWidth={1.2} strokeDasharray="3 3" />
      <line x1={bl.x} y1={bl.y} x2={br.x} y2={br.y} stroke={WHITE50} strokeWidth={1.2} strokeDasharray="3 3" />
      {/* Visible edges — front face */}
      <polygon points={`${fl.x},${fl.y} ${fr.x},${fr.y} ${ftr.x},${ftr.y} ${ftl.x},${ftl.y}`} fill="rgba(255,255,255,0.06)" stroke={WHITE90} strokeWidth={STROKE_W} strokeLinejoin="round" />
      {/* Right face */}
      <polygon points={`${fr.x},${fr.y} ${br.x},${br.y} ${btr.x},${btr.y} ${ftr.x},${ftr.y}`} fill="rgba(255,255,255,0.04)" stroke={WHITE90} strokeWidth={STROKE_W} strokeLinejoin="round" />
      {/* Top face */}
      <polygon points={`${ftl.x},${ftl.y} ${ftr.x},${ftr.y} ${btr.x},${btr.y} ${btl.x},${btl.y}`} fill="rgba(255,255,255,0.10)" stroke={WHITE90} strokeWidth={STROKE_W} strokeLinejoin="round" />

      {/* Labels */}
      <SvgLabel x={(fl.x + fr.x) / 2} y={fl.y + 16} text={lv ? "l" : `l = ${dims.l}`} />
      <SvgLabel x={fr.x + (br.x - fr.x) / 2 + 16} y={(fr.y + ftr.y) / 2 + (br.y - fr.y) / 4} text={lv ? "w" : `w = ${dims.w}`} />
      <SvgLabel x={ftl.x - 18} y={(ftl.y + fl.y) / 2} text={lv ? "h" : `h = ${dims.h}`} />
      {dims.unknown === "V" && <UnknownPill x={110} y={135} />}
      {!dims.unknown && !lv && <SvgLabel x={110} y={135} text="V = ?" size={12} opacity={0.6} />}
    </svg>
  );
}

function Cylinder({ dims }: { dims: Record<string, number | string> }) {
  const lm = dims.labelMode as string ?? "numeric";
  const lv = lm === "variable";
  const cx = 110, topY = 50, botY = 150, cr = 60, ey = 15;

  return (
    <svg viewBox="0 0 220 185" className="w-full h-full" aria-hidden>
      {/* Bottom ellipse */}
      <ellipse cx={cx} cy={botY} rx={cr} ry={ey} fill="rgba(255,255,255,0.04)" stroke={WHITE90} strokeWidth={STROKE_W} />
      {/* Cylinder sides */}
      <line x1={cx - cr} y1={topY} x2={cx - cr} y2={botY} stroke={WHITE90} strokeWidth={STROKE_W} />
      <line x1={cx + cr} y1={topY} x2={cx + cr} y2={botY} stroke={WHITE90} strokeWidth={STROKE_W} />
      {/* Top ellipse */}
      <ellipse cx={cx} cy={topY} rx={cr} ry={ey} fill="rgba(255,255,255,0.10)" stroke={WHITE90} strokeWidth={STROKE_W} />
      {/* Radius line */}
      <line x1={cx} y1={topY} x2={cx + cr} y2={topY} stroke={WHITE70} strokeWidth={1.5} strokeDasharray="4 3" />
      {/* Height line */}
      <DimLine x1={cx + cr + 10} y1={topY} x2={cx + cr + 10} y2={botY} />

      <SvgLabel x={cx + cr / 2} y={topY - 14} text={lv ? "radius (r)" : `r = ${dims.r}`} />
      <SvgLabel x={cx + cr + 28} y={(topY + botY) / 2} text={lv ? "h" : `h = ${dims.h}`} />
      {dims.unknown === "V" && <UnknownPill x={cx} y={(topY + botY) / 2 + 5} />}
    </svg>
  );
}

function Cone({ dims }: { dims: Record<string, number | string> }) {
  const lm = dims.labelMode as string ?? "numeric";
  const lv = lm === "variable";
  const cx = 110, apexY = 35, botY = 155, cr = 65, ey = 14;

  return (
    <svg viewBox="0 0 220 185" className="w-full h-full" aria-hidden>
      {/* Base ellipse */}
      <ellipse cx={cx} cy={botY} rx={cr} ry={ey} fill="rgba(255,255,255,0.04)" stroke={WHITE90} strokeWidth={STROKE_W} />
      {/* Sides */}
      <line x1={cx - cr} y1={botY} x2={cx} y2={apexY} stroke={WHITE90} strokeWidth={STROKE_W} />
      <line x1={cx + cr} y1={botY} x2={cx} y2={apexY} stroke={WHITE90} strokeWidth={STROKE_W} />
      {/* Apex dot */}
      <circle cx={cx} cy={apexY} r={3} fill={WHITE90} />
      {/* Radius line */}
      <line x1={cx} y1={botY} x2={cx + cr} y2={botY} stroke={WHITE70} strokeWidth={1.5} strokeDasharray="4 3" />
      {/* Height line */}
      <DimLine x1={cx + cr + 10} y1={apexY} x2={cx + cr + 10} y2={botY} />

      <SvgLabel x={cx + cr / 2} y={botY + 16} text={lv ? "radius (r)" : `r = ${dims.r}`} />
      <SvgLabel x={cx + cr + 30} y={(apexY + botY) / 2} text={lv ? "h" : `h = ${dims.h}`} />
      {dims.unknown === "V" && <UnknownPill x={cx} y={(apexY + botY) / 2 + 5} />}
    </svg>
  );
}

function Sphere({ dims }: { dims: Record<string, number | string> }) {
  const lm = dims.labelMode as string ?? "numeric";
  const lv = lm === "variable";
  const cx = 110, cy = 95, cr = 72;

  return (
    <svg viewBox="0 0 220 190" className="w-full h-full" aria-hidden>
      <circle cx={cx} cy={cy} r={cr} fill="rgba(255,255,255,0.05)" stroke={WHITE90} strokeWidth={STROKE_W} />
      {/* Equator ellipse */}
      <ellipse cx={cx} cy={cy} rx={cr} ry={18} fill="none" stroke={WHITE50} strokeWidth={1.5} strokeDasharray="5 4" />
      {/* Radius line */}
      <line x1={cx} y1={cy} x2={cx + cr * 0.707} y2={cy - cr * 0.707} stroke={WHITE70} strokeWidth={1.5} strokeDasharray="4 3" />
      <circle cx={cx} cy={cy} r={3} fill={WHITE90} />

      <SvgLabel x={cx + cr * 0.5} y={cy - cr * 0.5 - 10} text={lv ? "radius (r)" : `r = ${dims.r}`} />
      {dims.unknown === "V" && <UnknownPill x={cx} y={cy + cr + 16} />}
      {dims.unknown === "SA" && <UnknownPill x={cx} y={cy + cr + 16} />}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN RENDERER
// ─────────────────────────────────────────────────────────────────────────────

export function renderShapeSvg(descriptor: SvgDescriptor, mutation?: SvgMutation): React.ReactElement {
  const { shape, dimensions } = descriptor;
  switch (shape) {
    // Angles
    case "angle-single":              return <AngleSingle dims={dimensions} mutation={mutation} />;
    case "angle-supplementary":       return <AngleSupplementary dims={dimensions} mutation={mutation} />;
    case "angle-complementary":       return <AngleComplementary dims={dimensions} mutation={mutation} />;
    case "angle-vertically-opposite": return <AngleVerticallyOpposite dims={dimensions} mutation={mutation} />;
    case "angle-reflex":              return <AngleReflex dims={dimensions} />;
    case "angle-parallel-alternate":  return <AngleParallelAlternate dims={dimensions} />;
    case "angle-parallel-cointerior": return <AngleParallelCointerior dims={dimensions} />;
    // Triangles
    case "triangle":      return <Triangle dims={dimensions} mutation={mutation} />;
    case "right-triangle": return <RightTriangle dims={dimensions} mutation={mutation} />;
    // Quadrilaterals
    case "rectangle":     return <Rectangle dims={dimensions} mutation={mutation} />;
    case "parallelogram": return <Parallelogram dims={dimensions} mutation={mutation} />;
    case "trapezoid":     return <Trapezoid dims={dimensions} mutation={mutation} />;
    // Circles
    case "circle":        return <Circle dims={dimensions} mutation={mutation} />;
    // Polygons
    case "polygon":       return <Polygon dims={dimensions} mutation={mutation} />;
    // 3D
    case "prism":         return <Prism dims={dimensions} />;
    case "cylinder":      return <Cylinder dims={dimensions} />;
    case "cone":          return <Cone dims={dimensions} />;
    case "sphere":        return <Sphere dims={dimensions} />;
    default:
      return (
        <svg viewBox="0 0 200 180" className="w-full h-full" aria-hidden>
          <text x="100" y="90" textAnchor="middle" fontSize={14} fill={WHITE50} fontFamily="inherit">{shape}</text>
        </svg>
      );
  }
}
