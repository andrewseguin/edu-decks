import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MathCard } from "./math-card";
import { MathProblem } from "@/lib/types";

describe("arithmetic-deck: MathCard", () => {
  const wholeProblem: MathProblem = {
    id: "test-1",
    num1: 6,
    num2: 4,
    operation: "+",
    answer: 10,
    displayText: "6 + 4",
    answerText: "10",
    problemSpeechText: "6 plus 4",
    answerSpeechText: "10",
    fullSpeechText: "6 plus 4 equals 10",
    speechText: "6 plus 4",
    isFraction: false,
  };

  it("renders front equation with numbers and operator", () => {
    const onSpeak = vi.fn();
    render(
      <MathCard
        problem={wholeProblem}
        isFlipped={false}
        slideDirection="next"
        onSpeak={onSpeak}
      />
    );

    expect(screen.getByText("6")).toBeInTheDocument();
    expect(screen.getByText("+")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("=")).toBeInTheDocument();
    // Frosted badge '?' is present on front
    expect(screen.getByText("?")).toBeInTheDocument();
  });

  it("handles card tap and speech on speak button click", () => {
    const onSpeak = vi.fn();
    const onCardTap = vi.fn();

    render(
      <MathCard
        problem={wholeProblem}
        isFlipped={false}
        slideDirection="next"
        onSpeak={onSpeak}
        onCardTap={onCardTap}
      />
    );

    const speakBtn = screen.getByRole("button", { name: "Listen to equation" });
    fireEvent.click(speakBtn);
    expect(onSpeak).toHaveBeenCalledWith("6 plus 4");

    // Click card
    fireEvent.click(screen.getByText("6"));
    expect(onCardTap).toHaveBeenCalled();
  });

  it("speaks answer text when card is flipped", () => {
    const onSpeak = vi.fn();
    render(
      <MathCard
        problem={wholeProblem}
        isFlipped={true}
        slideDirection="next"
        onSpeak={onSpeak}
      />
    );

    const speakBtn = screen.getByRole("button", { name: "Listen to equation" });
    fireEvent.click(speakBtn);
    expect(onSpeak).toHaveBeenCalledWith("10");
  });
});
