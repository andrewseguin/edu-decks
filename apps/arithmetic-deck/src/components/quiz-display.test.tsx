import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QuizDisplay } from "./quiz-display";

describe("arithmetic-deck: QuizDisplay", () => {
  it("renders interactive math quiz display and responds to keypad input", () => {
    const onExit = vi.fn();
    const onSpeak = vi.fn();
    const onPlayChime = vi.fn();

    render(
      <QuizDisplay
        activeOperations={["+"]}
        minRange={1}
        maxRange={5}
        autoPlayAudio={false}
        onSpeak={onSpeak}
        onPlayChime={onPlayChime}
        onExit={onExit}
      />
    );

    expect(screen.getByText("+")).toBeInTheDocument();
    expect(screen.getByText("=")).toBeInTheDocument();

    const exitBtn = screen.getByRole("button", { name: /Exit Quiz/i });
    fireEvent.click(exitBtn);
    expect(onExit).toHaveBeenCalledTimes(1);
  });
});
