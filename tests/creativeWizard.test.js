import { test, expect } from 'bun:test';
import { getOfferKind, wizardLabels, frustrationQuestion, getWizardPlaceholders } from '../src/lib/wizard/industryWording.ts';
import { websiteFirstPrefill } from '../src/lib/websiteFirst.ts';

test('media and music are a creative offer with listener wording', () => {
  expect(getOfferKind('Media / Entertainment', 'Music / Audio')).toBe('creative');
  expect(getOfferKind('Media / Entertainment → Music / Audio')).toBe('creative');
  expect(getOfferKind('Agency / Creative')).toBe('services');
  expect(wizardLabels('creative').idealClient).toMatch(/listener, viewer or reader/);
  expect(wizardLabels('services').idealClient).toBe('Describe your ideal client in detail');
  expect(frustrationQuestion('creative')).toMatch(/listen to, watch or read/);
  expect(getWizardPlaceholders('Media / Entertainment → Music / Audio').mainOffer).toMatch(/album/);
});

test('a site description never prefills the differentiator', () => {
  const data = websiteFirstPrefill({ solutionStatement: 'The new album from 4DHB. Out October 27, 2026.' }, { tagline: 'Drift Off' });
  expect(data.uniqueStrength || '').toBe('');
});
