import { test, expect } from 'bun:test';
import { applySurfaceRhythm, withSurfaceRhythm } from '../src/lib/artDirectorBrief';
import { buildHeroImagePrompt, promptKey } from '../src/lib/heroImagePrompt';

const page = (bgs) => bgs.map(([type, bg], order) => ({ type, order, visible: true, content: { sectionBackground: bg, mode: bg === 'dark' ? 'dark' : 'light', pageMode: 'light' } }));

test('adjacent light sections alternate, and the close on a light page goes deep', () => {
  const out = applySurfaceRhythm(page([['hero','light'],['problem-solution','light'],['how-it-works','light'],['features','tinted'],['social-proof','light'],['faq','light'],['final-cta','light']]));
  expect(out.map(s => s.content.sectionBackground)).toEqual(['light','tinted','light','tinted','light','tinted','dark']);
  // ink always follows the surface
  for (const s of out) expect(s.content.mode).toBe(s.content.sectionBackground === 'dark' ? 'dark' : 'light');
});

test('deliberate dark islands are untouched', () => {
  const out = applySurfaceRhythm(page([['hero','dark'],['problem-solution','light'],['features','dark'],['final-cta','dark']]));
  expect(out.map(s => s.content.sectionBackground)).toEqual(['dark','light','dark','dark']);
});

test('withSurfaceRhythm preserves array indices for editor handlers and is idempotent', () => {
  const secs = page([['hero','light'],['faq','light'],['final-cta','light']]);
  const shuffled = [secs[2], secs[0], secs[1]];
  const once = withSurfaceRhythm(shuffled);
  expect(once.map(s => s.type)).toEqual(['final-cta','hero','faq']);
  expect(once[0].content.sectionBackground).toBe('dark');
  expect(once[2].content.sectionBackground).toBe('tinted');
  const twice = withSurfaceRhythm(once);
  expect(twice.map(s => s.content.sectionBackground)).toEqual(once.map(s => s.content.sectionBackground));
});

test('hero photo prompt describes the business, not a generic cafe', () => {
  const p = buildHeroImagePrompt({ industry: 'Real Estate / PropTech', industrySubcategory: 'Residential', offer: 'Walkthrough Home Inspection', unique_value: 'We walk every buyer through the house with us during the inspection. Second sentence.' }, 'soft natural light');
  expect(p).toContain('Residential');
  expect(p).toContain('Walkthrough Home Inspection');
  expect(p).toContain('We walk every buyer through the house');
  expect(p).not.toContain('Second sentence');
  expect(p).not.toMatch(/community atmosphere|people connecting/);
});

test('distinct prompts get distinct cache keys', () => {
  expect(promptKey('a')).not.toBe(promptKey('b'));
  expect(promptKey('same')).toBe(promptKey('same'));
});

test('consecutive tinted sections alternate too (warm palettes plan tinted runs)', () => {
  const out = applySurfaceRhythm(page([['hero','light'],['problem-solution','tinted'],['how-it-works','tinted'],['features','tinted'],['final-cta','tinted']]));
  expect(out.map(s => s.content.sectionBackground)).toEqual(['light','tinted','light','tinted','dark']);
});
