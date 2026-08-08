import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeToggleGroup } from "./theme-toggle-group";
import * as nextThemes from "next-themes";

vi.mock("next-themes", () => ({
  useTheme: vi.fn(),
}));

describe("deck-core: ThemeToggleGroup", () => {
  it("renders light, dark, and system options and triggers setTheme", () => {
    const setTheme = vi.fn();
    (nextThemes.useTheme as any).mockReturnValue({
      theme: "light",
      setTheme,
    });

    render(<ThemeToggleGroup />);

    expect(screen.getByText("Light")).toBeInTheDocument();
    expect(screen.getByText("Dark")).toBeInTheDocument();
    expect(screen.getByText("System")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Dark"));
    expect(setTheme).toHaveBeenCalledWith("dark");

    fireEvent.click(screen.getByText("System"));
    expect(setTheme).toHaveBeenCalledWith("system");
  });
});
