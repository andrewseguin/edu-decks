"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { useContainerWidth } from "@/hooks/use-container-width";
import { cn } from "@/lib/utils";

type InteractiveEdgeProps = {
  color?: string;
};

type ShapeType = "cube" | "prism" | "pyramid" | "cylinder";

const SVG_H = 160;

const COLOR_EDGE = "#5ee8ff";   // Crisp Electric Cyan for Edges
const COLOR_GOLD = "#ffd45e";   // Active Selected Edge Highlight

export function InteractiveEdgeExplorer({ color }: InteractiveEdgeProps) {
  const { containerRef, width: rawW } = useContainerWidth(320);
  const SVG_W = Math.max(280, Math.min(460, rawW - 24));
  const CX = SVG_W / 2;
  const CY = 80;

  const [shape, setShape] = useState<ShapeType>("cube");
  const [unfold, setUnfold] = useState<number>(0);
  const [selectedEdge, setSelectedEdge] = useState<number>(0); // 0 = all
  const [isAnimating, setIsAnimating] = useState(false);
  const animRef = useRef<number | null>(null);

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => e.stopPropagation(), []);

  const handleShapeChange = (newShape: ShapeType) => {
    setShape(newShape);
    setSelectedEdge(0);
  };

  // Smooth Unfold Animation Toggle
  const toggleAnimate = useCallback(() => {
    if (isAnimating) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      setIsAnimating(false);
      return;
    }

    setIsAnimating(true);
    const target = unfold > 0.5 ? 0 : 1;
    const startVal = unfold;
    const startTime = performance.now();
    const duration = 2400;

    const step = (now: number) => {
      const elapsed = now - startTime;
      const prog = Math.min(1, elapsed / duration);
      const eased = prog < 0.5 ? 4 * prog * prog * prog : 1 - Math.pow(-2 * prog + 2, 3) / 2;
      const current = startVal + (target - startVal) * eased;
      setUnfold(current);

      if (prog < 1) {
        animRef.current = requestAnimationFrame(step);
      } else {
        setUnfold(target);
        setIsAnimating(false);
      }
    };

    animRef.current = requestAnimationFrame(step);
  }, [unfold, isAnimating]);

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  // ──────────────────────────────────────────────────────────────────────────
  // 3D Camera & Projection
  // ──────────────────────────────────────────────────────────────────────────
  const p = unfold;
  const tFold = Math.min(1, p / 0.55);
  const tRotate = Math.max(0, (p - 0.55) / 0.45);

  const pitchDeg = 32 + (90 - 32) * tRotate;
  const yawDeg = -36 + (0 - (-36)) * tRotate;
  const pitch = (pitchDeg * Math.PI) / 180;
  const yaw = (yawDeg * Math.PI) / 180;

  const project = (x: number, y: number, z: number, scale = 0.95) => {
    const x1 = x * Math.cos(yaw) + z * Math.sin(yaw);
    const z1 = -x * Math.sin(yaw) + z * Math.cos(yaw);
    const y2 = y * Math.cos(pitch) - z1 * Math.sin(pitch);
    return {
      x: CX + x1 * scale,
      y: CY - y2 * scale,
    };
  };

  // ──────────────────────────────────────────────────────────────────────────
  // 1. CUBE KINEMATICS (Unfolds Sideways)
  // ──────────────────────────────────────────────────────────────────────────
  const cubeS = 46;
  const halfS = cubeS / 2;
  const cubeFoldAngle = (1 - tFold) * (Math.PI / 2);
  const cubeXShift = shape === "cube" ? -halfS * tRotate : 0;

  // Bottom (Face 6)
  const c_b_fl = project(-halfS + cubeXShift, 0, halfS);
  const c_b_fr = project(halfS + cubeXShift, 0, halfS);
  const c_b_br = project(halfS + cubeXShift, 0, -halfS);
  const c_b_bl = project(-halfS + cubeXShift, 0, -halfS);

  // Front (Face 1)
  const c_f_tl = project(-halfS + cubeXShift, cubeS * Math.sin(cubeFoldAngle), halfS + cubeS * Math.cos(cubeFoldAngle));
  const c_f_tr = project(halfS + cubeXShift, cubeS * Math.sin(cubeFoldAngle), halfS + cubeS * Math.cos(cubeFoldAngle));

  // Back (Face 2)
  const c_bk_y = cubeS * Math.sin(cubeFoldAngle);
  const c_bk_z = -halfS - cubeS * Math.cos(cubeFoldAngle);
  const c_bk_tl = project(-halfS + cubeXShift, c_bk_y, c_bk_z);
  const c_bk_tr = project(halfS + cubeXShift, c_bk_y, c_bk_z);

  // Left (Face 3)
  const c_l_tl = project(-halfS - cubeS * Math.cos(cubeFoldAngle) + cubeXShift, cubeS * Math.sin(cubeFoldAngle), halfS);
  const c_l_bl = project(-halfS - cubeS * Math.cos(cubeFoldAngle) + cubeXShift, cubeS * Math.sin(cubeFoldAngle), -halfS);

  // Right (Face 4)
  const c_r_x = halfS + cubeS * Math.cos(cubeFoldAngle);
  const c_r_y = cubeS * Math.sin(cubeFoldAngle);
  const c_r_tr = project(c_r_x + cubeXShift, c_r_y, halfS);
  const c_r_br = project(c_r_x + cubeXShift, c_r_y, -halfS);

  // Top (Face 5)
  const c_top_x = c_r_x - cubeS * Math.cos(tFold * Math.PI);
  const c_top_y = c_r_y + cubeS * Math.sin(tFold * Math.PI);
  const c_top_tr = project(c_top_x + cubeXShift, c_top_y, halfS);
  const c_top_br = project(c_top_x + cubeXShift, c_top_y, -halfS);

  // ──────────────────────────────────────────────────────────────────────────
  // 2. TRIANGULAR PRISM KINEMATICS
  // ──────────────────────────────────────────────────────────────────────────
  const pW = 50;
  const pH = 40;
  const pL = 56;
  const pR = Math.sqrt((pW / 2) * (pW / 2) + pH * pH);
  const pRoofAngleInit = Math.atan2(pH, pW / 2);

  const pb_fl = project(-pW / 2, 0, pL / 2);
  const pb_fr = project(pW / 2, 0, pL / 2);
  const pb_br = project(pW / 2, 0, -pL / 2);
  const pb_bl = project(-pW / 2, 0, -pL / 2);

  const triAngle = (1 - tFold) * (Math.PI / 2);
  const pv_fa = project(0, pH * Math.sin(triAngle), pL / 2 + pH * Math.cos(triAngle));
  const pv_ba = project(0, pH * Math.sin(triAngle), -pL / 2 - pH * Math.cos(triAngle));

  const r_angle = (1 - tFold) * (Math.PI - pRoofAngleInit);
  const pv_r_front = project(pW / 2 + pR * Math.cos(r_angle), pR * Math.sin(r_angle), pL / 2);
  const pv_r_back = project(pW / 2 + pR * Math.cos(r_angle), pR * Math.sin(r_angle), -pL / 2);

  const l_angle = (1 - tFold) * (Math.PI - pRoofAngleInit);
  const pv_l_front = project(-pW / 2 - pR * Math.cos(l_angle), pR * Math.sin(l_angle), pL / 2);
  const pv_l_back = project(-pW / 2 - pR * Math.cos(l_angle), pR * Math.sin(l_angle), -pL / 2);

  // ──────────────────────────────────────────────────────────────────────────
  // 3. SQUARE PYRAMID KINEMATICS (Closed 3D Apex at (0, pyrH, 0))
  // ──────────────────────────────────────────────────────────────────────────
  const pyrW = 46;
  const pyrH = 42;
  const pyrSlant = Math.sqrt((pyrW / 2) * (pyrW / 2) + pyrH * pyrH);
  const pyrInitAngle = Math.atan2(pyrH, pyrW / 2);
  const pyrPhi = (1 - tFold) * (Math.PI - pyrInitAngle);

  const pyrb_fl = project(-pyrW / 2, 0, pyrW / 2);
  const pyrb_fr = project(pyrW / 2, 0, pyrW / 2);
  const pyrb_br = project(pyrW / 2, 0, -pyrW / 2);
  const pyrb_bl = project(-pyrW / 2, 0, -pyrW / 2);

  const pyr_f_apex = project(0, pyrSlant * Math.sin(pyrPhi), pyrW / 2 + pyrSlant * Math.cos(pyrPhi));
  const pyr_bk_apex = project(0, pyrSlant * Math.sin(pyrPhi), -pyrW / 2 - pyrSlant * Math.cos(pyrPhi));
  const pyr_r_apex = project(pyrW / 2 + pyrSlant * Math.cos(pyrPhi), pyrSlant * Math.sin(pyrPhi), 0);
  const pyr_l_apex = project(-pyrW / 2 - pyrSlant * Math.cos(pyrPhi), pyrSlant * Math.sin(pyrPhi), 0);

  // ──────────────────────────────────────────────────────────────────────────
  // 4. CYLINDER KINEMATICS
  // ──────────────────────────────────────────────────────────────────────────
  const cylR = 18;
  const cylH = 42;

  // ──────────────────────────────────────────────────────────────────────────
  // Shape-specific In-Diagram Header Data
  // ──────────────────────────────────────────────────────────────────────────
  const getShapeSummary = () => {
    switch (shape) {
      case "cube":
        return { label: "Cube", desc: "12 Edges (Straight Segments)", total: 12 };
      case "prism":
        return { label: "Prism", desc: "9 Edges (6 Base + 3 Side Edges)", total: 9 };
      case "pyramid":
        return { label: "Pyramid", desc: "8 Edges (4 Base + 4 Slant Edges)", total: 8 };
      case "cylinder":
        return { label: "Cylinder", desc: "2 Curved Edges (Circular Rims)", total: 2 };
    }
  };

  const summary = getShapeSummary();

  const getEdgeStroke = (id: number) => {
    return selectedEdge === id ? COLOR_GOLD : COLOR_EDGE;
  };

  const getEdgeStrokeWidth = (id: number) => {
    return selectedEdge === id ? 3.5 : 2;
  };

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-1 w-full pt-0.5 pb-1" onClick={stop} onPointerDown={stop}>
      {/* ── Descriptive Header Badge (Above SVG to prevent overlap) ── */}
      <div className="text-center text-xs sm:text-sm font-bold font-headline tracking-wide select-none" style={{ color: COLOR_EDGE }}>
        {selectedEdge > 0 ? `Edge ${selectedEdge} of ${summary.total}` : summary.desc}
      </div>

      {/* ── Large & Prominent Interactive 3D / 2D Canvas ── */}
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full touch-none select-none overflow-visible max-h-[160px]">
        {/* ───────── CUBE RENDERING ───────── */}
        {shape === "cube" && (
          <g>
            {/* Subtle Face Fills to visualize surfaces meeting */}
            <polygon points={`${c_b_fl.x},${c_b_fl.y} ${c_b_fr.x},${c_b_fr.y} ${c_b_br.x},${c_b_br.y} ${c_b_bl.x},${c_b_bl.y}`} fill="rgba(94, 232, 255, 0.12)" />
            <polygon points={`${c_b_bl.x},${c_b_bl.y} ${c_b_br.x},${c_b_br.y} ${c_bk_tr.x},${c_bk_tr.y} ${c_bk_tl.x},${c_bk_tl.y}`} fill="rgba(94, 232, 255, 0.12)" />
            <polygon points={`${c_r_tr.x},${c_r_tr.y} ${c_r_br.x},${c_r_br.y} ${c_top_br.x},${c_top_br.y} ${c_top_tr.x},${c_top_tr.y}`} fill="rgba(94, 232, 255, 0.12)" />
            <polygon points={`${c_b_fl.x},${c_b_fl.y} ${c_b_bl.x},${c_b_bl.y} ${c_l_bl.x},${c_l_bl.y} ${c_l_tl.x},${c_l_tl.y}`} fill="rgba(94, 232, 255, 0.12)" />
            <polygon points={`${c_b_fr.x},${c_b_fr.y} ${c_b_br.x},${c_b_br.y} ${c_r_br.x},${c_r_br.y} ${c_r_tr.x},${c_r_tr.y}`} fill="rgba(94, 232, 255, 0.14)" />
            <polygon points={`${c_b_fl.x},${c_b_fl.y} ${c_b_fr.x},${c_b_fr.y} ${c_f_tr.x},${c_f_tr.y} ${c_f_tl.x},${c_f_tl.y}`} fill="rgba(94, 232, 255, 0.18)" />

            {/* Hidden back edges in 3D */}
            {tFold < 0.15 && (
              <>
                <line x1={c_b_bl.x} y1={c_b_bl.y} x2={c_b_br.x} y2={c_b_br.y} stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} strokeDasharray="4 3" />
                <line x1={c_b_bl.x} y1={c_b_bl.y} x2={c_b_fl.x} y2={c_b_fl.y} stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} strokeDasharray="4 3" />
                <line x1={c_b_bl.x} y1={c_b_bl.y} x2={c_bk_tl.x} y2={c_bk_tl.y} stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} strokeDasharray="4 3" />
              </>
            )}

            {/* Bottom Face Edges */}
            <line x1={c_b_fl.x} y1={c_b_fl.y} x2={c_b_fr.x} y2={c_b_fr.y} stroke={getEdgeStroke(1)} strokeWidth={getEdgeStrokeWidth(1)} strokeLinecap="round" onClick={() => setSelectedEdge(selectedEdge === 1 ? 0 : 1)} className="cursor-pointer" />
            <line x1={c_b_fr.x} y1={c_b_fr.y} x2={c_b_br.x} y2={c_b_br.y} stroke={getEdgeStroke(2)} strokeWidth={getEdgeStrokeWidth(2)} strokeLinecap="round" onClick={() => setSelectedEdge(selectedEdge === 2 ? 0 : 2)} className="cursor-pointer" />
            <line x1={c_b_br.x} y1={c_b_br.y} x2={c_b_bl.x} y2={c_b_bl.y} stroke={getEdgeStroke(3)} strokeWidth={getEdgeStrokeWidth(3)} strokeLinecap="round" onClick={() => setSelectedEdge(selectedEdge === 3 ? 0 : 3)} className="cursor-pointer" />
            <line x1={c_b_bl.x} y1={c_b_bl.y} x2={c_b_fl.x} y2={c_b_fl.y} stroke={getEdgeStroke(4)} strokeWidth={getEdgeStrokeWidth(4)} strokeLinecap="round" onClick={() => setSelectedEdge(selectedEdge === 4 ? 0 : 4)} className="cursor-pointer" />

            {/* Front Face Edges */}
            <line x1={c_b_fl.x} y1={c_b_fl.y} x2={c_f_tl.x} y2={c_f_tl.y} stroke={getEdgeStroke(5)} strokeWidth={getEdgeStrokeWidth(5)} strokeLinecap="round" onClick={() => setSelectedEdge(selectedEdge === 5 ? 0 : 5)} className="cursor-pointer" />
            <line x1={c_f_tl.x} y1={c_f_tl.y} x2={c_f_tr.x} y2={c_f_tr.y} stroke={getEdgeStroke(6)} strokeWidth={getEdgeStrokeWidth(6)} strokeLinecap="round" onClick={() => setSelectedEdge(selectedEdge === 6 ? 0 : 6)} className="cursor-pointer" />
            <line x1={c_f_tr.x} y1={c_f_tr.y} x2={c_b_fr.x} y2={c_b_fr.y} stroke={getEdgeStroke(7)} strokeWidth={getEdgeStrokeWidth(7)} strokeLinecap="round" onClick={() => setSelectedEdge(selectedEdge === 7 ? 0 : 7)} className="cursor-pointer" />

            {/* Back Face Edges */}
            <line x1={c_b_bl.x} y1={c_b_bl.y} x2={c_bk_tl.x} y2={c_bk_tl.y} stroke={getEdgeStroke(8)} strokeWidth={getEdgeStrokeWidth(8)} strokeLinecap="round" onClick={() => setSelectedEdge(selectedEdge === 8 ? 0 : 8)} className="cursor-pointer" />
            <line x1={c_bk_tl.x} y1={c_bk_tl.y} x2={c_bk_tr.x} y2={c_bk_tr.y} stroke={getEdgeStroke(9)} strokeWidth={getEdgeStrokeWidth(9)} strokeLinecap="round" onClick={() => setSelectedEdge(selectedEdge === 9 ? 0 : 9)} className="cursor-pointer" />
            <line x1={c_bk_tr.x} y1={c_bk_tr.y} x2={c_b_br.x} y2={c_b_br.y} stroke={getEdgeStroke(10)} strokeWidth={getEdgeStrokeWidth(10)} strokeLinecap="round" onClick={() => setSelectedEdge(selectedEdge === 10 ? 0 : 10)} className="cursor-pointer" />

            {/* Left & Right Flap Edges */}
            <line x1={c_l_tl.x} y1={c_l_tl.y} x2={c_l_bl.x} y2={c_l_bl.y} stroke={getEdgeStroke(11)} strokeWidth={getEdgeStrokeWidth(11)} strokeLinecap="round" onClick={() => setSelectedEdge(selectedEdge === 11 ? 0 : 11)} className="cursor-pointer" />
            <line x1={c_r_tr.x} y1={c_r_tr.y} x2={c_r_br.x} y2={c_r_br.y} stroke={getEdgeStroke(12)} strokeWidth={getEdgeStrokeWidth(12)} strokeLinecap="round" onClick={() => setSelectedEdge(selectedEdge === 12 ? 0 : 12)} className="cursor-pointer" />

            {/* Top Flap Edges (when unfolded) */}
            {tFold > 0.05 && (
              <>
                <line x1={c_top_tr.x} y1={c_top_tr.y} x2={c_top_br.x} y2={c_top_br.y} stroke={COLOR_EDGE} strokeWidth={2} strokeLinecap="round" />
                <line x1={c_r_tr.x} y1={c_r_tr.y} x2={c_top_tr.x} y2={c_top_tr.y} stroke={COLOR_EDGE} strokeWidth={2} strokeLinecap="round" />
                <line x1={c_r_br.x} y1={c_r_br.y} x2={c_top_br.x} y2={c_top_br.y} stroke={COLOR_EDGE} strokeWidth={2} strokeLinecap="round" />
              </>
            )}
          </g>
        )}

        {/* ───────── PRISM RENDERING ───────── */}
        {shape === "prism" && (
          <g>
            {/* Subtle Face Fills */}
            <polygon points={`${pb_fl.x},${pb_fl.y} ${pb_fr.x},${pb_fr.y} ${pb_br.x},${pb_br.y} ${pb_bl.x},${pb_bl.y}`} fill="rgba(94, 232, 255, 0.12)" />
            <polygon points={`${pb_bl.x},${pb_bl.y} ${pb_br.x},${pb_br.y} ${pv_ba.x},${pv_ba.y}`} fill="rgba(94, 232, 255, 0.12)" />
            <polygon points={`${pb_fl.x},${pb_fl.y} ${pb_bl.x},${pb_bl.y} ${pv_l_back.x},${pv_l_back.y} ${pv_l_front.x},${pv_l_front.y}`} fill="rgba(94, 232, 255, 0.12)" />
            <polygon points={`${pb_fr.x},${pb_fr.y} ${pb_br.x},${pb_br.y} ${pv_r_back.x},${pv_r_back.y} ${pv_r_front.x},${pv_r_front.y}`} fill="rgba(94, 232, 255, 0.15)" />
            <polygon points={`${pb_fl.x},${pb_fl.y} ${pb_fr.x},${pb_fr.y} ${pv_fa.x},${pv_fa.y}`} fill="rgba(94, 232, 255, 0.18)" />

            {/* Base Rectangle 4 Edges */}
            <line x1={pb_fl.x} y1={pb_fl.y} x2={pb_fr.x} y2={pb_fr.y} stroke={getEdgeStroke(1)} strokeWidth={getEdgeStrokeWidth(1)} strokeLinecap="round" onClick={() => setSelectedEdge(selectedEdge === 1 ? 0 : 1)} className="cursor-pointer" />
            <line x1={pb_fr.x} y1={pb_fr.y} x2={pb_br.x} y2={pb_br.y} stroke={getEdgeStroke(2)} strokeWidth={getEdgeStrokeWidth(2)} strokeLinecap="round" onClick={() => setSelectedEdge(selectedEdge === 2 ? 0 : 2)} className="cursor-pointer" />
            <line x1={pb_br.x} y1={pb_br.y} x2={pb_bl.x} y2={pb_bl.y} stroke={getEdgeStroke(3)} strokeWidth={getEdgeStrokeWidth(3)} strokeLinecap="round" onClick={() => setSelectedEdge(selectedEdge === 3 ? 0 : 3)} className="cursor-pointer" />
            <line x1={pb_bl.x} y1={pb_bl.y} x2={pb_fl.x} y2={pb_fl.y} stroke={getEdgeStroke(4)} strokeWidth={getEdgeStrokeWidth(4)} strokeLinecap="round" onClick={() => setSelectedEdge(selectedEdge === 4 ? 0 : 4)} className="cursor-pointer" />

            {/* Front Triangle Slant Edges */}
            <line x1={pb_fl.x} y1={pb_fl.y} x2={pv_fa.x} y2={pv_fa.y} stroke={getEdgeStroke(5)} strokeWidth={getEdgeStrokeWidth(5)} strokeLinecap="round" onClick={() => setSelectedEdge(selectedEdge === 5 ? 0 : 5)} className="cursor-pointer" />
            <line x1={pb_fr.x} y1={pb_fr.y} x2={pv_fa.x} y2={pv_fa.y} stroke={getEdgeStroke(6)} strokeWidth={getEdgeStrokeWidth(6)} strokeLinecap="round" onClick={() => setSelectedEdge(selectedEdge === 6 ? 0 : 6)} className="cursor-pointer" />

            {/* Back Triangle Slant Edges */}
            <line x1={pb_bl.x} y1={pb_bl.y} x2={pv_ba.x} y2={pv_ba.y} stroke={getEdgeStroke(7)} strokeWidth={getEdgeStrokeWidth(7)} strokeLinecap="round" onClick={() => setSelectedEdge(selectedEdge === 7 ? 0 : 7)} className="cursor-pointer" />
            <line x1={pb_br.x} y1={pb_br.y} x2={pv_ba.x} y2={pv_ba.y} stroke={getEdgeStroke(8)} strokeWidth={getEdgeStrokeWidth(8)} strokeLinecap="round" onClick={() => setSelectedEdge(selectedEdge === 8 ? 0 : 8)} className="cursor-pointer" />

            {/* Top Ridge / Lateral Edge */}
            <line x1={pv_fa.x} y1={pv_fa.y} x2={pv_ba.x} y2={pv_ba.y} stroke={getEdgeStroke(9)} strokeWidth={getEdgeStrokeWidth(9)} strokeLinecap="round" onClick={() => setSelectedEdge(selectedEdge === 9 ? 0 : 9)} className="cursor-pointer" />

            {/* Unfolded outer rectangle edges */}
            {tFold > 0.05 && (
              <>
                <line x1={pv_l_front.x} y1={pv_l_front.y} x2={pv_l_back.x} y2={pv_l_back.y} stroke={COLOR_EDGE} strokeWidth={2} strokeLinecap="round" />
                <line x1={pv_r_front.x} y1={pv_r_front.y} x2={pv_r_back.x} y2={pv_r_back.y} stroke={COLOR_EDGE} strokeWidth={2} strokeLinecap="round" />
              </>
            )}
          </g>
        )}

        {/* ───────── PYRAMID RENDERING ───────── */}
        {shape === "pyramid" && (
          <g>
            {/* Subtle Face Fills */}
            <polygon points={`${pyrb_fl.x},${pyrb_fl.y} ${pyrb_fr.x},${pyrb_fr.y} ${pyrb_br.x},${pyrb_br.y} ${pyrb_bl.x},${pyrb_bl.y}`} fill="rgba(94, 232, 255, 0.12)" />
            <polygon points={`${pyrb_bl.x},${pyrb_bl.y} ${pyrb_br.x},${pyrb_br.y} ${pyr_bk_apex.x},${pyr_bk_apex.y}`} fill="rgba(94, 232, 255, 0.12)" />
            <polygon points={`${pyrb_fl.x},${pyrb_fl.y} ${pyrb_bl.x},${pyrb_bl.y} ${pyr_l_apex.x},${pyr_l_apex.y}`} fill="rgba(94, 232, 255, 0.12)" />
            <polygon points={`${pyrb_fr.x},${pyrb_fr.y} ${pyrb_br.x},${pyrb_br.y} ${pyr_r_apex.x},${pyr_r_apex.y}`} fill="rgba(94, 232, 255, 0.15)" />
            <polygon points={`${pyrb_fl.x},${pyrb_fl.y} ${pyrb_fr.x},${pyrb_fr.y} ${pyr_f_apex.x},${pyr_f_apex.y}`} fill="rgba(94, 232, 255, 0.18)" />

            {/* Base Square 4 Edges */}
            <line x1={pyrb_fl.x} y1={pyrb_fl.y} x2={pyrb_fr.x} y2={pyrb_fr.y} stroke={getEdgeStroke(1)} strokeWidth={getEdgeStrokeWidth(1)} strokeLinecap="round" onClick={() => setSelectedEdge(selectedEdge === 1 ? 0 : 1)} className="cursor-pointer" />
            <line x1={pyrb_fr.x} y1={pyrb_fr.y} x2={pyrb_br.x} y2={pyrb_br.y} stroke={getEdgeStroke(2)} strokeWidth={getEdgeStrokeWidth(2)} strokeLinecap="round" onClick={() => setSelectedEdge(selectedEdge === 2 ? 0 : 2)} className="cursor-pointer" />
            <line x1={pyrb_br.x} y1={pyrb_br.y} x2={pyrb_bl.x} y2={pyrb_bl.y} stroke={getEdgeStroke(3)} strokeWidth={getEdgeStrokeWidth(3)} strokeLinecap="round" onClick={() => setSelectedEdge(selectedEdge === 3 ? 0 : 3)} className="cursor-pointer" />
            <line x1={pyrb_bl.x} y1={pyrb_bl.y} x2={pyrb_fl.x} y2={pyrb_fl.y} stroke={getEdgeStroke(4)} strokeWidth={getEdgeStrokeWidth(4)} strokeLinecap="round" onClick={() => setSelectedEdge(selectedEdge === 4 ? 0 : 4)} className="cursor-pointer" />

            {/* 4 Slant Edges meeting at apex */}
            <line x1={pyrb_fl.x} y1={pyrb_fl.y} x2={pyr_f_apex.x} y2={pyr_f_apex.y} stroke={getEdgeStroke(5)} strokeWidth={getEdgeStrokeWidth(5)} strokeLinecap="round" onClick={() => setSelectedEdge(selectedEdge === 5 ? 0 : 5)} className="cursor-pointer" />
            <line x1={pyrb_fr.x} y1={pyrb_fr.y} x2={pyr_f_apex.x} y2={pyr_f_apex.y} stroke={getEdgeStroke(6)} strokeWidth={getEdgeStrokeWidth(6)} strokeLinecap="round" onClick={() => setSelectedEdge(selectedEdge === 6 ? 0 : 6)} className="cursor-pointer" />
            <line x1={pyrb_br.x} y1={pyrb_br.y} x2={pyr_r_apex.x} y2={pyr_r_apex.y} stroke={getEdgeStroke(7)} strokeWidth={getEdgeStrokeWidth(7)} strokeLinecap="round" onClick={() => setSelectedEdge(selectedEdge === 7 ? 0 : 7)} className="cursor-pointer" />
            <line x1={pyrb_bl.x} y1={pyrb_bl.y} x2={pyr_l_apex.x} y2={pyr_l_apex.y} stroke={getEdgeStroke(8)} strokeWidth={getEdgeStrokeWidth(8)} strokeLinecap="round" onClick={() => setSelectedEdge(selectedEdge === 8 ? 0 : 8)} className="cursor-pointer" />
          </g>
        )}

        {/* ───────── CYLINDER RENDERING (Full Smooth [0, 1] Progression) ───────── */}
        {shape === "cylinder" && (() => {
          const cR = 18;
          const cH = 42;
          const cCirc = 2 * Math.PI * cR;
          const bodyW = cR * 2 + (cCirc - cR * 2) * p;
          const cRy = 0.32 * cR;
          const arcRy = cRy * (1 - p);
          const topCy = (CY - cH / 2) - (cR + 3) * p;
          const botCy = (CY + cH / 2) + (cR + 3) * p;
          const topRy = cRy + (cR - cRy) * p;
          const botRy = cRy + (cR - cRy) * p;

          const topPath =
            arcRy > 0.5
              ? `A ${bodyW / 2} ${arcRy} 0 0 0 ${CX + bodyW / 2} ${CY - cH / 2}`
              : `L ${CX + bodyW / 2} ${CY - cH / 2}`;
          const botPath =
            arcRy > 0.5
              ? `A ${bodyW / 2} ${arcRy} 0 0 1 ${CX - bodyW / 2} ${CY + cH / 2}`
              : `L ${CX - bodyW / 2} ${CY + cH / 2}`;

          return (
            <g>
              {/* Shaded body fill */}
              <path
                d={`M ${CX - bodyW / 2} ${CY - cH / 2} ${topPath} L ${CX + bodyW / 2} ${CY + cH / 2} ${botPath} Z`}
                fill="rgba(94, 232, 255, 0.12)"
                stroke="rgba(255, 255, 255, 0.3)"
                strokeWidth={1}
              />

              {/* 3D Hidden Dashed Back Arc on bottom base when folded */}
              {p < 0.15 && (
                <path
                  d={`M ${CX - cR} ${CY + cH / 2} A ${cR} ${cRy} 0 0 1 ${CX + cR} ${CY + cH / 2}`}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.3)"
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                />
              )}

              {/* Curved Edge 2: Bottom Circular Rim Edge */}
              <ellipse
                cx={CX}
                cy={botCy}
                rx={cR}
                ry={botRy}
                fill="rgba(94, 232, 255, 0.16)"
                stroke={getEdgeStroke(2)}
                strokeWidth={getEdgeStrokeWidth(2)}
                onClick={() => setSelectedEdge(selectedEdge === 2 ? 0 : 2)}
                className="cursor-pointer transition-colors"
              />

              {/* Curved Edge 1: Top Circular Rim Edge */}
              <ellipse
                cx={CX}
                cy={topCy}
                rx={cR}
                ry={topRy}
                fill="rgba(94, 232, 255, 0.16)"
                stroke={getEdgeStroke(1)}
                strokeWidth={getEdgeStrokeWidth(1)}
                onClick={() => setSelectedEdge(selectedEdge === 1 ? 0 : 1)}
                className="cursor-pointer transition-colors"
              />
            </g>
          );
        })()}
      </svg>

      {/* ── Minimalist Bottom Controls: Shape Switcher + Fold Slider ── */}
      <div className="flex flex-col items-center gap-1.5 w-full max-w-sm px-2 select-none z-30 pointer-events-auto">
        {/* Shape Switcher Pills */}
        <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-1.5 py-0.5 rounded-full border border-white/25 shadow-sm">
          <button
            onClick={() => handleShapeChange("cube")}
            className={cn(
              "px-3 py-0.5 rounded-full text-xs font-headline font-bold transition-all border-none",
              shape === "cube" ? "bg-white/25 text-white shadow-sm" : "bg-transparent text-white/70 hover:text-white"
            )}
          >
            Cube
          </button>
          <button
            onClick={() => handleShapeChange("prism")}
            className={cn(
              "px-3 py-0.5 rounded-full text-xs font-headline font-bold transition-all border-none",
              shape === "prism" ? "bg-white/25 text-white shadow-sm" : "bg-transparent text-white/70 hover:text-white"
            )}
          >
            Prism
          </button>
          <button
            onClick={() => handleShapeChange("pyramid")}
            className={cn(
              "px-3 py-0.5 rounded-full text-xs font-headline font-bold transition-all border-none",
              shape === "pyramid" ? "bg-white/25 text-white shadow-sm" : "bg-transparent text-white/70 hover:text-white"
            )}
          >
            Pyramid
          </button>
          <button
            onClick={() => handleShapeChange("cylinder")}
            className={cn(
              "px-3 py-0.5 rounded-full text-xs font-headline font-bold transition-all border-none",
              shape === "cylinder" ? "bg-white/25 text-white shadow-sm" : "bg-transparent text-white/70 hover:text-white"
            )}
          >
            Cylinder
          </button>
        </div>

        {/* Clean Unfold Slider + Action Button */}
        <div className="flex items-center gap-3 w-full bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/25 shadow-sm">
          <div className="relative flex-1 flex items-center h-5">
            {/* Frosted Background Track */}
            <div className="absolute inset-x-0 h-1.5 rounded-full bg-white/20 overflow-hidden pointer-events-none">
              <div
                className="h-full bg-white/50 rounded-full"
                style={{ width: `${unfold * 100}%` }}
              />
            </div>
            {/* Native Slider overlay for touch/mouse dragging */}
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={unfold}
              onChange={(e) => {
                if (isAnimating && animRef.current) cancelAnimationFrame(animRef.current);
                setIsAnimating(false);
                setUnfold(parseFloat(e.target.value));
              }}
              className="w-full h-5 opacity-0 cursor-pointer z-10 m-0"
            />
            {/* Custom Glowing Neutral White Handle */}
            <div
              className="absolute top-1/2 w-4 h-4 rounded-full bg-white shadow-md pointer-events-none -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${unfold * 100}%` }}
            />
          </div>
          <button
            onClick={toggleAnimate}
            className="px-3 py-0.5 rounded-full text-xs font-headline font-bold bg-white/15 hover:bg-white/25 text-white transition-all border border-white/20 active:scale-95 shrink-0"
          >
            {isAnimating ? "Pause" : unfold > 0.5 ? "Fold 3D" : "Unfold"}
          </button>
        </div>
      </div>
    </div>
  );
}
