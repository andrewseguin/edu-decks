import { DeckStandardSettings } from "@decks/core";

type AppSettingsProps = {
  showCardCount: boolean;
  onShowCardCountChange: (show: boolean) => void;
  showTimer: boolean;
  onShowTimerChange: (show: boolean) => void;
  autoPlayAudio: boolean;
  onAutoPlayAudioChange: (autoPlay: boolean) => void;
  keepScreenAwake: boolean;
  onKeepScreenAwakeChange: (keep: boolean) => void;
  enableHaptic?: boolean;
  onEnableHapticChange?: (enable: boolean) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
  autoPlayAudio,
  onAutoPlayAudioChange,
  keepScreenAwake,
  onKeepScreenAwakeChange,
  enableHaptic,
  onEnableHapticChange,
  open,
  onOpenChange,
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
      autoPlaySound={autoPlayAudio}
      onAutoPlaySoundChange={onAutoPlayAudioChange}
      keepScreenAwake={keepScreenAwake}
      onKeepScreenAwakeChange={onKeepScreenAwakeChange}
      enableHaptic={enableHaptic}
      onEnableHapticChange={onEnableHapticChange}
      onLockApp={onLockApp}
      showEduDecksLink={showEduDecksLink}
      eduDecksUrl={eduDecksUrl}
      eduDecksLabel={eduDecksLabel}
    />
  );
}
