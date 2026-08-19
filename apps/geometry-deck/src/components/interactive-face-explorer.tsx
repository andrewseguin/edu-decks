"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { useContainerWidth } from "@/hooks/use-container-width";
import { cn } from "@/lib/utils";

type InteractiveFaceProps = {
  color?: string;
};

type ShapeType = "cube" | "prism" | "pyramid" | "cylinder";

const SVG_H = 205;

const COLOR_FACE = "#5ee8ff";   // Unified Face Color (Cyan)
const COLOR_GOLD = "#ffd45e";   // Active Selected Face

export function InteractiveFaceExplorer({ color }: InteractiveFaceProps) {
  const { containerRef, width: rawW } = useContainerWidth(320);
  const SVG_W = Math.max(280, Math.min(460, rawW - 24));
  const CX = SVG_W / 2;
  const CY = 95;

  const [shape, setShape] = useState<ShapeType>("cube");
  const [unfold, setUnfold] = useState<number>(0);
  const [selectedFace, setSelectedFace] = useState<number>(0); // 0 = all
  const [isAnimating, setIsAnimating] = useState(false);
  const animRef = useRef<number | null>(null);

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => e.stopPropagation(), []);

  const handleShapeChange = (newShape: ShapeType) => {
    setShape(newShape);
    setSelectedFace(0);
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
      // Gentle sinusoidal ease-in-out (no center whipping)
      const eased = -(Math.cos(Math.PI * prog) - 1) / 2;
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
  // 3D Camera & Projection with Dynamic Zoom-Out
  // ──────────────────────────────────────────────────────────────────────────
  const p = unfold;
  const tFold = Math.min(1, p / 0.55);
  const tRotate = Math.max(0, (p - 0.55) / 0.45);

  const pitchDeg = 32 + (90 - 32) * tRotate;
  const yawDeg = -36 + (0 - (-36)) * tRotate;
  const pitch = (pitchDeg * Math.PI) / 180;
  const yaw = (yawDeg * Math.PI) / 180;

  // Dynamic zoom: occupies full space when folded in 3D (1.75x),
  // smoothly zooms out as it unfolds to fit the 2D flat net (0.95x)
  const baseScale3D = 1.75;
  const baseScaleNet = 0.95;
  const currentScale = baseScale3D + (baseScaleNet - baseScale3D) * tFold;

  const project = (x: number, y: number, z: number) => {
    const x1 = x * Math.cos(yaw) + z * Math.sin(yaw);
    const z1 = -x * Math.sin(yaw) + z * Math.cos(yaw);
    const y2 = y * Math.cos(pitch) - z1 * Math.sin(pitch);
    return {
      x: CX + x1 * currentScale,
      y: CY - y2 * currentScale,
    };
  };

  // ──────────────────────────────────────────────────────────────────────────
  // 1. CUBE KINEMATICS (Unfolds Sideways)
  // ──────────────────────────────────────────────────────────────────────────
  const cubeS = 46;
  const halfS = cubeS / 2;
  const cubeFoldAngle = (1 - tFold) * (Math.PI / 2);
  const cubeXShift = shape === "cube" ? -halfS * tRotate : 0;
  const cubeYShift = -halfS * (1 - tFold);

  // Bottom (Face 6)
  const c_b_fl = project(-halfS + cubeXShift, cubeYShift, halfS);
  const c_b_fr = project(halfS + cubeXShift, cubeYShift, halfS);
  const c_b_br = project(halfS + cubeXShift, cubeYShift, -halfS);
  const c_b_bl = project(-halfS + cubeXShift, cubeYShift, -halfS);

  // Front (Face 1)
  const c_f_tl = project(-halfS + cubeXShift, cubeS * Math.sin(cubeFoldAngle) + cubeYShift, halfS + cubeS * Math.cos(cubeFoldAngle));
  const c_f_tr = project(halfS + cubeXShift, cubeS * Math.sin(cubeFoldAngle) + cubeYShift, halfS + cubeS * Math.cos(cubeFoldAngle));

  // Back (Face 2)
  const c_bk_y = cubeS * Math.sin(cubeFoldAngle) + cubeYShift;
  const c_bk_z = -halfS - cubeS * Math.cos(cubeFoldAngle);
  const c_bk_tl = project(-halfS + cubeXShift, c_bk_y, c_bk_z);
  const c_bk_tr = project(halfS + cubeXShift, c_bk_y, c_bk_z);

  // Left (Face 3)
  const c_l_tl = project(-halfS - cubeS * Math.cos(cubeFoldAngle) + cubeXShift, cubeS * Math.sin(cubeFoldAngle) + cubeYShift, halfS);
  const c_l_bl = project(-halfS - cubeS * Math.cos(cubeFoldAngle) + cubeXShift, cubeS * Math.sin(cubeFoldAngle) + cubeYShift, -halfS);

  // Right (Face 4)
  const c_r_x = halfS + cubeS * Math.cos(cubeFoldAngle);
  const c_r_y = cubeS * Math.sin(cubeFoldAngle) + cubeYShift;
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
  const prismYShift = -(pH / 2) * (1 - tFold);

  const pb_fl = project(-pW / 2, prismYShift, pL / 2);
  const pb_fr = project(pW / 2, prismYShift, pL / 2);
  const pb_br = project(pW / 2, prismYShift, -pL / 2);
  const pb_bl = project(-pW / 2, prismYShift, -pL / 2);

  const triAngle = (1 - tFold) * (Math.PI / 2);
  const pv_fa = project(0, pH * Math.sin(triAngle) + prismYShift, pL / 2 + pH * Math.cos(triAngle));
  const pv_ba = project(0, pH * Math.sin(triAngle) + prismYShift, -pL / 2 - pH * Math.cos(triAngle));

  const r_angle = (1 - tFold) * (Math.PI - pRoofAngleInit);
  const pv_r_front = project(pW / 2 + pR * Math.cos(r_angle), pR * Math.sin(r_angle) + prismYShift, pL / 2);
  const pv_r_back = project(pW / 2 + pR * Math.cos(r_angle), pR * Math.sin(r_angle) + prismYShift, -pL / 2);

  const l_angle = (1 - tFold) * (Math.PI - pRoofAngleInit);
  const pv_l_front = project(-pW / 2 - pR * Math.cos(l_angle), pR * Math.sin(l_angle) + prismYShift, pL / 2);
  const pv_l_back = project(-pW / 2 - pR * Math.cos(l_angle), pR * Math.sin(l_angle) + prismYShift, -pL / 2);

  // ──────────────────────────────────────────────────────────────────────────
  // 3. SQUARE PYRAMID KINEMATICS (Closed 3D Apex at (0, pyrH, 0))
  // ──────────────────────────────────────────────────────────────────────────
  const pyrW = 46;
  const pyrH = 42;
  const pyrSlant = Math.sqrt((pyrW / 2) * (pyrW / 2) + pyrH * pyrH);
  const pyrInitAngle = Math.atan2(pyrH, pyrW / 2);
  const pyrPhi = (1 - tFold) * (Math.PI - pyrInitAngle);
  const pyrYShift = -(pyrH / 2) * (1 - tFold);

  const pyrb_fl = project(-pyrW / 2, pyrYShift, pyrW / 2);
  const pyrb_fr = project(pyrW / 2, pyrYShift, pyrW / 2);
  const pyrb_br = project(pyrW / 2, pyrYShift, -pyrW / 2);
  const pyrb_bl = project(-pyrW / 2, pyrYShift, -pyrW / 2);

  const pyr_f_apex = project(0, pyrSlant * Math.sin(pyrPhi) + pyrYShift, pyrW / 2 + pyrSlant * Math.cos(pyrPhi));
  const pyr_bk_apex = project(0, pyrSlant * Math.sin(pyrPhi) + pyrYShift, -pyrW / 2 - pyrSlant * Math.cos(pyrPhi));
  const pyr_r_apex = project(pyrW / 2 + pyrSlant * Math.cos(pyrPhi), pyrSlant * Math.sin(pyrPhi) + pyrYShift, 0);
  const pyr_l_apex = project(-pyrW / 2 - pyrSlant * Math.cos(pyrPhi), pyrSlant * Math.sin(pyrPhi) + pyrYShift, 0);

  // ──────────────────────────────────────────────────────────────────────────
  // 4. CYLINDER KINEMATICS
  // ──────────────────────────────────────────────────────────────────────────
  const cylR = 18;
  const cylH = 42;
  const cylCirc = 2 * Math.PI * cylR;
  const netRectW = cylR * 2 + (cylCirc - cylR * 2) * tFold;
  const lidOffset = cylH / 2 + (cylR + 4) * tFold;

  // ──────────────────────────────────────────────────────────────────────────
  // Shape-specific In-Diagram Header Data
  // ──────────────────────────────────────────────────────────────────────────
  const getShapeSummary = () => {
    switch (shape) {
      case "cube":
        return { label: "Cube", desc: "6 Faces (Squares)" };
      case "prism":
        return { label: "Prism", desc: "5 Faces (2 Triangles + 3 Rectangles)" };
      case "pyramid":
        return { label: "Pyramid", desc: "5 Faces (1 Square + 4 Triangles)" };
      case "cylinder":
        return { label: "Cylinder", desc: "3 Faces (2 Circles + 1 Rectangle)" };
    }
  };

  const summary = getShapeSummary();

  const getFaceFill = (id: number) => {
    if (selectedFace === id) {
      return "rgba(255, 212, 94, 0.72)"; // Glowing Gold Active Surface
    }
    return "rgba(94, 232, 255, 0.38)";   // Persistent Electric Cyan 2D Surface across all faces
  };

  const getFaceStroke = (_id: number) => {
    return "rgba(255, 255, 255, 0.85)"; // Neutral white wireframe boundary
  };

  const getFaceStrokeWidth = (_id: number) => {
    return 1.5; // Always clean uniform stroke
  };

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-1 w-full pt-0.5 pb-1" onClick={stop} onPointerDown={stop}>
      {/* ── Descriptive Header Badge (Above SVG to prevent overlap) ── */}
      <div className="text-center text-xs sm:text-sm font-bold font-headline tracking-wide select-none" style={{ color: COLOR_FACE }}>
        {summary.desc}
      </div>

      {/* ── Large & Prominent Interactive 3D / 2D Canvas ── */}
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full touch-none select-none overflow-visible max-h-[205px]">

        {/* ───────── CUBE RENDERING ───────── */}
        {shape === "cube" && (
          <g>
            {/* Face 6: Bottom */}
            <polygon
              points={`${c_b_fl.x},${c_b_fl.y} ${c_b_fr.x},${c_b_fr.y} ${c_b_br.x},${c_b_br.y} ${c_b_bl.x},${c_b_bl.y}`}
              fill={getFaceFill(6)}
              stroke={getFaceStroke(6)}
              strokeWidth={getFaceStrokeWidth(6)}
              onPointerEnter={(e) => { if (e.pointerType === "mouse") setSelectedFace(6); }}
              onPointerLeave={(e) => { if (e.pointerType === "mouse") setSelectedFace(0); }}
              onClick={() => setSelectedFace(selectedFace === 6 ? 0 : 6)}
              className="cursor-pointer transition-colors"
            />
            {/* Face 2: Back */}
            <polygon
              points={`${c_b_bl.x},${c_b_bl.y} ${c_b_br.x},${c_b_br.y} ${c_bk_tr.x},${c_bk_tr.y} ${c_bk_tl.x},${c_bk_tl.y}`}
              fill={getFaceFill(2)}
              stroke={getFaceStroke(2)}
              strokeWidth={getFaceStrokeWidth(2)}
              onPointerEnter={(e) => { if (e.pointerType === "mouse") setSelectedFace(2); }}
              onPointerLeave={(e) => { if (e.pointerType === "mouse") setSelectedFace(0); }}
              onClick={() => setSelectedFace(selectedFace === 2 ? 0 : 2)}
              className="cursor-pointer transition-colors"
            />
            {/* Face 5: Top (Attached to Right face) */}
            <polygon
              points={`${c_r_tr.x},${c_r_tr.y} ${c_r_br.x},${c_r_br.y} ${c_top_br.x},${c_top_br.y} ${c_top_tr.x},${c_top_tr.y}`}
              fill={getFaceFill(5)}
              stroke={getFaceStroke(5)}
              strokeWidth={getFaceStrokeWidth(5)}
              onPointerEnter={(e) => { if (e.pointerType === "mouse") setSelectedFace(5); }}
              onPointerLeave={(e) => { if (e.pointerType === "mouse") setSelectedFace(0); }}
              onClick={() => setSelectedFace(selectedFace === 5 ? 0 : 5)}
              className="cursor-pointer transition-colors"
            />
            {/* Face 3: Left */}
            <polygon
              points={`${c_b_fl.x},${c_b_fl.y} ${c_b_bl.x},${c_b_bl.y} ${c_l_bl.x},${c_l_bl.y} ${c_l_tl.x},${c_l_tl.y}`}
              fill={getFaceFill(3)}
              stroke={getFaceStroke(3)}
              strokeWidth={getFaceStrokeWidth(3)}
              onPointerEnter={(e) => { if (e.pointerType === "mouse") setSelectedFace(3); }}
              onPointerLeave={(e) => { if (e.pointerType === "mouse") setSelectedFace(0); }}
              onClick={() => setSelectedFace(selectedFace === 3 ? 0 : 3)}
              className="cursor-pointer transition-colors"
            />
            {/* Face 4: Right */}
            <polygon
              points={`${c_b_fr.x},${c_b_fr.y} ${c_b_br.x},${c_b_br.y} ${c_r_br.x},${c_r_br.y} ${c_r_tr.x},${c_r_tr.y}`}
              fill={getFaceFill(4)}
              stroke={getFaceStroke(4)}
              strokeWidth={getFaceStrokeWidth(4)}
              onPointerEnter={(e) => { if (e.pointerType === "mouse") setSelectedFace(4); }}
              onPointerLeave={(e) => { if (e.pointerType === "mouse") setSelectedFace(0); }}
              onClick={() => setSelectedFace(selectedFace === 4 ? 0 : 4)}
              className="cursor-pointer transition-colors"
            />
            {/* Face 1: Front */}
            <polygon
              points={`${c_b_fl.x},${c_b_fl.y} ${c_b_fr.x},${c_b_fr.y} ${c_f_tr.x},${c_f_tr.y} ${c_f_tl.x},${c_f_tl.y}`}
              fill={getFaceFill(1)}
              stroke={getFaceStroke(1)}
              strokeWidth={getFaceStrokeWidth(1)}
              onPointerEnter={(e) => { if (e.pointerType === "mouse") setSelectedFace(1); }}
              onPointerLeave={(e) => { if (e.pointerType === "mouse") setSelectedFace(0); }}
              onClick={() => setSelectedFace(selectedFace === 1 ? 0 : 1)}
              className="cursor-pointer transition-colors"
            />
          </g>
        )}

        {/* ───────── PRISM RENDERING ───────── */}
        {shape === "prism" && (
          <g>
            {/* Face 5: Base Rectangle */}
            <polygon
              points={`${pb_fl.x},${pb_fl.y} ${pb_fr.x},${pb_fr.y} ${pb_br.x},${pb_br.y} ${pb_bl.x},${pb_bl.y}`}
              fill={getFaceFill(5)}
              stroke={getFaceStroke(5)}
              strokeWidth={getFaceStrokeWidth(5)}
              onPointerEnter={(e) => { if (e.pointerType === "mouse") setSelectedFace(5); }}
              onPointerLeave={(e) => { if (e.pointerType === "mouse") setSelectedFace(0); }}
              onClick={() => setSelectedFace(selectedFace === 5 ? 0 : 5)}
              className="cursor-pointer transition-colors"
            />
            {/* Face 2: Back Triangle */}
            <polygon
              points={`${pb_bl.x},${pb_bl.y} ${pb_br.x},${pb_br.y} ${pv_ba.x},${pv_ba.y}`}
              fill={getFaceFill(2)}
              stroke={getFaceStroke(2)}
              strokeWidth={getFaceStrokeWidth(2)}
              onPointerEnter={(e) => { if (e.pointerType === "mouse") setSelectedFace(2); }}
              onPointerLeave={(e) => { if (e.pointerType === "mouse") setSelectedFace(0); }}
              onClick={() => setSelectedFace(selectedFace === 2 ? 0 : 2)}
              className="cursor-pointer transition-colors"
            />
            {/* Face 4: Left Rectangle */}
            <polygon
              points={`${pb_fl.x},${pb_fl.y} ${pb_bl.x},${pb_bl.y} ${pv_l_back.x},${pv_l_back.y} ${pv_l_front.x},${pv_l_front.y}`}
              fill={getFaceFill(4)}
              stroke={getFaceStroke(4)}
              strokeWidth={getFaceStrokeWidth(4)}
              onPointerEnter={(e) => { if (e.pointerType === "mouse") setSelectedFace(4); }}
              onPointerLeave={(e) => { if (e.pointerType === "mouse") setSelectedFace(0); }}
              onClick={() => setSelectedFace(selectedFace === 4 ? 0 : 4)}
              className="cursor-pointer transition-colors"
            />
            {/* Face 3: Right Rectangle */}
            <polygon
              points={`${pb_fr.x},${pb_fr.y} ${pb_br.x},${pb_br.y} ${pv_r_back.x},${pv_r_back.y} ${pv_r_front.x},${pv_r_front.y}`}
              fill={getFaceFill(3)}
              stroke={getFaceStroke(3)}
              strokeWidth={getFaceStrokeWidth(3)}
              onPointerEnter={(e) => { if (e.pointerType === "mouse") setSelectedFace(3); }}
              onPointerLeave={(e) => { if (e.pointerType === "mouse") setSelectedFace(0); }}
              onClick={() => setSelectedFace(selectedFace === 3 ? 0 : 3)}
              className="cursor-pointer transition-colors"
            />
            {/* Face 1: Front Triangle */}
            <polygon
              points={`${pb_fl.x},${pb_fl.y} ${pb_fr.x},${pb_fr.y} ${pv_fa.x},${pv_fa.y}`}
              fill={getFaceFill(1)}
              stroke={getFaceStroke(1)}
              strokeWidth={getFaceStrokeWidth(1)}
              onPointerEnter={(e) => { if (e.pointerType === "mouse") setSelectedFace(1); }}
              onPointerLeave={(e) => { if (e.pointerType === "mouse") setSelectedFace(0); }}
              onClick={() => setSelectedFace(selectedFace === 1 ? 0 : 1)}
              className="cursor-pointer transition-colors"
            />
          </g>
        )}

        {/* ───────── PYRAMID RENDERING ───────── */}
        {shape === "pyramid" && (
          <g>
            {/* Face 1: Base Square */}
            <polygon
              points={`${pyrb_fl.x},${pyrb_fl.y} ${pyrb_fr.x},${pyrb_fr.y} ${pyrb_br.x},${pyrb_br.y} ${pyrb_bl.x},${pyrb_bl.y}`}
              fill={getFaceFill(1)}
              stroke={getFaceStroke(1)}
              strokeWidth={getFaceStrokeWidth(1)}
              onPointerEnter={(e) => { if (e.pointerType === "mouse") setSelectedFace(1); }}
              onPointerLeave={(e) => { if (e.pointerType === "mouse") setSelectedFace(0); }}
              onClick={() => setSelectedFace(selectedFace === 1 ? 0 : 1)}
              className="cursor-pointer transition-colors"
            />
            {/* Face 3: Back Triangle */}
            <polygon
              points={`${pyrb_bl.x},${pyrb_bl.y} ${pyrb_br.x},${pyrb_br.y} ${pyr_bk_apex.x},${pyr_bk_apex.y}`}
              fill={getFaceFill(3)}
              stroke={getFaceStroke(3)}
              strokeWidth={getFaceStrokeWidth(3)}
              onPointerEnter={(e) => { if (e.pointerType === "mouse") setSelectedFace(3); }}
              onPointerLeave={(e) => { if (e.pointerType === "mouse") setSelectedFace(0); }}
              onClick={() => setSelectedFace(selectedFace === 3 ? 0 : 3)}
              className="cursor-pointer transition-colors"
            />
            {/* Face 4: Left Triangle */}
            <polygon
              points={`${pyrb_fl.x},${pyrb_fl.y} ${pyrb_bl.x},${pyrb_bl.y} ${pyr_l_apex.x},${pyr_l_apex.y}`}
              fill={getFaceFill(4)}
              stroke={getFaceStroke(4)}
              strokeWidth={getFaceStrokeWidth(4)}
              onPointerEnter={(e) => { if (e.pointerType === "mouse") setSelectedFace(4); }}
              onPointerLeave={(e) => { if (e.pointerType === "mouse") setSelectedFace(0); }}
              onClick={() => setSelectedFace(selectedFace === 4 ? 0 : 4)}
              className="cursor-pointer transition-colors"
            />
            {/* Face 5: Right Triangle */}
            <polygon
              points={`${pyrb_fr.x},${pyrb_fr.y} ${pyrb_br.x},${pyrb_br.y} ${pyr_r_apex.x},${pyr_r_apex.y}`}
              fill={getFaceFill(5)}
              stroke={getFaceStroke(5)}
              strokeWidth={getFaceStrokeWidth(5)}
              onPointerEnter={(e) => { if (e.pointerType === "mouse") setSelectedFace(5); }}
              onPointerLeave={(e) => { if (e.pointerType === "mouse") setSelectedFace(0); }}
              onClick={() => setSelectedFace(selectedFace === 5 ? 0 : 5)}
              className="cursor-pointer transition-colors"
            />
            {/* Face 2: Front Triangle */}
            <polygon
              points={`${pyrb_fl.x},${pyrb_fl.y} ${pyrb_fr.x},${pyrb_fr.y} ${pyr_f_apex.x},${pyr_f_apex.y}`}
              fill={getFaceFill(2)}
              stroke={getFaceStroke(2)}
              strokeWidth={getFaceStrokeWidth(2)}
              onPointerEnter={(e) => { if (e.pointerType === "mouse") setSelectedFace(2); }}
              onPointerLeave={(e) => { if (e.pointerType === "mouse") setSelectedFace(0); }}
              onClick={() => setSelectedFace(selectedFace === 2 ? 0 : 2)}
              className="cursor-pointer transition-colors"
            />
          </g>
        )}

        {/* ───────── CYLINDER RENDERING (Full Smooth [0, 1] Progression) ───────── */}
        {shape === "cylinder" && (() => {
          const cylScale = 1.95 - 1.0 * p;
          const baseCR = 19;
          const baseCH = 42;
          const cR = baseCR * cylScale;
          const cH = baseCH * cylScale;
          const cCirc = 2 * Math.PI * (baseCR * 0.95);
          const bodyW = cR * 2 + (cCirc - cR * 2) * p;
          const cRy = 0.32 * cR;
          const arcRy = cRy * (1 - p);
          const topCy = (CY - cH / 2) - (cR + 4) * p;
          const botCy = (CY + cH / 2) + (cR + 4) * p;
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
              {/* 3D Hidden Dashed Back Arc when folded */}
              {p < 0.15 && (
                <path
                  d={`M ${CX - cR} ${CY + cH / 2} A ${cR} ${cRy} 0 0 1 ${CX + cR} ${CY + cH / 2}`}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.3)"
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                />
              )}

              {/* Face 3: Curved Body (Unrolls to Flat Rectangle) */}
              <path
                d={`M ${CX - bodyW / 2} ${CY - cH / 2} ${topPath} L ${CX + bodyW / 2} ${CY + cH / 2} ${botPath} Z`}
                fill={getFaceFill(3)}
                stroke={getFaceStroke(3)}
                strokeWidth={getFaceStrokeWidth(3)}
                onPointerEnter={(e) => { if (e.pointerType === "mouse") setSelectedFace(3); }}
                onPointerLeave={(e) => { if (e.pointerType === "mouse") setSelectedFace(0); }}
                onClick={() => setSelectedFace(selectedFace === 3 ? 0 : 3)}
                className="cursor-pointer transition-colors"
              />

              {/* Face 2: Bottom Circular Base */}
              <ellipse
                cx={CX}
                cy={botCy}
                rx={cR}
                ry={botRy}
                fill={getFaceFill(2)}
                stroke={getFaceStroke(2)}
                strokeWidth={getFaceStrokeWidth(2)}
                onPointerEnter={(e) => { if (e.pointerType === "mouse") setSelectedFace(2); }}
                onPointerLeave={(e) => { if (e.pointerType === "mouse") setSelectedFace(0); }}
                onClick={() => setSelectedFace(selectedFace === 2 ? 0 : 2)}
                className="cursor-pointer transition-colors"
              />

              {/* Face 1: Top Circular Base */}
              <ellipse
                cx={CX}
                cy={topCy}
                rx={cR}
                ry={topRy}
                fill={getFaceFill(1)}
                stroke={getFaceStroke(1)}
                strokeWidth={getFaceStrokeWidth(1)}
                onPointerEnter={(e) => { if (e.pointerType === "mouse") setSelectedFace(1); }}
                onPointerLeave={(e) => { if (e.pointerType === "mouse") setSelectedFace(0); }}
                onClick={() => setSelectedFace(selectedFace === 1 ? 0 : 1)}
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
            <div className="absolute inset-x-0 h-1.5 rounded-full bg-white/40 overflow-hidden pointer-events-none">
              <div
                className="h-full bg-white rounded-full"
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
