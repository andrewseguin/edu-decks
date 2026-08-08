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
});
