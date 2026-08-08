import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DeckQuizManager } from "./deck-quiz-manager";

describe("deck-core: DeckQuizManager", () => {
  it("renders prompt, input, score, and streak", () => {
    const onExit = vi.fn();
    render(
      <DeckQuizManager
        score={8}
        streak={3}
        onExit={onExit}
        prompt={<div data-testid="quiz-prompt">What is 5 + 5?</div>}
        input={<div data-testid="quiz-keypad">Keypad Area</div>}
      />
    );

    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByTestId("quiz-prompt")).toBeInTheDocument();
    expect(screen.getByTestId("quiz-keypad")).toBeInTheDocument();
  });

  it("renders feedback banner on correct or incorrect result", () => {
    const onExit = vi.fn();
    const { rerender } = render(
      <DeckQuizManager
        score={1}
        streak={1}
        onExit={onExit}
        prompt={<div>Prompt</div>}
        input={<div>Input</div>}
        isCorrect={true}
        showFeedbackBanner={true}
      />
    );

    expect(screen.getByText("Correct!")).toBeInTheDocument();

    rerender(
      <DeckQuizManager
        score={1}
        streak={0}
        onExit={onExit}
        prompt={<div>Prompt</div>}
        input={<div>Input</div>}
        isCorrect={false}
        showFeedbackBanner={true}
      />
    );

    expect(screen.getByText("Try again")).toBeInTheDocument();
  });
});
