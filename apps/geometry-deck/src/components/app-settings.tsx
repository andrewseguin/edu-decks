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
      onLockApp={onLockApp}
      showEduDecksLink={true}
      eduDecksUrl="https://edudecks.org"
      eduDecksLabel="EduDecks"
    />
  );
}
