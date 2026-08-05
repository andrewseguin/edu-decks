"use client";

import { Fraction } from "@/lib/types";
import { cn } from "@/lib/utils";

type FractionDisplayProps = {
  fraction: Fraction;
  className?: string;
  colorClass?: string;
  size?: "sm" | "md" | "lg" | "xl" | "pill";
};

export function FractionDisplay({
  fraction,
  className,
  colorClass = "text-white",
  size = "md",
}: FractionDisplayProps) {
  const sizeClasses = {
    sm: "text-lg sm:text-xl",
    pill: "text-2xl sm:text-xl [@media(max-height:640px)]:text-lg",
    md: "text-2xl sm:text-4xl",
    lg: "text-4xl sm:text-6xl md:text-7xl [@media(max-height:640px)]:text-4xl [@media(max-height:640px)]:sm:text-5xl",
    xl: "text-5xl sm:text-7xl md:text-8xl [@media(max-height:640px)]:text-5xl [@media(max-height:640px)]:sm:text-6xl",
  };

  if (fraction.d === 1) {
    return (
      <span
        className={cn(
          "font-headline font-bold leading-none inline-block select-none",
          colorClass,
          sizeClasses[size],
          className
        )}
      >
        {fraction.n}
      </span>
    );
  }

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
