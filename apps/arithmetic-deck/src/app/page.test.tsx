import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MathDeckPage from "./page";

describe("arithmetic-deck: MathDeckPage Integration", () => {
  it("renders math card, header controls, and session stats", async () => {
    render(<MathDeckPage />);

    // Check Math card rendered with '=' sign
    await waitFor(() => {
      expect(screen.getByText("=")).toBeInTheDocument();
    });

    // Check header controls (operation selector and settings)
    expect(screen.getByRole("button", { name: "Select operations" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "App settings" })).toBeInTheDocument();

    // Check stats (timer and card count)
    expect(screen.getByText("00:00")).toBeInTheDocument();
    expect(screen.getAllByText("1").length).toBeGreaterThan(0);
  });

  it("opens operations selector and starts quiz mode", async () => {
    render(<MathDeckPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Select operations" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Select operations" }));

    // Modal contents
    expect(screen.getByText("Math Operations")).toBeInTheDocument();
    const startQuizBtn = screen.getByRole("button", { name: /Start Quiz/i });
    expect(startQuizBtn).toBeInTheDocument();

    // Start quiz
    fireEvent.click(startQuizBtn);

    // Quiz overlay should now be visible
    expect(screen.getByRole("button", { name: /Exit Quiz/i })).toBeInTheDocument();
  });
});
