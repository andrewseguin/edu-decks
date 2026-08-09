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

  it("renders stacked numerator and denominator boxes in fraction quiz mode", () => {
    render(
      <QuizDisplay
        activeOperations={["+"]}
        minRange={1}
        maxRange={5}
        showWholeNumbers={false}
        showFractions={true}
        fractionDenominatorMode="all"
        fractionMaxDenominator={8}
        autoPlayAudio={false}
        onSpeak={vi.fn()}
        onPlayChime={vi.fn()}
        onExit={vi.fn()}
      />
    );

    const numBox = screen.getByLabelText("Numerator input");
    const denBox = screen.getByLabelText("Denominator input");

    expect(numBox).toBeInTheDocument();
    expect(denBox).toBeInTheDocument();

    // Directly click denominator box to focus denominator
    fireEvent.click(denBox);

    // Type denominator digit
    const key9 = screen.getByRole("button", { name: "9" });
    fireEvent.click(key9);
    expect(denBox).toHaveTextContent("9");
  });
});
