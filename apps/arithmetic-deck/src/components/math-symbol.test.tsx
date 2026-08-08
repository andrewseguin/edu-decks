import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MathSymbol } from "./math-symbol";

describe("arithmetic-deck: MathSymbol", () => {
  it("renders addition symbol", () => {
    render(<MathSymbol symbol="+" />);
    expect(screen.getByText("+")).toBeInTheDocument();
  });

  it("applies fraction offset when isFraction is true", () => {
    const { container } = render(<MathSymbol symbol="×" isFraction={true} />);
    expect(container.firstChild).toHaveClass("-translate-y-[0.14em]");
  });
});
