import { test, expect } from 'bun:test';
import { splitQuote } from '../src/lib/text/quote';
import { isClientVoiceDescription } from '../src/lib/briefExtractor';
import { readFileSync } from 'node:fs';

test('splitQuote strips the user\'s own quote marks and splits a trailing attribution', () => {
  expect(splitQuote('"Creek Bank April got me through my first winter. I cried when it sold out." - repeat customer review'))
    .toEqual({ text: 'Creek Bank April got me through my first winter. I cried when it sold out.', attribution: 'repeat customer review' });
  expect(splitQuote('“Best decision we made.”')).toEqual({ text: 'Best decision we made.', attribution: null });
  expect(splitQuote('Plain quote without marks')).toEqual({ text: 'Plain quote without marks', attribution: null });
});

test('reported speech is a paraphrase; a user-quoted line is a real quote', () => {
  expect(isClientVoiceDescription('One platform engineering lead told us Relay was the first vendor he checked.')).toBe(true);
  expect(isClientVoiceDescription('Working with them was the best decision we made.')).toBe(false);
  expect(isClientVoiceDescription('"Tom walked us through everything and told us which findings mattered."')).toBe(false);
});

test('lead capture never keys on section position (every section is last-of-type in its wrapper)', () => {
  const src = readFileSync(new URL('../src/components/public/PublicPageRenderer.tsx', import.meta.url), 'utf8');
  expect(src).not.toContain('section:last-of-type');
  expect(src).toContain('ctaTexts.has(text)');
});

test('header config carries no unsourced claims', () => {
  const src = readFileSync(new URL('../src/config/designSystem/industryVariants.ts', import.meta.url), 'utf8');
  for (const claim of ['Loved by teams everywhere', 'Join thousands', 'nationwide', 'Trusted Locally']) {
    expect(src).not.toContain(claim);
  }
});
