import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SessionStats } from "./session-stats";

describe("deck-core: SessionStats", () => {
  it("renders card count and formatted time elapsed (MM:SS)", () => {
    render(
      <SessionStats
        cardCount={14}
        timeElapsed={125} // 2 mins, 5 seconds
        showCardCount={true}
        showTimer={true}
      />
    );

    expect(screen.getByText("14")).toBeInTheDocument();
    expect(screen.getByText("02:05")).toBeInTheDocument();
  });

  it("hides card count when showCardCount is false", () => {
    render(
      <SessionStats
        cardCount={14}
        timeElapsed={60}
        showCardCount={false}
        showTimer={true}
      />
    );

    expect(screen.queryByText("14")).not.toBeInTheDocument();
    expect(screen.getByText("01:00")).toBeInTheDocument();
  });

  it("hides timer when showTimer is false", () => {
    render(
      <SessionStats
        cardCount={14}
        timeElapsed={60}
        showCardCount={true}
        showTimer={false}
      />
    );

    expect(screen.getByText("14")).toBeInTheDocument();
    expect(screen.queryByText("01:00")).not.toBeInTheDocument();
  });

  it("returns null when both showCardCount and showTimer are false", () => {
    const { container } = render(
      <SessionStats
        cardCount={14}
        timeElapsed={60}
        showCardCount={false}
        showTimer={false}
      />
    );

    expect(container.firstChild).toBeNull();
  });
});
