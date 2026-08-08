import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QuizKeypad } from "./quiz-keypad";

describe("arithmetic-deck: QuizKeypad", () => {
  it("renders 0-9 number buttons and handles onKeyPress", () => {
    const onKeyPress = vi.fn();
    const onDelete = vi.fn();

    render(
      <QuizKeypad
        hexColor="#3b82f6"
        isFractionActive={false}
        onKeyPress={onKeyPress}
        onDelete={onDelete}
      />
    );

    for (let i = 0; i <= 9; i++) {
      expect(screen.getByRole("button", { name: String(i) })).toBeInTheDocument();
    }

    fireEvent.click(screen.getByRole("button", { name: "7" }));
    expect(onKeyPress).toHaveBeenCalledWith("7");

    fireEvent.click(screen.getByRole("button", { name: "Delete last digit" }));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("renders fraction slash button when isFractionActive is true", () => {
    const onKeyPress = vi.fn();

    render(
      <QuizKeypad
        hexColor="#3b82f6"
        isFractionActive={true}
        onKeyPress={onKeyPress}
        onDelete={vi.fn()}
      />
    );

    const fracBtn = screen.getByRole("button", { name: "Fraction bar" });
    expect(fracBtn).toBeInTheDocument();

    fireEvent.click(fracBtn);
    expect(onKeyPress).toHaveBeenCalledWith("/");
  });
});
