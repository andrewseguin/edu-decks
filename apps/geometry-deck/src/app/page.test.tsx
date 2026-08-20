import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import GeometryDeckPage from "./page";

describe("geometry-deck: GeometryDeckPage Integration", () => {
  it("renders geometry card, header controls, and session stats", async () => {
    render(<GeometryDeckPage />);

    // Check header controls (topic selector and settings)
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Select topics" })).toBeDefined();
    });
    expect(screen.getByRole("button", { name: "App settings" })).toBeDefined();

    // Check stats (timer and card count)
    expect(screen.getByText("00:00")).toBeDefined();
  });

  it("opens topic selector and starts quiz mode", async () => {
    render(<GeometryDeckPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Select topics" })).toBeDefined();
    });

    fireEvent.click(screen.getByRole("button", { name: "Select topics" }));

    // Modal contents
    expect(screen.getByText("Topics")).toBeDefined();
    const startQuizBtn = screen.getByRole("button", { name: /Start Quiz/i });
    expect(startQuizBtn).toBeDefined();

    // Start quiz
    fireEvent.click(startQuizBtn);

    // Quiz overlay should now be visible
    expect(screen.getByRole("button", { name: /Exit Quiz/i })).toBeDefined();
    expect(screen.getByText("Answer:")).toBeDefined();
  });
});
