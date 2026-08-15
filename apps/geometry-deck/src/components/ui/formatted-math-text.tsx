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
  "height (h)": "#5ee8ff", // cyan
  "hypotenuse (c)": "#d8b4fe", // neon lilac
  // Lowercase squared side lengths:
  "a²": "#5ee8ff", // cyan
  "b²": "#ffd45e", // gold
  "c²": "#d8b4fe", // neon lilac
  // Specific angle notations:
  "∠A": "#5ee8ff",
  "∠B": "#ffd45e",
  "∠C": "#d8b4fe",
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
  // Regex to match fractions and specific math keywords in descending order of specificity
  const pattern = /(A \+ B \+ C|½|⅓|⅔|¼|¾|⅕|⅖|⅗|⅘|⅙|⅚|⅛|⅜|⅝|⅞|⁴⁄₃|base angles|base \(b\)|height \(h\)|hypotenuse \(c\)|a²|b²|c²|∠A|∠B|∠C|[Aa]ngle [ABC])/g;
  const parts = text.split(pattern);

  return (
    <span className={className}>
      {parts.map((part, idx) => {
        if (part === "A + B + C") {
          return (
            <React.Fragment key={idx}>
              <span style={{ color: "#5ee8ff" }} className="font-bold">A</span>
              {" + "}
              <span style={{ color: "#ffd45e" }} className="font-bold">B</span>
              {" + "}
              <span style={{ color: "#d8b4fe" }} className="font-bold">C</span>
            </React.Fragment>
          );
        }
        if (/^[Aa]ngle A$/.test(part)) {
          const prefix = part.startsWith("A") ? "Angle " : "angle ";
          return (
            <React.Fragment key={idx}>
              {prefix}<span style={{ color: "#5ee8ff" }} className="font-bold">A</span>
            </React.Fragment>
          );
        }
        if (/^[Aa]ngle B$/.test(part)) {
          const prefix = part.startsWith("A") ? "Angle " : "angle ";
          return (
            <React.Fragment key={idx}>
              {prefix}<span style={{ color: "#ffd45e" }} className="font-bold">B</span>
            </React.Fragment>
          );
        }
        if (/^[Aa]ngle C$/.test(part)) {
          const prefix = part.startsWith("A") ? "Angle " : "angle ";
          return (
            <React.Fragment key={idx}>
              {prefix}<span style={{ color: "#d8b4fe" }} className="font-bold">C</span>
            </React.Fragment>
          );
        }
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
