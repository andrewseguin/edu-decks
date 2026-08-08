import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LetterSelector } from "./letter-selector";

describe("reading-deck: LetterSelector", () => {
  it("renders open modal with game modes, letter levels, and quiz launcher", () => {
    const onOpenChange = vi.fn();
    const setSelectedLetters = vi.fn();
    const onGameModeChange = vi.fn();
    const onWordDifficultyChange = vi.fn();
    const onSelectedWordLengthsChange = vi.fn();
    const onLetterCaseChange = vi.fn();
    const onQuizOptionCountChange = vi.fn();
    const onStartQuiz = vi.fn();

    render(
      <LetterSelector
        open={true}
        selectedLetters={["s", "a", "t"]}
        setSelectedLetters={setSelectedLetters}
        onOpenChange={onOpenChange}
        gameMode="letters"
        onGameModeChange={onGameModeChange}
        wordDifficulty="easy"
        onWordDifficultyChange={onWordDifficultyChange}
        selectedWordLengths={[3, 4, 5]}
        onSelectedWordLengthsChange={onSelectedWordLengthsChange}
        letterCase="lower"
        onLetterCaseChange={onLetterCaseChange}
        quizOptionCount={4}
        onQuizOptionCountChange={onQuizOptionCountChange}
        onStartQuiz={onStartQuiz}
      />
    );

    expect(screen.getByText("Game Mode")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Letters" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Words" })).toBeInTheDocument();
    expect(screen.getByText("Level 1")).toBeInTheDocument();

    const startQuizBtn = screen.getByRole("button", { name: /Start Quiz/i });
    fireEvent.click(startQuizBtn);
    expect(onStartQuiz).toHaveBeenCalledTimes(1);
  });
});
