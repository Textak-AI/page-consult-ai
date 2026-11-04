import { test, expect } from 'bun:test';
import { statedDateLine } from '../src/lib/text/statedDate.ts';

// 4DHB run (Nov 4): "Out October 27, 2026" was on the site and in the brief but never on the page.
test('a stated release date is found verbatim with its lead-in', () => {
  expect(statedDateLine({ websiteIntelligence: { description: 'The new album from 4DHB. Out October 27, 2026.' } })).toBe('Out October 27, 2026');
  expect(statedDateLine({ offerIncludes: 'Doors open Saturday, 14 March 2027 at the Grog Shop.' })).toBe('Open Saturday, 14 March 2027');
  expect(statedDateLine({ uniqueStrength: 'Launching in November 2026 for early customers.' })).toBe('Launching in November 2026');
});

test('a bare date is still found; no date means nothing', () => {
  expect(statedDateLine({ mainOffer: 'Workshop, June 3, 2027' })).toBe('June 3, 2027');
  expect(statedDateLine({ offerIncludes: 'Fourteen tracks, fifty-four minutes.', achievements: 'Releasing since 2015' })).toBeNull();
  expect(statedDateLine(null)).toBeNull();
});
