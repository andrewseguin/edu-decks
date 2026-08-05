
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
        "flex items-center gap-2 rounded-full p-1 bg-muted",
        className
      )}
    >
      <Button
        variant={value === "easy" ? "default" : "ghost"}
        className="rounded-full w-full"
        onClick={() => onValueChange("easy")}
      >
        Easy
      </Button>
      <Button
        variant={value === "hard" ? "default" : "ghost"}
        className="rounded-full w-full"
        onClick={() => onValueChange("hard")}
      >
        Hard
      </Button>
    </div>
  );
}
