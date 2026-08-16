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
  "length (l)": "#ffd45e", // gold
  "width (w)": "#5ee8ff", // cyan
  "radius (r)": "#5ee8ff", // cyan
  "radius²": "#5ee8ff",
  "radius³": "#5ee8ff",
  "diameter (d)": "#ffd45e", // gold
  "circumference (C)": "#d8b4fe", // neon lilac
  "vertices (V)": "#ffffff",
  "edges (E)": "#ffd45e",
  "faces (F)": "#5ee8ff",
  // Standalone word keywords:
  "length": "#ffd45e", // gold
  "width": "#5ee8ff",  // cyan
  "base": "#ffd45e",   // gold
  "height": "#5ee8ff", // cyan
  "radius": "#5ee8ff", // cyan
  "diameter": "#ffd45e", // gold
  "hypotenuse": "#d8b4fe", // neon lilac
  "circumference": "#d8b4fe", // neon lilac
  // Lowercase squared / cubed terms:
  "a²": "#5ee8ff", // cyan
  "b²": "#ffd45e", // gold
  "c²": "#d8b4fe", // neon lilac
  "r²": "#5ee8ff", // cyan
  "r³": "#5ee8ff", // cyan
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
  // Regex to match fractions, specific compound formulas, and math keywords
  const pattern = /(V − E \+ F = 2|V − E \+ F|A \+ B \+ C = 180°|A \+ B \+ C|A = ½\(a \+ b\)h|A = ½ · \(a \+ b\) · h|P = a \+ b \+ c|P = 2\(l \+ w\)|P = 2l \+ 2w|A = l · w|A = b · h|V = l · w · h|V = πr²h|V = ⅓πr²h|V = ⁴⁄₃πr³|SA = 4πr²|A = πr²|C = 2πr|½|⅓|⅔|¼|¾|⅕|⅖|⅗|⅘|⅙|⅚|⅛|⅜|⅝|⅞|⁴⁄₃|base angles|base \(b\)|height \(h\)|hypotenuse \(c\)|length \(l\)|width \(w\)|radius \(r\)|radius²|radius³|diameter \(d\)|circumference \(C\)|vertices \(V\)|edges \(E\)|faces \(F\)|\blength\b|\bwidth\b|\bbase\b|\bheight\b|\bradius\b|\bdiameter\b|\bhypotenuse\b|\bcircumference\b|a²|b²|c²|r²|r³|∠A|∠B|∠C|[Aa]ngle [ABC])/g;
  const parts = text.split(pattern);

  return (
    <span className={className}>
      {parts.map((part, idx) => {
        if (part === "V − E + F = 2" || part === "V − E + F") {
          return (
            <React.Fragment key={idx}>
              <span style={{ color: "#ffffff" }} className="font-bold">V</span>
              {" − "}
              <span style={{ color: "#ffd45e" }} className="font-bold">E</span>
              {" + "}
              <span style={{ color: "#5ee8ff" }} className="font-bold">F</span>
              {part.includes("= 2") ? " = 2" : ""}
            </React.Fragment>
          );
        }
        if (part === "A + B + C = 180°" || part === "A + B + C") {
          return (
            <React.Fragment key={idx}>
              <span style={{ color: "#5ee8ff" }} className="font-bold">A</span>
              {" + "}
              <span style={{ color: "#ffd45e" }} className="font-bold">B</span>
              {" + "}
              <span style={{ color: "#d8b4fe" }} className="font-bold">C</span>
              {part.includes("= 180°") ? " = 180°" : ""}
            </React.Fragment>
          );
        }
        if (part === "A = ½(a + b)h" || part === "A = ½ · (a + b) · h") {
          return (
            <React.Fragment key={idx}>
              <span>A = </span>
              <StackedFraction numerator="1" denominator="2" />
              <span>(</span>
              <span style={{ color: "#d8b4fe" }} className="font-bold">a</span>
              <span> + </span>
              <span style={{ color: "#ffd45e" }} className="font-bold">b</span>
              <span>)</span>
              <span style={{ color: "#5ee8ff" }} className="font-bold">h</span>
            </React.Fragment>
          );
        }
        if (part === "P = a + b + c") {
          return (
            <React.Fragment key={idx}>
              <span>P = </span>
              <span style={{ color: "#5ee8ff" }} className="font-bold">a</span>
              <span> + </span>
              <span style={{ color: "#ffd45e" }} className="font-bold">b</span>
              <span> + </span>
              <span style={{ color: "#d8b4fe" }} className="font-bold">c</span>
            </React.Fragment>
          );
        }
        if (part === "P = 2(l + w)") {
          return (
            <React.Fragment key={idx}>
              <span>P = 2(</span>
              <span style={{ color: "#ffd45e" }} className="font-bold">l</span>
              <span> + </span>
              <span style={{ color: "#5ee8ff" }} className="font-bold">w</span>
              <span>)</span>
            </React.Fragment>
          );
        }
        if (part === "P = 2l + 2w") {
          return (
            <React.Fragment key={idx}>
              <span>P = 2</span>
              <span style={{ color: "#ffd45e" }} className="font-bold">l</span>
              <span> + 2</span>
              <span style={{ color: "#5ee8ff" }} className="font-bold">w</span>
            </React.Fragment>
          );
        }
        if (part === "A = l · w") {
          return (
            <React.Fragment key={idx}>
              <span>A = </span>
              <span style={{ color: "#ffd45e" }} className="font-bold">l</span>
              <span> · </span>
              <span style={{ color: "#5ee8ff" }} className="font-bold">w</span>
            </React.Fragment>
          );
        }
        if (part === "A = b · h") {
          return (
            <React.Fragment key={idx}>
              <span>A = </span>
              <span style={{ color: "#ffd45e" }} className="font-bold">b</span>
              <span> · </span>
              <span style={{ color: "#5ee8ff" }} className="font-bold">h</span>
            </React.Fragment>
          );
        }
        if (part === "V = l · w · h") {
          return (
            <React.Fragment key={idx}>
              <span>V = </span>
              <span style={{ color: "#5ee8ff" }} className="font-bold">l</span>
              <span> · </span>
              <span style={{ color: "#5ee8ff" }} className="font-bold">w</span>
              <span> · </span>
              <span style={{ color: "#ffd45e" }} className="font-bold">h</span>
            </React.Fragment>
          );
        }
        if (part === "V = πr²h") {
          return (
            <React.Fragment key={idx}>
              <span>V = π</span>
              <span style={{ color: "#5ee8ff" }} className="font-bold">r²</span>
              <span style={{ color: "#ffd45e" }} className="font-bold">h</span>
            </React.Fragment>
          );
        }
        if (part === "V = ⅓πr²h") {
          return (
            <React.Fragment key={idx}>
              <span>V = </span>
              <StackedFraction numerator="1" denominator="3" />
              <span>π</span>
              <span style={{ color: "#5ee8ff" }} className="font-bold">r²</span>
              <span style={{ color: "#ffd45e" }} className="font-bold">h</span>
            </React.Fragment>
          );
        }
        if (part === "V = ⁴⁄₃πr³") {
          return (
            <React.Fragment key={idx}>
              <span>V = </span>
              <StackedFraction numerator="4" denominator="3" />
              <span>π</span>
              <span style={{ color: "#5ee8ff" }} className="font-bold">r³</span>
            </React.Fragment>
          );
        }
        if (part === "SA = 4πr²") {
          return (
            <React.Fragment key={idx}>
              <span>SA = 4π</span>
              <span style={{ color: "#5ee8ff" }} className="font-bold">r²</span>
            </React.Fragment>
          );
        }
        if (part === "A = πr²") {
          return (
            <React.Fragment key={idx}>
              <span>A = π</span>
              <span style={{ color: "#5ee8ff" }} className="font-bold">r²</span>
            </React.Fragment>
          );
        }
        if (part === "C = 2πr") {
          return (
            <React.Fragment key={idx}>
              <span>C = 2π</span>
              <span style={{ color: "#5ee8ff" }} className="font-bold">r</span>
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
