"use client";

import { MathOperation, OPERATION_COLORS } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calculator, Sparkles, X } from "lucide-react";
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

          {/* Number Range selection */}
          <div>
            <h4 className="font-medium leading-none font-headline text-lg mb-4">
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
                    className="rounded-xl font-headline font-bold h-10 text-xs"
                    onClick={() => onRangeChange(preset.min, preset.max)}
                  >
                    {preset.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Quiz Start Button (matching First Read's bottom action button) */}
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
