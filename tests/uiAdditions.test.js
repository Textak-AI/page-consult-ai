import { test, expect } from 'bun:test';
import { pageWantsGrain } from '../src/lib/design/tokens';
import { readFileSync } from 'node:fs';

test('grain resolves the canonical industry key from sections, not the raw wizard label', () => {
  // Bramble & Crow regression: design_intelligence held 'E-commerce / Retail'
  const sections = [{ content: { industryVariant: 'ecommerce' } }];
  expect(pageWantsGrain(sections, 'E-commerce / Retail')).toBe(true);
});

test('analytical and default pages never get grain', () => {
  expect(pageWantsGrain([{ content: { industryVariant: 'saas' } }], null)).toBe(false);
  expect(pageWantsGrain([{ content: { industryVariant: 'consulting' } }], 'creative')).toBe(false);
  expect(pageWantsGrain([], 'default')).toBe(false);
  expect(pageWantsGrain(undefined, undefined)).toBe(false);
});

test('fallback variant is used only when no section carries one', () => {
  expect(pageWantsGrain([{ content: {} }], 'creative')).toBe(true);
});

test('GazeReveal defers (never disables) motion for pages that mount hidden', () => {
  // Background-tab regression: a hidden mount previously returned early and
  // disabled reveals for the whole visit. The hidden path must now wait for
  // visibilitychange and arm only below-the-fold sections.
  const src = readFileSync(new URL('../src/components/motion/GazeReveal.tsx', import.meta.url), 'utf8');
  expect(src).toContain("document.addEventListener('visibilitychange', onShown)");
  expect(src).toContain('teardown = armReveal(root, sectionType)');
  expect(src).not.toMatch(/if \(document\.visibilityState === 'hidden'\) return;/);
});
