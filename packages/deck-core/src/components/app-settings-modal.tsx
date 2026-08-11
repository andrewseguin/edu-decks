"use client";

import * as React from "react";
import { Settings, Lock, ExternalLink } from "lucide-react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "../lib/utils";

export type AppSettingsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  children: React.ReactNode;
  onLockApp?: () => void;
  triggerClassName?: string;
  contentClassName?: string;
  lockButtonLabel?: React.ReactNode;
  showEduDecksLink?: boolean;
  eduDecksUrl?: string;
  eduDecksLabel?: string;
};

export function AppSettingsModal({
  open,
  onOpenChange,
  title = "Settings",
  children,
  onLockApp,
  triggerClassName,
  contentClassName,
  lockButtonLabel = "Lock Settings",
  showEduDecksLink = true,
  eduDecksUrl = "https://edudecks.org",
  eduDecksLabel = "More decks at edudecks.org",
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
          <Settings className="h-5 w-5" />
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          className={cn(
            "z-50 border bg-popover text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
            "mobile-fullscreen [@media(max-width:640px)]:!z-50 [@media(max-width:640px)]:!w-screen [@media(max-width:640px)]:!h-[100dvh] [@media(max-width:640px)]:!max-w-none [@media(max-width:640px)]:!m-0 [@media(max-width:640px)]:!rounded-none [@media(max-width:640px)]:!border-none sm:w-[320px] sm:h-auto sm:max-h-[90vh] sm:rounded-2xl sm:border p-0 flex flex-col",
            contentClassName
          )}
          align="end"
          sideOffset={8}
          collisionPadding={{ top: 56, right: 16, bottom: 16, left: 16 }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {/* Mobile Fullscreen Header with Close Button */}
          <div className="flex items-center justify-end p-4 pt-[max(1rem,env(safe-area-inset-top))] border-b sm:hidden sticky top-0 bg-background z-10">
            <h4 className="font-medium font-headline text-lg mr-auto">
              {title}
            </h4>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent"
              onClick={() => onOpenChange(false)}
              aria-label="Close settings"
            >
              <span className="text-xl font-bold leading-none">✕</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
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
              {showEduDecksLink && (
                <div className="pt-2 border-t border-border/60 text-center">
                  <a
                    href={eduDecksUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-body select-none group"
                  >
                    <span>{eduDecksLabel}</span>
                    <ExternalLink className="h-3 w-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </a>
                </div>
              )}
            </div>
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
        "fixed top-[max(1.5rem,calc(env(safe-area-inset-top)+0.5rem))] left-1/2 -translate-x-1/2 z-50 pointer-events-auto",
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

export type SettingsSectionProps = {
  title: string;
  children: React.ReactNode;
  className?: string;
};

export function SettingsSection({
  title,
  children,
  className,
}: SettingsSectionProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <h4 className="font-medium leading-none font-headline text-lg">
        {title}
      </h4>
      {children}
    </div>
  );
}

export type SettingsToggleProps = {
  id?: string;
  label: React.ReactNode;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
};

export function SettingsToggle({
  id,
  label,
  checked,
  onCheckedChange,
  className,
  disabled = false,
}: SettingsToggleProps) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <label
        htmlFor={id}
        className={cn(
          "text-base font-body font-normal select-none leading-none",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        )}
      >
        {label}
      </label>
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onCheckedChange(!checked)}
        className={cn(
          "inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
          checked ? "bg-primary" : "bg-input"
        )}
      >
        <span
          className={cn(
            "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
    </div>
  );
}
