"use client";

import { Maximize, Minimize } from "lucide-react";
import { Button } from "@/components/ui/button";
type FullscreenToggleProps = {
  isFullscreen: boolean;
  onToggle: () => void;
};

export function FullscreenToggle({
  isFullscreen,
  onToggle,
}: FullscreenToggleProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-foreground/50 hover:text-foreground active:scale-95 transition-transform"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      onPointerDown={(e) => e.stopPropagation()}
      aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
    >
      {isFullscreen ? (
        <Minimize className="h-6 w-6" />
      ) : (
        <Maximize className="h-6 w-6" />
      )}
    </Button>
  );
}
