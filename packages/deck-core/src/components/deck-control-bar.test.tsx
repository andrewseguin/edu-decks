import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DeckControlBar } from "./deck-control-bar";

describe("deck-core: DeckControlBar", () => {
  it("renders children buttons cleanly", () => {
    render(
      <DeckControlBar>
        <button type="button">Prev</button>
        <button type="button">Next</button>
      </DeckControlBar>
    );

    expect(screen.getByText("Prev")).toBeInTheDocument();
    expect(screen.getByText("Next")).toBeInTheDocument();
  });

  it("applies position classes (top-right, top-left, flow)", () => {
    const { container, rerender } = render(
      <DeckControlBar position="top-right">
        <span>Content</span>
      </DeckControlBar>
    );

    expect(container.firstChild).toHaveClass("top-2.5");
    expect(container.firstChild).toHaveClass("right-2.5");

    rerender(
      <DeckControlBar position="top-left">
        <span>Content</span>
      </DeckControlBar>
    );

    expect(container.firstChild).toHaveClass("left-2.5");
  });
});
