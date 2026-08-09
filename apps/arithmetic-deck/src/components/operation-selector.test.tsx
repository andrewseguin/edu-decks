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

  it("hides Number Range section when Fractions is selected", () => {
    render(
      <OperationSelector
        open={true}
        onOpenChange={vi.fn()}
        activeOperations={["+"]}
        onOperationToggle={vi.fn()}
        minRange={1}
        maxRange={10}
        onRangeChange={vi.fn()}
        showWholeNumbers={false}
        showFractions={true}
        onShowWholeNumbersChange={vi.fn()}
        onShowFractionsChange={vi.fn()}
        onStartQuiz={vi.fn()}
      />
    );

    expect(screen.queryByText("Number Range")).not.toBeInTheDocument();
    expect(screen.queryByText("1 - 10")).not.toBeInTheDocument();
    expect(screen.queryByText("Custom")).not.toBeInTheDocument();
  });

  it("handles switching number type", () => {
    const onShowWholeNumbersChange = vi.fn();
    const onShowFractionsChange = vi.fn();

    render(
      <OperationSelector
        open={true}
        onOpenChange={vi.fn()}
        activeOperations={["+"]}
        onOperationToggle={vi.fn()}
        minRange={1}
        maxRange={10}
        onRangeChange={vi.fn()}
        showWholeNumbers={true}
        onShowWholeNumbersChange={onShowWholeNumbersChange}
        showFractions={false}
        onShowFractionsChange={onShowFractionsChange}
        onStartQuiz={vi.fn()}
      />
    );

    const fractionsBtn = screen.getByRole("button", { name: "Fractions" });
    fireEvent.click(fractionsBtn);
    expect(onShowWholeNumbersChange).toHaveBeenCalledWith(false);
    expect(onShowFractionsChange).toHaveBeenCalledWith(true);
  });

  it("renders fraction options and handles changing denominator mode and max denominator", () => {
    const onFractionDenominatorModeChange = vi.fn();
    const onFractionMaxDenominatorChange = vi.fn();

    render(
      <OperationSelector
        open={true}
        onOpenChange={vi.fn()}
        activeOperations={["+"]}
        onOperationToggle={vi.fn()}
        minRange={1}
        maxRange={10}
        onRangeChange={vi.fn()}
        showWholeNumbers={false}
        showFractions={true}
        fractionDenominatorMode="all"
        onFractionDenominatorModeChange={onFractionDenominatorModeChange}
        fractionMaxDenominator={8}
        onFractionMaxDenominatorChange={onFractionMaxDenominatorChange}
        onShowWholeNumbersChange={vi.fn()}
        onShowFractionsChange={vi.fn()}
        onStartQuiz={vi.fn()}
      />
    );

    expect(screen.getByText("Denominators")).toBeInTheDocument();
    expect(screen.getByText("Max Denominator")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Same Only" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Different" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mixed" })).toBeInTheDocument();

    const sameBtn = screen.getByRole("button", { name: "Same Only" });
    fireEvent.click(sameBtn);
    expect(onFractionDenominatorModeChange).toHaveBeenCalledWith("same");

    const upTo4Btn = screen.getByRole("button", { name: "Up to 4" });
    fireEvent.click(upTo4Btn);
    expect(onFractionMaxDenominatorChange).toHaveBeenCalledWith(4);
  });
});
