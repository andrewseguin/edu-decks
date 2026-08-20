import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QuizDisplay } from "./quiz-display";

describe("geometry-deck: QuizDisplay", () => {
  it("renders interactive geometry quiz display and responds to keypad input", () => {
    const onExit = vi.fn();
    const onSpeak = vi.fn();
    const onPlayChime = vi.fn();

    render(
      <QuizDisplay
        activeTopics={["triangles"]}
        measurementUnit="cm"
        autoPlayAudio={false}
        onSpeak={onSpeak}
        onPlayChime={onPlayChime}
        onExit={onExit}
      />
    );

    // Should display answer target label
    expect(screen.getByText("Answer:")).toBeDefined();

    // Keypad numbers should be present
    expect(screen.getByRole("button", { name: "1" })).toBeDefined();
    expect(screen.getByRole("button", { name: "9" })).toBeDefined();

    // Type a digit via keypad
    const key5 = screen.getByRole("button", { name: "5" });
    fireEvent.click(key5);

    // Delete button
    const deleteBtn = screen.getByRole("button", { name: /Delete last digit/i });
    expect(deleteBtn).toBeDefined();
    fireEvent.click(deleteBtn);

    // Exit quiz button
    const exitBtn = screen.getByRole("button", { name: /Exit Quiz/i });
    fireEvent.click(exitBtn);
    expect(onExit).toHaveBeenCalledTimes(1);
  });
});
