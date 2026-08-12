"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type WordLengthSelectorProps = {
  selectedLengths: number[];
  onSelectedLengthsChange: (lengths: number[]) => void;
};

const AVAILABLE_LENGTHS = [2, 3, 4, 5];

export function WordLengthSelector({
  selectedLengths,
  onSelectedLengthsChange,
}: WordLengthSelectorProps) {
  const toggleLength = (length: number) => {
    const isSelected = selectedLengths.includes(length);
    const newSelection = isSelected
      ? selectedLengths.filter((l) => l !== length)
      : [...selectedLengths, length];
    onSelectedLengthsChange(newSelection.sort());
  };

  return (
    <div className="grid grid-cols-4 gap-1.5 p-1 rounded-2xl bg-muted/50 border border-border/50">
      {AVAILABLE_LENGTHS.map((length) => {
        const isSelected = selectedLengths.includes(length);
        return (
          <button
            key={length}
            type="button"
            className={cn(
              "inline-flex items-center justify-center rounded-xl font-headline font-semibold h-9 text-xs sm:text-sm transition-all outline-none focus:outline-none select-none cursor-pointer border-none",
              isSelected
                ? "bg-primary text-primary-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            )}
            onClick={() => toggleLength(length)}
            aria-pressed={isSelected}
          >
            {length}
          </button>
        );
      })}
    </div>
  );
}
