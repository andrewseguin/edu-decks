import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PrivacyPolicyView } from "./privacy-policy-view";

describe("deck-core: PrivacyPolicyView", () => {
  it("renders privacy policy with app name and COPPA compliance details", () => {
    render(<PrivacyPolicyView appName="Math Decks" />);

    expect(screen.getByRole("heading", { name: "Privacy Policy", level: 1 })).toBeInTheDocument();
    expect(screen.getAllByText(/Math Decks/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/EduDecks LLC/).length).toBeGreaterThan(0);
    expect(screen.getByText(/We do not collect, transmit, store, or sell any personally identifiable information/)).toBeInTheDocument();
    expect(screen.getByText(/Children's Privacy/)).toBeInTheDocument();
    expect(screen.getByText("Back to App")).toBeInTheDocument();
    expect(screen.getByText("Return to Math Decks")).toBeInTheDocument();
  });
});

