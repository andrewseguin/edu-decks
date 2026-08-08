import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeToggle } from "./theme-toggle";

const mockSetTheme = vi.fn();
vi.mock("next-themes", () => ({
  useTheme: () => ({
    resolvedTheme: "dark",
    setTheme: mockSetTheme,
  }),
}));

describe("landing-page: ThemeToggle", () => {
  it("renders theme toggle button and toggles theme on click", () => {
    render(<ThemeToggle />);

    const toggleBtn = screen.getByRole("button", {
      name: "Switch to light mode",
    });
    expect(toggleBtn).toBeInTheDocument();

    fireEvent.click(toggleBtn);
    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });
});
