import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DeckSelectorModal } from "./deck-selector-modal";

describe("deck-core: DeckSelectorModal", () => {
  it("renders open modal with title, description, and children", () => {
    const onOpenChange = vi.fn();
    render(
      <DeckSelectorModal
        open={true}
        onOpenChange={onOpenChange}
        title="Select Math Operations"
        description="Choose operations to practice"
        triggerLabel="Pick Operations"
      >
        <div data-testid="operation-list">Addition, Subtraction</div>
      </DeckSelectorModal>
    );

    expect(screen.getByText("Select Math Operations")).toBeInTheDocument();
    expect(screen.getByText("Choose operations to practice")).toBeInTheDocument();
    expect(screen.getByTestId("operation-list")).toBeInTheDocument();
  });

  it("handles Start Quiz action in footer", () => {
    const onStartQuiz = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <DeckSelectorModal
        open={true}
        onOpenChange={onOpenChange}
        title="Letter Selection"
        onStartQuiz={onStartQuiz}
        startQuizLabel="Begin Letter Quiz"
      >
        <div>Letters</div>
      </DeckSelectorModal>
    );

    const startQuizBtn = screen.getByRole("button", { name: /Begin Letter Quiz/i });
    expect(startQuizBtn).toBeInTheDocument();

    fireEvent.click(startQuizBtn);
    expect(onStartQuiz).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("handles close button click", () => {
    const onOpenChange = vi.fn();
    render(
      <DeckSelectorModal
        open={true}
        onOpenChange={onOpenChange}
        title="Menu"
      >
        <div>Body</div>
      </DeckSelectorModal>
    );

    const closeBtn = screen.getByRole("button", { name: "Close menu" });
    fireEvent.click(closeBtn);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
