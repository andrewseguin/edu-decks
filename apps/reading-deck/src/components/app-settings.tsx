"use client";

import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DeckStandardSettings,
  SettingsSection,
  SettingsToggle,
} from "@decks/core";

type AppSettingsProps = {
  showCardCount: boolean;
  onShowCardCountChange: (show: boolean) => void;
  showTimer: boolean;
  onShowTimerChange: (show: boolean) => void;
  enableRecordings: boolean;
  onEnableRecordingsChange: (show: boolean) => void;
  enableTracing: boolean;
  onEnableTracingChange: (enable: boolean) => void;
  autoPlaySound: boolean;
  onAutoPlaySoundChange: (autoPlay: boolean) => void;
  keepScreenAwake: boolean;
  onKeepScreenAwakeChange: (keep: boolean) => void;
  enableHaptic?: boolean;
  onEnableHapticChange?: (enable: boolean) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenRecordings: () => void;
  onLockApp?: () => void;
  showEduDecksLink?: boolean;
  eduDecksUrl?: string;
  eduDecksLabel?: string;
};

export function AppSettings({
  showCardCount,
  onShowCardCountChange,
  showTimer,
  onShowTimerChange,
  enableRecordings,
  onEnableRecordingsChange,
  enableTracing,
  onEnableTracingChange,
  autoPlaySound,
  onAutoPlaySoundChange,
  keepScreenAwake,
  onKeepScreenAwakeChange,
  enableHaptic,
  onEnableHapticChange,
  open,
  onOpenChange,
  onOpenRecordings,
  onLockApp,
  showEduDecksLink,
  eduDecksUrl,
  eduDecksLabel,
}: AppSettingsProps) {
  return (
    <DeckStandardSettings
      open={open}
      onOpenChange={onOpenChange}
      showCardCount={showCardCount}
      onShowCardCountChange={onShowCardCountChange}
      showTimer={showTimer}
      onShowTimerChange={onShowTimerChange}
      autoPlaySound={autoPlaySound}
      onAutoPlaySoundChange={onAutoPlaySoundChange}
      keepScreenAwake={keepScreenAwake}
      onKeepScreenAwakeChange={onKeepScreenAwakeChange}
      enableHaptic={enableHaptic}
      onEnableHapticChange={onEnableHapticChange}
      onLockApp={onLockApp}
      showEduDecksLink={showEduDecksLink}
      eduDecksUrl={eduDecksUrl}
      eduDecksLabel={eduDecksLabel}
    >
      {/* Card Features */}
      <SettingsSection title="Card">
        <SettingsToggle
          id="recordings-toggle"
          label="Enable Recordings"
          checked={enableRecordings}
          onCheckedChange={onEnableRecordingsChange}
        />
        <SettingsToggle
          id="tracing-toggle"
          label="Enable Tracing"
          checked={enableTracing}
          onCheckedChange={onEnableTracingChange}
        />
        <div className="pt-1">
          <Button
            variant="outline"
            className="w-full justify-start gap-2 h-12 rounded-xl border-border hover:bg-muted/50 font-body"
            onClick={() => {
              onOpenChange(false);
              onOpenRecordings();
            }}
          >
            <div className="p-1.5 rounded-md bg-foreground/5">
              <Mic className="h-4 w-4 text-foreground" />
            </div>
            Manage Recordings
          </Button>
        </div>
      </SettingsSection>
    </DeckStandardSettings>
  );
}
