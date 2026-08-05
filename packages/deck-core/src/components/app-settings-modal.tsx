"use client";

import * as React from "react";
import { Settings, Lock } from "lucide-react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "../lib/utils";

export type AppSettingsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  onLockApp?: () => void;
  triggerClassName?: string;
  contentClassName?: string;
  lockButtonLabel?: React.ReactNode;
};

export function AppSettingsModal({
  open,
  onOpenChange,
  children,
  onLockApp,
  triggerClassName,
  contentClassName,
  lockButtonLabel = "Lock Settings",
}: AppSettingsModalProps) {
  return (
    <PopoverPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center justify-center rounded-md text-sm font-medium h-10 w-10 text-foreground/50 hover:text-foreground active:scale-95 transition-transform",
            triggerClassName
          )}
          aria-label="App settings"
        >
          <Settings className="h-6 w-6" />
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          className={cn(
            "z-50 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 w-[90vw] sm:w-[320px]",
            contentClassName
          )}
          align="center"
          sideOffset={8}
          collisionPadding={16}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="grid gap-6">
            {children}
            {onLockApp && (
              <div>
                <button
                  type="button"
                  className="w-full inline-flex items-center justify-start gap-2 h-12 px-4 rounded-xl text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
                  onClick={() => {
                    onOpenChange(false);
                    onLockApp();
                  }}
                >
                  <div className="p-1.5 rounded-md bg-white/20">
                    <Lock className="h-4 w-4 text-white" />
                  </div>
                  {lockButtonLabel}
                </button>
              </div>
            )}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

export type LockSnackbarProps = {
  isLocked: boolean;
  onUnlock: () => void;
  className?: string;
  autoHideDuration?: number;
  label?: string;
  unlockLabel?: string;
};

export function LockSnackbar({
  isLocked,
  onUnlock,
  className,
  autoHideDuration = 4000,
  label = "Settings Locked",
  unlockLabel = "Unlock",
}: LockSnackbarProps) {
  const [showSnackbar, setShowSnackbar] = React.useState(false);

  React.useEffect(() => {
    if (isLocked) {
      setShowSnackbar(true);
      if (autoHideDuration > 0) {
        const timer = setTimeout(() => {
          setShowSnackbar(false);
        }, autoHideDuration);
        return () => clearTimeout(timer);
      }
    } else {
      setShowSnackbar(false);
    }
  }, [isLocked, autoHideDuration]);

  if (!isLocked || !showSnackbar) return null;

  return (
    <div
      className={cn(
        "fixed top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto",
        className
      )}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="animate-in fade-in slide-in-from-top-4 duration-300 bg-foreground/90 text-background px-5 py-2.5 rounded-full shadow-lg flex items-center gap-3.5 text-sm font-medium whitespace-nowrap w-max font-headline">
        <div className="flex items-center gap-1.5">
          <Lock className="w-4 h-4 text-background" />
          <span>{label}</span>
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center h-7 px-3 text-xs font-semibold rounded-full bg-background/20 hover:bg-background/30 text-background border-none transition-colors cursor-pointer"
          onClick={() => {
            setShowSnackbar(false);
            onUnlock();
          }}
        >
          {unlockLabel}
        </button>
      </div>
    </div>
  );
}
