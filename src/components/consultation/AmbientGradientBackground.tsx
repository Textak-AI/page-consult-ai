import { useMemo } from 'react';

/** PageConsult's own colour, used when the owner's brand isn't known yet. */
const DEFAULT_PRIMARY = '#00B6D5';
const DEFAULT_SECONDARY = '#7C5CFF';

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

function usable(hex?: string | null): string | null {
  if (!hex || !HEX.test(hex)) return null;
  if (hex.length === 4) return '#' + hex.slice(1).split('').map(c => c + c).join('');
  return hex;
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
