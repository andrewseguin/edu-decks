"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Laptop } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function ThemeToggleGroup() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-9 w-full bg-muted/30 rounded-xl animate-pulse" />;
  }

  return (
    <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-muted/50 border border-border">
      <Button
        type="button"
        variant={theme === "light" ? "default" : "ghost"}
        size="sm"
        className="rounded-xl font-semibold h-8 text-xs gap-1.5"
        onClick={() => setTheme("light")}
      >
        <Sun className="h-3.5 w-3.5" />
        Light
      </Button>
      <Button
        type="button"
        variant={theme === "dark" ? "default" : "ghost"}
        size="sm"
        className="rounded-xl font-semibold h-8 text-xs gap-1.5"
        onClick={() => setTheme("dark")}
      >
        <Moon className="h-3.5 w-3.5" />
        Dark
      </Button>
      <Button
        type="button"
        variant={theme === "system" ? "default" : "ghost"}
        size="sm"
        className="rounded-xl font-semibold h-8 text-xs gap-1.5"
        onClick={() => setTheme("system")}
      >
        <Laptop className="h-3.5 w-3.5" />
        System
      </Button>
    </div>
  );
}
