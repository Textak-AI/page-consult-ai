import { test, expect } from 'bun:test';
import { applyCommunicationStrategy, isHeadlineLength } from '../src/lib/composition/communicationStrategy';
import { toPageQuestion, BUYER_OBJECTION_PROMPTS } from '../supabase/functions/_shared/buyerObjections';
import { readFileSync } from 'fs';

const strat = (reframe) => ({ reframe, oneLiner: '', stakes: '', proofPlan: [], ctaLadder: { primary: 'Book a Drift Walkthrough', secondary: null }, arcEmphasis: 'problem-led' });
const page = () => [{ type: 'hero', order: 0, content: { headline: 'Drift Caught the Moment It Happens.' } }, { type: 'final-cta', order: 1, content: {} }];

test('a positioning paragraph never becomes the h1; a headline-length reframe still does', () => {
  const long = 'We catch Terraform drift the moment someone changes infrastructure by hand in the AWS console, and open a pull request that puts the code back in sync — instead of a weekly plan diff nobody reads.';
  expect(isHeadlineLength(long)).toBe(false);
  expect(applyCommunicationStrategy(page(), strat(long))[0].content.headline).toBe('Drift Caught the Moment It Happens.');
  expect(applyCommunicationStrategy(page(), strat('Every console change becomes a pull request.'))[0].content.headline).toBe('Every console change becomes a pull request.');
});

test('with no brief headline, even a long reframe beats an empty h1', () => {
  const p = page(); p[0].content.headline = '';
  expect(applyCommunicationStrategy(p, strat('x '.repeat(40).trim()))[0].content.headline).not.toBe('');
});

test('FAQ questions speak in the buyer voice; owner-written questions pass through', () => {
  for (const p of BUYER_OBJECTION_PROMPTS) expect(toPageQuestion(p.question)).not.toMatch(/buyer|they already/i);
  expect(toPageQuestion('What do you need from the buyer’s team?')).toBe('What do you need from my team?');
  expect(toPageQuestion('Do you support OpenTofu?')).toBe('Do you support OpenTofu?');
});

test('live mapper calls pass the stated input to provenance guards', () => {
  const src = readFileSync(new URL('../src/pages/Generate.tsx', import.meta.url), 'utf8');
  const calls = src.split('mapBriefToSections(').slice(1).map((c) => c.slice(0, 2500).split('\n      });')[0]);
  expect(calls.length).toBeGreaterThanOrEqual(2);
  for (const c of calls) expect(c).toMatch(/consultationData:/);
});

test('social proof carries no canned reassurance subtitle', () => {
  const src = readFileSync(new URL('../src/components/sections/SocialProofSection.tsx', import.meta.url), 'utf8');
  expect(src).not.toMatch(/Real experiences from our|Recent Result/);
});
