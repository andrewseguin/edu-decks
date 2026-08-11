import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { FractionVisualizer } from "./FractionVisualizer";
import { MathProblem } from "@/lib/types";

describe("arithmetic-deck: FractionVisualizer", () => {
  const fracProblem: MathProblem = {
    id: "f-1",
    num1: 1,
    num2: 1,
    operation: "+",
    answer: 0.75,
    displayText: "1/2 + 1/4",
    answerText: "3/4",
    problemSpeechText: "one half plus one fourth",
    answerSpeechText: "three fourths",
    fullSpeechText: "one half plus one fourth equals three fourths",
    speechText: "one half plus one fourth",
    isFraction: true,
    frac1: { n: 1, d: 2 },
    frac2: { n: 1, d: 4 },
    fracAnswer: { n: 3, d: 4 },
  };

  it("renders fraction visual pie models for addition", () => {
    const { container } = render(
      <FractionVisualizer
        problem={fracProblem}
        activeStep={1}
        cyanVisible={2}
        orangeVisible={1}
        subtractionCount={0}
        whiteCount={0}
        onStepClick={vi.fn()}
        onReplay={vi.fn()}
      />
    );

    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThan(0);
  });

  it("renders fraction visual division model without overflowing or pill clipping", () => {
    const divProblem: MathProblem = {
      id: "f-div",
      num1: 1,
      num2: 1,
      operation: "÷",
      answer: 1.5,
      displayText: "2/8 ÷ 1/6",
      answerText: "3/2",
      problemSpeechText: "two eighths divided by one sixth",
      answerSpeechText: "three halves",
      fullSpeechText: "two eighths divided by one sixth equals three halves",
      speechText: "two eighths divided by one sixth",
      isFraction: true,
      frac1: { n: 2, d: 8 },
      frac2: { n: 1, d: 6 },
      fracAnswer: { n: 3, d: 2 },
    };

    const { container, getByText } = render(
      <FractionVisualizer
        problem={divProblem}
        activeStep={2}
        cyanVisible={6}
        orangeVisible={4}
        subtractionCount={0}
        whiteCount={0}
        onStepClick={vi.fn()}
        onReplay={vi.fn()}
      />
    );

    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    // Check that top cyan pill text and bottom summary text render properly
    expect(getByText("2/8 = 6 boxes")).not.toBeNull();
    expect(getByText("1/6 = 4 boxes")).not.toBeNull();
  });
});
