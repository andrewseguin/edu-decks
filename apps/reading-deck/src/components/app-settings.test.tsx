import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AppSettings } from "./app-settings";

describe("reading-deck: AppSettings", () => {
  it("renders reading deck settings toggles and recordings button", () => {
    const onShowCardCountChange = vi.fn();
    const onShowTimerChange = vi.fn();
    const onEnableRecordingsChange = vi.fn();
    const onEnableTracingChange = vi.fn();
    const onAutoPlaySoundChange = vi.fn();
    const onKeepScreenAwakeChange = vi.fn();
    const onOpenRecordings = vi.fn();

    render(
      <AppSettings
        open={true}
        onOpenChange={vi.fn()}
        showCardCount={true}
        onShowCardCountChange={onShowCardCountChange}
        showTimer={true}
        onShowTimerChange={onShowTimerChange}
        enableRecordings={true}
        onEnableRecordingsChange={onEnableRecordingsChange}
        enableTracing={true}
        onEnableTracingChange={onEnableTracingChange}
        autoPlaySound={false}
        onAutoPlaySoundChange={onAutoPlaySoundChange}
        keepScreenAwake={true}
        onKeepScreenAwakeChange={onKeepScreenAwakeChange}
        onOpenRecordings={onOpenRecordings}
      />
    );

    expect(screen.getByText("Enable Recordings")).toBeInTheDocument();
    expect(screen.getByText("Enable Tracing")).toBeInTheDocument();

    const manageRecordingsBtn = screen.getByRole("button", {
      name: "Manage Recordings",
    });
    fireEvent.click(manageRecordingsBtn);
    expect(onOpenRecordings).toHaveBeenCalledTimes(1);
  });
});
