/**
 * Micro-interaction tokens — the only source for button/stat/draw motion.
 * Everything here is transform/opacity-only (no layout, no CLS) and every
 * consumer must bail out under prefers-reduced-motion.
 */
export const MICRO = {
  /** Magnetic CTA: how far (px) the ask may lean toward the cursor, and the pull falloff. */
  magnet: { maxShift: 6, radius: 120, strength: 0.18 },
  /** Press physics for all page buttons. */
  press: { scale: 0.97, returnMs: 180 },
  /** Sourced-stat count-up. */
  countUp: { durationMs: 900 },
  /** Timeline / underline draw. */
  draw: { durationMs: 700, delayMs: 150 },
  /** Spring-ish ease shared by micro-interactions (matches MOTION.ease family). */
  ease: 'cubic-bezier(0.22, 1, 0.36, 1)',
} as const;

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

/** easeOutCubic for rAF-driven counts. */
export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/** Split a sourced stat into prefix, leading number, suffix — or null when no
 * animatable leading number exists ("Zero missed paydays" stays static). */
export function parseStatNumber(value: string): { prefix: string; num: number; raw: string; suffix: string } | null {
  const m = /^([^0-9]*?)([\d,]+(?:\.\d+)?)(.*)$/.exec(value ?? '');
  if (!m) return null;
  const num = parseFloat(m[2].replace(/,/g, ''));
  if (!isFinite(num) || num <= 0) return null;
  return { prefix: m[1], num, raw: m[2], suffix: m[3] };
}
