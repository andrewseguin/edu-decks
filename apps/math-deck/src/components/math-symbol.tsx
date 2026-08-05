"use client";

import { cn } from "@/lib/utils";

type MathSymbolProps = {
  symbol: string;
  className?: string;
  isFraction?: boolean;
};

export function MathSymbol({ symbol, className, isFraction = false }: MathSymbolProps) {
  return (
    <span
      className={cn(
        "font-headline font-normal leading-none select-none inline-flex items-center justify-center shrink-0",
        isFraction && "-translate-y-[0.14em]",
        className
      )}
    >
      {symbol}
    </span>
  );
}
