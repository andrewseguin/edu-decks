"use client";

import * as React from "react";
import {
  AppSettingsModal,
  SettingsSection,
  SettingsToggle,
} from "./app-settings-modal";
import { ThemeToggleGroup } from "./theme-toggle-group";
import { useDevSettings } from "../hooks/use-dev-settings";

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
  showDebugOutlines?: boolean;
  onShowDebugOutlinesChange?: (show: boolean) => void;
  onLockApp?: () => void;
  themeSectionTitle?: string;
  countersSectionTitle?: string;
  systemSectionTitle?: string;
  devSectionTitle?: string;
  children?: React.ReactNode;
  triggerClassName?: string;
  contentClassName?: string;
  showEduDecksLink?: boolean;
  isInteractiveLink?: boolean;
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
  showDebugOutlines,
  onShowDebugOutlinesChange,
  onLockApp,
  themeSectionTitle = "Theme",
  countersSectionTitle = "Counters",
  systemSectionTitle = "System",
  devSectionTitle = "Developer",
  children,
  triggerClassName,
  contentClassName,
  showEduDecksLink = true,
  isInteractiveLink,
  eduDecksUrl = "https://edudecks.org",
  eduDecksLabel = "More decks at edudecks.org",
}: DeckStandardSettingsProps) {
  const devSettings = useDevSettings();
  const isOutlinesActive =
    showDebugOutlines !== undefined ? showDebugOutlines : devSettings.showDebugOutlines;
  const handleOutlinesChange = onShowDebugOutlinesChange || devSettings.setShowDebugOutlines;

  const hasCounters = onShowCardCountChange || onShowTimerChange;
  const hasSystem = onAutoPlaySoundChange || onKeepScreenAwakeChange;

  return (
    <AppSettingsModal
      open={open}
      onOpenChange={onOpenChange}
      onLockApp={onLockApp}
      triggerClassName={triggerClassName}
      contentClassName={contentClassName}
      showEduDecksLink={showEduDecksLink}
      isInteractiveLink={isInteractiveLink}
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

      {/* System Section (Audio & Screen) */}
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
        </SettingsSection>
      )}

      {/* Developer Section (Localhost & Dev Environments Only) */}
      {devSettings.isDev && (
        <SettingsSection title={devSectionTitle}>
          <SettingsToggle
            id="deck-dev-outlines-toggle"
            label="Container Outlines (D)"
            checked={isOutlinesActive}
            onCheckedChange={handleOutlinesChange}
          />
          <SettingsToggle
            id="deck-dev-slow-anim-toggle"
            label="Slow Animations (S)"
            checked={devSettings.slowAnimations}
            onCheckedChange={devSettings.setSlowAnimations}
          />
        </SettingsSection>
      )}

      {/* App-Specific Domain Settings */}
      {children}
    </AppSettingsModal>
  );
}
