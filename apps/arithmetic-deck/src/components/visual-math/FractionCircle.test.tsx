import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { FractionCircle } from "./FractionCircle";

describe("arithmetic-deck: FractionCircle", () => {
  it("renders SVG slices for a fraction", () => {
    const { container } = render(
      <FractionCircle
        fraction={{ n: 3, d: 4 }}
        fillColor="fill-cyan-400"
        strokeColor="stroke-cyan-600"
        size={64}
      />
    );

    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    const paths = container.querySelectorAll("path");
    expect(paths.length).toBe(4); // 4 slices
  });
});
