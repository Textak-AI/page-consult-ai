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
test('markdown section indices survive but unsupported numeric prose does not', () => {
  expect(guardCopyClaims('## 12. Closing\nSave fifty hours.', {})).toBe('## 12. Closing');
});
test('decimal claims remain intact only if their full numeric value is supported', () => {
  expect(guardCopyClaims('Save 2.5 hours. Keep the routine.', { offer: '2.5 hours' })).toBe('Save 2.5 hours. Keep the routine.');
  expect(guardCopyClaims('Save 2.5 hours. Keep the routine.', {})).toBe('Keep the routine.');
});
test('unstated commitments are flagged; stated ones pass', async () => {
  const { unsupportedCommitment, guardCopyClaims } = await import('../supabase/functions/_shared/copyClaims.ts');
  const input = { uniqueValue: 'We show up every week.', challenge: 'No-shows.' };
  expect(unsupportedCommitment('Your Lawn Mowed Every Week—Guaranteed', input)).toBe('Guaranteed');
  expect(unsupportedCommitment('Risk-free trial for every homeowner', input)).toBe('Risk-free');
  expect(unsupportedCommitment('Weekly Lawn Care That Actually Shows Up', input)).toBe(null);
  const stated = { guarantee: 'If we miss a week, the next mow is free - that is our guarantee.' };
  expect(unsupportedCommitment('Every Week, Guaranteed', stated)).toBe(null);
  const out = guardCopyClaims({ headline: 'We Show Up. Your Lawn Mowed Every Week—Guaranteed.' }, input);
  expect(out.headline).toBe('We Show Up.');
});
