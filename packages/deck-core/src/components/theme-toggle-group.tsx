"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Laptop } from "lucide-react";
import { cn } from "../lib/utils";

export type ThemeToggleGroupProps = {
  className?: string;
};

export function ThemeToggleGroup({ className }: ThemeToggleGroupProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-9 w-full bg-muted/30 rounded-xl animate-pulse" />;
  }

  const buttons = [
    { id: "light", label: "Light", icon: Sun },
    { id: "dark", label: "Dark", icon: Moon },
    { id: "system", label: "System", icon: Laptop },
  ] as const;

  return (
    <div
      className={cn(
        "grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-muted/50 border border-border/50",
        className
      )}
    >
      {buttons.map(({ id, label, icon: Icon }) => {
        const isSelected = theme === id;
        return (
          <button
            key={id}
            type="button"
            className={cn(
              "inline-flex items-center justify-center rounded-xl font-headline font-semibold h-8 text-xs gap-1.5 transition-all outline-none select-none cursor-pointer",
              isSelected
                ? "bg-primary text-primary-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            )}
            onClick={() => setTheme(id)}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
