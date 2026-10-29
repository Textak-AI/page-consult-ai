import { test, expect } from 'bun:test';
import { composeArc } from '../src/lib/composition/arc.ts';

const saltbox = {
  challenge: 'Stockouts on items the system says are in stock.',
  problemStatement: 'Every week...', solutionStatement: 'We reset your process.',
  uniqueValue: 'We cap every engagement at four clients.',
  processSteps: [{}, {}, {}],
  messagingPillars: [1, 2, 3, 4].map((i) => ({ title: `T${i}`, description: `D${i}` })),
  offer: 'Inventory Accuracy Reset',
};

test('stated challenge always gets a problem section', () => {
  const { structure } = composeArc(['hero', 'how-it-works', 'final-cta'], saltbox);
  expect(structure).toContain('problem-solution');
});

test('full arc order from sparse structure', () => {
  const { structure } = composeArc(['hero', 'how-it-works', 'social-proof', 'credentials-bar', 'final-cta'], saltbox);
  expect(structure).toEqual(['hero', 'problem-solution', 'differentiator-callout', 'how-it-works', 'features', 'social-proof', 'credentials-bar', 'final-cta']);
});

test('empty slots are skipped, never padded', () => {
  const { structure, log } = composeArc(['hero', 'final-cta'], {});
  expect(structure).toEqual(['hero', 'final-cta']);
  expect(log.filter((d) => d.action === 'skipped').map((d) => d.slot)).toEqual(['problem', 'guide', 'plan', 'outcome']);
});

test('outcome needs at least 3 real pillars', () => {
  const { structure } = composeArc(['hero'], { messagingPillars: [{ title: 'a', description: 'b' }] });
  expect(structure).not.toContain('features');
});
