import { test, expect } from 'bun:test';
import { readFileSync } from 'fs';
import { pageScore, pageScoreFactors, scoreLabel } from '../src/lib/pageScore';
const src = (f) => readFileSync(new URL('../' + f, import.meta.url), 'utf8');

const sparsePage = [
  { type: 'hero', content: { headline: 'Messaging your sales team can use', ctaText: 'Request a UAT Test Audit' } },
  { type: 'problem-solution', content: { problem: 'x', solution: 'y' } },
  { type: 'features', content: { features: [{ title: 'a' }, { title: 'b' }] } },
  { type: 'social-proof', content: { testimonials: [] } },
  { type: 'final-cta', content: { ctaText: 'Request a UAT Test Audit' } },
];

test('a page with no proof scores 0 on proof, whatever else it has', () => {
  const { categories } = pageScore({ businessName: 'X', ctaText: 'Go' }, sparsePage, null);
  expect(categories.find((c) => c.id === 'proof').value).toBe(0);
});

test('bars come from facts, not the overall score', () => {
  const full = pageScore(
    { achievements: 'SOC 2 Type II', clientCount: '140 teams', concreteProofStory: '600 to 4 drifted resources', processDescription: 'Call, connect, review', brandColors: { primary: '#6366f1' } },
    [...sparsePage.filter((s) => s.type !== 'social-proof'),
      { type: 'social-proof', content: { testimonial: { quote: 'We had 600 drifted resources.', author: 'Platform lead' } } },
      { type: 'how-it-works', content: { steps: [{}, {}] } },
      { type: 'faq', content: { items: [{}, {}] } }],
    'https://logo.png',
  );
  expect(full.overall).toBe(100);
  expect(full.categories.every((c) => c.value === 100)).toBe(true);
});

test('no factor asks for a guarantee or urgency, and a CTA never counts as a guarantee', () => {
  const all = Object.values(pageScoreFactors({}, sparsePage)).flat().map((f) => f.label.toLowerCase());
  expect(all.some((l) => /guarantee|urgen|limited|scarc/.test(l))).toBe(false);
});

test('labels are plain', () => {
  expect([0, 30, 60, 80, 95].map(scoreLabel)).toEqual(['Getting started', 'Needs your answers', 'Good start', 'Strong', 'Ready to publish']);
});

test('the editor meter uses the real score; no multiplier bars or achievement toasts', () => {
  const m = src('src/components/consultation/DigitalChampionMeter.tsx');
  expect(m).toMatch(/pageScore\(consultationData, sections, logoUrl\)/);
  expect(m).not.toMatch(/Achievement:/);
  expect(m).not.toMatch(/unlocked!/);
  expect(src('src/pages/Generate.tsx')).toMatch(/sections=\{sections\}\s*\n\s*onScrollToSection=/);
});
