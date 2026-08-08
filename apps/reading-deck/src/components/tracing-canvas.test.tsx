import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { TracingCanvas } from "./tracing-canvas";

describe("reading-deck: TracingCanvas", () => {
  it("renders canvas element for drawing and pointer events", () => {
    const { container } = render(<TracingCanvas contentKey="letter-s" />);
    const canvas = container.querySelector("canvas");
    expect(canvas).toBeInTheDocument();
  });
});
