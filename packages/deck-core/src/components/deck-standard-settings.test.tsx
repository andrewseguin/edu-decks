import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DeckStandardSettings } from "./deck-standard-settings";

describe("deck-core: DeckStandardSettings", () => {
  it("renders all setting toggle switches and handles changes", () => {
    const onOpenChange = vi.fn();
    const onShowCardCountChange = vi.fn();
    const onShowTimerChange = vi.fn();
    const onAutoPlaySoundChange = vi.fn();
    const onKeepScreenAwakeChange = vi.fn();
    const onLockApp = vi.fn();

    render(
      <DeckStandardSettings
        open={true}
        onOpenChange={onOpenChange}
        showCardCount={true}
        onShowCardCountChange={onShowCardCountChange}
        showTimer={true}
        onShowTimerChange={onShowTimerChange}
        autoPlaySound={false}
        onAutoPlaySoundChange={onAutoPlaySoundChange}
        keepScreenAwake={true}
        onKeepScreenAwakeChange={onKeepScreenAwakeChange}
        onLockApp={onLockApp}
      >
        <div data-testid="custom-settings">App Custom Controls</div>
      </DeckStandardSettings>
    );

    expect(screen.getByRole("heading", { name: "Counters" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "System" })).toBeInTheDocument();
    expect(screen.getByTestId("custom-settings")).toBeInTheDocument();

    // Toggle card count
    const cardCountSwitch = screen.getByRole("switch", { name: "Show Card Count" });
    fireEvent.click(cardCountSwitch);
    expect(onShowCardCountChange).toHaveBeenCalledWith(false);

    // Toggle timer
    const timerSwitch = screen.getByRole("switch", { name: "Show Timer" });
    fireEvent.click(timerSwitch);
    expect(onShowTimerChange).toHaveBeenCalledWith(false);

    // Toggle sound
    const soundSwitch = screen.getByRole("switch", { name: "Auto-play Audio" });
    fireEvent.click(soundSwitch);
    expect(onAutoPlaySoundChange).toHaveBeenCalledWith(true);

    // Toggle wake lock
    const wakeLockSwitch = screen.getByRole("switch", { name: "Keep Screen Awake" });
    fireEvent.click(wakeLockSwitch);
    expect(onKeepScreenAwakeChange).toHaveBeenCalledWith(false);
  });
});
