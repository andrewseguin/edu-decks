import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QuizOverlayShell } from "./quiz-overlay-shell";

describe("deck-core: QuizOverlayShell", () => {
  it("renders score and streak header", () => {
    const onExit = vi.fn();
    render(
      <QuizOverlayShell score={12} streak={4} onExit={onExit}>
        <div data-testid="quiz-body">Question Body</div>
      </QuizOverlayShell>
    );

    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText(/4/)).toBeInTheDocument();
    expect(screen.getByTestId("quiz-body")).toBeInTheDocument();
  });

  it("handles exit quiz button click", () => {
    const onExit = vi.fn();
    render(
      <QuizOverlayShell score={0} streak={0} onExit={onExit}>
        <div>Quiz</div>
      </QuizOverlayShell>
    );

    const exitBtn = screen.getByRole("button", { name: /Exit quiz/i });
    fireEvent.click(exitBtn);
    expect(onExit).toHaveBeenCalledTimes(1);
  });

  it("renders and triggers replay audio button", () => {
    const onReplayAudio = vi.fn();
    const onExit = vi.fn();

    render(
      <QuizOverlayShell
        score={5}
        streak={2}
        onExit={onExit}
        onReplayAudio={onReplayAudio}
        replayLabel="Hear Question"
      >
        <div>Content</div>
      </QuizOverlayShell>
    );

    const replayBtn = screen.getByRole("button", { name: "Replay sound" });
    expect(screen.getByText("Hear Question")).toBeInTheDocument();

    fireEvent.click(replayBtn);
    expect(onReplayAudio).toHaveBeenCalledTimes(1);
  });

  it("hides streak badge when showStreak is false", () => {
    render(
      <QuizOverlayShell score={15} streak={5} showStreak={false} onExit={vi.fn()}>
        <div>Content</div>
      </QuizOverlayShell>
    );

    expect(screen.getByText("15")).toBeInTheDocument();
    expect(screen.queryByText(/🔥/)).not.toBeInTheDocument();
  });
});
