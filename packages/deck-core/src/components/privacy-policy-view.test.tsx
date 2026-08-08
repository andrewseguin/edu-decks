import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PrivacyPolicyView } from "./privacy-policy-view";

describe("deck-core: PrivacyPolicyView", () => {
  it("renders privacy policy with app name and COPPA compliance details", () => {
    render(<PrivacyPolicyView appName="Math Decks" />);

    expect(screen.getByText("Privacy Policy")).toBeInTheDocument();
    expect(screen.getByText(/Math Decks • Effective Date/)).toBeInTheDocument();
    expect(screen.getByText(/We do not collect, transmit, store, or sell any personally identifiable information/)).toBeInTheDocument();
    expect(screen.getByText(/Children's Privacy/)).toBeInTheDocument();
  });
});
