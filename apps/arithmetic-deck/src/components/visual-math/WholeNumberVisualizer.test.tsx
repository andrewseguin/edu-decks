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

  it("does not reveal the answer in multiplication step controls", () => {
    const multProblem: MathProblem = {
      id: "mult-1",
      num1: 3,
      num2: 4,
      operation: "×",
      answer: 12,
      displayText: "3 × 4",
      answerText: "12",
      problemSpeechText: "3 times 4",
      answerSpeechText: "12",
      fullSpeechText: "3 times 4 equals 12",
      speechText: "3 times 4",
      isFraction: false,
    };

    const { getByText, queryByText } = render(
      <WholeNumberVisualizer
        problem={multProblem}
        activeStep={1}
        cyanVisible={3}
        orangeVisible={4}
        subtractionCount={0}
        whiteCount={0}
        onStepClick={vi.fn()}
        onReplay={vi.fn()}
      />
    );

    expect(getByText("2. Math Grid")).toBeInTheDocument();
    expect(queryByText("2. Grid Area (12)")).toBeNull();
  });

  it("does not reveal the answer in division step controls", () => {
    const divProblem: MathProblem = {
      id: "div-1",
      num1: 12,
      num2: 3,
      operation: "÷",
      answer: 4,
      displayText: "12 ÷ 3",
      answerText: "4",
      problemSpeechText: "12 divided by 3",
      answerSpeechText: "4",
      fullSpeechText: "12 divided by 3 equals 4",
      speechText: "12 divided by 3",
      isFraction: false,
    };

    const { getByText, queryByText } = render(
      <WholeNumberVisualizer
        problem={divProblem}
        activeStep={1}
        cyanVisible={12}
        orangeVisible={0}
        subtractionCount={0}
        whiteCount={0}
        onStepClick={vi.fn()}
        onReplay={vi.fn()}
      />
    );

    expect(getByText("2. Form Groups (3)")).toBeInTheDocument();
    expect(queryByText("2. Groups (4×3)")).toBeNull();
  });
});
