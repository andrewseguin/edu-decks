"use client";

import { Fraction } from "@/lib/types";
import { cn } from "@/lib/utils";

type FractionDisplayProps = {
  fraction: Fraction;
  className?: string;
  colorClass?: string;
  size?: "sm" | "md" | "lg" | "xl";
};

export function FractionDisplay({
  fraction,
  className,
  colorClass = "text-white",
  size = "md",
}: FractionDisplayProps) {
  if (fraction.d === 1) {
    return <span className={cn(colorClass, className)}>{fraction.n}</span>;
  }

  const sizeClasses = {
    sm: "text-lg sm:text-xl",
    md: "text-2xl sm:text-4xl",
    lg: "text-3xl sm:text-5xl md:text-6xl",
    xl: "text-4xl sm:text-6xl md:text-7xl",
  };

  return (
    <div
      className={cn(
        "inline-flex flex-col items-center justify-center font-headline font-bold leading-none align-middle px-1 select-none",
        colorClass,
        sizeClasses[size],
        className
      )}
    >
      <span className="pb-0.5 border-b-2 sm:border-b-4 border-current leading-none text-center">
        {fraction.n}
      </span>
      <span className="pt-0.5 leading-none text-center">
        {fraction.d}
      </span>
    </div>
  );
}
