import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StepControls } from "./StepControls";

describe("arithmetic-deck: StepControls", () => {
  it("renders step buttons and handles step click and replay", () => {
    const onStepClick = vi.fn();
    const onReplay = vi.fn();

    render(
      <StepControls
        steps={[
          { step: 1, label: "1. Start (3)", activeColor: "bg-cyan-300" },
          { step: 2, label: "2. Add (2)", activeColor: "bg-amber-300" },
        ]}
        activeStep={1}
        onStepClick={onStepClick}
        onReplay={onReplay}
      />
    );

    expect(screen.getByText("1. Start (3)")).toBeInTheDocument();
    expect(screen.getByText("2. Add (2)")).toBeInTheDocument();

    fireEvent.click(screen.getByText("2. Add (2)"));
    expect(onStepClick).toHaveBeenCalledWith(2);

    const replayBtn = screen.getByTitle("Replay animation");
    fireEvent.click(replayBtn);
    expect(onReplay).toHaveBeenCalledTimes(1);
  });
});
