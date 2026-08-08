import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  AppSettingsModal,
  SettingsSection,
  SettingsToggle,
  LockSnackbar,
} from "./app-settings-modal";

describe("deck-core: AppSettingsModal & Subcomponents", () => {
  it("renders open modal with title and children", () => {
    const onOpenChange = vi.fn();
    render(
      <AppSettingsModal open={true} onOpenChange={onOpenChange} title="App Preferences">
        <div data-testid="settings-content">Options Here</div>
      </AppSettingsModal>
    );

    expect(screen.getByText("App Preferences")).toBeInTheDocument();
    expect(screen.getByTestId("settings-content")).toBeInTheDocument();
  });

  it("handles lock app action", () => {
    const onLockApp = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <AppSettingsModal
        open={true}
        onOpenChange={onOpenChange}
        onLockApp={onLockApp}
        lockButtonLabel="Lock Application"
      >
        <div>Settings body</div>
      </AppSettingsModal>
    );

    const lockBtn = screen.getByRole("button", { name: /Lock Application/i });
    expect(lockBtn).toBeInTheDocument();
    fireEvent.click(lockBtn);

    expect(onLockApp).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("renders SettingsSection with heading", () => {
    render(
      <SettingsSection title="Display Settings">
        <p>Display controls</p>
      </SettingsSection>
    );

    expect(screen.getByText("Display Settings")).toBeInTheDocument();
    expect(screen.getByText("Display controls")).toBeInTheDocument();
  });

  it("renders SettingsToggle and triggers onCheckedChange on click", () => {
    const onCheckedChange = vi.fn();
    render(
      <SettingsToggle
        id="test-toggle"
        label="Enable Feature"
        checked={false}
        onCheckedChange={onCheckedChange}
      />
    );

    const switchBtn = screen.getByRole("switch", { name: "Enable Feature" });
    expect(switchBtn).toBeInTheDocument();
    expect(switchBtn).toHaveAttribute("aria-checked", "false");

    fireEvent.click(switchBtn);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("renders LockSnackbar when isLocked is true and handles unlock click", () => {
    const onUnlock = vi.fn();
    render(
      <LockSnackbar
        isLocked={true}
        onUnlock={onUnlock}
        label="Parental Lock Enabled"
        unlockLabel="Tap to Unlock"
      />
    );

    expect(screen.getByText("Parental Lock Enabled")).toBeInTheDocument();
    const unlockBtn = screen.getByRole("button", { name: "Tap to Unlock" });
    fireEvent.click(unlockBtn);

    expect(onUnlock).toHaveBeenCalledTimes(1);
  });
});
