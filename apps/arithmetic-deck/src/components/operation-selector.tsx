"use client";

import { useState, useEffect } from "react";
import { MathOperation, OPERATION_COLORS } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Calculator, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";

type OperationSelectorProps = {
  activeOperations: MathOperation[];
  onOperationToggle: (op: MathOperation) => void;
  minRange: number;
  maxRange: number;
  onRangeChange: (min: number, max: number) => void;
  showWholeNumbers: boolean;
  onShowWholeNumbersChange: (show: boolean) => void;
  showFractions: boolean;
  onShowFractionsChange: (show: boolean) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartQuiz: () => void;
};

export function OperationSelector({
  activeOperations,
  onOperationToggle,
  minRange,
  maxRange,
  onRangeChange,
  showWholeNumbers,
  onShowWholeNumbersChange,
  showFractions,
  onShowFractionsChange,
  open,
  onOpenChange,
  onStartQuiz,
}: OperationSelectorProps) {
  const operations: MathOperation[] = ['+', '-', '×', '÷'];
  const rangePresets = [
    { label: "1 - 10", min: 1, max: 10 },
    { label: "1 - 12", min: 1, max: 12 },
    { label: "1 - 20", min: 1, max: 20 },
    { label: "1 - 50", min: 1, max: 50 },
  ];

  const isMatchedPreset = rangePresets.some((p) => p.min === minRange && p.max === maxRange);
  const [showCustom, setShowCustom] = useState(!isMatchedPreset);

  useEffect(() => {
    if (!isMatchedPreset) {
      setShowCustom(true);
    }
  }, [minRange, maxRange, isMatchedPreset]);

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="default"
          size="icon"
          className="active:scale-95 transition-transform"
          aria-label="Select operations"
        >
          <Calculator className="h-6 w-6" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="mobile-fullscreen [@media(max-width:640px)]:!z-50 [@media(max-width:640px)]:!w-screen [@media(max-width:640px)]:!h-[100dvh] [@media(max-width:640px)]:!max-w-none [@media(max-width:640px)]:!m-0 [@media(max-width:640px)]:!rounded-none [@media(max-width:640px)]:!border-none sm:w-[380px] sm:h-auto sm:max-h-[90vh] sm:rounded-2xl sm:border bg-background p-0 flex flex-col"
        align="end"
        sideOffset={8}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-end p-4 border-b sm:hidden sticky top-0 bg-background z-10">
          <h4 className="font-medium font-headline text-lg mr-auto">
            Math Operations
          </h4>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange?.(false)}
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Operations selection */}
          <div>
            <h4 className="font-medium leading-none font-headline text-lg mb-4">
              Math Operations
            </h4>
            <div className="grid grid-cols-2 gap-2.5">
              {operations.map((op) => {
                const isActive = activeOperations.includes(op);
                const info = OPERATION_COLORS[op];
                return (
                  <Button
                    key={op}
                    type="button"
                    variant={isActive ? "default" : "outline"}
                    className={cn(
                      "h-12 rounded-xl justify-start gap-2.5 px-3 font-headline font-bold transition-all text-sm",
                      isActive
                        ? "text-white shadow-sm"
                        : "text-muted-foreground border-border"
                    )}
                    style={{
                      backgroundColor: isActive ? info.hex : undefined,
                    }}
                    onClick={() => onOperationToggle(op)}
                  >
                    <span className="w-6 h-6 rounded-lg bg-white/20 text-white font-black flex items-center justify-center text-sm">
                      {op}
                    </span>
                    <span>{info.name}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Number Types Selection */}
          <div>
            <h4 className="font-medium leading-none font-headline text-lg mb-3">
              Number Type
            </h4>
            <div className="flex items-center gap-2 rounded-2xl p-1 bg-muted">
              <Button
                type="button"
                variant={showWholeNumbers ? "default" : "ghost"}
                className={cn(
                  "rounded-xl font-headline font-bold h-10 text-xs w-full transition-all",
                  showWholeNumbers ? "shadow-sm" : "text-muted-foreground"
                )}
                onClick={() => {
                  onShowWholeNumbersChange(true);
                  onShowFractionsChange(false);
                }}
              >
                Whole Numbers
              </Button>

              <Button
                type="button"
                variant={showFractions ? "default" : "ghost"}
                className={cn(
                  "rounded-xl font-headline font-bold h-10 text-xs w-full transition-all",
                  showFractions ? "shadow-sm" : "text-muted-foreground"
                )}
                onClick={() => {
                  onShowWholeNumbersChange(false);
                  onShowFractionsChange(true);
                }}
              >
                Fractions
              </Button>
            </div>
          </div>

          {/* Number Range selection (Presets + Custom Option) */}
          <div>
            <h4 className="font-medium leading-none font-headline text-lg mb-3">
              Number Range
            </h4>

            {/* Presets including Custom */}
            <div className="grid grid-cols-5 gap-1 mb-3">
              {rangePresets.map((preset) => {
                const isSelected = !showCustom && minRange === preset.min && maxRange === preset.max;
                return (
                  <Button
                    key={preset.label}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className="rounded-xl font-headline font-bold h-9 text-[11px] px-1"
                    onClick={() => {
                      setShowCustom(false);
                      onRangeChange(preset.min, preset.max);
                    }}
                  >
                    {preset.label}
                  </Button>
                );
              })}

              <Button
                type="button"
                variant={showCustom ? "default" : "outline"}
                size="sm"
                className="rounded-xl font-headline font-bold h-9 text-[11px] px-1"
                onClick={() => setShowCustom(true)}
              >
                Custom
              </Button>
            </div>

            {/* Custom Min / Max Stepper Controls (Revealed when Custom is selected) */}
            {showCustom && (
              <div className="grid grid-cols-2 gap-3 bg-muted/40 p-3 rounded-2xl border animate-fade-in">
                {/* Min Control */}
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-headline font-bold text-muted-foreground uppercase tracking-wider">
                    Min Number
                  </Label>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-lg shrink-0 font-bold text-base"
                      onClick={() => onRangeChange(Math.max(0, minRange - 1), maxRange)}
                    >
                      -
                    </Button>
                    <input
                      type="number"
                      value={minRange}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || 0;
                        onRangeChange(Math.max(0, Math.min(val, maxRange - 1)), maxRange);
                      }}
                      className="w-full h-8 text-center font-headline font-bold text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-lg shrink-0 font-bold text-base"
                      onClick={() => onRangeChange(Math.min(minRange + 1, maxRange - 1), maxRange)}
                    >
                      +
                    </Button>
                  </div>
                </div>

                {/* Max Control */}
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-headline font-bold text-muted-foreground uppercase tracking-wider">
                    Max Number
                  </Label>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-lg shrink-0 font-bold text-base"
                      onClick={() => onRangeChange(minRange, Math.max(minRange + 1, maxRange - 1))}
                    >
                      -
                    </Button>
                    <input
                      type="number"
                      value={maxRange}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10) || minRange + 1;
                        onRangeChange(minRange, Math.max(minRange + 1, val));
                      }}
                      className="w-full h-8 text-center font-headline font-bold text-sm bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-lg shrink-0 font-bold text-base"
                      onClick={() => onRangeChange(minRange, maxRange + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quiz Start Button */}
          <div className="pt-4 border-t">
            <Button
              variant="default"
              className="w-full h-14 rounded-2xl text-lg font-bold font-headline gap-2 bg-amber-500 hover:bg-amber-600 text-white shadow-md active:scale-95 transition-transform"
              onClick={() => {
                onOpenChange?.(false);
                onStartQuiz?.();
              }}
            >
              <Sparkles className="w-5 h-5" />
              <span>Start Quiz</span>
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
