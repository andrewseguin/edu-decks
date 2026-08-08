import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FractionDisplay } from "./fraction-display";

describe("arithmetic-deck: FractionDisplay", () => {
  it("renders fraction with numerator and denominator", () => {
    render(<FractionDisplay fraction={{ n: 3, d: 4 }} />);

    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("renders whole number fraction as single value when denominator is 1", () => {
    render(<FractionDisplay fraction={{ n: 7, d: 1 }} />);

    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.queryByText("1")).not.toBeInTheDocument();
  });
});
