"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { useContainerWidth } from "@/hooks/use-container-width";
import { cn } from "@/lib/utils";

type InteractiveVertexProps = {
  color?: string;
};

type ShapeType = "cube" | "prism" | "pyramid" | "tetrahedron" | "cylinder";

const SVG_H = 225;
const COLOR_VERTEX = "#5ee8ff"; // Electric Cyan for Vertices (the concept being defined)
const COLOR_GOLD = "#ffd45e";   // Vibrant Gold for Hovered / Selected Vertex & Converging Edges

export function InteractiveVertexExplorer({ color }: InteractiveVertexProps) {
  const { containerRef, width: rawW } = useContainerWidth(320);
  const SVG_W = Math.max(280, Math.min(460, rawW - 24));
  const CX = SVG_W / 2;
  const CY = SVG_H / 2;

  const [shape, setShape] = useState<ShapeType>("cube");
  const [rotationDeg, setRotationDeg] = useState<number>(38); // 0..360
  const [selectedVertex, setSelectedVertex] = useState<number>(0);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const animRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const isDraggingRef = useRef(false);
  const lastDragXRef = useRef(0);
  const dragDistRef = useRef(0);

  const stop = useCallback((e: React.PointerEvent | React.MouseEvent) => e.stopPropagation(), []);

  const handleShapeChange = (newShape: ShapeType) => {
    setShape(newShape);
    setSelectedVertex(0);
  };

  // ──────────────────────────────────────────────────────────────────────────
  // Auto-Rotation Animation Loop
  // ──────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAutoRotating) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }

    const step = (time: number) => {
      if (lastTimeRef.current) {
        const dt = (time - lastTimeRef.current) / 1000;
        setRotationDeg((prev) => (prev + dt * 28) % 360);
      }
      lastTimeRef.current = time;
      animRef.current = requestAnimationFrame(step);
    };

    lastTimeRef.current = performance.now();
    animRef.current = requestAnimationFrame(step);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isAutoRotating]);

  // ──────────────────────────────────────────────────────────────────────────
  // 3D Camera & Projection
  // ──────────────────────────────────────────────────────────────────────────
  const yaw = (rotationDeg * Math.PI) / 180;
  const pitchDeg = 24; // Isometric down angle
  const pitch = (pitchDeg * Math.PI) / 180;

  const project = useCallback(
    (x: number, y: number, z: number) => {
      // Rotate around Y-axis (yaw)
      const x1 = x * Math.cos(yaw) + z * Math.sin(yaw);
      const z1 = -x * Math.sin(yaw) + z * Math.cos(yaw);
      // Pitch around X-axis
      const y2 = y * Math.cos(pitch) - z1 * Math.sin(pitch);
      const z2 = y * Math.sin(pitch) + z1 * Math.cos(pitch);
      return {
        x: CX + x1,
        y: CY - y2,
        z: z2,
      };
    },
    [yaw, pitch, CX, CY]
  );

  // ──────────────────────────────────────────────────────────────────────────
  // 3D Shapes Geometry, Vertices & Converging Incident Edges
  // ──────────────────────────────────────────────────────────────────────────

  // 1. CUBE (8 Vertices)
  const cubeS = 104;
  const hs = cubeS / 2;
  const c_b_fl = project(-hs, -hs, hs);
  const c_b_fr = project(hs, -hs, hs);
  const c_b_br = project(hs, -hs, -hs);
  const c_b_bl = project(-hs, -hs, -hs);

  const c_t_fl = project(-hs, hs, hs);
  const c_t_fr = project(hs, hs, hs);
  const c_t_br = project(hs, hs, -hs);
  const c_t_bl = project(-hs, hs, -hs);

  const cubeVertices = [
    { id: 1, p: c_b_fl, name: "Bottom Front-Left Corner" },
    { id: 2, p: c_b_fr, name: "Bottom Front-Right Corner" },
    { id: 3, p: c_b_br, name: "Bottom Back-Right Corner" },
    { id: 4, p: c_b_bl, name: "Bottom Back-Left Corner" },
    { id: 5, p: c_t_fl, name: "Top Front-Left Corner" },
    { id: 6, p: c_t_fr, name: "Top Front-Right Corner" },
    { id: 7, p: c_t_br, name: "Top Back-Right Corner" },
    { id: 8, p: c_t_bl, name: "Top Back-Left Corner" },
  ];

  const cubeEdges = [
    // Bottom Base (4)
    { id: 1, p1: c_b_fl, p2: c_b_fr, v1: 1, v2: 2 },
    { id: 2, p1: c_b_fr, p2: c_b_br, v1: 2, v2: 3 },
    { id: 3, p1: c_b_br, p2: c_b_bl, v1: 3, v2: 4 },
    { id: 4, p1: c_b_bl, p2: c_b_fl, v1: 4, v2: 1 },
    // Top Base (4)
    { id: 5, p1: c_t_fl, p2: c_t_fr, v1: 5, v2: 6 },
    { id: 6, p1: c_t_fr, p2: c_t_br, v1: 6, v2: 7 },
    { id: 7, p1: c_t_br, p2: c_t_bl, v1: 7, v2: 8 },
    { id: 8, p1: c_t_bl, p2: c_t_fl, v1: 8, v2: 5 },
    // Vertical Pillars (4)
    { id: 9, p1: c_b_fl, p2: c_t_fl, v1: 1, v2: 5 },
    { id: 10, p1: c_b_fr, p2: c_t_fr, v1: 2, v2: 6 },
    { id: 11, p1: c_b_br, p2: c_t_br, v1: 3, v2: 7 },
    { id: 12, p1: c_b_bl, p2: c_t_bl, v1: 4, v2: 8 },
  ];

  const cubeFaces = [
    { pts: [c_b_fl, c_b_fr, c_t_fr, c_t_fl] }, // Front
    { pts: [c_b_fr, c_b_br, c_t_br, c_t_fr] }, // Right
    { pts: [c_b_br, c_b_bl, c_t_bl, c_t_br] }, // Back
    { pts: [c_b_bl, c_b_fl, c_t_fl, c_t_bl] }, // Left
    { pts: [c_t_fl, c_t_fr, c_t_br, c_t_bl] }, // Top
    { pts: [c_b_fl, c_b_bl, c_b_br, c_b_fr] }, // Bottom
  ];

  // 2. TRIANGULAR PRISM (6 Vertices)
  const pW = 114;
  const pH = 90;
  const pL = 120;
  const pv_fl = project(-pW / 2, -pH / 2, pL / 2);
  const pv_fr = project(pW / 2, -pH / 2, pL / 2);
  const pv_fa = project(0, pH / 2, pL / 2);

  const pv_bl = project(-pW / 2, -pH / 2, -pL / 2);
  const pv_br = project(pW / 2, -pH / 2, -pL / 2);
  const pv_ba = project(0, pH / 2, -pL / 2);

  const prismVertices = [
    { id: 1, p: pv_fl, name: "Front Left Base Corner" },
    { id: 2, p: pv_fr, name: "Front Right Base Corner" },
    { id: 3, p: pv_fa, name: "Front Top Apex Corner" },
    { id: 4, p: pv_bl, name: "Back Left Base Corner" },
    { id: 5, p: pv_br, name: "Back Right Base Corner" },
    { id: 6, p: pv_ba, name: "Back Top Apex Corner" },
  ];

  const prismEdges = [
    // Front Triangle (3)
    { id: 1, p1: pv_fl, p2: pv_fr, v1: 1, v2: 2 },
    { id: 2, p1: pv_fr, p2: pv_fa, v1: 2, v2: 3 },
    { id: 3, p1: pv_fa, p2: pv_fl, v1: 3, v2: 1 },
    // Back Triangle (3)
    { id: 4, p1: pv_bl, p2: pv_br, v1: 4, v2: 5 },
    { id: 5, p1: pv_br, p2: pv_ba, v1: 5, v2: 6 },
    { id: 6, p1: pv_ba, p2: pv_bl, v1: 6, v2: 4 },
    // Lengthwise Edges (3)
    { id: 7, p1: pv_fl, p2: pv_bl, v1: 1, v2: 4 },
    { id: 8, p1: pv_fr, p2: pv_br, v1: 2, v2: 5 },
    { id: 9, p1: pv_fa, p2: pv_ba, v1: 3, v2: 6 },
  ];

  const prismFaces = [
    { pts: [pv_fl, pv_fr, pv_fa] }, // Front Triangle
    { pts: [pv_bl, pv_ba, pv_br] }, // Back Triangle
    { pts: [pv_fl, pv_bl, pv_br, pv_fr] }, // Bottom Base
    { pts: [pv_fl, pv_fa, pv_ba, pv_bl] }, // Left Slant
    { pts: [pv_fr, pv_br, pv_ba, pv_fa] }, // Right Slant
  ];

  // 3. SQUARE PYRAMID (5 Vertices)
  const pyrW = 118;
  const pyrH = 100;
  const py_fl = project(-pyrW / 2, -pyrH / 3, pyrW / 2);
  const py_fr = project(pyrW / 2, -pyrH / 3, pyrW / 2);
  const py_br = project(pyrW / 2, -pyrH / 3, -pyrW / 2);
  const py_bl = project(-pyrW / 2, -pyrH / 3, -pyrW / 2);
  const py_apex = project(0, (2 * pyrH) / 3, 0);

  const pyramidVertices = [
    { id: 1, p: py_fl, name: "Front Left Base Corner" },
    { id: 2, p: py_fr, name: "Front Right Base Corner" },
    { id: 3, p: py_br, name: "Back Right Base Corner" },
    { id: 4, p: py_bl, name: "Back Left Base Corner" },
    { id: 5, p: py_apex, name: "Top Apex Peak (4 Edges Meet)" },
  ];

  const pyramidEdges = [
    // Base Square (4)
    { id: 1, p1: py_fl, p2: py_fr, v1: 1, v2: 2 },
    { id: 2, p1: py_fr, p2: py_br, v1: 2, v2: 3 },
    { id: 3, p1: py_br, p2: py_bl, v1: 3, v2: 4 },
    { id: 4, p1: py_bl, p2: py_fl, v1: 4, v2: 1 },
    // Slant Edges to Apex (4)
    { id: 5, p1: py_fl, p2: py_apex, v1: 1, v2: 5 },
    { id: 6, p1: py_fr, p2: py_apex, v1: 2, v2: 5 },
    { id: 7, p1: py_br, p2: py_apex, v1: 3, v2: 5 },
    { id: 8, p1: py_bl, p2: py_apex, v1: 4, v2: 5 },
  ];

  const pyramidFaces = [
    { pts: [py_fl, py_fr, py_apex] }, // Front
    { pts: [py_fr, py_br, py_apex] }, // Right
    { pts: [py_br, py_bl, py_apex] }, // Back
    { pts: [py_bl, py_fl, py_apex] }, // Left
    { pts: [py_fl, py_bl, py_br, py_fr] }, // Bottom
  ];

  // 4. TETRAHEDRON (4 Vertices)
  const tetS = 114;
  const tetH = 96;
  const tv_apex = project(0, (2 * tetH) / 3, 0);
  const tv_f = project(0, -tetH / 3, tetS * 0.58);
  const tv_bl = project(-tetS * 0.5, -tetH / 3, -tetS * 0.29);
  const tv_br = project(tetS * 0.5, -tetH / 3, -tetS * 0.29);

  const tetraVertices = [
    { id: 1, p: tv_f, name: "Front Base Corner" },
    { id: 2, p: tv_br, name: "Back Right Base Corner" },
    { id: 3, p: tv_bl, name: "Back Left Base Corner" },
    { id: 4, p: tv_apex, name: "Top Apex Peak (3 Edges Meet)" },
  ];

  const tetraEdges = [
    // Base Triangle (3)
    { id: 1, p1: tv_f, p2: tv_br, v1: 1, v2: 2 },
    { id: 2, p1: tv_br, p2: tv_bl, v1: 2, v2: 3 },
    { id: 3, p1: tv_bl, p2: tv_f, v1: 3, v2: 1 },
    // Slant Edges to Apex (3)
    { id: 4, p1: tv_f, p2: tv_apex, v1: 1, v2: 4 },
    { id: 5, p1: tv_br, p2: tv_apex, v1: 2, v2: 4 },
    { id: 6, p1: tv_bl, p2: tv_apex, v1: 3, v2: 4 },
  ];

  const tetraFaces = [
    { pts: [tv_f, tv_br, tv_apex] }, // Front-Right
    { pts: [tv_bl, tv_f, tv_apex] }, // Front-Left
    { pts: [tv_br, tv_bl, tv_apex] }, // Back
    { pts: [tv_f, tv_bl, tv_br] },   // Bottom Base
  ];

  // 5. CYLINDER (0 Vertices)
  const cylR = 56;
  const cylH = 98;
  const topCenter = project(0, cylH / 2, 0);
  const botCenter = project(0, -cylH / 2, 0);
  const cylRy = cylR * Math.sin(pitch);

  const cylLeftTop = { x: topCenter.x - cylR, y: topCenter.y };
  const cylLeftBot = { x: botCenter.x - cylR, y: botCenter.y };
  const cylRightTop = { x: topCenter.x + cylR, y: topCenter.y };
  const cylRightBot = { x: botCenter.x + cylR, y: botCenter.y };

  // ──────────────────────────────────────────────────────────────────────────
  // Nearest Vertex Distance Calculations
  // ──────────────────────────────────────────────────────────────────────────
  const distSqToPoint = (px: number, py: number, vx: number, vy: number) => {
    const dx = px - vx;
    const dy = py - vy;
    return dx * dx + dy * dy;
  };

  const getClosestVertexData = (px: number, py: number) => {
    let closestId = 0;
    let minDistSq = Infinity;

    if (shape === "cube") {
      cubeVertices.forEach((v) => {
        const dSq = distSqToPoint(px, py, v.p.x, v.p.y);
        if (dSq < minDistSq) {
          minDistSq = dSq;
          closestId = v.id;
        }
      });
    } else if (shape === "prism") {
      prismVertices.forEach((v) => {
        const dSq = distSqToPoint(px, py, v.p.x, v.p.y);
        if (dSq < minDistSq) {
          minDistSq = dSq;
          closestId = v.id;
        }
      });
    } else if (shape === "pyramid") {
      pyramidVertices.forEach((v) => {
        const dSq = distSqToPoint(px, py, v.p.x, v.p.y);
        if (dSq < minDistSq) {
          minDistSq = dSq;
          closestId = v.id;
        }
      });
    } else if (shape === "tetrahedron") {
      tetraVertices.forEach((v) => {
        const dSq = distSqToPoint(px, py, v.p.x, v.p.y);
        if (dSq < minDistSq) {
          minDistSq = dSq;
          closestId = v.id;
        }
      });
    }

    return { closestId, minDistSq };
  };

  // ──────────────────────────────────────────────────────────────────────────
  // Canvas Drag to Rotate & Tap to Select
  // ──────────────────────────────────────────────────────────────────────────
  const handleCanvasPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    stop(e);
    if (isAutoRotating) setIsAutoRotating(false);
    isDraggingRef.current = true;
    lastDragXRef.current = e.clientX;
    dragDistRef.current = 0;
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  };

  const handleCanvasPointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    isDraggingRef.current = false;
    try {
      (e.currentTarget as Element).releasePointerCapture(e.pointerId);
    } catch {}

    // Tap detection for touch/click: if small drag distance, select/toggle nearest vertex
    if (dragDistRef.current < 6 && shape !== "cylinder") {
      const svg = e.currentTarget;
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());
      if (svgP) {
        const { closestId, minDistSq } = getClosestVertexData(svgP.x, svgP.y);
        if (minDistSq <= 5000 && closestId > 0) {
          setSelectedVertex((prev) => (prev === closestId ? 0 : closestId));
        }
      }
    }
  };

  const handleSvgPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (isDraggingRef.current) {
      const dx = e.clientX - lastDragXRef.current;
      lastDragXRef.current = e.clientX;
      dragDistRef.current += Math.abs(dx);
      setRotationDeg((prev) => (prev + dx * 0.75 + 360) % 360);
      return;
    }

    if (e.pointerType !== "mouse" || shape === "cylinder") return;
    const svg = e.currentTarget;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    if (!svgP) return;

    const { closestId, minDistSq } = getClosestVertexData(svgP.x, svgP.y);

    if (minDistSq > 5000) {
      if (selectedVertex !== 0) setSelectedVertex(0);
      return;
    }

    if (selectedVertex === 0) {
      setSelectedVertex(closestId);
      return;
    }

    if (closestId === selectedVertex) return;

    // Hysteresis calculation to prevent boundary jitter
    let currentDistSq = Infinity;
    if (shape === "cube") {
      const cur = cubeVertices.find((v) => v.id === selectedVertex);
      if (cur) currentDistSq = distSqToPoint(svgP.x, svgP.y, cur.p.x, cur.p.y);
    } else if (shape === "prism") {
      const cur = prismVertices.find((v) => v.id === selectedVertex);
      if (cur) currentDistSq = distSqToPoint(svgP.x, svgP.y, cur.p.x, cur.p.y);
    } else if (shape === "pyramid") {
      const cur = pyramidVertices.find((v) => v.id === selectedVertex);
      if (cur) currentDistSq = distSqToPoint(svgP.x, svgP.y, cur.p.x, cur.p.y);
    } else if (shape === "tetrahedron") {
      const cur = tetraVertices.find((v) => v.id === selectedVertex);
      if (cur) currentDistSq = distSqToPoint(svgP.x, svgP.y, cur.p.x, cur.p.y);
    }

    const currentDist = Math.sqrt(currentDistSq);
    const candidateDist = Math.sqrt(minDistSq);

    // Direct hover override if very close (<= 14px)
    if (candidateDist <= 14) {
      setSelectedVertex(closestId);
      return;
    }

    // Gentle 4px hysteresis
    if (candidateDist < currentDist - 4) {
      setSelectedVertex(closestId);
    }
  };

  const handleSvgPointerLeave = (e: React.PointerEvent<SVGSVGElement>) => {
    isDraggingRef.current = false;
    if (e.pointerType === "mouse") {
      setSelectedVertex(0);
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // Shape-specific In-Diagram Header Data
  // ──────────────────────────────────────────────────────────────────────────
  const getShapeSummary = () => {
    switch (shape) {
      case "cube":
        return { label: "Cube", desc: "8 Vertices (Corner Points)" };
      case "prism":
        return { label: "Prism", desc: "6 Vertices (3 Front + 3 Back)" };
      case "pyramid":
        return { label: "Pyramid", desc: "5 Vertices (1 Apex + 4 Base Corners)" };
      case "tetrahedron":
        return { label: "Tetrahedron", desc: "4 Vertices (Corner Points)" };
      case "cylinder":
        return { label: "Cylinder", desc: "0 Vertices (No Corner Points)" };
    }
  };

  const summary = getShapeSummary();

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-1 w-full pt-0.5 pb-1" onClick={stop} onPointerDown={stop}>
      {/* ── Descriptive Header Badge (Above SVG to prevent overlap) ── */}
      <div className="text-center text-xs sm:text-sm font-bold font-headline tracking-wide select-none" style={{ color: COLOR_VERTEX }}>
        {summary.desc}
      </div>

      {/* ── Large & Prominent Interactive 3D Turntable Canvas ── */}
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        onPointerDown={handleCanvasPointerDown}
        onPointerMove={handleSvgPointerMove}
        onPointerUp={handleCanvasPointerUp}
        onPointerLeave={handleSvgPointerLeave}
        className="w-full touch-none select-none overflow-visible max-h-[225px] cursor-grab active:cursor-grabbing"
      >
        {/* ───────── CUBE RENDERING ───────── */}
        {shape === "cube" && (
          <g>
            {/* Shaded Translucent Faces */}
            {cubeFaces.map((face, idx) => (
              <polygon
                key={idx}
                points={face.pts.map((p) => `${p.x},${p.y}`).join(" ")}
                fill="rgba(255, 255, 255, 0.08)"
                stroke="none"
              />
            ))}

            {/* Base White Wireframe Edges */}
            {cubeEdges.map((e) => (
              <line
                key={e.id}
                x1={e.p1.x}
                y1={e.p1.y}
                x2={e.p2.x}
                y2={e.p2.y}
                stroke="rgba(255, 255, 255, 0.35)"
                strokeWidth={1.8}
                strokeLinecap="round"
              />
            ))}

            {/* Cyan Vertex Corner Dots (Electric Cyan by default, Glowing Gold on hover/select) */}
            {cubeVertices.map((v) => {
              const isSel = selectedVertex === v.id;
              return (
                <g key={v.id}>
                  {isSel && (
                    <circle
                      cx={v.p.x}
                      cy={v.p.y}
                      r={10}
                      fill="none"
                      stroke={COLOR_GOLD}
                      strokeWidth={2}
                      opacity={0.7}
                      className="pointer-events-none animate-pulse"
                    />
                  )}
                  <circle
                    cx={v.p.x}
                    cy={v.p.y}
                    r={isSel ? 7.5 : 5.5}
                    fill={isSel ? COLOR_GOLD : COLOR_VERTEX}
                    stroke="#000000"
                    strokeWidth={1.5}
                    className="pointer-events-none transition-transform"
                  />
                </g>
              );
            })}
          </g>
        )}

        {/* ───────── PRISM RENDERING ───────── */}
        {shape === "prism" && (
          <g>
            {/* Shaded Translucent Faces */}
            {prismFaces.map((face, idx) => (
              <polygon
                key={idx}
                points={face.pts.map((p) => `${p.x},${p.y}`).join(" ")}
                fill="rgba(255, 255, 255, 0.08)"
                stroke="none"
              />
            ))}

            {/* Base White Wireframe Edges */}
            {prismEdges.map((e) => (
              <line
                key={e.id}
                x1={e.p1.x}
                y1={e.p1.y}
                x2={e.p2.x}
                y2={e.p2.y}
                stroke="rgba(255, 255, 255, 0.35)"
                strokeWidth={1.8}
                strokeLinecap="round"
              />
            ))}

            {/* Cyan Vertex Corner Dots */}
            {prismVertices.map((v) => {
              const isSel = selectedVertex === v.id;
              return (
                <g key={v.id}>
                  {isSel && (
                    <circle
                      cx={v.p.x}
                      cy={v.p.y}
                      r={10}
                      fill="none"
                      stroke={COLOR_GOLD}
                      strokeWidth={2}
                      opacity={0.7}
                      className="pointer-events-none animate-pulse"
                    />
                  )}
                  <circle
                    cx={v.p.x}
                    cy={v.p.y}
                    r={isSel ? 7.5 : 5.5}
                    fill={isSel ? COLOR_GOLD : COLOR_VERTEX}
                    stroke="#000000"
                    strokeWidth={1.5}
                    className="pointer-events-none transition-transform"
                  />
                </g>
              );
            })}
          </g>
        )}

        {/* ───────── PYRAMID RENDERING ───────── */}
        {shape === "pyramid" && (
          <g>
            {/* Shaded Translucent Faces */}
            {pyramidFaces.map((face, idx) => (
              <polygon
                key={idx}
                points={face.pts.map((p) => `${p.x},${p.y}`).join(" ")}
                fill="rgba(255, 255, 255, 0.08)"
                stroke="none"
              />
            ))}

            {/* Base White Wireframe Edges */}
            {pyramidEdges.map((e) => (
              <line
                key={e.id}
                x1={e.p1.x}
                y1={e.p1.y}
                x2={e.p2.x}
                y2={e.p2.y}
                stroke="rgba(255, 255, 255, 0.35)"
                strokeWidth={1.8}
                strokeLinecap="round"
              />
            ))}

            {/* Cyan Vertex Corner Dots */}
            {pyramidVertices.map((v) => {
              const isSel = selectedVertex === v.id;
              return (
                <g key={v.id}>
                  {isSel && (
                    <circle
                      cx={v.p.x}
                      cy={v.p.y}
                      r={10}
                      fill="none"
                      stroke={COLOR_GOLD}
                      strokeWidth={2}
                      opacity={0.7}
                      className="pointer-events-none animate-pulse"
                    />
                  )}
                  <circle
                    cx={v.p.x}
                    cy={v.p.y}
                    r={isSel ? 7.5 : 5.5}
                    fill={isSel ? COLOR_GOLD : COLOR_VERTEX}
                    stroke="#000000"
                    strokeWidth={1.5}
                    className="pointer-events-none transition-transform"
                  />
                </g>
              );
            })}
          </g>
        )}

        {/* ───────── TETRAHEDRON RENDERING ───────── */}
        {shape === "tetrahedron" && (
          <g>
            {/* Shaded Translucent Faces */}
            {tetraFaces.map((face, idx) => (
              <polygon
                key={idx}
                points={face.pts.map((p) => `${p.x},${p.y}`).join(" ")}
                fill="rgba(255, 255, 255, 0.08)"
                stroke="none"
              />
            ))}

            {/* Base White Wireframe Edges */}
            {tetraEdges.map((e) => (
              <line
                key={e.id}
                x1={e.p1.x}
                y1={e.p1.y}
                x2={e.p2.x}
                y2={e.p2.y}
                stroke="rgba(255, 255, 255, 0.35)"
                strokeWidth={1.8}
                strokeLinecap="round"
              />
            ))}

            {/* Cyan Vertex Corner Dots */}
            {tetraVertices.map((v) => {
              const isSel = selectedVertex === v.id;
              return (
                <g key={v.id}>
                  {isSel && (
                    <circle
                      cx={v.p.x}
                      cy={v.p.y}
                      r={10}
                      fill="none"
                      stroke={COLOR_GOLD}
                      strokeWidth={2}
                      opacity={0.7}
                      className="pointer-events-none animate-pulse"
                    />
                  )}
                  <circle
                    cx={v.p.x}
                    cy={v.p.y}
                    r={isSel ? 7.5 : 5.5}
                    fill={isSel ? COLOR_GOLD : COLOR_VERTEX}
                    stroke="#000000"
                    strokeWidth={1.5}
                    className="pointer-events-none"
                  />
                </g>
              );
            })}
          </g>
        )}

        {/* ───────── CYLINDER RENDERING (0 Vertices) ───────── */}
        {shape === "cylinder" && (
          <g>
            {/* Shaded Body Fill */}
            <path
              d={`M ${cylLeftTop.x} ${cylLeftTop.y} L ${cylRightTop.x} ${cylRightTop.y} L ${cylRightBot.x} ${cylRightBot.y} A ${cylR} ${cylRy} 0 0 1 ${cylLeftBot.x} ${cylLeftBot.y} Z`}
              fill="rgba(255, 255, 255, 0.08)"
              stroke="none"
            />

            {/* Side Silhouette Wall Lines */}
            <line x1={cylLeftTop.x} y1={cylLeftTop.y} x2={cylLeftBot.x} y2={cylLeftBot.y} stroke="rgba(255, 255, 255, 0.35)" strokeWidth={1.8} />
            <line x1={cylRightTop.x} y1={cylRightTop.y} x2={cylRightBot.x} y2={cylRightBot.y} stroke="rgba(255, 255, 255, 0.35)" strokeWidth={1.8} />

            {/* Dashed Back Half-Rim of Bottom Base */}
            <path
              d={`M ${botCenter.x - cylR} ${botCenter.y} A ${cylR} ${cylRy} 0 0 1 ${botCenter.x + cylR} ${botCenter.y}`}
              fill="none"
              stroke="rgba(255, 255, 255, 0.25)"
              strokeWidth={1.8}
              strokeDasharray="4 3"
            />

            {/* Front Half-Rim of Bottom Base */}
            <path
              d={`M ${botCenter.x - cylR} ${botCenter.y} A ${cylR} ${cylRy} 0 0 0 ${botCenter.x + cylR} ${botCenter.y}`}
              fill="none"
              stroke="rgba(255, 255, 255, 0.35)"
              strokeWidth={1.8}
            />

            {/* Top Circular Rim */}
            <ellipse
              cx={topCenter.x}
              cy={topCenter.y}
              rx={cylR}
              ry={cylRy}
              fill="rgba(255, 255, 255, 0.12)"
              stroke="rgba(255, 255, 255, 0.35)"
              strokeWidth={1.8}
            />
          </g>
        )}
      </svg>

      {/* ── Minimalist Bottom Controls: Shape Switcher ── */}
      <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-1.5 py-0.5 rounded-full border border-white/25 shadow-sm pointer-events-auto select-none z-30">
        {(["cube", "prism", "pyramid", "tetrahedron", "cylinder"] as const).map((s) => {
          const isActive = shape === s;
          const label = s === "tetrahedron" ? "Tetrahedron" : s.charAt(0).toUpperCase() + s.slice(1);
          return (
            <button
              key={s}
              type="button"
              onClick={() => handleShapeChange(s)}
              className={cn(
                "px-2.5 py-0.5 rounded-full text-xs font-headline font-bold transition-all border-none whitespace-nowrap shrink-0",
                isActive
                  ? "bg-white/25 text-white shadow-sm"
                  : "bg-transparent text-white/70 hover:text-white"
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
