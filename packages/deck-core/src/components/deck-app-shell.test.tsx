import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DeckAppShell } from "./deck-app-shell";

describe("deck-core: DeckAppShell", () => {
  it("renders children, header stats, and controls", () => {
    render(
      <DeckAppShell
        stats={<span data-testid="stats">10 Cards</span>}
        topRightControls={<button type="button">Settings</button>}
      >
        <div data-testid="card-playground">Card Content</div>
      </DeckAppShell>
    );

    expect(screen.getByTestId("stats")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByTestId("card-playground")).toBeInTheDocument();
  });

  it("hides controls when isLocked is true", () => {
    render(
      <DeckAppShell
        isLocked={true}
        stats={<span data-testid="stats">10 Cards</span>}
        topRightControls={<button type="button">Settings</button>}
      >
        <div>Content</div>
      </DeckAppShell>
    );

    expect(screen.queryByText("Settings")).not.toBeInTheDocument();
  });

  it("renders quizOverlay when provided", () => {
    render(
      <DeckAppShell
        quizOverlay={<div data-testid="quiz-overlay">Quiz Mode Active</div>}
      >
        <div>Main Card</div>
      </DeckAppShell>
    );

    expect(screen.getByTestId("quiz-overlay")).toBeInTheDocument();
  });
});
