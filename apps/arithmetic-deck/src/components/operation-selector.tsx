"use client";

import { useState, useEffect } from "react";
import { FractionDenominatorMode, FractionMaxDenominator, MathOperation, OPERATION_COLORS } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { GraduationCap, Check, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";

type OperationSelectorProps = {
  activeOperations: MathOperation[];
  onOperationToggle: (op: MathOperation) => void;
  onOperationSelectExclusive?: (op: MathOperation) => void;
  minRange: number;
  maxRange: number;
  onRangeChange: (min: number, max: number) => void;
  showWholeNumbers: boolean;
  onShowWholeNumbersChange: (show: boolean) => void;
  showFractions: boolean;
  onShowFractionsChange: (show: boolean) => void;
  fractionDenominatorMode?: FractionDenominatorMode;
  onFractionDenominatorModeChange?: (mode: FractionDenominatorMode) => void;
  fractionMaxDenominator?: FractionMaxDenominator;
  onFractionMaxDenominatorChange?: (maxD: FractionMaxDenominator) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartQuiz: () => void;
};

export function OperationSelector({
  activeOperations,
  onOperationToggle,
  onOperationSelectExclusive,
  minRange,
  maxRange,
  onRangeChange,
  showWholeNumbers,
  onShowWholeNumbersChange,
  showFractions,
  onShowFractionsChange,
  fractionDenominatorMode = "all",
  onFractionDenominatorModeChange,
  fractionMaxDenominator = 8,
  onFractionMaxDenominatorChange,
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
          size="icon"
          className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs active:scale-95 transition-transform"
          aria-label="Select operations"
        >
          <GraduationCap className="h-6 w-6" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="mobile-fullscreen [@media(max-width:640px)]:!z-50 [@media(max-width:640px)]:!w-screen [@media(max-width:640px)]:!h-[100dvh] [@media(max-width:640px)]:!max-w-none [@media(max-width:640px)]:!m-0 [@media(max-width:640px)]:!rounded-none [@media(max-width:640px)]:!border-none sm:w-[410px] sm:h-auto sm:max-h-[90vh] sm:rounded-2xl sm:border bg-background p-0 flex flex-col"
        align="end"
        sideOffset={8}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-end p-4 border-b sm:hidden sticky top-0 bg-background z-10">
          <h4 className="font-medium font-headline text-lg mr-auto">
            Math Deck
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
                  <div
                    key={op}
                    className={cn(
                      "h-12 rounded-xl flex items-center justify-between gap-2 pl-2.5 pr-2 transition-all select-none border group cursor-pointer",
                      isActive
                        ? "text-white shadow-sm border-transparent"
                        : "text-muted-foreground border-border bg-card hover:bg-accent hover:text-accent-foreground"
                    )}
                    style={{
                      backgroundColor: isActive ? info.hex : undefined,
                    }}
                    onClick={() => {
                      if (onOperationSelectExclusive) {
                        onOperationSelectExclusive(op);
                      } else {
                        onOperationToggle(op);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    title={`Select only ${info.name}`}
                  >
                    {/* Inline Checkbox Target: Multi-select Toggle (Left) */}
                    <button
                      type="button"
                      className={cn(
                        "w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 outline-none",
                        isActive
                          ? "bg-white text-black border-white shadow-xs"
                          : "border-muted-foreground/40 hover:border-foreground/80 bg-background/50"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        onOperationToggle(op);
                      }}
                      aria-label={`${isActive ? 'Deselect' : 'Select'} ${info.name}`}
                      title={isActive ? `Remove ${info.name}` : `Add ${info.name}`}
                    >
                      {isActive && <Check className="w-3.5 h-3.5 text-black stroke-[3]" />}
                    </button>

                    {/* Main Label: Exclusive Select (Middle) */}
                    <div className="flex-1 min-w-0 py-1">
                      <span className="font-headline font-bold text-xs sm:text-sm truncate block">
                        {info.name}
                      </span>
                    </div>

                    {/* Operator Icon Badge (Right) */}
                    <span
                      className={cn(
                        "w-6 h-6 rounded-lg font-black flex items-center justify-center text-sm shrink-0 transition-colors",
                        isActive
                          ? "bg-white/25 text-white"
                          : "bg-muted text-foreground/80 group-hover:bg-accent-foreground/10 group-hover:text-accent-foreground"
                      )}
                    >
                      {op}
                    </span>
                  </div>
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
          {showWholeNumbers && (
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
          )}

          {/* Fraction Options (when Fractions is selected) */}
          {showFractions && (
            <div className="space-y-4 animate-fade-in">
              {/* Denominators Match Mode */}
              <div>
                <h4 className="font-medium leading-none font-headline text-lg mb-3">
                  Denominators
                </h4>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-muted rounded-2xl">
                  <Button
                    type="button"
                    variant={fractionDenominatorMode === "same" ? "default" : "ghost"}
                    className={cn(
                      "rounded-xl font-headline font-bold h-9 text-xs transition-all",
                      fractionDenominatorMode === "same" ? "shadow-sm" : "text-muted-foreground"
                    )}
                    onClick={() => onFractionDenominatorModeChange?.("same")}
                  >
                    Same Only
                  </Button>
                  <Button
                    type="button"
                    variant={fractionDenominatorMode === "different" ? "default" : "ghost"}
                    className={cn(
                      "rounded-xl font-headline font-bold h-9 text-xs transition-all",
                      fractionDenominatorMode === "different" ? "shadow-sm" : "text-muted-foreground"
                    )}
                    onClick={() => onFractionDenominatorModeChange?.("different")}
                  >
                    Different
                  </Button>
                  <Button
                    type="button"
                    variant={fractionDenominatorMode === "all" ? "default" : "ghost"}
                    className={cn(
                      "rounded-xl font-headline font-bold h-9 text-xs transition-all",
                      fractionDenominatorMode === "all" ? "shadow-sm" : "text-muted-foreground"
                    )}
                    onClick={() => onFractionDenominatorModeChange?.("all")}
                  >
                    Mixed
                  </Button>
                </div>
              </div>

              {/* Max Denominator */}
              <div>
                <h4 className="font-medium leading-none font-headline text-lg mb-3">
                  Max Denominator
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {([4, 8, 12] as const).map((d) => {
                    const isSelected = fractionMaxDenominator === d;
                    return (
                      <Button
                        key={d}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        className="rounded-xl font-headline font-bold h-9 text-xs"
                        onClick={() => onFractionMaxDenominatorChange?.(d)}
                      >
                        Up to {d}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

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
