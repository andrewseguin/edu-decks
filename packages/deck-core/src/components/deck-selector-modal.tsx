"use client";

import * as React from "react";
import { Sparkles, X } from "lucide-react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "../lib/utils";

export type DeckSelectorModalProps = {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerIcon?: React.ReactNode;
  triggerLabel?: string;
  triggerClassName?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  headerIcon?: React.ReactNode;
  children: React.ReactNode;
  onStartQuiz?: () => void;
  startQuizLabel?: string;
  footerContent?: React.ReactNode;
  contentClassName?: string;
};

export function DeckSelectorModal({
  open,
  onOpenChange,
  triggerIcon,
  triggerLabel = "Choose Options",
  triggerClassName,
  title,
  description,
  headerIcon,
  children,
  onStartQuiz,
  startQuizLabel = "Practice Quiz",
  footerContent,
  contentClassName,
}: DeckSelectorModalProps) {
  return (
    <PopoverPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center justify-center rounded-xl text-sm font-medium h-10 px-3.5 gap-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 active:scale-95 transition-all font-headline font-bold outline-none cursor-pointer border border-amber-500/20",
            triggerClassName
          )}
          aria-label={triggerLabel}
        >
          {triggerIcon}
          <span>{triggerLabel}</span>
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          className={cn(
            "z-50 rounded-2xl border bg-popover p-4 sm:p-5 text-popover-foreground shadow-2xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 w-[92vw] sm:w-[380px] max-h-[85vh] overflow-y-auto",
            contentClassName
          )}
          align="end"
          sideOffset={8}
          collisionPadding={16}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="grid gap-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border/50">
              <div className="flex items-center gap-2">
                {headerIcon}
                <div>
                  <h3 className="font-bold text-lg font-headline leading-tight">{title}</h3>
                  {description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                  )}
                </div>
              </div>
              <button
                type="button"
                className="h-8 w-8 rounded-full inline-flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors outline-none cursor-pointer"
                onClick={() => onOpenChange?.(false)}
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Custom Content Body */}
            {children}

            {/* Footer / Actions */}
            {(onStartQuiz || footerContent) && (
              <div className="pt-2 border-t border-border/50 flex flex-col gap-2.5">
                {onStartQuiz && (
                  <button
                    type="button"
                    className="w-full inline-flex items-center justify-center gap-2 h-11 px-4 rounded-xl text-sm font-bold bg-amber-500 text-white hover:bg-amber-600 active:scale-[0.98] transition-all font-headline shadow-md shadow-amber-500/20 cursor-pointer"
                    onClick={() => {
                      onOpenChange?.(false);
                      onStartQuiz();
                    }}
                  >
                    <Sparkles className="h-4 w-4" />
                    {startQuizLabel}
                  </button>
                )}
                {footerContent}
              </div>
            )}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
