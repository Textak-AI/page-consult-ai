import { test, expect } from 'bun:test';
import { readFileSync } from 'node:fs';

// 4DHB run (Nov 4): the album cover from 4dhb.net became the logo without anyone being asked.
const step = readFileSync('src/components/consultation/BrandCustomization.tsx', 'utf8');
const wizard = readFileSync('src/components/consultation/StrategicConsultation.tsx', 'utf8');

test('a found image is a question, and Continue waits for the answer', () => {
  expect(step).toContain('Is this your logo?');
  expect(step).toMatch(/useState<string \| null>\(null\);\s*$/m);
  expect(step).toContain("disabled={!!extractedLogo && logoAnswer === null}");
  expect(step).toContain("Yes, that's my logo");
  expect(step).toContain('No logo');
});

test('a fresh site read never skips the brand step', () => {
  expect(wizard).toContain('brandBrief?.colors?.primary?.hex && !hasFreshExtractedBrand');
  expect(wizard).not.toMatch(/hasBrandColors = Boolean\(\s*\(!savedBrandDismissed[^)]*\)\s*\|\|\s*extractedBrand/);
});
