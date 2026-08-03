"use client";

import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { ThemeToggleGroup } from "./theme-toggle-group";
import { MathOperation } from "@/lib/types";

type AppSettingsProps = {
  activeOperations: MathOperation[];
  onOperationToggle: (op: MathOperation) => void;
  minRange: number;
  maxRange: number;
  onRangeChange: (min: number, max: number) => void;
  allowNegatives: boolean;
  onAllowNegativesChange: (allow: boolean) => void;
  showFractions: boolean;
  onShowFractionsChange: (show: boolean) => void;
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
  allowNegatives,
  onAllowNegativesChange,
  showFractions,
  onShowFractionsChange,
  showCardCount,
  onShowCardCountChange,
  showTimer,
  onShowTimerChange,
  autoPlayAudio,
  onAutoPlayAudioChange,
  open,
  onOpenChange,
}: AppSettingsProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-foreground/50 hover:text-foreground active:scale-95 transition-transform"
          aria-label="App settings"
        >
          <Settings className="h-6 w-6" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[90vw] sm:w-[320px]"
        align="center"
        sideOffset={8}
        collisionPadding={16}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="grid gap-6">
          {/* Theme */}
          <div className="space-y-4">
            <h4 className="font-medium leading-none font-headline text-lg">
              Theme
            </h4>
            <ThemeToggleGroup />
          </div>

          {/* Counters */}
          <div className="space-y-4">
            <h4 className="font-medium leading-none font-headline text-lg">
              Counters
            </h4>
            <div className="flex items-center justify-between">
              <Label htmlFor="card-count-toggle" className="text-base font-normal">
                Show Card Count
              </Label>
              <Switch
                id="card-count-toggle"
                checked={showCardCount}
                onCheckedChange={onShowCardCountChange}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="timer-toggle" className="text-base font-normal">
                Show Timer
              </Label>
              <Switch
                id="timer-toggle"
                checked={showTimer}
                onCheckedChange={onShowTimerChange}
              />
            </div>
          </div>

          {/* Modes & Fractions */}
          <div className="space-y-4">
            <h4 className="font-medium leading-none font-headline text-lg">
              Modes & Problem Types
            </h4>
            <div className="flex items-center justify-between">
              <Label htmlFor="fractions-toggle" className="text-base font-normal">
                Show Fractions
              </Label>
              <Switch
                id="fractions-toggle"
                checked={showFractions}
                onCheckedChange={onShowFractionsChange}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="negatives-toggle" className="text-base font-normal">
                Allow Negative Answers
              </Label>
              <Switch
                id="negatives-toggle"
                checked={allowNegatives}
                onCheckedChange={onAllowNegativesChange}
              />
            </div>
          </div>

          {/* Audio */}
          <div className="space-y-4">
            <h4 className="font-medium leading-none font-headline text-lg">
              Audio Controls
            </h4>
            <div className="flex items-center justify-between">
              <Label htmlFor="autoplay-toggle" className="text-base font-normal">
                Auto Play Sound
              </Label>
              <Switch
                id="autoplay-toggle"
                checked={autoPlayAudio}
                onCheckedChange={onAutoPlayAudioChange}
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
