import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AppSettings } from "./app-settings";

describe("arithmetic-deck: AppSettings", () => {
  it("renders standard settings toggles and forwards changes", () => {
    const onShowCardCountChange = vi.fn();
    const onShowTimerChange = vi.fn();
    const onAutoPlayAudioChange = vi.fn();
    const onKeepScreenAwakeChange = vi.fn();

    render(
      <AppSettings
        open={true}
        onOpenChange={vi.fn()}
        showCardCount={true}
        onShowCardCountChange={onShowCardCountChange}
        showTimer={true}
        onShowTimerChange={onShowTimerChange}
        autoPlayAudio={false}
        onAutoPlayAudioChange={onAutoPlayAudioChange}
        keepScreenAwake={true}
        onKeepScreenAwakeChange={onKeepScreenAwakeChange}
      />
    );

    const cardCountSwitch = screen.getByRole("switch", { name: "Show Card Count" });
    fireEvent.click(cardCountSwitch);
    expect(onShowCardCountChange).toHaveBeenCalledWith(false);

    const link = screen.getByRole("link", { name: /More decks at edudecks\.org/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "https://edudecks.org");
  });
});
