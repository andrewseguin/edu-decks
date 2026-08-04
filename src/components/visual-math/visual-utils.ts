// Greatest Common Divisor helper
export function gcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcd(b, a % b);
}

// Least Common Multiple helper
export function lcm(a: number, b: number): number {
  return (a * b) / gcd(a, b);
}

// Helper to construct SVG path data for rectangles with individual corner radii
export function getRoundedRectPath(
  x: number,
  y: number,
  w: number,
  h: number,
  tl: number,
  tr: number,
  br: number,
  bl: number
): string {
  const maxR = Math.min(w / 2, h / 2);
  const rTL = Math.max(0, Math.min(tl, maxR));
  const rTR = Math.max(0, Math.min(tr, maxR));
  const rBR = Math.max(0, Math.min(br, maxR));
  const rBL = Math.max(0, Math.min(bl, maxR));

  const safeTL = rTL === 0 ? 0.001 : rTL;
  const safeTR = rTR === 0 ? 0.001 : rTR;
  const safeBR = rBR === 0 ? 0.001 : rBR;
  const safeBL = rBL === 0 ? 0.001 : rBL;

  return [
    `M ${x + safeTL} ${y}`,
    `L ${x + w - safeTR} ${y}`,
    `A ${safeTR} ${safeTR} 0 0 1 ${x + w} ${y + safeTR}`,
    `L ${x + w} ${y + h - safeBR}`,
    `A ${safeBR} ${safeBR} 0 0 1 ${x + w - safeBR} ${y + h}`,
    `L ${x + safeBL} ${y + h}`,
    `A ${safeBL} ${safeBL} 0 0 1 ${x} ${y + h - safeBL}`,
    `L ${x} ${y + safeTL}`,
    `A ${safeTL} ${safeTL} 0 0 1 ${x + safeTL} ${y}`,
    'Z',
  ].join(' ');
}
