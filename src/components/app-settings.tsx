"use client";

import { Settings, Lock, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { ThemeToggleGroup } from "./theme-toggle-group";
import { MathOperation, OPERATION_COLORS } from "@/lib/types";
import { cn } from "@/lib/utils";

type AppSettingsProps = {
  activeOperations: MathOperation[];
  onOperationToggle: (op: MathOperation) => void;
  minRange: number;
  maxRange: number;
  onRangeChange: (min: number, max: number) => void;
  allowNegatives: boolean;
  onAllowNegativesChange: (allow: boolean) => void;
  showCardCount: boolean;
  onShowCardCountChange: (show: boolean) => void;
  showTimer: boolean;
  onShowTimerChange: (show: boolean) => void;
  autoPlayAudio: boolean;
  onAutoPlayAudioChange: (autoPlay: boolean) => void;
  quizOptionCount: number;
  onQuizOptionCountChange: (count: number) => void;
  keepScreenAwake: boolean;
  onKeepScreenAwakeChange: (keep: boolean) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLockApp?: () => void;
};

export function AppSettings({
  activeOperations,
  onOperationToggle,
  minRange,
  maxRange,
  onRangeChange,
  allowNegatives,
  onAllowNegativesChange,
  showCardCount,
  onShowCardCountChange,
  showTimer,
  onShowTimerChange,
  autoPlayAudio,
  onAutoPlayAudioChange,
  quizOptionCount,
  onQuizOptionCountChange,
  keepScreenAwake,
  onKeepScreenAwakeChange,
  open,
  onOpenChange,
  onLockApp,
}: AppSettingsProps) {
  const operations: MathOperation[] = ['+', '-', '×', '÷'];
  const rangePresets = [
    { label: "1 - 10", min: 1, max: 10 },
    { label: "1 - 20", min: 1, max: 20 },
    { label: "1 - 50", min: 1, max: 50 },
    { label: "1 - 100", min: 1, max: 100 },
  ];

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
        className="w-[90vw] sm:w-[340px] max-h-[85vh] overflow-y-auto"
        align="end"
        sideOffset={8}
        collisionPadding={16}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="grid gap-6">
          {/* Theme */}
          <div className="space-y-3">
            <h4 className="font-bold leading-none font-headline text-base">
              Theme
            </h4>
            <ThemeToggleGroup />
          </div>

          {/* Math Operations */}
          <div className="space-y-3">
            <h4 className="font-bold leading-none font-headline text-base">
              Math Operations
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {operations.map((op) => {
                const isActive = activeOperations.includes(op);
                const info = OPERATION_COLORS[op];
                return (
                  <Button
                    key={op}
                    type="button"
                    variant="outline"
                    className={cn(
                      "h-10 rounded-xl justify-start gap-2 border text-xs font-bold transition-all",
                      isActive
                        ? info.badgeBg
                        : "opacity-60 border-border"
                    )}
                    onClick={() => onOperationToggle(op)}
                  >
                    <span
                      className="w-5 h-5 rounded-md text-xs flex items-center justify-center font-black"
                      style={{ backgroundColor: info.hex, color: "#ffffff" }}
                    >
                      {op}
                    </span>
                    <span>{info.name}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Number Ranges */}
          <div className="space-y-3">
            <h4 className="font-bold leading-none font-headline text-base">
              Number Range
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {rangePresets.map((preset) => {
                const isSelected = minRange === preset.min && maxRange === preset.max;
                return (
                  <Button
                    key={preset.label}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className="rounded-xl font-bold h-9 text-xs"
                    onClick={() => onRangeChange(preset.min, preset.max)}
                  >
                    {preset.label}
                  </Button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-1">
              <Label htmlFor="negatives-toggle" className="text-sm font-medium">
                Allow Negative Answers
              </Label>
              <Switch
                id="negatives-toggle"
                checked={allowNegatives}
                onCheckedChange={onAllowNegativesChange}
              />
            </div>
          </div>

          {/* Counters & Display */}
          <div className="space-y-3">
            <h4 className="font-bold leading-none font-headline text-base">
              Counters & Screen
            </h4>
            <div className="flex items-center justify-between">
              <Label htmlFor="card-count-toggle" className="text-sm font-medium">
                Show Card Count
              </Label>
              <Switch
                id="card-count-toggle"
                checked={showCardCount}
                onCheckedChange={onShowCardCountChange}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="timer-toggle" className="text-sm font-medium">
                Show Timer
              </Label>
              <Switch
                id="timer-toggle"
                checked={showTimer}
                onCheckedChange={onShowTimerChange}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="screen-awake-toggle" className="text-sm font-medium">
                Keep Screen Awake
              </Label>
              <Switch
                id="screen-awake-toggle"
                checked={keepScreenAwake}
                onCheckedChange={onKeepScreenAwakeChange}
              />
            </div>
          </div>

          {/* Audio & Quiz */}
          <div className="space-y-3">
            <h4 className="font-bold leading-none font-headline text-base">
              Audio & Quiz Options
            </h4>
            <div className="flex items-center justify-between">
              <Label htmlFor="autoplay-toggle" className="text-sm font-medium flex items-center gap-1.5">
                <Volume2 className="h-4 w-4 opacity-70" />
                Auto Play Audio
              </Label>
              <Switch
                id="autoplay-toggle"
                checked={autoPlayAudio}
                onCheckedChange={onAutoPlayAudioChange}
              />
            </div>
            <div className="space-y-2 pt-1">
              <Label className="text-sm font-medium">Quiz Choice Cards</Label>
              <div className="grid grid-cols-3 gap-2">
                {[4, 6, 8].map((count) => (
                  <Button
                    key={count}
                    type="button"
                    variant={quizOptionCount === count ? "default" : "outline"}
                    size="sm"
                    className="rounded-xl font-bold font-headline h-9 text-xs"
                    onClick={() => onQuizOptionCountChange(count)}
                  >
                    {count} Cards
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Lock Settings */}
          <div className="pt-2">
            <Button
              variant="destructive"
              className="w-full justify-start gap-2.5 h-11 rounded-2xl font-bold"
              onClick={() => {
                onOpenChange(false);
                onLockApp?.();
              }}
            >
              <div className="p-1 rounded-md bg-white/20">
                <Lock className="h-4 w-4 text-white" />
              </div>
              Lock Settings
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
