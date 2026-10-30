import { test, expect } from 'bun:test';
import { computeCommunicationStrategy, auditCommunicationStrategy } from '../supabase/functions/_shared/communicationStrategy.ts';
import { applyCommunicationStrategy } from '../src/lib/composition/communicationStrategy.ts';

const input = { challenge: 'Hours lost to recounts. Past consultants audited once, left a report, and the drift came right back.', desiredOutcome: 'Inventory numbers the whole company can trust without recounting.', ctaText: 'Request a Site Visit', secondaryCTA: 'Read our process', processName: 'Inventory Reset' };
test('reframe is quoted input opposition, not invented competitor copy', () => {
  expect(computeCommunicationStrategy(input, {}).reframe).toBe('Past consultants audited once, left a report, and the drift came right back.');
});
test('opposition recombines stated alternative without joining words', () => {
  const source = { ...input, processDescription: 'A short fit call, then the partner works your receiving dock and count schedule in person, then your team runs the corrected routine with our coaching.' };
  expect(computeCommunicationStrategy(source, {}).reframe).toBe('Past consultants audited once, left a report. The partner works your receiving dock and count schedule in person.');
});
test('empty synthesis slots remain null without invented secondary ask or proof', () => {
  const s = computeCommunicationStrategy({}, {});
  expect([s.reframe, s.stakes, s.oneLiner, s.mechanismName, s.ctaLadder.primary, s.ctaLadder.secondary]).toEqual([null,null,null,null,null,null]);
  expect(s.proofPlan).toEqual([]);
});
test('mechanism suggestion is approval-only and never shipped in composer', () => {
  const s = computeCommunicationStrategy(input, {});
  expect(s.mechanismName).toEqual({ name: 'Inventory Reset', status: 'suggestion', approved: false });
  const page = applyCommunicationStrategy([{ type: 'hero', order: 0, content: {} }], s);
  expect(JSON.stringify(page)).not.toContain('Inventory Reset');
});
test('hero uses reframe plus oneLiner, primary and lighter ask remain verbatim', () => {
  const s = computeCommunicationStrategy(input, {});
  const page = applyCommunicationStrategy([{ type: 'hero', order: 0, content: { ctaText: 'See How It Works' } }, { type: 'final-cta', order: 1, content: {} }], s);
  expect(page[0].content.headline).toBe(s.reframe);
  expect(page[0].content.subheadline).toBe(input.desiredOutcome);
  expect(page.map(p => p.content.ctaText)).toEqual(['Request a Site Visit','Request a Site Visit']);
  expect(page[1].content.secondaryCta).toBe('Read our process');
});
test('outcome-led strategy changes arc while hero and CTA stay pinned', () => {
  const s = computeCommunicationStrategy({ ...input, awarenessLevel: 'solution-aware' }, {});
  const page = applyCommunicationStrategy(['hero','problem-solution','how-it-works','features','final-cta'].map((type, order) => ({ type, order, content: {} })), s);
  expect(page.map(p => p.type)).toEqual(['hero','features','problem-solution','how-it-works','final-cta']);
});
test('only supplied matching proof attaches next to its claim, not pooled', () => {
  const s = computeCommunicationStrategy({ desiredOutcome: 'Inventory accuracy.', testimonialText: 'The inventory accuracy improved.' }, {});
  expect(s.proofPlan[0].evidence).toBe('The inventory accuracy improved.');
  const page = applyCommunicationStrategy(['hero','features','how-it-works','social-proof','final-cta'].map((type, order) => ({ type, order, content: {} })), s);
  expect(page.map(p => p.type)).toEqual(['hero','how-it-works','features','social-proof','final-cta']);
});
test('provenance logs unsupported words even in a short synthesis field', () => {
  const s = computeCommunicationStrategy(input, {});
  s.oneLiner = 'Guaranteed profits.';
  expect(auditCommunicationStrategy(s,input)).toContainEqual({ path: 'oneLiner', reason: 'word not present in stated input' });
});
test('visual intensity derives from archetype, not invented business facts', () => {
  expect(computeCommunicationStrategy({ archetype: 'executive' }, {}).visualIntensity).toBe('restrained');
  expect(computeCommunicationStrategy({}, {}).visualIntensity).toBe('balanced');
});
test('hero never duplicates headline into subheadline and keeps brief headline when reframe is null', async () => {
  const { applyCommunicationStrategy } = await import('../src/lib/composition/communicationStrategy.ts');
  const strategy = { reframe: null, oneLiner: 'A photo library their whole team can pull from for a year', stakes: null, mechanismName: null, arcEmphasis: 'problem-led', proofPlan: [], ctaLadder: { primary: 'Book a Channel Audit', secondary: null }, register: 'plain', visualIntensity: 'balanced' };
  const sections = [{ type: 'hero', order: 0, content: { headline: 'One Shoot, One Year of Assets', subheadline: 'Guarded brief subheadline.' } }];
  const out = applyCommunicationStrategy(sections, strategy);
  const hero = out.find(s => s.type === 'hero');
  // Brief headline survives a null reframe
  expect(hero.content.headline).toBe('One Shoot, One Year of Assets');
  // The stated outcome becomes the subheadline, addressed to the reader
  expect(hero.content.subheadline).toBe('A photo library your whole team can pull from for a year');
});

test('a second-person one-liner does become the subheadline, but never equal to the headline', async () => {
  const { applyCommunicationStrategy } = await import('../src/lib/composition/communicationStrategy.ts');
  const base = { stakes: null, mechanismName: null, arcEmphasis: 'problem-led', proofPlan: [], ctaLadder: { primary: 'Go', secondary: null }, register: 'plain', visualIntensity: 'balanced' };
  const mk = () => [{ type: 'hero', order: 0, content: { headline: 'H', subheadline: 'S' } }];
  const out1 = applyCommunicationStrategy(mk(), { ...base, reframe: null, oneLiner: 'One shoot covers your whole year.' });
  expect(out1[0].content.subheadline).toBe('One shoot covers your whole year.');
  const out2 = applyCommunicationStrategy(mk(), { ...base, reframe: 'One shoot covers your whole year.', oneLiner: 'One shoot covers your whole year.' });
  expect(out2[0].content.headline).toBe('One shoot covers your whole year.');
  expect(out2[0].content.subheadline).not.toBe(out2[0].content.headline);
});

test('a subheadline that restates the headline is replaced by the stated outcome (Ridgeline)', async () => {
  const { applyCommunicationStrategy } = await import('../src/lib/composition/communicationStrategy.ts');
  const strategy = { reframe: null, oneLiner: 'A kitchen that fits their actual walls, built once, by people who will still answer the phone in five years.', stakes: null, mechanismName: null, arcEmphasis: 'problem-led', proofPlan: [], ctaLadder: { primary: 'Book a Measure Visit', secondary: null }, register: 'plain', visualIntensity: 'balanced' };
  const sections = [{ type: 'hero', order: 0, content: {
    headline: 'Custom Hardwood Cabinets Built and Installed by the Same Asheville Craftsmen Who Measured Your Kitchen',
    subheadline: 'Custom hardwood cabinets built in our Asheville shop and installed by the same craftsmen who measured your kitchen.' } }];
  const hero = applyCommunicationStrategy(sections, strategy)[0];
  expect(hero.content.subheadline).toBe('A kitchen that fits your actual walls, built once, by people who will still answer the phone in five years.');
});

test('toReader and wordOverlap', async () => {
  const { toReader, wordOverlap } = await import('../src/lib/composition/communicationStrategy.ts');
  expect(toReader('They want their team to own it themselves')).toBe('You want your team to own it yourselves');
  expect(wordOverlap('custom hardwood cabinets built', 'Custom Hardwood Cabinets Built Here')).toBe(1);
  expect(wordOverlap('completely different words', 'nothing shared at all')).toBe(0);
});
