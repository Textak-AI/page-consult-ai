import { test, expect } from 'bun:test';
import { readFileSync } from 'fs';
import { seoFallback, cutAtWord, cutAtSentence, shortAudience } from '../src/lib/seoFallback';
const src = (f) => readFileSync(new URL('../' + f, import.meta.url), 'utf8');

const hyperbrand = {
  businessName: 'Hyperbrand.AI', mainOffer: 'UAT Test Signal Audit',
  idealClient: 'Marketing leads at mid-size B2B companies selling into regulated markets.',
  desiredOutcome: 'Messaging their sales team can use without rewriting it.',
  offerIncludes: 'A two-week review of your current messaging against how your buyers decide.',
};

test('title: offer for audience | business, within ~60', () => {
  const { title } = seoFallback(hyperbrand);
  expect(title).toBe('UAT Test Signal Audit for marketing leads | Hyperbrand.AI');
  expect(title.length).toBeLessThanOrEqual(60);
});

test('description: one-liner plus offer, whole sentences, within 160, only stated words', () => {
  const { description } = seoFallback(hyperbrand);
  expect(description).toBe('Messaging their sales team can use without rewriting it. A two-week review of your current messaging against how your buyers decide.');
  expect(description.length).toBeLessThanOrEqual(160);
});

test('long fields shrink gracefully and never cut mid-word', () => {
  const { title } = seoFallback({ businessName: 'Driftwatch Labs', mainOffer: 'Driftwatch Auto-Reconcile', idealClient: 'Platform and DevOps leads at Series B to Series D software companies' });
  expect(title.length).toBeLessThanOrEqual(60);
  expect(title).toContain('Driftwatch Auto-Reconcile');
  expect(cutAtWord('alpha beta gamma delta', 12)).toBe('alpha beta');
  expect(cutAtSentence('One two. Three four five six seven.', 12)).toBe('One two.');
  expect(shortAudience('CTOs who run platform teams')).toBe('CTOs');
});

test('nothing stated: falls back to page title and hero copy', () => {
  expect(seoFallback({}, { title: 'X Landing Page', description: 'Hero sub.' })).toEqual({ title: 'X Landing Page', description: 'Hero sub.' });
});

test('SEO panel and Publish dialog use the same default', () => {
  expect(src('src/components/editor/SeoPanel.tsx')).toMatch(/seoFallback\(pageData\?\.consultation_data/);
  expect(src('src/components/editor/PublishModal.tsx')).toMatch(/seoFallback\(pageData\?\.consultation_data/);
});
