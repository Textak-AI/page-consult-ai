import { test, expect } from 'bun:test';
import { resolveIndustry } from '../src/lib/resolveIndustry';

test('exact stated match still wins over everything', () => {
  const r = resolveIndustry('consulting', 'healthcare', 'high');
  expect(r.industry).toBe('consulting');
  expect(r.source).toBe('exact');
});

test('medium-confidence scored classification beats a likely (sub-threshold) stated keyword match', () => {
  // "FDA regulatory consulting" keyword-scores healthcare only in the likely range,
  // while the scored classifier said consulting (medium) — scored must win.
  const r = resolveIndustry('FDA regulatory consulting', 'consulting', 'medium');
  expect(r.industry).toBe('consulting');
  expect(r.source).toBe('scored');
});

test('high-confidence scored classification beats stated keyword matching', () => {
  const r = resolveIndustry('we help hospitals with software', 'saas', 'high');
  expect(r.industry).toBe('saas');
  expect(r.source).toBe('scored');
  expect(r.confidence).toBe('high');
});

test('low-confidence scored input is ignored; stated resolution still works', () => {
  const r = resolveIndustry('FDA regulatory consulting', 'saas', 'low');
  expect(r.source).not.toBe('scored');
  expect(r.industry).not.toBe('default');
});

test('no stated industry falls back to scored classification', () => {
  const r = resolveIndustry(null, 'healthcare', 'medium');
  expect(r.industry).toBe('healthcare');
  expect(r.source).toBe('scored');
});

test('nothing usable returns default', () => {
  const r = resolveIndustry('', null, null);
  expect(r.industry).toBe('default');
});
