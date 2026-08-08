import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  FlashCardShell,
  FrostedBadge,
  CardCornerButton,
} from "./flash-card-shell";

describe("deck-core: FlashCardShell & Subcomponents", () => {
  it("renders front content and background color properly", () => {
    render(
      <FlashCardShell
        frontContent={<div data-testid="front-text">Front Card</div>}
        backgroundColor="#1e293b"
      />
    );

    expect(screen.getByTestId("front-text")).toBeInTheDocument();
    expect(screen.getByText("Front Card")).toBeInTheDocument();
  });

  it("handles card tap events", () => {
    const onCardTap = vi.fn();
    render(
      <FlashCardShell onCardTap={onCardTap}>
        <div>Interactive Content</div>
      </FlashCardShell>
    );

    fireEvent.click(screen.getByText("Interactive Content"));
    expect(onCardTap).toHaveBeenCalledTimes(1);
  });

  it("renders speaker button and handles speak click without bubbling card tap", () => {
    const onCardTap = vi.fn();
    const onSpeak = vi.fn();

    render(
      <FlashCardShell
        onCardTap={onCardTap}
        onSpeak={onSpeak}
        showSpeaker={true}
        speakerAriaLabel="Read aloud"
      >
        <div>Content</div>
      </FlashCardShell>
    );

    const speakBtn = screen.getByRole("button", { name: "Read aloud" });
    expect(speakBtn).toBeInTheDocument();

    fireEvent.click(speakBtn);
    expect(onSpeak).toHaveBeenCalledTimes(1);
    expect(onCardTap).not.toHaveBeenCalled();
  });

  it("renders corner slots (topLeft, topRight, bottomLeft, bottomRight)", () => {
    render(
      <FlashCardShell
        topLeft={<span data-testid="tl">TL</span>}
        topRight={<span data-testid="tr">TR</span>}
        bottomLeft={<span data-testid="bl">BL</span>}
        bottomRight={<span data-testid="br">BR</span>}
      >
        <div>Center</div>
      </FlashCardShell>
    );

    expect(screen.getByTestId("tl")).toBeInTheDocument();
    expect(screen.getByTestId("tr")).toBeInTheDocument();
    expect(screen.getByTestId("bl")).toBeInTheDocument();
    expect(screen.getByTestId("br")).toBeInTheDocument();
  });

  it("renders FrostedBadge with custom content and flip state classes", () => {
    const { rerender } = render(<FrostedBadge isFlipped={false}>?</FrostedBadge>);
    expect(screen.getByText("?")).toBeInTheDocument();

    rerender(<FrostedBadge isFlipped={true}>Answer</FrostedBadge>);
    expect(screen.getByText("Answer")).toBeInTheDocument();
  });

  it("renders CardCornerButton with active and position states", () => {
    const onClick = vi.fn();
    render(
      <CardCornerButton
        position="top-left"
        isActive={true}
        onClick={onClick}
        ariaLabel="Corner Action"
      >
        <span>Icon</span>
      </CardCornerButton>
    );

    const btn = screen.getByRole("button", { name: "Corner Action" });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
