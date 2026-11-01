import { test, expect } from 'bun:test';
import { readFileSync } from 'fs';
import { missingSections, unansweredBuyerPrompts, UNLOCK_PREFILLS, UNLOCK_HINTS } from '../src/lib/sectionUnlocks';
const src = (f) => readFileSync(new URL('../' + f, import.meta.url), 'utf8');

test('a sparse owner sees each section that will be skipped, with one question each', () => {
  const m = missingSections({ businessName: 'X' });
  expect(m.map((x) => x.section)).toEqual(['how-it-works', 'social-proof', 'faq']);
  for (const x of m) { expect(x.question.length).toBeGreaterThan(10); expect(UNLOCK_HINTS[x.section]).toBeTruthy(); expect(UNLOCK_PREFILLS[x.section]).toBeTruthy(); }
});

test('a complete owner sees nothing missing', () => {
  const d = {
    processDescription: 'You book a call, we connect one account, you review the first PR.',
    testimonialText: '"We had 600 drifted resources; six weeks later, four." - Platform lead',
    objections: [{ topic: 'pricing', question: 'q', answer: 'Per account.' }, { topic: 'timeline', question: 'q', answer: '10 minutes.' }],
  };
  expect(missingSections(d)).toEqual([]);
});

test('gates match the renderers: steps count as a process, short quotes do not count, skipped answers do not count', () => {
  expect(missingSections({ methodologySteps: ['Call', 'Audit'] }).map((x) => x.section)).not.toContain('how-it-works');
  expect(missingSections({ testimonialText: 'Great!' }).map((x) => x.section)).toContain('social-proof');
  expect(missingSections({ objections: [{ topic: 'pricing', question: 'q', answer: 'skip' }, { topic: 'timeline', question: 'q', answer: 'Two weeks.' }] }).map((x) => x.section)).toContain('faq');
  expect(unansweredBuyerPrompts({ objections: [{ topic: 'pricing', question: 'q', answer: 'Per seat.' }] }).map((p) => p.topic)).not.toContain('pricing');
});

test('wizard shows the review once before generating; editor lists waiting sections', () => {
  const w = src('src/components/consultation/StrategicConsultation.tsx');
  expect(w).toMatch(/!unlockReviewShown && missingSections\(data\)\.length > 0/);
  expect(w).toMatch(/<SectionUnlockReview/);
  expect(src('src/pages/Generate.tsx')).toMatch(/unlocks=\{sectionUnlocks\}/);
  expect(src('src/components/editor/SectionManager.tsx')).toMatch(/Waiting on your answers/);
});
