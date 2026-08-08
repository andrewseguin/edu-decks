import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import Home from "./page";

describe("reading-deck: Home Page Integration", () => {
  it("renders letter flash card, header controls, and session stats", async () => {
    render(<Home />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Select letters" })).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: "App settings" })).toBeInTheDocument();
    expect(screen.getByText("00:00")).toBeInTheDocument();
  });
});
