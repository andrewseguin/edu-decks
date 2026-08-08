import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PrivacyPage from "./page";

describe("landing-page: PrivacyPage", () => {
  it("renders privacy policy view with title and sections", () => {
    render(<PrivacyPage />);

    expect(screen.getByRole("heading", { name: "Privacy Policy", level: 1 })).toBeInTheDocument();
    expect(screen.getAllByText(/EduDecks/).length).toBeGreaterThan(0);
    expect(screen.getByText("1. Overview")).toBeInTheDocument();
    expect(screen.getByText("2. Information Collection and Storage")).toBeInTheDocument();
  });
});
