import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { WholeNumberVisualizer } from "./WholeNumberVisualizer";
import { MathProblem } from "@/lib/types";

describe("arithmetic-deck: WholeNumberVisualizer", () => {
  const addProblem: MathProblem = {
    id: "add-1",
    num1: 4,
    num2: 3,
    operation: "+",
    answer: 7,
    displayText: "4 + 3",
    answerText: "7",
    problemSpeechText: "4 plus 3",
    answerSpeechText: "7",
    fullSpeechText: "4 plus 3 equals 7",
    speechText: "4 plus 3",
    isFraction: false,
  };

  it("renders ten-frame visual model for addition problem", () => {
    const { container } = render(
      <WholeNumberVisualizer
        problem={addProblem}
        activeStep={1}
        cyanVisible={4}
        orangeVisible={3}
        subtractionCount={0}
        whiteCount={0}
        onStepClick={vi.fn()}
        onReplay={vi.fn()}
      />
    );

    expect(container.firstChild).toBeInTheDocument();
  });
});
