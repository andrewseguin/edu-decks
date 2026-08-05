import { Fraction } from "@/lib/types";
import { cn } from "@/lib/utils";

type FractionCircleProps = {
  fraction: Fraction;
  fillColor: string;
  strokeColor: string;
  size?: number;
};

// SVG Fraction Circle Component
export function FractionCircle({
  fraction,
  fillColor,
  strokeColor,
  size = 64,
}: FractionCircleProps) {
  const { n, d } = fraction;
  const radius = size / 2 - 4;
  const center = size / 2;

  const wholeCount = Math.floor(n / d);
  const remainderN = n % d;
  const totalCircles = Math.max(1, wholeCount + (remainderN > 0 ? 1 : 0));

  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: totalCircles }).map((_, circleIdx) => {
        let filledSlices = d;
        if (circleIdx === wholeCount) {
          filledSlices = remainderN;
        } else if (circleIdx > wholeCount) {
          filledSlices = 0;
        }

        const slices = Array.from({ length: d }).map((_, i) => {
          const startAngle = (i * 360) / d - 90;
          const endAngle = ((i + 1) * 360) / d - 90;

          const startRad = (startAngle * Math.PI) / 180;
          const endRad = (endAngle * Math.PI) / 180;

          const x1 = center + radius * Math.cos(startRad);
          const y1 = center + radius * Math.sin(startRad);
          const x2 = center + radius * Math.cos(endRad);
          const y2 = center + radius * Math.sin(endRad);

          const largeArcFlag = 360 / d > 180 ? 1 : 0;

          const pathData =
            d === 1
              ? `M ${center - radius}, ${center} a ${radius},${radius} 0 1,0 ${radius * 2},0 a ${radius},${radius} 0 1,0 -${radius * 2},0`
              : `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

          const isFilled = i < filledSlices;

          return (
            <path
              key={`slice-${i}`}
              d={pathData}
              className={cn(
                "transition-all duration-300",
                isFilled
                  ? `${fillColor} ${strokeColor} stroke-2`
                  : "fill-white/10 stroke-white/30 stroke-1 stroke-dashed"
              )}
            />
          );
        });

        return (
          <svg
            key={`circle-${circleIdx}`}
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="drop-shadow-xs"
          >
            {slices}
          </svg>
        );
      })}
    </div>
  );
}
