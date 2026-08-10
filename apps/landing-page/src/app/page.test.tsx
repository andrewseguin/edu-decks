import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import HomePage from "./page";

vi.mock("next-themes", () => ({
  useTheme: () => ({
    resolvedTheme: "dark",
    setTheme: vi.fn(),
  }),
}));

describe("landing-page: HomePage", () => {
  it("renders portal header, headline, trust badges, and app showcases", () => {
    render(<HomePage />);

    expect(screen.getByText("EduDecks")).toBeInTheDocument();
    expect(
      screen.getByText("Simple learning cards.")
    ).toBeInTheDocument();

    // Trust badges
    expect(screen.getByText("100% Free")).toBeInTheDocument();
    expect(screen.getByText("Zero Ads or Trackers")).toBeInTheDocument();
    expect(screen.getByText("No Account Required")).toBeInTheDocument();
    expect(screen.getByText("Open Source")).toBeInTheDocument();

    // Showcase cards
    expect(screen.getByText("Arithmetic Deck")).toBeInTheDocument();
    expect(screen.getByText("Reading Deck")).toBeInTheDocument();

    // Footer Support and Issue links
    expect(screen.getByRole("link", { name: "support@edudecks.org" })).toHaveAttribute(
      "href",
      "mailto:support@edudecks.org"
    );
    expect(screen.getByRole("link", { name: "File Issues" })).toHaveAttribute(
      "href",
      "https://github.com/edu-decks/edu-decks/issues"
    );
  });

  it("handles screenshot tab switching on showcase cards", () => {
    render(<HomePage />);

    const quizTabs = screen.getAllByRole("button", { name: "Quiz Mode" });
    expect(quizTabs.length).toBeGreaterThan(0);

    fireEvent.click(quizTabs[0]);
  });
});
