"use client";

import { useLocalStorage } from "./use-local-storage";

export type DeckPreferencesOptions = {
  keyPrefix?: string;
  defaultShowCardCount?: boolean;
  defaultShowTimer?: boolean;
  defaultAutoPlaySound?: boolean;
  defaultKeepScreenAwake?: boolean;
  defaultEnableHaptic?: boolean;
  defaultIsLocked?: boolean;
  customKeys?: {
    showCardCount?: string;
    showTimer?: string;
    autoPlaySound?: string;
    keepScreenAwake?: string;
    enableHaptic?: string;
    isLocked?: string;
  };
};

export type DeckPreferences = {
  showCardCount: boolean;
  setShowCardCount: (val: boolean | ((val: boolean) => boolean)) => void;
  showTimer: boolean;
  setShowTimer: (val: boolean | ((val: boolean) => boolean)) => void;
  autoPlaySound: boolean;
  setAutoPlaySound: (val: boolean | ((val: boolean) => boolean)) => void;
  keepScreenAwake: boolean;
  setKeepScreenAwake: (val: boolean | ((val: boolean) => boolean)) => void;
  enableHaptic: boolean;
  setEnableHaptic: (val: boolean | ((val: boolean) => boolean)) => void;
  isLocked: boolean;
  setIsLocked: (val: boolean | ((val: boolean) => boolean)) => void;
};

export function useDeckPreferences(options: DeckPreferencesOptions = {}): DeckPreferences {
  const {
    keyPrefix = "deck",
    defaultShowCardCount = true,
    defaultShowTimer = true,
    defaultAutoPlaySound = false,
    defaultKeepScreenAwake = true,
    defaultEnableHaptic = true,
    defaultIsLocked = false,
    customKeys = {},
  } = options;

  const [showCardCount, setShowCardCount] = useLocalStorage<boolean>(
    customKeys.showCardCount ?? `${keyPrefix}-show-card-count`,
    defaultShowCardCount
  );
  const [showTimer, setShowTimer] = useLocalStorage<boolean>(
    customKeys.showTimer ?? `${keyPrefix}-show-timer`,
    defaultShowTimer
  );
  const [autoPlaySound, setAutoPlaySound] = useLocalStorage<boolean>(
    customKeys.autoPlaySound ?? `${keyPrefix}-autoplay-audio`,
    defaultAutoPlaySound
  );
  const [keepScreenAwake, setKeepScreenAwake] = useLocalStorage<boolean>(
    customKeys.keepScreenAwake ?? `${keyPrefix}-keep-awake`,
    defaultKeepScreenAwake
  );
  const [enableHaptic, setEnableHaptic] = useLocalStorage<boolean>(
    customKeys.enableHaptic ?? `${keyPrefix}-haptics-enabled`,
    defaultEnableHaptic
  );
  const [isLocked, setIsLocked] = useLocalStorage<boolean>(
    customKeys.isLocked ?? `${keyPrefix}-locked`,
    defaultIsLocked
  );

  return {
    showCardCount,
    setShowCardCount,
    showTimer,
    setShowTimer,
    autoPlaySound,
    setAutoPlaySound,
    keepScreenAwake,
    setKeepScreenAwake,
    enableHaptic,
    setEnableHaptic,
    isLocked,
    setIsLocked,
  };
}
