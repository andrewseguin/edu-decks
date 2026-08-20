"use client";

import React from "react";
import type { SvgDescriptor, SvgMutation } from "../types";
import { WHITE50 } from "./svg-primitives";

// ── Shape modules ────────────────────────────────────────────────────────────
import {
  AngleSingle, AngleSupplementary, AngleComplementary,
  AngleVerticallyOpposite, AngleReflex,
  AngleParallelAlternate, AngleParallelCointerior,
} from "./angle-shapes";
import { Triangle, RightTriangle } from "./triangle-shapes";
import { Rectangle, Parallelogram, Trapezoid, Rhombus } from "./quadrilateral-shapes";
import { Circle } from "./circle-shapes";
import { Polygon } from "./polygon-shapes";
import { Prism, Cylinder, Cone, Sphere, Pyramid } from "./solid-shapes";

// ── Re-exports (public API) ─────────────────────────────────────────────────
export { RightAngleMarker, SvgTriangle, computeRightTriangleVertices } from "./svg-primitives";

// ── Main renderer ───────────────────────────────────────────────────────────

export function renderShapeSvg(descriptor: SvgDescriptor, mutation?: SvgMutation): React.ReactElement {
  const { shape, dimensions, unknownDimension, labelMode } = descriptor;
  const dims = {
    ...dimensions,
    labelMode: dimensions.labelMode ?? labelMode,
    unknown: dimensions.unknown ?? unknownDimension,
  };

  switch (shape) {
    // Angles
    case "angle-single":              return <AngleSingle dims={dims} mutation={mutation} />;
    case "angle-supplementary":       return <AngleSupplementary dims={dims} mutation={mutation} />;
    case "angle-complementary":       return <AngleComplementary dims={dims} mutation={mutation} />;
    case "angle-vertically-opposite": return <AngleVerticallyOpposite dims={dims} mutation={mutation} />;
    case "angle-reflex":              return <AngleReflex dims={dims} />;
    case "angle-parallel-alternate":  return <AngleParallelAlternate dims={dims} />;
    case "angle-parallel-cointerior": return <AngleParallelCointerior dims={dims} />;
    // Triangles
    case "triangle":      return <Triangle dims={dims} mutation={mutation} />;
    case "right-triangle": return <RightTriangle dims={dims} mutation={mutation} />;
    // Quadrilaterals
    case "rectangle":     return <Rectangle dims={dims} mutation={mutation} />;
    case "parallelogram": return <Parallelogram dims={dims} mutation={mutation} />;
    case "trapezoid":     return <Trapezoid dims={dims} mutation={mutation} />;
    case "rhombus":       return <Rhombus dims={dims} mutation={mutation} />;
    // Circles
    case "circle":        return <Circle dims={dims} mutation={mutation} />;
    // Polygons
    case "polygon":       return <Polygon dims={dims} mutation={mutation} />;
    // 3D
    case "prism":         return <Prism dims={dims} mutation={mutation} />;
    case "cylinder":      return <Cylinder dims={dims} mutation={mutation} />;
    case "cone":          return <Cone dims={dims} mutation={mutation} />;
    case "sphere":        return <Sphere dims={dims} mutation={mutation} />;
    case "pyramid":       return <Pyramid dims={dims} mutation={mutation} />;
    default:
      return (
        <svg viewBox="0 0 200 180" className="w-full h-full" aria-hidden>
          <text x="100" y="90" textAnchor="middle" fontSize={14} fill={WHITE50} fontFamily="inherit">{shape}</text>
        </svg>
      );
  }
}
