import { useMemo } from 'react';

/** PageConsult's own colour, used when the owner's brand isn't known yet. */
const DEFAULT_PRIMARY = '#00B6D5';
const DEFAULT_SECONDARY = '#7C5CFF';

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

function expand(hex: string): string {
  return hex.length === 4 ? '#' + hex.slice(1).split('').map(c => c + c).join('') : hex;
}

function toHsl(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const sat = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, sat, l];
}

/**
 * A brand colour the field can carry: real hue (not white, black or grey), pulled down to a
 * lightness that glows on a dark base instead of washing it grey. Returns null for colours
 * with no hue, so the caller falls back to PageConsult's own.
 */
function usable(hex?: string | null): string | null {
  if (!hex || !HEX.test(hex)) return null;
  const [h, sat, l] = toHsl(expand(hex));
  if (sat < 0.18 || l > 0.92 || l < 0.08) return null;
  const lightness = Math.min(l, 0.55) * 100;
  const saturation = Math.max(sat, 0.55) * 100;
  return `hsl(${h.toFixed(0)} ${saturation.toFixed(0)}% ${lightness.toFixed(0)}%)`;
}

/** Three brand-derived colour fields drifting over a deep base: CSS only, transform/opacity only, still under reduced motion. */
export function ambientPalette(primary?: string | null, secondary?: string | null) {
  const p = usable(primary) ?? DEFAULT_PRIMARY;
  const s = usable(secondary) ?? (usable(primary) ? DEFAULT_PRIMARY : DEFAULT_SECONDARY);
  return { p, s };
}

interface Props {
  primaryColor?: string | null;
  secondaryColor?: string | null;
}

export function AmbientGradientBackground({ primaryColor, secondaryColor }: Props) {
  const { p, s } = useMemo(() => ambientPalette(primaryColor, secondaryColor), [primaryColor, secondaryColor]);
  const vars = { '--pc-amb-a': p, '--pc-amb-b': s } as React.CSSProperties;

  return (
    <div className="pc-ambient absolute inset-0 overflow-hidden pointer-events-none" style={vars} aria-hidden="true">
      <div className="pc-ambient-field pc-ambient-a" />
      <div className="pc-ambient-field pc-ambient-b" />
      <div className="pc-ambient-field pc-ambient-c" />
      <div className="pc-ambient-grid" />
      <div className="pc-ambient-grain" />
      <div className="pc-ambient-vignette" />
    </div>
  );
}
