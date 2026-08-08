import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GameModeToggle } from "./game-mode-toggle";

describe("reading-deck: GameModeToggle", () => {
  it("renders Letters and Words toggle buttons and triggers onChange", () => {
    const onValueChange = vi.fn();
    render(
      <GameModeToggle
        value="letters"
        onValueChange={onValueChange}
        enableWords={true}
      />
    );

    expect(screen.getByRole("button", { name: "Letters" })).toBeInTheDocument();
    const wordsBtn = screen.getByRole("button", { name: "Words" });
    expect(wordsBtn).toBeInTheDocument();

    fireEvent.click(wordsBtn);
    expect(onValueChange).toHaveBeenCalledWith("words");
  });
});
