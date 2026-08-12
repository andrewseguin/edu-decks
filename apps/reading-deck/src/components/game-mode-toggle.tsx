
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type GameModeToggleProps = {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  enableWords: boolean;
};

export function GameModeToggle({
  value,
  onValueChange,
  className,
  enableWords,
}: GameModeToggleProps) {
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
          value === "letters"
            ? "bg-primary text-primary-foreground shadow-xs font-bold"
            : "text-muted-foreground hover:text-foreground hover:bg-background/50"
        )}
        onClick={() => onValueChange("letters")}
      >
        Letters
      </button>
      {enableWords && (
        <button
          type="button"
          className={cn(
            "inline-flex items-center justify-center rounded-xl font-headline font-semibold h-9 text-xs sm:text-sm transition-all outline-none focus:outline-none select-none cursor-pointer border-none",
            value === "words"
              ? "bg-primary text-primary-foreground shadow-xs font-bold"
              : "text-muted-foreground hover:text-foreground hover:bg-background/50"
          )}
          onClick={() => onValueChange("words")}
        >
          Words
        </button>
      )}
    </div>
  );
}
