import { ThemeToggleGroup } from "./theme-toggle-group";
import { AppSettingsModal, SettingsSection, SettingsToggle } from "@decks/core";

type AppSettingsProps = {
  showCardCount: boolean;
  onShowCardCountChange: (show: boolean) => void;
  showTimer: boolean;
  onShowTimerChange: (show: boolean) => void;
  autoPlayAudio: boolean;
  onAutoPlayAudioChange: (autoPlay: boolean) => void;
  keepScreenAwake: boolean;
  onKeepScreenAwakeChange: (keep: boolean) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLockApp?: () => void;
};

export function AppSettings({
  showCardCount,
  onShowCardCountChange,
  showTimer,
  onShowTimerChange,
  autoPlayAudio,
  onAutoPlayAudioChange,
  keepScreenAwake,
  onKeepScreenAwakeChange,
  open,
  onOpenChange,
  onLockApp,
}: AppSettingsProps) {
  return (
    <AppSettingsModal
      open={open}
      onOpenChange={onOpenChange}
      onLockApp={onLockApp}
    >
      {/* Theme */}
      <SettingsSection title="Theme">
        <ThemeToggleGroup />
      </SettingsSection>

      {/* Counters & Rules */}
      <SettingsSection title="Card Rules & Counters">
        <SettingsToggle
          id="card-count-toggle"
          label="Show Card Count"
          checked={showCardCount}
          onCheckedChange={onShowCardCountChange}
        />
        <SettingsToggle
          id="timer-toggle"
          label="Show Timer"
          checked={showTimer}
          onCheckedChange={onShowTimerChange}
        />
      </SettingsSection>

      {/* Audio & Screen */}
      <SettingsSection title="Audio Controls">
        <SettingsToggle
          id="autoplay-toggle"
          label="Auto Play Sound"
          checked={autoPlayAudio}
          onCheckedChange={onAutoPlayAudioChange}
        />
        <SettingsToggle
          id="screen-awake-toggle"
          label="Keep Screen Awake"
          checked={keepScreenAwake}
          onCheckedChange={onKeepScreenAwakeChange}
        />
      </SettingsSection>
    </AppSettingsModal>
  );
}
