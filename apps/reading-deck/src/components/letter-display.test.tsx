import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DECK_COLORS } from "@decks/core";
import { LetterDisplay } from "./letter-display";
import { DisplayContent } from "@/lib/types";

describe("reading-deck: LetterDisplay", () => {
  it("renders message content cleanly", () => {
    const messageContent: DisplayContent = {
      key: "msg-1",
      type: "message",
      value: "Choose some letters in the menu!",
    };

    render(
      <LetterDisplay
        content={messageContent}
        enableRecordings={true}
        enableTracing={true}
      />
    );

    expect(screen.getByText("Choose some letters in the menu!")).toBeInTheDocument();
  });

  it("renders letter flash card with listen button and uppercase/lowercase casing", () => {
    const letterContent: DisplayContent = {
      key: "letter-s",
      type: "letter",
      value: "s",
      color: DECK_COLORS.emerald.hex,
      textColor: "#FFFFFF",
    };

    const { rerender } = render(
      <LetterDisplay
        content={letterContent}
        enableRecordings={true}
        enableTracing={true}
        letterCase="lower"
      />
    );

    expect(screen.getByText("s")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Listen to sound" })).toBeInTheDocument();

    rerender(
      <LetterDisplay
        content={letterContent}
        enableRecordings={true}
        enableTracing={true}
        letterCase="upper"
      />
    );

    expect(screen.getByText("S")).toBeInTheDocument();
  });

  it("toggles tracing canvas mode on paint brush click", () => {
    const letterContent: DisplayContent = {
      key: "letter-a",
      type: "letter",
      value: "a",
      color: DECK_COLORS.emerald.hex,
      textColor: "#FFFFFF",
    };

    render(
      <LetterDisplay
        content={letterContent}
        enableRecordings={true}
        enableTracing={true}
      />
    );

    const traceBtn = screen.getByRole("button", { name: "Trace Letters" });
    fireEvent.click(traceBtn);

    expect(screen.getByRole("button", { name: "Exit Tracing Mode" })).toBeInTheDocument();
  });
});
