import { test, expect } from 'bun:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { buildStrategyTrace, editedSections, sourcesFor } from '../src/lib/strategyTrace';
import { StrategyTracePanel, TRACE_UI } from '../src/components/strategy-brief/StrategyTracePanel';
import { computeCommunicationStrategy } from '../supabase/functions/_shared/communicationStrategy';

const answers = {
  idealClient: 'Homeowners in Akron, Cuyahoga Falls and Stow with furnaces 12 to 20 years old.',
  clientFrustration: 'Getting three different prices from three different visits, and a salesperson who pushes the most expensive system.',
  desiredOutcome: 'A warm house this winter and an honest answer on repair versus replace, with the price in writing before anyone starts.',
  uniqueStrength: 'The tech who quotes the job is the one who installs it.',
  processDescription: '1) Call or book online. 2) A tech inspects the furnace and gives a written price. 3) You decide; we schedule the work.',
  ctaText: 'Book a Furnace Visit',
  objections: [{ topic: 'area', question: 'Which areas do you serve?', answer: 'Akron, Cuyahoga Falls, Stow, Tallmadge and Hudson.' }, { topic: 'pricing', question: 'What does it cost?', answer: 'The inspection visit is a flat fee.' }],
};
const choices = { archetype: 'Emotional Connector', evidence: 'some', headlineFocus: 'problem-led', proofStyle: 'narrative', commitmentAsk: 'exploratory', voiceRegister: 'peer-relational', urgencySignal: 'absent', socialProofType: 'testimonial' };
const brief = { messagingChoices: choices, communicationStrategy: computeCommunicationStrategy({ ...answers, messagingChoices: choices }, {}) };
const sections = [
  { type: 'hero', content: { headline: 'Get a Written Repair Price and a Written Replacement Price — Then Decide', subheadline: 'A warm house this winter and an honest answer on repair versus replace, with the price in writing before anyone starts.', ctaText: 'Book a Furnace Visit', sectionBackground: 'light', composition: 'split-photo' } },
  { type: 'problem-solution', content: { problem: 'Getting three different prices from three different visits, and a salesperson who pushes the most expensive system.', solution: 'The tech who inspects the furnace writes the prices.', sectionBackground: 'tinted' } },
  { type: 'faq', content: { faqItems: [{ question: 'Do you serve my area?', answer: 'Akron, Cuyahoga Falls, Stow, Tallmadge and Hudson.' }] } },
];
const trace = buildStrategyTrace({ answers, brief, sections, brandColor: '#1f4e79', now: '2026-11-01T00:00:00Z' });

test('R3/R2: the trace records buyer, choices, opening and design with reasons', () => {
  expect(trace.buyer.label).toBe('Needs to feel understood first');
  expect(trace.buyer.choices).toHaveLength(6);
  expect(trace.opening).toMatchObject({ emphasis: 'problem-led' });
  expect(trace.opening.because).toMatch(/needs to feel understood first/);
  expect(trace.design).toMatchObject({ philosophy: 'organic', brandColor: '#1f4e79' });
  expect(trace.sections[0].design.surface).toBe('Light background');
});

test('R4: section copy points back to the answers it came from, and only those', () => {
  const hero = trace.sections[0];
  expect(hero.sources.map((s) => s.field)).toContain('desiredOutcome');
  expect(hero.decisions).toContain('The button uses your words exactly.');
  expect(trace.sections[1].sources.map((s) => s.field)).toContain('clientFrustration');
  expect(trace.sections[2].sources.map((s) => s.field)).toContain('objections.0');
  expect(sourcesFor(['Fast, friendly service you can count on.'], answers)).toEqual([]);
});

test('R6: an edited section is marked and no longer credited to the strategy', () => {
  const now = structuredClone(sections);
  now[1].content.solution = 'My own new line.';
  now[0].content.sectionBackground = 'dark'; // design change only: not a copy edit
  expect([...editedSections(trace, now)]).toEqual([1]);
});

test('R8: the view shows nothing that is not a fixed label or in the trace', () => {
  const html = renderToStaticMarkup(React.createElement(StrategyTracePanel, { trace, sections }));
  const texts = html.replace(/<[^>]+>/g, '\n').split('\n').map((t) => t.replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&amp;/g, '&').trim()).filter(Boolean);
  const allowed = new Set(Object.values(TRACE_UI));
  const json = JSON.stringify(trace);
  for (const t of texts) {
    const bare = t.replace(/:\s*$/, '');
    expect(allowed.has(t) || allowed.has(bare) || json.includes(JSON.stringify(bare).slice(1, -1))).toBe(true);
  }
  expect(renderToStaticMarkup(React.createElement(StrategyTracePanel, { trace: null }))).toContain(TRACE_UI.none);
});

test('the build saves the trace with the page, and it never counts as claim evidence', async () => {
  const { readFileSync } = await import('fs');
  expect(readFileSync('src/pages/Generate.tsx', 'utf8')).toMatch(/strategyTrace = buildStrategyTrace\(/);
  const { inputCopyText } = await import('../supabase/functions/_shared/copyClaims');
  expect(inputCopyText({ strategyTrace: { note: '500 clients' } })).not.toContain('500');
});
