import { test, expect } from 'bun:test';
import { guardCopyClaims, numbersIn, stripUnsupportedOfferTerms } from '../supabase/functions/_shared/copyClaims.ts';
test('fifty-account fabrication is removed from benefits, with four retained', () => {
  const result = guardCopyClaims({ benefits: ['We cap work at four clients.', 'You are not one of fifty accounts.'] }, { uniqueValue: 'We cap work at four clients.' });
  expect(result.benefits).toEqual(['We cap work at four clients.']);
});
test('unsupported numbers are removed from challenge and closing, not just stats', () => {
  const result = guardCopyClaims({ challenge: 'Costs rose 34%.', closing: 'Save $500 today.', benefits: [{ description: 'Save 12 hours.' }] }, { challenge: 'Costs rose.' });
  expect(result).toEqual({ challenge: '', closing: '', benefits: [{ description: '' }] });
});
test('digit and word forms normalize, including compounds', () => {
  expect(numbersIn('four, fifty, twenty-five, one hundred, 1,000')).toEqual(['1000', '4', '50', '25', '100']);
  expect(guardCopyClaims('We work with 4 clients.', { uniqueValue: 'four clients' })).toBe('We work with 4 clients.');
});
test('generated brief, scores and current content cannot authorize numbers', () => {
  expect(guardCopyClaims('Save 34%.', { strategyBrief: 'Save 34%.', score: 34, currentContent: 'Save 34%.' })).toBe('');
});
test('unsupported commitment terms are removed but explicitly stated terms survive', () => {
  expect(stripUnsupportedOfferTerms('No credit card required / Free to start / Cancel anytime', {})).toBe('');
  expect(stripUnsupportedOfferTerms('Free consultation · No obligation', { offer: 'Free consultation' })).toBe('Free consultation');
});
test('structural process numbering and design fields are not claim copy', () => {
  expect(guardCopyClaims({ steps: [{ number: 1, title: 'Fit Call' }], primaryColor: '#123456', imagePrompt: '3D illustration' }, {})).toEqual({ steps: [{ number: 1, title: 'Fit Call' }], primaryColor: '#123456', imagePrompt: '3D illustration' });
});