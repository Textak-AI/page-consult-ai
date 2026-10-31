import { test, expect } from 'bun:test';
import { readFileSync } from 'fs';
import { generateArtDirectorBrief } from '../src/lib/artDirectorBrief';

test('no archetype asks for a generated abstract texture hero', () => {
  for (const a of ['Analytical Validator', 'Emotional Connector', 'Decisive Commander', 'Cautious Researcher']) {
    expect(generateArtDirectorBrief(a).hero.imageStyle).not.toBe('ambient-texture');
  }
});

test('auto-generation skips texture heroes and the centered hero hides stored generated textures', () => {
  const gen = readFileSync(new URL('../src/pages/Generate.tsx', import.meta.url), 'utf8');
  expect(gen).toMatch(/imageStyle === 'ambient-texture'\) return;/);
  const hero = readFileSync(new URL('../src/components/sections/hero/HeroCenteredType.tsx', import.meta.url), 'utf8');
  expect(hero).toMatch(/generatedTexture \? null/);
});
