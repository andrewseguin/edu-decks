
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type WordDifficultyToggleProps = {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
};

export function WordDifficultyToggle({
  value,
  onValueChange,
  className,
}: WordDifficultyToggleProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-muted/50 border border-border/50",
        className
      )}
    >
      <button
        type="button"
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-headline font-semibold h-9 text-xs sm:text-sm transition-all outline-none focus:outline-none select-none cursor-pointer border-none",
          value === "easy"
            ? "bg-primary text-primary-foreground shadow-xs font-bold"
            : "text-muted-foreground hover:text-foreground hover:bg-background/50"
        )}
        onClick={() => onValueChange("easy")}
      >
        Easy
      </button>
      <button
        type="button"
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-headline font-semibold h-9 text-xs sm:text-sm transition-all outline-none focus:outline-none select-none cursor-pointer border-none",
          value === "hard"
            ? "bg-primary text-primary-foreground shadow-xs font-bold"
            : "text-muted-foreground hover:text-foreground hover:bg-background/50"
        )}
        onClick={() => onValueChange("hard")}
      >
        Hard
      </button>
    </div>
  );
}
