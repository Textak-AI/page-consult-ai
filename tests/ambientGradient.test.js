import { test, expect } from 'bun:test';
import { readFileSync } from 'node:fs';

// The wizard background must never carry a grey or white brand colour as a wash,
// and must still move only under transform (reduced-motion safe).
const src = readFileSync('src/components/consultation/AmbientGradientBackground.tsx', 'utf8');
const css = readFileSync('src/index.css', 'utf8');

test('pale and grey brand colours fall back instead of washing the background', () => {
  expect(src).toMatch(/sat < 0\.18 \|\| l > 0\.92/);
  expect(src).toContain("DEFAULT_PRIMARY = '#00B6D5'");
});

test('ambient fields animate on transform only and stop under reduced motion', () => {
  const block = css.slice(css.indexOf('/* ── Wizard ambient background'));
  const keyframes = block.match(/@keyframes pc-amb-drift-[abc] \{[^}]*\}[^}]*\}/g) || [];
  expect(keyframes.length).toBe(3);
  for (const k of keyframes) expect(k).not.toMatch(/left:|top:|opacity:|filter:/);
  expect(block).toMatch(/prefers-reduced-motion: reduce\) \{\s*\.pc-ambient-field \{ animation: none; \}/);
});

test('the wizard no longer generates industry photos', () => {
  const wizard = readFileSync('src/components/consultation/StrategicConsultation.tsx', 'utf8');
  expect(wizard).not.toContain('generateHeroImages');
  expect(wizard).toContain('AmbientGradientBackground');
});
