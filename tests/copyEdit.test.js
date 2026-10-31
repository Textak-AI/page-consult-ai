import { test, expect } from 'bun:test';
import { copyEditProse, copyEditLabel, copyEditSections } from '../src/lib/text/copyEdit';

test('prose: keyboard slips fixed, sentences capitalized, words kept', () => {
  expect(copyEditProse("there dog comes home shaking. one lady told me her dog started hiding"))
    .toBe('Their dog comes home shaking. One lady told me her dog started hiding');
  expect(copyEditProse('im a certified groomer and i dont rush. it stresses them out alot'))
    .toBe("I'm a certified groomer and I don't rush. It stresses them out a lot");
  expect(copyEditProse('doodles more cuz of the coat lol')).toBe('Doodles more because of the coat');
  expect(copyEditProse('a clean happy dog without the drama.')).toBe('A clean happy dog without the drama.');
});

test('the adverb "there" is never rewritten', () => {
  expect(copyEditProse('we get there early and park out front')).toBe('We get there early and park out front');
  expect(copyEditProse('there is a quiet van')).toBe('There is a quiet van');
});

test('labels: title case only when typed all-lowercase', () => {
  expect(copyEditLabel('book a groom')).toBe('Book a Groom');
  expect(copyEditLabel('mikes mobile grooming')).toBe('Mikes Mobile Grooming');
  expect(copyEditLabel('Book a Measure Visit')).toBe('Book a Measure Visit');
  expect(copyEditLabel('iPhone Repair Lab')).toBe('iPhone Repair Lab');
});

test('already-clean generated copy passes through unchanged', () => {
  const clean = 'Mobile dog grooming that comes to you. No cages, no stress.';
  expect(copyEditProse(clean)).toBe(clean);
  const secs = copyEditSections([{ type: 'hero', content: { headline: 'Keep Me', subheadline: clean, ctaText: 'Book a Groom' } }]);
  expect(secs[0].content).toEqual({ headline: 'Keep Me', subheadline: clean, ctaText: 'Book a Groom' });
});
