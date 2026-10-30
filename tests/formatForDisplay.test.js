import { test, expect } from 'bun:test';
import { formatForHeadline, formatForSentence } from '../src/utils/formatForDisplay';

test('formatForHeadline preserves all-caps acronyms instead of title-casing them', () => {
  expect(formatForHeadline('FDA regulatory consulting')).toBe('FDA Regulatory Consulting');
  expect(formatForHeadline('ROI tracking for CTOs')).toBe('ROI Tracking for CTOs');
});

test('formatForHeadline preserves numeric tokens like 510(k)', () => {
  expect(formatForHeadline('510(k) clearance support')).toBe('510(k) Clearance Support');
});

test('formatForHeadline upcases known acronyms typed in lowercase', () => {
  expect(formatForHeadline('fda consulting for saas teams')).toBe('FDA Consulting for SaaS Teams');
});

test('formatForSentence lowercases words but never acronyms or numbers', () => {
  expect(formatForSentence('FDA Rejection & Regulatory Hire Turnover'))
    .toBe('FDA rejection & regulatory hire turnover');
  expect(formatForSentence('Two 510(k) Rejections')).toBe('two 510(k) rejections');
});

test('formatForSentence restores known proper nouns from lowercase input', () => {
  expect(formatForSentence('fda regulatory consulting')).toBe('FDA regulatory consulting');
  expect(formatForSentence('b2b saas marketing')).toBe('B2B SaaS marketing');
});

test('formatForSentence leaves ordinary lowercase phrases unchanged', () => {
  expect(formatForSentence('banned accounts and lost revenue')).toBe('banned accounts and lost revenue');
});
