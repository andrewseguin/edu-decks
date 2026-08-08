import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QuizDisplay } from "./quiz-display";

describe("reading-deck: QuizDisplay", () => {
  it("renders quiz with 4 option cards and handles exit", () => {
    const onExit = vi.fn();

    render(
      <QuizDisplay
        gameMode="letters"
        selectedLetters={["s", "a", "t", "p"]}
        selectedWordLengths={[3]}
        wordDifficulty="easy"
        letterCase="lower"
        optionCount={4}
        onExit={onExit}
      />
    );

    const exitBtn = screen.getByRole("button", { name: /Exit Quiz/i });
    expect(exitBtn).toBeInTheDocument();
    fireEvent.click(exitBtn);
    expect(onExit).toHaveBeenCalledTimes(1);
  });
});
