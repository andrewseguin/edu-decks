import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { OperationSelector } from "./operation-selector";

describe("arithmetic-deck: OperationSelector", () => {
  it("renders open modal with operations, number types, and range presets", () => {
    const onOpenChange = vi.fn();
    const onOperationToggle = vi.fn();
    const onRangeChange = vi.fn();
    const onShowWholeNumbersChange = vi.fn();
    const onShowFractionsChange = vi.fn();
    const onStartQuiz = vi.fn();

    render(
      <OperationSelector
        open={true}
        onOpenChange={onOpenChange}
        activeOperations={["+", "-"]}
        onOperationToggle={onOperationToggle}
        minRange={1}
        maxRange={10}
        onRangeChange={onRangeChange}
        showWholeNumbers={true}
        onShowWholeNumbersChange={onShowWholeNumbersChange}
        showFractions={false}
        onShowFractionsChange={onShowFractionsChange}
        onStartQuiz={onStartQuiz}
      />
    );

    expect(screen.getByText("Math Operations")).toBeInTheDocument();
    expect(screen.getByText("Addition")).toBeInTheDocument();
    expect(screen.getByText("Subtraction")).toBeInTheDocument();
    expect(screen.getByText("Multiplication")).toBeInTheDocument();
    expect(screen.getByText("Division")).toBeInTheDocument();

    // Presets
    expect(screen.getByText("1 - 10")).toBeInTheDocument();
    expect(screen.getByText("1 - 12")).toBeInTheDocument();

    // Start Quiz
    const quizBtn = screen.getByRole("button", { name: /Start Quiz/i });
    expect(quizBtn).toBeInTheDocument();
    fireEvent.click(quizBtn);
    expect(onStartQuiz).toHaveBeenCalledTimes(1);
  });

  it("handles toggling operations via checkbox button", () => {
    const onOperationToggle = vi.fn();

    render(
      <OperationSelector
        open={true}
        onOpenChange={vi.fn()}
        activeOperations={["+"]}
        onOperationToggle={onOperationToggle}
        minRange={1}
        maxRange={10}
        onRangeChange={vi.fn()}
        showWholeNumbers={true}
        onShowWholeNumbersChange={vi.fn()}
        showFractions={false}
        onShowFractionsChange={vi.fn()}
        onStartQuiz={vi.fn()}
      />
    );

    const multToggle = screen.getByRole("button", { name: "Select Multiplication" });
    fireEvent.click(multToggle);
    expect(onOperationToggle).toHaveBeenCalledWith("×");
  });
});
