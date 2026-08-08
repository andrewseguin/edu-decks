import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QuizHeader } from "./quiz-header";

describe("arithmetic-deck: QuizHeader", () => {
  it("renders score, streak, exit button, and audio prompt button", () => {
    const onExit = vi.fn();
    const onAudioPrompt = vi.fn();

    render(
      <QuizHeader
        score={7}
        streak={3}
        isPlayingSound={false}
        onExit={onExit}
        onAudioPrompt={onAudioPrompt}
      />
    );

    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText(/3/)).toBeInTheDocument();

    const exitBtn = screen.getByRole("button", { name: /Exit Quiz/i });
    fireEvent.click(exitBtn);
    expect(onExit).toHaveBeenCalledTimes(1);

    const listenBtn = screen.getByRole("button", { name: "Replay equation audio" });
    fireEvent.click(listenBtn);
    expect(onAudioPrompt).toHaveBeenCalledTimes(1);
  });
});
