"use client";

import * as React from "react";
import {
  AppSettingsModal,
  SettingsSection,
  SettingsToggle,
} from "./app-settings-modal";
import { ThemeToggleGroup } from "./theme-toggle-group";

export type DeckStandardSettingsProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showCardCount?: boolean;
  onShowCardCountChange?: (show: boolean) => void;
  showTimer?: boolean;
  onShowTimerChange?: (show: boolean) => void;
  autoPlaySound?: boolean;
  onAutoPlaySoundChange?: (autoPlay: boolean) => void;
  keepScreenAwake?: boolean;
  onKeepScreenAwakeChange?: (keep: boolean) => void;
  enableHaptic?: boolean;
  onEnableHapticChange?: (enable: boolean) => void;
  onLockApp?: () => void;
  themeSectionTitle?: string;
  countersSectionTitle?: string;
  systemSectionTitle?: string;
  children?: React.ReactNode;
  triggerClassName?: string;
  contentClassName?: string;
  showEduDecksLink?: boolean;
  eduDecksUrl?: string;
  eduDecksLabel?: string;
};

export function DeckStandardSettings({
  open,
  onOpenChange,
  showCardCount,
  onShowCardCountChange,
  showTimer,
  onShowTimerChange,
  autoPlaySound,
  onAutoPlaySoundChange,
  keepScreenAwake,
  onKeepScreenAwakeChange,
  enableHaptic,
  onEnableHapticChange,
  onLockApp,
  themeSectionTitle = "Theme",
  countersSectionTitle = "Counters",
  systemSectionTitle = "System",
  children,
  triggerClassName,
  contentClassName,
  showEduDecksLink = true,
  eduDecksUrl = "https://edudecks.org",
  eduDecksLabel = "More decks at edudecks.org",
}: DeckStandardSettingsProps) {
  const hasCounters = onShowCardCountChange || onShowTimerChange;
  const hasSystem = onAutoPlaySoundChange || onKeepScreenAwakeChange || onEnableHapticChange;

  return (
    <AppSettingsModal
      open={open}
      onOpenChange={onOpenChange}
      onLockApp={onLockApp}
      triggerClassName={triggerClassName}
      contentClassName={contentClassName}
      showEduDecksLink={showEduDecksLink}
      eduDecksUrl={eduDecksUrl}
      eduDecksLabel={eduDecksLabel}
    >
      {/* Theme Section */}
      <SettingsSection title={themeSectionTitle}>
        <ThemeToggleGroup />
      </SettingsSection>

      {/* Counters Section */}
      {hasCounters && (
        <SettingsSection title={countersSectionTitle}>
          {onShowCardCountChange && showCardCount !== undefined && (
            <SettingsToggle
              id="deck-card-count-toggle"
              label="Show Card Count"
              checked={showCardCount}
              onCheckedChange={onShowCardCountChange}
            />
          )}
          {onShowTimerChange && showTimer !== undefined && (
            <SettingsToggle
              id="deck-timer-toggle"
              label="Show Timer"
              checked={showTimer}
              onCheckedChange={onShowTimerChange}
            />
          )}
        </SettingsSection>
      )}

      {/* System Section (Audio, Screen, Haptics) */}
      {hasSystem && (
        <SettingsSection title={systemSectionTitle}>
          {onAutoPlaySoundChange && autoPlaySound !== undefined && (
            <SettingsToggle
              id="deck-autoplay-toggle"
              label="Auto-play Audio"
              checked={autoPlaySound}
              onCheckedChange={onAutoPlaySoundChange}
            />
          )}
          {onKeepScreenAwakeChange && keepScreenAwake !== undefined && (
            <SettingsToggle
              id="deck-keep-awake-toggle"
              label="Keep Screen Awake"
              checked={keepScreenAwake}
              onCheckedChange={onKeepScreenAwakeChange}
            />
          )}
          {onEnableHapticChange && enableHaptic !== undefined && (
            <SettingsToggle
              id="deck-haptic-toggle"
              label="Haptic Feedback"
              checked={enableHaptic}
              onCheckedChange={onEnableHapticChange}
            />
          )}
        </SettingsSection>
      )}

      {/* App-Specific Domain Settings */}
      {children}
    </AppSettingsModal>
  );
}
