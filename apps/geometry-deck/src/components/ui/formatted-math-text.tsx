import React from "react";

const FRACTION_MAP: Record<string, [string, string]> = {
  "½": ["1", "2"],
  "⅓": ["1", "3"],
  "⅔": ["2", "3"],
  "¼": ["1", "4"],
  "¾": ["3", "4"],
  "⅕": ["1", "5"],
  "⅖": ["2", "5"],
  "⅗": ["3", "5"],
  "⅘": ["4", "5"],
  "⅙": ["1", "6"],
  "⅚": ["5", "6"],
  "⅛": ["1", "8"],
  "⅜": ["3", "8"],
  "⅝": ["5", "8"],
  "⅞": ["7", "8"],
  "⁴⁄₃": ["4", "3"],
};

const COLOR_KEYWORDS: Record<string, string> = {
  "base angles": "#5ee8ff", // cyan
  "base (b)": "#ffd45e", // gold
  "base": "#ffd45e",
  "height (h)": "#5ee8ff", // cyan
  "height": "#5ee8ff",
  "hypotenuse (c)": "#fb923c", // orange
  // Lowercase side lengths:
  "a²": "#5ee8ff", // cyan
  "b²": "#ffd45e", // gold
  "c²": "#fb923c", // orange
  "a": "#5ee8ff",
  "b": "#ffd45e",
  "c": "#fb923c",
  "h": "#5ee8ff",
  // Uppercase angles:
  "A": "#5ee8ff",
  "B": "#ffd45e",
  "C": "#fb923c",
};

export function StackedFraction({
  numerator,
  denominator,
  className = "",
}: {
  numerator: string;
  denominator: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex flex-col items-center justify-center align-middle mx-1 font-bold leading-none select-none text-[0.8em] -translate-y-[1.5px] ${className}`}
    >
      <span className="border-b-[1.5px] border-current px-0.5 pb-[1.5px] leading-none text-center">
        {numerator}
      </span>
      <span className="pt-[1.5px] leading-none text-center">{denominator}</span>
    </span>
  );
}

export function FormattedMathText({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  // Regex to match fractions and semantic keywords in descending order of specificity
  const pattern = /(½|⅓|⅔|¼|¾|⅕|⅖|⅗|⅘|⅙|⅚|⅛|⅜|⅝|⅞|⁴⁄₃|base angles|base \(b\)|height \(h\)|hypotenuse \(c\)|base|height|a²|b²|c²|\ba\b|\bb\b|\bc\b|\bh\b|\bA\b|\bB\b|\bC\b)/g;
  const parts = text.split(pattern);

  return (
    <span className={className}>
      {parts.map((part, idx) => {
        const frac = FRACTION_MAP[part];
        if (frac) {
          return (
            <StackedFraction
              key={idx}
              numerator={frac[0]}
              denominator={frac[1]}
            />
          );
        }
        const tokenColor = COLOR_KEYWORDS[part];
        if (tokenColor) {
          return (
            <span key={idx} style={{ color: tokenColor }} className="font-bold">
              {part}
            </span>
          );
        }
        return <React.Fragment key={idx}>{part}</React.Fragment>;
      })}
    </span>
  );
}
