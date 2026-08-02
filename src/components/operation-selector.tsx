"use client";

import { MathOperation, OPERATION_COLORS } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calculator, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

type OperationSelectorProps = {
  activeOperations: MathOperation[];
  onOperationToggle: (op: MathOperation) => void;
  minRange: number;
  maxRange: number;
  onRangeChange: (min: number, max: number) => void;
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
  open,
  onOpenChange,
  onStartQuiz,
}: OperationSelectorProps) {
  const operations: MathOperation[] = ['+', '-', '×', '÷'];

  const rangePresets = [
    { label: "1 to 10", min: 1, max: 10 },
    { label: "1 to 20", min: 1, max: 20 },
    { label: "1 to 50", min: 1, max: 50 },
    { label: "1 to 100", min: 1, max: 100 },
  ];

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-10 px-3 sm:px-4 rounded-2xl border-border bg-card/80 backdrop-blur-md shadow-xs gap-2 font-bold font-headline text-foreground hover:bg-card"
        >
          <div className="flex items-center gap-1">
            {activeOperations.map((op) => (
              <span
                key={op}
                className={cn(
                  "w-5 h-5 rounded-full text-xs flex items-center justify-center font-black",
                  OPERATION_COLORS[op].badgeBg
                )}
              >
                {op}
              </span>
            ))}
          </div>
          <span className="text-xs sm:text-sm font-semibold opacity-80 hidden sm:inline">
            ({minRange}-{maxRange})
          </span>
          <Calculator className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[90vw] sm:w-[320px] p-5 rounded-3xl"
        align="center"
        sideOffset={8}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="grid gap-5">
          <div className="space-y-3">
            <h4 className="font-bold text-lg font-headline flex items-center gap-2 text-foreground">
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
                    variant="outline"
                    className={cn(
                      "h-12 rounded-2xl justify-start gap-2.5 px-3 border-2 font-bold transition-all",
                      isActive
                        ? info.badgeBg
                        : "opacity-60 hover:opacity-100 border-border"
                    )}
                    onClick={() => onOperationToggle(op)}
                  >
                    <span
                      className="w-7 h-7 rounded-xl text-lg flex items-center justify-center font-black"
                      style={{ backgroundColor: info.hex, color: "#ffffff" }}
                    >
                      {op}
                    </span>
                    <span className="text-sm font-bold">{info.name}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-base font-headline text-foreground">
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
          </div>

          <div className="pt-2 border-t border-border">
            <Button
              type="button"
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-black text-base shadow-md gap-2"
              onClick={() => {
                onOpenChange(false);
                onStartQuiz();
              }}
            >
              <Trophy className="h-5 w-5 fill-amber-200 text-amber-100 animate-bounce" />
              Play Quiz Mode
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
