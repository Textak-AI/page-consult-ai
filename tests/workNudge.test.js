import { test, expect } from 'bun:test';
import { shouldSuggestWorkGallery, workGalleryInsertAt, hasWorkGallery } from '../src/lib/editor/workNudge';

const page = ['hero', 'problem-solution', 'how-it-works', 'features', 'social-proof', 'faq', 'final-cta'].map((type) => ({ type, content: {} }));

test('visual trades get the nudge; analytical SaaS without site photos does not', () => {
  expect(shouldSuggestWorkGallery(page, 'Other Services Custom Kitchen Cabinetry', 0)).toBe(true);
  expect(shouldSuggestWorkGallery(page, 'mobile dog grooming', 0)).toBe(true);
  expect(shouldSuggestWorkGallery(page, 'B2B SaaS integration monitoring', 0)).toBe(false);
});

test('any business we already found site photos for gets the nudge', () => {
  expect(shouldSuggestWorkGallery(page, 'B2B SaaS integration monitoring', 2)).toBe(true);
});

test('never nudges once a gallery exists', () => {
  const withGallery = [...page.slice(0, 4), { type: 'work-samples', content: { samples: [] } }, ...page.slice(4)];
  expect(hasWorkGallery(withGallery)).toBe(true);
  expect(shouldSuggestWorkGallery(withGallery, 'cabinetry', 5)).toBe(false);
});

test('the gallery lands right after the payoff, else before proof, else before the close', () => {
  expect(workGalleryInsertAt(page)).toBe(4); // after features (outcome)
  const noPayoff = page.filter((s) => s.type !== 'features');
  expect(noPayoff[workGalleryInsertAt(noPayoff)].type).toBe('social-proof');
  const bare = [{ type: 'hero' }, { type: 'final-cta' }];
  expect(workGalleryInsertAt(bare)).toBe(1);
});
